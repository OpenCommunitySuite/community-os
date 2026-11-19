// Register a common point and compare two independent reading series in an isolated community.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const readline = require('node:readline');

(async () => {
  const origin = 'https://127.0.0.1:5543';
  const community = process.env.STAND_COMMUNITY;
  assert.match(community, /^[0-9a-f-]{36}$/);
  const base = `/community/electricity/${community}`;
  const pointsPath = base + '/common-points';
  const browser = await chromium.launch({ channel: 'msedge' });
  try {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, serviceWorkers: 'block' });
    await context.addCookies([{ name: '__Host-communityos-platform', value: process.env.STAND_PROBE_COOKIE,
      url: origin, secure: true, httpOnly: true }]);
    const writes = new Set([pointsPath]);
    await context.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin !== origin || (request.method() !== 'GET' &&
          !(request.method() === 'POST' && writes.has(url.pathname))))
        throw new Error('Unexpected request outside isolated common electricity probe');
      await route.continue();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const reply = (path, method = 'GET') => page.waitForResponse(response =>
      new URL(response.url()).pathname === path && response.request().method() === method);
    const get = path => page.evaluate(async path => {
      const response = await fetch(path);
      if (!response.ok) throw new Error('Electricity read failed');
      return response.json();
    }, path);
    const electricity = page.getByRole('region', { name: 'Облік електроенергії', exact: true });
    const picker = electricity.getByLabel(/^Точка або ділянка для обліку/);
    const setup = electricity.getByRole('group', { name: 'Зареєструвати загальну точку', exact: true });
    const reading = electricity.getByRole('group', { name: 'Ручне спостереження', exact: true });
    const communitiesPath = '/community/register/communities';
    const communitiesReply = reply(communitiesPath);
    await page.goto(origin + '/community/');
    const selected = (await (await communitiesReply).json()).find(item => item.id === community);
    assert.ok(selected.canSetupCommonElectricity && selected.canRecognizeElectricity);
    assert.equal(selected.canSetupElectricity, false);
    const plotsReply = reply(base + '/plots');
    await page.locator('select').first().selectOption(community);
    const plots = await (await plotsReply).json();
    const plot = plots.find(item => item.number === 'Plot 0');
    assert.ok(plot?.installation);
    assert.deepEqual(await get(pointsPath), []);
    const readingPath = id => `${base}/installations/${id}/readings`;
    const individualPath = readingPath(plot.installation.id);
    assert.deepEqual((await get(individualPath)).readings, []);

    const designation = 'Synthetic supply input';
    const boundary = 'Synthetic measurement boundary';
    async function fillPoint(name, meter) {
      const fields = { pointDesignation: name, boundary, designation: meter, startsOn: '2026-01-01',
        model: 'Synthetic input model', serialNumber: 'INPUT-01', location: 'Synthetic intake cabinet',
        mountedOn: '2025-12-31', sealSerialNumber: 'INPUT-SEAL', multiplier: '40' };
      for (const [field, value] of Object.entries(fields)) await setup.locator(`input[name="${field}"]`).fill(value);
    }
    async function register(status, message) {
      const submitted = reply(pointsPath, 'POST');
      await setup.getByRole('button', { name: 'Зареєструвати загальну точку', exact: true }).click();
      const response = await submitted;
      assert.equal(response.status(), status);
      await electricity.getByText(message, { exact: true }).waitFor();
      return response;
    }
    const meter = 'Synthetic common meter';
    await fillPoint(designation, meter);
    const created = await register(201, 'Загальну точку та установку зареєстровано.');
    const { id: point } = await created.json();
    assert.match(point, /^[0-9a-f-]{36}$/);
    const commonHistory = `${pointsPath}/${point}/installations`;
    assert.equal(new URL(created.headers().location, origin).pathname, commonHistory);
    const commonPoints = [{ id: point, designation, boundary }];
    assert.deepEqual(await get(pointsPath), commonPoints);
    assert.deepEqual(await get(base + '/plots'), plots);
    const history = await get(commonHistory);
    assert.equal(history.length, 1);
    const [installation] = history;
    assert.equal(installation.pointId, point);
    assert.equal(installation.meterDesignation, meter);
    assert.equal(installation.startsOn, '2026-01-01');
    assert.equal(installation.details.multiplierExact, '40');
    const commonPath = readingPath(installation.id);
    assert.deepEqual((await get(commonPath)).readings, []);
    await fillPoint(designation, 'Synthetic conflicting meter');
    const conflict = await register(409, 'Позначення точки або лічильника вже використовується.');
    assert.equal((await conflict.json()).outcome, 'CommonPointConflict');
    assert.deepEqual(await get(pointsPath), commonPoints);
    assert.deepEqual(await get(commonHistory), history);

    writes.add(commonPath);
    writes.add(individualPath);
    async function recognize(path, date, value, outcome = 'Recognized') {
      await reading.getByLabel('Дата вимірювання', { exact: true }).fill(date);
      await reading.locator('input[name="value"]').fill(value);
      const submitted = reply(path, 'POST');
      await reading.getByRole('button', { name: 'Визнати показання', exact: true }).click();
      const response = await submitted;
      assert.equal(response.status(), 200);
      const result = await response.json();
      assert.equal(result.outcome, outcome);
      await electricity.getByText(outcome === 'Recognized' ? 'Показання визнано.' :
        'Таке значення за цю дату вже записано.', { exact: true }).waitFor();
      return result;
    }
    async function showSeries(target, path) {
      const loaded = reply(path);
      await picker.selectOption(target);
      assert.equal((await loaded).status(), 200);
    }
    async function assertSeries(path, values, multiplier, total) {
      const series = await get(path);
      const dates = ['2026-01-02', '2026-01-03'];
      assert.deepEqual(series.readings.map(item => [item.date, item.valueExact]),
        dates.map((date, index) => [date, values[index]]));
      assert.equal(series.intervals.length, 1);
      const [interval] = series.intervals;
      assert.deepEqual([interval.from, interval.to, interval.multiplier, interval.valueExact],
        [...dates, multiplier, total]);
      assert.deepEqual([interval.fromReadingId, interval.toReadingId], series.readings.map(item => item.id));
      const tables = electricity.locator('table');
      const intervalRow = tables.nth(1).locator('tbody tr');
      await intervalRow.getByRole('cell', { name: total, exact: true }).waitFor();
      assert.deepEqual(await intervalRow.locator('td').allTextContents(),
        [...dates, 'Загальний', interval.rawDeltaExact, total]);
      const readingRows = tables.nth(0).locator('tbody tr');
      assert.equal(await readingRows.count(), 2);
      for (let index = 0; index < values.length; index++) {
        assert.deepEqual((await readingRows.nth(index).locator('td').allTextContents()).slice(0, 4),
          [dates[index], 'Загальний', values[index], 'Ручне спостереження']);
      }
      return series;
    }
    const boundaryText = electricity.getByText('Межа вимірювання · ' + boundary, { exact: true });
    await boundaryText.waitFor();
    const first = await recognize(commonPath, '2026-01-02', '100');
    await recognize(commonPath, '2026-01-03', '103');
    const common = await assertSeries(commonPath, ['100', '103'], 40, '120');
    assert.deepEqual((await get(individualPath)).readings, []);

    await showSeries(plot.id, individualPath);
    assert.equal(await boundaryText.count(), 0);
    await recognize(individualPath, '2026-01-02', '2');
    await recognize(individualPath, '2026-01-03', '4');
    const individual = await assertSeries(individualPath, ['2', '4'], 40, '80');
    assert.deepEqual(await get(commonPath), common);
    await showSeries('common:' + point, commonPath);
    await boundaryText.waitFor();
    assert.deepEqual(await assertSeries(commonPath, ['100', '103'], 40, '120'), common);

    await fillPoint('Synthetic denied point', 'Synthetic denied meter');
    const input = readline.createInterface({ input: process.stdin });
    const acknowledged = new Promise(resolve => input.once('line', resolve));
    console.log('REVOKE');
    assert.equal(await acknowledged, 'REVOKED');
    input.close();
    await register(403, 'Дозвіл на цю дію відсутній.');
    assert.deepEqual(await get(pointsPath), commonPoints);
    const replay = await recognize(commonPath, '2026-01-02', '100', 'AlreadyRecorded');
    assert.equal(replay.readingId, first.readingId);
    assert.deepEqual(await get(commonPath), common);
    assert.deepEqual(await get(individualPath), individual);

    const refreshed = reply(communitiesPath);
    await page.reload();
    const permissions = (await (await refreshed).json()).find(item => item.id === community);
    assert.equal(permissions.canSetupCommonElectricity, false);
    assert.equal(permissions.canRecognizeElectricity, true);
    await page.locator('select').first().selectOption(community);
    await showSeries('common:' + point, commonPath);
    assert.equal(await setup.count(), 0);
    assert.deepEqual(await get(commonHistory), history);
    assert.deepEqual(await assertSeries(commonPath, ['100', '103'], 40, '120'), common);
    await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT, fullPage: true });
    assert.deepEqual(errors, []);
    console.log('PASS: common point form, separate intervals, duplicate registration and retained recognition after setup revocation');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
