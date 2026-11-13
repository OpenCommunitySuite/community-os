import { useState } from 'react';
import { money } from './billing';
import { debtKinds } from './account-statement';

type Line = { kind: string; charged: number; settled: number; outstanding: number; excess: number };
type Report = { totals: Line[]; details: (Line & { obligationId: string; account: string })[] };
const columns = ['charged', 'settled', 'outstanding', 'excess'] as const;

export function PeriodReconciliation({ endpoint }: { endpoint: string }) {
  const [report, setReport] = useState<Report>();
  const [account, setAccount] = useState('');
  const accounts = [...new Set(report?.details.map(row => row.account))];
  const rows = report?.details.filter(row => !account || row.account === account) ?? [];
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function load() {
    setBusy(true);
    setFailed(false);
    setReport(undefined);
    try {
      const response = await fetch(endpoint, { cache: 'no-store' });
      if (!response.ok) throw new Error();
      const data: Report = await response.json();
      setReport(data);
      setAccount(previous => data.details.some(row => row.account === previous) ? previous : '');
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return <details>
    <summary>Звірка розрахункового періоду</summary>
    <button type="button" disabled={busy} onClick={() => void load()}>Завантажити поточну звірку</button>
    {failed && <p role="alert">Не вдалося завантажити звірку.</p>}
    {report && <>
    <table>
      <caption>Поточні залишки зобов’язань періоду</caption>
      <thead><tr><th>Вид</th><th>Нараховано</th><th>Погашено</th><th>Залишок боргу</th><th>Надлишок застосованої оплати</th></tr></thead>
      <tbody>{report.totals.map(line => <tr key={line.kind}><th scope="row">{debtKinds[line.kind]}</th>
        {columns.map(column => <td key={column}>{money.format(line[column])}</td>)}</tr>)}</tbody>
      <tfoot><tr><th scope="row">Усього</th>{columns.map(column =>
        <td key={column}>{money.format(report.totals.reduce((sum, line) => sum + Math.round(line[column] * 100), 0) / 100)}</td>)}</tr></tfoot>
    </table>
    <label>Особовий рахунок для звірки <select value={account} onChange={event => setAccount(event.target.value)}>
      <option value="">Усі рахунки</option>
      {accounts.map(number => <option key={number} value={number}>{number}</option>)}
    </select></label>
    {rows.length ? <table>
      <caption>Зобов’язання за особовими рахунками</caption>
      <thead><tr><th>Рахунок</th><th>Вид</th><th>Нараховано</th><th>Погашено</th><th>Залишок боргу</th><th>Надлишок застосованої оплати</th></tr></thead>
      <tbody>{rows.map(row => <tr key={row.obligationId}>
        <th scope="row">{row.account}</th><td>{debtKinds[row.kind]}</td>
        {columns.map(column => <td key={column}>{money.format(row[column])}</td>)}
      </tr>)}</tbody>
    </table> : <p>У проведеному періоді немає зобов’язань.</p>}
    </>}
  </details>;
}
