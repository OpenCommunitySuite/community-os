import { money } from './billing';

type Electricity = { id: string; accountNumber: string; originalAmount: number; effectiveAmount: number };
type Fee = { account: string; amount: number };

const csvText = (value: string) => {
  const safe = /^[\s\u0000-\u001f]*[=+@-]|^[\t\r\n]/u.test(value) ? "'" + value : value;
  return '"' + safe.replaceAll('"', '""') + '"';
};
const csvAmount = (cents: number) => (cents / 100).toFixed(2).replace('.', ',');

export function AccrualSummary({ electricity, fees, from, until }: {
  electricity: Electricity[]; fees: Fee[]; from: string; until: string;
}) {
  const cents = (amount: number) => Math.round(amount * 100);
  const rows = [
    ...electricity.map(item => ({ id: item.id, account: item.accountNumber, kind: 'Електроенергія',
      original: cents(item.originalAmount), current: cents(item.effectiveAmount) })),
    ...fees.map(item => ({ id: 'fee:' + item.account, account: item.account, kind: 'Членський внесок',
      original: cents(item.amount), current: cents(item.amount) })),
  ].sort((a, b) => a.account.localeCompare(b.account, 'uk-UA'));
  const original = rows.reduce((total, item) => total + item.original, 0);
  const current = rows.reduce((total, item) => total + item.current, 0);
  function download() {
    const dates = [from, until].map(csvText);
    const line = (account: string, kind: string, initial: number, effective: number) =>
      [...dates, csvText(account), csvText(kind), csvAmount(initial), csvAmount(effective), csvAmount(effective - initial)].join(';');
    const csv = [
      'Початок періоду;Кінець періоду;Рахунок;Вид;Початкова сума (грн);Чинна сума (грн);Різниця (грн)',
      ...rows.map(row => line(row.account, row.kind, row.original, row.current)),
      line('', 'Усього', original, current),
    ].join('\r\n') + '\r\n';
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `accruals-${from}-${until}.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const amounts = (initial: number, effective: number) => <>
    <td>{money.format(initial / 100)}</td><td>{money.format(effective / 100)}</td>
    <td>{money.format((effective - initial) / 100)}</td>
  </>;

  return <details>
    <summary>Зведення нарахувань</summary>
    <button type="button" onClick={download}>Завантажити зведення CSV</button>
    <table>
      <caption>Нарахування проведеного періоду</caption>
      <thead><tr><th>Рахунок</th><th>Вид</th><th>Початкова сума</th><th>Чинна сума</th><th>Різниця</th></tr></thead>
      <tbody>{rows.map(row => <tr key={row.id}>
        <td>{row.account}</td><td>{row.kind}</td>{amounts(row.original, row.current)}
      </tr>)}</tbody>
      <tfoot><tr><th scope="row" colSpan={2}>Усього</th>{amounts(original, current)}</tr></tfoot>
    </table>
  </details>;
}
