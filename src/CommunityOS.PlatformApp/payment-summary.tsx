import { useState } from 'react';
import { money } from './billing';
import { csvAmount, csvText, downloadCsv } from './report-csv';

type Receipt = { id: string; payerId: string; receivedOn: string; amount: number; available: number; reason: string;
  bankTransactionId: string | null; cashAcceptance: object | null };

const channels = { bank: 'Банк', cash: 'Каса', manual: 'Ручна реєстрація' };
const channel = (payment: Receipt) => payment.bankTransactionId ? 'bank' : payment.cashAcceptance ? 'cash' : 'manual';
const cents = (amount: number) => Math.round(amount * 100);
const totals = (label: string, rows: Receipt[]) => ({
  label, count: rows.length,
  amount: rows.reduce((sum, row) => sum + cents(row.amount), 0),
  available: rows.reduce((sum, row) => sum + cents(row.available), 0),
});

export function PaymentSummary({ payments, payerNames }: { payments: Receipt[]; payerNames: Map<string, string> }) {
  const [from, setFrom] = useState('');
  const [through, setThrough] = useState('');
  const [payer, setPayer] = useState('');
  const invalid = Boolean(from && through && from > through);
  const names = new Map<string, number>();
  for (const name of payerNames.values()) names.set(name, (names.get(name) ?? 0) + 1);
  const rows = payments.filter(payment => (!payer || payment.payerId === payer) &&
    (!from || payment.receivedOn >= from) && (!through || payment.receivedOn <= through));
  const groups = Object.entries(channels).map(([key, label]) => totals(label, rows.filter(row => channel(row) === key)));
  const grandTotal = totals('Усього', rows);
  const cells = (group: typeof grandTotal) => <>
    <th scope="row">{group.label}</th><td>{group.count}</td>
    <td>{money.format(group.amount / 100)}</td><td>{money.format(group.available / 100)}</td>
  </>;

  function download() {
    const dates = [csvText(from), csvText(through)];
    const line = (type: string, date: string, label: string, count: number, amount: number, available: number) =>
      [csvText(type), ...dates, csvText(date), csvText(label), count, csvAmount(amount), csvAmount(available)].join(';');
    downloadCsv(`payments-${from || 'all'}-${through || 'all'}${payer ? '-selected' : ''}.csv`, [
      'Тип рядка;Дата отримання з;Дата отримання до;Дата отримання;Джерело;Платежі;Чинна сума (грн);Поточний нерозподілений залишок (грн)',
      ...groups.map(group => line('Підсумок за джерелом', '', group.label, group.count, group.amount, group.available)),
      line('Загальний підсумок', '', grandTotal.label, grandTotal.count, grandTotal.amount, grandTotal.available),
      ...rows.map(row => line('Платіж', row.receivedOn, channels[channel(row)], 1, cents(row.amount), cents(row.available))),
    ]);
  }

  return <details>
    <summary>Звіт про надходження</summary>
    <label>Дата отримання з <input type="date" value={from} onChange={event => setFrom(event.target.value)} /></label>{' '}
    <label>Дата отримання до <input type="date" value={through} onChange={event => setThrough(event.target.value)} /></label>{' '}
    <label>Платник для звіту <select value={payer} onChange={event => setPayer(event.target.value)}>
      <option value="">Усі платники</option>
      {[...payerNames].map(([id, name]) => <option key={id} value={id}>{names.get(name) === 1 ? name : `${name} · ${id}`}</option>)}
    </select></label>
    {invalid ? <p role="alert">Початкова дата має передувати кінцевій або збігатися з нею.</p> : <>
      <button type="button" onClick={download}>Завантажити надходження CSV</button>
      <table>
        <caption>Підсумки надходжень</caption>
        <thead><tr><th>Джерело</th><th>Платежі</th><th>Чинна сума</th><th>Поточний нерозподілений залишок</th></tr></thead>
        <tbody>{groups.map(group => <tr key={group.label}>{cells(group)}</tr>)}</tbody>
        <tfoot><tr>{cells(grandTotal)}</tr></tfoot>
      </table>
      {rows.length === 0 ? <p>За вибраними умовами надходжень немає.</p> :
        <table>
          <caption>Платежі за вибраний період</caption>
          <thead><tr><th>Дата отримання</th><th>Платник</th><th>Джерело</th><th>Підстава</th><th>Чинна сума</th><th>Поточний залишок</th></tr></thead>
          <tbody>{rows.map(row => <tr key={row.id}><td>{row.receivedOn}</td><td>{payerNames.get(row.payerId)}</td><td>{channels[channel(row)]}</td>
            <td>{row.reason}</td><td>{money.format(row.amount)}</td><td>{money.format(row.available)}</td></tr>)}</tbody>
        </table>}
    </>}
  </details>;
}
