// Existing synthetic verifications; browser-only flag/date fixtures never change grants or records.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const origin = 'https://127.0.0.1:5543';
  const registerPath = '/community/water/' + process.env.STAND_COMMUNITY + '/verifications';
  const browser = await chromium.launch({ channel: 'msedge' });
  try {
    for (const uiFixture of [false, true]) {
      const context = await browser.newContext({ ignoreHTTPSErrors: true, serviceWorkers: 'block' });
      let writes = 0;
      let clockDate;
      let emptyMeter;
      await context.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (route.request().method() !== 'GET') { writes++; await route.abort('blockedbyclient'); return; }
        if (uiFixture && url.pathname === '/community/register/communities') {
          const response = await route.fetch();
          assert.equal(response.status(), 200);
          const communities = await response.json();
          const selected = communities.find(item => item.id === process.env.STAND_COMMUNITY);
          assert.ok(selected?.canReadWater);
          selected.canVerifyWater = true;
          await route.fulfill({ response, json: communities });
        } else if (uiFixture && url.pathname === registerPath) {
          const response = await route.fetch();
          assert.equal(response.status(), 200);
          const register = await response.json();
          if (clockDate) register.today = clockDate;
          if (emptyMeter) register.meters.find(item => item.id === emptyMeter).history = [];
          await route.fulfill({ response, json: register });
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
      assert.ok(community?.canReadWater);
      if (uiFixture) assert.equal(community.canVerifyWater, true);
      await page.locator('select').first().selectOption(process.env.STAND_COMMUNITY);
      const area = page.locator('summary').filter({ hasText: /^Повірка водомірів$/ }).locator('..');
      await area.locator('summary').first().click();
      const summary = area.getByText('Довідка: Повірка водомірів', { exact: true });
      await summary.click();
      const helpText = await summary.locator('..').locator('p, li').allTextContents();
      const opener = area.getByRole('button', { name: 'Посібник: повірка водомірів', exact: true });
      const dialog = page.getByRole('dialog', { name: 'Повірка водомірів', exact: true });
      await opener.click();
      await dialog.waitFor();
      assert.equal(await dialog.getAttribute('lang'), 'uk');
      assert.deepEqual(await dialog.locator('p, li').allTextContents(), helpText);
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden' });
      assert.equal(await opener.evaluate(element => element === document.activeElement), true);
      async function load() {
        const reply = page.waitForResponse(response => new URL(response.url()).pathname === registerPath);
        await area.getByRole('button', { name: 'Завантажити строки повірки', exact: true }).click();
        const response = await reply;
        assert.equal(response.status(), 200);
        const data = await response.json();
        await area.getByRole('table', { name: 'Строки повірки чинних водомірів', exact: true }).waitFor();
        await page.waitForFunction(() => [...document.querySelectorAll('button')]
          .some(button => button.textContent === 'Завантажити строки повірки' && !button.disabled));
        return data;
      }
      const register = await load();
      assert.ok(register.meters.length > 0);
      const table = area.getByRole('table', { name: 'Строки повірки чинних водомірів', exact: true });
      assert.equal(await table.locator('tbody tr').count(), register.meters.filter(item => item.active).length);
      const picker = area.getByLabel(/^Водомір для історії повірок/);
      let historyCount = 0;
      for (const meter of register.meters) {
        await picker.selectOption(meter.id);
        const history = area.getByRole('table', { name: 'Історія повірок водоміра', exact: true });
        if (meter.history.length) {
          await history.waitFor();
          assert.equal(await history.locator('tbody tr').count(), meter.history.length);
          for (const [index, record] of meter.history.entries()) {
            const cells = await history.locator('tbody tr').nth(index).locator('td').allTextContents();
            assert.deepEqual(cells.slice(0, 4), [record.verifiedOn, record.dueOn, record.evidence, record.accountId]);
          }
        } else await area.getByText('Записів про повірку немає.', { exact: true }).waitFor();
        assert.equal(await area.getByRole('button', { name: 'Зареєструвати повірку', exact: true }).count(), community.canVerifyWater ? 1 : 0);
        if (community.canVerifyWater) assert.equal(await area.getByLabel('Дата повірки', { exact: true }).getAttribute('max'), register.today);
        historyCount += meter.history.length;
      }
      assert.ok(historyCount > 0, 'Existing verification history required');
      if (uiFixture) {
        const meter = register.meters.find(item => item.active && item.history.length);
        assert.ok(meter);
        const due = new Date(meter.history[0].dueOn + 'T00:00:00Z');
        for (const [offset, state, attention] of [
          [-31, 'Строк не настав', false], [-30, 'Повірка наближається', true],
          [0, 'Строк сьогодні', true], [1, 'Прострочено', true],
        ]) {
          clockDate = new Date(due.getTime() + offset * 86400000).toISOString().slice(0, 10);
          await area.getByLabel('Лише водоміри, що потребують уваги', { exact: true }).uncheck();
          await load();
          const row = table.getByRole('row').filter({ has: page.getByRole('rowheader', { name: meter.designation, exact: true }) });
          await row.getByRole('cell', { name: state, exact: true }).waitFor();
          await area.getByLabel('Лише водоміри, що потребують уваги', { exact: true }).check();
          assert.equal(await row.count(), attention ? 1 : 0);
        }
        emptyMeter = meter.id;
        await load();
        const row = table.getByRole('row').filter({ has: page.getByRole('rowheader', { name: meter.designation, exact: true }) });
        await row.getByRole('cell', { name: 'Строк невідомий', exact: true }).waitFor();
        await picker.selectOption(meter.id);
        await area.getByText('Записів про повірку немає.', { exact: true }).waitFor();
      }
      await opener.click();
      await dialog.waitFor();
      await page.setViewportSize({ width: 390, height: 844 });
      assert.equal(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth), true);
      const box = await dialog.boundingBox();
      assert.ok(box && box.width <= 390 && box.height <= 844);
      await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT + (uiFixture ? '.ui.png' : '') });
      await dialog.getByRole('button', { name: 'Закрити посібник повірки', exact: true }).click();
      await dialog.waitFor({ state: 'hidden' });
      assert.equal(await opener.evaluate(element => element === document.activeElement), true);
      await page.locator('select').first().selectOption('');
      assert.equal(await summary.count(), 0);
      assert.equal(await dialog.count(), 0);
      assert.equal(writes, 0);
      assert.deepEqual(errors, []);
      await context.close();
      console.log('PASS: water verification help, ' + historyCount + ' existing records, '
        + (uiFixture ? 'browser-only form/date/empty-history fixtures, five deadline states and attention filter' : 'actual permissions and history')
        + ', Escape/focus, 390px, community reset, no writes');
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
