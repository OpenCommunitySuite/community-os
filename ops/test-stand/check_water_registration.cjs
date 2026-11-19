// Register both water point types through the real forms in a new synthetic community.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const readline = require('node:readline');

(async () => {
  const origin = 'https://127.0.0.1:5543';
  const community = process.env.STAND_COMMUNITY;
  assert.match(community, /^[0-9a-f-]{36}$/);
  const base = `/community/water/${community}`;
  const pointsPath = base + '/points';
  const communitiesPath = '/community/register/communities';
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
        throw new Error('Unexpected request outside isolated water registration probe');
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
      if (!response.ok) throw new Error('Water read failed');
      return response.json();
    }, path);
    const water = page.getByRole('region', { name: 'Облік технічної води', exact: true });
    const setup = water.locator('details').filter({
      has: page.locator(':scope > summary', { hasText: /^Зареєструвати точку води$/ }),
    });
    const plotPicker = setup.getByLabel(/^Ділянка для точки води/);
    const pointPicker = water.getByLabel(/^Точка обліку води/);
    const communities = reply(communitiesPath);
    await page.goto(origin + '/community/');
    const permission = (await (await communities).json()).find(item => item.id === community);
    assert.ok(permission.canReadWater && permission.canSetupWater && permission.canRecognizeWater);
    const eligibleReply = reply(base + '/plots');
    await page.locator('select').first().selectOption(community);
    const eligible = await (await eligibleReply).json();
    assert.deepEqual(eligible.map(plot => plot.number), ['Plot 0', 'Plot 1']);
    const [plot, spare] = eligible;
    assert.deepEqual(await get(pointsPath), []);
    await setup.locator(':scope > summary').click();

    async function fillMeter(meter, startsOn) {
      await setup.getByLabel('Позначення водоміра', { exact: true }).fill(meter);
      await setup.getByLabel('Початок використання водоміра', { exact: true }).fill(startsOn);
    }
    async function register(status, message) {
      const submitted = reply(pointsPath, 'POST');
      await setup.getByRole('button', { name: 'Зареєструвати', exact: true }).click();
      const response = await submitted;
      assert.equal(response.status(), status);
      await water.getByText(message, { exact: true }).waitFor();
      return response;
    }
    const success = 'Точку води зареєстровано.';
    const commonName = 'Synthetic water supply';
    const boundary = 'Synthetic water boundary';
    await setup.getByLabel('Назва точки води', { exact: true }).fill(commonName);
    await setup.getByLabel('Межа вимірювання води', { exact: true }).fill(boundary);
    await fillMeter('Common meter', '2026-01-01');
    const commonId = (await (await register(201, success)).json()).id;
    assert.match(commonId, /^[0-9a-f-]{36}$/);
    assert.deepEqual(await get(base + '/plots'), eligible);
    await plotPicker.selectOption(plot.id);
    assert.equal(await setup.getByLabel('Межа вимірювання води', { exact: true }).count(), 0);
    await fillMeter('Plot meter', '2026-01-02');
    const plotId = (await (await register(201, success)).json()).id;
    assert.match(plotId, /^[0-9a-f-]{36}$/);
    const points = await get(pointsPath);
    const common = points.find(item => item.id === commonId);
    const individual = points.find(item => item.id === plotId);
    assert.equal(points.length, 2);
    assert.deepEqual([common.plotId, common.designation, common.boundary, common.meterDesignation, common.startsOn],
      [null, commonName, boundary, 'Common meter', '2026-01-01']);
    assert.deepEqual([individual.plotId, individual.designation, individual.boundary, individual.meterDesignation, individual.startsOn],
      [plot.id, plot.number, null, 'Plot meter', '2026-01-02']);
    assert.notEqual(common.installationId, individual.installationId);
    assert.deepEqual(await get(base + '/plots'), [spare]);
    await plotPicker.selectOption(spare.id);
    await fillMeter('Common meter', '2026-01-03');
    const conflict = await register(409, 'Точка або позначення лічильника вже існує.');
    assert.equal((await conflict.json()).outcome, 'PointConflict');
    assert.deepEqual(await get(pointsPath), points);
    assert.deepEqual(await get(base + '/plots'), [spare]);

    const readingPath = point => `${base}/installations/${point.installationId}/readings`;
    async function select(point) {
      const loaded = reply(readingPath(point));
      await pointPicker.selectOption(point.installationId);
      assert.equal((await loaded).status(), 200);
      const suffix = point.boundary ? ' · ' + point.boundary : '';
      await water.getByText(`Водомір ${point.meterDesignation}, діє з ${point.startsOn}${suffix}.`, { exact: true }).waitFor();
    }
    async function recognize(point, date, value) {
      await water.getByLabel('Дата показання води', { exact: true }).fill(date);
      await water.getByLabel('Показання водоміра, м³', { exact: true }).fill(value);
      const submitted = reply(readingPath(point), 'POST');
      await water.getByRole('button', { name: 'Визнати показання води', exact: true }).click();
      const response = await submitted;
      assert.equal(response.status(), 200);
      assert.equal((await response.json()).outcome, 'Recognized');
      await water.getByText('Показання води визнано.', { exact: true }).waitFor();
    }
    for (const [point, value] of [[common, '10'], [individual, '5']]) {
      writes.add(readingPath(point));
      await select(point);
      assert.deepEqual((await get(readingPath(point))).readings, []);
      await recognize(point, '2026-01-02', value);
    }
    await fillMeter('Denied meter', '2026-01-03');
    const input = readline.createInterface({ input: process.stdin });
    const acknowledged = new Promise(resolve => input.once('line', resolve));
    console.log('REVOKE');
    assert.equal(await acknowledged, 'REVOKED');
    input.close();
    await register(403, 'Дозвіл на цю дію відсутній.');
    assert.deepEqual(await get(pointsPath), points);
    assert.deepEqual(await get(base + '/plots'), [spare]);

    const sample = [[common, '10', '12,500', '12.5', '2.5'], [individual, '5', '7', '7', '2']];
    async function assertSeries(point, first, last, volume) {
      const series = await get(readingPath(point));
      assert.equal(series.unit, 'm³');
      assert.deepEqual(series.readings.map(item => [item.date, item.valueExact]),
        [['2026-01-02', first], ['2026-01-03', last]]);
      assert.deepEqual(series.intervals, [{ from: '2026-01-02', to: '2026-01-03', valueExact: volume }]);
      const rows = water.getByRole('table', { name: 'Споживання води', exact: true }).locator('tbody tr');
      await rows.getByRole('cell', { name: volume.replace('.', ','), exact: true }).waitFor();
      assert.deepEqual(await rows.locator('td').allTextContents(), ['2026-01-02', '2026-01-03', volume.replace('.', ',')]);
    }
    for (const [point, first, submitted, last, volume] of sample) {
      await select(point);
      await recognize(point, '2026-01-03', submitted);
      await assertSeries(point, first, last, volume);
    }
    const refreshed = reply(communitiesPath);
    await page.reload();
    const after = (await (await refreshed).json()).find(item => item.id === community);
    assert.equal(after.canSetupWater, false);
    assert.ok(after.canReadWater && after.canRecognizeWater);
    await page.locator('select').first().selectOption(community);
    assert.equal(await setup.count(), 0);
    for (const [point, first, , last, volume] of [...sample].reverse()) {
      await select(point);
      await assertSeries(point, first, last, volume);
    }
    await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT, fullPage: true });
    assert.deepEqual(errors, []);
    console.log('PASS: both water point forms, meter conflict rollback, stale setup denial and independent reading series');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
