import { useState } from 'react';
import { money } from './billing';
import { debtKinds } from './account-statement';

type Line = { kind: string; charged: number; settled: number; outstanding: number; excess: number };
const columns = ['charged', 'settled', 'outstanding', 'excess'] as const;

export function PeriodReconciliation({ endpoint }: { endpoint: string }) {
  const [lines, setLines] = useState<Line[]>();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function load() {
    setBusy(true);
    setFailed(false);
    setLines(undefined);
    try {
      const response = await fetch(endpoint, { cache: 'no-store' });
      if (!response.ok) throw new Error();
      setLines(await response.json());
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
    {lines && <table>
      <caption>Поточні залишки зобов’язань періоду</caption>
      <thead><tr><th>Вид</th><th>Нараховано</th><th>Погашено</th><th>Залишок боргу</th><th>Надлишок застосованої оплати</th></tr></thead>
      <tbody>{lines.map(line => <tr key={line.kind}><th scope="row">{debtKinds[line.kind]}</th>
        {columns.map(column => <td key={column}>{money.format(line[column])}</td>)}</tr>)}</tbody>
      <tfoot><tr><th scope="row">Усього</th>{columns.map(column =>
        <td key={column}>{money.format(lines.reduce((sum, line) => sum + Math.round(line[column] * 100), 0) / 100)}</td>)}</tr></tfoot>
    </table>}
  </details>;
}
