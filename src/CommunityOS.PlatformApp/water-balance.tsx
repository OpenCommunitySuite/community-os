import { useState } from 'react';
import { csvText, downloadCsv } from './report-csv';

type Point = { id: string; parentId: string | null; designation: string; volume: number | null; missingStart: boolean; missingEnd: boolean };
type Branch = { id: string; childrenVolume: number | null; difference: number | null };
type Balance = { outcome: string; points: Point[]; branches: Branch[] };
const volume = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 3 });
const amount = (value: number | null) => value === null ? '—' : volume.format(value);
const csvVolume = (value: number | null) => value === null ? '' : value.toFixed(3).replace('.', ',');
const missing = (point: Point) => [point.missingStart && 'Початкове', point.missingEnd && 'Кінцеве'].filter(Boolean).join(', ');

export function WaterBalance({ read }: { read: (path: string) => Promise<Balance> }) {
  const [calculation, setCalculation] = useState<{ result: Balance; from: string; until: string }>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('');
  const result = calculation?.result;
  const names = new Map(result?.points.map(point => [point.id, point.designation]));
  const branches = new Map(result?.branches.map(branch => [branch.id, branch]));
  const parentName = (point: Point) => point.parentId ? names.get(point.parentId) ?? point.parentId : '';
  const points = result?.points ?? [];
  const parents = new Map(points.map(point => [point.id, point.parentId]));
  const visible = points.filter(point => {
    if (!selectedBranch) return true;
    for (let id: string | null | undefined = point.id; id; id = parents.get(id))
      if (id === selectedBranch) return true;
    return false;
  });

  function download() {
    if (!calculation || calculation.result.outcome !== 'Ready') return;
    const { from, until } = calculation;
    downloadCsv(`water-balance-${from}-${until}.csv`, [
      'Початок;Кінець;Точка;Батьківська точка;Обсяг (м³);Прямі гілки (м³);Різниця (м³);Відсутні показання',
      ...visible.map(point => {
        const branch = branches.get(point.id);
        return [...[from, until, point.designation, parentName(point)].map(csvText), csvVolume(point.volume),
          csvVolume(branch?.childrenVolume ?? null), csvVolume(branch?.difference ?? null), csvText(missing(point))].join(';');
      }),
    ]);
  }
  return <details>
    <summary>Звірка обсягів води</summary>
    <form onChange={() => { setCalculation(undefined); setSelectedBranch(''); setError(''); }} onSubmit={event => {
      event.preventDefault();
      const fields = new FormData(event.currentTarget);
      const from = String(fields.get('from'));
      const until = String(fields.get('until'));
      setCalculation(undefined);
      setSelectedBranch('');
      setError('');
      if (from >= until) {
        setError('Початкова дата має передувати кінцевій.');
        return;
      }
      setBusy(true);
      void read('/balance?' + new URLSearchParams({ from, until })).then(result => setCalculation({ result, from, until }))
        .catch(() => setError('Не вдалося отримати звірку. Перевірте дати й доступ.')).finally(() => setBusy(false));
    }}>
      <fieldset disabled={busy}>
        <label>Початок звірки води <input name="from" type="date" required /></label>{' '}
        <label>Кінець звірки води <input name="until" type="date" required /></label>{' '}
        <button>Розрахувати звірку води</button>
      </fieldset>
    </form>
    {error && <p role="alert">{error}</p>}
    {result?.outcome === 'NoTopology' && <p>На початкову дату немає опублікованого дерева.</p>}
    {result?.outcome === 'TopologyChanged' && <p>Дерево змінювалося всередині інтервалу. Розділіть період на дату зміни.</p>}
    {result?.outcome === 'Ready' && <>
    <label>Гілка для звірки <select value={selectedBranch} onChange={event => setSelectedBranch(event.target.value)}>
      <option value="">Усе дерево</option>
      {points.filter(point => branches.has(point.id)).map(point => <option key={point.id} value={point.id}>{point.designation}</option>)}
    </select></label>{' '}
    <button type="button" onClick={download}>Завантажити звірку води CSV</button>
    <table>
      <caption>Обсяги за точками, м³</caption>
      <thead><tr><th>Точка</th><th>Батьківська точка</th><th>Обсяг</th><th>Прямі гілки</th><th>Різниця</th><th>Відсутні показання</th></tr></thead>
      <tbody>{visible.map(point => {
        const branch = branches.get(point.id);
        return <tr key={point.id}><th scope="row">{point.designation}</th>
          <td>{parentName(point) || '—'}</td><td>{amount(point.volume)}</td>
          <td>{amount(branch?.childrenVolume ?? null)}</td><td>{amount(branch?.difference ?? null)}</td>
          <td>{missing(point) || '—'}</td>
        </tr>;
      })}</tbody>
    </table></>}
  </details>;
}
