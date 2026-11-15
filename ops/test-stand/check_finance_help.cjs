// Run against a private synthetic stand; credentials are supplied only via env.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');

// These are UI inputs only. Server grants and authorization are never altered.
const operationFlags = [
  'canPostBilling', 'canRecalculateBilling', 'canPostOneOff', 'canRecordPayment',
  'canAllocatePayment', 'canAcceptCash', 'canCorrectPayment', 'canReallocatePayment',
  'canImportBank', 'canRecognizeBank', 'canRecognizeOverpayment', 'canManageAdvance',
  'canRegisterBudget', 'canRecognizeExpense', 'canAllocateExpense',
];
const matrix = process.env.STAND_HELP_PERMISSION_PROFILES === '1';
const profiles = matrix ? [
  { name: 'no-finance-read', read: false, enabled: operationFlags },
  { name: 'reader', read: true, enabled: [] },
  ...operationFlags.map(flag => ({ name: flag, read: true, enabled: [flag] })),
  { name: 'all-operations', read: true, enabled: operationFlags },
] : [null];

(async () => {
  const origin = 'https://127.0.0.1:5543';
  const browser = await chromium.launch({ channel: 'msedge' });
  try {
    for (const profile of profiles) {
      const context = await browser.newContext({ ignoreHTTPSErrors: true, serviceWorkers: 'block' });
      let blockedWrites = 0;
      let overrides = 0;
      await context.route('**/*', async route => {
        if (route.request().method() !== 'GET') {
          blockedWrites++;
          await route.abort('blockedbyclient');
          return;
        }
        if (profile && new URL(route.request().url()).pathname === '/community/register/communities') {
          const response = await route.fetch();
          assert.equal(response.status(), 200, 'Synthetic community list is readable');
          const communities = await response.json();
          const selected = communities.find(item => item.id === process.env.STAND_COMMUNITY);
          assert.ok(selected?.canReadBilling, 'Existing synthetic login needs finance read access');
          for (const flag of operationFlags) selected[flag] = profile.enabled.includes(flag);
          selected.canReadBilling = profile.read;
          overrides++;
          await route.fulfill({ response, json: communities });
          return;
        }
        await route.continue();
      });
      await context.addCookies([{ name: '__Host-communityos-platform',
        value: process.env.STAND_PROBE_COOKIE, url: origin, secure: true, httpOnly: true }]);
      const page = await context.newPage();
      page.setDefaultTimeout(15000);
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      let writes = 0;
      let financeRequests = 0;
      page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/community/billing/')) financeRequests++; });
      page.on('request', request => { if (request.method() !== 'GET') writes++; });
      await page.goto(origin + '/community/');
      const guideButton = page.getByRole('button', { name: 'Посібник: фінансові сценарії', exact: true });
      assert.equal(await guideButton.count(), 0, 'No finance guide before community selection');
      await page.locator('select').first().selectOption(process.env.STAND_COMMUNITY);
      await page.waitForFunction(id => {
        const selection = document.querySelector('select');
        return selection?.value === id && !selection.disabled;
      }, process.env.STAND_COMMUNITY);
      if (profile) assert.equal(overrides, 1, 'Exactly one community list was overridden');
      if (profile && !profile.read) {
        assert.equal(await guideButton.count(), 0, 'Finance guide requires finance read');
        assert.equal(await page.getByRole('button', { name: 'Завантажити платежі та зобов’язання', exact: true }).count(), 0);
        assert.equal(financeRequests, 0, 'No finance data is fetched without finance read');
        assert.equal(writes + blockedWrites, 0);
        assert.deepEqual(errors, []);
        await context.close();
        console.log('PASS: no-finance-read: guide and finance workspace absent, no finance requests');
        continue;
      }
      await guideButton.waitFor();
      const newTopics = new Map();
      async function readHelp(topic, title) {
        const summary = page.getByText('Довідка: ' + title, { exact: true });
        await summary.click();
        newTopics.set(topic, await summary.locator('..').locator('p').allTextContents());
      }
      await readHelp('billing', 'Розрахунок і проведення періоду');
      await page.getByText('Проведені періоди', { exact: true }).click();
      await readHelp('periods', 'Пошук проведених періодів');
      await page.getByRole('button', { name: 'Завантажити проведені періоди', exact: true }).click();
      await page.getByRole('table', { name: 'Історія проведених періодів', exact: true }).waitFor();
      await page.getByLabel('Споживання з', { exact: true }).fill('2030-01-01');
      await page.getByLabel('Споживання до включно', { exact: true }).fill('2020-01-01');
      await page.getByRole('alert').filter({ hasText: 'Початкова дата' }).waitFor();
      await page.getByRole('button', { name: 'Скинути фільтр дат', exact: true }).click();
      await page.getByRole('button', { name: /^Відкрити період / }).first().click();
      await page.getByText('Звірка розрахункового періоду', { exact: true }).click();
      await readHelp('reconciliation', 'Поточна звірка періоду');
      await page.getByRole('button', { name: 'Завантажити поточну звірку', exact: true }).click();
      await page.getByRole('table', { name: 'Поточні залишки зобов’язань періоду', exact: true }).waitFor();
      await page.getByText('Зведення нарахувань', { exact: true }).click();
      await readHelp('accrualSummary', 'Зведення проведених нарахувань');
      await page.getByRole('table', { name: 'Нарахування проведеного періоду', exact: true }).waitFor();
      await readHelp('recalculation', 'Перерахунок електроенергії');
      await readHelp('oneOff', 'Разове цільове нарахування');
      const oneOff = page.getByRole('region', { name: 'Разове цільове нарахування', exact: true });
      await oneOff.getByRole('button', { name: 'Завантажити рахунки', exact: true }).click();
      await oneOff.getByLabel('Сума на рахунок, грн', { exact: true }).waitFor();
      const historyResponse = page.waitForResponse(response => response.url().endsWith('/one-off/history'));
      await oneOff.getByRole('button', { name: 'Історія разових нарахувань', exact: true }).click();
      assert.equal((await historyResponse).status(), 200, 'One-off history is available to reader');
      await readHelp('manualPayment', 'Ручна реєстрація платежу');
      await readHelp('cashAcceptance', 'Прийом готівки');
      await page.getByRole('button', { name: 'Завантажити платежі та зобов’язання', exact: true }).click();
      await readHelp('paymentAllocation', 'Первинний розподіл платежу');
      const paymentPicker = page.getByLabel(/^Визнаний платіж/);
      const paymentId = await paymentPicker.locator('option').nth(1).getAttribute('value');
      assert.ok(paymentId, 'Synthetic recognized payment is required');
      await paymentPicker.selectOption(paymentId);
      await page.getByText(/^Нерозподілений залишок /).waitFor();
      const receiptSummary = page.getByText('Звіт про надходження', { exact: true });
      await receiptSummary.click();
      await readHelp('paymentSummary', 'Звіт про визнані надходження');
      const receipts = receiptSummary.locator('..');
      await receipts.getByLabel('Дата отримання з', { exact: true }).fill('2030-01-01');
      await receipts.getByLabel('Дата отримання до', { exact: true }).fill('2020-01-01');
      await receipts.getByRole('alert').waitFor();
      assert.equal(await receipts.getByRole('button', { name: 'Завантажити надходження CSV' }).count(), 0);
      await receipts.getByLabel('Дата отримання з', { exact: true }).fill('1900-01-01');
      await receipts.getByLabel('Дата отримання до', { exact: true }).fill('9999-12-31');
      await receipts.getByLabel(/^Джерело надходжень/).selectOption('manual');
      await receipts.getByRole('rowheader', { name: 'Ручна реєстрація', exact: true }).waitFor();
      assert.equal(await receipts.getByRole('rowheader', { name: 'Банк', exact: true }).count(), 0);
      await receipts.getByLabel(/^Джерело надходжень/).selectOption('');
      await receipts.getByRole('table', { name: 'Платежі за вибраний період', exact: true })
        .getByRole('button', { name: /^Відкрити платіж / }).first().click();
      assert.equal(await paymentPicker.inputValue(), paymentId);
      assert.equal(await receipts.getByLabel('Дата отримання з', { exact: true }).inputValue(), '1900-01-01');
      assert.equal(await receipts.getByLabel('Дата отримання до', { exact: true }).inputValue(), '9999-12-31');
      await readHelp('paymentCorrection', 'Виправлення суми платежу');
      await readHelp('reallocation', 'Перерозподіл платежу');
      await readHelp('memberAdvance', 'Аванс на членські внески');
      await page.getByText('Залишки розрахунків', { exact: true }).click();
      await readHelp('overpayment', 'Визнання переплати');
      await readHelp('settlement', 'Поточні залишки платника');
      const balancePayer = page.getByLabel(/^Платник для звірки/);
      const payerId = await balancePayer.locator('option').nth(1).getAttribute('value');
      assert.ok(payerId, 'Synthetic payer is required');
      await balancePayer.selectOption(payerId);
      await page.getByRole('table', { name: 'Непогашені зобов’язання', exact: true }).waitFor();
      const waterSummary = page.getByText('Попередній розрахунок за воду', { exact: true });
      await waterSummary.click();
      await readHelp('waterPreview', 'Перевірка плати за воду');
      const water = waterSummary.locator('..');
      await water.getByRole('button', { name: 'Завантажити рахунки для води', exact: true }).click();
      const waterAccount = water.getByLabel(/^Рахунок для розрахунку води/);
      const waterId = await waterAccount.locator('option').nth(1).getAttribute('value');
      assert.ok(waterId, 'Synthetic water account is required');
      await waterAccount.selectOption(waterId);
      await water.getByLabel('Початок періоду води', { exact: true }).fill('2026-01-02');
      await water.getByLabel('Кінець періоду води', { exact: true }).fill('2026-02-02');
      const waterResponse = page.waitForResponse(response => new URL(response.url()).pathname.endsWith('/water-preview'));
      await water.getByRole('button', { name: 'Розрахувати плату за воду', exact: true }).click();
      const waterReply = await waterResponse;
      assert.equal(waterReply.status(), 200, 'Water preview is readable');
      const calculation = await waterReply.json();
      assert.equal(calculation.status, 'MissingBoundary', 'Fixture has no readings on the selected past boundaries');
      assert.equal(calculation.amountUah, null, 'Missing data is not a zero charge');
      await water.locator('dl[aria-label="Розрахунок за воду"]').waitFor();
      const debtSummary = page.getByText('Реєстр заборгованості', { exact: true });
      await debtSummary.click();
      await readHelp('debts', 'Пошук і звірка заборгованості');
      const debts = debtSummary.locator('..');
      await debts.getByRole('table', { name: 'Реєстр непогашених зобов’язань', exact: true })
        .getByRole('button', { name: /^Відкрити виписку за рахунком / }).first().click();
      await readHelp('accountStatement', 'Виписка та друк за рахунком');
      const statementAccount = await page.getByLabel(/^Особовий рахунок для виписки/).inputValue();
      assert.ok(statementAccount, 'Statement opens for the selected debt account');
      await page.emulateMedia({ media: 'print' });
      assert.equal(await page.locator('#account-statement-print').isVisible(), true);
      assert.equal(await page.locator('#root').isVisible(), false, 'Print excludes workspace and help');
      assert.equal(await page.locator('#account-statement-print summary').count(), 0);
      await page.emulateMedia({ media: 'screen' });
      await debts.getByLabel(/^Вид нарахування/).selectOption('electricity');
      await debts.getByLabel('Лише прострочені', { exact: true }).check();
      await debts.getByLabel('Строк оплати з', { exact: true }).fill('2030-01-01');
      await debts.getByLabel('Строк оплати до включно', { exact: true }).fill('2020-01-01');
      await debts.getByRole('alert').waitFor();
      await page.getByRole('button', { name: 'Відкрити заборгованість у реєстрі', exact: true }).click();
      assert.equal(await debts.getByLabel('Пошук за номером рахунку', { exact: true }).inputValue(), statementAccount);
      assert.equal(await debts.getByLabel(/^Вид нарахування/).inputValue(), '');
      assert.equal(await debts.getByLabel('Лише прострочені', { exact: true }).isChecked(), false);
      assert.equal(await debts.getByLabel('Строк оплати з', { exact: true }).inputValue(), '');
      assert.equal(await debts.getByLabel('Строк оплати до включно', { exact: true }).inputValue(), '');
      assert.equal(await paymentPicker.inputValue(), paymentId, 'Selected payment survives report navigation');
      await readHelp('bankImport', 'Імпорт банківської виписки');
      await page.getByRole('button', { name: 'Завантажити банківські рахунки й операції', exact: true }).click();
      await readHelp('bankRecognition', 'Визнання банківського платежу');
      const bank = page.getByRole('region', { name: 'Банківська виписка', exact: true });
      assert.equal(await bank.getByRole('button', { name: 'Переглянути виписку', exact: true }).isDisabled(), true,
        'Statement preview requires account and file');
      await page.getByText('Кошториси', { exact: true }).click();
      const budgetHelp = page.getByText('Довідка: Кошториси: план і факт', { exact: true });
      await budgetHelp.click();
      const help = budgetHelp.locator('..');
      await help.getByRole('heading', { name: 'Як виправити', exact: true }).waitFor();
      const helpParagraphs = await help.locator('p').allTextContents();
      const contextOpener = help.getByRole('button', { name: 'Посібник: фінансові сценарії' });
      await contextOpener.click();
      const dialog = page.getByRole('dialog');
      await dialog.waitFor();
      assert.equal(await dialog.getAttribute('lang'), 'uk');
      const guideBudget = dialog.locator('#finance-guide-budgets');
      assert.deepEqual(await guideBudget.locator('p').allTextContents(), helpParagraphs);
      for (const [topic, paragraphs] of newTopics) {
        assert.deepEqual(await dialog.locator('#finance-guide-' + topic).locator('p').allTextContents(), paragraphs);
      }
      const taskNavigation = dialog.getByRole('navigation', { name: 'Розділи посібника' });
      const audience = dialog.getByLabel(/^Сценарії за завданням/);
      assert.equal(await audience.inputValue(), 'all');
      assert.equal(await taskNavigation.getByRole('link').count(), 23);
      const paths = new Map();
      for (const [profile, count, target] of [
        ['reader', 9, 'Поточні залишки платника'],
        ['operator', 15, 'Ручна реєстрація платежу'],
      ]) {
        await audience.selectOption(profile);
        const links = taskNavigation.getByRole('link');
        assert.equal(await links.count(), count, profile + ': task navigation size');
        paths.set(profile, await links.evaluateAll(items => items.map(item => item.getAttribute('href'))));
        await taskNavigation.getByRole('link', { name: target, exact: true }).click();
        await dialog.getByRole('heading', { name: target, exact: true }).waitFor();
        assert.equal(await dialog.locator('section').count(), 23, 'Task filter retains all guide content');
      }
      assert.equal(new Set([...paths.get('reader'), ...paths.get('operator')]).size, 23,
        'Both task routes cover every topic');
      for (const href of new Set([...paths.get('reader'), ...paths.get('operator')])) {
        assert.equal(await dialog.locator(href).count(), 1, 'Each task link has one destination');
      }
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden' });
      assert.equal(await contextOpener.evaluate(element => element === document.activeElement), true);
      await contextOpener.click();
      await dialog.waitFor();
      assert.equal(await audience.inputValue(), 'operator', 'Task route survives reopening');
      await audience.selectOption('all');
      assert.equal(await taskNavigation.getByRole('link').count(), 23);
      for (const title of ['Розрахунок і проведення періоду', 'Пошук проведених періодів', 'Поточна звірка періоду',
        'Перерахунок електроенергії', 'Разове цільове нарахування',
        'Ручна реєстрація платежу', 'Прийом готівки', 'Первинний розподіл платежу',
        'Виправлення суми платежу', 'Перерозподіл платежу',
        'Визнання переплати', 'Аванс на членські внески',
        'Імпорт банківської виписки', 'Визнання банківського платежу',
        'Виписка та друк за рахунком', 'Пошук і звірка заборгованості',
        'Зведення проведених нарахувань', 'Звіт про визнані надходження',
        'Поточні залишки платника', 'Перевірка плати за воду',
        'Кошториси: план і факт', 'Визнання витрати', 'Розподіл витрати за статтями']) {
        await dialog.getByRole('link', { name: title, exact: true }).click();
        await dialog.getByRole('heading', { name: title, exact: true }).waitFor();
      }
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden' });
      assert.equal(await contextOpener.evaluate(element => element === document.activeElement), true);
      await page.getByText('Витрати', { exact: true }).click();
      await page.getByText('Довідка: Визнання витрати', { exact: true }).click();
      await page.getByRole('button', { name: 'Завантажити витрати', exact: true }).click();
      if (profile) {
        for (const [flag, title] of [['canRegisterBudget', 'Зареєструвати кошторис'], ['canRecognizeExpense', 'Визнати витрату']]) {
          assert.equal(await page.getByRole('button', { name: title, exact: true }).count(),
            profile.enabled.includes(flag) ? 1 : 0, profile.name + ': ' + flag);
        }
        const operation = page.getByLabel(/^Операція/);
        assert.equal(await operation.count(), profile.enabled.some(flag => ['canRecordPayment', 'canAcceptCash'].includes(flag)) ? 1 : 0,
          profile.name + ': payment channel selector');
        if (await operation.count()) {
          const channels = await operation.locator('option').evaluateAll(options => options.map(option => option.value));
          assert.deepEqual(channels, [
            ...(profile.enabled.includes('canRecordPayment') ? ['manual'] : []),
            ...(profile.enabled.includes('canAcceptCash') ? ['cash'] : []),
          ]);
        }
      } else if (process.env.STAND_EXPECT_READ_ONLY === '1') {
        assert.equal(await page.getByRole('button', { name: 'Зареєструвати кошторис', exact: true }).count(), 0);
        assert.equal(await page.getByRole('button', { name: 'Визнати витрату', exact: true }).count(), 0);
      }
      const distribution = page.getByText('Розподіл витрати', { exact: true }).first();
      await distribution.click();
      await page.getByText('Довідка: Розподіл витрати за статтями', { exact: true }).first().click();
      await guideButton.first().click();
      await page.setViewportSize({ width: 390, height: 844 });
      await dialog.getByRole('link', { name: 'Імпорт банківської виписки', exact: true }).click();
      assert.equal(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth), true,
        'CSV header fits without horizontal overflow');
      const box = await dialog.boundingBox();
      assert.ok(box && box.width <= 390 && box.height <= 844, 'Guide fits narrow viewport');
      await audience.selectOption('reader');
      await audience.scrollIntoViewIfNeeded();
      await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT });
      await dialog.getByRole('button', { name: 'Закрити посібник' }).click();
      assert.equal(writes + blockedWrites, 0, 'Help does not attempt mutation requests');
      await page.locator('select').first().selectOption('');
      assert.equal(await guideButton.count(), 0, 'Guide closes with community workspace');
      await page.locator('select').first().selectOption(process.env.STAND_COMMUNITY);
      await guideButton.first().click();
      await dialog.waitFor();
      assert.equal(await audience.inputValue(), 'all', 'Community selection resets task route');
      await dialog.getByRole('button', { name: 'Закрити посібник' }).click();
      assert.deepEqual(errors, []);
      await context.close();
      console.log('PASS: ' + (profile ? profile.name + ': ' : '') + '23 context topics, shared guide and reader/operator task navigation, payer balances, water preview with missing boundaries, summaries and filters, payment/report navigation, print isolation, Escape/focus, narrow viewport, no writes');
    }
    if (matrix) console.log('PASS: 18 browser permission profiles; grants unchanged; all mutation requests blocked');
  } finally { await browser.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
