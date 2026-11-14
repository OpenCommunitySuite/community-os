import { useState } from 'react';

type Point = { id: string; parentId: string | null; designation: string; volume: number | null; missingStart: boolean; missingEnd: boolean };
type Branch = { id: string; childrenVolume: number | null; difference: number | null };
type Balance = { outcome: string; points: Point[]; branches: Branch[] };
const volume = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 3 });
const amount = (value: number | null) => value === null ? '—' : volume.format(value);

export function WaterBalance({ read }: { read: (path: string) => Promise<Balance> }) {
  const [result, setResult] = useState<Balance>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const names = new Map(result?.points.map(point => [point.id, point.designation]));
  const branches = new Map(result?.branches.map(branch => [branch.id, branch]));
  return <details>
    <summary>Звірка обсягів води</summary>
    <form onChange={() => { setResult(undefined); setError(''); }} onSubmit={event => {
      event.preventDefault();
      const fields = new FormData(event.currentTarget);
      const from = String(fields.get('from'));
      const until = String(fields.get('until'));
      setResult(undefined);
      setError('');
      if (from >= until) {
        setError('Початкова дата має передувати кінцевій.');
        return;
      }
      setBusy(true);
      void read('/balance?' + new URLSearchParams({ from, until })).then(setResult)
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
    {result?.outcome === 'Ready' && <table>
      <caption>Обсяги за точками, м³</caption>
      <thead><tr><th>Точка</th><th>Батьківська точка</th><th>Обсяг</th><th>Прямі гілки</th><th>Різниця</th><th>Відсутні показання</th></tr></thead>
      <tbody>{result.points.map(point => {
        const branch = branches.get(point.id);
        return <tr key={point.id}><th scope="row">{point.designation}</th>
          <td>{point.parentId ? names.get(point.parentId) : '—'}</td><td>{amount(point.volume)}</td>
          <td>{amount(branch?.childrenVolume ?? null)}</td><td>{amount(branch?.difference ?? null)}</td>
          <td>{[point.missingStart && 'Початкове', point.missingEnd && 'Кінцеве'].filter(Boolean).join(', ') || '—'}</td>
        </tr>;
      })}</tbody>
    </table>}
  </details>;
}
