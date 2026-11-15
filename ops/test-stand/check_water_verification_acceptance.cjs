// Register verifications only for the isolated synthetic meters supplied by the harness.
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
        throw new Error('Unexpected request outside isolated verification probe');
      await route.continue();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const communitiesReply = page.waitForResponse(response => response.url().endsWith('/community/register/communities'));
    await page.goto(origin + '/community/');
    assert.equal((await (await communitiesReply).json()).find(item => item.id === community)?.canVerifyWater, true);
    const pointsReply = page.waitForResponse(response => response.url().endsWith(base + '/points'));
    await page.locator('select').first().selectOption(community);
    await pointsReply;
    const area = page.locator('details').filter({ has: page.locator(':scope > summary', { hasText: /^Повірка водомірів$/ }) });
    await area.locator(':scope > summary').click();
    async function load() {
      const reply = page.waitForResponse(response => response.url().endsWith(base + '/verifications'));
      await area.getByRole('button', { name: 'Завантажити строки повірки', exact: true }).click();
      const response = await reply;
      assert.equal(response.status(), 200);
      return response.json();
    }
    async function read() {
      return page.evaluate(async path => {
        const response = await fetch(path);
        if (!response.ok) throw new Error('Verification history unavailable');
        return response.json();
      }, base + '/verifications');
    }
    const initial = await load();
    assert.equal(initial.meters.length, 2);
    assert.ok(initial.meters.every(meter => meter.active && meter.history.length === 0));
    const [primary, other] = [...initial.meters].sort((a, b) => a.designation.localeCompare(b.designation));
    const endpoint = meter => `${base}/meters/${meter.id}/verifications`;
    for (const meter of initial.meters) writes.add(endpoint(meter));
    const day = offset => {
      const date = new Date(initial.today + 'T00:00:00Z');
      date.setUTCDate(date.getUTCDate() + offset);
      return date.toISOString().slice(0, 10);
    };
    const picker = area.locator('label').filter({ hasText: /^Водомір для історії повірок/ }).locator('select');
    const deadlines = area.getByRole('table', { name: 'Строки повірки чинних водомірів', exact: true });
    const attention = area.getByRole('checkbox', { name: 'Лише водоміри, що потребують уваги', exact: true });
    async function status(meter, expected) {
      const row = deadlines.locator('tbody tr').filter({ has: page.getByRole('rowheader', { name: meter.designation, exact: true }) });
      await row.waitFor();
      assert.equal(await row.locator('td').last().textContent(), expected);
    }
    await status(primary, 'Строк невідомий');
    await status(other, 'Строк невідомий');
    await picker.selectOption(primary.id);
    const button = area.getByRole('button', { name: 'Зареєструвати повірку', exact: true });
    async function fill(verified, due, evidence) {
      await area.getByLabel('Дата повірки', { exact: true }).fill(verified);
      await area.getByLabel('Дата наступної повірки', { exact: true }).fill(due);
      await area.getByLabel('Підстава повірки', { exact: true }).fill(evidence);
    }
    async function submit(verified, due, evidence, code, outcome, message) {
      await fill(verified, due, evidence);
      const reply = page.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith(endpoint(primary)));
      await button.click();
      const response = await reply;
      assert.equal(response.status(), code);
      assert.equal((await response.json()).outcome, outcome);
      await area.getByText(message, { exact: true }).waitFor();
    }
    await submit(day(-3), day(-1), 'Synthetic overdue evidence', 200, 'Recorded', 'Повірку зареєстровано.');
    await status(primary, 'Прострочено');
    const first = await read();
    await submit(day(-3), day(-1), 'Synthetic overdue evidence', 200, 'Replayed', 'Повірку вже записано.');
    assert.deepEqual(await read(), first, 'Replay must preserve original attribution and timestamp');
    await submit(day(-3), day(0), 'Synthetic overdue evidence', 409, 'Conflict', 'За цю дату вже записано інші відомості про повірку.');
    assert.deepEqual(await read(), first);
    await submit(day(-2), day(0), 'Synthetic today evidence', 200, 'Recorded', 'Повірку зареєстровано.');
    await status(primary, 'Строк сьогодні');
    await submit(day(-1), day(30), 'Synthetic 30-day evidence', 200, 'Recorded', 'Повірку зареєстровано.');
    await status(primary, 'Повірка наближається');
    await attention.check();
    assert.equal(await deadlines.locator('tbody tr').count(), 2);
    await submit(day(0), day(31), 'Synthetic 31-day evidence', 200, 'Recorded', 'Повірку зареєстровано.');
    assert.equal(await deadlines.locator('tbody tr').count(), 1);
    assert.equal(await deadlines.locator('tbody th').textContent(), other.designation);
    await attention.uncheck();
    await status(primary, 'Строк не настав');
    await status(other, 'Строк невідомий');
    let final = await read();
    const history = final.meters.find(meter => meter.id === primary.id).history;
    assert.deepEqual(history.map(row => [row.verifiedOn, row.dueOn]),
      [[day(0), day(31)], [day(-1), day(30)], [day(-2), day(0)], [day(-3), day(-1)]]);
    assert.deepEqual(final.meters.find(meter => meter.id === other.id).history, []);
    if (process.env.STAND_VERIFICATION_HISTORY === 'true') {
      const points = await page.evaluate(async path => (await fetch(path)).json(), base + '/points');
      const point = points.find(item => item.meterDesignation === primary.designation);
      assert.ok(point);
      const series = page.waitForResponse(response => response.url().endsWith(`${base}/installations/${point.installationId}/readings`));
      await page.locator('label').filter({ hasText: /^Точка обліку води/ }).locator('select').selectOption(point.installationId);
      assert.equal((await series).status(), 200);
      const replacement = page.locator('details').filter({ has: page.locator(':scope > summary', { hasText: /^Замінити водомір$/ }) });
      await replacement.locator(':scope > summary').click();
      for (const [name, value] of Object.entries({ meterDesignation: 'Synthetic verified replacement',
        effectiveOn: initial.today, reason: 'Synthetic verification history acceptance' }))
        await replacement.locator(`input[name="${name}"]`).fill(value);
      const path = `${base}/installations/${point.installationId}/replace`;
      writes.add(path);
      const reply = page.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith(path));
      await replacement.getByRole('button', { name: 'Зареєструвати заміну водоміра', exact: true }).click();
      const response = await reply;
      assert.equal(response.status(), 200);
      assert.equal((await response.json()).outcome, 'Replaced');
      await page.getByText('Заміну водоміра зареєстровано.', { exact: true }).waitFor();
      final = await load();
      const removed = final.meters.find(meter => meter.id === primary.id);
      const current = final.meters.find(meter => meter.designation === 'Synthetic verified replacement');
      assert.equal(final.meters.length, 3);
      assert.equal(removed.active, false);
      assert.deepEqual(removed.history, history, 'Replacement must preserve every verification field');
      assert.equal(current.active, true);
      assert.notEqual(current.id, primary.id);
      assert.deepEqual(current.history, [], 'New meter must not inherit verification history');
      assert.equal(await deadlines.locator('tbody tr').count(), 2);
      assert.equal(await deadlines.getByRole('rowheader', { name: primary.designation, exact: true }).count(), 0);
      await status(current, 'Строк невідомий');
      await picker.selectOption(current.id);
      assert.equal(await area.getByRole('table', { name: 'Історія повірок водоміра', exact: true }).count(), 0);
      await picker.selectOption(primary.id);
      const oldRows = area.getByRole('table', { name: 'Історія повірок водоміра', exact: true }).locator('tbody tr');
      assert.equal(await oldRows.count(), 4);
      for (let index = 0; index < history.length; index++)
        assert.deepEqual((await oldRows.nth(index).locator('td').allTextContents()).slice(0, 4),
          [history[index].verifiedOn, history[index].dueOn, history[index].evidence, history[index].accountId]);
    }
    async function post(meter, payload, csrf) {
      return page.evaluate(async ({ path, payload, csrf }) => {
        const headers = { 'Content-Type': 'application/json' };
        if (csrf) headers['X-Platform-CSRF'] = (await (await fetch('/platform/csrf')).json()).token;
        return (await fetch(path, { method: 'POST', headers, body: JSON.stringify(payload) })).status;
      }, { path: endpoint(meter), payload, csrf });
    }
    assert.equal(await post(other, { verifiedOn: day(0), dueOn: day(0), evidence: 'Invalid due' }, true), 400);
    assert.equal(await post(other, { verifiedOn: day(1), dueOn: day(60), evidence: 'Future date' }, true), 400);
    assert.equal(await post(other, { verifiedOn: day(0), dueOn: day(60), evidence: 'Missing CSRF' }, false), 403);
    assert.deepEqual(await read(), final);
    await picker.selectOption(other.id);
    await fill(day(0), day(60), 'Revoked attempt');
    const input = readline.createInterface({ input: process.stdin });
    const acknowledged = new Promise(resolve => input.once('line', resolve));
    console.log('REVOKE');
    assert.equal(await acknowledged, 'REVOKED');
    input.close();
    const denied = page.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith(endpoint(other)));
    await button.click();
    assert.equal((await denied).status(), 403);
    await area.getByText('Дозвіл на цю дію відсутній.', { exact: true }).waitFor();
    assert.deepEqual(await read(), final);
    await page.reload();
    const loaded = page.waitForResponse(response => response.url().endsWith(base + '/points'));
    await page.locator('select').first().selectOption(community);
    await loaded;
    await area.locator(':scope > summary').click();
    await load();
    await picker.selectOption(primary.id);
    assert.equal(await button.count(), 0);
    const rows = area.getByRole('table', { name: 'Історія повірок водоміра', exact: true }).locator('tbody tr');
    assert.equal(await rows.count(), 4);
    for (let index = 0; index < 4; index++) {
      const cells = await rows.nth(index).locator('td').allTextContents();
      assert.deepEqual(cells.slice(0, 4), [history[index].verifiedOn, history[index].dueOn, history[index].evidence, history[index].accountId]);
    }
    await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT, fullPage: true });
    assert.deepEqual(errors, []);
    console.log('PASS: real verification registration, deadline boundaries, replay, conflict, validation, CSRF and revoked form');
    if (process.env.STAND_VERIFICATION_HISTORY === 'true')
      console.log('PASS: replacement preserves removed meter verification history without transferring deadlines to new meter');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
