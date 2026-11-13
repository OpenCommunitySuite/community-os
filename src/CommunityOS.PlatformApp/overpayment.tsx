import { useState } from 'react';
import { money } from './billing';

type Input = { requestId: string; obligationId: string; amount: number; reason: string };
type Preview = { outcome: string; digest: string; excess: number; recognized: number; available: number };

export function Overpayment({ obligationId, post, refresh }: {
  obligationId: string; post: (path: string, body: object) => Promise<unknown>; refresh: () => Promise<void>;
}) {
  const [draft, setDraft] = useState<{ input: Input; preview: Preview }>();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setMessage('');
    try { await action(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Не вдалося визнати переплату.'); }
    finally { setBusy(false); }
  }

  return <div>
    <form onChange={() => setDraft(undefined)} onSubmit={event => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const input = { requestId: crypto.randomUUID(), obligationId,
        amount: Number(String(data.get('amount')).replace(',', '.')), reason: String(data.get('reason')) };
      setDraft(undefined);
      void run(async () => {
        const preview = await post('/overpayment/preview', input) as Preview;
        if (preview.outcome !== 'Ready') throw new Error('Сума перевищує доступний надлишок або зобов’язання недоступне.');
        setDraft({ input, preview });
      });
    }}>
      <fieldset disabled={busy}>
        <label>Сума переплати <input name="amount" inputMode="decimal" required /></label>{' '}
        <label>Підстава визнання переплати <input name="reason" required maxLength={500} /></label>{' '}
        <button>Переглянути визнання переплати</button>
      </fieldset>
    </form>
    {draft && <>
      <p>Надлишок {money.format(draft.preview.excess)} · Уже визнано {money.format(draft.preview.recognized)} ·
        {' '}До визнання {money.format(draft.input.amount)} · {draft.input.reason}</p>
      <button type="button" disabled={busy} onClick={() => void run(async () => {
        await post('/overpayment/confirm', { input: draft.input, digest: draft.preview.digest });
        setDraft(undefined);
        await refresh();
        setMessage('Переплату визнано.');
      })}>Підтвердити визнання переплати</button>
    </>}
    <p role="status">{message}</p>
  </div>;
}
