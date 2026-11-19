// Write only to the isolated synthetic community created by the Python harness.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const readline = require('node:readline');
const checkCsvImportRevocation = require('./check_csv_import_revocation.cjs');
const checkWaterCsvReplacementRace = require('./check_water_csv_replacement_race.cjs');

(async () => {
  const origin = 'https://127.0.0.1:5543';
  const community = process.env.STAND_COMMUNITY;
  assert.match(community, /^[0-9a-f-]{36}$/);
  const base = `/community/water/${community}`;
  const previewPath = base + '/reading-import/preview';
  const applyPath = base + '/reading-import/apply';
  const browser = await chromium.launch({ channel: 'msedge' });
  try {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, serviceWorkers: 'block' });
    await context.addCookies([{ name: '__Host-communityos-platform', value: process.env.STAND_PROBE_COOKIE,
      url: origin, secure: true, httpOnly: true }]);
    const writes = new Set([previewPath, applyPath]);
    await context.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin !== origin || (request.method() !== 'GET' &&
          !(request.method() === 'POST' && writes.has(url.pathname))))
        throw new Error('Unexpected request outside isolated CSV probe');
      await route.continue();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const communitiesReply = page.waitForResponse(response => response.url().endsWith('/community/register/communities'));
    await page.goto(origin + '/community/');
    assert.equal((await (await communitiesReply).json()).find(item => item.id === community)?.canRecognizeWater, true);
    const pointsReply = page.waitForResponse(response => response.url().endsWith(base + '/points'));
    await page.locator('select').first().selectOption(community);
    const point = (await (await pointsReply).json()).find(point => point.meterDesignation === 'Meter 0');
    assert.ok(point);
    const installation = { id: point.installationId };
    const seriesPath = `${base}/installations/${installation.id}/readings`;
    const historical = process.env.STAND_IMPORT_HISTORY === 'true';
    const revokeDuringApply = process.env.STAND_CSV_IMPORT_REVOCATION === 'true';
    const raceOrder = process.env.STAND_WATER_IMPORT_RACE;
    let next;
    if (historical) {
      const series = page.waitForResponse(response => response.url().endsWith(seriesPath));
      await page.locator('label').filter({ hasText: /^Точка обліку води/ }).locator('select').selectOption(installation.id);
      assert.equal((await series).status(), 200);
      const replacement = page.locator('details').filter({ has: page.locator(':scope > summary', { hasText: /^Замінити водомір$/ }) });
      await replacement.locator(':scope > summary').click();
      for (const [name, value] of Object.entries({ meterDesignation: 'Synthetic CSV replacement',
        effectiveOn: '2026-01-04', reason: 'Synthetic CSV history acceptance' }))
        await replacement.locator(`input[name="${name}"]`).fill(value);
      const path = `${base}/installations/${installation.id}/replace`;
      writes.add(path);
      const reply = page.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith(path));
      await replacement.getByRole('button', { name: 'Зареєструвати заміну водоміра', exact: true }).click();
      const response = await reply;
      assert.equal(response.status(), 200);
      const body = await response.json();
      assert.equal(body.outcome, 'Replaced');
      next = body.installationId;
      assert.notEqual(next, installation.id);
      await page.getByText('Заміну водоміра зареєстровано.', { exact: true }).waitFor();
    }
    const rowsToImport = raceOrder ? ['2026-01-04,10'] : revokeDuringApply ? ['2026-01-01,10', '2026-01-02,11', '2026-01-03,12.5'] : [
      '2026-01-01,10', '2026-01-03,12.5', '2026-01-02,13',
      '2026-01-02,11', '2026-01-01,10', '2026-01-01,12',
      'not-a-date,14', '2025-12-31,1',
    ];
    const csv = 'installation_id,measured_on,value_m3\n' + rowsToImport.map(row => installation.id + ',' + row).concat(historical ? [
      `${installation.id},2026-01-04,13`, `${next},2026-01-04,1`, `${next},2026-01-05,4`,
    ] : []).join('\n') + '\n';
    const digest = createHash('sha256').update(csv).digest('hex').toUpperCase();
    const area = page.locator('details').filter({ has: page.locator(':scope > summary', { hasText: /^Імпорт показань води CSV$/ }) });
    await area.locator(':scope > summary').click();
    await area.locator('input[type="file"]').setInputFiles({ name: 'synthetic-readings.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
    async function read(path = seriesPath) {
      return page.evaluate(async path => {
        const response = await fetch(path);
        if (!response.ok) throw new Error('Synthetic reading series unavailable');
        return response.json();
      }, path);
    }
    async function click(name, path) {
      const reply = page.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith(path));
      await area.getByRole('button', { name, exact: true }).click();
      const response = await reply;
      assert.equal(response.status(), 200);
      return response.json();
    }
    const empty = await read();
    assert.deepEqual(empty.readings, []);
    const preview = await click('Переглянути CSV', previewPath);
    assert.equal(preview.digest, digest);
    if (raceOrder) {
      await checkWaterCsvReplacementRace({ page, base, point, area, writes, read, preview, applyPath, order: raceOrder, errors });
      return;
    }
    if (revokeDuringApply) {
      await checkCsvImportRevocation({
        page, area, applyPath, previewPath, click, read, empty, preview, errors, firstValue: '10',
      });
      return;
    }
    assert.deepEqual(preview.rows.map(row => row.outcome),
      ['Ready', 'Ready', 'Ready', 'Ready', 'Ready', 'Ready', 'InvalidDate', 'OutsideInstallation']
        .concat(historical ? ['OutsideInstallation', 'Ready', 'Ready'] : []));
    assert.deepEqual(await read(), empty, 'Preview must not recognize readings');
    async function rawApply(body, csrf) {
      return page.evaluate(async ({ path, body, digest, csrf }) => {
        const headers = { 'Content-Type': 'text/csv', 'X-Reading-Import-Digest': digest };
        if (csrf) headers['X-Platform-CSRF'] = (await (await fetch('/platform/csrf')).json()).token;
        const response = await fetch(path, { method: 'POST', headers, body });
        return { status: response.status, body: await response.json().catch(() => null) };
      }, { path: applyPath, body, digest, csrf });
    }
    const mismatch = await rawApply(csv.replace(',10\n', ',9\n'), true);
    assert.equal(mismatch.status, 409);
    assert.equal(mismatch.body.outcome, 'PreviewMismatch');
    assert.equal((await rawApply(csv, false)).status, 403);
    assert.deepEqual(await read(), empty);
    const applied = await click('Підтвердити й застосувати CSV', applyPath);
    assert.deepEqual(applied.rows.map(row => row.outcome),
      ['Recognized', 'Recognized', 'Decreasing', 'Recognized', 'AlreadyRecorded', 'DateConflict', 'InvalidDate', 'OutsideInstallation']
        .concat(historical ? ['OutsideInstallation', 'Recognized', 'Recognized'] : []));
    assert.equal(applied.rows[0].readingId, applied.rows[4].readingId);
    const final = await read();
    assert.equal(final.unit, 'm³');
    assert.deepEqual(final.readings.map(row => [row.date, row.valueExact]),
      [['2026-01-01', '10'], ['2026-01-02', '11'], ['2026-01-03', '12.5']]);
    assert.deepEqual(final.intervals.map(row => [row.from, row.to, row.valueExact]),
      [['2026-01-01', '2026-01-02', '1'], ['2026-01-02', '2026-01-03', '1.5']]);
    const nextPath = `${base}/installations/${next}/readings`;
    const nextFinal = historical ? await read(nextPath) : null;
    if (historical) {
      assert.deepEqual(nextFinal.readings.map(row => [row.date, row.valueExact]), [['2026-01-04', '1'], ['2026-01-05', '4']]);
      assert.deepEqual(nextFinal.intervals.map(row => [row.from, row.to, row.valueExact]), [['2026-01-04', '2026-01-05', '3']]);
      const installations = await read(`${base}/points/${point.id}/installations`);
      assert.deepEqual(installations.map(row => [row.id, row.startsOn, row.endsBefore]),
        [[next, '2026-01-04', null], [installation.id, '2026-01-01', '2026-01-04']]);
    }
    const repeated = await click('Підтвердити й застосувати CSV', applyPath);
    assert.deepEqual(repeated.rows.map(row => row.outcome),
      ['AlreadyRecorded', 'AlreadyRecorded', 'DateConflict', 'AlreadyRecorded', 'AlreadyRecorded', 'DateConflict', 'InvalidDate', 'OutsideInstallation']
        .concat(historical ? ['OutsideInstallation', 'AlreadyRecorded', 'AlreadyRecorded'] : []));
    assert.deepEqual(await read(), final, 'Replay must preserve IDs and original attribution');
    if (historical) assert.deepEqual(await read(nextPath), nextFinal);
    const labels = { AlreadyRecorded: 'Уже записано', DateConflict: 'Інше значення за цю дату',
      InvalidDate: 'Некоректна дата', OutsideInstallation: 'Дата поза періодом установки' };
    const table = area.getByRole('table', { name: 'Результат застосування CSV', exact: true });
    await table.waitFor();
    const rows = table.locator('tbody tr');
    assert.equal(await rows.count(), repeated.rows.length);
    for (let index = 0; index < repeated.rows.length; index++) {
      const cells = rows.nth(index).locator('td');
      assert.equal(await cells.nth(0).textContent(), String(index + 2));
      assert.equal(await cells.last().textContent(), labels[repeated.rows[index].outcome]);
    }
    if (historical) {
      const picker = page.locator('label').filter({ hasText: /^Історія водомірів/ }).locator('select');
      for (const [id, expected] of [[installation.id, final], [next, nextFinal]]) {
        const reply = page.waitForResponse(response => response.url().endsWith(`${base}/installations/${id}/readings`));
        await picker.selectOption(id);
        assert.equal((await reply).status(), 200);
        const values = await page.getByRole('table', { name: 'Показання води', exact: true }).locator('tbody tr').allTextContents();
        assert.equal(values.length, expected.readings.length);
        for (let index = 0; index < values.length; index++) {
          assert.ok(values[index].includes(expected.readings[index].date));
          assert.ok(values[index].replace(',', '.').includes(expected.readings[index].valueExact));
        }
      }
    }
    await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT + '.applied.png', fullPage: true });
    const input = readline.createInterface({ input: process.stdin });
    const acknowledged = new Promise(resolve => input.once('line', resolve));
    console.log('REVOKE');
    assert.equal(await acknowledged, 'REVOKED');
    input.close();
    const deniedReply = page.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith(applyPath));
    await area.getByRole('button', { name: 'Підтвердити й застосувати CSV', exact: true }).click();
    assert.equal((await deniedReply).status(), 403);
    await area.getByText('Дозвіл на цю дію відсутній.', { exact: true }).waitFor();
    assert.deepEqual(await read(), final);
    const afterRevocation = await click('Переглянути CSV', previewPath);
    assert.deepEqual(afterRevocation.rows.map(row => row.outcome), repeated.rows.map(row => row.outcome));
    await page.reload();
    const loaded = page.waitForResponse(response => response.url().endsWith(base + '/points'));
    await page.locator('select').first().selectOption(community);
    await loaded;
    await area.locator(':scope > summary').click();
    await area.locator('input[type="file"]').setInputFiles({ name: 'synthetic-readings.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
    await click('Переглянути CSV', previewPath);
    assert.equal(await area.getByRole('button', { name: 'Підтвердити й застосувати CSV', exact: true }).count(), 0);
    assert.deepEqual(await read(), final);
    if (historical) assert.deepEqual(await read(nextPath), nextFinal);
    await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT, fullPage: true });
    assert.deepEqual(errors, []);
    console.log('PASS: water CSV preview, partial apply, replay revalidation, installation boundary and revoked stale apply');
    if (historical) console.log('PASS: historical CSV keeps old and new installation series separate across replacement boundary');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
