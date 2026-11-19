// Post only the isolated synthetic community's two billing periods.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const readline = require('node:readline');
const checkPartialPayment = require('./check_water_partial_payment.cjs');

async function revokeGrant() {
  const input = readline.createInterface({ input: process.stdin });
  try {
    const acknowledged = new Promise(resolve => input.once('line', resolve));
    console.log('REVOKE');
    assert.equal(await acknowledged, 'REVOKED');
  } finally {
    input.close();
  }
}

(async () => {
  const origin = 'https://127.0.0.1:5543';
  const community = process.env.STAND_COMMUNITY;
  assert.match(community, /^[0-9a-f-]{36}$/);
  const base = `/community/billing/${community}`;
  const partialPayment = process.env.STAND_WATER_PARTIAL_PAYMENT === 'true';
  const writes = new Set([base + '/post']);
  if (partialPayment) {
    for (const path of ['record', 'preview', 'allocate']) writes.add(`${base}/payments/${path}`);
  }
  const communitiesPath = '/community/register/communities';
  const browser = await chromium.launch({ channel: 'msedge' });
  try {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, serviceWorkers: 'block' });
    await context.addCookies([{ name: '__Host-communityos-platform', value: process.env.STAND_PROBE_COOKIE,
      url: origin, secure: true, httpOnly: true }]);
    const unexpected = [];
    await context.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      const allowed = request.method() === 'GET' || (request.method() === 'POST' && writes.has(url.pathname));
      if (url.origin !== origin || !allowed) {
        unexpected.push(request.method());
        await route.abort();
        return;
      }
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
      if (!response.ok) throw new Error('Synthetic billing history unavailable');
      return response.json();
    }, path);
    const communities = reply(communitiesPath);
    await page.goto(origin + '/community/');
    const grants = (await (await communities).json()).find(item => item.id === community);
    assert.ok(grants.canReadBilling && grants.canPostBilling);
    if (partialPayment) assert.ok(grants.canRecordPayment && grants.canAllocatePayment);
    await page.locator('select').first().selectOption(community);
    const section = page.getByRole('region', { name: 'Розрахунковий період', exact: true });
    const confirm = section.getByRole('button', { name: 'Підтвердити проведення періоду', exact: true });
    const first = { from: '2026-01-01', until: '2026-01-03', calculatedOn: '2026-01-04', dueOn: '2026-01-15' };
    const second = { from: '2026-01-03', until: '2026-01-05', calculatedOn: '2026-01-06', dueOn: '2026-01-16' };
    const labels = { from: 'Початок споживання', until: 'Кінець споживання', calculatedOn: 'Дата розрахунку', dueOn: 'Сплатити до' };
    async function preview(period, includeWater, electricity) {
      for (const [field, value] of Object.entries(period))
        await section.getByLabel(labels[field], { exact: true }).fill(value);
      await section.getByRole('checkbox', { name: 'Включити воду', exact: true }).setChecked(includeWater);
      const waiting = reply(base + '/preview');
      await section.getByRole('button', { name: 'Попередній розрахунок', exact: true }).click();
      const response = await waiting;
      assert.equal(response.status(), 200);
      const quote = await response.json();
      assert.match(quote.digest, /^[0-9A-F]{64}$/);
      assert.deepEqual(quote.plan.period, period);
      assert.equal(quote.plan.includeWater ?? false, includeWater);
      assert.equal(quote.plan.ready, true);
      assert.equal(quote.plan.lines.length, 1);
      const [line] = quote.plan.lines;
      assert.equal(line.accountNumber, 'WATER-001');
      assert.equal(line.electricity.amountUah, electricity);
      assert.equal(line.fee.amountUah, 25);
      if (includeWater) {
        assert.deepEqual([line.water.status, line.water.volume, line.water.rate, line.water.amountUah],
          ['Ready', 2.5, 20, 50]);
        for (const id of [line.water.installationId, line.water.openingReadingId, line.water.closingReadingId, line.water.tariffId])
          assert.match(id, /^[0-9a-f-]{36}$/);
      } else {
        assert.equal(line.water, undefined);
      }
      await confirm.waitFor();
      const waterLine = section.getByText(/^Вода ·/);
      if (includeWater) await waterLine.filter({ hasText: /2\.5 м³ × 20 грн\/м³ · 50,00/ }).waitFor();
      else assert.equal(await waterLine.count(), 0);
      return quote;
    }
    async function post(quote, status, outcome, message) {
      const posted = reply(base + '/post', 'POST');
      await confirm.click();
      const response = await posted;
      assert.equal(response.status(), status);
      assert.deepEqual(response.request().postDataJSON(), {
        period: quote.plan.period, digest: quote.digest, includeWater: quote.plan.includeWater ?? false,
      });
      const result = outcome ? await response.json() : undefined;
      if (outcome) assert.equal(result.outcome, outcome);
      await section.getByText(message, { exact: true }).waitFor();
      return result?.result;
    }
    const history = period => get(base + '/history?' + new URLSearchParams({ from: period.from, until: period.until }));
    const dryQuote = await preview(first, false, 480);
    const wetQuote = await preview(first, true, 480);
    assert.notEqual(wetQuote.digest, dryQuote.digest);
    assert.deepEqual(await get(base + '/periods'), []);
    const wet = await post(wetQuote, 200, 'Posted', 'Період проведено.');
    assert.equal(wet.digest, wetQuote.digest);
    assert.deepEqual(wet.snapshot, wetQuote.plan);
    assert.deepEqual(await history(first), wet);
    if (partialPayment) {
      await checkPartialPayment({ page, billing: section, base, reply, get, period: wet, revokeGrant });
      assert.deepEqual(await history(first), wet);
      await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT, fullPage: true });
      assert.deepEqual(unexpected, []);
      assert.deepEqual(errors, []);
      console.log('PASS: water payment, exact replay, revoked allocation and matching 20 UAH balances in statement and reconciliation');
      return;
    }
    const repeated = await preview(first, true, 480);
    assert.deepEqual(repeated, wetQuote);
    assert.deepEqual(await post(repeated, 200, 'Replayed', 'Період уже проведено.'), wet);
    const conflict = await preview(first, false, 480);
    assert.deepEqual(conflict, dryQuote);
    await post(conflict, 409, 'PeriodAlreadyPosted', 'Цей період уже проведено.');
    assert.deepEqual(await history(first), wet);
    const secondQuote = await preview(second, false, 160);
    const dry = await post(secondQuote, 200, 'Posted', 'Період проведено.');
    assert.notEqual(dry.id, wet.id);
    assert.deepEqual(dry.snapshot, secondQuote.plan);
    assert.deepEqual(await history(second), dry);

    const dryAgain = await preview(second, false, 160);
    await revokeGrant();
    await post(dryAgain, 403, null, 'Дозвіл на цю дію відсутній.');
    assert.deepEqual((await get(base + '/periods')).map(item => item.id), [dry.id, wet.id]);
    assert.deepEqual(await history(first), wet);
    assert.deepEqual(await history(second), dry);

    const refreshed = reply(communitiesPath);
    await page.reload();
    const after = (await (await refreshed).json()).find(item => item.id === community);
    assert.equal(after.canPostBilling, false);
    assert.equal(after.canReadBilling, true);
    await page.locator('select').first().selectOption(community);
    const periods = section.locator('summary').filter({ hasText: /^Проведені періоди$/ });
    await periods.click();
    await section.getByRole('button', { name: 'Завантажити проведені періоди', exact: true }).click();
    const saved = reply(base + '/history');
    await section.getByRole('button', { name: `Відкрити період ${first.from} — ${first.until}`, exact: true }).click();
    assert.deepEqual(await (await saved).json(), wet);
    const reconciliationPath = `${base}/periods/${wet.id}/reconciliation`;
    const reconciliation = reply(reconciliationPath);
    await section.locator('summary').filter({ hasText: /^Звірка розрахункового періоду$/ }).click();
    await section.getByRole('button', { name: 'Завантажити поточну звірку', exact: true }).click();
    const summary = await reconciliation;
    assert.equal(summary.status(), 200);
    const report = await summary.json();
    assert.equal(report.details.length, 3);
    assert.equal(new Set(report.details.map(item => item.obligationId)).size, 3);
    assert.deepEqual(Object.fromEntries(report.details.map(item => [item.kind, [item.charged, item.settled, item.outstanding, item.excess]])),
      { electricity: [480, 0, 480, 0], 'member-fee': [25, 0, 25, 0], water: [50, 0, 50, 0] });
    assert.equal(report.details.find(item => item.kind === 'water').account, 'WATER-001');
    const table = section.getByRole('table', { name: 'Поточні залишки зобов’язань періоду', exact: true });
    const row = table.getByRole('row').filter({ has: page.getByRole('rowheader', { name: 'Вода', exact: true }) });
    await row.waitFor();
    assert.match(await row.locator('td').nth(0).textContent(), /^50,00\s/);
    assert.match(await row.locator('td').nth(2).textContent(), /^50,00\s/);
    assert.equal(await confirm.count(), 0);
    await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT, fullPage: true });
    assert.deepEqual(unexpected, []);
    assert.deepEqual(errors, []);
    console.log('PASS: wet and dry period posting, exact replay, changed-project conflict, revoked post and readable water reconciliation');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
