import { FormEvent, useEffect, useState } from 'react';

type Summary = { id: string; updatedAt: string };
type Decision = { row: number; ownerKey: string; ownerName: string };
type SourceRow = { row: number; plotNumber: string; ownerName: string; accountNumber: string };
type Preparation = {
  planId: string;
  draft: { id: string; revision: number; source: SourceRow[]; decisions: Decision[] };
  preview: { canProceed: boolean; candidates: { row: number; issues: string[] }[] };
};

const workbookType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const issueNames: Record<string, string> = {
  'owner-presentation-requires-review': 'Потрібно перевірити власника',
  'owner-name-repeated-in-workbook': 'ПІБ повторюється у файлі',
  'owner-key-and-name-required': 'Вкажіть ключ та ім’я власника',
  'owner-key-has-conflicting-names': 'Один ключ має різні імена',
  'plot-number-required': 'Відсутній номер ділянки',
  'account-number-required': 'Відсутній номер рахунку',
  'plot-number-duplicated-in-file': 'Номер ділянки повторюється у файлі',
  'account-number-duplicated-in-file': 'Номер рахунку повторюється у файлі',
  'plot-number-already-in-register': 'Ділянка вже є в реєстрі',
  'account-number-already-in-register': 'Рахунок уже є в реєстрі',
};

function check(response: Response) {
  if (response.ok) return response;
  const errors: Record<number, string> = {
    400: 'Перевірте формат файлу або введені рішення.',
    403: 'Ви не маєте дозволу готувати імпорт.',
    404: 'Чернетку не знайдено.',
    409: 'Чернетку вже змінено. Відкрийте її знову.',
    413: 'Файл або запит перевищує допустимий розмір.',
    415: 'Підтримуються лише файли XLSX.',
  };
  throw new Error(errors[response.status] ?? 'Не вдалося завершити запит.');
}

export function ImportPreparation({ community }: { community: string }) {
  const url = '/community/imports/' + community;
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [current, setCurrent] = useState<Preparation>();
  const [pending, setPending] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState('');

  async function loadList() {
    setSummaries(await check(await fetch(url)).json());
  }

  useEffect(() => {
    void loadList().catch(error => setMessage(error.message));
  }, [url]);

  async function open(id: string) {
    setCurrent(undefined);
    setDirty(false);
    setCurrent(await check(await fetch(url + '/' + id)).json());
  }

  async function run(action: () => Promise<void>) {
    setPending(true);
    setMessage('');
    try {
      await action();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не вдалося завершити запит.');
    } finally {
      setPending(false);
    }
  }

  async function post(path: string, contentType: string, body: BodyInit) {
    const { token } = await check(await fetch('/platform/csrf')).json();
    return check(await fetch(path, { method: 'POST', body,
      headers: { 'Content-Type': contentType, 'X-Platform-CSRF': token } }));
  }

  function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const file = new FormData(form).get('workbook');
    if (!(file instanceof File) || !file.name.toLowerCase().endsWith('.xlsx')) {
      setMessage('Виберіть файл XLSX.');
      return;
    }
    void run(async () => {
      const result = await post(url, workbookType, file);
      const { id } = await result.json();
      form.reset();
      await loadList();
      await open(id);
    });
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!current) return;
    const data = new FormData(event.currentTarget);
    const { id, revision, source } = current.draft;
    const decisions = source.map(({ row }) => ({
      row, ownerKey: String(data.get('key-' + row)).trim(), ownerName: String(data.get('name-' + row)).trim(),
    })).filter(item => item.ownerKey || item.ownerName);
    if (decisions.some(item => !item.ownerKey || !item.ownerName)) {
      setMessage('Для кожного рішення вкажіть ключ та ім’я власника.');
      return;
    }
    void run(async () => {
      await post(url + '/' + id + '/decisions', 'application/json', JSON.stringify({ revision, decisions }));
      await open(id);
      await loadList();
      setMessage('Чернетку збережено.');
    });
  }

  const decisions = new Map(current?.draft.decisions.map(item => [item.row, item]));
  const issues = new Map(current?.preview.candidates.map(item => [item.row, item.issues]));
  return <section aria-labelledby="import-heading">
    <h2 id="import-heading">Підготовка імпорту OSBBX</h2>
    <form onSubmit={upload}>
      <label>Вивантаження XLSX <input name="workbook" type="file" accept=".xlsx" required disabled={pending} /></label>{' '}
      <button disabled={pending}>Завантажити</button>
    </form>
    {summaries.length > 0 && <label>Збережені чернетки{' '}
      <select value={current?.draft.id ?? ''} disabled={pending}
        onChange={event => { const id = event.target.value; if (id) void run(() => open(id)); else setCurrent(undefined); }}>
        <option value="">Оберіть чернетку</option>
        {summaries.map(item => <option key={item.id} value={item.id}>
          {new Date(item.updatedAt).toLocaleString('uk-UA')} · {item.id.slice(-8)}
        </option>)}
      </select>
    </label>}
    {current && <form key={current.draft.id + ':' + current.draft.revision} onSubmit={save}
      onChange={() => setDirty(true)}>
      <p>Однаковий ключ указуйте лише для ділянок одного підтвердженого власника.</p>
      <p>{current.preview.canProceed ? 'Конфліктів не виявлено.' : 'Перевірте рішення та конфлікти в таблиці.'}</p>
      <fieldset disabled={pending}>
        <legend>Рішення щодо власників</legend>
        <table>
          <thead><tr><th>Рядок Excel</th><th>Ділянка</th><th>ПІБ у файлі</th><th>Особовий рахунок</th>
            <th>Ключ власника</th><th>Перевірене ім’я</th><th>Результат перевірки</th></tr></thead>
          <tbody>{current.draft.source.map(row => <tr key={row.row}>
            <td>{row.row}</td><td>{row.plotNumber}</td><td>{row.ownerName}</td><td>{row.accountNumber}</td>
            <td><input name={'key-' + row.row} aria-label={'Ключ власника, рядок ' + row.row} maxLength={128}
              defaultValue={decisions.get(row.row)?.ownerKey} /></td>
            <td><input name={'name-' + row.row} aria-label={'Перевірене ім’я, рядок ' + row.row} maxLength={512}
              defaultValue={decisions.get(row.row)?.ownerName} /></td>
            <td>{issues.get(row.row)?.map(issue => issueNames[issue] ?? 'Перевірте дані рядка').join(', ')}</td>
          </tr>)}</tbody>
        </table>
        <button>Зберегти й перевірити</button>
        {current.preview.canProceed && <button type="button" disabled={dirty} onClick={() => void run(async () => {
          const { draft, planId } = current;
          await post('/community/import-approvals/' + community + '/' + draft.id + '/' + draft.revision + '/' +
            planId + '/submit', 'application/json', '{}');
          setMessage('Ревізію ' + draft.revision + ' передано на затвердження.');
        })}>Передати на затвердження</button>}
      </fieldset>
    </form>}
    <p role="status">{message}</p>
  </section>;
}
