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
    const guideButton = page.getByRole('button', { name: 'Посібник: кошториси та витрати', exact: true });
    assert.equal(await guideButton.count(), 0, 'No finance guide before community selection');
    await page.locator('select').first().selectOption(process.env.STAND_COMMUNITY);
    await guideButton.waitFor();
    await page.getByText('Кошториси', { exact: true }).click();
    const budgetHelp = page.getByText('Довідка: Кошториси: план і факт', { exact: true });
    await budgetHelp.click();
    const help = budgetHelp.locator('..');
    await help.getByRole('heading', { name: 'Як виправити', exact: true }).waitFor();
    const helpParagraphs = await help.locator('p').allTextContents();
    const contextOpener = help.getByRole('button', { name: 'Посібник: кошториси та витрати' });
    await contextOpener.click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    assert.equal(await dialog.getAttribute('lang'), 'uk');
    const guideBudget = dialog.locator('#finance-guide-budgets');
    assert.deepEqual(await guideBudget.locator('p').allTextContents(), helpParagraphs);
    for (const title of ['Кошториси: план і факт', 'Визнання витрати', 'Розподіл витрати за статтями']) {
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
    const box = await dialog.boundingBox();
    assert.ok(box && box.width <= 390 && box.height <= 844, 'Guide fits narrow viewport');
    await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT });
    await dialog.getByRole('button', { name: 'Закрити посібник' }).click();
    assert.equal(writes, 0, 'Help does not send mutation requests');
    await page.locator('select').first().selectOption('');
    assert.equal(await guideButton.count(), 0, 'Guide closes with community workspace');
    assert.deepEqual(errors, []);
    console.log('PASS: 3 context topics, shared guide, navigation, Escape/focus, close, narrow viewport, workspace isolation, no writes');
  } finally { await browser.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
