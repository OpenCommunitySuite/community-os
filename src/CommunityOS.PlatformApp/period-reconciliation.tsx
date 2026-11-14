import { useState } from 'react';
import { money } from './billing';
import { debtKinds } from './account-statement';
import { csvAmount, csvText, downloadCsv } from './report-csv';

type Line = { kind: string; charged: number; settled: number; outstanding: number; excess: number };
type Report = { totals: Line[]; details: (Line & { obligationId: string; account: string; currentAccount: string })[] };
const columns = ['charged', 'settled', 'outstanding', 'excess'] as const;

export function PeriodReconciliation({ endpoint, from, until, openStatement }: {
  endpoint: string; from: string; until: string; openStatement: (account: string) => Promise<void>;
}) {
  const [report, setReport] = useState<Report>();
  const [account, setAccount] = useState('');
  const accounts = [...new Set(report?.details.map(row => row.account))];
  const rows = report?.details.filter(row => !account || row.account === account) ?? [];
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [opening, setOpening] = useState(false);
  const [statementFailed, setStatementFailed] = useState(false);
  const totals = report?.totals ?? [];
  const totalCents = columns.map(column => totals.reduce((sum, line) => sum + Math.round(line[column] * 100), 0));

  function download() {
    const line = (type: string, number: string, kind: string, amounts: number[]) =>
      [type, from, until, number, kind].map(csvText).concat(amounts.map(csvAmount)).join(';');
    const amounts = (row: Line) => columns.map(column => Math.round(row[column] * 100));
    downloadCsv(`reconciliation-${from}-${until}.csv`, [
      'Тип рядка;Початок періоду;Кінець періоду;Рахунок;Вид;Нараховано (грн);Погашено (грн);Залишок боргу (грн);Надлишок застосованої оплати (грн)',
      ...totals.map(row => line('Підсумок за видом', '', debtKinds[row.kind], amounts(row))),
      line('Підсумок за періодом', '', 'Усього', totalCents),
      ...rows.map(row => line('Зобов’язання', row.account, debtKinds[row.kind], amounts(row))),
    ]);
  }

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

  async function showStatement(account: string) {
    setOpening(true);
    setStatementFailed(false);
    try {
      await openStatement(account);
    } catch {
      setStatementFailed(true);
    } finally {
      setOpening(false);
    }
  }

  return <details>
    <summary>Звірка розрахункового періоду</summary>
    <button type="button" disabled={busy} onClick={() => void load()}>Завантажити поточну звірку</button>
    {failed && <p role="alert">Не вдалося завантажити звірку.</p>}
    {statementFailed && <p role="alert">Не вдалося відкрити виписку. Перевірте доступ і повторіть спробу.</p>}
    {report && <>
    <table>
      <caption>Поточні залишки зобов’язань періоду</caption>
      <thead><tr><th>Вид</th><th>Нараховано</th><th>Погашено</th><th>Залишок боргу</th><th>Надлишок застосованої оплати</th></tr></thead>
      <tbody>{report.totals.map(line => <tr key={line.kind}><th scope="row">{debtKinds[line.kind]}</th>
        {columns.map(column => <td key={column}>{money.format(line[column])}</td>)}</tr>)}</tbody>
      <tfoot><tr><th scope="row">Усього</th>{totalCents.map((amount, index) =>
        <td key={columns[index]}>{money.format(amount / 100)}</td>)}</tr></tfoot>
    </table>
    <label>Особовий рахунок для звірки <select value={account} onChange={event => setAccount(event.target.value)}>
      <option value="">Усі рахунки</option>
      {accounts.map(number => <option key={number} value={number}>{number}</option>)}
    </select></label>
    <button type="button" onClick={download}>Завантажити звірку CSV</button>
    {rows.length ? <table>
      <caption>Зобов’язання за особовими рахунками</caption>
      <thead><tr><th>Рахунок</th><th>Вид</th><th>Нараховано</th><th>Погашено</th><th>Залишок боргу</th><th>Надлишок застосованої оплати</th></tr></thead>
      <tbody>{rows.map(row => <tr key={row.obligationId}>
        <th scope="row"><button type="button" disabled={opening}
          aria-label={`Відкрити виписку за рахунком ${row.account}`}
          onClick={() => void showStatement(row.currentAccount)}>{row.account}</button></th><td>{debtKinds[row.kind]}</td>
        {columns.map(column => <td key={column}>{money.format(row[column])}</td>)}
      </tr>)}</tbody>
    </table> : <p>У проведеному періоді немає зобов’язань.</p>}
    </>}
  </details>;
}
