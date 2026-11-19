// Exercise the real water charge form with GET-only network traffic in an isolated community.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const readline = require('node:readline');

(async () => {
  const origin = 'https://127.0.0.1:5543';
  const community = process.env.STAND_COMMUNITY;
  const tariff = process.env.STAND_WATER_PREVIEW_TARIFF;
  assert.match(community, /^[0-9a-f-]{36}$/);
  assert.match(tariff, /^[0-9a-f-]{36}$/);
  const billing = `/community/billing/${community}`;
  const water = `/community/water/${community}`;
  const communitiesPath = '/community/register/communities';
  const browser = await chromium.launch({ channel: 'msedge' });
  try {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, serviceWorkers: 'block' });
    await context.addCookies([{ name: '__Host-communityos-platform', value: process.env.STAND_PROBE_COOKIE,
      url: origin, secure: true, httpOnly: true }]);
    const unexpected = [];
    await context.route('**/*', async route => {
      const request = route.request();
      if (new URL(request.url()).origin !== origin || request.method() !== 'GET') {
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
    const reply = path => page.waitForResponse(response => new URL(response.url()).pathname === path);
    const get = path => page.evaluate(async path => {
      const response = await fetch(path);
      if (!response.ok) throw new Error('Synthetic preview source unavailable');
      return response.json();
    }, path);

    const communities = reply(communitiesPath);
    await page.goto(origin + '/community/');
    const grants = (await (await communities).json()).find(item => item.id === community);
    assert.ok(grants.canReadBilling && grants.canReadWater);
    assert.equal(grants.canPostBilling, false);
    await page.locator('select').first().selectOption(community);
    const area = page.locator('details').filter({
      has: page.locator(':scope > summary', { hasText: /^Попередній розрахунок за воду$/ }),
    });
    await area.locator(':scope > summary').click();
    const accountsReply = reply(billing + '/water-accounts');
    await area.getByRole('button', { name: 'Завантажити рахунки для води', exact: true }).click();
    const response = await accountsReply;
    assert.equal(response.status(), 200);
    const accounts = await response.json();
    assert.equal(accounts.length, 1);
    const [account] = accounts;
    assert.equal(account.number, 'WATER-001');
    await area.getByLabel(/^Рахунок для розрахунку води/).selectOption(account.id);
    const points = await get(water + '/points');
    assert.equal(points.length, 1);
    const history = await get(`${water}/points/${points[0].id}/installations`);
    assert.equal(history.length, 2);
    const [current, old] = history;
    assert.equal(old.endsBefore, '2026-01-20');
    assert.equal(current.startsOn, old.endsBefore);
    const readings = id => get(`${water}/installations/${id}/readings`);
    const oldSeries = await readings(old.id);
    const currentSeries = await readings(current.id);
    const before = Object.fromEntries(oldSeries.readings.map(item => [item.date, item]));
    assert.equal(before['2026-01-19'].valueExact, '17');
    assert.equal(currentSeries.readings.find(item => item.date === '2026-01-22')?.valueExact, '2');
    assert.equal(before['2026-01-02'], undefined);

    const panel = area.locator('dl[aria-label="Розрахунок за воду"]');
    async function preview(from, until, status = 200) {
      await area.getByLabel('Початок періоду води', { exact: true }).fill(from);
      await area.getByLabel('Кінець періоду води', { exact: true }).fill(until);
      const completed = reply(billing + '/water-preview');
      await area.getByRole('button', { name: 'Розрахувати плату за воду', exact: true }).click();
      const response = await completed;
      const params = new URL(response.url()).searchParams;
      assert.deepEqual(Object.fromEntries(params), { account: account.id, from, until });
      assert.equal(response.status(), status);
      return response;
    }
    async function check(from, until, expected, label, values = {}) {
      const response = await preview(from, until);
      assert.deepEqual(await response.json(), {
        status: expected, accountNumber: account.number, installationId: null, openingReadingId: null,
        closingReadingId: null, volume: null, tariffId: null, basis: null, rate: null, amountUah: null,
        ...values,
      });
      await panel.waitFor();
      const rendered = await panel.evaluate(element =>
        Object.fromEntries([...element.querySelectorAll('dt')].map(term => [term.textContent, term.nextElementSibling.textContent])));
      const fields = { 'Особовий рахунок': account.number, 'Стан': label };
      if (values.volume !== undefined) fields['Обсяг'] = String(values.volume).replace('.', ',') + ' м³';
      if (values.installationId) {
        fields['Установка'] = values.installationId;
        fields['Початкове показання'] = values.openingReadingId;
        fields['Кінцеве показання'] = values.closingReadingId;
      }
      if (values.tariffId) {
        fields['Версія тарифу'] = values.basis + ' · ' + values.tariffId;
        fields['Ставка'] = '20 грн/м³';
        fields['Сума'] = await page.evaluate(amount =>
          new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(amount), values.amountUah);
      }
      assert.deepEqual(rendered, fields);
    }
    function source(from, until, volume) {
      return { installationId: old.id, openingReadingId: before[from].id, closingReadingId: before[until].id, volume };
    }
    const priced = { tariffId: tariff, basis: 'Synthetic water tariff A', rate: 20 };
    const ready = { ...source('2026-01-01', '2026-01-03', 2.5), ...priced, amountUah: 50 };
    await check('2026-01-01', '2026-01-03', 'Ready', 'Готово', ready);
    await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT, fullPage: true });
    await check('2026-01-03', '2026-01-05', 'Ready', 'Готово',
      { ...source('2026-01-03', '2026-01-05', 0), ...priced, amountUah: 0 });
    await check('2026-01-01', '2026-01-02', 'MissingBoundary', 'Бракує граничних показань або змінився лічильник');
    await check('2026-01-19', '2026-01-22', 'MissingBoundary', 'Бракує граничних показань або змінився лічильник');
    await check('2026-01-11', '2026-01-19', 'MissingTariff', 'Немає тарифу', source('2026-01-11', '2026-01-19', 1));
    await check('2026-01-05', '2026-01-08', 'TariffChanges', 'Тариф змінюється в межах періоду',
      source('2026-01-05', '2026-01-08', 1.5));
    await check('2026-01-03', '2026-01-10', 'AmbiguousTariff', 'Кілька чинних тарифів',
      source('2026-01-03', '2026-01-10', 2.5));
    await check('2026-01-01', '2026-01-03', 'Ready', 'Готово', ready);

    const input = readline.createInterface({ input: process.stdin });
    const acknowledged = new Promise(resolve => input.once('line', resolve));
    console.log('REVOKE');
    assert.equal(await acknowledged, 'REVOKED');
    input.close();
    await preview('2026-01-01', '2026-01-03', 403);
    await area.getByRole('alert').filter({ hasText: /^Дозвіл на розрахунок відсутній\.$/ }).waitFor();
    assert.equal(await panel.count(), 0);
    assert.deepEqual(await readings(old.id), oldSeries);
    assert.deepEqual(await readings(current.id), currentSeries);
    const refreshed = reply(communitiesPath);
    await page.reload();
    const after = (await (await refreshed).json()).find(item => item.id === community);
    assert.equal(after.canReadBilling, false);
    assert.equal(after.canReadWater, true);
    await page.locator('select').first().selectOption(community);
    assert.equal(await area.count(), 0);
    assert.deepEqual(unexpected, []);
    assert.deepEqual(errors, []);
    console.log('PASS: real water charge form, exact source references, zero, missing data, tariff refusal and retained water read after revocation');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
