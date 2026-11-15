// Existing synthetic water data only; cookie is provided via environment.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const origin = 'https://127.0.0.1:5543';
  const browser = await chromium.launch({ channel: 'msedge' });
  try {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, serviceWorkers: 'block' });
    let writes = 0;
    let previews = 0;
    const previewPath = '/community/water/' + process.env.STAND_COMMUNITY + '/reading-import/preview';
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (route.request().method() === 'POST' && url.origin === origin && url.pathname === previewPath) {
        previews++; await route.continue();
      } else if (route.request().method() !== 'GET') { writes++; await route.abort('blockedbyclient'); }
      else if (process.env.STAND_WATER_REPLACEMENT_UI === '1' && url.pathname === '/community/register/communities') {
        const response = await route.fetch();
        assert.equal(response.status(), 200);
        const communities = await response.json();
        const selected = communities.find(item => item.id === process.env.STAND_COMMUNITY);
        assert.ok(selected?.canReadWater);
        selected.canReplaceWater = true;
        await route.fulfill({ response, json: communities });
      } else await route.continue();
    });
    await context.addCookies([{ name: '__Host-communityos-platform', value: process.env.STAND_PROBE_COOKIE,
      url: origin, secure: true, httpOnly: true }]);
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const communitiesReply = page.waitForResponse(response => new URL(response.url()).pathname === '/community/register/communities');
    await page.goto(origin + '/community/');
    const community = (await (await communitiesReply).json()).find(item => item.id === process.env.STAND_COMMUNITY);
    assert.ok(community?.canReadWater, 'Existing synthetic water reader required');
    if (process.env.STAND_EXPECT_READ_ONLY === '1') assert.equal(community.canRecognizeWater, false);
    const summary = page.getByText('Довідка: Ручний облік води', { exact: true });
    assert.equal(await summary.count(), 0);
    const pointsReply = page.waitForResponse(response => response.url().endsWith('/water/' + process.env.STAND_COMMUNITY + '/points'));
    await page.locator('select').first().selectOption(process.env.STAND_COMMUNITY);
    const response = await pointsReply;
    assert.equal(response.status(), 200);
    const points = await response.json();
    assert.ok(points.length > 0);
    await summary.click();
    const help = summary.locator('..');
    const text = await help.locator('p, li').allTextContents();
    assert.ok(text.some(paragraph => paragraph.includes('2,500 м³')));
    const opener = help.getByRole('button', { name: 'Посібник: ручний облік води', exact: true });
    const dialog = page.getByRole('dialog', { name: 'Ручний облік технічної води', exact: true });
    await opener.click();
    await dialog.waitFor();
    assert.equal(await dialog.getAttribute('lang'), 'uk');
    assert.deepEqual(await dialog.locator('p, li').allTextContents(), text);
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(await opener.evaluate(element => element === document.activeElement), true);
    const replacementSummary = page.getByText('Довідка: Заміна водоміра', { exact: true });
    await replacementSummary.click();
    const replacementText = await replacementSummary.locator('..').locator('p, li').allTextContents();
    const replacementOpener = replacementSummary.locator('..').getByRole('button', { name: 'Посібник: заміна водоміра', exact: true });
    const replacementDialog = page.getByRole('dialog', { name: 'Заміна водоміра', exact: true });
    await replacementOpener.click();
    await replacementDialog.waitFor();
    assert.equal(await replacementDialog.getAttribute('lang'), 'uk');
    assert.deepEqual(await replacementDialog.locator('p, li').allTextContents(), replacementText);
    await page.keyboard.press('Escape');
    await replacementDialog.waitFor({ state: 'hidden' });
    assert.equal(await replacementOpener.evaluate(element => element === document.activeElement), true);
    const area = page.getByRole('region', { name: 'Облік технічної води', exact: true });
    let readingCount = 0;
    let importSample;
    let intervalCount = 0;
    let closedCount = 0;
    let replacementCount = 0;
    if (process.env.STAND_WATER_REPLACEMENT_UI === '1') assert.equal(community.canReplaceWater, true);
    for (const point of points) {
      const historyReply = page.waitForResponse(reply => reply.url().endsWith('/points/' + point.id + '/installations'));
      await area.getByLabel(/^Точка обліку води/).selectOption(point.installationId);
      const historyResponse = await historyReply;
      assert.equal(historyResponse.status(), 200);
      const history = await historyResponse.json();
      assert.ok(history.length > 0);
      const replacement = area.getByText('Замінити водомір', { exact: true }).locator('..');
      assert.equal(await area.getByText('Замінити водомір', { exact: true }).count(), community.canReplaceWater ? 1 : 0);
      if (community.canReplaceWater) await replacement.locator('summary').first().click();
      for (const installation of history) {
        if (history.length > 1) await area.getByLabel(/^Історія водомірів/).selectOption(installation.id);
        await area.getByText(installation.id, { exact: true }).waitFor();
        if (installation.endsBefore) {
          closedCount++;
          assert.ok((await area.getByLabel(/^Історія водомірів/).locator('option:checked').innerText()).includes(installation.endsBefore));
        }
        if (installation.reason) {
          replacementCount++;
          assert.equal(await area.getByText('Причина заміни · ' + installation.reason, { exact: true }).count(), 1);
        }
        if (community.canReplaceWater) {
          const target = replacement.locator(':scope > p');
          assert.equal(await target.count(), 1, 'One explicit replacement target');
          assert.equal(await target.innerText(), 'Заміна стосується чинного водоміра ' + point.meterDesignation + ', діє з ' + point.startsOn + '.');
          assert.equal(await replacement.getByRole('button', { name: 'Зареєструвати заміну водоміра', exact: true }).count(), 1);
        }
        const seriesReply = await context.request.get(origin + '/community/water/' + process.env.STAND_COMMUNITY
          + '/installations/' + installation.id + '/readings');
        assert.equal(seriesReply.status(), 200);
        const series = await seriesReply.json();
        if (!importSample && series.readings.length) importSample = { installation: installation.id, reading: series.readings[0] };
        const readings = area.getByRole('table', { name: 'Показання води', exact: true });
        const intervals = area.getByRole('table', { name: 'Споживання води', exact: true });
        await readings.waitFor();
        assert.equal(await readings.locator('tbody tr').count(), series.readings.length);
        for (const [index, row] of series.readings.entries()) {
          assert.deepEqual(await readings.locator('tbody tr').nth(index).locator('td').allTextContents(),
            [row.date, row.valueExact.replace('.', ',')]);
        }
        assert.equal(await intervals.locator('tbody tr').count(), series.intervals.length);
        for (const [index, row] of series.intervals.entries()) {
          assert.deepEqual(await intervals.locator('tbody tr').nth(index).locator('td').allTextContents(),
            [row.from, row.to, row.valueExact.replace('.', ',')]);
        }
        assert.equal(await area.getByRole('button', { name: 'Визнати показання води', exact: true }).count(), community.canRecognizeWater ? 1 : 0);
        readingCount += series.readings.length;
        intervalCount += series.intervals.length;
      }
    }
    assert.ok(readingCount > 0 && intervalCount > 0, 'Existing synthetic readings and intervals required');
    assert.ok(closedCount > 0 && replacementCount > 0, 'Existing synthetic replacement history required');
    await replacementOpener.click();
    await replacementDialog.waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await replacementDialog.evaluate(element => element.scrollWidth <= element.clientWidth), true);
    const replacementBox = await replacementDialog.boundingBox();
    assert.ok(replacementBox && replacementBox.width <= 390 && replacementBox.height <= 844);
    await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT + '.replacement.png' });
    await replacementDialog.getByRole('button', { name: 'Закрити посібник заміни водоміра', exact: true }).click();
    await replacementDialog.waitFor({ state: 'hidden' });
    assert.equal(await replacementOpener.evaluate(element => element === document.activeElement), true);
    assert.ok(importSample, 'Existing recognized reading is required for the duplicate preview');
    const importArea = area.getByText('Імпорт показань води CSV', { exact: true }).locator('..');
    await importArea.locator('summary').first().click();
    const importSummary = importArea.getByText('Довідка: Імпорт показань води', { exact: true });
    await importSummary.click();
    const importText = await importSummary.locator('..').locator('p, li').allTextContents();
    const importOpener = importArea.getByRole('button', { name: 'Посібник: імпорт води', exact: true });
    const importDialog = page.getByRole('dialog', { name: 'Імпорт показань води CSV', exact: true });
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
    const csv = 'installation_id,measured_on,value_m3\n'
      + [installation, reading.date, reading.valueExact].join(',') + '\n'
      + [installation, 'not-a-date', reading.valueExact].join(',') + '\n'
      + [installation, reading.date, reading.valueExact, 'extra'].join(',') + '\n';
    await upload.setInputFiles({ name: 'synthetic-readings.csv', mimeType: 'text/csv', buffer: Buffer.from(csv, 'utf8') });
    const replyPromise = page.waitForResponse(response => new URL(response.url()).pathname === previewPath);
    await previewButton.click();
    const reply = await replyPromise;
    assert.equal(reply.status(), 200);
    const preview = await reply.json();
    assert.deepEqual(preview.rows.map(row => [row.line, row.outcome]), [[2, 'AlreadyRecorded'], [3, 'InvalidDate'], [4, 'InvalidFields']]);
    await importArea.getByRole('table', { name: 'Попередній перегляд CSV', exact: true }).waitFor();
    await importArea.getByRole('cell', { name: 'Уже записано', exact: true }).waitFor();
    await importArea.getByRole('cell', { name: 'Некоректна дата', exact: true }).waitFor();
    await importArea.getByRole('cell', { name: 'Очікується три поля', exact: true }).waitFor();
    const applyButton = importArea.getByRole('button', { name: 'Підтвердити й застосувати CSV', exact: true });
    assert.equal(await applyButton.count(), community.canRecognizeWater ? 1 : 0);
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
    await importDialog.getByRole('button', { name: 'Закрити посібник імпорту води', exact: true }).click();
    await importDialog.waitFor({ state: 'hidden' });
    assert.equal(await importOpener.evaluate(element => element === document.activeElement), true);

    await opener.click();
    await dialog.waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth), true);
    const box = await dialog.boundingBox();
    assert.ok(box && box.width <= 390 && box.height <= 844);
    await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT });
    await dialog.getByRole('button', { name: 'Закрити посібник води', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(await opener.evaluate(element => element === document.activeElement), true);
    await page.locator('select').first().selectOption('');
    assert.equal(await summary.count(), 0);
    assert.equal(await replacementSummary.count(), 0);
    assert.equal(await replacementDialog.count(), 0);
    assert.equal(await importSummary.count(), 0);
    assert.equal(await importDialog.count(), 0);
    assert.equal(await dialog.count(), 0);
    assert.equal(writes, 0);
    console.log('Water replacement UI: ' + (community.canReplaceWater ? 'current target checked across history' : 'form absent'));
    assert.deepEqual(errors, []);
    console.log('PASS: water shared help, ' + points.length + ' points, ' + readingCount + ' readings, '
      + intervalCount + ' intervals, shared import/replacement guides, replacement history and target, CSV preview, duplicate/date/fields/header/size rejection, recognition visibility, Escape/focus, 390px, community reset, no writes');
  } finally { await browser.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
