// Publication is confined to the isolated synthetic community created by the harness.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const readline = require('node:readline');

(async () => {
  const origin = 'https://127.0.0.1:5543';
  const community = process.env.STAND_COMMUNITY;
  const checkStreetBalance = process.env.STAND_WATER_STREET_BALANCE === 'true';
  const secondDate = checkStreetBalance ? '2026-01-04' : '2026-01-02';
  const deniedDate = checkStreetBalance ? '2026-01-05' : '2026-01-03';
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
    const streetPicker = select('Батьківська точка для Street');
    const nestedPicker = select('Батьківська точка для ' + leaves[0].designation);
    if (!checkStreetBalance) await streetPicker.selectOption(root.id);
    await nestedPicker.selectOption(checkStreetBalance ? root.id : street.id);
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
    const placements = topology => Object.fromEntries(topology.points.map(point => [point.pointId, point.parentId]));
    const direct = { [root.id]: null, [leaves[0].id]: root.id, [leaves[1].id]: root.id };
    const nested = { ...direct, [street.id]: root.id, [leaves[0].id]: street.id };
    assert.deepEqual(placements(first), checkStreetBalance ? direct : nested);
    async function post(payload, csrf) {
      return page.evaluate(async ({ endpoint, payload, csrf }) => {
        const headers = { 'Content-Type': 'application/json' };
        if (csrf) headers['X-Platform-CSRF'] = (await (await fetch('/platform/csrf')).json()).token;
        const response = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(payload) });
        return { status: response.status, body: await response.json().catch(() => null) };
      }, { endpoint, payload, csrf });
    }
    if (!checkStreetBalance) {
      await publish('2026-01-01', 409, 'DateConflict');
      await tree.getByText('Виберіть дату, пізнішу за дату набрання чинності останньою опублікованою версією дерева.', { exact: true }).waitFor();
      const invalid = { ...firstPayload, startsOn: deniedDate, points: firstPayload.points.map(point =>
        point.pointId === root.id ? { pointId: leaves[0].id, parentId: null }
          : point.pointId === leaves[0].id ? { pointId: root.id, parentId: street.id } : point) };
      const rejected = await post(invalid, true);
      assert.equal(rejected.status, 409);
      assert.equal(rejected.body.outcome, 'InvalidTree');
      assert.deepEqual(await get(endpoint + '?date=' + deniedDate), first);
      assert.equal((await post({ ...firstPayload, startsOn: deniedDate }, false)).status, 403);
    }
    await tree.getByRole('button', { name: 'Скопіювати зв’язки в нову версію', exact: true }).click();
    assert.equal(await editor.getByLabel('Дата набрання чинності', { exact: true }).inputValue(), '');
    if (checkStreetBalance) {
      await streetPicker.selectOption(root.id);
      await nestedPicker.selectOption(street.id);
      const changes = tree.getByRole('region', { name: 'Зміни у новій версії', exact: true });
      await changes.getByText('Street · поза деревом → Root', { exact: true }).waitFor();
      await changes.getByText(leaves[0].designation + ' · Root → Street', { exact: true }).waitFor();
      assert.deepEqual(await get(endpoint + '?date=' + secondDate), first);
    } else {
      await streetPicker.selectOption('');
      await tree.getByText('Підключено безпосередньо до загальної точки. Ділянок перенесено: 1.', { exact: true }).waitFor();
    }
    await publish(secondDate, 200, 'Published');
    await tree.getByText('Діє з ' + secondDate, { exact: true }).waitFor();
    const second = await get(endpoint + '?date=' + secondDate);
    assert.deepEqual(placements(second), checkStreetBalance ? nested : direct);
    assert.deepEqual(await get(endpoint + '?date=2026-01-01'), first);
    await tree.getByRole('button', { name: 'Показати історію версій', exact: true }).click();
    const dates = tree.locator('label').filter({ hasText: /^Опубліковані версії/ }).locator('select');
    await dates.waitFor();
    assert.deepEqual(await dates.locator('option').allTextContents(), ['Оберіть дату версії', secondDate, '2026-01-01']);
    assert.deepEqual(await get(endpoint + '/dates'), [secondDate, '2026-01-01']);
    assert.deepEqual(await view('2026-01-01'), first);
    await tree.getByText('Діє з 2026-01-01', { exact: true }).waitFor();
    assert.deepEqual(await view(secondDate), second);
    const input = readline.createInterface({ input: process.stdin });
    const acknowledged = new Promise(resolve => input.once('line', resolve));
    console.log('REVOKE');
    assert.equal(await acknowledged, 'REVOKED');
    input.close();
    await publish(deniedDate, 403);
    await tree.getByText('Дозвіл на цю дію відсутній.', { exact: true }).waitFor();
    assert.deepEqual(await get(endpoint + '?date=' + deniedDate), second);
    assert.deepEqual(await get(endpoint + '/dates'), [secondDate, '2026-01-01']);
    await page.reload();
    const loaded = page.waitForResponse(response => response.url().endsWith(base + '/points'));
    await page.locator('select').first().selectOption(community);
    await loaded;
    await tree.locator(':scope > summary').click();
    assert.equal(await tree.getByRole('group', { name: 'Нова версія дерева води', exact: true }).count(), 0);
    assert.deepEqual(await view(secondDate), second);
    await tree.getByText('Діє з ' + secondDate, { exact: true }).waitFor();
    if (checkStreetBalance) {
      assert.deepEqual(await view('2026-01-02'), first);
      await tree.getByText('Діє з 2026-01-01', { exact: true }).waitFor();
      assert.deepEqual(await view('2026-01-05'), second);
      await tree.getByText('Діє з ' + secondDate, { exact: true }).waitFor();
      const balance = page.locator('details').filter({
        has: page.locator(':scope > summary', { hasText: /^Звірка обсягів води$/ }),
      });
      await balance.locator(':scope > summary').click();
      async function reconcile(from, until) {
        await balance.getByLabel('Початок звірки води', { exact: true }).fill(from);
        await balance.getByLabel('Кінець звірки води', { exact: true }).fill(until);
        const reply = page.waitForResponse(response => new URL(response.url()).pathname === base + '/balance');
        await balance.getByRole('button', { name: 'Розрахувати звірку води', exact: true }).click();
        const response = await reply;
        assert.equal(response.status(), 200);
        return response.json();
      }
      const oldBalance = await reconcile('2026-01-01', '2026-01-02');
      assert.equal(oldBalance.outcome, 'Ready');
      assert.deepEqual(oldBalance.branches, [{ id: root.id, childrenVolume: 7, difference: 3 }]);
      const crossed = await reconcile('2026-01-02', '2026-01-05');
      assert.equal(crossed.outcome, 'TopologyChanged');
      assert.equal(crossed.splitOn, secondDate);
      await balance.getByRole('button', { name: 'Від зміни дерева', exact: true }).click();
      assert.equal(await balance.getByLabel('Початок звірки води', { exact: true }).inputValue(), secondDate);
      const result = await reconcile(secondDate, '2026-01-05');
      assert.equal(result.outcome, 'Ready');
      assert.deepEqual(Object.fromEntries(result.points.map(point => [point.id, point.volume])),
        { [root.id]: 10, [street.id]: 6, [leaves[0].id]: 4, [leaves[1].id]: 3 });
      assert.deepEqual(result.branches, [
        { id: root.id, childrenVolume: 9, difference: 1 },
        { id: street.id, childrenVolume: 4, difference: 2 },
      ]);
      const table = balance.getByRole('table', { name: 'Обсяги за точками, м³', exact: true });
      for (const [name, cells] of [
        ['Root', ['—', '10', '9', '1', '—']],
        ['Street', ['Root', '6', '4', '2', '—']],
        [leaves[0].designation, ['Street', '4', '—', '—', '—']],
      ]) {
        const row = table.locator('tbody tr').filter({ has: page.getByRole('rowheader', { name, exact: true }) });
        await row.waitFor();
        assert.deepEqual(await row.locator('td').allTextContents(), cells);
      }
      const downloaded = page.waitForEvent('download');
      await balance.getByRole('button', { name: 'Завантажити звірку води CSV', exact: true }).click();
      const download = await downloaded;
      assert.equal(download.suggestedFilename(), 'water-balance-2026-01-04-2026-01-05.csv');
      const chunks = [];
      for await (const chunk of await download.createReadStream()) chunks.push(chunk);
      const rows = Buffer.concat(chunks).toString('utf8').split('\r\n')
        .map(line => line.split(';').map(cell => cell.replace(/^"|"$/g, '')));
      assert.deepEqual(rows.filter(cells => ['Root', 'Street'].includes(cells[2])), [
        [secondDate, '2026-01-05', 'Root', '', '10,000', '9,000', '1,000', '', ''],
        [secondDate, '2026-01-05', 'Street', 'Root', '6,000', '4,000', '2,000', '', ''],
      ]);
    }
    await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT, fullPage: true });
    assert.deepEqual(errors, []);
    console.log(checkStreetBalance
      ? 'PASS: published street branch, dated paths, split period, direct-child balance and CSV after publication revocation'
      : 'PASS: water topology publication, invalid root, dated history, reassignment, CSRF and revoked stale editor');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
