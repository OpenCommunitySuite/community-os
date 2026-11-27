const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { chromium } = require('playwright');
const p24Dbf = require('./p24_dbf_fixture.cjs');

async function preparePayment(api, base, { bankAccountId, payerId, accountId }, statement) {
  async function read(path) {
    const response = await api.get(path);
    assert.equal(response.status(), 200, `GET ${path}`);
    return response.json();
  }
  const { token } = await read('/platform/csrf');
  async function post(path, data, headers) {
    const response = await api.post(base + path, { data, headers: { 'X-Platform-CSRF': token, ...headers } });
    assert.equal(response.status(), 200, `POST ${path}`);
    return response.json();
  }
  const charge = { requestId: randomUUID(), accounts: [accountId], amount: 100, dueOn: '2026-02-01',
    purpose: 'Synthetic P24 charge', reason: 'Synthetic DBF fixture' };
  const plan = await post('/one-off/preview', charge);
  assert.equal(plan.ready, true);
  assert.equal(plan.total, 100);
  assert.equal((await post('/one-off/post', { input: charge, digest: plan.digest })).outcome, 'Posted');
  const before = await read(base + '/payments/');
  assert.equal(before.payments.length, 0);
  assert.equal(before.obligations.length, 1);
  const { id: obligationId, outstanding } = before.obligations[0];
  assert.equal(outstanding, 100);

  const bank = `/bank/${bankAccountId}`;
  const preview = await post(bank + '/preview', statement);
  assert.equal(preview.outcome, 'Ready');
  assert.deepEqual(preview.rows.map(({ status, row }) => [status, row.direction, row.amount]), [['New', 'incoming', 60]]);
  assert.equal((await post(bank + '/import', statement, { 'X-Bank-Preview': preview.digest })).outcome, 'Imported');
  const { transactions } = await read(base + '/bank/');
  assert.equal(transactions.length, 1);
  assert.equal(transactions[0].format, 'p24-dbf');
  const transactionId = transactions[0].id;
  const recognized = await post('/bank/recognize', { transactionId, payerId, reason: 'Synthetic DBF recognition' });
  assert.equal(recognized.outcome, 'Recognized');
  const paymentId = recognized.id;
  const allocation = { requestId: randomUUID(), paymentId, reason: 'Synthetic DBF allocation',
    lines: [{ obligationId, amount: 60 }] };
  const distribution = await post('/payments/preview', allocation);
  assert.equal(distribution.outcome, 'Ready');
  assert.equal((await post('/payments/allocate', { input: allocation, digest: distribution.digest })).outcome, 'Allocated');
  console.log('PASS: posted 100 UAH, imported, recognized and allocated 60 UAH');
  return { paymentId, obligationId };
}

async function checkBankDbfConflict({ page, base, bankAccountId, externalId, paymentId, obligationId, duplicate, conflict }) {
  const bank = page.getByRole('region', { name: 'Банківська виписка', exact: true });
  const read = async path => {
    const result = await page.evaluate(async url => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Read failed: ${response.status}`);
      return response.json();
    }, path);
    return result;
  };
  const verifyFacts = async () => {
    const desk = await read(base + '/bank/');
    assert.equal(desk.transactions.length, 1);
    const transaction = desk.transactions[0];
    assert.deepEqual([transaction.bankAccountId, transaction.externalId, transaction.amount, transaction.paymentId],
      [bankAccountId, externalId, 60, paymentId]);
    const payments = await read(base + '/payments/');
    assert.equal(payments.payments.length, 1);
    const payment = payments.payments[0];
    assert.deepEqual([payment.id, payment.amount, payment.available, payment.allocations.length], [paymentId, 60, 0, 1]);
    assert.equal(payment.bankTransactionId, transaction.id);
    assert.deepEqual(payment.allocations[0].lines, [{ obligationId, amount: 60 }]);
    assert.equal(payments.obligations.length, 1);
    assert.deepEqual([payments.obligations[0].id, payments.obligations[0].outstanding], [obligationId, 40]);
    return { desk, payments };
  };

  const before = await verifyFacts();
  const [deskResponse] = await Promise.all([
    page.waitForResponse(response => response.request().method() === 'GET' && new URL(response.url()).pathname === base + '/bank/'),
    bank.getByRole('button', { name: 'Завантажити банківські рахунки й операції', exact: true }).click(),
  ]);
  assert.equal(deskResponse.status(), 200);
  await bank.getByRole('combobox', { name: /^Банківський рахунок/ }).selectOption(bankAccountId);
  const file = bank.getByLabel('Файл виписки (CSV або DBF)', { exact: true });
  const preview = bank.getByRole('button', { name: 'Переглянути виписку', exact: true });
  const table = bank.getByRole('table', { name: 'Рядки виписки', exact: true });
  const row = table.getByRole('row').filter({ has: page.getByRole('cell', { name: externalId, exact: true }) });
  const confirm = bank.getByRole('button', { name: 'Підтвердити імпорт виписки', exact: true });
  const checkPreview = async (buffer, name, outcome, status, amount) => {
    await file.setInputFiles({ name, mimeType: 'application/octet-stream', buffer });
    const [response] = await Promise.all([
      page.waitForResponse(response => response.request().method() === 'POST' &&
        new URL(response.url()).pathname === `${base}/bank/${bankAccountId}/preview`),
      preview.click(),
    ]);
    assert.equal(response.status(), 200);
    const result = await response.json();
    assert.equal(result.outcome, outcome);
    assert.equal(result.rows.length, 1);
    assert.deepEqual([result.rows[0].status, result.rows[0].row.externalId, result.rows[0].row.amount],
      [status, externalId, amount]);
  };
  await checkPreview(duplicate, 'duplicate.dbf', 'Ready', 'Duplicate', 60);
  await row.getByText('Дублікат', { exact: true }).waitFor();
  await confirm.and(page.locator(':enabled')).waitFor();
  console.log('Спостережено: «Дублікат», кнопка «Підтвердити імпорт виписки» доступна');

  await checkPreview(conflict, 'conflict.dbf', 'InvalidRows', 'Conflict', 65);
  await row.getByText('Дані операції відрізняються', { exact: true }).waitFor();
  assert.equal(await confirm.count(), 0);
  console.log('Спостережено: «Дані операції відрізняються», кнопка «Підтвердити імпорт виписки» відсутня');

  // Changing the file exits the preview without submitting an import.
  await file.setInputFiles([]);
  await table.waitFor({ state: 'detached' });
  assert.deepEqual(await verifyFacts(), before);
  console.log('PASS: one linked bank operation, payment and allocation of 60 UAH; debt stays 40 UAH');
}

async function main() {
  const origin = process.env.STAND_ORIGIN;
  const community = process.env.STAND_COMMUNITY;
  const bankAccountId = process.env.STAND_BANK_ACCOUNT;
  const base = '/community/billing/' + community;
  const externalId = 'p24-regression';
  const fixture = { iban: process.env.STAND_IBAN, externalId };
  const duplicate = p24Dbf({ ...fixture, amount: 60 });
  const conflict = p24Dbf({ ...fixture, amount: 65 });
  const browser = await chromium.launch({ channel: 'msedge' });
  try {
    const context = await browser.newContext({ baseURL: origin, ignoreHTTPSErrors: true, serviceWorkers: 'block' });
    await context.addCookies([{ name: '__Host-communityos-platform', value: process.env.STAND_PROBE_COOKIE,
      url: origin, secure: true, httpOnly: true }]);
    const { paymentId, obligationId } = await preparePayment(context.request, base, {
      bankAccountId, payerId: process.env.STAND_PAYER, accountId: process.env.STAND_PERSONAL_ACCOUNT,
    }, duplicate);

    const previewUrl = `${origin}${base}/bank/${bankAccountId}/preview`;
    const blocked = [];
    let previews = 0;
    await context.route('**/*', async route => {
      const request = route.request();
      if (request.method() === 'GET') return route.continue();
      if (request.method() === 'POST' && request.url() === previewUrl) {
        previews++;
        return route.continue();
      }
      blocked.push(`${request.method()} ${new URL(request.url()).pathname}`);
      return route.abort();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/community/');
    await page.locator('select').first().selectOption(community);
    await checkBankDbfConflict({ page, base, bankAccountId, externalId, paymentId, obligationId, duplicate, conflict });
    assert.equal(previews, 2);
    assert.deepEqual(blocked, [], 'The browser must not attempt confirmation or other mutations');
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
