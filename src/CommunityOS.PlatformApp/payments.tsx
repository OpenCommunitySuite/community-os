import { useState } from 'react';
import { money } from './billing';
import { Reallocation, type TransferLine } from './reallocation';
import { PaymentCorrection } from './payment-correction';

type Line = { obligationId: string; amount: number };
type Allocation = { requestId: string; paymentId: string; reason: string; lines: Line[] };
type Receipt = { requestId: string; payerId: string; receivedOn: string; amount: number; reason: string };
type Entry = { id: string; reason: string; author: string; recordedAt: string };
type Payment = Entry & { payerId: string; receivedOn: string; amount: number; available: number;
  originalAmount: number; corrections: (Entry & { prior: number; amount: number })[];
  bankTransactionId: string | null;
  cashAcceptance: { id: string; paymentId: string; acceptedOn: string; amount: number; cashier: string; recordedAt: string; reason: string } | null;
  effectiveLines: TransferLine[];
  reallocations: (Entry & { sourceBatchId: string; sourceObligationId: string; targetObligationId: string; amount: number })[];
  allocations: (Entry & { lines: Line[] })[] };
type Obligation = { id: string; payerId: string; account: string; kind: string; outstanding: number; dueOn: string };
type Desk = { payers: { id: string; name: string }[]; payments: Payment[]; obligations: Obligation[] };
type Preview = { outcome: string; digest: string; before: number; after: number;
  lines: (Line & { account: string; before: number; after: number })[] };

const errors: Record<string, string> = {
  InvalidInput: 'Перевірте дату, підставу та суми з точністю до копійок.',
  NotFound: 'Платіж, платник або зобов’язання недоступні.',
  PaymentExceeded: 'Розподіл перевищує доступний залишок платежу.',
  ObligationExceeded: 'Сума перевищує залишок зобов’язання.',
  StalePreview: 'Залишки змінилися. Перегляньте розподіл знову.',
  RequestConflict: 'Запит уже використано з іншими даними.',
};
const value = (input: FormDataEntryValue | null) => Number(String(input ?? '').trim().replace(',', '.'));
const when = (date: string) => new Date(date).toLocaleString('uk-UA');

export function Payments({ community, canRecord, canAllocate, canAcceptCash, canReallocate, canCorrect }: {
  community: string; canRecord: boolean; canAllocate: boolean; canAcceptCash: boolean; canReallocate: boolean; canCorrect: boolean;
}) {
  const base = '/community/billing/' + community + '/payments';
  const [desk, setDesk] = useState<Desk>();
  const [today, setToday] = useState('');
  const [balancePayer, setBalancePayer] = useState('');
  const [selected, setSelected] = useState('');
  const [receipt, setReceipt] = useState<{ input: Receipt; cash: boolean }>();
  const [draft, setDraft] = useState<{ input: Allocation; preview: Preview }>();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const payment = desk?.payments.find(item => item.id === selected);
  const obligations = desk?.obligations.filter(item => item.payerId === payment?.payerId && item.outstanding > 0) ?? [];

  async function request(path: string, body?: object) {
    const headers: Record<string, string> = {};
    if (body) {
      const csrf = await fetch('/platform/csrf');
      if (!csrf.ok) throw new Error('Увійдіть повторно.');
      headers['X-Platform-CSRF'] = (await csrf.json()).token;
      headers['Content-Type'] = 'application/json';
    }
    const response = await fetch(base + path, { method: body ? 'POST' : 'GET', headers, body: JSON.stringify(body) });
    if (response.status === 403) throw new Error('Дозвіл на цю дію відсутній.');
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(errors[data?.outcome] ?? 'Не вдалося виконати запит.');
    return data;
  }

  async function refresh() {
    const [data, date] = await Promise.all([request('/'), request('/today')]);
    setDesk(data);
    setToday(date);
  }
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setMessage('');
    try { await action(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Не вдалося виконати запит.'); }
    finally { setBusy(false); }
  }

  return <section aria-labelledby="payments-heading">
    <h2 id="payments-heading">Платежі та розподіл</h2>
    <button disabled={busy} onClick={() => void run(refresh)}>Завантажити платежі та зобов’язання</button>
    {desk && <details>
      <summary>Залишки розрахунків</summary>
      <label>Платник для звірки <select value={balancePayer} onChange={event => setBalancePayer(event.target.value)}>
        <option value="">Оберіть платника</option>
        {desk.payers.map(payer => <option key={payer.id} value={payer.id}>{payer.name}</option>)}
      </select></label>
      {balancePayer && (() => {
        const open = desk.obligations.filter(item => item.payerId === balancePayer && item.outstanding > 0);
        const unallocated = desk.payments.filter(item => item.payerId === balancePayer && item.available > 0);
        return <>
          <dl>
            <dt>Заборгованість</dt><dd>{money.format(open.reduce((sum, item) => sum + item.outstanding, 0))}</dd>
            <dt>Прострочена заборгованість</dt><dd>{money.format(open.reduce((sum, item) =>
              sum + (item.dueOn < today ? item.outstanding : 0), 0))}</dd>
            <dt>Нерозподілені платежі</dt><dd>{money.format(unallocated.reduce((sum, item) => sum + item.available, 0))}</dd>
          </dl>
          <table><caption>Непогашені зобов’язання</caption><thead><tr><th>Рахунок</th><th>Вид</th><th>Строк оплати</th><th>Залишок</th></tr></thead>
            <tbody>{open.map(item => <tr key={item.id}><td>{item.account}</td><td>{item.kind}</td>
              <td>{item.dueOn}</td><td>{money.format(item.outstanding)}</td></tr>)}</tbody>
          </table>
          <ul aria-label="Нерозподілені платежі">{unallocated.map(item => <li key={item.id}>
            {item.receivedOn} · {item.reason} · {money.format(item.available)}
          </li>)}</ul>
        </>;
      })()}
    </details>}
    {desk && (canRecord || canAcceptCash) && <form onChange={() => setReceipt(undefined)} onSubmit={event => {
      event.preventDefault();
      const fields = new FormData(event.currentTarget);
      setReceipt({ cash: fields.get('channel') === 'cash', input: { requestId: crypto.randomUUID(),
        payerId: String(fields.get('payer')), receivedOn: String(fields.get('date')),
        amount: value(fields.get('amount')), reason: String(fields.get('reason')) } });
    }}>
      <fieldset disabled={busy}><legend>Новий платіж</legend>
        <label>Операція <select name="channel">
          {canRecord && <option value="manual">Ручна реєстрація платежу</option>}
          {canAcceptCash && <option value="cash">Прийом готівки</option>}
        </select></label>{' '}
        <label>Платник <select name="payer" required><option value="">Оберіть платника</option>
          {desk.payers.map(payer => <option key={payer.id} value={payer.id}>{payer.name}</option>)}
        </select></label>{' '}
        <label>Дата надходження <input name="date" type="date" required /></label>{' '}
        <label>Сума платежу, грн <input name="amount" inputMode="decimal" required /></label>{' '}
        <label>Підстава платежу <input name="reason" maxLength={500} required /></label>{' '}
        <button>Переглянути платіж</button>
      </fieldset>
    </form>}
    {receipt && <div>
      <p>{receipt.cash && 'Прийом готівки · '}{desk?.payers.find(payer => payer.id === receipt.input.payerId)?.name} ·
        {' '}{receipt.input.receivedOn} · {money.format(receipt.input.amount)} · {receipt.input.reason}</p>
      <button disabled={busy} onClick={() => void run(async () => {
        const result = await request(receipt.cash ? '/accept-cash' : '/record', receipt.input);
        setReceipt(undefined);
        setSelected(result.id);
        setDraft(undefined);
        await refresh();
        setMessage(receipt.cash ? 'Прийом готівки та платіж зареєстровано.' : 'Платіж зареєстровано.');
      })}>{receipt.cash ? 'Підтвердити прийом готівки' : 'Підтвердити реєстрацію платежу'}</button>
    </div>}
    {desk && <label>Визнаний платіж <select value={selected} disabled={busy} onChange={event => {
      setSelected(event.target.value); setDraft(undefined);
    }}><option value="">Оберіть платіж</option>
      {desk.payments.map(item => <option key={item.id} value={item.id}>
        {item.receivedOn} · {desk.payers.find(payer => payer.id === item.payerId)?.name} · {money.format(item.amount)} · {item.reason}
      </option>)}
    </select></label>}
    {payment && <div key={payment.id}>
      <p>Початкова сума {money.format(payment.originalAmount)} · Чинна сума {money.format(payment.amount)}</p>
      {canCorrect && !payment.bankTransactionId && !payment.cashAcceptance && payment.allocations.length === 0 &&
        <PaymentCorrection paymentId={payment.id} post={request} refresh={refresh} />}
      {payment.corrections.length > 0 && <ul aria-label="Історія виправлень платежу">
        {payment.corrections.map(entry => <li key={entry.id}>
          {money.format(entry.prior)} → {money.format(entry.amount)} · {entry.reason} · Автор {entry.author} · {when(entry.recordedAt)}
        </li>)}
      </ul>}
      <Reallocation paymentId={payment.id} lines={payment.effectiveLines} targets={obligations} canConfirm={canReallocate}
        post={request} refresh={refresh} />
      {payment.reallocations.length > 0 && <ul aria-label="Історія перерозподілів">
        {payment.reallocations.map(entry => <li key={entry.id}>
          {entry.id} · {entry.sourceBatchId} · {entry.sourceObligationId} → {entry.targetObligationId} · {money.format(entry.amount)}
          {' · '}{entry.reason} · Автор {entry.author} · {when(entry.recordedAt)}
        </li>)}
      </ul>}
      <p>Нерозподілений залишок {money.format(payment.available)}</p>
      <p>{payment.reason} · Автор {payment.author} · {when(payment.recordedAt)}</p>
      {payment.bankTransactionId && <p>Банківська операція {payment.bankTransactionId} · Платіж {payment.id}</p>}
      {payment.cashAcceptance && <p>Прийом готівки {payment.cashAcceptance.id} · Платіж {payment.id} ·
        {' '}{money.format(payment.cashAcceptance.amount)} · {payment.cashAcceptance.acceptedOn} ·
        {' '}{payment.cashAcceptance.reason} · Касир {payment.cashAcceptance.cashier} · {when(payment.cashAcceptance.recordedAt)}</p>}
      {payment.allocations.length > 0 && <ul aria-label="Історія розподілів">
        {payment.allocations.map(entry => <li key={entry.id}>
          {entry.reason} · Автор {entry.author} · {when(entry.recordedAt)}
          <ul>{entry.lines.map(line => <li key={line.obligationId}>
            {desk?.obligations.find(item => item.id === line.obligationId)?.account ?? line.obligationId} · {money.format(line.amount)}
          </li>)}</ul>
        </li>)}
      </ul>}
      {obligations.length > 0 && <form onChange={() => setDraft(undefined)} onSubmit={event => {
        event.preventDefault();
        const fields = new FormData(event.currentTarget);
        const input = { requestId: crypto.randomUUID(), paymentId: payment.id, reason: String(fields.get('reason')),
          lines: obligations.filter(item => String(fields.get(item.id) ?? '').trim() !== '')
            .map(item => ({ obligationId: item.id, amount: value(fields.get(item.id)) })) };
        void run(async () => {
          setDraft(undefined);
          const preview: Preview = await request('/preview', input);
          if (preview.outcome !== 'Ready') throw new Error(errors[preview.outcome] ?? 'Розподіл недоступний.');
          setDraft({ input, preview });
        });
      }}>
        <fieldset disabled={busy}><legend>Розподіл за зобов’язаннями</legend>
          {obligations.map(item => <div key={item.id}><label>
            {item.account} · {item.kind} · залишок {money.format(item.outstanding)}{' '}
            <input name={item.id} inputMode="decimal" />
          </label></div>)}
          <label>Підстава розподілу <input name="reason" maxLength={500} required /></label>{' '}
          <button>Переглянути розподіл</button>
        </fieldset>
      </form>}
      {draft && <>
        <p>Залишок платежу {money.format(draft.preview.before)} → {money.format(draft.preview.after)}</p>
        <ul>{draft.preview.lines.map(line => <li key={line.obligationId}>
          {line.account} · {money.format(line.amount)} · залишок {money.format(line.before)} → {money.format(line.after)}
        </li>)}</ul>
        {canAllocate && <button disabled={busy} onClick={() => void run(async () => {
          await request('/allocate', { input: draft.input, digest: draft.preview.digest });
          setDraft(undefined);
          await refresh();
          setMessage('Розподіл підтверджено.');
        })}>Підтвердити розподіл</button>}
      </>}
    </div>}
    <p role="status">{message}</p>
  </section>;
}
