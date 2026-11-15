import { useState } from 'react';
import { labels, money } from './billing';
import { FinanceContextHelp } from './finance-help';

type Preview = { status: string; accountNumber: string; installationId: string | null;
  openingReadingId: string | null; closingReadingId: string | null; volume: number | null;
  tariffId: string | null; basis: string | null; rate: number | null; amountUah: number | null };
const volume = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 3 });
const rate = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 6 });

export function WaterChargePreview({ endpoint }: { endpoint: string }) {
  const [accounts, setAccounts] = useState<{ id: string; number: string }[]>();
  const [result, setResult] = useState<Preview>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return <details>
    <summary>Попередній розрахунок за воду</summary>
    <FinanceContextHelp topic="waterPreview" />
    <button type="button" disabled={busy} onClick={() => {
      setBusy(true);
      setError('');
      void fetch(endpoint + '/water-accounts').then(async response => {
        if (!response.ok) throw new Error('Не вдалося завантажити рахунки.');
        setAccounts(await response.json());
      }).catch(error => setError(error.message)).finally(() => setBusy(false));
    }}>Завантажити рахунки для води</button>
    {accounts?.length === 0 && <p>Немає рахунків із точками обліку води.</p>}
    {accounts && accounts.length > 0 && <form onChange={() => { setResult(undefined); setError(''); }} onSubmit={event => {
      event.preventDefault();
      const params = new URLSearchParams();
      for (const [name, value] of new FormData(event.currentTarget)) params.set(name, String(value));
      setResult(undefined);
      setError('');
      setBusy(true);
      void fetch(endpoint + '/water-preview?' + params).then(async response => {
        if (response.status === 403) throw new Error('Дозвіл на розрахунок відсутній.');
        if (response.status === 404) throw new Error('Особовий рахунок не знайдено.');
        if (!response.ok) throw new Error('Перевірте дати розрахунку.');
        setResult(await response.json());
      }).catch(error => setError(error instanceof Error ? error.message : 'Розрахунок недоступний.'))
        .finally(() => setBusy(false));
    }}>
      <fieldset disabled={busy}>
        <label>Рахунок для розрахунку води <select name="account" required defaultValue=""><option value="">Оберіть рахунок</option>
          {accounts.map(account => <option key={account.id} value={account.id}>{account.number}</option>)}</select></label>{' '}
        <label>Початок періоду води <input name="from" type="date" required /></label>{' '}
        <label>Кінець періоду води <input name="until" type="date" required /></label>{' '}
        <button>Розрахувати плату за воду</button>
      </fieldset>
    </form>}
    {error && <p role="alert">{error}</p>}
    {result && <dl aria-label="Розрахунок за воду">
      <dt>Особовий рахунок</dt><dd>{result.accountNumber}</dd>
      <dt>Стан</dt><dd>{labels[result.status] ?? result.status}</dd>
      {result.volume !== null && <><dt>Обсяг</dt><dd>{volume.format(result.volume)} м³</dd></>}
      {result.installationId && <><dt>Установка</dt><dd>{result.installationId}</dd>
        <dt>Початкове показання</dt><dd>{result.openingReadingId}</dd>
        <dt>Кінцеве показання</dt><dd>{result.closingReadingId}</dd></>}
      {result.tariffId && <><dt>Версія тарифу</dt><dd>{result.basis} · {result.tariffId}</dd></>}
      {result.rate !== null && <><dt>Ставка</dt><dd>{rate.format(result.rate)} грн/м³</dd></>}
      {result.amountUah !== null && <><dt>Сума</dt><dd>{money.format(result.amountUah)}</dd></>}
    </dl>}
  </details>;
}
