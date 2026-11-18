// Write only to the isolated synthetic community created by the Python harness.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const readline = require('node:readline');

(async () => {
  const origin = 'https://127.0.0.1:5543';
  const community = process.env.STAND_COMMUNITY;
  assert.match(community, /^[0-9a-f-]{36}$/);
  const base = `/community/electricity/${community}`;
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
    assert.equal((await (await communitiesReply).json()).find(item => item.id === community)?.canRecognizeElectricity, true);
    const plotsReply = page.waitForResponse(response => response.url().endsWith(base + '/plots'));
    await page.locator('select').first().selectOption(community);
    const plot = (await (await plotsReply).json()).find(plot => plot.number === 'Plot 0');
    const installation = plot.installation;
    assert.equal(installation.details.multiplierExact, '40');
    const seriesPath = `${base}/installations/${installation.id}/readings`;
    const historical = process.env.STAND_ELECTRICITY_IMPORT_HISTORY === 'true';
    const dual = process.env.STAND_ELECTRICITY_IMPORT_DUAL === 'true';
    const revokeDuringApply = process.env.STAND_ELECTRICITY_IMPORT_REVOCATION === 'true';
    let next;
    if (historical) {
      const series = page.waitForResponse(response => response.url().endsWith(seriesPath));
      await page.locator('label').filter({ hasText: /^Точка або ділянка для обліку/ }).locator('select').selectOption(plot.id);
      assert.equal((await series).status(), 200);
      const replacement = page.getByRole('group', { name: 'Замінити лічильник', exact: true });
      for (const [name, value] of Object.entries({ designation: 'Synthetic CSV replacement', effectiveOn: '2026-01-04',
        reason: 'Synthetic CSV history acceptance', model: 'Test model', serialNumber: 'CSV-NEW-001',
        location: 'Synthetic plot', mountedOn: '2026-01-04', sealSerialNumber: 'CSV-SEAL-001', multiplier: '1' }))
        await replacement.locator(`input[name="${name}"]`).fill(value);
      const path = `${base}/installations/${installation.id}/replacement`;
      writes.add(path);
      const reply = page.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith(path));
      await replacement.getByRole('button', { name: 'Зареєструвати заміну', exact: true }).click();
      const response = await reply;
      assert.equal(response.status(), 200);
      const body = await response.json();
      assert.equal(body.outcome, 'Replaced');
      next = body.installationId;
      assert.notEqual(next, installation.id);
      await page.getByText('Заміну лічильника зареєстровано.', { exact: true }).waitFor();
    }
    const dualRows = [
      '2026-01-01,day,100', '2026-01-01,night,50', '2026-01-03,day,106',
      '2026-01-03,night,53', '2026-01-02,day,103', '2026-01-02,night,51',
      '2026-01-02,total,154', '2026-01-02,day,103',
    ];
    const singleRows = [
      '2026-01-01,total,100', '2026-01-03,total,103', '2026-01-02,total,104',
      '2026-01-02,total,101', '2026-01-01,total,100', '2026-01-01,total,102',
      'not-a-date,total,105', '2026-01-02,day,50',
    ];
    const revocationRows = ['2026-01-01,total,100', '2026-01-02,total,101', '2026-01-03,total,103'];
    const sourceRows = revokeDuringApply ? revocationRows : dual ? dualRows : singleRows;
    const csv = 'installation_id,measured_on,channel,value_kwh\n' + sourceRows.map(row => installation.id + ',' + row).concat(historical ? [
      `${installation.id},2026-01-04,total,104`, `${next},2026-01-04,total,1`, `${next},2026-01-05,total,4`,
    ] : []).join('\n') + '\n';
    const digest = createHash('sha256').update(csv).digest('hex').toUpperCase();
    const area = page.locator('details').filter({ has: page.locator(':scope > summary', { hasText: /^Імпорт показань CSV$/ }) });
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
    if (revokeDuringApply) {
      assert.deepEqual(preview.rows.map(row => row.outcome), ['Ready', 'Ready', 'Ready']);
      assert.deepEqual(await read(), empty);
      const input = readline.createInterface({ input: process.stdin });
      const replies = input[Symbol.asyncIterator]();
      let applied;
      try {
        console.log('REVOKE_DURING_APPLY');
        assert.equal((await replies.next()).value, 'LOCKED');
        applied = await click('Підтвердити й застосувати CSV', applyPath);
        assert.equal((await replies.next()).value, 'REVOKED');
      } finally {
        input.close();
      }
      assert.deepEqual(applied.rows.map(row => [row.line, row.outcome]),
        [[2, 'Recognized'], [3, 'Denied'], [4, 'Denied']]);
      assert.ok(applied.rows[0].readingId);
      assert.ok(applied.rows.slice(1).every(row => row.readingId === null));
      const report = area.getByRole('table', { name: 'Результат застосування CSV', exact: true });
      const deniedRows = report.getByRole('cell', { name: 'Дозвіл відкликано', exact: true });
      await deniedRows.first().waitFor();
      assert.equal(await deniedRows.count(), 2);
      const final = await read();
      assert.deepEqual(final.readings.map(row => [row.id, row.date, row.valueExact, row.source]),
        [[applied.rows[0].readingId, '2026-01-01', '100', 'csv-import']]);
      assert.deepEqual(final.intervals, []);
      await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT + '.applied.png', fullPage: true });
      const denied = page.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith(applyPath));
      await area.getByRole('button', { name: 'Підтвердити й застосувати CSV', exact: true }).click();
      assert.equal((await denied).status(), 403);
      await area.getByText('Дозвіл на цю дію відсутній.', { exact: true }).waitFor();
      const afterRevocation = await click('Переглянути CSV', previewPath);
      assert.deepEqual(afterRevocation.rows.map(row => row.outcome), ['AlreadyRecorded', 'Ready', 'Ready']);
      assert.deepEqual(await read(), final);
      assert.deepEqual(errors, []);
      console.log('PASS: one admitted CSV row commits, two are denied during apply, retry is forbidden and read stays available');
      return;
    }
    assert.deepEqual(preview.rows.map(row => row.outcome),
      (dual ? [...Array(6).fill('Ready'), 'UnsupportedChannel', 'Ready'] :
        ['Ready', 'Ready', 'Ready', 'Ready', 'Ready', 'Ready', 'InvalidDate', 'UnsupportedChannel'])
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
    const mismatch = await rawApply(csv.replace(',100\n', ',99\n'), true);
    assert.equal(mismatch.status, 409);
    assert.equal(mismatch.body.outcome, 'PreviewMismatch');
    assert.equal((await rawApply(csv, false)).status, 403);
    assert.deepEqual(await read(), empty);
    const applied = await click('Підтвердити й застосувати CSV', applyPath);
    assert.deepEqual(applied.rows.map(row => row.outcome),
      (dual ? [...Array(6).fill('Recognized'), 'UnsupportedChannel', 'AlreadyRecorded'] :
        ['Recognized', 'Recognized', 'Decreasing', 'Recognized', 'AlreadyRecorded', 'DateConflict', 'InvalidDate', 'UnsupportedChannel'])
        .concat(historical ? ['OutsideInstallation', 'Recognized', 'Recognized'] : []));
    assert.equal(applied.rows[dual ? 4 : 0].readingId, applied.rows[dual ? 7 : 4].readingId);
    const final = await read();
    const expectedByChannel = dual
      ? { day: [['100', '103', '106'], ['120', '120']], night: [['50', '51', '53'], ['40', '80']] }
      : { total: [['100', '101', '103'], ['40', '80']] };
    assert.equal(final.readings.length, dual ? 6 : 3);
    assert.equal(final.intervals.length, dual ? 4 : 2);
    for (const [channel, [values, estimates]] of Object.entries(expectedByChannel)) {
      const readings = final.readings.filter(row => row.channel === channel);
      const intervals = final.intervals.filter(row => row.channel === channel);
      assert.deepEqual(readings.map(row => [row.date, row.valueExact, row.source]), values.map((value, index) =>
        [`2026-01-0${index + 1}`, value, 'csv-import']));
      assert.deepEqual(intervals.map(row => [row.rawDeltaExact, row.valueExact]), estimates.map((value, index) =>
        [String(Number(values[index + 1]) - Number(values[index])), value]));
      for (let index = 0; index < intervals.length; index++) {
        assert.equal(intervals[index].fromReadingId, readings[index].id);
        assert.equal(intervals[index].toReadingId, readings[index + 1].id);
      }
    }
    if (dual) {
      assert.deepEqual(final.combinedIntervals.map(({ day, night, valueExact }) => ({ day, night, valueExact })),
        [0, 1].map(index => ({
          day: final.intervals.filter(row => row.channel === 'day')[index],
          night: final.intervals.filter(row => row.channel === 'night')[index],
          valueExact: ['160', '200'][index],
        })));
    }
    const nextPath = `${base}/installations/${next}/readings`;
    const nextFinal = historical ? await read(nextPath) : null;
    if (historical) {
      assert.deepEqual(nextFinal.readings.map(row => [row.date, row.valueExact, row.source]),
        [['2026-01-04', '1', 'csv-import'], ['2026-01-05', '4', 'csv-import']]);
      assert.deepEqual(nextFinal.intervals.map(row => [row.rawDeltaExact, row.valueExact]), [['3', '3']]);
      assert.equal(nextFinal.intervals[0].fromReadingId, nextFinal.readings[0].id);
      assert.equal(nextFinal.intervals[0].toReadingId, nextFinal.readings[1].id);
      const history = await read(`${base}/plots/${plot.id}/installations`);
      assert.deepEqual(history.map(row => [row.id, row.startsOn, row.endsBefore, row.details.multiplierExact]),
        [[next, '2026-01-04', null, '1'], [installation.id, '2026-01-01', '2026-01-04', '40']]);
      assert.ok(history.every(row => row.pointId === installation.pointId));
    }
    const repeated = await click('Підтвердити й застосувати CSV', applyPath);
    assert.deepEqual(repeated.rows.map(row => row.outcome),
      (dual ? [...Array(6).fill('AlreadyRecorded'), 'UnsupportedChannel', 'AlreadyRecorded'] :
        ['AlreadyRecorded', 'AlreadyRecorded', 'DateConflict', 'AlreadyRecorded', 'AlreadyRecorded', 'DateConflict', 'InvalidDate', 'UnsupportedChannel'])
        .concat(historical ? ['OutsideInstallation', 'AlreadyRecorded', 'AlreadyRecorded'] : []));
    assert.deepEqual(await read(), final, 'Replay must preserve IDs and original attribution');
    if (historical) assert.deepEqual(await read(nextPath), nextFinal);
    const labels = { AlreadyRecorded: 'Уже записано', DateConflict: 'Інше значення за цю дату',
      InvalidDate: 'Некоректна дата', UnsupportedChannel: 'Непідтримуваний регістр', OutsideInstallation: 'Дата поза періодом установки' };
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
      const picker = page.locator('label').filter({ hasText: /^Історія установок/ }).locator('select');
      for (const [id, expected] of [[installation.id, final], [next, nextFinal]]) {
        const reply = page.waitForResponse(response => response.url().endsWith(`${base}/installations/${id}/readings`));
        await picker.selectOption(id);
        assert.equal((await reply).status(), 200);
        const readingRows = page.getByRole('table').filter({ has: page.getByRole('columnheader', { name: 'Дата вимірювання', exact: true }) }).locator('tbody tr');
        const intervalRows = page.getByRole('table').filter({ has: page.getByRole('columnheader', { name: 'Різниця показань', exact: true }) }).locator('tbody tr');
        assert.equal(await readingRows.count(), expected.readings.length);
        assert.equal(await intervalRows.count(), expected.intervals.length);
        for (let index = 0; index < expected.readings.length; index++) {
          const cells = readingRows.nth(index).locator('td');
          assert.equal(await cells.nth(0).textContent(), expected.readings[index].date);
          assert.equal(await cells.nth(2).textContent(), expected.readings[index].valueExact);
          assert.equal(await cells.nth(3).textContent(), 'Імпорт CSV');
        }
        for (let index = 0; index < expected.intervals.length; index++) {
          const cells = intervalRows.nth(index).locator('td');
          assert.equal(await cells.nth(3).textContent(), expected.intervals[index].rawDeltaExact);
          assert.equal(await cells.nth(4).textContent(), expected.intervals[index].valueExact);
        }
      }
    }
    if (dual) {
      const series = page.waitForResponse(response => response.url().endsWith(seriesPath));
      await page.locator('label').filter({ hasText: /^Точка або ділянка для обліку/ }).locator('select').selectOption(plot.id);
      assert.equal((await series).status(), 200);
      const readingRows = page.getByRole('table').filter({ has: page.getByRole('columnheader', { name: 'Дата вимірювання', exact: true }) }).locator('tbody tr');
      await readingRows.first().waitFor();
      assert.equal(await readingRows.count(), 6);
      assert.deepEqual(await readingRows.locator('td:nth-child(4)').allTextContents(), Array(6).fill('Імпорт CSV'));
      const combined = page.getByRole('table').filter({ has: page.getByRole('columnheader', { name: 'Разом, кВт·год', exact: true }) });
      assert.deepEqual(await combined.locator('tbody td:last-child').allTextContents(), ['160', '200']);
      console.log('PASS: dual CSV preserves day and night readings and shows aligned combined intervals');
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
    const loaded = page.waitForResponse(response => response.url().endsWith(base + '/plots'));
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
    console.log('PASS: CSV preview, per-row apply, replay revalidation, digest, CSRF and revoked stale apply');
    if (historical) console.log('PASS: historical electricity CSV respects replacement boundary and separate multipliers 40/1');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
