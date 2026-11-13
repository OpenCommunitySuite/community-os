import { useState } from 'react';
import { money } from './billing';

export type TransferLine = { batchId: string; obligationId: string; amount: number; isTransfer: boolean };
type Target = { id: string; account: string; kind: string; outstanding: number };
type Input = { requestId: string; paymentId: string; sourceBatchId: string; sourceIsTransfer: boolean;
  sourceObligationId: string; targetObligationId: string; amount: number; reason: string };
type Balance = { account: string; before: number; after: number };
type Preview = { outcome: string; digest: string; source: Balance; target: Balance;
  sourceExcessBefore: number; sourceExcessAfter: number };
const messages: Record<string, string> = {
  SourceExceeded: 'Сума перевищує доступну суму початкового розподілу.',
  RecognizedOverpayment: 'Перенесення зачіпає визнану переплату.',
  ObligationExceeded: 'Сума перевищує залишок цільового зобов’язання.',
  NotFound: 'Вибраний розподіл або зобов’язання недоступні.',
};
const key = (line: TransferLine) => [line.isTransfer, line.batchId, line.obligationId].join(':');

export function Reallocation({ paymentId, lines, targets, canConfirm, post, refresh }: {
  paymentId: string; lines: TransferLine[]; targets: Target[]; canConfirm: boolean;
  post: (path: string, body: object) => Promise<unknown>; refresh: () => Promise<void>;
}) {
  const [source, setSource] = useState('');
  const [draft, setDraft] = useState<{ input: Input; preview: Preview }>();
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const selected = lines.find(line => key(line) === source);
  async function run(action: () => Promise<void>) {
    setPending(true);
    setMessage('');
    try { await action(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Перерозподіл недоступний.'); }
    finally { setPending(false); }
  }
  if (lines.length === 0) return null;
  return <section aria-labelledby="reallocation-heading">
    <h3 id="reallocation-heading">Перерозподіл платежу</h3>
    <form onChange={() => setDraft(undefined)} onSubmit={event => {
      event.preventDefault();
      if (!selected) return;
      const data = new FormData(event.currentTarget);
      const input = { requestId: crypto.randomUUID(), paymentId, sourceBatchId: selected.batchId,
        sourceIsTransfer: selected.isTransfer, sourceObligationId: selected.obligationId,
        targetObligationId: String(data.get('target')), amount: Number(String(data.get('amount')).replace(',', '.')),
        reason: String(data.get('reason')) };
      void run(async () => {
        setDraft(undefined);
        const preview = await post('/reallocation/preview', input) as Preview;
        if (preview.outcome !== 'Ready') throw new Error(messages[preview.outcome] ?? 'Перерозподіл недоступний.');
        setDraft({ input, preview });
      });
    }}>
      <fieldset disabled={pending}>
        <label>Початковий розподіл <select required value={source} onChange={event => setSource(event.target.value)}>
          <option value="">Оберіть розподіл</option>
          {lines.map(line => <option key={key(line)} value={key(line)}>
            {money.format(line.amount)} · {line.obligationId} · {line.batchId}
          </option>)}
        </select></label>{' '}
        <label>Цільове зобов’язання <select key={source} name="target" required>
          <option value="">Оберіть зобов’язання</option>
          {targets.filter(target => target.id !== selected?.obligationId).map(target =>
            <option key={target.id} value={target.id}>{target.account} · {target.kind} · {money.format(target.outstanding)}</option>)}
        </select></label>{' '}
        <label>Сума перенесення <input name="amount" inputMode="decimal" required /></label>{' '}
        <label>Причина перерозподілу <input name="reason" maxLength={500} required /></label>{' '}
        <button>Переглянути перерозподіл</button>
      </fieldset>
    </form>
    {draft && <>
      <p>{money.format(draft.input.amount)} · {draft.input.reason}</p>
      <p>Початкове · {draft.preview.source.account} · {money.format(draft.preview.source.before)} → {money.format(draft.preview.source.after)}</p>
      {draft.preview.sourceExcessBefore > 0 && <p>Надлишок оплати · {money.format(draft.preview.sourceExcessBefore)} →
        {' '}{money.format(draft.preview.sourceExcessAfter)}</p>}
      <p>Цільове · {draft.preview.target.account} · {money.format(draft.preview.target.before)} → {money.format(draft.preview.target.after)}</p>
      {canConfirm && <button disabled={pending} onClick={() => void run(async () => {
        await post('/reallocation/confirm', { input: draft.input, digest: draft.preview.digest });
        setDraft(undefined);
        setSource('');
        await refresh();
        setMessage('Перерозподіл підтверджено.');
      })}>Підтвердити перерозподіл</button>}
    </>}
    <p role="status">{message}</p>
  </section>;
}
