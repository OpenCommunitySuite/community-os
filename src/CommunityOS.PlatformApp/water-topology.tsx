import { useState } from 'react';

type Point = { id: string; designation: string; plotId: string | null };
type Placement = { pointId: string; parentId: string | null };
type Topology = { startsOn: string; points: Placement[] };

export function WaterTopology({ points, canSetup, read, post }: {
  points: Point[]; canSetup: boolean; read: (path: string) => Promise<Topology | null>;
  post: (path: string, data: object) => Promise<unknown>;
}) {
  const [date, setDate] = useState('');
  const [root, setRoot] = useState('');
  const [parents, setParents] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Topology | null>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const common = points.filter(point => !point.plotId);
  const names = new Map(points.map(point => [point.id, point.designation]));

  async function run(publish: boolean) {
    setBusy(true);
    setError('');
    try {
      if (publish) {
        const placements: Placement[] = [{ pointId: root, parentId: null }];
        for (const [pointId, parentId] of Object.entries(parents))
          if (pointId !== root && parentId) placements.push({ pointId, parentId });
        await post('/topology', { startsOn: date, points: placements });
      }
      setResult(await read('/topology?date=' + encodeURIComponent(date)));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Дерево недоступне.');
    } finally {
      setBusy(false);
    }
  }

  function branch(parent: string | null) {
    const children = result?.points.filter(point => point.parentId === parent) ?? [];
    return children.length > 0 && <ul>{children.map(point => <li key={point.pointId}>
      {names.get(point.pointId) ?? point.pointId}{branch(point.pointId)}
    </li>)}</ul>;
  }

  return <details>
    <summary>Дерево обліку води</summary>
    <label>Дата дерева води <input type="date" value={date} onChange={event => {
      setDate(event.target.value);
      setResult(undefined);
    }} disabled={busy} /></label>{' '}
    <button type="button" disabled={!date || busy} onClick={() => void run(false)}>Показати дерево</button>
    {canSetup && <fieldset disabled={busy}>
      <legend>Нова версія дерева води</legend>
      <label>Загальна точка <select value={root} onChange={event => {
        setRoot(event.target.value);
        setParents({});
      }}>
        <option value="">Оберіть загальну точку</option>
        {common.map(point => <option key={point.id} value={point.id}>{point.designation}</option>)}
      </select></label>
      {root && points.filter(point => point.id !== root).map(point => <div key={point.id}>
        <label>Батьківська точка для {point.designation} <select value={parents[point.id] ?? ''}
          onChange={event => setParents({ ...parents, [point.id]: event.target.value })}>
          <option value="">Поза цією версією</option>
          {common.filter(candidate => candidate.id === root || (point.plotId && parents[candidate.id] === root))
            .map(candidate => <option key={candidate.id} value={candidate.id}>{candidate.designation}</option>)}
        </select></label>
      </div>)}
      <button type="button" disabled={!date || !root} onClick={() => void run(true)}>Опублікувати дерево</button>
    </fieldset>}
    {error && <p role="alert">{error}</p>}
    {result === null && <p>На цю дату дерево не опубліковано.</p>}
    {result && <section aria-label="Опубліковане дерево води"><p>Діє з {result.startsOn}</p>{branch(null)}</section>}
  </details>;
}
