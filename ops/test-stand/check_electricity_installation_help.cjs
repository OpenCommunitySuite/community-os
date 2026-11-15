// Existing synthetic stand only; session cookie is supplied through environment.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
  const origin = 'https://127.0.0.1:5543';
  const browser = await chromium.launch({ channel: 'msedge' });
  try {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, serviceWorkers: 'block' });
    let writes = 0;
    let previews = 0;
    const previewPath = '/community/electricity/' + process.env.STAND_COMMUNITY + '/reading-import/preview';
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (route.request().method() === 'POST' && url.origin === origin && url.pathname === previewPath) {
        previews++; await route.continue();
      } else if (route.request().method() !== 'GET') { writes++; await route.abort('blockedbyclient'); }
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
    const readingSummary = page.getByText('Довідка: Ручне визнання показань', { exact: true });
    await readingSummary.click();
    const readingHelp = readingSummary.locator('..');
    const readingText = await readingHelp.locator('p, li').allTextContents();
    assert.ok(readingText.some(text => text.includes('T1/T2')));
    const readingOpener = readingHelp.getByRole('button', { name: 'Посібник: ручні показання', exact: true });
    const readingDialog = page.getByRole('dialog', { name: 'Ручне визнання показань електроенергії', exact: true });
    await readingOpener.click();
    await readingDialog.waitFor();
    assert.equal(await readingDialog.getAttribute('lang'), 'uk');
    assert.deepEqual(await readingDialog.locator('p, li').allTextContents(), readingText);
    await page.keyboard.press('Escape');
    await readingDialog.waitFor({ state: 'hidden' });
    assert.equal(await readingOpener.evaluate(element => element === document.activeElement), true);
    const area = page.getByRole('region', { name: 'Облік електроенергії', exact: true });
    const installationsReply = page.waitForResponse(response => response.url().endsWith('/plots/' + installed.id + '/installations'));
    await area.getByLabel(/^Точка або ділянка для обліку/).selectOption(installed.id);
    const historyResponse = await installationsReply;
    assert.equal(historyResponse.status(), 200);
    const history = await historyResponse.json();
    assert.ok(history.length > 0);
    const picker = area.getByLabel(/^Історія установок/);
    let importSample;
    for (const item of history) {
      await picker.selectOption(item.id);
      await area.getByText(item.id, { exact: true }).waitFor();
      const details = area.locator('dl').filter({ has: page.getByText('Ідентифікатор установки', { exact: true }) });
      for (const [label, value] of [['Модель', item.details.model], ['Серійний номер лічильника', item.details.serialNumber],
        ['Місце встановлення', item.details.location], ['Дата монтажу', item.details.mountedOn],
        ['Серійний номер пломби', item.details.sealSerialNumber]]) {
        assert.equal(await details.getByText(label, { exact: true }).locator('xpath=following-sibling::dd[1]').innerText(), value ?? 'Не вказано');
      }
      const seriesReply = await context.request.get(origin + '/community/electricity/' + process.env.STAND_COMMUNITY
        + '/installations/' + item.id + '/readings');
      assert.equal(seriesReply.status(), 200);
      const series = await seriesReply.json();
      if (!importSample && series.readings.length) importSample = { installation: item.id, reading: series.readings[0] };
      await area.getByRole('heading', { name: 'Визнані показання', exact: true }).waitFor();
      if (series.readings.length) {
        const table = area.getByRole('heading', { name: 'Визнані показання', exact: true })
          .locator('xpath=following-sibling::table[1]');
        assert.equal(await table.locator('tbody tr').count(), series.readings.length);
        for (const [index, reading] of series.readings.entries()) {
          const cells = await table.locator('tbody tr').nth(index).locator('td').allTextContents();
          assert.equal(cells[0], reading.date);
          assert.equal(cells[1], { total: 'Загальний', day: 'День', night: 'Ніч' }[reading.channel]);
          assert.equal(Number(cells[2].replace(/[\s\u00a0]/g, '').replace(',', '.')), Number(reading.valueExact));
        }
      } else await area.getByText('Показань ще немає.', { exact: true }).waitFor();
      if (process.env.STAND_EXPECT_READ_ONLY === '1') {
        assert.equal(await area.getByRole('button', { name: 'Визнати показання', exact: true }).count(), 0);
      }
      const displayed = await details.getByText('Коефіцієнт показань', { exact: true }).locator('xpath=following-sibling::dd[1]').innerText();
      assert.equal(Number(displayed.replace(/[\s\u00a0]/g, '').replace(',', '.')), Number(item.details.multiplierExact));
    }
    assert.ok(importSample, 'Existing recognized reading is required for the duplicate preview');
    const importArea = area.getByText('Імпорт показань CSV', { exact: true }).locator('..');
    await importArea.locator('summary').first().click();
    const importSummary = importArea.getByText('Довідка: Імпорт показань електроенергії', { exact: true });
    await importSummary.click();
    const importText = await importSummary.locator('..').locator('p, li').allTextContents();
    const importOpener = importArea.getByRole('button', { name: 'Посібник: імпорт показань', exact: true });
    const importDialog = page.getByRole('dialog', { name: 'Імпорт показань електроенергії CSV', exact: true });
    await importOpener.click();
    await importDialog.waitFor();
    assert.equal(await importDialog.getAttribute('lang'), 'uk');
    assert.deepEqual(await importDialog.locator('p, li').allTextContents(), importText);
    await page.keyboard.press('Escape');
    await importDialog.waitFor({ state: 'hidden' });
    assert.equal(await importOpener.evaluate(element => element === document.activeElement), true);
    const previewButton = importArea.getByRole('button', { name: 'Переглянути CSV', exact: true });
    assert.equal(await previewButton.isDisabled(), true);
    const upload = importArea.getByLabel('Файл показань', { exact: true });
    const { installation, reading } = importSample;
    const csv = 'installation_id,measured_on,channel,value_kwh\n'
      + [installation, reading.date, reading.channel, reading.valueExact].join(',') + '\n'
      + [installation, 'not-a-date', reading.channel, reading.valueExact].join(',') + '\n';
    await upload.setInputFiles({ name: 'synthetic-readings.csv', mimeType: 'text/csv', buffer: Buffer.from(csv, 'utf8') });
    const replyPromise = page.waitForResponse(response => new URL(response.url()).pathname === previewPath);
    await previewButton.click();
    const reply = await replyPromise;
    assert.equal(reply.status(), 200);
    const preview = await reply.json();
    assert.deepEqual(preview.rows.map(row => [row.line, row.outcome]), [[2, 'AlreadyRecorded'], [3, 'InvalidDate']]);
    await importArea.getByRole('table', { name: 'Попередній перегляд CSV', exact: true }).waitFor();
    await importArea.getByRole('cell', { name: 'Уже записано', exact: true }).waitFor();
    await importArea.getByRole('cell', { name: 'Некоректна дата', exact: true }).waitFor();
    const applyButton = importArea.getByRole('button', { name: 'Підтвердити й застосувати CSV', exact: true });
    assert.equal(await applyButton.count(), communities.find(item => item.id === process.env.STAND_COMMUNITY).canRecognizeElectricity ? 1 : 0);
    await upload.setInputFiles({ name: 'wrong-header.csv', mimeType: 'text/csv', buffer: Buffer.from('wrong-header\n', 'utf8') });
    assert.equal(await applyButton.count(), 0, 'Changing file clears apply permission from the old preview');
    assert.equal(await importArea.getByRole('table').count(), 0, 'Changing file clears the old report');
    const badReplyPromise = page.waitForResponse(response => new URL(response.url()).pathname === previewPath);
    await previewButton.click();
    assert.equal((await badReplyPromise).status(), 400);
    await importArea.getByRole('status').filter({ hasText: 'Заголовок CSV не відповідає шаблону.' }).waitFor();
    await upload.setInputFiles({ name: 'oversize.csv', mimeType: 'text/csv', buffer: Buffer.alloc(128 * 1024 + 1, 65) });
    await previewButton.click();
    await importArea.getByRole('status').filter({ hasText: 'Файл перевищує 128 КіБ.' }).waitFor();
    assert.equal(previews, 2, 'Oversize file is rejected before a request');
    await importOpener.click();
    await importDialog.waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await importDialog.evaluate(element => element.scrollWidth <= element.clientWidth), true);
    const importBox = await importDialog.boundingBox();
    assert.ok(importBox && importBox.width <= 390 && importBox.height <= 844);
    await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT + '.import.png' });
    await importDialog.getByRole('button', { name: 'Закрити посібник імпорту', exact: true }).click();
    await importDialog.waitFor({ state: 'hidden' });
    assert.equal(await importOpener.evaluate(element => element === document.activeElement), true);
    await readingOpener.click();
    await readingDialog.waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await readingDialog.evaluate(element => element.scrollWidth <= element.clientWidth), true);
    const readingBox = await readingDialog.boundingBox();
    assert.ok(readingBox && readingBox.width <= 390 && readingBox.height <= 844);
    await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT + '.readings.png' });
    await readingDialog.getByRole('button', { name: 'Закрити посібник показань', exact: true }).click();
    await readingDialog.waitFor({ state: 'hidden' });
    assert.equal(await readingOpener.evaluate(element => element === document.activeElement), true);
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
    assert.equal(await importSummary.count(), 0);
    assert.equal(await importDialog.count(), 0);
    assert.equal(await readingSummary.count(), 0);
    assert.equal(await readingDialog.count(), 0);
    assert.equal(await dialog.count(), 0, 'Guide unmounts with the community workspace');
    assert.equal(writes, 0, 'No mutation attempts');
    assert.deepEqual(errors, []);
    console.log('PASS: electricity installation shared help, ' + history.length + ' existing installations, details and recognized readings, shared reading/import guides, duplicate and invalid CSV preview, header/size rejection, Escape/focus, 390px, community reset, no writes');
  } finally { await browser.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
