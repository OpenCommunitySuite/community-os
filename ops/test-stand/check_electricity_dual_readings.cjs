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
    assert.equal(plot.installation.registerMode, 'dual');
    endpoint = `/community/electricity/${community}/installations/${plot.installation.id}/readings`;
    const selectPlot = async () => {
      const seriesReply = page.waitForResponse(response => response.request().method() === 'GET' && response.url().endsWith(endpoint));
      await page.locator('label').filter({ hasText: /^Точка або ділянка для обліку/ }).locator('select').selectOption(plot.id);
      assert.equal((await seriesReply).status(), 200);
    };
    await selectPlot();
    const form = page.getByRole('group', { name: 'Ручне спостереження', exact: true });
    const button = form.getByRole('button', { name: 'Визнати показання', exact: true });
    async function submit(date, value, channel, status, outcome, message) {
      await form.getByLabel('Дата вимірювання', { exact: true }).fill(date);
      await form.locator('input[name="value"]').fill(value);
      await form.locator('select[name="channel"]').selectOption(channel);
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
    const accepted = (date, value, channel) => submit(date, value, channel, 200, 'Recognized', 'Показання визнано.');
    const first = await accepted('2026-01-01', '100', 'day');
    const initial = await read();
    assert.equal(initial.intervals.length, 0);
    await accepted('2026-01-01', '20', 'night');
    await accepted('2026-01-03', '106', 'day');
    assert.deepEqual((await read()).combinedIntervals, []);
    await page.getByText('Зіставних інтервалів немає.', { exact: true }).waitFor();
    await accepted('2026-01-03', '23', 'night');
    const two = await read();
    assert.equal(two.combinedIntervals.length, 1);
    assert.deepEqual([two.combinedIntervals[0].day.valueExact, two.combinedIntervals[0].night.valueExact,
      two.combinedIntervals[0].valueExact], ['240', '120', '360']);
    const tables = page.getByRole('region', { name: 'Облік електроенергії', exact: true }).locator('table');
    assert.deepEqual(await tables.nth(2).locator('tbody tr td').allTextContents(),
      ['2026-01-01', '2026-01-03', '240', '120', '360']);
    const repeated = await submit('2026-01-01', '100', 'day', 200, 'AlreadyRecorded', 'Таке значення за цю дату вже записано.');
    assert.equal(repeated.readingId, first.readingId);
    assert.deepEqual(await read(), two, 'Replay must preserve original attribution and history');
    await submit('2026-01-01', '101', 'day', 409, 'DateConflict', 'За цю дату вже визнано інше значення.');
    assert.deepEqual(await read(), two);
    await submit('2026-01-02', '107', 'day', 409, 'Decreasing', 'Значення суперечить накопичувальним показанням за сусідні дати.');
    assert.deepEqual(await read(), two);
    const unsupported = await page.evaluate(async endpoint => {
      const { token } = await (await fetch('/platform/csrf')).json();
      const response = await fetch(endpoint, { method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Platform-CSRF': token },
        body: JSON.stringify({ date: '2026-01-02', value: '120', channel: 'total' }) });
      return { status: response.status, body: await response.json() };
    }, endpoint);
    assert.equal(unsupported.status, 400);
    assert.equal(unsupported.body.outcome, 'UnsupportedChannel');
    assert.deepEqual(await read(), two);
    await accepted('2026-01-02', '103', 'day');
    const mismatched = await read();
    assert.deepEqual(mismatched.combinedIntervals, []);
    await page.getByText('Зіставних інтервалів немає.', { exact: true }).waitFor();
    assert.equal(await tables.count(), 2, 'Mismatched bounds must hide the combined table');
    await accepted('2026-01-02', '21', 'night');
    const final = await read();
    assert.deepEqual(final.readings.map(reading => [reading.date, reading.channel, reading.valueExact]),
      [['2026-01-01', 'day', '100'], ['2026-01-01', 'night', '20'], ['2026-01-02', 'day', '103'],
        ['2026-01-02', 'night', '21'], ['2026-01-03', 'day', '106'], ['2026-01-03', 'night', '23']]);
    assert.deepEqual(final.intervals.filter(interval => interval.channel === 'day').map(interval => interval.valueExact), ['120', '120']);
    assert.deepEqual(final.intervals.filter(interval => interval.channel === 'night').map(interval => interval.valueExact), ['40', '80']);
    assert.deepEqual(final.combinedIntervals.map(interval => interval.valueExact), ['160', '200']);
    assert.deepEqual(final.readings.find(reading => reading.id === first.readingId), initial.readings[0]);
    for (const interval of final.intervals) {
      const from = final.readings.find(reading => reading.id === interval.fromReadingId);
      const to = final.readings.find(reading => reading.id === interval.toReadingId);
      assert.equal(from.channel, interval.channel);
      assert.equal(to.channel, interval.channel);
      assert.equal(from.date, interval.from);
      assert.equal(to.date, interval.to);
    }
    const csrfStatus = await page.evaluate(async endpoint => (await fetch(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2026-01-04', value: '107', channel: 'day' }),
    })).status, endpoint);
    assert.equal(csrfStatus, 403);
    const input = readline.createInterface({ input: process.stdin });
    const acknowledged = new Promise(resolve => input.once('line', resolve));
    console.log('REVOKE');
    assert.equal(await acknowledged, 'REVOKED');
    input.close();
    await form.getByLabel('Дата вимірювання', { exact: true }).fill('2026-01-04');
    await form.locator('input[name="value"]').fill('107');
    await form.locator('select[name="channel"]').selectOption('day');
    const deniedReply = page.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith(endpoint));
    await button.click();
    assert.equal((await deniedReply).status(), 403);
    await page.getByText('Дозвіл на цю дію відсутній.', { exact: true }).waitFor();
    assert.deepEqual(await read(), final);
    await page.reload();
    await page.locator('select').first().selectOption(community);
    await selectPlot();
    assert.equal(await page.getByRole('button', { name: 'Визнати показання', exact: true }).count(), 0);
    const readingRows = tables.nth(0).locator('tbody tr');
    const intervalRows = tables.nth(1).locator('tbody tr');
    assert.equal(await readingRows.count(), 6);
    assert.equal(await intervalRows.count(), 4);
    for (let index = 0; index < 6; index++) {
      assert.equal(await readingRows.nth(index).locator('td').nth(0).textContent(), final.readings[index].date);
      assert.equal(await readingRows.nth(index).locator('td').nth(1).textContent(), final.readings[index].channel === 'day' ? 'День' : 'Ніч');
      assert.equal(await readingRows.nth(index).locator('td').nth(2).textContent(), final.readings[index].valueExact);
    }
    for (let index = 0; index < 4; index++) {
      const cells = intervalRows.nth(index).locator('td');
      assert.equal(await cells.nth(0).textContent(), final.intervals[index].from);
      assert.equal(await cells.nth(1).textContent(), final.intervals[index].to);
      assert.equal(await cells.nth(3).textContent(), final.intervals[index].rawDeltaExact);
      assert.equal(await cells.nth(4).textContent(), final.intervals[index].valueExact);
    }
    assert.deepEqual(await tables.nth(2).locator('tbody tr').allTextContents(),
      final.combinedIntervals.map(interval => interval.day.from + interval.day.to + interval.day.valueExact + interval.night.valueExact + interval.valueExact));
    await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT, fullPage: true });
    assert.deepEqual(errors, []);
    console.log('PASS: dual readings, channel isolation, mismatched bounds, restored sums, CSRF and revoked stale form');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
