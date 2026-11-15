// Only the new synthetic community supplied by the harness may be written.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const readline = require('node:readline');

(async () => {
  const origin = 'https://127.0.0.1:5543';
  const community = process.env.STAND_COMMUNITY;
  assert.match(community, /^[0-9a-f-]{36}$/);
  const base = `/community/electricity/${community}`;
  const browser = await chromium.launch({ channel: 'msedge' });
  try {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, serviceWorkers: 'block' });
    await context.addCookies([{ name: '__Host-communityos-platform', value: process.env.STAND_PROBE_COOKIE,
      url: origin, secure: true, httpOnly: true }]);
    const writes = new Set();
    await context.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin !== origin || (request.method() !== 'GET' &&
          !(request.method() === 'POST' && writes.has(url.pathname))))
        throw new Error('Unexpected request outside isolated replacement probe');
      await route.continue();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const communitiesReply = page.waitForResponse(response => response.url().endsWith('/community/register/communities'));
    await page.goto(origin + '/community/');
    const selectedCommunity = (await (await communitiesReply).json()).find(item => item.id === community);
    assert.equal(selectedCommunity.canReplaceElectricity, true);
    assert.equal(selectedCommunity.canRecognizeElectricity, true);
    const plotsReply = page.waitForResponse(response => response.url().endsWith(base + '/plots'));
    await page.locator('select').first().selectOption(community);
    const plot = (await (await plotsReply).json()).find(plot => plot.number === 'Plot 0');
    const old = plot.installation;
    assert.equal(old.details.multiplierExact, '40');
    function allow(id) {
      writes.add(`${base}/installations/${id}/readings`);
      writes.add(`${base}/installations/${id}/replacement`);
    }
    allow(old.id);
    const readingPath = id => `${base}/installations/${id}/readings`;
    const replacementPath = id => `${base}/installations/${id}/replacement`;
    async function get(path) {
      return page.evaluate(async path => {
        const response = await fetch(path);
        if (!response.ok) throw new Error('Synthetic read failed');
        return response.json();
      }, path);
    }
    const historyPath = `${base}/plots/${plot.id}/installations`;
    const seriesReply = page.waitForResponse(response => response.url().endsWith(readingPath(old.id)));
    await page.locator('label').filter({ hasText: /^Точка або ділянка для обліку/ }).locator('select').selectOption(plot.id);
    assert.equal((await seriesReply).status(), 200);
    const reading = page.getByRole('group', { name: 'Ручне спостереження', exact: true });
    async function recognize(id, date, value, status, outcome, message) {
      await reading.getByLabel('Дата вимірювання', { exact: true }).fill(date);
      await reading.locator('input[name="value"]').fill(value);
      const reply = page.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith(readingPath(id)));
      await reading.getByRole('button', { name: 'Визнати показання', exact: true }).click();
      const response = await reply;
      assert.equal(response.status(), status);
      assert.equal((await response.json()).outcome, outcome);
      await page.getByText(message, { exact: true }).waitFor();
    }
    await recognize(old.id, '2026-01-01', '100', 200, 'Recognized', 'Показання визнано.');
    await recognize(old.id, '2026-01-03', '103', 200, 'Recognized', 'Показання визнано.');
    const original = await get(readingPath(old.id));
    assert.equal(original.intervals[0].valueExact, '120');
    const replacement = page.getByRole('group', { name: 'Замінити лічильник', exact: true });
    async function fillReplacement(date) {
      for (const [name, value] of Object.entries({ designation: 'Synthetic new meter', effectiveOn: date,
        reason: 'Synthetic replacement acceptance', model: 'Test model', serialNumber: 'NEW-001',
        location: 'Synthetic plot', mountedOn: date, sealSerialNumber: 'SEAL-001', multiplier: '1' }))
        await replacement.locator(`input[name="${name}"]`).fill(value);
    }
    async function replace(id, status, outcome) {
      const reply = page.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith(replacementPath(id)));
      await replacement.getByRole('button', { name: 'Зареєструвати заміну', exact: true }).click();
      const response = await reply;
      assert.equal(response.status(), status);
      const body = await response.json();
      assert.equal(body.outcome, outcome);
      return { body, payload: response.request().postDataJSON() };
    }
    await fillReplacement('2026-01-03');
    await replace(old.id, 409, 'ExistingReading');
    await page.getByText('Старий лічильник уже має показання на дату заміни або пізніше.', { exact: true }).waitFor();
    assert.equal((await get(historyPath)).length, 1);
    assert.deepEqual(await get(readingPath(old.id)), original);
    await fillReplacement('2026-01-04');
    const completed = await replace(old.id, 200, 'Replaced');
    const next = completed.body.installationId;
    allow(next);
    await page.getByText('Заміну лічильника зареєстровано.', { exact: true }).waitFor();
    const history = await get(historyPath);
    assert.equal(history.length, 2);
    assert.equal(history[0].id, next);
    assert.equal(history[0].pointId, old.pointId);
    assert.equal(history[1].pointId, old.pointId);
    assert.equal(history[1].endsBefore, '2026-01-04');
    assert.equal(history[0].startsOn, '2026-01-04');
    assert.equal(history[0].details.multiplierExact, '1');
    assert.equal(history[1].details.multiplierExact, '40');
    assert.deepEqual((await get(readingPath(next))).readings, []);
    assert.deepEqual((await get(readingPath(next))).intervals, []);
    async function post(path, payload, csrf = true) {
      return page.evaluate(async ({ path, payload, csrf }) => {
        const headers = { 'Content-Type': 'application/json' };
        if (csrf) headers['X-Platform-CSRF'] = (await (await fetch('/platform/csrf')).json()).token;
        const response = await fetch(path, { method: 'POST', headers, body: JSON.stringify(payload) });
        return { status: response.status, body: await response.json().catch(() => null) };
      }, { path, payload, csrf });
    }
    const replay = await post(replacementPath(old.id), completed.payload);
    assert.equal(replay.status, 200);
    assert.deepEqual(replay.body, { outcome: 'Replayed', installationId: next });
    const conflict = await post(replacementPath(old.id), { ...completed.payload, reason: 'Changed reason' });
    assert.equal(conflict.status, 409);
    assert.equal(conflict.body.outcome, 'Conflict');
    assert.deepEqual(await get(historyPath), history);
    await recognize(next, '2026-01-04', '1', 200, 'Recognized', 'Показання визнано.');
    await recognize(next, '2026-01-05', '4', 200, 'Recognized', 'Показання визнано.');
    const current = await get(readingPath(next));
    assert.equal(current.intervals.length, 1);
    assert.equal(current.intervals[0].valueExact, '3');
    assert.deepEqual(await get(readingPath(old.id)), original);
    async function selectInstallation(id) {
      const reply = page.waitForResponse(response => response.url().endsWith(readingPath(id)));
      await page.locator('label').filter({ hasText: /^Історія установок/ }).locator('select').selectOption(id);
      assert.equal((await reply).status(), 200);
    }
    await selectInstallation(old.id);
    assert.equal(await page.getByRole('button', { name: 'Зареєструвати заміну', exact: true }).count(), 0);
    await recognize(old.id, '2026-01-04', '104', 400, 'OutsideInstallation', 'Дата вимірювання поза періодом установки.');
    assert.deepEqual(await get(readingPath(old.id)), original);
    await recognize(old.id, '2026-01-02', '101', 200, 'Recognized', 'Показання визнано.');
    const historical = await get(readingPath(old.id));
    assert.deepEqual(historical.intervals.map(interval => interval.valueExact), ['40', '80']);
    for (const prior of original.readings) assert.deepEqual(historical.readings.find(item => item.id === prior.id), prior);
    assert.deepEqual(await get(readingPath(next)), current);
    await selectInstallation(next);
    const futurePayload = { ...completed.payload, requestId: require('node:crypto').randomUUID(), effectiveOn: '2026-01-06' };
    assert.equal((await post(replacementPath(next), futurePayload, false)).status, 403);
    await fillReplacement('2026-01-06');
    const input = readline.createInterface({ input: process.stdin });
    const acknowledged = new Promise(resolve => input.once('line', resolve));
    console.log('REVOKE');
    assert.equal(await acknowledged, 'REVOKED');
    input.close();
    const deniedReply = page.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith(replacementPath(next)));
    await replacement.getByRole('button', { name: 'Зареєструвати заміну', exact: true }).click();
    assert.equal((await deniedReply).status(), 403);
    await page.getByText('Дозвіл на цю дію відсутній.', { exact: true }).waitFor();
    assert.deepEqual(await get(historyPath), history);
    assert.deepEqual(await get(readingPath(next)), current);
    assert.deepEqual(await get(readingPath(old.id)), historical);
    await page.reload();
    await page.locator('select').first().selectOption(community);
    const currentReply = page.waitForResponse(response => response.url().endsWith(readingPath(next)));
    await page.locator('label').filter({ hasText: /^Точка або ділянка для обліку/ }).locator('select').selectOption(plot.id);
    assert.equal((await currentReply).status(), 200);
    await page.getByText('Лічильник Synthetic new meter · початок установки 2026-01-04', { exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Зареєструвати заміну', exact: true }).count(), 0);
    await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT, fullPage: true });
    assert.deepEqual(errors, []);
    console.log('PASS: replacement conflict, replay, preserved history, installation boundary, CSRF and revoked stale form');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
