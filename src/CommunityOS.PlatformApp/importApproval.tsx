import { useEffect, useState } from 'react';

type Key = { draftId: string; revision: number; planId: string };
type Submission = { key: Key; submittedAt: string; applied: boolean };
type Preview = { preview: { canProceed: boolean; candidates: {
  row: number; plotNumber: string; ownerKey: string; ownerName: string; accountNumber: string; issues: string[];
}[] } };
type Receipt = { confirmedBy: string; recordedAtUtc: string; items: {
  sourceRow: number; plotId: string; plotNumber: string; importedSubjectId: string; accountId: string; accountNumber: string;
}[] };

const path = (key: Key) => key.draftId + '/' + key.revision + '/' + key.planId;

async function checked(response: Response) {
  if (response.ok) return response;
  const messages: Record<number, string> = {
    403: 'Доступ до затвердження недоступний.',
    404: 'Переданий план або звіт недоступний.',
    409: 'План застарів, уже застосований або конфліктує з реєстром.',
  };
  throw new Error(messages[response.status] ?? 'Не вдалося виконати запит.');
}

export function ImportApproval({ community }: { community: string }) {
  const url = '/community/import-approvals/' + community;
  const [items, setItems] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<Submission>();
  const [preview, setPreview] = useState<Preview>();
  const [receipt, setReceipt] = useState<Receipt>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function loadList() {
    setItems(await (await checked(await fetch(url))).json());
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setMessage('');
    try { await action(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Не вдалося виконати запит.'); }
    finally { setBusy(false); }
  }

  useEffect(() => { void run(loadList); }, [url]);

  async function open(item?: Submission) {
    setSelected(item);
    setPreview(undefined);
    setReceipt(undefined);
    if (!item) return;
    const endpoint = url + '/' + path(item.key);
    if (item.applied) setReceipt(await (await checked(await fetch(endpoint + '/receipt'))).json());
    else setPreview(await (await checked(await fetch(endpoint))).json());
  }

  async function apply(item: Submission) {
    const { token } = await (await checked(await fetch('/platform/csrf'))).json();
    const endpoint = url + '/' + path(item.key);
    await checked(await fetch(endpoint + '/approve', { method: 'POST', headers: { 'X-Platform-CSRF': token } }));
    await open({ ...item, applied: true });
    await loadList();
    setMessage('Імпорт застосовано. Звіт доступний нижче.');
  }

  return <section aria-labelledby="approval-heading">
    <h2 id="approval-heading">Затвердження імпорту OSBBX</h2>
    <button type="button" disabled={busy} onClick={() => void run(loadList)}>Оновити перелік</button>{' '}
    <label>Передані плани{' '}
      <select value={selected ? path(selected.key) : ''} disabled={busy}
        onChange={event => { const item = items.find(entry => path(entry.key) === event.target.value);
          void run(() => open(item)); }}>
        <option value="">Оберіть план</option>
        {items.map(item => <option key={path(item.key)} value={path(item.key)}>
          {new Date(item.submittedAt).toLocaleString('uk-UA')} · {item.key.draftId.slice(-8)} · ревізія {item.key.revision}
          {item.applied ? ' · застосовано' : ''}
        </option>)}
      </select>
    </label>
    {preview && selected && <>
      <p>Ревізія {selected.key.revision} · <code>{selected.key.planId}</code></p>
      <table>
        <thead><tr><th>Рядок Excel</th><th>Ділянка</th><th>Власник</th><th>Ключ власника</th>
          <th>Особовий рахунок</th><th>Перевірка</th></tr></thead>
        <tbody>{preview.preview.candidates.map(row => <tr key={row.row}>
          <td>{row.row}</td><td>{row.plotNumber}</td><td>{row.ownerName}</td><td>{row.ownerKey}</td>
          <td>{row.accountNumber}</td><td>{row.issues.length > 0 ? 'Є конфлікти' : 'Перевірено'}</td>
        </tr>)}</tbody>
      </table>
      <button type="button" disabled={busy || !preview.preview.canProceed}
        onClick={() => void run(() => apply(selected))}>Підтвердити й застосувати імпорт</button>
    </>}
    {receipt && <>
      <h3>Звіт про імпорт</h3>
      <p>Затвердив {receipt.confirmedBy} · {new Date(receipt.recordedAtUtc).toLocaleString('uk-UA')}</p>
      <table>
        <thead><tr><th>Рядок Excel</th><th>Ділянка</th><th>Ідентифікатор ділянки</th><th>Ідентифікатор власника</th>
          <th>Особовий рахунок</th><th>Ідентифікатор рахунку</th></tr></thead>
        <tbody>{receipt.items.map(row => <tr key={row.sourceRow}>
          <td>{row.sourceRow}</td><td>{row.plotNumber}</td><td>{row.plotId}</td><td>{row.importedSubjectId}</td>
          <td>{row.accountNumber}</td><td>{row.accountId}</td>
        </tr>)}</tbody>
      </table>
    </>}
    <p role="status">{message}</p>
  </section>;
}
