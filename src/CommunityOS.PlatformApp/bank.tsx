import { useState } from 'react';
import { money } from './billing';

type Row = { line: number; externalId: string; date: string | null; direction: string; amount: number | null; currency: string };
type Preview = { digest: string; outcome: string; rows: { row: Row; status: string }[] };
type Transaction = Row & { id: string; bankAccountId: string; raw: string; fileDigest: string; source: string;
  author: string; recordedAt: string; basis: string; paymentId: string | null };
type Desk = { accounts: { id: string; name: string; source: string }[]; payers: { id: string; name: string }[]; transactions: Transaction[] };
const labels: Record<string, string> = {
  New: 'Нова', Duplicate: 'Дублікат', Conflict: 'Дані операції відрізняються', incoming: 'Надходження', outgoing: 'Списання',
  InvalidFields: 'Некоректні поля', InvalidIdentifier: 'Некоректний ідентифікатор', InvalidDate: 'Некоректна дата',
  InvalidDirection: 'Некоректний напрям', InvalidAmount: 'Некоректна сума', UnsupportedCurrency: 'Непідтримувана валюта',
  InvalidRows: 'Виписка містить помилки або конфлікти.', StalePreview: 'Оновіть попередній перегляд.',
  InvalidHeader: 'Перевірте заголовок CSV.', EmptyStatement: 'У виписці немає операцій.',
  InvalidEncoding: 'Збережіть CSV у UTF-8.', FileTooLarge: 'Файл перевищує 128 КіБ.',
  TooManyRows: 'У файлі може бути щонайбільше 500 рядків.', RequestConflict: 'Операцію вже зіставлено з платежем.',
  Unavailable: 'Операція або платник недоступні.',
  InvalidDbf: 'Непідтримувана або пошкоджена структура DBF.',
  InvalidBankAccount: 'Некоректний рахунок у DBF.',
  BankAccountMismatch: 'Рахунок у DBF не збігається з вибраним рахунком.',
};

export function Bank({ community, canImport, canRecognize }: { community: string; canImport: boolean; canRecognize: boolean }) {
  const base = '/community/billing/' + community + '/bank';
  const [desk, setDesk] = useState<Desk>();
  const [account, setAccount] = useState('');
  const [file, setFile] = useState<File>();
  const [preview, setPreview] = useState<Preview>();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');

  async function refresh() {
    const response = await fetch(base + '/');
    if (!response.ok) throw new Error('Банківські операції недоступні.');
    setDesk(await response.json());
  }

  async function post(path: string, body: BodyInit, type: string, digest?: string) {
    const csrf = await fetch('/platform/csrf');
    if (!csrf.ok) throw new Error('Увійдіть повторно.');
    const { token } = await csrf.json();
    const headers: Record<string, string> = { 'Content-Type': type, 'X-Platform-CSRF': token };
    if (digest) headers['X-Bank-Preview'] = digest;
    const response = await fetch(base + path, { method: 'POST', body, headers });
    if (response.status === 403) throw new Error('Дозвіл на цю дію відсутній.');
    const result = await response.json().catch(() => null);
    if (result?.rows) setPreview(response.ok || result.outcome !== 'Ready' ? result : undefined);
    if (!response.ok) throw new Error(labels[result?.outcome] ?? 'Не вдалося виконати запит.');
    return result;
  }

  async function run(action: () => Promise<void>) {
    setPending(true);
    setMessage('');
    try { await action(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Не вдалося виконати запит.'); }
    finally { setPending(false); }
  }

  return <section aria-labelledby="bank-heading">
    <h2 id="bank-heading">Банківська виписка</h2>
    <button disabled={pending} onClick={() => void run(refresh)}>Завантажити банківські рахунки й операції</button>
    {desk && <>
      <label>Банківський рахунок <select value={account} disabled={pending} onChange={event => {
        setAccount(event.target.value); setPreview(undefined);
      }}>
        <option value="">Оберіть рахунок</option>
        {desk.accounts.map(item => <option key={item.id} value={item.id}>{item.name} · {item.source}</option>)}
      </select></label>{' '}
      <label>Файл виписки (CSV або DBF) <input type="file" accept=".csv,.dbf" disabled={pending} onChange={event => {
        setFile(event.target.files?.[0]); setPreview(undefined);
      }} /></label>{' '}
      <button disabled={!account || !file || pending} onClick={() => void run(async () => {
        if (!file) return;
        setPreview(undefined);
        await post('/' + account + '/preview', file, 'text/csv');
      })}>Переглянути виписку</button>
      {preview && <table>
        <caption>Рядки виписки</caption><thead><tr><th>Рядок</th><th>Операція</th><th>Дата</th>
          <th>Напрям</th><th>Сума</th><th>Валюта</th><th>Стан</th></tr></thead>
        <tbody>{preview.rows.map(({ row, status }) => <tr key={row.line}><td>{row.line}</td><td>{row.externalId}</td>
          <td>{row.date}</td><td>{labels[row.direction] ?? row.direction}</td><td>{row.amount}</td>
          <td>{row.currency}</td><td>{labels[status] ?? status}</td></tr>)}</tbody>
      </table>}
      {canImport && preview?.outcome === 'Ready' && <button disabled={pending} onClick={() => void run(async () => {
        if (!file) return;
        await post('/' + account + '/import', file, 'text/csv', preview.digest);
        await refresh();
        setMessage('Виписку імпортовано.');
      })}>Підтвердити імпорт виписки</button>}
      {desk.transactions.filter(item => item.bankAccountId === account).map(item => <details key={item.id}>
        <summary>{item.externalId} · {item.date} · {labels[item.direction]} · {money.format(item.amount ?? 0)}</summary>
        <p>Операція {item.id} · Джерело {item.source} · Рядок {item.line} · <code>{item.raw}</code></p>
        <p>SHA-256 {item.fileDigest} · Автор імпорту {item.author} · {new Date(item.recordedAt).toLocaleString('uk-UA')} · {item.basis}</p>
        {item.paymentId ? <p>Визнаний платіж {item.paymentId}</p> : item.direction === 'incoming' && <>
          <p>Платіж очікує визнання.</p>
          {canRecognize && <form onSubmit={event => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            void run(async () => {
              await post('/recognize', JSON.stringify({ transactionId: item.id, payerId: data.get('payer'), reason: data.get('reason') }),
                'application/json');
              await refresh();
              setMessage('Платіж визнано.');
            });
          }}>
            <label>Платник банківського платежу <select name="payer" required disabled={pending}>
              <option value="">Оберіть платника</option>
              {desk.payers.map(payer => <option key={payer.id} value={payer.id}>{payer.name}</option>)}
            </select></label>{' '}
            <label>Підстава визнання <input name="reason" maxLength={500} required disabled={pending} /></label>{' '}
            <button disabled={pending}>Підтвердити визнання платежу</button>
          </form>}
        </>}
      </details>)}
    </>}
    <p role="status">{message}</p>
  </section>;
}
