// Existing synthetic stand only; session cookie is supplied through environment.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
  const origin = 'https://127.0.0.1:5543';
  const browser = await chromium.launch({ channel: 'msedge' });
  try {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, serviceWorkers: 'block' });
    let writes = 0;
    await context.route('**/*', async route => {
      if (route.request().method() !== 'GET') { writes++; await route.abort('blockedbyclient'); }
      else await route.continue();
    });
    await context.addCookies([{ name: '__Host-communityos-platform', value: process.env.STAND_PROBE_COOKIE,
      url: origin, secure: true, httpOnly: true }]);
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const communitiesReply = page.waitForResponse(response => new URL(response.url()).pathname === '/community/register/communities');
    await page.goto(origin + '/community/');
    const communities = await (await communitiesReply).json();
    assert.ok(communities.find(item => item.id === process.env.STAND_COMMUNITY)?.canReadElectricity,
      'Choose an existing synthetic community and login with electricity read access');
    const summary = page.getByText('Довідка: Прилад та установка', { exact: true });
    assert.equal(await summary.count(), 0);
    const plotsReply = page.waitForResponse(response => response.url().endsWith('/electricity/' + process.env.STAND_COMMUNITY + '/plots'));
    await page.locator('select').first().selectOption(process.env.STAND_COMMUNITY);
    const plotsResponse = await plotsReply;
    assert.equal(plotsResponse.status(), 200, 'Synthetic operator needs electricity read access');
    const plots = await plotsResponse.json();
    const installed = plots.find(plot => plot.installation);
    assert.ok(installed, 'Existing synthetic plot with an installation is required');
    await summary.click();
    const help = summary.locator('..');
    const content = await help.locator('p, li').allTextContents();
    assert.ok(content.some(text => text.includes('120 кВт·год')));
    const opener = help.getByRole('button', { name: 'Посібник: прилад та установка', exact: true });
    await opener.click();
    const dialog = page.getByRole('dialog', { name: 'Прилад та установка електроенергії', exact: true });
    await dialog.waitFor();
    assert.equal(await dialog.getAttribute('lang'), 'uk');
    assert.deepEqual(await dialog.locator('p, li').allTextContents(), content);
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(await opener.evaluate(element => element === document.activeElement), true);
    const area = page.getByRole('region', { name: 'Облік електроенергії', exact: true });
    const installationsReply = page.waitForResponse(response => response.url().endsWith('/plots/' + installed.id + '/installations'));
    await area.getByLabel(/^Точка або ділянка для обліку/).selectOption(installed.id);
    const historyResponse = await installationsReply;
    assert.equal(historyResponse.status(), 200);
    const history = await historyResponse.json();
    assert.ok(history.length > 0);
    const picker = area.getByLabel(/^Історія установок/);
    for (const item of history) {
      await picker.selectOption(item.id);
      await area.getByText(item.id, { exact: true }).waitFor();
      const details = area.locator('dl').filter({ has: page.getByText('Ідентифікатор установки', { exact: true }) });
      for (const [label, value] of [['Модель', item.details.model], ['Серійний номер лічильника', item.details.serialNumber],
        ['Місце встановлення', item.details.location], ['Дата монтажу', item.details.mountedOn],
        ['Серійний номер пломби', item.details.sealSerialNumber]]) {
        assert.equal(await details.getByText(label, { exact: true }).locator('xpath=following-sibling::dd[1]').innerText(), value ?? 'Не вказано');
      }
      const displayed = await details.getByText('Коефіцієнт показань', { exact: true }).locator('xpath=following-sibling::dd[1]').innerText();
      assert.equal(Number(displayed.replace(/[\s\u00a0]/g, '').replace(',', '.')), Number(item.details.multiplierExact));
    }
    await opener.click();
    await dialog.waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth), true);
    const box = await dialog.boundingBox();
    assert.ok(box && box.width <= 390 && box.height <= 844);
    await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT });
    await dialog.getByRole('button', { name: 'Закрити посібник установки', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(await opener.evaluate(element => element === document.activeElement), true);
    await opener.click();
    await dialog.waitFor();
    // Native select cannot be operated through an open modal; close it before deselecting.
    await page.keyboard.press('Escape');
    await page.locator('select').first().selectOption('');
    assert.equal(await summary.count(), 0);
    assert.equal(await dialog.count(), 0, 'Guide unmounts with the community workspace');
    assert.equal(writes, 0, 'No mutation attempts');
    assert.deepEqual(errors, []);
    console.log('PASS: electricity installation shared help, ' + history.length + ' existing installations and their details, Escape/focus, 390px, community reset, no writes');
  } finally { await browser.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
