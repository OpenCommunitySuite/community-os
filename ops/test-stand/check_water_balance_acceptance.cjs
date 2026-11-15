// Read actual server calculations from an isolated synthetic fixture; no browser response overrides.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const readline = require('node:readline');

(async () => {
  const origin = 'https://127.0.0.1:5543';
  const community = process.env.STAND_COMMUNITY;
  assert.match(community, /^[0-9a-f-]{36}$/);
  const path = `/community/water/${community}/balance`;
  const browser = await chromium.launch({ channel: 'msedge' });
  try {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, serviceWorkers: 'block' });
    await context.addCookies([{ name: '__Host-communityos-platform', value: process.env.STAND_PROBE_COOKIE,
      url: origin, secure: true, httpOnly: true }]);
    let requests = 0;
    await context.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin !== origin || request.method() !== 'GET') throw new Error('Balance probe must only read');
      if (url.pathname === path) requests++;
      await route.continue();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const communitiesReply = page.waitForResponse(response => response.url().endsWith('/community/register/communities'));
    await page.goto(origin + '/community/');
    const selected = (await (await communitiesReply).json()).find(item => item.id === community);
    assert.equal(selected.canReadWater, true);
    assert.equal(selected.canRecognizeWater, false);
    const pointsReply = page.waitForResponse(response => response.url().endsWith(`/water/${community}/points`));
    await page.locator('select').first().selectOption(community);
    await pointsReply;
    const area = page.locator('details').filter({ has: page.locator(':scope > summary', { hasText: /^Звірка обсягів води$/ }) });
    await area.locator(':scope > summary').click();
    const from = area.getByLabel('Початок звірки води', { exact: true });
    const until = area.getByLabel('Кінець звірки води', { exact: true });
    const calculate = area.getByRole('button', { name: 'Розрахувати звірку води', exact: true });
    async function run(start, end) {
      await from.fill(start);
      await until.fill(end);
      const reply = page.waitForResponse(response => new URL(response.url()).pathname === path);
      await calculate.click();
      const response = await reply;
      assert.equal(response.status(), 200);
      return response.json();
    }
    const table = area.getByRole('table', { name: 'Обсяги за точками, м³', exact: true });
    const filter = area.getByLabel(/^Показати/);
    const branchPicker = area.getByLabel(/^Гілка для звірки/);
    const display = value => value == null ? '—' : new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 3 }).format(value);
    async function verify(data) {
      await table.waitFor();
      const rows = table.locator('tbody tr');
      const count = await rows.count();
      const visible = [];
      for (let index = 0; index < count; index++) {
        const row = rows.nth(index);
        const name = await row.locator('th').textContent();
        const point = data.points.find(point => point.designation === name);
        assert.ok(point);
        visible.push(point);
        const branch = data.branches.find(branch => branch.id === point.id);
        const missing = [point.missingStart && 'Початкове', point.missingEnd && 'Кінцеве'].filter(Boolean).join(', ');
        assert.deepEqual(await row.locator('td').allTextContents(), [
          data.points.find(parent => parent.id === point.parentId)?.designation ?? '—',
          point.installationChanged ? 'Заміна лічильника' : display(point.volume),
          display(branch?.childrenVolume), display(branch?.difference), missing || '—',
        ]);
      }
      const downloaded = page.waitForEvent('download');
      await area.getByRole('button', { name: 'Завантажити звірку води CSV', exact: true }).click();
      const download = await downloaded;
      assert.equal(download.suggestedFilename(), `water-balance-${await from.inputValue()}-${await until.inputValue()}.csv`);
      const chunks = [];
      for await (const chunk of await download.createReadStream()) chunks.push(chunk);
      const lines = Buffer.concat(chunks).toString('utf8').replace(/^\uFEFF/, '').trimEnd().split('\r\n');
      assert.equal(lines.length, visible.length + 1);
      const numeric = value => value == null ? '' : value.toFixed(3).replace('.', ',');
      for (let index = 0; index < visible.length; index++) {
        const point = visible[index];
        const branch = data.branches.find(branch => branch.id === point.id);
        const cells = lines[index + 1].split(';').map(cell => cell.startsWith('"') ? cell.slice(1, -1).replaceAll('""', '"') : cell);
        assert.deepEqual(cells, [await from.inputValue(), await until.inputValue(), point.designation,
          data.points.find(parent => parent.id === point.parentId)?.designation ?? '', numeric(point.volume),
          numeric(branch?.childrenVolume), numeric(branch?.difference),
          [point.missingStart && 'Початкове', point.missingEnd && 'Кінцеве'].filter(Boolean).join(', '),
          point.installationChanged ? 'Так' : '']);
      }
      return visible;
    }
    const positive = await run('2026-01-01', '2026-01-02');
    assert.equal(positive.outcome, 'Ready');
    const root = positive.points.find(point => point.designation === 'Root');
    const street = positive.points.find(point => point.designation === 'Street');
    assert.equal(root.volume, 10);
    assert.deepEqual(positive.branches.find(branch => branch.id === root.id), { id: root.id, childrenVolume: 9, difference: 1 });
    assert.deepEqual(positive.branches.find(branch => branch.id === street.id), { id: street.id, childrenVolume: 4, difference: 2 });
    assert.equal((await verify(positive)).length, 4);
    await branchPicker.selectOption(street.id);
    assert.deepEqual((await verify(positive)).map(point => point.designation).sort(), ['Street', 'Water 0']);
    await filter.selectOption('imbalance');
    assert.deepEqual((await verify(positive)).map(point => point.designation), ['Street']);
    const incomplete = await run('2026-01-01', '2026-01-03');
    assert.equal(incomplete.outcome, 'Ready');
    const missing = incomplete.points.find(point => point.designation === 'Water 1');
    assert.equal(missing.volume, null);
    assert.equal(missing.missingEnd, true);
    assert.equal(incomplete.branches.find(branch => branch.id === root.id).difference, null);
    await filter.selectOption('missing');
    assert.deepEqual((await verify(incomplete)).map(point => point.designation), ['Water 1']);
    const zero = await run('2026-01-04', '2026-01-05');
    assert.equal(zero.outcome, 'Ready');
    assert.deepEqual(zero.branches, [{ id: root.id, childrenVolume: 0, difference: 0 }]);
    await filter.selectOption('all');
    assert.equal((await verify(zero)).length, 3);
    await filter.selectOption('imbalance');
    assert.equal((await verify(zero)).length, 0);
    const negative = await run('2026-01-05', '2026-01-06');
    assert.deepEqual(negative.branches, [{ id: root.id, childrenVolume: 3, difference: -2 }]);
    assert.deepEqual((await verify(negative)).map(point => point.designation), ['Root']);
    const replaced = await run('2026-01-06', '2026-01-07');
    const changed = replaced.points.find(point => point.designation === 'Water 0');
    assert.equal(changed.installationChanged, true);
    assert.equal(changed.volume, null);
    assert.equal(replaced.branches[0].difference, null);
    await filter.selectOption('all');
    assert.equal((await verify(replaced)).length, 3);
    assert.equal((await run('2025-12-30', '2025-12-31')).outcome, 'NoTopology');
    await area.getByText('На початкову дату немає опублікованого дерева.', { exact: true }).waitFor();
    const split = await run('2026-01-02', '2026-01-05');
    assert.equal(split.outcome, 'TopologyChanged');
    assert.equal(split.splitOn, '2026-01-04');
    await area.getByRole('button', { name: 'До зміни дерева', exact: true }).click();
    assert.equal(await from.inputValue(), '2026-01-02');
    assert.equal(await until.inputValue(), '2026-01-04');
    await run('2026-01-02', '2026-01-05');
    await area.getByRole('button', { name: 'Від зміни дерева', exact: true }).click();
    assert.equal(await from.inputValue(), '2026-01-04');
    assert.equal(await until.inputValue(), '2026-01-05');
    const requestsBefore = requests;
    await from.fill('2026-01-05');
    await until.fill('2026-01-04');
    await calculate.click();
    await area.getByText('Початкова дата має передувати кінцевій.', { exact: true }).waitFor();
    assert.equal(requests, requestsBefore);
    await run('2026-01-05', '2026-01-06');
    await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT, fullPage: true });
    const input = readline.createInterface({ input: process.stdin });
    const acknowledged = new Promise(resolve => input.once('line', resolve));
    console.log('REVOKE');
    assert.equal(await acknowledged, 'REVOKED');
    input.close();
    const denied = page.waitForResponse(response => new URL(response.url()).pathname === path);
    await calculate.click();
    assert.equal((await denied).status(), 403);
    await area.getByText('Не вдалося отримати звірку. Перевірте дати й доступ.', { exact: true }).waitFor();
    const refreshed = page.waitForResponse(response => response.url().endsWith('/community/register/communities'));
    await page.reload();
    assert.equal((await (await refreshed).json()).find(item => item.id === community).canReadWater, false);
    await page.locator('select').first().selectOption(community);
    assert.equal(await page.getByRole('region', { name: 'Облік технічної води', exact: true }).count(), 0);
    assert.deepEqual(errors, []);
    console.log('PASS: real water balance arithmetic, missing bounds, replacement, CSV, filters, split and revoked read');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
