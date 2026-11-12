import { FormEvent, useEffect, useRef, useState } from 'react';

type Installation = { id: string; meterDesignation: string; startsOn: string; endsBefore: string | null;
  replacement?: { reason: string; recordedAt: string; accountId: string } };
type Plot = { id: string; number: string; installation: Installation | null };
type Series = {
  readings: { id: string; date: string; value: number; recognizedAt: string; accountId: string }[];
  intervals: { fromReadingId: string; toReadingId: string; from: string; to: string; value: number }[];
};

const messages: Record<string, string> = {
  AlreadyRecorded: 'Таке значення за цю дату вже записано.',
  DateConflict: 'За цю дату вже визнано інше значення.',
  OutsideInstallation: 'Дата вимірювання поза періодом установки.',
  FutureDate: 'Дата не може бути в майбутньому.',
  InvalidValue: 'Вкажіть невід’ємне значення з точністю до 0,001 кВт·год.',
  Decreasing: 'Значення суперечить накопичувальним показанням за сусідні дати.',
  InstallationConflict: 'Для ділянки вже є установка або позначення лічильника зайняте.',
  InvalidDate: 'Дата заміни має бути після початку установки й не пізніше сьогодні.',
  ExistingReading: 'Старий лічильник уже має показання на дату заміни або пізніше.',
  Conflict: 'Установку вже закрито, позначення зайняте або дані повторного запиту відрізняються.',
};
const format = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 3 });

async function checked(response: Response) {
  if (response.ok) return response;
  if (response.status === 403) throw new Error('Дозвіл на цю дію відсутній.');
  if (response.status === 404) throw new Error('Ділянка або установка недоступна.');
  const error = await response.json().catch(() => null);
  throw new Error(messages[error?.outcome] ?? 'Перевірте дані та повторіть спробу.');
}

export function Electricity({ community, canSetup, canRecognize, canReplace }: {
  community: string; canSetup: boolean; canRecognize: boolean; canReplace: boolean;
}) {
  const endpoint = '/community/electricity/' + community;
  const [plots, setPlots] = useState<Plot[]>([]);
  const [selected, setSelected] = useState('');
  const [series, setSeries] = useState<Series>();
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [selectedInstallation, setSelectedInstallation] = useState('');
  const replacementRequest = useRef<{ payload: string; id: string } | undefined>(undefined);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const plot = plots.find(item => item.id === selected);
  const installation = installations.find(item => item.id === selectedInstallation);

  async function loadPlots(): Promise<Plot[]> {
    const data: Plot[] = await (await checked(await fetch(endpoint + '/plots'))).json();
    setPlots(data);
    return data;
  }

  async function loadSeries(item: Installation | null | undefined) {
    setSeries(item ? await (await checked(await fetch(endpoint + '/installations/' + item.id + '/readings'))).json()
      : undefined);
  }

  async function loadInstallations(plotId: string, preferred?: string) {
    const items: Installation[] = plotId
      ? await (await checked(await fetch(endpoint + '/plots/' + plotId + '/installations'))).json() : [];
    const next = items.find(item => item.id === preferred) ?? items.find(item => !item.endsBefore);
    setInstallations(items);
    setSelectedInstallation(next?.id ?? '');
    await loadSeries(next);
  }

  async function run(action: () => Promise<void>) {
    setPending(true);
    setMessage('');
    try { await action(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Не вдалося виконати запит.'); }
    finally { setPending(false); }
  }

  useEffect(() => { void run(async () => { await loadPlots(); }); }, [endpoint]);

  async function post(path: string, data: object) {
    const { token } = await (await checked(await fetch('/platform/csrf'))).json();
    return checked(await fetch(endpoint + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Platform-CSRF': token },
      body: JSON.stringify(data),
    }));
  }

  function setup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!plot) return;
    const data = new FormData(event.currentTarget);
    void run(async () => {
      await post('/plots/' + plot.id + '/installation', Object.fromEntries(data));
      await loadPlots();
      await loadInstallations(plot.id);
      setMessage('Точку обліку та установку зареєстровано.');
    });
  }

  function replace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!plot || !installation || installation.endsBefore) return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const payload = JSON.stringify([installation.id, data]);
    if (replacementRequest.current?.payload !== payload)
      replacementRequest.current = { payload, id: crypto.randomUUID() };
    const requestId = replacementRequest.current.id;
    void run(async () => {
      const response = await post('/installations/' + installation.id + '/replacement', { ...data, requestId });
      const result = await response.json();
      await loadPlots();
      await loadInstallations(plot.id, result.installationId);
      replacementRequest.current = undefined;
      setMessage('Заміну лічильника зареєстровано.');
    });
  }

  function recognize(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!installation) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    void run(async () => {
      const response = await post('/installations/' + installation.id + '/readings',
        { date: data.get('date'), value: String(data.get('value')).replace(',', '.') });
      const result = await response.json();
      await loadSeries(installation);
      setMessage(messages[result.outcome] ?? 'Показання визнано.');
      form.reset();
    });
  }

  return <section aria-labelledby="electricity-heading">
    <h2 id="electricity-heading">Облік електроенергії</h2>
    <label>Ділянка для обліку{' '}
      <select value={selected} disabled={pending} onChange={event => {
        const id = event.target.value;
        setSelected(id);
        setSeries(undefined);
        setInstallations([]);
        setSelectedInstallation('');
        void run(() => loadInstallations(id));
      }}>
        <option value="">Оберіть ділянку</option>
        {plots.map(item => <option key={item.id} value={item.id}>{item.number}</option>)}
      </select>
    </label>
    {plot && !plot.installation && canSetup && <form onSubmit={setup} key={plot.id}>
      <fieldset disabled={pending}>
        <legend>Зареєструвати точку обліку та установку</legend>
        <label>Позначення лічильника <input name="designation" maxLength={128} required /></label>{' '}
        <label>Дата початку установки <input name="startsOn" type="date" required /></label>{' '}
        <button>Зареєструвати установку</button>
      </fieldset>
    </form>}
    {plot && !plot.installation && !canSetup && <p>Установку ще не зареєстровано.</p>}
    {installations.length > 0 && <label>Історія установок{' '}
      <select disabled={pending} value={selectedInstallation} onChange={event => {
        const id = event.target.value;
        setSelectedInstallation(id);
        setSeries(undefined);
        void run(() => loadSeries(installations.find(item => item.id === id)));
      }}>
        {installations.map(item => <option key={item.id} value={item.id}>
          {item.meterDesignation} · {item.startsOn} · {item.endsBefore ? 'до ' + item.endsBefore : 'чинна'}
        </option>)}
      </select>
    </label>}
    {installation && <>
      <p>Лічильник {installation.meterDesignation} · початок установки {installation.startsOn}</p>
      {installation.endsBefore && <p>Установку закрито з {installation.endsBefore}. Кінцевого граничного показання немає.</p>}
      {installation.replacement && <p>Причина заміни · {installation.replacement.reason} · {' '}
        {new Date(installation.replacement.recordedAt).toLocaleString('uk-UA')} · {installation.replacement.accountId}.
        Початкового граничного показання немає.</p>}
      {canReplace && !installation.endsBefore && <form onSubmit={replace} key={'replace-' + installation.id}>
        <fieldset disabled={pending}>
          <legend>Замінити лічильник</legend>
          <label>Позначення нового лічильника <input name="designation" maxLength={128} required /></label>{' '}
          <label>Дата початку використання нового лічильника <input name="effectiveOn" type="date" required /></label>{' '}
          <label>Причина заміни <input name="reason" maxLength={500} required /></label>{' '}
          <button>Зареєструвати заміну</button>
        </fieldset>
      </form>}
      {canRecognize && <form onSubmit={recognize} key={installation.id}>
        <fieldset disabled={pending}>
          <legend>Ручне спостереження</legend>
          <label>Дата вимірювання <input name="date" type="date" required /></label>{' '}
          <label>Накопичувальне значення, кВт·год <input name="value" inputMode="decimal"
            pattern="[0-9]{1,12}([.,][0-9]{1,3})?" maxLength={16} required /></label>{' '}
          <button>Визнати показання</button>
        </fieldset>
      </form>}
      {series && <>
        <h3>Визнані показання</h3>
        {series.readings.length === 0 ? <p>Показань ще немає.</p> : <table>
          <thead><tr><th>Дата вимірювання</th><th>кВт·год</th><th>Джерело</th><th>Визнано</th><th>Обліковий запис</th></tr></thead>
          <tbody>{series.readings.map(item => <tr key={item.id}>
            <td>{item.date}</td><td>{format.format(item.value)}</td><td>Ручне спостереження</td>
            <td>{new Date(item.recognizedAt).toLocaleString('uk-UA')}</td><td>{item.accountId}</td>
          </tr>)}</tbody>
        </table>}
        <h3>Розрахункова оцінка споживання</h3>
        {series.intervals.length === 0 ? <p>Потрібні два визнані показання.</p> : <table>
          <thead><tr><th>Від</th><th>До</th><th>кВт·год</th></tr></thead>
          <tbody>{series.intervals.map(item => <tr key={item.fromReadingId + item.toReadingId}>
            <td>{item.from}</td><td>{item.to}</td><td>{format.format(item.value)}</td>
          </tr>)}</tbody>
        </table>}
      </>}
    </>}
    <p role="status">{message}</p>
  </section>;
}
