// Existing synthetic readings and trees; numeric/replacement fixtures affect only browser responses.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const origin = 'https://127.0.0.1:5543';
  const balancePath = '/community/water/' + process.env.STAND_COMMUNITY + '/balance';
  const browser = await chromium.launch({ channel: 'msedge' });
  try {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, serviceWorkers: 'block' });
    let writes = 0;
    let reads = 0;
    let fixture = '';
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (route.request().method() !== 'GET') { writes++; await route.abort('blockedbyclient'); return; }
      if (url.pathname === balancePath) {
        reads++;
        if (fixture) {
          const response = await route.fetch();
          assert.equal(response.status(), 200);
          const data = await response.json();
          assert.equal(data.outcome, 'Ready');
          assert.equal(data.points.length, 3, 'Use the existing root/street/plot synthetic tree');
          const root = data.points.find(point => point.parentId === null);
          for (const point of data.points) point.volume = point === root ? 6 : 7;
          if (fixture === 'replacement') {
            const leaf = data.points.find(point => !data.points.some(child => child.parentId === point.id));
            leaf.installationChanged = true;
            leaf.volume = null;
          }
          for (const branch of data.branches) {
            const children = data.points.filter(point => point.parentId === branch.id);
            branch.childrenVolume = children.some(point => point.volume === null) ? null : children.reduce((sum, point) => sum + point.volume, 0);
            const own = data.points.find(point => point.id === branch.id).volume;
            branch.difference = own === null || branch.childrenVolume === null ? null : own - branch.childrenVolume;
          }
          await route.fulfill({ response, json: data });
          return;
        }
      }
      await route.continue();
    });
    await context.addCookies([{ name: '__Host-communityos-platform', value: process.env.STAND_PROBE_COOKIE,
      url: origin, secure: true, httpOnly: true }]);
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const communityReply = page.waitForResponse(response => new URL(response.url()).pathname === '/community/register/communities');
    await page.goto(origin + '/community/');
    const community = (await (await communityReply).json()).find(item => item.id === process.env.STAND_COMMUNITY);
    assert.ok(community?.canReadWater);
    await page.locator('select').first().selectOption(process.env.STAND_COMMUNITY);
    const area = page.locator('summary').filter({ hasText: /^Звірка обсягів води$/ }).locator('..');
    await area.locator('summary').first().click();
    const help = area.getByText('Довідка: Звірка обсягів води', { exact: true }).locator('..');
    await help.locator('summary').click();
    const content = await help.locator('p, li').allTextContents();
    assert.ok(content.some(text => text.includes('безпосередніх дочірніх точок')));
    const opener = help.getByRole('button', { name: 'Посібник: звірка води', exact: true });
    const dialog = page.getByRole('dialog', { name: 'Звірка обсягів води', exact: true });
    await opener.click();
    await dialog.waitFor();
    assert.equal(await dialog.getAttribute('lang'), 'uk');
    assert.deepEqual(await dialog.locator('p, li').allTextContents(), content);
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(await opener.evaluate(element => element === document.activeElement), true);
    const from = area.getByLabel('Початок звірки води', { exact: true });
    const until = area.getByLabel('Кінець звірки води', { exact: true });
    const calculate = area.getByRole('button', { name: 'Розрахувати звірку води', exact: true });
    const table = area.getByRole('table', { name: 'Обсяги за точками, м³', exact: true });
    const branchPicker = area.getByLabel(/^Гілка для звірки/);
    const filter = area.getByLabel(/^Показати/);
    async function run(start, end) {
      await from.fill(start);
      await until.fill(end);
      const reply = page.waitForResponse(response => new URL(response.url()).pathname === balancePath);
      await calculate.click();
      const response = await reply;
      assert.equal(response.status(), 200);
      const data = await response.json();
      if (data.outcome === 'Ready') await table.waitFor();
      else if (data.outcome === 'NoTopology') await area.getByText('На початкову дату немає опублікованого дерева.', { exact: true }).waitFor();
      else await area.getByRole('button', { name: 'До зміни дерева', exact: true }).waitFor();
      return data;
    }
    const format = value => value === null || value === undefined ? '—' : new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 3 }).format(value);
    async function verifyRows(data, visible) {
      const rows = table.locator('tbody tr');
      assert.equal(await rows.count(), visible.length);
      for (let index = 0; index < visible.length; index++) {
        const point = visible[index];
        const branch = data.branches.find(item => item.id === point.id);
        const parent = data.points.find(item => item.id === point.parentId);
        const missing = [point.missingStart && 'Початкове', point.missingEnd && 'Кінцеве'].filter(Boolean).join(', ');
        assert.deepEqual(await rows.nth(index).locator('th, td').allTextContents(), [point.designation, parent?.designation ?? '—',
          point.installationChanged ? 'Заміна лічильника' : format(point.volume), format(branch?.childrenVolume), format(branch?.difference), missing || '—']);
      }
      const downloadEvent = page.waitForEvent('download');
      await area.getByRole('button', { name: 'Завантажити звірку води CSV', exact: true }).click();
      const download = await downloadEvent;
      assert.equal(download.suggestedFilename(), `water-balance-${await from.inputValue()}-${await until.inputValue()}.csv`);
      const stream = await download.createReadStream();
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const lines = Buffer.concat(chunks).toString('utf8').replace(/^\uFEFF/, '').trimEnd().split('\r\n');
      assert.equal(lines.length, visible.length + 1);
      assert.ok(lines[0].includes('Обсяг (м³);Прямі гілки (м³);Різниця (м³)'));
      const numeric = value => value === null || value === undefined ? '' : value.toFixed(3).replace('.', ',');
      for (let index = 0; index < visible.length; index++) {
        const point = visible[index];
        assert.ok(!point.designation.includes(';'), 'Synthetic names must not contain CSV separators');
        const cells = lines[index + 1].split(';').map(cell => cell.startsWith('"') ? cell.slice(1, -1).replaceAll('""', '"') : cell);
        const branch = data.branches.find(item => item.id === point.id);
        assert.equal(cells[0], await from.inputValue());
        assert.equal(cells[1], await until.inputValue());
        assert.equal(cells[2], point.designation);
        assert.equal(cells[3], data.points.find(item => item.id === point.parentId)?.designation ?? '');
        assert.deepEqual(cells.slice(4, 7), [numeric(point.volume), numeric(branch?.childrenVolume), numeric(branch?.difference)]);
        assert.equal(cells[8], point.installationChanged ? 'Так' : '');
      }
    }
    const ready = await run('2026-01-03', '2026-01-04');
    assert.equal(ready.outcome, 'Ready');
    assert.equal(ready.points.length, 3);
    assert.ok(ready.points.every(point => point.volume !== null));
    assert.deepEqual(ready.points.map(point => point.volume).sort((a, b) => a - b), [6, 7, 10]);
    assert.deepEqual(ready.branches.map(branch => branch.difference).sort((a, b) => a - b), [1, 3]);
    await verifyRows(ready, ready.points);
    const street = ready.points.find(point => point.parentId && ready.branches.some(branch => branch.id === point.id));
    assert.ok(street);
    await branchPicker.selectOption(street.id);
    const subtree = ready.points.filter(point => point.id === street.id || point.parentId === street.id);
    await verifyRows(ready, subtree);
    await filter.selectOption('imbalance');
    await verifyRows(ready, subtree.filter(point => ready.branches.some(branch => branch.id === point.id && branch.difference !== null && branch.difference !== 0)));
    await filter.selectOption('missing');
    await area.getByRole('status').getByText('За вибраними умовами точок немає.', { exact: true }).waitFor();
    await verifyRows(ready, []);
    await from.fill('2026-01-04');
    assert.equal(await table.count(), 0);
    assert.equal(await branchPicker.count(), 0);
    const missing = await run('2026-01-04', '2026-01-05');
    assert.equal(missing.outcome, 'Ready');
    assert.equal(await branchPicker.inputValue(), '');
    assert.equal(await filter.inputValue(), 'missing', 'Date changes preserve the row filter');
    assert.ok(missing.points.some(point => point.missingEnd && point.volume === null));
    await verifyRows(missing, missing.points.filter(point => point.missingStart || point.missingEnd));
    const unchangedReads = reads;
    await from.fill('2026-01-05');
    await until.fill('2026-01-04');
    await calculate.click();
    await area.getByRole('alert').getByText('Початкова дата має передувати кінцевій.', { exact: true }).waitFor();
    assert.equal(reads, unchangedReads);
    assert.equal((await run('2025-12-30', '2026-01-01')).outcome, 'NoTopology');
    const changed = await run('2026-01-02', '2026-01-04');
    assert.equal(changed.outcome, 'TopologyChanged');
    assert.equal(changed.splitOn, '2026-01-03');
    await area.getByRole('button', { name: 'До зміни дерева', exact: true }).click();
    assert.equal(await until.inputValue(), changed.splitOn);
    assert.equal(await from.inputValue(), '2026-01-02');
    assert.equal(await area.getByRole('button', { name: 'Від зміни дерева', exact: true }).count(), 0);
    assert.equal((await run('2026-01-02', changed.splitOn)).outcome, 'Ready');
    await run('2026-01-02', '2026-01-04');
    await area.getByRole('button', { name: 'Від зміни дерева', exact: true }).click();
    assert.equal(await from.inputValue(), changed.splitOn);
    assert.equal(await until.inputValue(), '2026-01-04');
    assert.equal(await area.getByRole('button', { name: 'До зміни дерева', exact: true }).count(), 0);

    fixture = 'numbers';
    const numbers = await run('2026-01-03', '2026-01-04');
    assert.ok(numbers.branches.some(branch => branch.difference === 0));
    assert.ok(numbers.branches.some(branch => branch.difference < 0));
    await filter.selectOption('all');
    await verifyRows(numbers, numbers.points);
    await filter.selectOption('imbalance');
    await verifyRows(numbers, numbers.points.filter(point => numbers.branches.some(branch => branch.id === point.id && branch.difference < 0)));
    fixture = 'replacement';
    const replacement = await run('2026-01-03', '2026-01-04');
    await filter.selectOption('all');
    await verifyRows(replacement, replacement.points);
    await table.getByText('Заміна лічильника', { exact: true }).waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    await opener.click();
    await dialog.waitFor();
    assert.ok(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth + 1));
    const bounds = await dialog.boundingBox();
    assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= 390);
    await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT });
    await dialog.getByRole('button', { name: 'Закрити посібник звірки води', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(await opener.evaluate(element => element === document.activeElement), true);
    await page.locator('select').first().selectOption('');
    assert.equal(await page.getByText('Довідка: Звірка обсягів води', { exact: true }).count(), 0);
    assert.equal(writes, 0);
    assert.deepEqual(errors, []);
    console.log('PASS: water balance help, real table/CSV/branch/filters/missing/no-topology/split/date validation; browser-only zero/negative/replacement fixtures; Escape/focus, 390px, community reset, no writes');
    await context.close();
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
