// Existing synthetic trees; browser-only editor/empty-list fixtures never change grants or versions.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
  const origin = 'https://127.0.0.1:5543';
  const endpoint = '/community/water/' + process.env.STAND_COMMUNITY;
  const browser = await chromium.launch({ channel: 'msedge' });
  try {
    for (const uiFixture of [false, true]) {
      const context = await browser.newContext({ ignoreHTTPSErrors: true, serviceWorkers: 'block' });
      let writes = 0;
      let emptyDates = false;
      await context.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (route.request().method() !== 'GET') { writes++; await route.abort('blockedbyclient'); return; }
        if (uiFixture && url.pathname === '/community/register/communities') {
          const response = await route.fetch();
          assert.equal(response.status(), 200);
          const communities = await response.json();
          const selected = communities.find(item => item.id === process.env.STAND_COMMUNITY);
          assert.ok(selected?.canReadWater);
          selected.canSetupWater = true;
          await route.fulfill({ response, json: communities });
        } else if (emptyDates && url.pathname === endpoint + '/topology/dates') {
          await route.fulfill({ status: 200, contentType: 'application/json', json: [] });
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
      const pointsReply = page.waitForResponse(response => new URL(response.url()).pathname === endpoint + '/points');
      await page.locator('select').first().selectOption(process.env.STAND_COMMUNITY);
      const pointsResponse = await pointsReply;
      assert.equal(pointsResponse.status(), 200);
      const points = await pointsResponse.json();
      const names = new Map(points.map(point => [point.id, point.designation]));
      const area = page.locator('summary').filter({ hasText: /^Дерево обліку води$/ }).locator('..');
      await area.locator('summary').first().click();
      const help = area.getByText('Довідка: Дерево обліку води', { exact: true }).locator('..');
      await help.locator('summary').click();
      const content = await help.locator('p, li').allTextContents();
      assert.ok(content.some(text => text.includes('від обраної для порівняння версії до відкритої')));
      const opener = help.getByRole('button', { name: 'Посібник: дерево води', exact: true });
      const dialog = page.getByRole('dialog', { name: 'Дерево обліку води', exact: true });
      await opener.click();
      await dialog.waitFor();
      assert.equal(await dialog.getAttribute('lang'), 'uk');
      assert.deepEqual(await dialog.locator('p, li').allTextContents(), content);
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden' });
      assert.equal(await opener.evaluate(element => element === document.activeElement), true);
      const editor = area.getByRole('group', { name: 'Нова версія дерева води', exact: true });
      assert.equal(await editor.count(), community.canSetupWater ? 1 : 0);

      const historyButton = area.getByRole('button', { name: 'Показати історію версій', exact: true });
      async function loadDates() {
        const reply = page.waitForResponse(response => new URL(response.url()).pathname === endpoint + '/topology/dates');
        await historyButton.click();
        const response = await reply;
        assert.equal(response.status(), 200);
        return response.json();
      }
      const dates = await loadDates();
      assert.ok(dates.length >= 2, 'Use existing synthetic water topology history');
      assert.deepEqual(dates, [...dates].sort().reverse());
      const versions = area.getByLabel('Опубліковані версії', { exact: true });
      await versions.waitFor();
      assert.deepEqual(await versions.locator('option:not([disabled])').evaluateAll(items => items.map(item => item.value)), dates);
      const published = area.getByRole('region', { name: 'Опубліковане дерево води', exact: true });
      async function selectVersion(day) {
        const reply = page.waitForResponse(response => new URL(response.url()).pathname === endpoint + '/topology');
        await versions.selectOption(day);
        const response = await reply;
        assert.equal(response.status(), 200);
        const tree = await response.json();
        await published.getByText('Діє з ' + tree.startsOn, { exact: true }).waitFor();
        assert.equal(await published.locator('ul li').count(), tree.points.length);
        const displayed = await published.locator('ul li').evaluateAll(items => items.map(item => ({
          name: item.firstChild.textContent.trim(),
          parent: item.parentElement.closest('li')?.firstChild.textContent.trim() ?? null,
        })).sort((a, b) => a.name.localeCompare(b.name)));
        assert.deepEqual(displayed, tree.points.map(point => ({ name: names.get(point.pointId),
          parent: point.parentId ? names.get(point.parentId) : null,
        })).sort((a, b) => a.name.localeCompare(b.name)));
        return tree;
      }
      const oldest = await selectVersion(dates.at(-1));
      const current = await selectVersion(dates[0]);
      const compareReply = page.waitForResponse(response => new URL(response.url()).pathname === endpoint + '/topology');
      await published.getByLabel('Порівняти з версією', { exact: true }).selectOption(oldest.startsOn);
      assert.equal((await compareReply).status(), 200);
      const comparison = published.getByRole('region', { name: 'Відмінності опублікованих версій', exact: true });
      await comparison.waitFor();
      const before = new Map(oldest.points.map(point => [point.pointId, point.parentId]));
      const after = new Map(current.points.map(point => [point.pointId, point.parentId]));
      const label = parent => parent === undefined ? 'поза деревом' : parent === null ? 'загальна точка' : names.get(parent);
      const expected = [...new Set([...before.keys(), ...after.keys()])]
        .filter(id => before.get(id) !== after.get(id))
        .map(id => `${names.get(id)} · ${label(before.get(id))} → ${label(after.get(id))}`);
      assert.ok(expected.length > 0, 'Use synthetic versions with changed links');
      assert.deepEqual(await comparison.locator('li').allTextContents(), expected);

      if (uiFixture) {
        await editor.getByLabel('Дата набрання чинності', { exact: true }).fill('2027-01-01');
        await published.getByRole('button', { name: 'Скопіювати зв’язки в нову версію', exact: true }).click();
        assert.equal(await editor.getByLabel('Дата набрання чинності', { exact: true }).inputValue(), '');
        const root = current.points.find(point => point.parentId === null).pointId;
        assert.equal(await editor.getByLabel('Загальна точка', { exact: true }).inputValue(), root);
        for (const point of current.points.filter(point => point.parentId)) {
          assert.equal(await editor.getByLabel('Батьківська точка для ' + names.get(point.pointId), { exact: true }).inputValue(), point.parentId);
        }
        const changes = editor.getByRole('region', { name: 'Зміни у новій версії', exact: true });
        await changes.getByText('Зв’язки не змінилися.', { exact: true }).waitFor();
        const street = current.points.find(point => point.parentId === root && current.points.some(child => child.parentId === point.pointId));
        assert.ok(street, 'Use existing street with a child plot');
        const children = current.points.filter(point => point.parentId === street.pointId);
        await editor.getByLabel('Батьківська точка для ' + names.get(street.pointId), { exact: true }).selectOption('');
        await editor.getByRole('status').getByText('Підключено безпосередньо до загальної точки. Ділянок перенесено: ' + children.length + '.', { exact: true }).waitFor();
        for (const child of children) {
          assert.equal(await editor.getByLabel('Батьківська точка для ' + names.get(child.pointId), { exact: true }).inputValue(), root);
          await changes.getByText(`${names.get(child.pointId)} · ${names.get(street.pointId)} → ${names.get(root)}`, { exact: true }).waitFor();
        }
        await editor.getByLabel('Загальна точка', { exact: true }).selectOption(street.pointId);
        for (const point of points.filter(point => point.id !== street.pointId)) {
          assert.equal(await editor.getByLabel('Батьківська точка для ' + point.designation, { exact: true }).inputValue(), '');
        }
      }
      const beforeFirst = new Date(oldest.startsOn + 'T00:00:00Z');
      beforeFirst.setUTCDate(beforeFirst.getUTCDate() - 1);
      await area.getByLabel('Дата дерева води', { exact: true }).fill(beforeFirst.toISOString().slice(0, 10));
      await area.getByRole('button', { name: 'Показати дерево', exact: true }).click();
      await area.getByText('На цю дату дерево не опубліковано.', { exact: true }).waitFor();
      if (uiFixture) {
        emptyDates = true;
        assert.deepEqual(await loadDates(), []);
        await area.getByText('Опублікованих версій немає.', { exact: true }).waitFor();
      }
      await page.setViewportSize({ width: 390, height: 844 });
      await opener.click();
      await dialog.waitFor();
      assert.ok(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth + 1));
      const bounds = await dialog.boundingBox();
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= 390);
      await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT + (uiFixture ? '.ui.png' : '') });
      await dialog.getByRole('button', { name: 'Закрити посібник дерева води', exact: true }).click();
      await dialog.waitFor({ state: 'hidden' });
      assert.equal(await opener.evaluate(element => element === document.activeElement), true);
      await page.locator('select').first().selectOption('');
      assert.equal(await page.getByText('Довідка: Дерево обліку води', { exact: true }).count(), 0);
      assert.equal(writes, 0);
      assert.deepEqual(errors, []);
      console.log(`PASS: water topology help, ${dates.length} real versions, history/comparison/before-first-date, ${uiFixture ? 'browser-only editor/copy/reassignment/root-reset/empty-history' : 'actual permissions'}, Escape/focus, 390px, community reset, no writes`);
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
