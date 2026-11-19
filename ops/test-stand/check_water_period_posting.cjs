// Post only billing periods in the isolated synthetic community.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const readline = require('node:readline');
const checkPartialPayment = require('./check_water_partial_payment.cjs');

async function standStep(command, expected) {
  const input = readline.createInterface({ input: process.stdin });
  try {
    const acknowledged = new Promise(resolve => input.once('line', resolve));
    console.log(command);
    assert.equal(await acknowledged, expected);
  } finally {
    input.close();
  }
}

const revokeGrant = () => standStep('REVOKE', 'REVOKED');

(async () => {
  const origin = 'https://127.0.0.1:5543';
  const community = process.env.STAND_COMMUNITY;
  assert.match(community, /^[0-9a-f-]{36}$/);
  const base = `/community/billing/${community}`;
  const partialPayment = process.env.STAND_WATER_PARTIAL_PAYMENT === 'true';
  const postingRace = process.env.STAND_WATER_POSTING_RACE === 'true';
  const stalePosting = process.env.STAND_WATER_STALE_POSTING === 'true';
  const peer = process.env.STAND_WATER_BILLING_PEER;
  const writes = new Set([base + '/post']);
  if (peer) {
    assert.match(peer, /^[0-9a-f-]{36}$/);
    assert.notEqual(peer, community);
    writes.add(`/community/billing/${peer}/post`);
  }
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
    const errors = [];
    const responseOn = (page, path, method) => page.waitForResponse(response =>
      new URL(response.url()).pathname === path && response.request().method() === method);
    async function openBilling(target = community) {
      const page = await context.newPage();
      page.setDefaultTimeout(20000);
      page.on('pageerror', error => errors.push(error.message));
      const communities = responseOn(page, communitiesPath, 'GET');
      await page.goto(origin + '/community/');
      const grants = (await (await communities).json()).find(item => item.id === target);
      assert.ok(grants.canReadBilling && grants.canPostBilling);
      if (partialPayment) assert.ok(grants.canRecordPayment && grants.canAllocatePayment);
      await page.locator('select').first().selectOption(target);
      return page;
    }
    const page = await openBilling();
    const reply = (path, method = 'GET') => responseOn(page, path, method);
    const get = path => page.evaluate(async path => {
      const response = await fetch(path);
      if (!response.ok) throw new Error('Synthetic billing history unavailable');
      return response.json();
    }, path);
    const billing = tab => tab.getByRole('region', { name: 'Розрахунковий період', exact: true });
    const confirmation = section => section.getByRole('button', { name: 'Підтвердити проведення періоду', exact: true });
    const section = billing(page);
    const confirm = confirmation(section);
    const first = { from: '2026-01-01', until: '2026-01-03', calculatedOn: '2026-01-04', dueOn: '2026-01-15' };
    const second = { from: '2026-01-03', until: '2026-01-05', calculatedOn: '2026-01-06', dueOn: '2026-01-16' };
    const labels = { from: 'Початок споживання', until: 'Кінець споживання', calculatedOn: 'Дата розрахунку', dueOn: 'Сплатити до' };
    async function preview(period, includeWater, electricity, { tab = page, endpoint = base, waterRate = 20 } = {}) {
      const target = billing(tab);
      for (const [field, value] of Object.entries(period))
        await target.getByLabel(labels[field], { exact: true }).fill(value);
      await target.getByRole('checkbox', { name: 'Включити воду', exact: true }).setChecked(includeWater);
      const waiting = responseOn(tab, endpoint + '/preview', 'GET');
      await target.getByRole('button', { name: 'Попередній розрахунок', exact: true }).click();
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
          ['Ready', 2.5, waterRate, 2.5 * waterRate]);
        for (const id of [line.water.installationId, line.water.openingReadingId, line.water.closingReadingId, line.water.tariffId])
          assert.match(id, /^[0-9a-f-]{36}$/);
      } else {
        assert.equal(line.water, undefined);
      }
      await confirmation(target).waitFor();
      const waterLine = target.getByText(/^Вода ·/);
      if (includeWater) await waterLine.filter({ hasText: `2.5 м³ × ${waterRate} грн/м³ · ${2.5 * waterRate},00` }).waitFor();
      else assert.equal(await waterLine.count(), 0);
      return quote;
    }
    async function confirmQuote(quote, tab, endpoint = base) {
      const posted = responseOn(tab, endpoint + '/post', 'POST');
      const [response] = await Promise.all([posted, confirmation(billing(tab)).click()]);
      assert.deepEqual(response.request().postDataJSON(), {
        period: quote.plan.period, digest: quote.digest, includeWater: quote.plan.includeWater ?? false,
      });
      return response;
    }
    async function post(quote, status, outcome, message, tab = page, endpoint = base) {
      const response = await confirmQuote(quote, tab, endpoint);
      assert.equal(response.status(), status);
      const result = outcome ? await response.json() : undefined;
      if (outcome) assert.equal(result.outcome, outcome);
      await billing(tab).getByText(message, { exact: true }).waitFor();
      return result?.result;
    }
    const history = period => get(base + '/history?' + new URLSearchParams({ from: period.from, until: period.until }));
    if (peer) {
      const other = await openBilling(peer);
      const endpoint = `/community/billing/${peer}`;
      const peerQuote = await preview(first, true, 480, { tab: other, endpoint });
      const peerSaved = await post(peerQuote, 200, 'Posted', 'Період проведено.', other, endpoint);
      const peerHistory = endpoint + '/history?' + new URLSearchParams({ from: first.from, until: first.until });
      const peerReconciliation = `${endpoint}/periods/${peerSaved.id}/reconciliation`;
      const statusOf = (tab, path) => tab.evaluate(async path => (await fetch(path)).status, path);
      assert.deepEqual(await get(peerHistory), peerSaved);
      assert.equal(await statusOf(other, peerReconciliation), 200);

      await standStep('REVOKE_PEER_POST', 'PEER_POST_REVOKED');
      const readable = await preview(first, true, 480, { tab: other, endpoint });
      assert.deepEqual(readable, peerQuote);
      assert.deepEqual(await get(peerHistory), peerSaved);
      await post(readable, 403, null, 'Дозвіл на цю дію відсутній.', other, endpoint);
      assert.deepEqual(await get(peerHistory), peerSaved);

      await standStep('REVOKE_PEER_READ', 'PEER_READ_REVOKED');
      const peerPreview = endpoint + '/preview?' + new URLSearchParams({ ...first, includeWater: 'true' });
      for (const path of [peerPreview, endpoint + '/periods', peerHistory, peerReconciliation]) {
        assert.equal(await statusOf(other, path), 403);
      }
      const grants = responseOn(other, communitiesPath, 'GET');
      await other.reload();
      const listed = await (await grants).json();
      const peerGrants = listed.find(item => item.id === peer);
      assert.ok(peerGrants.canReadWater);
      assert.equal(peerGrants.canReadBilling, false);
      assert.equal(peerGrants.canPostBilling, false);
      const ownGrants = listed.find(item => item.id === community);
      assert.ok(ownGrants.canReadBilling && ownGrants.canPostBilling);
      await other.locator('select').first().selectOption(peer);
      await other.getByRole('heading', { name: 'Облік технічної води', exact: true }).waitFor();
      assert.equal(await billing(other).count(), 0);

      assert.deepEqual(await get(base + '/periods'), []);
      const ownQuote = await preview(first, true, 480);
      assert.notEqual(ownQuote.digest, peerQuote.digest);
      const own = await post(ownQuote, 200, 'Posted', 'Період проведено.');
      assert.notEqual(own.id, peerSaved.id);
      assert.deepEqual(own.snapshot, ownQuote.plan);
      assert.deepEqual(await history(first), own);
      assert.deepEqual((await get(base + '/periods')).map(item => item.id), [own.id]);
      assert.equal(await statusOf(page, `${base}/periods/${own.id}/reconciliation`), 200);
      assert.equal(await statusOf(page, `${base}/periods/${peerSaved.id}/reconciliation`), 404);
      await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT, fullPage: true });
      assert.deepEqual(unexpected, []);
      assert.deepEqual(errors, []);
      console.log('PASS: own billing remained available; peer read and posting grants were isolated; foreign period was not found');
      return;
    }
    if (stalePosting) {
      const original = await preview(first, true, 480);
      await standStep('CHANGE_BILLING_TARIFF', 'TARIFF_CHANGED');
      await post(original, 409, 'StalePreview', 'Вихідні дані змінилися. Сформуйте новий розрахунок.');
      assert.deepEqual(await get(base + '/periods'), []);
      await standStep('CHECK_STALE_BILLING', 'STALE_CHECKED');

      const refreshed = await preview(first, true, 480, { waterRate: 24 });
      assert.notEqual(refreshed.digest, original.digest);
      const expected = structuredClone(original.plan);
      Object.assign(expected.lines[0].water, { rate: 24, amountUah: 60 });
      assert.deepEqual(refreshed.plan, expected);
      const saved = await post(refreshed, 200, 'Posted', 'Період проведено.');
      assert.equal(saved.digest, refreshed.digest);
      assert.deepEqual(saved.snapshot, expected);
      assert.deepEqual(await history(first), saved);
      assert.deepEqual((await get(base + '/periods')).map(item => item.id), [saved.id]);
      await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT, fullPage: true });
      assert.deepEqual(unexpected, []);
      assert.deepEqual(errors, []);
      console.log('PASS: stale water quote was rejected; refreshed quote posted with 60 UAH and identical source references');
      return;
    }
    if (postingRace) {
      const other = await openBilling();
      const quotes = await Promise.all([preview(first, true, 480), preview(first, true, 480, { tab: other })]);
      assert.deepEqual(quotes[0], quotes[1]);
      assert.deepEqual(await get(base + '/periods'), []);
      const input = readline.createInterface({ input: process.stdin });
      const messages = input[Symbol.asyncIterator]();
      let responses;
      try {
        console.log('LOCK_BILLING_RACE');
        assert.equal((await messages.next()).value, 'LOCKED');
        async function confirmSecond() {
          assert.equal((await messages.next()).value, 'START_SECOND');
          await other.bringToFront();
          const [response, released] = await Promise.all([confirmQuote(quotes[1], other), messages.next()]);
          assert.equal(released.value, 'RELEASED');
          return response;
        }
        await page.bringToFront();
        responses = await Promise.all([confirmQuote(quotes[0], page), confirmSecond()]);
      } finally {
        input.close();
      }
      for (const response of responses) assert.equal(response.status(), 200);
      const results = await Promise.all(responses.map(response => response.json()));
      assert.deepEqual(results.map(result => result.outcome).sort(), ['Posted', 'Replayed']);
      const saved = results[0].result;
      assert.deepEqual(results[1].result, saved);
      assert.equal(saved.digest, quotes[0].digest);
      assert.deepEqual(saved.snapshot, quotes[0].plan);
      await Promise.all([page, other].map((tab, index) => billing(tab).getByText(
        results[index].outcome === 'Posted' ? 'Період проведено.' : 'Період уже проведено.', { exact: true }).waitFor()));
      assert.deepEqual((await get(base + '/periods')).map(item => item.id), [saved.id]);
      assert.deepEqual(await history(first), saved);
      const reconciliation = await get(`${base}/periods/${saved.id}/reconciliation`);
      assert.equal(reconciliation.details.length, 3);
      assert.equal(new Set(reconciliation.details.map(item => item.obligationId)).size, 3);
      assert.deepEqual(Object.fromEntries(reconciliation.details.map(item => [item.kind, item.charged])),
        { electricity: 480, 'member-fee': 25, water: 50 });
      await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT, fullPage: true });
      assert.deepEqual(unexpected, []);
      assert.deepEqual(errors, []);
      console.log('PASS: simultaneous confirmations returned Posted and Replayed with one saved snapshot');
      return;
    }
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
