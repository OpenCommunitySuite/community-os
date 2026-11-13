import { useState } from 'react';
import { money } from './billing';

type Input = { requestId: string; paymentId: string; amount: number; reason: string };
type Preview = { outcome: string; digest: string; original: number; current: number; corrected: number;
  difference: number; available: number };

const messages: Record<string, string> = {
  Unchanged: 'Сума збігається з чинною.',
  UnsupportedChannel: 'Для цього способу платежу виправлення недоступне.',
  AllocatedPayment: 'Платіж уже має розподіл.',
};

export function PaymentCorrection({ paymentId, post, refresh }: {
  paymentId: string; post: (path: string, body: object) => Promise<unknown>; refresh: () => Promise<void>;
}) {
  const [draft, setDraft] = useState<{ input: Input; preview: Preview }>();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setMessage('');
    try { await action(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Виправлення недоступне.'); }
    finally { setBusy(false); }
  }

  return <section aria-labelledby="payment-correction-heading">
    <h3 id="payment-correction-heading">Виправлення суми платежу</h3>
    <form onChange={() => setDraft(undefined)} onSubmit={event => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const input = { requestId: crypto.randomUUID(), paymentId,
        amount: Number(String(data.get('amount')).trim().replace(',', '.')), reason: String(data.get('reason')) };
      setDraft(undefined);
      void run(async () => {
        const preview = await post('/correction/preview', input) as Preview;
        if (preview.outcome !== 'Ready') throw new Error(messages[preview.outcome] ?? 'Виправлення недоступне.');
        setDraft({ input, preview });
      });
    }}>
      <fieldset disabled={busy}>
        <label>Виправлена сума <input name="amount" inputMode="decimal" required /></label>{' '}
        <label>Підстава виправлення <input name="reason" maxLength={500} required /></label>{' '}
        <button>Переглянути виправлення</button>
      </fieldset>
    </form>
    {draft && <>
      <p>Початкова сума {money.format(draft.preview.original)} · Чинна {money.format(draft.preview.current)} ·
        {' '}Виправлена {money.format(draft.preview.corrected)} · Різниця {money.format(draft.preview.difference)}</p>
      <p>Майбутній нерозподілений залишок {money.format(draft.preview.available)} · {draft.input.reason}</p>
      <button disabled={busy} onClick={() => void run(async () => {
        await post('/correction/confirm', { input: draft.input, digest: draft.preview.digest });
        setDraft(undefined);
        await refresh();
        setMessage('Виправлення підтверджено.');
      })}>Підтвердити виправлення</button>
    </>}
    <p role="status">{message}</p>
  </section>;
}
