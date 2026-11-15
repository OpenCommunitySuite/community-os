// Run against a private synthetic stand; credentials are supplied only via env.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
  const origin = 'https://127.0.0.1:5543';
  const browser = await chromium.launch({ channel: 'msedge' });
  try {
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    await context.addCookies([{ name: '__Host-communityos-platform',
      value: process.env.STAND_PROBE_COOKIE, url: origin, secure: true, httpOnly: true }]);
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    let writes = 0;
    page.on('request', request => { if (request.method() !== 'GET') writes++; });
    await page.goto(origin + '/community/');
    const guideButton = page.getByRole('button', { name: 'Посібник: фінансові сценарії', exact: true });
    assert.equal(await guideButton.count(), 0, 'No finance guide before community selection');
    await page.locator('select').first().selectOption(process.env.STAND_COMMUNITY);
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
    await readHelp('paymentCorrection', 'Виправлення суми платежу');
    await readHelp('reallocation', 'Перерозподіл платежу');
    await readHelp('memberAdvance', 'Аванс на членські внески');
    await page.getByText('Залишки розрахунків', { exact: true }).click();
    await readHelp('overpayment', 'Визнання переплати');
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
    for (const title of ['Розрахунок і проведення періоду', 'Пошук проведених періодів', 'Поточна звірка періоду',
      'Перерахунок електроенергії', 'Разове цільове нарахування',
      'Ручна реєстрація платежу', 'Прийом готівки', 'Первинний розподіл платежу',
      'Виправлення суми платежу', 'Перерозподіл платежу',
      'Визнання переплати', 'Аванс на членські внески',
      'Імпорт банківської виписки', 'Визнання банківського платежу',
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
    if (process.env.STAND_EXPECT_READ_ONLY === '1') {
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
    await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT });
    await dialog.getByRole('button', { name: 'Закрити посібник' }).click();
    assert.equal(writes, 0, 'Help does not send mutation requests');
    await page.locator('select').first().selectOption('');
    assert.equal(await guideButton.count(), 0, 'Guide closes with community workspace');
    assert.deepEqual(errors, []);
    console.log('PASS: 17 context topics, shared guide, period history and date error, current reconciliation, one-off accounts/history, recognized payment/remainder, bank workspace and disabled preview, navigation, Escape/focus, close, narrow viewport, workspace isolation, no writes');
  } finally { await browser.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
