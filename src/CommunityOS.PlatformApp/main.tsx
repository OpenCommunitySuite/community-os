import { useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';

const messages = {
  uk: {
    language: 'Мова', title: 'Створення спільноти', login: 'Обліковий запис', password: 'Пароль',
    signIn: 'Увійти', signOut: 'Вийти', setup: 'Створити спільноту й призначити першого адміністратора',
    name: 'Назва', administrator: 'Ідентифікатор адміністратора', request: 'Ідентифікатор запиту',
    create: 'Створити й призначити', newRequest: 'Новий ідентифікатор запиту',
    check: 'Перевірка призначення та журналу', community: 'Спільнота', operation: 'Операція',
    assignment: 'Перевірити мій доступ', events: 'Показати журнал', revoke: 'Відкликати призначення',
    recovery: 'Відновлення доступу', code: 'Одноразовий код', newPassword: 'Новий пароль', reset: 'Змінити пароль', requestCode: 'Запросити код', requestAccepted: 'Якщо доступний підтверджений канал, код буде надіслано.',
    passwordTooShort: 'Новий пароль має містити щонайменше 15 символів.',
    failed: 'Не вдалося виконати запит.',
  },
  ru: {
    language: 'Язык', title: 'Создание сообщества', login: 'Учётная запись', password: 'Пароль',
    signIn: 'Войти', signOut: 'Выйти', setup: 'Создать сообщество и назначить первого администратора',
    name: 'Название', administrator: 'Идентификатор администратора', request: 'Идентификатор запроса',
    create: 'Создать и назначить', newRequest: 'Новый идентификатор запроса',
    check: 'Проверка назначения и журнала', community: 'Сообщество', operation: 'Операция',
    assignment: 'Проверить мой доступ', events: 'Показать журнал', revoke: 'Отозвать назначение',
    recovery: 'Восстановление доступа', code: 'Одноразовый код', newPassword: 'Новый пароль', reset: 'Сменить пароль', requestCode: 'Запросить код', requestAccepted: 'Если доступен подтверждённый канал, код будет отправлен.',
    passwordTooShort: 'Новый пароль должен содержать не менее 15 символов.',
    failed: 'Не удалось выполнить запрос.',
  },
};

type Created = { reservation: { communityId: string; operationId: string } };

function App() {
  const [language, setLanguage] = useState<keyof typeof messages>('uk');
  const [requestId, setRequestId] = useState<string>(() => crypto.randomUUID());
  const [community, setCommunity] = useState('');
  const [operation, setOperation] = useState('');
  const [result, setResult] = useState('');
  const [busy, setBusy] = useState(false);
  const t = messages[language];

  async function call<T>(path: string, method = 'GET', body?: object): Promise<T | null> {
    setBusy(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (method !== 'GET') {
        const csrf = await fetch('/platform/csrf', { cache: 'no-store' });
        if (!csrf.ok) throw new Error();
        headers['X-Platform-CSRF'] = (await csrf.json()).token;
      }

      const response = await fetch('/platform' + path, {
        method, headers, body: body === undefined ? undefined : JSON.stringify(body),
      });
      const text = await response.text();
      const data: unknown = text && response.headers.get('content-type')?.includes('application/json')
        ? JSON.parse(text) : null;
      if (path === "/recovery-request" && response.status === 202) {
        setResult(t.requestAccepted);
        return null;
      }

      setResult(String(response.status) + (data === null ? '' : '\n' + JSON.stringify(data, null, 2)));
      return response.ok ? data as T | null : null;
    } catch {
      setResult(t.failed);
      return null;
    } finally {
      setBusy(false);
    }
  }

  function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = new FormData(form);
    const password = input.get('password');
    (form.elements.namedItem('password') as HTMLInputElement).value = '';
    void call('/login', 'POST', { login: input.get('login'), password });
  }

  function recover(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = new FormData(form);
    const password = form.elements.namedItem('newPassword') as HTMLInputElement;
    if (password.value.length < 15) {
      setResult(t.passwordTooShort);
      password.focus();
      return;
    }

    const newPassword = password.value;
    form.reset();
    void call('/recover', 'POST', {
      login: input.get('login'), code: input.get('code'), newPassword,
    });
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = new FormData(event.currentTarget);
    const data = await call<Created>('/communities', 'POST', {
      requestId, administratorAccountId: input.get('administrator'), displayName: input.get('displayName'),
    });
    if (data) {
      setCommunity(data.reservation.communityId);
      setOperation(data.reservation.operationId);
    }
  }

  const communityPath = '/communities/' + encodeURIComponent(community.trim());

  return <>
    <label>{t.language} <select value={language} onChange={event => {
      const next = event.target.value === 'ru' ? 'ru' : 'uk';
      document.documentElement.lang = next;
      setLanguage(next);
    }}><option value="uk">Українська</option><option value="ru">Русский</option></select></label>
    <h1>{t.title}</h1>
    <fieldset disabled={busy}>
      <form id="login" onSubmit={signIn}>
        <label>{t.login} <input id="account-login" name="login" required maxLength={128} autoComplete="username" /></label>
        <label>{t.password} <input id="code" name="password" type="password" required maxLength={256} autoComplete="current-password" /></label>
        <button>{t.signIn}</button>
      </form>
      <form id="recovery-request" onSubmit={event => {
        event.preventDefault();
        const input = new FormData(event.currentTarget);
        void call('/recovery-request', 'POST', { login: input.get('login') });
      }}>
        <label>{t.login} <input name="login" required maxLength={128} autoComplete="username" /></label>
        <button>{t.requestCode}</button>
      </form>
      <form id="recover" onSubmit={recover}>
        <fieldset>
          <legend>{t.recovery}</legend>
          <label>{t.login} <input name="login" required maxLength={128} autoComplete="username" /></label>
          <label>{t.code} <input name="code" type="password" required maxLength={64} autoComplete="one-time-code" /></label>
          <label>{t.newPassword} <input name="newPassword" type="password" required maxLength={256} autoComplete="new-password" /></label>
          <button>{t.reset}</button>
        </fieldset>
      </form>
      <button id="logout" type="button" onClick={() => void call('/logout', 'POST')}>{t.signOut}</button>
      <form id="create" onSubmit={create}>
        <fieldset>
          <legend>{t.setup}</legend>
          <label>{t.name} <input id="displayName" name="displayName" required maxLength={150} /></label>
          <label>{t.administrator} <input id="administratorAccountId" name="administrator" required /></label>
          <label>{t.request} <input id="requestId" value={requestId} required onChange={event => setRequestId(event.target.value)} /></label>
          <button>{t.create}</button>
          <button type="button" onClick={() => setRequestId(crypto.randomUUID())}>{t.newRequest}</button>
        </fieldset>
      </form>
      <fieldset>
        <legend>{t.check}</legend>
        <label>{t.community} <input id="community" value={community} onChange={event => setCommunity(event.target.value)} /></label>
        <label>{t.operation} <input id="operation" value={operation} onChange={event => setOperation(event.target.value)} /></label>
        <button id="assignment" type="button" onClick={() => void call(communityPath + '/assignment')}>{t.assignment}</button>
        <button id="events" type="button" onClick={() => void call(communityPath + '/events')}>{t.events}</button>
        <button id="revoke" type="button" onClick={() => void call(communityPath + '/operations/' + encodeURIComponent(operation.trim()) + '/revoke', 'POST')}>{t.revoke}</button>
      </fieldset>
    </fieldset>
    <output id="result" aria-live="polite">{result}</output>
  </>;
}

createRoot(document.getElementById('root')!).render(<App />);
