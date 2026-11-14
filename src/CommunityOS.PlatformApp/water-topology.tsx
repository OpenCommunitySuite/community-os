import { useState } from 'react';

type Point = { id: string; designation: string; plotId: string | null };
type Placement = { pointId: string; parentId: string | null };
type Topology = { startsOn: string; points: Placement[] };

export function WaterTopology({ points, canSetup, read, post }: {
  points: Point[]; canSetup: boolean; read: <T>(path: string) => Promise<T>;
  post: (path: string, data: object) => Promise<unknown>;
}) {
  const [date, setDate] = useState('');
  const [dates, setDates] = useState<string[]>();
  const [startsOn, setStartsOn] = useState('');
  const [root, setRoot] = useState('');
  const [parents, setParents] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Topology | null>();
  const [source, setSource] = useState<Topology>();
  const [error, setError] = useState('');
  const [reassigned, setReassigned] = useState(0);
  const [busy, setBusy] = useState(false);
  const common = points.filter(point => !point.plotId);
  const names = new Map(points.map(point => [point.id, point.designation]));
  const publishedRoot = result?.points.find(point => point.parentId === null);
  const draft = new Map<string, string | null>(
    Object.entries(parents).filter(([id, parent]) => id !== root && parent));
  if (root) draft.set(root, null);
  const original = new Map(source?.points.map(point => [point.pointId, point.parentId]));
  const changes = [...new Set([...original.keys(), ...draft.keys()])]
    .filter(id => original.get(id) !== draft.get(id));

  function placementLabel(parent: string | null | undefined) {
    if (parent === undefined) return 'поза деревом';
    if (parent === null) return 'загальна точка';
    return names.get(parent) ?? parent;
  }

  function changeParent(pointId: string, parentId: string) {
    const next = { ...parents, [pointId]: parentId };
    let moved = 0;
    if (!parentId) {
      for (const [childId, parent] of Object.entries(parents)) {
        if (parent === pointId) {
          next[childId] = root;
          moved++;
        }
      }
    }
    setParents(next);
    setReassigned(moved);
  }

  async function loadDates() {
    setBusy(true);
    setError('');
    try {
      setDates(await read<string[]>('/topology/dates'));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Історія дерева недоступна.');
    } finally {
      setBusy(false);
    }
  }

  async function run(publish: boolean, selectedDate = date) {
    setBusy(true);
    setError('');
    try {
      if (publish) {
        const placements = [...draft].map(([pointId, parentId]) => ({ pointId, parentId }));
        await post('/topology', { startsOn, points: placements });
        setDate(startsOn);
        setReassigned(0);
        setDates(undefined);
      }
      setResult(await read<Topology | null>('/topology?date=' + encodeURIComponent(publish ? startsOn : selectedDate)));
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
    {' '}<button type="button" disabled={busy} onClick={() => void loadDates()}>Показати історію версій</button>
    {dates?.length === 0 && <p>Опублікованих версій немає.</p>}
    {dates && dates.length > 0 && <label>Опубліковані версії <select value={dates.includes(date) ? date : ''}
      disabled={busy} onChange={event => {
        const selected = event.target.value;
        setDate(selected);
        setResult(undefined);
        void run(false, selected);
      }}>
      <option value="" disabled>Оберіть дату версії</option>
      {dates.map(day => <option key={day} value={day}>{day}</option>)}
    </select></label>}
    {canSetup && <fieldset disabled={busy}>
      <legend>Нова версія дерева води</legend>
      <label>Дата набрання чинності <input type="date" value={startsOn}
        onChange={event => setStartsOn(event.target.value)} /></label>{' '}
      <label>Загальна точка <select value={root} onChange={event => {
        setRoot(event.target.value);
        setParents({});
        setReassigned(0);
      }}>
        <option value="">Оберіть загальну точку</option>
        {common.map(point => <option key={point.id} value={point.id}>{point.designation}</option>)}
      </select></label>
      {root && points.filter(point => point.id !== root).map(point => <div key={point.id}>
        <label>Батьківська точка для {point.designation} <select value={parents[point.id] ?? ''}
          onChange={event => changeParent(point.id, event.target.value)}>
          <option value="">Поза цією версією</option>
          {common.filter(candidate => candidate.id === root || (point.plotId && parents[candidate.id] === root))
            .map(candidate => <option key={candidate.id} value={candidate.id}>{candidate.designation}</option>)}
        </select></label>
      </div>)}
      {reassigned > 0 && <p role="status">Підключено безпосередньо до загальної точки. Ділянок перенесено: {reassigned}.</p>}
      {source && <section aria-label="Зміни у новій версії">
        <p>Зміни порівняно з версією від <time dateTime={source.startsOn}>{source.startsOn}</time></p>
        {changes.length === 0 ? <p>Зв’язки не змінилися.</p> : <ul>{changes.map(id => <li key={id}>
          {names.get(id) ?? id}{' · '}{placementLabel(original.get(id))}{' → '}{placementLabel(draft.get(id))}
        </li>)}</ul>}
      </section>}
      <button type="button" disabled={!startsOn || !root} onClick={() => void run(true)}>Опублікувати дерево</button>
    </fieldset>}
    {error && <p role="alert">{error}</p>}
    {result === null && <p>На цю дату дерево не опубліковано.</p>}
    {result && <section aria-label="Опубліковане дерево води"><p>Діє з {result.startsOn}</p>{branch(null)}
      {canSetup && publishedRoot && <button type="button" disabled={busy} onClick={() => {
        setSource(result);
        setRoot(publishedRoot.pointId);
        setParents(Object.fromEntries(result.points.flatMap(point => point.parentId ? [[point.pointId, point.parentId]] : [])));
        setStartsOn('');
        setError('');
        setReassigned(0);
      }}>Скопіювати зв’язки в нову версію</button>}
    </section>}
  </details>;
}
