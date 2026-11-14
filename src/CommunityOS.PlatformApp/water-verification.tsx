import { useState } from 'react';

type Verification = { verifiedOn: string; dueOn: string; evidence: string; accountId: string; recordedAt: string };
type Meter = { id: string; designation: string; point: string; active: boolean; history: Verification[] };
type Register = { today: string; meters: Meter[] };

function deadline(dueOn: string | undefined, today: string) {
  if (!dueOn) return 'Строк невідомий';
  const days = (Date.parse(dueOn) - Date.parse(today)) / 86_400_000;
  if (days < 0) return 'Прострочено';
  if (days === 0) return 'Строк сьогодні';
  return days <= 30 ? 'Повірка наближається' : 'Строк не настав';
}

export function WaterVerification({ canVerify, read, post }: {
  canVerify: boolean;
  read: <T>(path: string) => Promise<T>;
  post: (path: string, data: object) => Promise<{ outcome: string }>;
}) {
  const [register, setRegister] = useState<Register>();
  const [selected, setSelected] = useState('');
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const meter = register?.meters.find(item => item.id === selected);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setMessage('');
    try { await action(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Не вдалося виконати дію.'); }
    finally { setBusy(false); }
  }

  async function load() {
    setRegister(await read<Register>('/verifications'));
  }

  return <details>
    <summary>Повірка водомірів</summary>
    <button type="button" disabled={busy} onClick={() => void run(load)}>Завантажити строки повірки</button>
    {register && <>
      <label><input type="checkbox" checked={attentionOnly} onChange={event => setAttentionOnly(event.target.checked)} />
        {' '}Лише водоміри, що потребують уваги</label>
      <table><caption>Строки повірки чинних водомірів</caption>
        <thead><tr><th>Точка</th><th>Водомір</th><th>Остання повірка</th><th>Наступна повірка</th><th>Стан</th></tr></thead>
        <tbody>{register.meters.filter(item => item.active &&
          (!attentionOnly || deadline(item.history[0]?.dueOn, register.today) !== 'Строк не настав')).map(item => {
          const latest = item.history[0];
          return <tr key={item.id}><td>{item.point}</td><th scope="row">{item.designation}</th>
            <td>{latest?.verifiedOn ?? '—'}</td><td>{latest?.dueOn ?? '—'}</td>
            <td>{deadline(latest?.dueOn, register.today)}</td></tr>;
        })}</tbody>
      </table>
      <label>Водомір для історії повірок <select value={selected} disabled={busy} onChange={event => {
        setSelected(event.target.value);
        setMessage('');
      }}>
        <option value="">Оберіть водомір</option>
        {register.meters.map(item => <option key={item.id} value={item.id}>
          {item.point} · {item.designation}{!item.active && ' · знятий'}
        </option>)}
      </select></label>
    </>}
    {meter && <>
      {meter.history.length === 0 ? <p>Записів про повірку немає.</p> :
        <table><caption>Історія повірок водоміра</caption>
          <thead><tr><th>Повірено</th><th>Наступний строк</th><th>Підстава</th><th>Автор</th><th>Записано</th></tr></thead>
          <tbody>{meter.history.map(item => <tr key={item.verifiedOn}><td>{item.verifiedOn}</td><td>{item.dueOn}</td>
            <td>{item.evidence}</td><td>{item.accountId}</td><td>{new Date(item.recordedAt).toLocaleString('uk-UA')}</td>
          </tr>)}</tbody>
        </table>}
      {canVerify && <form key={meter.id} onSubmit={event => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = Object.fromEntries(new FormData(form));
        void run(async () => {
          const result = await post('/meters/' + meter.id + '/verifications', data);
          await load();
          form.reset();
          setMessage(result.outcome === 'Replayed' ? 'Повірку вже записано.' : 'Повірку зареєстровано.');
        });
      }}>
        <fieldset disabled={busy}>
          <label>Дата повірки <input name="verifiedOn" type="date" max={register?.today} required /></label>{' '}
          <label>Дата наступної повірки <input name="dueOn" type="date" required /></label>{' '}
          <label>Підстава повірки <input name="evidence" maxLength={500} required /></label>{' '}
          <button>Зареєструвати повірку</button>
        </fieldset>
      </form>}
    </>}
    <p role="status">{message}</p>
  </details>;
}
