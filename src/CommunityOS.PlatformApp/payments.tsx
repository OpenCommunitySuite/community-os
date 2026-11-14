import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react';
import { money } from './billing';
import { Reallocation, type TransferLine } from './reallocation';
import { PaymentCorrection } from './payment-correction';
import { Overpayment } from './overpayment';
import { AdvanceForm } from './advance';
import { PaymentSummary } from './payment-summary';
import { AccountStatement, debtKinds } from './account-statement';
import { csvAmount, csvText, downloadCsv } from './report-csv';

type Line = { obligationId: string; amount: number };
type Allocation = { requestId: string; paymentId: string; reason: string; lines: Line[] };
type Receipt = { requestId: string; payerId: string; receivedOn: string; amount: number; reason: string };
type Entry = { id: string; reason: string; author: string; recordedAt: string };
type Payment = Entry & { payerId: string; receivedOn: string; amount: number; available: number;
  originalAmount: number; corrections: (Entry & { prior: number; amount: number })[];
  advances: (Entry & { amount: number; available: number; applications: (Entry & { amount: number; obligationId: string })[];
    releases: (Entry & { amount: number })[] })[];
  bankTransactionId: string | null;
  cashAcceptance: { id: string; paymentId: string; acceptedOn: string; amount: number; cashier: string; recordedAt: string; reason: string } | null;
  effectiveLines: TransferLine[];
  reallocations: (Entry & { sourceBatchId: string; sourceObligationId: string; targetObligationId: string; amount: number })[];
  allocations: (Entry & { lines: Line[] })[] };
type Obligation = { id: string; payerId: string; account: string; kind: string; outstanding: number; excessApplied: number;
  dueOn: string; overpayments: (Entry & { amount: number; recalculationId: string })[] };
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

export type PaymentWorkspace = { openStatement: (account: string) => Promise<void> };

export function Payments({ ref, community, communityName, canRecord, canAllocate, canAcceptCash, canReallocate, canCorrect, canRecognizeOverpayment, canManageAdvance }: {
  ref?: Ref<PaymentWorkspace>;
  community: string; communityName: string; canRecord: boolean; canAllocate: boolean; canAcceptCash: boolean; canReallocate: boolean; canCorrect: boolean;
  canRecognizeOverpayment: boolean;
  canManageAdvance: boolean;
}) {
  const base = '/community/billing/' + community + '/payments';
  const [desk, setDesk] = useState<Desk>();
  const [today, setToday] = useState('');
  const [balancePayer, setBalancePayer] = useState('');
  const [debtAccount, setDebtAccount] = useState('');
  const [exactDebtAccount, setExactDebtAccount] = useState(false);
  const debtDetails = useRef<HTMLDetailsElement>(null);
  const [statementAccount, setStatementAccount] = useState('');
  const statementDetails = useRef<HTMLDetailsElement>(null);
  const [statementRequest, setStatementRequest] = useState<{ account: string }>();
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [selected, setSelected] = useState('');
  const paymentPicker = useRef<HTMLSelectElement>(null);
  const [receipt, setReceipt] = useState<{ input: Receipt; cash: boolean }>();
  const [draft, setDraft] = useState<{ input: Allocation; preview: Preview }>();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const payment = desk?.payments.find(item => item.id === selected);
  const obligations = desk?.obligations.filter(item => item.payerId === payment?.payerId && item.outstanding > 0) ?? [];
  const openDebts = desk?.obligations.filter(item => item.outstanding > 0) ?? [];
  const debtRows = openDebts.filter(item =>
    (exactDebtAccount ? item.account === debtAccount :
      item.account.toLocaleLowerCase('uk-UA').includes(debtAccount.trim().toLocaleLowerCase('uk-UA'))) &&
    (!overdueOnly || item.dueOn < today));
  const debtTotal = debtRows.reduce((sum, item) => sum + Math.round(item.outstanding * 100), 0);
  const overdueTotal = debtRows.reduce((sum, item) => sum + (item.dueOn < today ? Math.round(item.outstanding * 100) : 0), 0);
  const payerNames = new Map(desk?.payers.map(payer => [payer.id, payer.name]));
  const debtStatus = (item: Obligation) => item.dueOn < today ? 'Прострочено' : 'Строк не минув';

  function downloadDebts() {
    const date = csvText(today);
    const row = (account: string, kind: string, dueOn: string, status: string, amount: number, overdue: number) =>
      [date, ...[account, kind, dueOn, status].map(csvText), csvAmount(amount), csvAmount(overdue)].join(';');
    downloadCsv(`debts-${today}.csv`, [
      'Дата звірки за Києвом;Рахунок;Вид;Строк оплати;Стан;Залишок (грн);Прострочено (грн)',
      ...debtRows.map(item => {
        const amount = Math.round(item.outstanding * 100);
        return row(item.account, debtKinds[item.kind] ?? item.kind, item.dueOn, debtStatus(item),
          amount, item.dueOn < today ? amount : 0);
      }),
      row('', 'Усього', '', '', debtTotal, overdueTotal),
    ]);
  }

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

  function showStatement(account: string) {
    setStatementAccount(account);
    setStatementRequest({ account });
  }

  function statementLink(obligationId: string, label: string) {
    const target = desk?.obligations.find(item => item.id === obligationId);
    return target ? <button type="button" onClick={() => showStatement(target.account)}
      aria-label={`${label} ${target.account}`}>{target.account}</button> : obligationId;
  }

  useImperativeHandle(ref, () => ({
    async openStatement(account: string) {
      await refresh();
      showStatement(account);
    },
  }));

  useEffect(() => {
    if (!statementRequest || !statementDetails.current) return;
    statementDetails.current.open = true;
    statementDetails.current.querySelector('select')?.focus();
  }, [statementRequest]);
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
    {desk && <PaymentSummary payments={desk.payments} payerNames={payerNames} openPayment={id => {
      if (id !== selected) {
        setSelected(id);
        setDraft(undefined);
      }
      paymentPicker.current?.focus();
    }} />}
    {desk && <AccountStatement community={communityName} today={today} debts={openDebts} payerNames={payerNames}
      account={statementAccount} setAccount={setStatementAccount} detailsRef={statementDetails} openDebts={account => {
        setDebtAccount(account);
        setExactDebtAccount(true);
        setOverdueOnly(false);
        const details = debtDetails.current;
        if (details) {
          details.open = true;
          details.querySelector('input')?.focus();
        }
      }} />}
    {desk && <details ref={debtDetails}>
      <summary>Реєстр заборгованості</summary>
      <p>Поточні залишки станом на {today} за датою Києва.</p>
      <label>Пошук за номером рахунку <input value={debtAccount} onChange={event => {
        setDebtAccount(event.target.value);
        setExactDebtAccount(false);
      }} /></label>{' '}
      <label><input type="checkbox" checked={overdueOnly} onChange={event => setOverdueOnly(event.target.checked)} /> Лише прострочені</label>
      <button type="button" disabled={busy} onClick={downloadDebts}>Завантажити заборгованість CSV</button>
      <dl>
        <dt>Заборгованість за вибіркою</dt><dd>{money.format(debtTotal / 100)}</dd>
        <dt>Прострочено за вибіркою</dt><dd>{money.format(overdueTotal / 100)}</dd>
      </dl>
      {debtRows.length === 0 ? <p>За вибраними умовами заборгованості немає.</p> :
        <table>
          <caption>Реєстр непогашених зобов’язань</caption>
          <thead><tr><th>Рахунок</th><th>Платник</th><th>Вид</th><th>Строк оплати</th><th>Залишок</th><th>Стан</th></tr></thead>
          <tbody>{debtRows.map(item => <tr key={item.id}>
            <td><button type="button" aria-label={`Відкрити виписку за рахунком ${item.account}`}
              onClick={() => showStatement(item.account)}>{item.account}</button></td><td>{payerNames.get(item.payerId)}</td>
            <td>{debtKinds[item.kind] ?? item.kind}</td>
            <td>{item.dueOn}</td><td>{money.format(item.outstanding)}</td>
            <td>{debtStatus(item)}</td>
          </tr>)}</tbody>
        </table>}
    </details>}
    {desk && <details>
      <summary>Залишки розрахунків</summary>
      <label>Платник для звірки <select value={balancePayer} onChange={event => setBalancePayer(event.target.value)}>
        <option value="">Оберіть платника</option>
        {desk.payers.map(payer => <option key={payer.id} value={payer.id}>{payer.name}</option>)}
      </select></label>
      {balancePayer && (() => {
        const open = desk.obligations.filter(item => item.payerId === balancePayer && item.outstanding > 0);
        const excess = desk.obligations.filter(item => item.payerId === balancePayer && item.excessApplied > 0);
        const unallocated = desk.payments.filter(item => item.payerId === balancePayer && item.available > 0);
        return <>
          <dl>
            <dt>Заборгованість</dt><dd>{money.format(open.reduce((sum, item) => sum + item.outstanding, 0))}</dd>
            <dt>Прострочена заборгованість</dt><dd>{money.format(open.reduce((sum, item) =>
              sum + (item.dueOn < today ? item.outstanding : 0), 0))}</dd>
            <dt>Нерозподілені платежі</dt><dd>{money.format(unallocated.reduce((sum, item) => sum + item.available, 0))}</dd>
          </dl>
          {excess.length > 0 && <ul aria-label="Надлишок застосованої оплати">{excess.map(item => <li key={item.id}>
            {item.account} · {item.kind} · {money.format(item.excessApplied)}
            {item.overpayments.length > 0 && <details>
              <summary>Визнана переплата {money.format(item.overpayments.reduce((sum, entry) => sum + entry.amount, 0))}</summary>
              <ul>{item.overpayments.map(entry => <li key={entry.id}>
                {money.format(entry.amount)} · {entry.reason} · {entry.author} · {when(entry.recordedAt)} · {entry.recalculationId}
              </li>)}</ul>
            </details>}
            {canRecognizeOverpayment && item.excessApplied > item.overpayments.reduce((sum, entry) => sum + entry.amount, 0) &&
              <Overpayment obligationId={item.id} post={request} refresh={refresh} />}
          </li>)}</ul>}
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
    {desk && <label>Визнаний платіж <select ref={paymentPicker} value={selected} disabled={busy} onChange={event => {
      setSelected(event.target.value); setDraft(undefined);
    }}><option value="">Оберіть платіж</option>
      {desk.payments.map(item => <option key={item.id} value={item.id}>
        {item.receivedOn} · {desk.payers.find(payer => payer.id === item.payerId)?.name} · {money.format(item.amount)} · {item.reason}
      </option>)}
    </select></label>}
    {payment && <div key={payment.id}>
      <p>Початкова сума {money.format(payment.originalAmount)} · Чинна сума {money.format(payment.amount)}</p>
      {canCorrect && !payment.bankTransactionId && !payment.cashAcceptance && payment.allocations.length === 0 && payment.advances.length === 0 &&
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
          {entry.id} · {entry.sourceBatchId} ·{' '}
          {statementLink(entry.sourceObligationId, 'Відкрити виписку за вихідним рахунком')}
          {' → '}{statementLink(entry.targetObligationId, 'Відкрити виписку за цільовим рахунком')} · {money.format(entry.amount)}
          {' · '}{entry.reason} · Автор {entry.author} · {when(entry.recordedAt)}
        </li>)}
      </ul>}
      <p>Нерозподілений залишок {money.format(payment.available)}</p>
      {canManageAdvance && payment.available > 0 && <AdvanceForm sourceId={payment.id} post={request} refresh={refresh} />}
      {payment.advances.map(advance => <details key={advance.id}>
        <summary>Аванс на членські внески · залишок {money.format(advance.available)}</summary>
        <p>{money.format(advance.amount)} · {advance.reason} · Автор {advance.author} · {when(advance.recordedAt)}</p>
        {advance.applications.map(item => <p key={item.id}>
          {money.format(item.amount)} · {statementLink(item.obligationId, 'Відкрити виписку за рахунком')}
          {' · '}{item.reason} · Автор {item.author} · {when(item.recordedAt)}
        </p>)}
        {advance.releases.map(item => <p key={item.id}>
          Знято з резерву {money.format(item.amount)} · {item.reason} · Автор {item.author} · {when(item.recordedAt)}
        </p>)}
        {canManageAdvance && advance.available > 0 && <AdvanceForm sourceId={advance.id} post={request} refresh={refresh}
          targets={obligations.filter(item => item.kind === 'member-fee')} />}
        {canManageAdvance && advance.available > 0 && <AdvanceForm sourceId={advance.id} post={request} refresh={refresh} release />}
      </details>)}
      <p>{payment.reason} · Автор {payment.author} · {when(payment.recordedAt)}</p>
      {payment.bankTransactionId && <p>Банківська операція {payment.bankTransactionId} · Платіж {payment.id}</p>}
      {payment.cashAcceptance && <p>Прийом готівки {payment.cashAcceptance.id} · Платіж {payment.id} ·
        {' '}{money.format(payment.cashAcceptance.amount)} · {payment.cashAcceptance.acceptedOn} ·
        {' '}{payment.cashAcceptance.reason} · Касир {payment.cashAcceptance.cashier} · {when(payment.cashAcceptance.recordedAt)}</p>}
      {payment.allocations.length > 0 && <ul aria-label="Історія розподілів">
        {payment.allocations.map(entry => <li key={entry.id}>
          {entry.reason} · Автор {entry.author} · {when(entry.recordedAt)}
          <ul>{entry.lines.map(line => <li key={line.obligationId}>
              {statementLink(line.obligationId, 'Відкрити виписку за рахунком')}
              {' · '}{money.format(line.amount)}
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
