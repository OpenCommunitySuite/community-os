import { FormEvent, useEffect, useRef, useState } from 'react';

type Channel = 'total' | 'day' | 'night';
type Installation = { id: string; meterDesignation: string; startsOn: string; endsBefore: string | null;
  registerMode: 'total' | 'dual';
  replacement?: { reason: string; recordedAt: string; accountId: string } };
type Plot = { id: string; number: string; installation: Installation | null };
type CommonPoint = { id: string; designation: string; boundary: string };
type Interval = { fromReadingId: string; toReadingId: string; from: string; to: string; value: number; channel: Channel };
type Series = {
  readings: { id: string; date: string; value: number; recognizedAt: string; accountId: string; channel: Channel }[];
  intervals: Interval[];
  combinedIntervals: { day: Interval; night: Interval; value: number }[];
};
const channelNames: Record<Channel, string> = { total: 'Загальний', day: 'День', night: 'Ніч' };

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
  UnsupportedChannel: 'Цей лічильник не підтримує вибраний регістр.',
  CommonPointConflict: 'Позначення точки або лічильника вже використовується.',
};
const format = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 3 });

async function checked(response: Response) {
  if (response.ok) return response;
  if (response.status === 403) throw new Error('Дозвіл на цю дію відсутній.');
  if (response.status === 404) throw new Error('Ділянка або установка недоступна.');
  const error = await response.json().catch(() => null);
  throw new Error(messages[error?.outcome] ?? 'Перевірте дані та повторіть спробу.');
}

export function Electricity({ community, canSetup, canRecognize, canReplace, canSetupCommon }: {
  community: string; canSetup: boolean; canRecognize: boolean; canReplace: boolean; canSetupCommon: boolean;
}) {
  const endpoint = '/community/electricity/' + community;
  const [plots, setPlots] = useState<Plot[]>([]);
  const [commonPoints, setCommonPoints] = useState<CommonPoint[]>([]);
  const [selected, setSelected] = useState('');
  const [series, setSeries] = useState<Series>();
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [selectedInstallation, setSelectedInstallation] = useState('');
  const replacementRequest = useRef<{ payload: string; id: string } | undefined>(undefined);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const plot = plots.find(item => item.id === selected);
  const commonPoint = commonPoints.find(item => 'common:' + item.id === selected);
  const installation = installations.find(item => item.id === selectedInstallation);

  async function loadPlots(): Promise<Plot[]> {
    const data: Plot[] = await (await checked(await fetch(endpoint + '/plots'))).json();
    setPlots(data);
    return data;
  }

  async function loadCommonPoints() {
    setCommonPoints(await (await checked(await fetch(endpoint + '/common-points'))).json());
  }

  async function loadSeries(item: Installation | null | undefined) {
    setSeries(item ? await (await checked(await fetch(endpoint + '/installations/' + item.id + '/readings'))).json()
      : undefined);
  }

  async function loadInstallations(target: string, preferred?: string) {
    setInstallations([]);
    setSelectedInstallation('');
    setSeries(undefined);
    const path = target.startsWith('common:') ? '/common-points/' + target.slice(7) : '/plots/' + target;
    const items: Installation[] = target
      ? await (await checked(await fetch(endpoint + path + '/installations'))).json() : [];
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

  useEffect(() => { void run(async () => { await Promise.all([loadPlots(), loadCommonPoints()]); }); }, [endpoint]);

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
    if (!selected || !installation || installation.endsBefore) return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const payload = JSON.stringify([installation.id, data]);
    if (replacementRequest.current?.payload !== payload)
      replacementRequest.current = { payload, id: crypto.randomUUID() };
    const requestId = replacementRequest.current.id;
    void run(async () => {
      const response = await post('/installations/' + installation.id + '/replacement', { ...data, requestId });
      const result = await response.json();
      await loadPlots();
      await loadInstallations(selected, result.installationId);
      replacementRequest.current = undefined;
      setMessage('Заміну лічильника зареєстровано.');
    });
  }

  function setupCommon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = Object.fromEntries(new FormData(form));
    void run(async () => {
      const response = await post('/common-points', input);
      const { id } = await response.json();
      const target = 'common:' + id;
      form.reset();
      try {
        await loadCommonPoints();
        setSelected(target);
        await loadInstallations(target);
        setMessage('Загальну точку та установку зареєстровано.');
      } catch {
        setMessage('Загальну точку зареєстровано. Оновіть сторінку, щоб відкрити її.');
      }
    });
  }

  function recognize(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!installation) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    void run(async () => {
      const response = await post('/installations/' + installation.id + '/readings',
        { date: data.get('date'), value: String(data.get('value')).replace(',', '.'), channel: data.get('channel') });
      const result = await response.json();
      await loadSeries(installation);
      setMessage(messages[result.outcome] ?? 'Показання визнано.');
      form.reset();
    });
  }

  return <section aria-labelledby="electricity-heading">
    <h2 id="electricity-heading">Облік електроенергії</h2>
    <label>Точка або ділянка для обліку{' '}
      <select value={selected} disabled={pending} onChange={event => {
        const id = event.target.value;
        setSelected(id);
        void run(() => loadInstallations(id));
      }}>
        <option value="">Оберіть точку або ділянку</option>
        <optgroup label="Індивідуальні ділянки">
          {plots.map(item => <option key={item.id} value={item.id}>{item.number}</option>)}
        </optgroup>
        {commonPoints.length > 0 && <optgroup label="Загальні точки">
          {commonPoints.map(item => <option key={item.id} value={'common:' + item.id}>{item.designation}</option>)}
        </optgroup>}
      </select>
    </label>
    {commonPoint && <p>Межа вимірювання · {commonPoint.boundary}</p>}
    {canSetupCommon && <form onSubmit={setupCommon}>
      <fieldset disabled={pending}>
        <legend>Зареєструвати загальну точку</legend>
        <label>Позначення точки <input name="pointDesignation" maxLength={128} required /></label>{' '}
        <label>Межа вимірювання <input name="boundary" maxLength={500} required /></label>{' '}
        <label>Позначення лічильника <input name="designation" maxLength={128} required /></label>{' '}
        <label>Дата початку установки <input name="startsOn" type="date" required /></label>{' '}
        <label>Регістри лічильника <select name="registerMode" defaultValue="total">
          <option value="total">Загальний</option><option value="dual">День і ніч</option>
        </select></label>{' '}
        <button>Зареєструвати загальну точку</button>
      </fieldset>
    </form>}
    {plot && !plot.installation && canSetup && <form onSubmit={setup} key={plot.id}>
      <fieldset disabled={pending}>
        <legend>Зареєструвати точку обліку та установку</legend>
        <label>Позначення лічильника <input name="designation" maxLength={128} required /></label>{' '}
        <label>Дата початку установки <input name="startsOn" type="date" required /></label>{' '}
        <label>Регістри лічильника <select name="registerMode" defaultValue="total">
          <option value="total">Загальний</option><option value="dual">День і ніч</option>
        </select></label>{' '}
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
          {installation.registerMode === 'dual' && <label>Регістр показання <select name="channel" required defaultValue="">
            <option value="">Оберіть регістр</option>
            <option value="day">День</option><option value="night">Ніч</option>
          </select></label>}{' '}
          <label>Дата вимірювання <input name="date" type="date" required /></label>{' '}
          <label>Накопичувальне значення, кВт·год <input name="value" inputMode="decimal"
            pattern="[0-9]{1,12}([.,][0-9]{1,3})?" maxLength={16} required /></label>{' '}
          <button>Визнати показання</button>
        </fieldset>
      </form>}
      {series && <>
        <h3>Визнані показання</h3>
        {series.readings.length === 0 ? <p>Показань ще немає.</p> : <table>
          <thead><tr><th>Дата вимірювання</th><th>Регістр</th><th>кВт·год</th><th>Джерело</th><th>Визнано</th><th>Обліковий запис</th></tr></thead>
          <tbody>{series.readings.map(item => <tr key={item.id}>
            <td>{item.date}</td><td>{channelNames[item.channel]}</td><td>{format.format(item.value)}</td><td>Ручне спостереження</td>
            <td>{new Date(item.recognizedAt).toLocaleString('uk-UA')}</td><td>{item.accountId}</td>
          </tr>)}</tbody>
        </table>}
        <h3>Розрахункова оцінка споживання</h3>
        {series.intervals.length === 0 ? <p>Потрібні два визнані показання.</p> : <table>
          <thead><tr><th>Від</th><th>До</th><th>Регістр</th><th>кВт·год</th></tr></thead>
          <tbody>{series.intervals.map(item => <tr key={item.fromReadingId + item.toReadingId}>
            <td>{item.from}</td><td>{item.to}</td><td>{channelNames[item.channel]}</td><td>{format.format(item.value)}</td>
          </tr>)}</tbody>
        </table>}
        {installation.registerMode === 'dual' && <>
          <h3>Зведена оцінка дня й ночі</h3>
          <p>Сума доступна для інтервалів з однаковими датами початку й кінця в обох регістрах.</p>
          {series.combinedIntervals.length === 0 ? <p>Зіставних інтервалів немає.</p> : <table>
            <thead><tr><th>Від</th><th>До</th><th>День, кВт·год</th><th>Ніч, кВт·год</th><th>Разом, кВт·год</th></tr></thead>
            <tbody>{series.combinedIntervals.map(item => <tr key={item.day.fromReadingId + item.day.toReadingId}>
              <td>{item.day.from}</td><td>{item.day.to}</td><td>{format.format(item.day.value)}</td>
              <td>{format.format(item.night.value)}</td><td>{format.format(item.value)}</td>
            </tr>)}</tbody>
          </table>}
        </>}
      </>}
    </>}
    <p role="status">{message}</p>
  </section>;
}
