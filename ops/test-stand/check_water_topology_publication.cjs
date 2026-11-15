// Publication is confined to the isolated synthetic community created by the harness.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const readline = require('node:readline');

(async () => {
  const origin = 'https://127.0.0.1:5543';
  const community = process.env.STAND_COMMUNITY;
  assert.match(community, /^[0-9a-f-]{36}$/);
  const base = `/community/water/${community}`;
  const endpoint = base + '/topology';
  const browser = await chromium.launch({ channel: 'msedge' });
  try {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, serviceWorkers: 'block' });
    await context.addCookies([{ name: '__Host-communityos-platform', value: process.env.STAND_PROBE_COOKIE,
      url: origin, secure: true, httpOnly: true }]);
    await context.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin !== origin || (request.method() !== 'GET' &&
          !(request.method() === 'POST' && url.pathname === endpoint)))
        throw new Error('Unexpected request outside isolated water topology probe');
      await route.continue();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const communitiesReply = page.waitForResponse(response => response.url().endsWith('/community/register/communities'));
    await page.goto(origin + '/community/');
    assert.equal((await (await communitiesReply).json()).find(item => item.id === community)?.canSetupWater, true);
    const pointsReply = page.waitForResponse(response => response.url().endsWith(base + '/points'));
    await page.locator('select').first().selectOption(community);
    const points = await (await pointsReply).json();
    assert.equal(points.length, 4);
    const root = points.find(point => point.designation === 'Root');
    const street = points.find(point => point.designation === 'Street');
    const leaves = points.filter(point => point.plotId).sort((a, b) => a.designation.localeCompare(b.designation));
    assert.ok(root && street && leaves.length === 2);
    const tree = page.locator('details').filter({ has: page.locator(':scope > summary', { hasText: /^Дерево обліку води$/ }) });
    await tree.locator(':scope > summary').click();
    async function get(path) {
      return page.evaluate(async path => {
        const response = await fetch(path);
        if (!response.ok) throw new Error('Water topology read failed');
        return response.json();
      }, path);
    }
    async function view(date) {
      await tree.getByLabel('Дата дерева води', { exact: true }).fill(date);
      const reply = page.waitForResponse(response => response.request().method() === 'GET' &&
        new URL(response.url()).pathname === endpoint && new URL(response.url()).searchParams.get('date') === date);
      await tree.getByRole('button', { name: 'Показати дерево', exact: true }).click();
      const response = await reply;
      assert.equal(response.status(), 200);
      return response.json();
    }
    assert.equal(await view('2025-12-31'), null);
    await tree.getByText('На цю дату дерево не опубліковано.', { exact: true }).waitFor();
    const editor = tree.getByRole('group', { name: 'Нова версія дерева води', exact: true });
    const select = label => editor.locator('label').filter({ hasText: new RegExp('^' + label + '\\s') }).locator('select');
    await select('Загальна точка').selectOption(root.id);
    await select('Батьківська точка для Street').selectOption(root.id);
    await select('Батьківська точка для ' + leaves[0].designation).selectOption(street.id);
    await select('Батьківська точка для ' + leaves[1].designation).selectOption(root.id);
    async function publish(date, status, outcome) {
      await editor.getByLabel('Дата набрання чинності', { exact: true }).fill(date);
      const reply = page.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith(endpoint));
      await editor.getByRole('button', { name: 'Опублікувати дерево', exact: true }).click();
      const response = await reply;
      assert.equal(response.status(), status);
      if (outcome) assert.equal((await response.json()).outcome, outcome);
      return response.request().postDataJSON();
    }
    const firstPayload = await publish('2026-01-01', 200, 'Published');
    await tree.getByText('Діє з 2026-01-01', { exact: true }).waitFor();
    const first = await get(endpoint + '?date=2026-01-01');
    const placements = topology => topology.points.map(point => [point.pointId, point.parentId]).sort((a, b) => a[0].localeCompare(b[0]));
    assert.deepEqual(placements(first), [[root.id, null], [street.id, root.id], [leaves[0].id, street.id],
      [leaves[1].id, root.id]].sort((a, b) => a[0].localeCompare(b[0])));
    await publish('2026-01-01', 409, 'DateConflict');
    await tree.getByText('Виберіть дату, пізнішу за дату набрання чинності останньою опублікованою версією дерева.', { exact: true }).waitFor();
    async function post(payload, csrf) {
      return page.evaluate(async ({ endpoint, payload, csrf }) => {
        const headers = { 'Content-Type': 'application/json' };
        if (csrf) headers['X-Platform-CSRF'] = (await (await fetch('/platform/csrf')).json()).token;
        const response = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(payload) });
        return { status: response.status, body: await response.json().catch(() => null) };
      }, { endpoint, payload, csrf });
    }
    const invalid = { ...firstPayload, startsOn: '2026-01-03', points: firstPayload.points.map(point =>
      point.pointId === root.id ? { pointId: leaves[0].id, parentId: null }
        : point.pointId === leaves[0].id ? { pointId: root.id, parentId: street.id } : point) };
    const rejected = await post(invalid, true);
    assert.equal(rejected.status, 409);
    assert.equal(rejected.body.outcome, 'InvalidTree');
    assert.deepEqual(await get(endpoint + '?date=2026-01-03'), first);
    assert.equal((await post({ ...firstPayload, startsOn: '2026-01-03' }, false)).status, 403);
    await tree.getByRole('button', { name: 'Скопіювати зв’язки в нову версію', exact: true }).click();
    assert.equal(await editor.getByLabel('Дата набрання чинності', { exact: true }).inputValue(), '');
    await select('Батьківська точка для Street').selectOption('');
    await tree.getByText('Підключено безпосередньо до загальної точки. Ділянок перенесено: 1.', { exact: true }).waitFor();
    await publish('2026-01-02', 200, 'Published');
    await tree.getByText('Діє з 2026-01-02', { exact: true }).waitFor();
    const second = await get(endpoint + '?date=2026-01-02');
    assert.deepEqual(placements(second), [[root.id, null], [leaves[0].id, root.id], [leaves[1].id, root.id]]
      .sort((a, b) => a[0].localeCompare(b[0])));
    assert.deepEqual(await get(endpoint + '?date=2026-01-01'), first);
    await tree.getByRole('button', { name: 'Показати історію версій', exact: true }).click();
    const dates = tree.locator('label').filter({ hasText: /^Опубліковані версії/ }).locator('select');
    await dates.waitFor();
    assert.deepEqual(await dates.locator('option').allTextContents(), ['Оберіть дату версії', '2026-01-02', '2026-01-01']);
    assert.deepEqual(await get(endpoint + '/dates'), ['2026-01-02', '2026-01-01']);
    assert.deepEqual(await view('2026-01-01'), first);
    await tree.getByText('Діє з 2026-01-01', { exact: true }).waitFor();
    assert.deepEqual(await view('2026-01-02'), second);
    const input = readline.createInterface({ input: process.stdin });
    const acknowledged = new Promise(resolve => input.once('line', resolve));
    console.log('REVOKE');
    assert.equal(await acknowledged, 'REVOKED');
    input.close();
    await publish('2026-01-03', 403);
    await tree.getByText('Дозвіл на цю дію відсутній.', { exact: true }).waitFor();
    assert.deepEqual(await get(endpoint + '?date=2026-01-03'), second);
    assert.deepEqual(await get(endpoint + '/dates'), ['2026-01-02', '2026-01-01']);
    await page.reload();
    const loaded = page.waitForResponse(response => response.url().endsWith(base + '/points'));
    await page.locator('select').first().selectOption(community);
    await loaded;
    await tree.locator(':scope > summary').click();
    assert.equal(await tree.getByRole('group', { name: 'Нова версія дерева води', exact: true }).count(), 0);
    assert.deepEqual(await view('2026-01-02'), second);
    await tree.getByText('Діє з 2026-01-02', { exact: true }).waitFor();
    await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT, fullPage: true });
    assert.deepEqual(errors, []);
    console.log('PASS: water topology publication, invalid root, dated history, reassignment, CSRF and revoked stale editor');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
