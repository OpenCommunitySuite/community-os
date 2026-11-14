import { useRef, useState } from 'react';
import { money } from './billing';

type Budget = { id: string; title: string; startsOn: string; endsOn: string; evidence: string;
  plannedTotal: number; actualTotal: number; variance: number; periodUnallocated: number;
  items: { id: string; designation: string; amount: number; actual: number; variance: number }[] };

export function Budgets({ community, canRegister }: { community: string; canRegister: boolean }) {
  const endpoint = '/community/billing/' + community + '/budgets';
  const [budgets, setBudgets] = useState<Budget[]>();
  const [count, setCount] = useState(1);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const previous = useRef<{ payload: string; id: string } | undefined>(undefined);

  async function load() {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error('Не вдалося завантажити кошториси.');
    setBudgets(await response.json());
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setMessage('');
    try { await action(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Не вдалося виконати дію.'); }
    finally { setBusy(false); }
  }

  return <details>
    <summary>Кошториси</summary>
    <button type="button" disabled={busy} onClick={() => void run(load)}>Завантажити кошториси</button>
    {canRegister && <form onSubmit={event => {
      event.preventDefault();
      const form = event.currentTarget;
      const fields = new FormData(form);
      const data = { title: fields.get('title'), evidence: fields.get('evidence'),
        startsOn: fields.get('startsOn'), endsOn: fields.get('endsOn'),
        items: fields.getAll('designation').map((designation, index) =>
          ({ designation, amount: Number(fields.getAll('amount')[index]) })) };
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
        if (response.status === 403) throw new Error('Дозвіл на реєстрацію відсутній.');
        if (!response.ok) throw new Error('Перевірте дані кошторису та повторіть спробу.');
        const { outcome } = await response.json();
        await load();
        form.reset();
        setCount(1);
        previous.current = undefined;
        setMessage(outcome === 'Replayed' ? 'Кошторис уже зареєстровано.' : 'Кошторис зареєстровано.');
      });
    }}>
      <fieldset disabled={busy}>
        <legend>Реєстрація затвердженого кошторису</legend>
        <label>Назва кошторису <input name="title" required maxLength={200} /></label>{' '}
        <label>Підстава кошторису <input name="evidence" required maxLength={500} /></label>{' '}
        <label>Початок кошторису <input name="startsOn" type="date" required /></label>{' '}
        <label>Кінець кошторису <input name="endsOn" type="date" required /></label>
        {Array.from({ length: count }, (_, index) => <div key={index}>
          <label>Стаття {index + 1} <input name="designation" required maxLength={200} /></label>{' '}
          <label>Сума статті {index + 1} <input name="amount" type="number" min="0" max="999999999" step="0.01" required /></label>
        </div>)}
        <button type="button" disabled={count >= 100} onClick={() => setCount(count + 1)}>Додати статтю</button>{' '}
        <button type="button" disabled={count <= 1} onClick={() => setCount(count - 1)}>Вилучити останню статтю</button>{' '}
        <button>Зареєструвати кошторис</button>
      </fieldset>
    </form>}
    {budgets?.length === 0 && <p>Зареєстрованих кошторисів немає.</p>}
    {budgets?.map(budget => <section key={budget.id}>
      <h3>{budget.title}</h3>
      <p>{budget.startsOn} — {budget.endsOn} · {budget.evidence}</p>
      <table><caption>Статті кошторису {budget.title}</caption>
        <thead><tr><th>Стаття</th><th>План</th><th>Факт</th><th>Відхилення</th></tr></thead>
        <tbody>{budget.items.map(item => <tr key={item.id}>
          <th scope="row">{item.designation}</th><td>{money.format(item.amount)}</td><td>{money.format(item.actual)}</td>
          <td>{money.format(item.variance)}</td>
        </tr>)}</tbody>
        <tfoot><tr><th scope="row">Разом</th><td>{money.format(budget.plannedTotal)}</td>
          <td>{money.format(budget.actualTotal)}</td><td>{money.format(budget.variance)}</td></tr></tfoot>
      </table>
      <p>Нерозподілені витрати спільноти за період: {money.format(budget.periodUnallocated)}</p>
    </section>)}
    <p role="status">{message}</p>
  </details>;
}
