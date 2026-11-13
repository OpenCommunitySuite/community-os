import { useEffect, useState } from 'react';
import { labels, money, type Register } from './billing';
import { AccrualSummary } from './accrual-summary';

type Calculation = { amountUah: number; multiplier: number; tariff: { id: string; basis: string }; registers: Register[] };
type Plan = { originalAmount: number; currentAmount: number; difference: number; calculation: Calculation;
  appliedAmount?: number; excessBefore?: number; excessAfter?: number };
type Change = { id: string; reason: string; accountId: string; recordedAt: string; snapshot: Plan };
type Accrual = { id: string; accountNumber: string; originalAmount: number; effectiveAmount: number; changes: Change[] };
type Result = { outcome: string; digest?: string; plan?: Plan };

function Details({ plan }: { plan: Plan }) {
  return <>
    <p>Початкова сума {money.format(plan.originalAmount)} · До перегляду {money.format(plan.currentAmount)} ·
      Нова сума {money.format(plan.calculation.amountUah)} · Різниця {money.format(plan.difference)}</p>
    <p>Коефіцієнт {plan.calculation.multiplier} · Тариф {plan.calculation.tariff.id} · {plan.calculation.tariff.basis}</p>
    {plan.appliedAmount !== undefined && plan.appliedAmount > 0 && <p>
      Застосовано {money.format(plan.appliedAmount)} · Надлишок оплати {money.format(plan.excessBefore ?? 0)} →
      {' '}{money.format(plan.excessAfter ?? 0)}
    </p>}
    <ul>{plan.calculation.registers.map(register => <li key={register.channel}>
      {labels[register.channel]} · {register.startValue} → {register.endValue} · {register.consumption} кВт·год ·
      {register.rate} грн/кВт·год
    </li>)}</ul>
  </>;
}

export function Recalculation({ endpoint, period, canConfirm, fees }: {
  endpoint: string; period: string; canConfirm: boolean; fees: { account: string; amount: number }[];
}) {
  const [loadedAccruals, setAccruals] = useState<Accrual[]>();
  const accruals = loadedAccruals ?? [];
  const [selected, setSelected] = useState('');
  const [reason, setReason] = useState('');
  const [preview, setPreview] = useState<Result>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const accrual = accruals.find(item => item.id === selected);

  async function refresh() {
    const response = await fetch(endpoint + '/periods/' + period + '/accruals');
    if (!response.ok) throw new Error('Історія нарахувань недоступна.');
    setAccruals(await response.json());
  }

  useEffect(() => { void refresh().catch(error => setMessage(error.message)); }, [endpoint, period]);

  async function submit(confirm: boolean) {
    setBusy(true);
    setMessage('');
    try {
      const csrf = await fetch('/platform/csrf');
      if (!csrf.ok) throw new Error('Увійдіть повторно.');
      const { token } = await csrf.json();
      const response = await fetch(endpoint + '/accruals/' + selected + '/recalculation/' + (confirm ? 'confirm' : 'preview'),
        { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Platform-CSRF': token },
          body: JSON.stringify({ reason, digest: confirm ? preview?.digest : undefined }) });
      if (response.status === 403) throw new Error('Дозвіл на цю дію відсутній.');
      const result: Result = await response.json();
      if (!response.ok) throw new Error(labels[result.outcome] ?? 'Не вдалося виконати перерахунок.');
      if (!confirm && result.plan) setPreview(result);
      else if (confirm) {
        setPreview(undefined);
        setMessage(result.outcome === 'Unchanged' ? 'Перевірку збережено без зміни суми.' : 'Перерахунок збережено.');
        await refresh();
      } else setMessage(labels[result.outcome] ?? 'Нарахування недоступне.');
    } catch (error) {
      setPreview(undefined);
      setMessage(error instanceof Error ? error.message : 'Не вдалося виконати перерахунок.');
    } finally { setBusy(false); }
  }

  return <>
    {loadedAccruals && <AccrualSummary electricity={loadedAccruals} fees={fees} />}
    <section aria-labelledby="recalculation-heading">
    <h3 id="recalculation-heading">Перерахунок електроенергії</h3>
    <label>Нарахування за рахунком <select value={selected} disabled={busy} onChange={event => {
      setSelected(event.target.value); setPreview(undefined); setReason(''); setMessage('');
    }}>
      <option value="">Оберіть рахунок</option>
      {accruals.map(item => <option key={item.id} value={item.id}>{item.accountNumber}</option>)}
    </select></label>
    {accrual && <>
      <p>Початкове нарахування {money.format(accrual.originalAmount)} · Чинна сума {money.format(accrual.effectiveAmount)}</p>
      <form onSubmit={event => { event.preventDefault(); void submit(false); }}>
        <label>Підстава перерахунку <input required maxLength={500} value={reason} disabled={busy}
          onChange={event => { setReason(event.target.value); setPreview(undefined); }} /></label>{' '}
        <button disabled={busy}>Попередній перерахунок</button>
      </form>
      {preview?.plan && <><Details plan={preview.plan} />
        {canConfirm && <button type="button" disabled={busy} onClick={() => void submit(true)}>Підтвердити перерахунок</button>}
      </>}
      {accrual.changes.length > 0 && <ul aria-label="Історія перерахунків">{accrual.changes.map(change => <li key={change.id}>
        <p>{change.reason} · {new Date(change.recordedAt).toLocaleString('uk-UA')} · {change.accountId}</p>
        <Details plan={change.snapshot} />
      </li>)}</ul>}
    </>}
    <p role="status">{message}</p>
    </section>
  </>;
}
