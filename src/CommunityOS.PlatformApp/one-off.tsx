import { useState } from 'react';
import { money } from './billing';

type Account = { id: string; number: string; debtor: string | null; status: string };
type Input = { requestId: string; accounts: string[]; amount: number; purpose: string; reason: string; dueOn: string };
type Plan = { input: Input; accounts: Account[]; total: number; digest: string; ready: boolean };
type Posted = { id: string; author: string; postedAt: string; snapshot: Plan };

const messages: Record<string, string> = {
  Ready: 'Готово', AmbiguousDebtor: 'Не визначено єдиного платника', Unavailable: 'Рахунок недоступний',
  InvalidInput: 'Виберіть рахунки та введіть додатну суму з точністю до копійок, підставу і строк оплати.',
  StalePreview: 'Дані змінилися. Сформуйте новий попередній розрахунок.',
  RequestConflict: 'Цей запит уже використано для іншого нарахування.', Incomplete: 'Є рахунки, за якими провести нарахування неможливо.',
};

function Summary({ plan }: { plan: Plan }) {
  return <>
    <p>{plan.input.purpose} · {plan.input.reason} · Сплатити до {plan.input.dueOn}</p>
    <table><caption>Рахунки й суми</caption><thead><tr><th>Рахунок</th><th>Платник</th><th>Сума</th><th>Стан</th></tr></thead>
      <tbody>{plan.accounts.map(account => <tr key={account.id}>
        <td>{account.number || account.id}</td><td>{account.debtor ?? '—'}</td>
        <td>{money.format(plan.input.amount)}</td><td>{messages[account.status]}</td>
      </tr>)}</tbody>
    </table>
    <p>Усього {money.format(plan.total)}</p>
  </>;
}

export function OneOff({ community, canPost }: { community: string; canPost: boolean }) {
  const base = '/community/billing/' + community + '/one-off';
  const [accounts, setAccounts] = useState<Account[]>();
  const [history, setHistory] = useState<Posted[]>();
  const [plan, setPlan] = useState<Plan>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

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
    if (!response.ok) throw new Error(messages[data?.outcome] ?? 'Не вдалося виконати запит.');
    return data;
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setMessage('');
    try { await action(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Не вдалося виконати запит.'); }
    finally { setBusy(false); }
  }

  return <section aria-labelledby="one-off-heading">
    <h2 id="one-off-heading">Разове цільове нарахування</h2>
    <button disabled={busy} onClick={() => void run(async () => setAccounts(await request('/accounts')))}>Завантажити рахунки</button>{' '}
    <button disabled={busy} onClick={() => void run(async () => setHistory(await request('/history')))}>Історія разових нарахувань</button>
    {accounts && <form onChange={() => setPlan(undefined)} onSubmit={event => {
      event.preventDefault();
      const fields = new FormData(event.currentTarget);
      setPlan(undefined);
      void run(async () => setPlan(await request('/preview', {
        requestId: crypto.randomUUID(), accounts: fields.getAll('accounts'),
        amount: Number(String(fields.get('amount')).replace(',', '.')),
        purpose: fields.get('purpose'), reason: fields.get('reason'), dueOn: fields.get('dueOn'),
      })));
    }}>
      <fieldset disabled={busy}><legend>Рахунки для нарахування</legend>
        {accounts.map(account => <div key={account.id}><label>
          <input type="checkbox" name="accounts" value={account.id} /> {account.number} · {account.debtor ?? messages[account.status]}
        </label></div>)}
        <label>Сума на рахунок, грн <input name="amount" required inputMode="decimal" /></label>{' '}
        <label>Призначення <input name="purpose" required maxLength={200} /></label>{' '}
        <label>Підстава <input name="reason" required maxLength={500} /></label>{' '}
        <label>Строк оплати <input name="dueOn" type="date" required /></label>{' '}
        <button>Попередній розрахунок разового нарахування</button>
      </fieldset>
    </form>}
    {plan && <>
      <Summary plan={plan} />
      {canPost && plan.ready && <button disabled={busy} onClick={() => void run(async () => {
        await request('/post', { input: plan.input, digest: plan.digest });
        setPlan(undefined);
        setMessage('Разове нарахування проведено.');
        setHistory(await request('/history'));
      })}>Підтвердити разове нарахування</button>}
    </>}
    {history && <div>
      {history.length === 0 && <p>Разових нарахувань немає.</p>}
      {history.map(item => <details key={item.id}>
        <summary>{item.snapshot.input.purpose} · {new Date(item.postedAt).toLocaleString('uk-UA')}</summary>
        <p>Автор {item.author}</p><Summary plan={item.snapshot} />
      </details>)}
    </div>}
    <p role="status">{message}</p>
  </section>;
}
