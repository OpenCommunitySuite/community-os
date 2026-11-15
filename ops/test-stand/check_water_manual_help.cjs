// Existing synthetic water data only; cookie is provided via environment.
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
    const area = page.getByRole('region', { name: 'Облік технічної води', exact: true });
    let readingCount = 0;
    let intervalCount = 0;
    for (const point of points) {
      const historyReply = page.waitForResponse(reply => reply.url().endsWith('/points/' + point.id + '/installations'));
      await area.getByLabel(/^Точка обліку води/).selectOption(point.installationId);
      const historyResponse = await historyReply;
      assert.equal(historyResponse.status(), 200);
      const history = await historyResponse.json();
      assert.ok(history.length > 0);
      for (const installation of history) {
        if (history.length > 1) await area.getByLabel(/^Історія водомірів/).selectOption(installation.id);
        const seriesReply = await context.request.get(origin + '/community/water/' + process.env.STAND_COMMUNITY
          + '/installations/' + installation.id + '/readings');
        assert.equal(seriesReply.status(), 200);
        const series = await seriesReply.json();
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
    assert.equal(await dialog.count(), 0);
    assert.equal(writes, 0);
    assert.deepEqual(errors, []);
    console.log('PASS: water shared help, ' + points.length + ' points, ' + readingCount + ' readings, '
      + intervalCount + ' intervals, recognition visibility, Escape/focus, 390px, community reset, no writes');
  } finally { await browser.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
