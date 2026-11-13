import { useState } from 'react';
import { money } from './billing';

type Input = { requestId: string; sourceId: string; obligationId: string | null; amount: number; reason: string; release: boolean };
type Preview = { outcome: string; digest: string; available: number; outstanding: number | null };

export function AdvanceForm({ sourceId, targets, post, refresh, release = false }: {
  sourceId: string; targets?: { id: string; account: string; outstanding: number }[];
  release?: boolean;
  post: (path: string, body: object) => Promise<unknown>; refresh: () => Promise<void>;
}) {
  const [draft, setDraft] = useState<{ input: Input; preview: Preview }>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const applying = targets !== undefined;

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setMessage('');
    try { await action(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Операція з авансом недоступна.'); }
    finally { setBusy(false); }
  }

  return <details>
    <summary>{release ? 'Зняти невикористаний резерв' : applying ? 'Застосувати аванс' : 'Визнати аванс на членські внески'}</summary>
    <form onChange={() => setDraft(undefined)} onSubmit={event => {
      event.preventDefault();
      const fields = new FormData(event.currentTarget);
      const input = { requestId: crypto.randomUUID(), sourceId, release, obligationId: applying ? String(fields.get('obligation')) : null,
        amount: Number(String(fields.get('amount')).replace(',', '.')), reason: String(fields.get('reason')) };
      setDraft(undefined);
      void run(async () => {
        const preview = await post('/advance/preview', input) as Preview;
        if (preview.outcome !== 'Ready') throw new Error(preview.outcome === 'AmountExceeded'
          ? 'Сума перевищує доступний залишок.' : 'Платіж, аванс або майбутній внесок недоступні.');
        setDraft({ input, preview });
      });
    }}>
      <fieldset disabled={busy}>
        {applying && <label>Членський внесок <select name="obligation" required>
          <option value="">Оберіть внесок</option>
          {targets.map(target => <option key={target.id} value={target.id}>{target.account} · {money.format(target.outstanding)}</option>)}
        </select></label>}{' '}
        <label>Сума авансу <input name="amount" inputMode="decimal" required /></label>{' '}
        <label>Підстава операції з авансом <input name="reason" required maxLength={500} /></label>{' '}
        <button>Переглянути операцію з авансом</button>
      </fieldset>
    </form>
    {draft && <>
      <p>Залишок {money.format(draft.preview.available)} → {money.format(draft.preview.available - draft.input.amount)}
        {draft.preview.outstanding !== null && <> · Залишок внеску {money.format(draft.preview.outstanding - draft.input.amount)}</>}</p>
      {release && <p>Нерозподілений залишок платежу збільшиться на {money.format(draft.input.amount)}.</p>}
      <button type="button" disabled={busy} onClick={() => void run(async () => {
        await post('/advance/confirm', { input: draft.input, digest: draft.preview.digest });
        setDraft(undefined);
        await refresh();
        setMessage(release ? 'Резерв знято.' : applying ? 'Аванс застосовано.' : 'Аванс визнано.');
      })}>Підтвердити операцію з авансом</button>
    </>}
    <p role="status">{message}</p>
  </details>;
}
