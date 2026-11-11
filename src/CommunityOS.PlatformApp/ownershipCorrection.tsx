import { FormEvent, useEffect, useState } from 'react';

type Plot = { plotId: string; plotNumber: string; ownerId: string; ownerName: string; ownershipRevision: string };
type Owner = { id: string; name: string };
type History = { previousRevision: string; previousOwnerName: string; correctedOwnerName: string;
  reason: string; recordedAt: string; accountId: string | null; subjectId: string | null };

export function OwnershipCorrection({ community, entry, canCorrect, refresh }: {
  community: string; entry: Plot; canCorrect: boolean; refresh: () => Promise<void>;
}) {
  const register = '/community/register/' + community;
  const endpoint = register + '/plots/' + entry.plotId + '/corrections';
  const [history, setHistory] = useState<History[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const [stale, setStale] = useState(false);

  async function loadHistory() {
    const response = await fetch(endpoint);
    if (!response.ok) {
      setHistory([]);
      throw new Error('Не вдалося відкрити історію виправлень.');
    }
    setHistory(await response.json());
  }

  useEffect(() => {
    void loadHistory().catch(error => setMessage(error.message));
    if (canCorrect) void fetch(register + '/owners').then(async response => {
      if (!response.ok) throw new Error();
      setOwners(await response.json());
    }).catch(() => setMessage('Не вдалося завантажити власників.'));
  }, [endpoint, canCorrect, register]);

  async function correct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    setMessage('');
    try {
      const csrf = await fetch('/platform/csrf');
      if (!csrf.ok) throw new Error();
      const { token } = await csrf.json();
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Platform-CSRF': token },
        body: JSON.stringify({ revision: entry.ownershipRevision, ownerId: data.get('ownerId'), reason: data.get('reason') }),
      });
      if (response.ok) {
        form.reset();
        await refresh();
        await loadHistory();
        setMessage('Прив’язку власника виправлено.');
      } else if (response.status === 409) {
        setStale(true);
        setMessage('Запис змінився. Оновіть його та перевірте поточного власника.');
      } else if (response.status === 403) {
        setMessage('Ви не маєте дозволу виправляти прив’язку власника.');
      } else {
        setMessage('Не вдалося виправити прив’язку. Перевірте власника та причину.');
      }
    } catch {
      setStale(true);
      setMessage('Оновіть запис та перевірте історію перед повторною спробою.');
    } finally {
      setPending(false);
    }
  }

  async function reload() {
    setPending(true);
    try {
      await refresh();
      await loadHistory();
      setStale(false);
      setMessage('Запис оновлено. Перевірте поточного власника.');
    } catch {
      setMessage('Не вдалося оновити запис.');
    } finally {
      setPending(false);
    }
  }

  return <section aria-labelledby="correction-heading">
    <h2 id="correction-heading">Історія ділянки {entry.plotNumber}</h2>
    <p>Поточний власник · {entry.ownerName}</p>
    {canCorrect && <form key={entry.ownershipRevision} onSubmit={event => void correct(event)}>
      <fieldset disabled={pending || stale}>
        <legend>Виправити помилкову прив’язку</legend>
        <label>Правильний власник <select name="ownerId" defaultValue="" required>
          <option value="">Оберіть власника</option>
          {owners.filter(owner => owner.id !== entry.ownerId).map(owner =>
            <option key={owner.id} value={owner.id}>{owner.name} · {owner.id}</option>)}
        </select></label>{' '}
        <label>Причина виправлення <input name="reason" maxLength={500} required /></label>{' '}
        <button>Підтвердити виправлення</button>
      </fieldset>
    </form>}
    {stale && <button type="button" disabled={pending} onClick={() => void reload()}>Оновити запис</button>}
    {history.length > 0 && <table>
      <thead><tr><th>Час</th><th>Попередній власник</th><th>Виправлений власник</th><th>Причина</th>
        <th>Обліковий запис</th><th>Суб’єкт</th></tr></thead>
      <tbody>{history.map(item => <tr key={item.previousRevision}>
        <td>{new Date(item.recordedAt).toLocaleString('uk-UA')}</td><td>{item.previousOwnerName}</td>
        <td>{item.correctedOwnerName}</td><td>{item.reason}</td><td>{item.accountId ?? '—'}</td>
        <td>{item.subjectId ?? '—'}</td>
      </tr>)}</tbody>
    </table>}
    <p role="status">{message}</p>
  </section>;
}
