import { money } from './billing';

type Electricity = { id: string; accountNumber: string; originalAmount: number; effectiveAmount: number };
type Fee = { account: string; amount: number };

export function AccrualSummary({ electricity, fees }: { electricity: Electricity[]; fees: Fee[] }) {
  const cents = (amount: number) => Math.round(amount * 100);
  const rows = [
    ...electricity.map(item => ({ id: item.id, account: item.accountNumber, kind: 'Електроенергія',
      original: cents(item.originalAmount), current: cents(item.effectiveAmount) })),
    ...fees.map(item => ({ id: 'fee:' + item.account, account: item.account, kind: 'Членський внесок',
      original: cents(item.amount), current: cents(item.amount) })),
  ].sort((a, b) => a.account.localeCompare(b.account, 'uk-UA'));
  const original = rows.reduce((total, item) => total + item.original, 0);
  const current = rows.reduce((total, item) => total + item.current, 0);
  const amounts = (initial: number, effective: number) => <>
    <td>{money.format(initial / 100)}</td><td>{money.format(effective / 100)}</td>
    <td>{money.format((effective - initial) / 100)}</td>
  </>;

  return <details>
    <summary>Зведення нарахувань</summary>
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
