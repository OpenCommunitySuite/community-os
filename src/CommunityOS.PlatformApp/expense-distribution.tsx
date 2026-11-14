import { useRef, useState } from 'react';
import { money } from './billing';

type Part = { budgetItemId: string; amount: number };
type Preview = { amount: number; items: { id: string; budget: string; designation: string }[];
  history: { id: string; recordedAt: string; parts: Part[] }[] };

function cents(amount: number) { return Math.round(amount * 100); }

export function ExpenseDistribution({ endpoint, canAllocate }: { endpoint: string; canAllocate: boolean }) {
  const [preview, setPreview] = useState<Preview>();
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const previous = useRef<{ payload: string; id: string } | undefined>(undefined);
  const parts = Object.entries(amounts).filter(([, amount]) => Number(amount) > 0)
    .map(([budgetItemId, amount]) => ({ budgetItemId, amount: Number(amount) }));
  const remainder = ((preview ? cents(preview.amount) : 0) -
    parts.reduce((sum, part) => sum + cents(part.amount), 0)) / 100;

  async function load() {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error('Не вдалося завантажити розподіл.');
    const result: Preview = await response.json();
    setPreview(result);
    setAmounts(Object.fromEntries((result.history[0]?.parts ?? [])
      .map(part => [part.budgetItemId, String(part.amount)])));
    previous.current = undefined;
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setMessage('');
    try { await action(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Не вдалося виконати дію.'); }
    finally { setBusy(false); }
  }

  return <details>
    <summary>Розподіл витрати</summary>
    <button type="button" disabled={busy} onClick={() => void run(load)}>Оновити розподіл</button>
    {preview && <>
      <p>Нерозподілено: {money.format(remainder)}</p>
      {canAllocate && <form onSubmit={event => {
        event.preventDefault();
        const data = { previousId: preview.history[0]?.id ?? null, parts };
        const payload = JSON.stringify(data);
        if (previous.current?.payload !== payload) previous.current = { payload, id: crypto.randomUUID() };
        const requestId = previous.current.id;
        void run(async () => {
          const csrf = await fetch('/platform/csrf');
          if (!csrf.ok) throw new Error('Увійдіть повторно.');
          const { token } = await csrf.json();
          const response = await fetch(endpoint, { method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Platform-CSRF': token },
            body: JSON.stringify({ ...data, requestId }) });
          if (response.status === 403) throw new Error('Дозвіл на розподіл витрати відсутній.');
          if (response.status === 409) throw new Error('Розподіл змінився. Оновіть його та повторіть введення.');
          if (!response.ok) throw new Error('Перевірте статті та суми розподілу.');
          const { outcome } = await response.json();
          await load();
          setMessage(outcome === 'Replayed' ? 'Розподіл уже збережено.' : 'Розподіл збережено.');
        });
      }}>
        <fieldset disabled={busy}>
          <legend>Суми за статтями</legend>
          {preview.items.map(item => <div key={item.id}>
            <label>{item.budget} · {item.designation} <input type="number" min="0" max="999999999"
              step="0.01" value={amounts[item.id] ?? ''}
              onChange={event => setAmounts({ ...amounts, [item.id]: event.target.value })} /></label>
          </div>)}
          <button disabled={remainder < 0 || parts.length > 100 || (!parts.length && !preview.history.length)}>
            Підтвердити розподіл
          </button>
        </fieldset>
      </form>}
      {preview.history.length > 0 && <ol aria-label="Історія розподілу">
        {preview.history.map(revision => <li key={revision.id}>
          <time dateTime={revision.recordedAt}>{new Date(revision.recordedAt).toLocaleString('uk-UA')}</time>
          {revision.parts.length === 0 && <> · Без розподілу</>}
          {revision.parts.map(part => {
            const item = preview.items.find(candidate => candidate.id === part.budgetItemId);
            return <div key={part.budgetItemId}>{item?.budget} · {item?.designation} · {money.format(part.amount)}</div>;
          })}
        </li>)}
      </ol>}
    </>}
    <p role="status">{message}</p>
  </details>;
}
