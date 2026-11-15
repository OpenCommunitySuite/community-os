// Only the isolated synthetic water community supplied by the harness may be written.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const readline = require('node:readline');

(async () => {
  const origin = 'https://127.0.0.1:5543';
  const community = process.env.STAND_COMMUNITY;
  assert.match(community, /^[0-9a-f-]{36}$/);
  const base = `/community/water/${community}`;
  const browser = await chromium.launch({ channel: 'msedge' });
  try {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, serviceWorkers: 'block' });
    await context.addCookies([{ name: '__Host-communityos-platform', value: process.env.STAND_PROBE_COOKIE,
      url: origin, secure: true, httpOnly: true }]);
    const paths = new Set();
    await context.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin !== origin || (request.method() !== 'GET' &&
          !(request.method() === 'POST' && paths.has(url.pathname))))
        throw new Error('Unexpected request outside isolated water probe');
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
    assert.equal(selected.canRecognizeWater, true);
    const pointsReply = page.waitForResponse(response => response.url().endsWith(base + '/points'));
    await page.locator('select').first().selectOption(community);
    const points = await (await pointsReply).json();
    assert.equal(points.length, 2);
    points.sort((a, b) => a.meterDesignation.localeCompare(b.meterDesignation));
    const endpoint = point => `${base}/installations/${point.installationId}/readings`;
    for (const point of points) paths.add(endpoint(point));
    async function read(point) {
      return page.evaluate(async path => {
        const response = await fetch(path);
        if (!response.ok) throw new Error('Water series unavailable');
        return response.json();
      }, endpoint(point));
    }
    async function select(point) {
      const reply = page.waitForResponse(response => response.url().endsWith(endpoint(point)));
      await page.locator('label').filter({ hasText: /^Точка обліку води/ }).locator('select').selectOption(point.installationId);
      assert.equal((await reply).status(), 200);
    }
    const button = page.getByRole('button', { name: 'Визнати показання води', exact: true });
    async function submit(point, date, value, status, outcome, message) {
      await page.getByLabel('Дата показання води', { exact: true }).fill(date);
      await page.getByLabel('Показання водоміра, м³', { exact: true }).fill(value);
      const reply = page.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith(endpoint(point)));
      await button.click();
      const response = await reply;
      assert.equal(response.status(), status);
      const body = await response.json();
      assert.equal(body.outcome, outcome);
      await page.getByText(message, { exact: true }).waitFor();
      return body;
    }
    const [primary, other] = points;
    await select(primary);
    assert.deepEqual((await read(primary)).readings, []);
    const first = await submit(primary, '2026-01-01', '10', 200, 'Recognized', 'Показання води визнано.');
    assert.deepEqual((await read(primary)).intervals, []);
    await submit(primary, '2026-01-03', '12,500', 200, 'Recognized', 'Показання води визнано.');
    const two = await read(primary);
    assert.equal(two.unit, 'm³');
    assert.equal(two.intervals.length, 1);
    assert.equal(two.intervals[0].valueExact, '2.5');
    const repeated = await submit(primary, '2026-01-01', '10', 200, 'AlreadyRecorded', 'Таке показання вже записано.');
    assert.equal(repeated.readingId, first.readingId);
    assert.deepEqual(await read(primary), two);
    await submit(primary, '2026-01-01', '11', 409, 'DateConflict', 'За цю дату вже записано інше показання.');
    assert.deepEqual(await read(primary), two);
    await submit(primary, '2026-01-02', '13', 409, 'Decreasing', 'Значення суперечить сусіднім показанням.');
    assert.deepEqual(await read(primary), two);
    await submit(primary, '2026-01-02', '11', 200, 'Recognized', 'Показання води визнано.');
    const final = await read(primary);
    assert.deepEqual(final.readings.map(row => [row.date, row.valueExact]),
      [['2026-01-01', '10'], ['2026-01-02', '11'], ['2026-01-03', '12.5']]);
    assert.deepEqual(final.intervals.map(row => row.valueExact), ['1', '1.5']);
    for (const original of two.readings) assert.deepEqual(final.readings.find(row => row.id === original.id), original);
    await select(other);
    assert.deepEqual((await read(other)).readings, []);
    await submit(other, '2026-01-01', '5', 200, 'Recognized', 'Показання води визнано.');
    await submit(other, '2026-01-03', '7', 200, 'Recognized', 'Показання води визнано.');
    const independent = await read(other);
    assert.equal(independent.intervals[0].valueExact, '2');
    assert.deepEqual(await read(primary), final, 'Other point must not change the first series');
    await select(primary);
    await submit(primary, '2026-01-02', '11.0001', 400, 'InvalidValue', 'Вкажіть невід’ємне значення з точністю до 0,001 м³.');
    assert.deepEqual(await read(primary), final);
    const csrfStatus = await page.evaluate(async path => (await fetch(path, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2026-01-04', value: '13' }),
    })).status, endpoint(primary));
    assert.equal(csrfStatus, 403);
    const input = readline.createInterface({ input: process.stdin });
    const acknowledged = new Promise(resolve => input.once('line', resolve));
    console.log('REVOKE');
    assert.equal(await acknowledged, 'REVOKED');
    input.close();
    await page.getByLabel('Дата показання води', { exact: true }).fill('2026-01-04');
    await page.getByLabel('Показання водоміра, м³', { exact: true }).fill('13');
    const deniedReply = page.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith(endpoint(primary)));
    await button.click();
    assert.equal((await deniedReply).status(), 403);
    await page.getByText('Дозвіл на цю дію відсутній.', { exact: true }).waitFor();
    assert.deepEqual(await read(primary), final);
    assert.deepEqual(await read(other), independent);
    await page.reload();
    const loaded = page.waitForResponse(response => response.url().endsWith(base + '/points'));
    await page.locator('select').first().selectOption(community);
    await loaded;
    await select(primary);
    assert.equal(await button.count(), 0);
    const rows = page.getByRole('table', { name: 'Показання води', exact: true }).locator('tbody tr');
    assert.equal(await rows.count(), 3);
    for (let index = 0; index < 3; index++)
      assert.deepEqual(await rows.nth(index).locator('td').allTextContents(),
        [final.readings[index].date, final.readings[index].valueExact.replace('.', ',')]);
    const intervals = page.getByRole('table', { name: 'Споживання води', exact: true }).locator('tbody tr');
    assert.equal(await intervals.count(), 2);
    for (let index = 0; index < 2; index++)
      assert.deepEqual(await intervals.nth(index).locator('td').allTextContents(),
        [final.intervals[index].from, final.intervals[index].to, final.intervals[index].valueExact.replace('.', ',')]);
    await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT, fullPage: true });
    assert.deepEqual(errors, []);
    console.log('PASS: independent water readings, replay, conflicts, late values, precision, CSRF and revoked stale form');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
