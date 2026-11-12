import { useState } from 'react';

type Row = { line: number; installationId: string | null; measuredOn: string | null;
  channel: string | null; value: string | null; outcome: string; readingId: string | null; meterDesignation: string | null };
type Preview = { digest: string; rows: Row[] };

const outcomes: Record<string, string> = {
  Ready: 'Готове до перевірки під час застосування',
  Recognized: 'Визнано',
  AlreadyRecorded: 'Уже записано',
  DateConflict: 'Інше значення за цю дату',
  Decreasing: 'Суперечить сусіднім показанням',
  OutsideInstallation: 'Дата поза періодом установки',
  FutureDate: 'Дата в майбутньому',
  NotFound: 'Установку не знайдено',
  UnsupportedChannel: 'Непідтримуваний регістр',
  InvalidValue: 'Некоректне значення',
  InvalidDate: 'Некоректна дата',
  InvalidInstallation: 'Некоректний ідентифікатор установки',
  InvalidFields: 'Очікується чотири поля',
  Denied: 'Дозвіл відкликано',
  InvalidHeader: 'Заголовок CSV не відповідає шаблону.',
  InvalidEncoding: 'Збережіть файл у кодуванні UTF-8.',
  TooManyRecords: 'Файл має містити щонайбільше 500 записів.',
  NoValidRecords: 'Файл не містить коректно оформлених рядків.',
  PreviewMismatch: 'Файл змінився. Перегляньте його ще раз.',
};

export function ReadingImport({ endpoint, canApply, onApplied }: {
  endpoint: string; canApply: boolean; onApplied: () => Promise<void>;
}) {
  const [file, setFile] = useState<File>();
  const [preview, setPreview] = useState<Preview>();
  const [report, setReport] = useState<Row[]>();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');

  async function submit(apply: boolean) {
    if (!file) return;
    if (file.size > 128 * 1024) {
      setMessage('Файл перевищує 128 КіБ.');
      return;
    }
    setPending(true);
    setMessage('');
    try {
      const csrf = await fetch('/platform/csrf');
      if (!csrf.ok) throw new Error('Увійдіть повторно.');
      const { token } = await csrf.json();
      const headers: Record<string, string> = { 'Content-Type': 'text/csv', 'X-Platform-CSRF': token };
      if (apply && preview) headers['X-Reading-Import-Digest'] = preview.digest;
      const response = await fetch(endpoint + '/reading-import/' + (apply ? 'apply' : 'preview'),
        { method: 'POST', headers, body: file });
      if (response.status === 403) throw new Error('Дозвіл на цю дію відсутній.');
      if (response.status === 413) throw new Error('Файл перевищує 128 КіБ.');
      const data = await response.json();
      if (!response.ok) throw new Error(outcomes[data.outcome] ?? 'Перевірте файл і повторіть спробу.');
      if (apply) {
        setReport(data.rows);
        setMessage('Результат застосування отримано.');
        await onApplied();
      } else {
        setPreview(data);
        setReport(undefined);
        if (data.rows.length === 0) setMessage('Файл не містить записів.');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не вдалося обробити файл.');
    } finally {
      setPending(false);
    }
  }

  const rows = report ?? preview?.rows;
  return <details>
    <summary>Імпорт показань CSV</summary>
    <p>Заголовок файлу <code>installation_id,measured_on,channel,value_kwh</code>.</p>
    <label>Файл показань <input type="file" accept=".csv,text/csv" disabled={pending} onChange={event => {
      setFile(event.currentTarget.files?.[0]);
      setPreview(undefined);
      setReport(undefined);
      setMessage('');
    }} /></label>{' '}
    <button type="button" disabled={!file || pending} onClick={() => void submit(false)}>Переглянути CSV</button>{' '}
    {canApply && preview?.rows.some(row => row.installationId) &&
      <button type="button" disabled={pending} onClick={() => void submit(true)}>Підтвердити й застосувати CSV</button>}
    {rows && rows.length > 0 && <table>
      <caption>{report ? 'Результат застосування CSV' : 'Попередній перегляд CSV'}</caption>
      <thead><tr><th scope="col">Рядок</th><th scope="col">Установка</th><th scope="col">Дата</th>
        <th scope="col">Регістр</th><th scope="col">кВт·год</th><th scope="col">Результат</th></tr></thead>
      <tbody>{rows.map(row => <tr key={row.line}><td>{row.line}</td>
        <td>{row.meterDesignation && <>{row.meterDesignation}<br /></>}{row.installationId}</td>
        <td>{row.measuredOn}</td><td>{row.channel}</td><td>{row.value}</td>
        <td>{outcomes[row.outcome] ?? row.outcome}</td></tr>)}</tbody>
    </table>}
    <p role="status">{message}</p>
  </details>;
}
