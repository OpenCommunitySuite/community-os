const assert = require('node:assert/strict');

module.exports = async function checkPartialPayment({ page, billing, base, reply, get, period, revokeGrant }) {
  const payments = page.getByRole('region', { name: 'Платежі та розподіл', exact: true });
  const deskPath = base + '/payments/';
  const receiptReason = 'Synthetic water payment';
  const allocationReason = 'Synthetic water allocation';
  const receivedOn = '2026-01-07';
  const account = 'WATER-001';
  const reconciliationPath = `${base}/periods/${period.id}/reconciliation`;
  const original = await get(reconciliationPath);
  const water = original.details.find(line => line.kind === 'water');
  assert.ok(water);
  assert.deepEqual([water.account, water.charged, water.settled, water.outstanding, water.excess], [account, 50, 0, 50, 0]);
  const waterId = water.obligationId;

  const loaded = reply(deskPath);
  await payments.getByRole('button', { name: 'Завантажити платежі та зобов’язання', exact: true }).click();
  const before = await (await loaded).json();
  assert.equal(before.payments.length, 0);
  assert.equal(before.obligations.length, 3);
  const target = before.obligations.find(item => item.id === waterId);
  assert.ok(target);
  assert.equal(target.account, account);
  assert.equal(target.outstanding, 50);
  const receipt = payments.getByRole('group', { name: 'Новий платіж', exact: true });
  await receipt.getByLabel(/^Платник/).selectOption(target.payerId);
  await receipt.getByLabel('Дата надходження', { exact: true }).fill(receivedOn);
  await receipt.getByLabel('Сума платежу, грн', { exact: true }).fill('30');
  await receipt.getByLabel('Підстава платежу', { exact: true }).fill(receiptReason);
  await receipt.getByRole('button', { name: 'Переглянути платіж', exact: true }).click();
  const recording = reply(deskPath + 'record', 'POST');
  await payments.getByRole('button', { name: 'Підтвердити реєстрацію платежу', exact: true }).click();
  const recorded = await recording;
  assert.equal(recorded.status(), 200);
  const command = recorded.request().postDataJSON();
  assert.match(command.requestId, /^[0-9a-f-]{36}$/);
  assert.deepEqual(command, { requestId: command.requestId, payerId: target.payerId, receivedOn, amount: 30, reason: receiptReason });
  assert.deepEqual(await recorded.json(), { outcome: 'Recorded', id: command.requestId });
  await payments.getByText('Платіж зареєстровано.', { exact: true }).waitFor();
  const afterRecord = await get(deskPath);
  assert.equal(afterRecord.payments.length, 1);
  assert.equal(afterRecord.payments[0].available, 30);
  assert.deepEqual(afterRecord.obligations, before.obligations);

  const allocation = payments.getByRole('group', { name: 'Розподіл за зобов’язаннями', exact: true });
  await allocation.getByLabel(/^WATER-001 · water · залишок 50,00/).fill('30');
  await allocation.getByLabel('Підстава розподілу', { exact: true }).fill(allocationReason);
  const previewing = reply(deskPath + 'preview', 'POST');
  await allocation.getByRole('button', { name: 'Переглянути розподіл', exact: true }).click();
  const previewed = await previewing;
  assert.equal(previewed.status(), 200);
  const input = previewed.request().postDataJSON();
  assert.match(input.requestId, /^[0-9a-f-]{36}$/);
  const lines = [{ obligationId: waterId, amount: 30 }];
  assert.deepEqual(input, { requestId: input.requestId, paymentId: command.requestId, reason: allocationReason, lines });
  const preview = await previewed.json();
  assert.equal(preview.outcome, 'Ready');
  assert.match(preview.digest, /^[0-9A-F]{64}$/);
  assert.deepEqual([preview.before, preview.after, preview.lines], [30, 0, [{ ...lines[0], account, before: 50, after: 20 }]]);
  await payments.getByText(/WATER-001 · 30,00.*залишок 50,00.*→ 20,00/).waitFor();
  assert.deepEqual(await get(deskPath), afterRecord);

  const allocating = reply(deskPath + 'allocate', 'POST');
  await payments.getByRole('button', { name: 'Підтвердити розподіл', exact: true }).click();
  const allocated = await allocating;
  assert.equal(allocated.status(), 200);
  const confirmation = allocated.request().postDataJSON();
  assert.deepEqual(confirmation, { input, digest: preview.digest });
  assert.deepEqual(await allocated.json(), { outcome: 'Allocated', id: input.requestId });
  await payments.getByText('Розподіл підтверджено.', { exact: true }).waitFor();

  const repeat = () => page.evaluate(async ({ path, body }) => {
    const csrf = await fetch('/platform/csrf');
    if (!csrf.ok) throw new Error('Synthetic CSRF token unavailable');
    const response = await fetch(path, { method: 'POST', headers: {
      'Content-Type': 'application/json', 'X-Platform-CSRF': (await csrf.json()).token,
    }, body: JSON.stringify(body) });
    return { status: response.status, body: response.ok ? await response.json() : null };
  }, { path: deskPath + 'allocate', body: confirmation });
  assert.deepEqual(await repeat(), { status: 200, body: { outcome: 'Replayed', id: input.requestId } });
  await revokeGrant();
  assert.deepEqual(await repeat(), { status: 403, body: null });

  const after = await get(deskPath);
  assert.equal(after.payments.length, 1);
  const [payment] = after.payments;
  assert.deepEqual([payment.id, payment.amount, payment.available, payment.allocations.length], [command.requestId, 30, 0, 1]);
  assert.equal(payment.allocations[0].id, input.requestId);
  assert.deepEqual(payment.allocations[0].lines, lines);
  assert.deepEqual(after.obligations, before.obligations.map(item => item.id === waterId ? { ...item, outstanding: 20 } : item));

  await billing.locator('summary').filter({ hasText: /^Проведені періоди$/ }).click();
  await billing.getByRole('button', { name: 'Завантажити проведені періоди', exact: true }).click();
  const { from, until } = period.snapshot.period;
  await billing.getByRole('button', { name: `Відкрити період ${from} — ${until}`, exact: true }).click();
  await billing.locator('summary').filter({ hasText: /^Звірка розрахункового періоду$/ }).click();
  const reporting = reply(reconciliationPath);
  await billing.getByRole('button', { name: 'Завантажити поточну звірку', exact: true }).click();
  const report = await reporting;
  assert.equal(report.status(), 200);
  const data = await report.json();
  assert.deepEqual(data.details, original.details.map(line => line.obligationId === waterId ? { ...line, settled: 30, outstanding: 20 } : line));

  const byAccount = billing.getByRole('table', { name: 'Зобов’язання за особовими рахунками', exact: true });
  const debtRow = (table, kind) => table.getByRole('row').filter({ has: page.getByRole('cell', { name: kind, exact: true }) });
  const waterRow = debtRow(byAccount, 'Вода');
  await waterRow.waitFor();
  assert.deepEqual((await waterRow.getByRole('cell').allTextContents()).slice(1).map(value => value.split(/\s/)[0]),
    ['50,00', '30,00', '20,00', '0,00']);
  await waterRow.getByRole('button', { name: `Відкрити виписку за рахунком ${account}` }).click();
  await payments.getByRole('heading', { name: `Виписка за особовим рахунком ${account}`, exact: true }).waitFor();
  const statement = payments.getByRole('table', { name: 'Непогашені зобов’язання за рахунком', exact: true });
  for (const [kind, balance] of [['Вода', '20,00'], ['Електроенергія', '480,00'], ['Членський внесок', '25,00']]) {
    assert.equal((await debtRow(statement, kind).getByRole('cell').last().textContent()).split(/\s/)[0], balance);
  }
};
