import { FormEvent, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ImportPreparation } from './importPreparation';
import { ImportApproval } from './importApproval';
import { OwnershipCorrection } from './ownershipCorrection';
import { Electricity } from './electricity';

type Community = { id: string; name: string; canRead: boolean; canAdd: boolean; canPrepareImport: boolean;
  canApproveImport: boolean; canCorrectOwnership: boolean; canReadElectricity: boolean;
  canSetupElectricity: boolean; canRecognizeElectricity: boolean };
type Entry = { plotId: string; plotNumber: string; ownerId: string; ownerName: string; accountNumber: string;
  ownershipRevision: string };

function Register() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selected, setSelected] = useState('');
  const activeCommunity = useRef('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [existing, setExisting] = useState(false);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const [historyPlot, setHistoryPlot] = useState('');
  const community = communities.find(item => item.id === selected);
  const owners = [...new Map(entries.map(entry => [entry.ownerId, entry])).values()];

  useEffect(() => {
    fetch('/community/register/communities').then(async response => {
      if (response.status === 401) {
        setMessage('Увійдіть, щоб відкрити реєстр.');
        return;
      }
      if (!response.ok) throw new Error();
      const available: Community[] = await response.json();
      setCommunities(available);
      if (available.length === 0) setMessage('У вас немає доступу до реєстрів громад.');
    }).catch(() => setMessage('Не вдалося завантажити громади.'));
  }, []);

  async function read(item: Community) {
    if (!item.canRead) return;
    const response = await fetch('/community/register/' + item.id);
    if (activeCommunity.current !== item.id) return;
    if (!response.ok) {
      setEntries([]);
      setMessage('Не вдалося відкрити реєстр. Перевірте доступ.');
      return;
    }
    const records = await response.json();
    if (activeCommunity.current === item.id) setEntries(records);
  }

  async function select(id: string) {
    activeCommunity.current = id;
    setSelected(id);
    setHistoryPlot('');
    setEntries([]);
    setExisting(false);
    setMessage('');
    const item = communities.find(candidate => candidate.id === id);
    if (!item) return;
    setPending(true);
    try {
      await read(item);
    } catch {
      setMessage('Не вдалося завантажити реєстр.');
    } finally {
      setPending(false);
    }
  }

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!community?.canAdd || pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    setMessage('');
    try {
      const csrf = await fetch('/platform/csrf');
      if (!csrf.ok) throw new Error();
      const { token } = await csrf.json();
      const response = await fetch('/community/register/' + community.id, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Platform-CSRF': token },
        body: JSON.stringify(Object.fromEntries(data)),
      });
      if (response.ok) {
        form.reset();
        setMessage('Ділянку та особовий рахунок додано.');
        await read(community);
      } else if (response.status === 409) {
        setMessage('Ділянка або особовий рахунок із таким номером уже існує.');
      } else if (response.status === 403) {
        setMessage('Ви не маєте дозволу додавати записи.');
      } else {
        setMessage('Не вдалося додати запис. Перевірте введені дані.');
      }
    } catch {
      setMessage('Не вдалося завершити запит. Перевірте стан реєстру.');
    } finally {
      setPending(false);
    }
  }

  return <>
    <h1>Реєстр громади</h1>
    <p><a href="/platform/">Вхід до облікового запису</a></p>
    {communities.length > 0 && <label>Громада{' '}
      <select value={selected} disabled={pending} onChange={event => void select(event.target.value)}>
        <option value="">Оберіть громаду</option>
        {communities.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
    </label>}
    {community?.canRead && <table>
      <thead><tr><th>Ділянка</th><th>Власник</th><th>Особовий рахунок</th><th>Історія</th></tr></thead>
      <tbody>{entries.map(entry => <tr key={entry.plotId}>
        <td>{entry.plotNumber}</td><td>{entry.ownerName}</td><td>{entry.accountNumber}</td>
        <td><button type="button" onClick={() => setHistoryPlot(entry.plotId)}
          aria-label={'Історія ділянки ' + entry.plotNumber}>Відкрити</button></td>
      </tr>)}</tbody>
    </table>}
    {community?.canRead && entries.filter(entry => entry.plotId === historyPlot).map(entry =>
      <OwnershipCorrection key={community.id + ':' + entry.plotId} community={community.id}
        entry={entry} canCorrect={community.canCorrectOwnership} refresh={() => read(community)} />)}
    {community?.canAdd && <form onSubmit={event => void add(event)}>
      <fieldset disabled={pending}>
        <legend>Додати ділянку та особовий рахунок</legend>
        <label>Номер ділянки <input name="plotNumber" maxLength={128} required /></label>{' '}
        <label>Номер особового рахунку <input name="accountNumber" maxLength={128} required /></label>{' '}
        {owners.length > 0 && <label><input type="checkbox" checked={existing}
          onChange={event => setExisting(event.target.checked)} /> Наявний власник</label>}{' '}
        {existing && owners.length > 0
          ? <label>Власник <select name="ownerId" defaultValue="" required>
              <option value="">Оберіть власника</option>
              {owners.map(owner => <option key={owner.ownerId} value={owner.ownerId}>
                {owner.ownerName} · ділянка {owner.plotNumber}
              </option>)}
            </select></label>
          : <label>Ім’я власника <input name="ownerName" maxLength={256} required /></label>}{' '}
        <button>Додати</button>
      </fieldset>
    </form>}
    <p role="status">{message}</p>
    {community?.canPrepareImport && <ImportPreparation key={community.id} community={community.id} />}
    {community?.canApproveImport && <ImportApproval key={community.id} community={community.id} />}
    {community?.canReadElectricity && <Electricity key={community.id} community={community.id}
      canSetup={community.canSetupElectricity} canRecognize={community.canRecognizeElectricity} />}
  </>;
}

createRoot(document.getElementById('root')!).render(<Register />);
