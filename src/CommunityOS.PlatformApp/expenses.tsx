import { useRef, useState } from 'react';
import { money } from './billing';

type Expense = { id: string; incurredOn: string; purpose: string; amount: number; evidence: string };

export function Expenses({ community, canRecognize }: { community: string; canRecognize: boolean }) {
  const endpoint = '/community/billing/' + community + '/expenses';
  const [expenses, setExpenses] = useState<Expense[]>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const previous = useRef<{ payload: string; id: string } | undefined>(undefined);

  async function load() {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error('Не вдалося завантажити витрати.');
    setExpenses(await response.json());
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setMessage('');
    try { await action(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Не вдалося виконати дію.'); }
    finally { setBusy(false); }
  }

  return <details>
    <summary>Витрати</summary>
    <button type="button" disabled={busy} onClick={() => void run(load)}>Завантажити витрати</button>
    {canRecognize && <form onSubmit={event => {
      event.preventDefault();
      const form = event.currentTarget;
      const fields = new FormData(form);
      const data = { purpose: fields.get('purpose'), incurredOn: fields.get('incurredOn'),
        amount: Number(fields.get('amount')), evidence: fields.get('evidence') };
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
        if (response.status === 403) throw new Error('Дозвіл на визнання витрат відсутній.');
        if (!response.ok) throw new Error('Не вдалося визнати витрату. Перевірте дані та повторіть спробу.');
        const { outcome } = await response.json();
        await load();
        form.reset();
        previous.current = undefined;
        setMessage(outcome === 'Replayed' ? 'Витрату вже визнано.' : 'Витрату визнано.');
      });
    }}>
      <fieldset disabled={busy}>
        <legend>Визнання витрати</legend>
        <label>Призначення витрати <input name="purpose" required maxLength={200} /></label>{' '}
        <label>Дата витрати <input name="incurredOn" type="date" required /></label>{' '}
        <label>Сума витрати <input name="amount" type="number" min="0.01" max="999999999" step="0.01" required /></label>{' '}
        <label>Підстава витрати <input name="evidence" required maxLength={500} /></label>{' '}
        <button>Визнати витрату</button>
      </fieldset>
    </form>}
    {expenses?.length === 0 && <p>Визнаних витрат немає.</p>}
    {!!expenses?.length && <table><caption>Визнані витрати</caption>
      <thead><tr><th>Дата</th><th>Призначення</th><th>Сума</th><th>Підстава</th></tr></thead>
      <tbody>{expenses.map(expense => <tr key={expense.id}><td>{expense.incurredOn}</td>
        <th scope="row">{expense.purpose}</th><td>{money.format(expense.amount)}</td><td>{expense.evidence}</td>
      </tr>)}</tbody>
    </table>}
    <p role="status">{message}</p>
  </details>;
}
