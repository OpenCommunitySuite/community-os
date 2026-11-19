// Replace the meter and recognize the new series through the UI in an isolated synthetic community.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const readline = require('node:readline');

(async () => {
  const origin = 'https://127.0.0.1:5543';
  const community = process.env.STAND_COMMUNITY;
  assert.match(community, /^[0-9a-f-]{36}$/);
  const base = `/community/water/${community}`;
  const browser = await chromium.launch({ channel: 'msedge' });
  try {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, serviceWorkers: 'block' });
    await context.addCookies([{ name: '__Host-communityos-platform', value: process.env.STAND_PROBE_COOKIE,
      url: origin, secure: true, httpOnly: true }]);
    const writes = new Set();
    await context.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin !== origin || (request.method() !== 'GET' &&
          !(request.method() === 'POST' && writes.has(url.pathname))))
        throw new Error(`Unexpected request in isolated root replacement probe: ${request.method()} ${url.pathname}`);
      await route.continue();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const reply = (path, method = 'GET') => page.waitForResponse(response =>
      new URL(response.url()).pathname === path && response.request().method() === method);
    const section = title => page.locator('details').filter({
      has: page.locator(':scope > summary', { hasText: title }),
    });
    const get = path => page.evaluate(async path => {
      const response = await fetch(path);
      if (!response.ok) throw new Error('Synthetic read failed');
      return response.json();
    }, path);

    const communitiesReply = reply('/community/register/communities');
    await page.goto(origin + '/community/');
    const selected = (await (await communitiesReply).json()).find(item => item.id === community);
    assert.ok(selected.canReadWater && selected.canRecognizeWater && selected.canReplaceWater);
    const pointsReply = reply(base + '/points');
    await page.locator('select').first().selectOption(community);
    const points = await (await pointsReply).json();
    const { id: root, installationId: old } = points.find(point => point.designation === 'Root');
    const street = points.find(point => point.designation === 'Street').id;
    const leaf = points.find(point => point.designation === 'Water 0').id;
    const other = points.find(point => point.designation === 'Water 1').id;
    const readingPath = id => `${base}/installations/${id}/readings`;
    const historyPath = `${base}/points/${root}/installations`;
    const topologyPaths = ['/topology/dates', '/topology?date=2026-01-02', '/topology?date=2026-01-08'];
    const topologies = () => Promise.all(topologyPaths.map(path => get(base + path)));
    const before = await topologies();
    const placements = topology => Object.fromEntries(topology.points.map(point => [point.pointId, point.parentId]));
    assert.equal(before[1].startsOn, '2026-01-01');
    assert.deepEqual(placements(before[1]), { [root]: null, [street]: root, [leaf]: street, [other]: root });
    assert.equal(before[2].startsOn, '2026-01-04');
    assert.deepEqual(placements(before[2]), { [root]: null, [leaf]: root, [other]: root });

    const oldReply = reply(readingPath(old));
    await page.locator('label').filter({ hasText: /^Точка обліку води/ }).locator('select').selectOption(old);
    const original = await (await oldReply).json();
    const replacePath = `${base}/installations/${old}/replace`;
    writes.add(replacePath);
    const replacement = section(/^Замінити водомір$/);
    await replacement.locator(':scope > summary').click();
    const meter = 'Synthetic replacement root meter';
    for (const [name, value] of Object.entries({
      meterDesignation: meter, effectiveOn: '2026-01-07', reason: 'Synthetic root replacement balance',
    })) await replacement.locator(`input[name="${name}"]`).fill(value);
    const replaced = reply(replacePath, 'POST');
    await replacement.getByRole('button', { name: 'Зареєструвати заміну водоміра', exact: true }).click();
    const response = await replaced;
    assert.equal(response.status(), 200);
    const change = await response.json();
    assert.equal(change.outcome, 'Replaced');
    const next = change.installationId;
    assert.match(next, /^[0-9a-f-]{36}$/);
    assert.notEqual(next, old);
    writes.delete(replacePath);
    writes.add(readingPath(next));
    await page.getByText('Заміну водоміра зареєстровано.', { exact: true }).waitFor();
    const history = await get(historyPath);
    assert.deepEqual(history.map(item => [item.id, item.startsOn, item.endsBefore]), [
      [next, '2026-01-07', null],
      [old, '2026-01-01', '2026-01-07'],
    ]);
    assert.deepEqual((await get(base + '/points')).find(point => point.id === root),
      { ...points.find(point => point.id === root), installationId: next, meterDesignation: meter, startsOn: '2026-01-07' });
    assert.deepEqual(await topologies(), before);

    const recognizeButton = page.getByRole('button', { name: 'Визнати показання води', exact: true });
    const reading = page.locator('form').filter({ has: recognizeButton });
    async function recognize(date, value) {
      await reading.getByLabel('Дата показання води', { exact: true }).fill(date);
      await reading.locator('input[name="value"]').fill(value);
      const recognized = reply(readingPath(next), 'POST');
      await recognizeButton.click();
      return recognized;
    }
    for (const [date, value] of [['2026-01-07', '100'], ['2026-01-08', '104']]) {
      const result = await recognize(date, value);
      assert.equal(result.status(), 200);
      assert.equal((await result.json()).outcome, 'Recognized');
      await page.getByText('Показання води визнано.', { exact: true }).waitFor();
    }
    const current = await get(readingPath(next));
    assert.deepEqual(current.readings.map(item => [item.date, item.valueExact]),
      [['2026-01-07', '100'], ['2026-01-08', '104']]);
    assert.deepEqual(current.intervals.map(interval => interval.valueExact), ['4']);
    assert.deepEqual(await get(readingPath(old)), original);

    const balance = section(/^Звірка обсягів води$/);
    await balance.locator(':scope > summary').click();
    const row = balance.getByRole('table', { name: 'Обсяги за точками, м³', exact: true })
      .locator('tbody tr').filter({ has: page.getByRole('rowheader', { name: 'Root', exact: true }) });
    async function reconcile(from, until, volume, childrenVolume, difference) {
      await balance.getByLabel('Початок звірки води', { exact: true }).fill(from);
      await balance.getByLabel('Кінець звірки води', { exact: true }).fill(until);
      const calculated = reply(base + '/balance');
      await balance.getByRole('button', { name: 'Розрахувати звірку води', exact: true }).click();
      const result = await calculated;
      assert.equal(result.status(), 200);
      const data = await result.json();
      assert.equal(data.outcome, 'Ready');
      assert.deepEqual(data.points.find(point => point.id === root), {
        id: root, parentId: null, designation: 'Root', volume, missingStart: false, missingEnd: false,
        installationChanged: volume === null,
      });
      assert.deepEqual(data.branches, [{ id: root, childrenVolume, difference }]);
      assert.deepEqual(data.points.filter(point => point.parentId === root).map(point => point.id).sort(),
        [leaf, other].sort());
      await row.waitFor();
      const cells = ['—', volume === null ? 'Заміна лічильника' : String(volume), String(childrenVolume),
        difference === null ? '—' : String(difference), '—'];
      await row.locator('td').filter({ hasText: new RegExp(`^${cells[1]}$`) }).waitFor();
      assert.deepEqual(await row.locator('td').allTextContents(), cells);
    }
    await reconcile('2026-01-04', '2026-01-06', 1, 3, -2);
    await reconcile('2026-01-06', '2026-01-07', null, 2, null);
    const downloaded = page.waitForEvent('download');
    await balance.getByRole('button', { name: 'Завантажити звірку води CSV', exact: true }).click();
    const download = await downloaded;
    assert.equal(download.suggestedFilename(), 'water-balance-2026-01-06-2026-01-07.csv');
    const chunks = [];
    for await (const chunk of await download.createReadStream()) chunks.push(chunk);
    const rootRows = Buffer.concat(chunks).toString('utf8').split('\r\n')
      .map(line => line.split(';').map(cell => cell.replace(/^"|"$/g, '')))
      .filter(cells => cells[2] === 'Root');
    assert.deepEqual(rootRows, [['2026-01-06', '2026-01-07', 'Root', '', '', '2,000', '', '', 'Так']]);
    await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT, fullPage: true });
    await reconcile('2026-01-07', '2026-01-08', 4, 3, 1);

    const input = readline.createInterface({ input: process.stdin });
    const acknowledged = new Promise(resolve => input.once('line', resolve));
    console.log('REVOKE');
    assert.equal(await acknowledged, 'REVOKED');
    input.close();
    assert.equal((await recognize('2026-01-09', '108')).status(), 403);
    await page.getByText('Дозвіл на цю дію відсутній.', { exact: true }).waitFor();
    assert.deepEqual(await get(readingPath(next)), current);
    assert.deepEqual(await get(historyPath), history);
    await reconcile('2026-01-06', '2026-01-07', null, 2, null);
    assert.deepEqual(errors, []);
    console.log('PASS: real root replacement, dated topology and history, both numeric periods, cross-replacement UI/CSV and revoked stale form');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
