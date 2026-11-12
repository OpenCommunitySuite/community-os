import { useState } from 'react';

type Point = { id: string; designation: string };
type Placement = { pointId: string; depth: number; parentPointId: string | null; substationId: string | null };
type Topology = { startsOn: string; points: (Point & Omit<Placement, 'pointId'> & { substationDesignation: string | null })[] };

export function MeteringTopology({ canPublish, commonPoints, individualPoints, read, publish }: {
  canPublish: boolean; commonPoints: Point[]; individualPoints: Point[];
  read: (date: string) => Promise<Topology | null>; publish: (data: object) => Promise<Response>;
}) {
  const [topology, setTopology] = useState<Topology | null>();
  const [stations, setStations] = useState<Point[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const points = [...commonPoints, ...individualPoints];

  async function run(action: () => Promise<void>) {
    setPending(true);
    setMessage('');
    try { await action(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Не вдалося виконати запит.'); }
    finally { setPending(false); }
  }

  function editRevision() {
    if (!topology) return;
    setStations([...new Map(topology.points.flatMap(point => point.substationId && point.substationDesignation
      ? [[point.substationId, { id: point.substationId, designation: point.substationDesignation }] as const] : [])).values()]);
    setPlacements(topology.points.map(({ id, depth, parentPointId, substationId }) =>
      ({ pointId: id, depth, parentPointId, substationId })));
  }

  function setPlacement(id: string, target: string) {
    const [kind, targetId] = target.split(':');
    const next = placements.filter(point => point.pointId !== id);
    if (targetId) {
      const depth = kind === 'station' ? 0 : commonPoints.some(point => point.id === id) ? 1 : 2;
      next.push({ pointId: id, depth, substationId: depth === 0 ? targetId : null,
        parentPointId: depth === 0 ? null : targetId });
    }
    setPlacements(next);
  }

  function branches(parent: string | null, station?: string | null) {
    const children = topology?.points.filter(point => point.parentPointId === parent &&
      (parent !== null || point.substationId === station)) ?? [];
    return children.length > 0 && <ul>{children.map(point => <li key={point.id}>
      {point.designation}{branches(point.id)}
    </li>)}</ul>;
  }

  return <details>
    <summary>Дерева точок обліку</summary>
    <form onSubmit={event => {
      event.preventDefault();
      const date = String(new FormData(event.currentTarget).get('date'));
      void run(async () => setTopology(await read(date)));
    }}>
      <label>Дата вимірювання <input name="date" type="date" required /></label>{' '}
      <button disabled={pending}>Показати дерева</button>
    </form>
    {topology === null && <p>На цю дату дерева не опубліковано.</p>}
    {topology && <div>
      <p>Редакція діє з {topology.startsOn}</p>
      {[...new Map(topology.points.filter(point => point.depth === 0)
        .map(point => [point.substationId, point.substationDesignation])).entries()].map(([id, name]) =>
        <section key={id}><h3>{name}</h3>{branches(null, id)}</section>)}
      {topology.points.length === 0 && <p>У редакції немає точок.</p>}
      {canPublish && <button type="button" onClick={editRevision}>Скопіювати до нової редакції</button>}
    </div>}
    {canPublish && <details>
      <summary>Нова редакція дерев</summary>
      <form onSubmit={event => {
        event.preventDefault();
        const designation = String(new FormData(event.currentTarget).get('station')).trim();
        if (designation) {
          setStations([...stations, { id: crypto.randomUUID(), designation }]);
          event.currentTarget.reset();
        }
      }}>
        <label>Назва ТП <input name="station" required maxLength={128} /></label>{' '}
        <button disabled={pending}>Додати ТП</button>
      </form>
      <form onSubmit={event => {
        event.preventDefault();
        const startsOn = String(new FormData(event.currentTarget).get('startsOn'));
        void run(async () => {
          await publish({ startsOn, substations: stations, points: placements });
          setTopology(await read(startsOn));
          setMessage('Редакцію опубліковано.');
        });
      }}>
        <label>Діє з <input name="startsOn" type="date" required /></label>
        <ul>{points.map(point => {
          const common = commonPoints.includes(point);
          const entry = placements.find(item => item.pointId === point.id);
          const current = entry ? entry.depth === 0 ? 'station:' + entry.substationId : 'point:' + entry.parentPointId : '';
          return <li key={point.id}>
            <label>{point.designation}{' '}
              <select value={current} onChange={event => setPlacement(point.id, event.target.value)}>
                <option value="">Поза деревом</option>
                {common && stations.map(station =>
                  <option key={station.id} value={'station:' + station.id}>Корінь · {station.designation}</option>)}
                {commonPoints.filter(parent => parent.id !== point.id &&
                  placements.some(item => item.pointId === parent.id && item.depth === (common ? 0 : 1)))
                  .map(parent => <option key={parent.id} value={'point:' + parent.id}>Під точкою · {parent.designation}</option>)}
                {current.startsWith('point:') && !placements.some(item => item.pointId === entry?.parentPointId &&
                  item.depth === (common ? 0 : 1)) && <option value={current}>Батьківська точка більше недоступна</option>}
              </select>
            </label>
          </li>;
        })}</ul>
        <button disabled={pending}>Опублікувати редакцію</button>
      </form>
    </details>}
    <p role="status">{message}</p>
  </details>;
}
