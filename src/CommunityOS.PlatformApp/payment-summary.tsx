import { useState } from 'react';
import { money } from './billing';

type Receipt = { id: string; receivedOn: string; amount: number; available: number; reason: string;
  bankTransactionId: string | null; cashAcceptance: object | null };

const channels = { bank: 'Банк', cash: 'Каса', manual: 'Ручна реєстрація' };
const channel = (payment: Receipt) => payment.bankTransactionId ? 'bank' : payment.cashAcceptance ? 'cash' : 'manual';
const total = (rows: Receipt[], field: 'amount' | 'available') =>
  money.format(rows.reduce((cents, row) => cents + Math.round(row[field] * 100), 0) / 100);

export function PaymentSummary({ payments }: { payments: Receipt[] }) {
  const [from, setFrom] = useState('');
  const [through, setThrough] = useState('');
  const invalid = Boolean(from && through && from > through);
  const rows = payments.filter(payment => (!from || payment.receivedOn >= from) && (!through || payment.receivedOn <= through));

  return <details>
    <summary>Звіт про надходження</summary>
    <label>Дата отримання з <input type="date" value={from} onChange={event => setFrom(event.target.value)} /></label>{' '}
    <label>Дата отримання до <input type="date" value={through} onChange={event => setThrough(event.target.value)} /></label>
    {invalid ? <p role="alert">Початкова дата має передувати кінцевій або збігатися з нею.</p> : <>
      <table>
        <caption>Підсумки надходжень</caption>
        <thead><tr><th>Джерело</th><th>Платежі</th><th>Чинна сума</th><th>Поточний нерозподілений залишок</th></tr></thead>
        <tbody>{Object.entries(channels).map(([key, label]) => {
          const group = rows.filter(row => channel(row) === key);
          return <tr key={key}><th scope="row">{label}</th><td>{group.length}</td><td>{total(group, 'amount')}</td><td>{total(group, 'available')}</td></tr>;
        })}</tbody>
        <tfoot><tr><th scope="row">Усього</th><td>{rows.length}</td><td>{total(rows, 'amount')}</td><td>{total(rows, 'available')}</td></tr></tfoot>
      </table>
      {rows.length === 0 ? <p>За вибраний період надходжень немає.</p> :
        <table>
          <caption>Платежі за вибраний період</caption>
          <thead><tr><th>Дата отримання</th><th>Джерело</th><th>Підстава</th><th>Чинна сума</th><th>Поточний залишок</th></tr></thead>
          <tbody>{rows.map(row => <tr key={row.id}><td>{row.receivedOn}</td><td>{channels[channel(row)]}</td>
            <td>{row.reason}</td><td>{money.format(row.amount)}</td><td>{money.format(row.available)}</td></tr>)}</tbody>
        </table>}
    </>}
  </details>;
}
