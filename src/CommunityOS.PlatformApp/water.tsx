import { useEffect, useRef, useState } from 'react';
import { WaterTopology } from './water-topology';
import { WaterBalance } from './water-balance';
import { ReadingImport } from './reading-import';
import { WaterVerification } from './water-verification';
import { WaterManualHelp } from './water-manual-help';
import { WaterReplacementHelp } from './water-replacement-help';

type Point = { id: string; plotId: string | null; designation: string; boundary: string | null;
  installationId: string; meterDesignation: string; startsOn: string };
type Plot = { id: string; number: string };
type Installation = { id: string; meterDesignation: string; startsOn: string; endsBefore: string | null; reason: string | null };
type Series = { readings: { id: string; date: string; valueExact: string }[];
  intervals: { from: string; to: string; valueExact: string }[] };

const messages: Record<string, string> = {
  PointConflict: 'Точка або позначення лічильника вже існує.',
  AlreadyRecorded: 'Таке показання вже записано.',
  DateConflict: 'За цю дату вже записано інше показання.',
  Decreasing: 'Значення суперечить сусіднім показанням.',
  OutsideInstallation: 'Дата вимірювання поза періодом установки.',
  FutureDate: 'Дата вимірювання не може бути в майбутньому.',
  InvalidValue: 'Вкажіть невід’ємне значення з точністю до 0,001 м³.',
  InvalidTree: 'Перевірте зв’язки дерева та дати встановлення лічильників.',
  InvalidDate: 'Дата заміни має бути пізнішою за початок використання водоміра й не пізнішою за сьогодні.',
  ExistingReading: 'Є визнані показання старого водоміра на дату заміни або пізніше.',
  Conflict: 'Установку вже закрито, позначення зайняте або дані запиту змінилися. Перевірте історію.',
};

async function checked(response: Response, topologyPublication = false, verification = false) {
  if (response.ok) return response;
  if (response.status === 403) throw new Error('Дозвіл на цю дію відсутній.');
  const data = await response.json().catch(() => null);
  if (verification && data?.outcome === 'Conflict') throw new Error('За цю дату вже записано інші відомості про повірку.');
  if (topologyPublication && data?.outcome === 'DateConflict') {
    throw new Error('Виберіть дату, пізнішу за дату набрання чинності останньою опублікованою версією дерева.');
  }
  throw new Error(messages[data?.outcome] ?? 'Перевірте дані та повторіть спробу.');
}

export function Water({ community, canSetup, canRecognize, canReplace, canVerify }: {
  community: string; canSetup: boolean; canRecognize: boolean; canReplace: boolean; canVerify: boolean;
}) {
  const endpoint = '/community/water/' + community;
  const [points, setPoints] = useState<Point[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [plotId, setPlotId] = useState('');
  const [selected, setSelected] = useState('');
  const [series, setSeries] = useState<Series>();
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [readingInstallation, setReadingInstallation] = useState('');
  const replacementRequest = useRef<{ payload: string; id: string } | undefined>(undefined);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const point = points.find(item => item.installationId === selected);

  async function read<T>(path: string): Promise<T> {
    return (await checked(await fetch(endpoint + path))).json();
  }

  async function loadPoints() {
    setPoints(await read<Point[]>('/points'));
    if (canSetup) setPlots(await read<Plot[]>('/plots'));
  }

  async function readSeries(installation: string) {
    setReadingInstallation(installation);
    setSeries(undefined);
    if (installation) setSeries(await read<Series>('/installations/' + installation + '/readings'));
  }

  async function select(pointId: string, installation: string) {
    setSelected(installation);
    setInstallations([]);
    setReadingInstallation('');
    setSeries(undefined);
    if (!pointId) return;
    setInstallations(await read<Installation[]>('/points/' + pointId + '/installations'));
    await readSeries(installation);
  }

  async function run(action: () => Promise<void>) {
    setPending(true);
    setMessage('');
    try { await action(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Не вдалося виконати запит.'); }
    finally { setPending(false); }
  }

  async function post(path: string, data: object) {
    const { token } = await (await checked(await fetch('/platform/csrf'))).json();
    return (await checked(await fetch(endpoint + path, { method: 'POST', body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json', 'X-Platform-CSRF': token } }),
    path === '/topology', path.endsWith('/verifications'))).json();
  }

  useEffect(() => { void run(loadPoints); }, [endpoint]);

  return <section aria-labelledby="water-heading">
    <h2 id="water-heading">Облік технічної води</h2>
    <WaterManualHelp />
    <WaterReplacementHelp />
    <WaterTopology points={points} canSetup={canSetup} read={read} post={post} />
    <WaterBalance read={read} />
    <WaterVerification canVerify={canVerify} read={read} post={post} />
    <ReadingImport endpoint={endpoint} canApply={canRecognize} water onApplied={() => readSeries(readingInstallation)} />
    {canSetup && <details>
      <summary>Зареєструвати точку води</summary>
      <form onSubmit={event => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = Object.fromEntries(new FormData(form));
        void run(async () => {
          await post('/points', { ...data, plotId: plotId || null });
          await loadPoints();
          form.reset();
          setPlotId('');
          setMessage('Точку води зареєстровано.');
        });
      }}>
        <label>Ділянка для точки води <select value={plotId} onChange={event => setPlotId(event.target.value)}>
          <option value="">Загальна точка</option>
          {plots.map(plot => <option value={plot.id} key={plot.id}>{plot.number}</option>)}
        </select></label>{' '}
        {!plotId && <>
          <label>Назва точки води <input name="designation" required maxLength={128} /></label>{' '}
          <label>Межа вимірювання води <input name="boundary" required maxLength={500} /></label>{' '}
        </>}
        <label>Позначення водоміра <input name="meterDesignation" required maxLength={128} /></label>{' '}
        <label>Початок використання водоміра <input name="startsOn" type="date" required /></label>{' '}
        <button disabled={pending}>Зареєструвати</button>
      </form>
    </details>}
    <label>Точка обліку води <select value={selected} disabled={pending} onChange={event => {
      const id = event.target.value;
      const item = points.find(candidate => candidate.installationId === id);
      void run(() => select(item?.id ?? '', id));
    }}>
      <option value="">Оберіть точку</option>
      {points.map(item => <option key={item.id} value={item.installationId}>
        {item.plotId ? 'Ділянка ' : 'Загальна · '}{item.designation}
      </option>)}
    </select></label>
    {point && <p>Водомір {point.meterDesignation}, діє з {point.startsOn}{point.boundary && ' · ' + point.boundary}.</p>}
    {point && installations.length > 1 && <label>Історія водомірів <select value={readingInstallation} disabled={pending}
      onChange={event => { const id = event.target.value; void run(() => readSeries(id)); }}>
      {installations.map(item => <option key={item.id} value={item.id}>
        {item.meterDesignation} · {item.startsOn}{item.endsBefore ? ' — до ' + item.endsBefore : ''}
      </option>)}
    </select></label>}
    {point && readingInstallation && <p>Ідентифікатор установки води · <code>{readingInstallation}</code></p>}
    {installations.find(item => item.id === readingInstallation)?.reason &&
      <p>Причина заміни · {installations.find(item => item.id === readingInstallation)?.reason}</p>}
    {point && canReplace && <details key={'water-replacement:' + selected}>
      <summary>Замінити водомір</summary>
      <p>Заміна стосується чинного водоміра {point.meterDesignation}, діє з {point.startsOn}.</p>
      <form onSubmit={event => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = Object.fromEntries(new FormData(form));
        const payload = JSON.stringify({ selected, ...data });
        if (replacementRequest.current?.payload !== payload) replacementRequest.current = { payload, id: crypto.randomUUID() };
        const requestId = replacementRequest.current.id;
        void run(async () => {
          const result = await post('/installations/' + selected + '/replace', { ...data, requestId });
          await loadPoints();
          await select(point.id, result.installationId);
          replacementRequest.current = undefined;
          setMessage('Заміну водоміра зареєстровано.');
        });
      }}>
        <label>Дата заміни водоміра <input name="effectiveOn" type="date" required /></label>{' '}
        <label>Позначення нового водоміра <input name="meterDesignation" required maxLength={128} /></label>{' '}
        <label>Причина заміни водоміра <input name="reason" required maxLength={500} /></label>{' '}
        <button disabled={pending}>Зареєструвати заміну водоміра</button>
      </form>
    </details>}
    {point && readingInstallation && canRecognize && <form key={'water-reading:' + readingInstallation} onSubmit={event => {
      event.preventDefault();
      const form = event.currentTarget;
      const data = new FormData(form);
      void run(async () => {
        const result = await post('/installations/' + readingInstallation + '/readings',
          { date: data.get('date'), value: String(data.get('value')).replace(',', '.') });
        await readSeries(readingInstallation);
        setMessage(messages[result.outcome] ?? 'Показання води визнано.');
      });
    }}>
      <label>Дата показання води <input name="date" type="date" required /></label>{' '}
      <label>Показання водоміра, м³ <input name="value" inputMode="decimal" required maxLength={16} /></label>{' '}
      <button disabled={pending}>Визнати показання води</button>
    </form>}
    {series && <>
      <table><caption>Показання води</caption><thead><tr><th>Дата</th><th>м³</th></tr></thead>
        <tbody>{series.readings.map(row => <tr key={row.id}><td>{row.date}</td><td>{row.valueExact.replace('.', ',')}</td></tr>)}</tbody>
      </table>
      <table><caption>Споживання води</caption><thead><tr><th>Від</th><th>До</th><th>м³</th></tr></thead>
        <tbody>{series.intervals.map(row => <tr key={row.from}><td>{row.from}</td><td>{row.to}</td>
          <td>{row.valueExact.replace('.', ',')}</td></tr>)}</tbody>
      </table>
    </>}
    <p role="status">{message}</p>
  </section>;
}
