import { FormEvent, useState } from 'react';
import { Recalculation } from './billing-recalculation';

type Period = { from: string; until: string; calculatedOn: string; dueOn: string };
export type Register = { channel: string; startValue: number; endValue: number; consumption: number; rate: number; amount: number };
type Line = { accountId: string; accountNumber: string; status: string;
  electricity: { installationId: string; multiplier: number; tariff: { id: string; basis: string; from: string; until: string | null };
    registers: Register[]; amountUah: number } | null;
  fee: { id: string; basis: string; amountUah: number } | null };
type Plan = { period: Period; lines: Line[]; ready: boolean };
type Preview = { plan: Plan; digest: string };
type Posted = { id: string; snapshot: Plan; accountId: string; postedAt: string };

export const labels: Record<string, string> = {
  RecognizedOverpayment: 'Зміна зачіпає визнану переплату.',
  Ready: 'Готово', MissingBoundary: 'Бракує граничних показань або змінився лічильник',
  MissingInstallation: 'Немає однозначної установки', MissingTariff: 'Немає тарифу',
  AmbiguousTariff: 'Кілька чинних тарифів', TariffChanges: 'Тариф змінюється в межах періоду',
  InvalidRate: 'Непридатна ставка', AmbiguousDebtor: 'Не визначено єдиного платника',
  MissingOrAmbiguousFee: 'Не визначено умови членського внеску',
  StalePreview: 'Вихідні дані змінилися. Сформуйте новий розрахунок.',
  PeriodAlreadyPosted: 'Цей період уже проведено.', Incomplete: 'Розрахунок містить неповні рядки.',
  total: 'Загальний', day: 'День', night: 'Ніч',
};
export const money = new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' });

export function Billing({ community, canPost, canRecalculate }: { community: string; canPost: boolean; canRecalculate: boolean }) {
  const endpoint = '/community/billing/' + community;
  const [preview, setPreview] = useState<Preview>();
  const [posted, setPosted] = useState<Posted>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const plan = posted?.snapshot ?? preview?.plan;

  async function checked(response: Response) {
    if (response.ok) return response.json();
    if (response.status === 403) throw new Error('Дозвіл на цю дію відсутній.');
    if (response.status === 404) throw new Error('Проведеного періоду не знайдено.');
    const data = await response.json().catch(() => null);
    throw new Error(labels[data?.outcome] ?? 'Перевірте дати й повторіть спробу.');
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setMessage('');
    try { await action(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Не вдалося виконати запит.'); }
    finally { setBusy(false); }
  }

  function lookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const history = (event.nativeEvent as SubmitEvent).submitter?.getAttribute('value') === 'history';
    const fields = new URLSearchParams();
    for (const [name, value] of new FormData(event.currentTarget)) fields.set(name, String(value));
    setPreview(undefined);
    setPosted(undefined);
    void run(async () => {
      const data = await checked(await fetch(endpoint + (history ? '/history?' : '/preview?') + fields));
      if (history) setPosted(data);
      else setPreview(data);
    });
  }

  function post() {
    if (!preview) return;
    void run(async () => {
      const { token } = await checked(await fetch('/platform/csrf'));
      const response = await checked(await fetch(endpoint + '/post', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Platform-CSRF': token },
        body: JSON.stringify({ period: preview.plan.period, digest: preview.digest }),
      }));
      setPosted(response.result);
      setMessage(response.outcome === 'Replayed' ? 'Період уже проведено.' : 'Період проведено.');
    });
  }

  return <section aria-labelledby="billing-heading">
    <h2 id="billing-heading">Розрахунковий період</h2>
    <form onSubmit={lookup} onChange={() => { setPreview(undefined); setPosted(undefined); setMessage(''); }}>
      <fieldset disabled={busy}>
        <label>Початок споживання <input type="date" name="from" required /></label>{' '}
        <label>Кінець споживання <input type="date" name="until" required /></label>{' '}
        <label>Дата розрахунку <input type="date" name="calculatedOn" /></label>{' '}
        <label>Сплатити до <input type="date" name="dueOn" /></label>{' '}
        <button value="preview">Попередній розрахунок</button>{' '}
        <button value="history">Відкрити проведений період</button>
      </fieldset>
    </form>
    {posted && <p>Проведено {new Date(posted.postedAt).toLocaleString('uk-UA')}. Ідентифікатор {posted.id}.</p>}
    {posted && <Recalculation key={posted.id} endpoint={endpoint} period={posted.id} canConfirm={canRecalculate}
      from={posted.snapshot.period.from} until={posted.snapshot.period.until}
      fees={posted.snapshot.lines.flatMap(line => line.fee ? [{ account: line.accountNumber, amount: line.fee.amountUah }] : [])} />}
    {plan && <>
      <p>{plan.period.from} — {plan.period.until}. Розрахунок {plan.period.calculatedOn}, сплатити до {plan.period.dueOn}.</p>
      <p>Підсумок електроенергії округлюється до копійок після сумування регістрів.</p>
      {plan.lines.length === 0 && <p>Немає особових рахунків для розрахунку.</p>}
      {plan.lines.map(line => <section key={line.accountId}>
        <h3>Особовий рахунок {line.accountNumber}</h3>
        <p>{labels[line.status] ?? line.status}</p>
        {line.electricity?.registers && <>
          <p>Установка {line.electricity.installationId}, коефіцієнт {line.electricity.multiplier}.</p>
          <p>Тариф {line.electricity.tariff.id} · {line.electricity.tariff.basis} · {line.electricity.tariff.from}
            {line.electricity.tariff.until && ' — ' + line.electricity.tariff.until}</p>
          <table><caption>Електроенергія</caption>
            <thead><tr><th>Регістр</th><th>Початкове</th><th>Кінцеве</th><th>кВт·год</th><th>Ставка</th><th>Сума до округлення</th></tr></thead>
            <tbody>{line.electricity.registers.map(register => <tr key={register.channel}>
              <td>{labels[register.channel]}</td><td>{register.startValue}</td><td>{register.endValue}</td>
              <td>{register.consumption}</td><td>{register.rate}</td><td>{register.amount}</td>
            </tr>)}</tbody>
          </table>
          <p>Електроенергія · {money.format(line.electricity.amountUah)}</p>
        </>}
        {line.fee && <p>Членський внесок · {money.format(line.fee.amountUah)} · {line.fee.basis} · {line.fee.id}</p>}
      </section>)}
    </>}
    {canPost && preview?.plan.ready && !posted && <button type="button" disabled={busy} onClick={post}>
      Підтвердити проведення періоду
    </button>}
    <p role="status">{message}</p>
  </section>;
}
