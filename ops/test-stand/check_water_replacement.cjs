// Only the new synthetic community supplied by the harness may be written.
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
    const writes = new Set();
    await context.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin !== origin || (request.method() !== 'GET' &&
          !(request.method() === 'POST' && writes.has(url.pathname))))
        throw new Error(`Unexpected request outside isolated replacement probe: ${request.method()} ${url.pathname}`);
      await route.continue();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const communitiesReply = page.waitForResponse(response => response.url().endsWith('/community/register/communities'));
    await page.goto(origin + '/community/');
    const selectedCommunity = (await (await communitiesReply).json()).find(item => item.id === community);
    assert.equal(selectedCommunity.canReplaceWater, true);
    assert.equal(selectedCommunity.canRecognizeWater, true);
    const pointsReply = page.waitForResponse(response => response.url().endsWith(base + '/points'));
    await page.locator('select').first().selectOption(community);
    const point = (await (await pointsReply).json()).find(point => point.meterDesignation === 'Meter 0');
    assert.ok(point);
    const old = { id: point.installationId, pointId: point.id };
    function allow(id) {
      writes.add(`${base}/installations/${id}/readings`);
      writes.add(`${base}/installations/${id}/replace`);
    }
    allow(old.id);
    const readingPath = id => `${base}/installations/${id}/readings`;
    const replacementPath = id => `${base}/installations/${id}/replace`;
    async function get(path) {
      return page.evaluate(async path => {
        const response = await fetch(path);
        if (!response.ok) throw new Error('Synthetic read failed');
        return response.json();
      }, path);
    }
    const historyPath = `${base}/points/${point.id}/installations`;
    const seriesReply = page.waitForResponse(response => response.url().endsWith(readingPath(old.id)));
    await page.locator('label').filter({ hasText: /^Точка обліку води/ }).locator('select').selectOption(old.id);
    assert.equal((await seriesReply).status(), 200);
    const reading = page.locator('form').filter({ has: page.getByRole('button', { name: 'Визнати показання води', exact: true }) });
    async function recognize(id, date, value, status, outcome, message) {
      await reading.getByLabel('Дата показання води', { exact: true }).fill(date);
      await reading.locator('input[name="value"]').fill(value);
      const reply = page.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith(readingPath(id)));
      await reading.getByRole('button', { name: 'Визнати показання води', exact: true }).click();
      const response = await reply;
      assert.equal(response.status(), status);
      assert.equal((await response.json()).outcome, outcome);
      await page.getByText(message, { exact: true }).waitFor();
    }
    await recognize(old.id, '2026-01-01', '10', 200, 'Recognized', 'Показання води визнано.');
    await recognize(old.id, '2026-01-03', '12.5', 200, 'Recognized', 'Показання води визнано.');
    const original = await get(readingPath(old.id));
    assert.equal(original.intervals[0].valueExact, '2.5');
    const replacement = page.locator('details').filter({ has: page.locator(':scope > summary', { hasText: /^Замінити водомір$/ }) });
    await replacement.locator(':scope > summary').click();
    async function fillReplacement(date) {
      for (const [name, value] of Object.entries({ meterDesignation: 'Synthetic new water meter', effectiveOn: date,
        reason: 'Synthetic water replacement acceptance' }))
        await replacement.locator(`input[name="${name}"]`).fill(value);
    }
    async function replace(id, status, outcome) {
      const reply = page.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith(replacementPath(id)));
      await replacement.getByRole('button', { name: 'Зареєструвати заміну водоміра', exact: true }).click();
      const response = await reply;
      assert.equal(response.status(), status);
      const body = await response.json();
      assert.equal(body.outcome, outcome);
      return { body, payload: response.request().postDataJSON() };
    }
    await fillReplacement('2026-01-03');
    await replace(old.id, 409, 'ExistingReading');
    await page.getByText('Є визнані показання старого водоміра на дату заміни або пізніше.', { exact: true }).waitFor();
    assert.equal((await get(historyPath)).length, 1);
    assert.deepEqual(await get(readingPath(old.id)), original);
    await fillReplacement('2026-01-04');
    const completed = await replace(old.id, 200, 'Replaced');
    const next = completed.body.installationId;
    allow(next);
    await page.getByText('Заміну водоміра зареєстровано.', { exact: true }).waitFor();
    const history = await get(historyPath);
    assert.equal(history.length, 2);
    assert.equal(history[0].id, next);
    const currentPoints = await get(base + '/points');
    assert.equal(currentPoints.length, 2);
    assert.equal(currentPoints.find(item => item.installationId === next).id, old.pointId);
    assert.equal(history[1].endsBefore, '2026-01-04');
    assert.equal(history[0].startsOn, '2026-01-04');
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
    await recognize(next, '2026-01-04', '1', 200, 'Recognized', 'Показання води визнано.');
    await recognize(next, '2026-01-05', '4', 200, 'Recognized', 'Показання води визнано.');
    const current = await get(readingPath(next));
    assert.equal(current.intervals.length, 1);
    assert.equal(current.intervals[0].valueExact, '3');
    assert.deepEqual(await get(readingPath(old.id)), original);
    async function selectInstallation(id) {
      const reply = page.waitForResponse(response => response.url().endsWith(readingPath(id)));
      await page.locator('label').filter({ hasText: /^Історія водомірів/ }).locator('select').selectOption(id);
      assert.equal((await reply).status(), 200);
    }
    await selectInstallation(old.id);
    await replacement.locator(':scope > summary').click();
    await replacement.getByText('Заміна стосується чинного водоміра Synthetic new water meter, діє з 2026-01-04.', { exact: true }).waitFor();
    await recognize(old.id, '2026-01-04', '13', 400, 'OutsideInstallation', 'Дата вимірювання поза періодом установки.');
    assert.deepEqual(await get(readingPath(old.id)), original);
    await recognize(old.id, '2026-01-02', '11', 200, 'Recognized', 'Показання води визнано.');
    const historical = await get(readingPath(old.id));
    assert.deepEqual(historical.intervals.map(interval => interval.valueExact), ['1', '1.5']);
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
    await replacement.getByRole('button', { name: 'Зареєструвати заміну водоміра', exact: true }).click();
    assert.equal((await deniedReply).status(), 403);
    await page.getByText('Дозвіл на цю дію відсутній.', { exact: true }).waitFor();
    assert.deepEqual(await get(historyPath), history);
    assert.deepEqual(await get(readingPath(next)), current);
    assert.deepEqual(await get(readingPath(old.id)), historical);
    await page.reload();
    await page.locator('select').first().selectOption(community);
    const currentReply = page.waitForResponse(response => response.url().endsWith(readingPath(next)));
    await page.locator('label').filter({ hasText: /^Точка обліку води/ }).locator('select').selectOption(next);
    assert.equal((await currentReply).status(), 200);
    await page.getByText('Водомір Synthetic new water meter, діє з 2026-01-04.', { exact: true }).waitFor();
    assert.equal(await page.getByText('Замінити водомір', { exact: true }).count(), 0);
    await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT, fullPage: true });
    assert.deepEqual(errors, []);
    console.log('PASS: water replacement conflict, replay, preserved history, current target, boundary and revoked stale form');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
