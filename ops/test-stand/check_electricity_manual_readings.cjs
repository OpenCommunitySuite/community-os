// The harness supplies an isolated synthetic community and revokes only its new grant.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const readline = require('node:readline');

(async () => {
  const origin = 'https://127.0.0.1:5543';
  const community = process.env.STAND_COMMUNITY;
  assert.match(community, /^[0-9a-f-]{36}$/);
  const browser = await chromium.launch({ channel: 'msedge' });
  try {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, serviceWorkers: 'block' });
    await context.addCookies([{ name: '__Host-communityos-platform', value: process.env.STAND_PROBE_COOKIE,
      url: origin, secure: true, httpOnly: true }]);
    let endpoint;
    await context.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin !== origin || (request.method() !== 'GET' &&
          !(endpoint && request.method() === 'POST' && url.pathname === endpoint)))
        throw new Error('Unexpected request outside isolated reading probe');
      await route.continue();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const communitiesReply = page.waitForResponse(response => response.url().endsWith('/community/register/communities'));
    await page.goto(origin + '/community/');
    const communities = await (await communitiesReply).json();
    assert.equal(communities.find(item => item.id === community)?.canRecognizeElectricity, true);
    const plotsReply = page.waitForResponse(response => response.url().endsWith(`/electricity/${community}/plots`));
    await page.locator('select').first().selectOption(community);
    const plot = (await (await plotsReply).json()).find(plot => plot.number === 'Plot 0');
    assert.equal(plot.installation.details.multiplierExact, '40');
    endpoint = `/community/electricity/${community}/installations/${plot.installation.id}/readings`;
    const selectPlot = async () => {
      const seriesReply = page.waitForResponse(response => response.request().method() === 'GET' && response.url().endsWith(endpoint));
      await page.locator('label').filter({ hasText: /^Точка або ділянка для обліку/ }).locator('select').selectOption(plot.id);
      assert.equal((await seriesReply).status(), 200);
    };
    await selectPlot();
    const form = page.getByRole('group', { name: 'Ручне спостереження', exact: true });
    const button = form.getByRole('button', { name: 'Визнати показання', exact: true });
    async function submit(date, value, status, outcome, message) {
      await form.getByLabel('Дата вимірювання', { exact: true }).fill(date);
      await form.locator('input[name="value"]').fill(value);
      const reply = page.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith(endpoint));
      await button.click();
      const response = await reply;
      assert.equal(response.status(), status);
      const result = await response.json();
      assert.equal(result.outcome, outcome);
      await page.getByText(message, { exact: true }).waitFor();
      return result;
    }
    async function read() {
      return page.evaluate(async endpoint => {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Reading series unavailable');
        return response.json();
      }, endpoint);
    }
    assert.deepEqual((await read()).readings, []);
    const first = await submit('2026-01-01', '100', 200, 'Recognized', 'Показання визнано.');
    const initial = await read();
    assert.equal(initial.intervals.length, 0);
    await submit('2026-01-03', '103', 200, 'Recognized', 'Показання визнано.');
    const two = await read();
    assert.equal(two.intervals.length, 1);
    assert.equal(two.intervals[0].valueExact, '120');
    assert.equal(two.intervals[0].rawDeltaExact, '3');
    const repeated = await submit('2026-01-01', '100', 200, 'AlreadyRecorded', 'Таке значення за цю дату вже записано.');
    assert.equal(repeated.readingId, first.readingId);
    assert.deepEqual(await read(), two, 'Replay must preserve original attribution and history');
    await submit('2026-01-01', '101', 409, 'DateConflict', 'За цю дату вже визнано інше значення.');
    assert.deepEqual(await read(), two);
    await submit('2026-01-02', '104', 409, 'Decreasing', 'Значення суперечить накопичувальним показанням за сусідні дати.');
    assert.deepEqual(await read(), two);
    await submit('2026-01-02', '101', 200, 'Recognized', 'Показання визнано.');
    const final = await read();
    assert.deepEqual(final.readings.map(reading => [reading.date, reading.valueExact]),
      [['2026-01-01', '100'], ['2026-01-02', '101'], ['2026-01-03', '103']]);
    assert.deepEqual(final.intervals.map(interval => [interval.valueExact, interval.rawDeltaExact]), [['40', '1'], ['80', '2']]);
    assert.deepEqual(final.readings.find(reading => reading.id === first.readingId), initial.readings[0]);
    for (let index = 0; index < 2; index++) {
      assert.equal(final.intervals[index].fromReadingId, final.readings[index].id);
      assert.equal(final.intervals[index].toReadingId, final.readings[index + 1].id);
    }
    const csrfStatus = await page.evaluate(async endpoint => (await fetch(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2026-01-04', value: '104', channel: 'total' }),
    })).status, endpoint);
    assert.equal(csrfStatus, 403);
    const input = readline.createInterface({ input: process.stdin });
    const acknowledged = new Promise(resolve => input.once('line', resolve));
    console.log('REVOKE');
    assert.equal(await acknowledged, 'REVOKED');
    input.close();
    await form.getByLabel('Дата вимірювання', { exact: true }).fill('2026-01-04');
    await form.locator('input[name="value"]').fill('104');
    const deniedReply = page.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith(endpoint));
    await button.click();
    assert.equal((await deniedReply).status(), 403);
    await page.getByText('Дозвіл на цю дію відсутній.', { exact: true }).waitFor();
    assert.deepEqual(await read(), final);
    await page.reload();
    await page.locator('select').first().selectOption(community);
    await selectPlot();
    assert.equal(await page.getByRole('button', { name: 'Визнати показання', exact: true }).count(), 0);
    const tables = page.getByRole('region', { name: 'Облік електроенергії', exact: true }).locator('table');
    const readingRows = tables.nth(0).locator('tbody tr');
    const intervalRows = tables.nth(1).locator('tbody tr');
    assert.equal(await readingRows.count(), 3);
    assert.equal(await intervalRows.count(), 2);
    for (let index = 0; index < 3; index++) {
      assert.equal(await readingRows.nth(index).locator('td').nth(0).textContent(), final.readings[index].date);
      assert.equal(await readingRows.nth(index).locator('td').nth(2).textContent(), final.readings[index].valueExact);
    }
    for (let index = 0; index < 2; index++) {
      const cells = intervalRows.nth(index).locator('td');
      assert.equal(await cells.nth(0).textContent(), final.intervals[index].from);
      assert.equal(await cells.nth(1).textContent(), final.intervals[index].to);
      assert.equal(await cells.nth(3).textContent(), final.intervals[index].rawDeltaExact);
      assert.equal(await cells.nth(4).textContent(), final.intervals[index].valueExact);
    }
    await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT, fullPage: true });
    assert.deepEqual(errors, []);
    console.log('PASS: manual readings, replay, conflicts, late splitting at 40, CSRF and revoked stale form');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
