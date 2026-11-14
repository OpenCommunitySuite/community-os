import type { Ref } from 'react';
import { createPortal } from 'react-dom';
import { money } from './billing';

type Debt = { id: string; account: string; payerId: string; kind: string; dueOn: string; outstanding: number };

export const debtKinds: Record<string, string> = {
  electricity: 'Електроенергія', 'member-fee': 'Членський внесок', 'one-off': 'Разове нарахування',
};

export function AccountStatement({ community, today, debts, payerNames, account, setAccount, detailsRef }: {
  community: string; today: string; debts: Debt[]; payerNames: Map<string, string>;
  account: string; setAccount: (account: string) => void; detailsRef: Ref<HTMLDetailsElement>;
}) {
  const accounts = [...new Set(debts.map(row => row.account))].sort((a, b) => a.localeCompare(b, 'uk-UA'));
  const selected = accounts.includes(account);
  const rows = debts.filter(row => row.account === account);
  const cents = (row: Debt) => Math.round(row.outstanding * 100);
  const sum = (items: Debt[]) => money.format(items.reduce((total, row) => total + cents(row), 0) / 100);
  const statement = selected && <>
    <h2>Виписка за особовим рахунком {account}</h2>
    <p>{community} · Дата звірки за Києвом {today}</p>
    <table>
      <caption>Непогашені зобов’язання за рахунком</caption>
      <thead><tr><th>Платник</th><th>Вид</th><th>Сплатити до</th><th>Залишок</th></tr></thead>
      <tbody>{rows.map(row => <tr key={row.id}>
        <td>{payerNames.get(row.payerId)}</td><td>{debtKinds[row.kind] ?? row.kind}</td>
        <td>{row.dueOn}</td><td>{money.format(row.outstanding)}</td>
      </tr>)}</tbody>
      <tfoot><tr><th scope="row" colSpan={3}>До сплати</th><td>{sum(rows)}</td></tr>
        <tr><th scope="row" colSpan={3}>З них прострочено</th><td>{sum(rows.filter(row => row.dueOn < today))}</td></tr></tfoot>
    </table>
  </>;

  return <details ref={detailsRef}>
    <summary>Виписка за особовим рахунком</summary>
    <label>Особовий рахунок для виписки <select value={selected ? account : ''} onChange={event => setAccount(event.target.value)}>
      <option value="">Оберіть рахунок</option>
      {accounts.map(number => <option key={number} value={number}>{number}</option>)}
    </select></label>
    {accounts.length === 0 && <p>Непогашених зобов’язань немає.</p>}
    {statement}
    {selected && <button type="button" onClick={() => window.print()}>Друкувати виписку</button>}
    {selected && createPortal(<article id="account-statement-print">{statement}</article>, document.body)}
  </details>;
}
