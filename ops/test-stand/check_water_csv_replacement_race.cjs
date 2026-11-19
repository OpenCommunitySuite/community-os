const assert = require('node:assert/strict');
const readline = require('node:readline');

module.exports = async function checkWaterCsvReplacementRace({
  page, base, point, area, writes, read, preview, applyPath, order, errors,
}) {
  const installation = point.installationId;
  const seriesPath = `${base}/installations/${installation}/readings`;
  const historyPath = `${base}/points/${point.id}/installations`;
  const replacePath = `${base}/installations/${installation}/replace`;
  const date = '2026-01-04';
  const importFirst = order === 'recognize';
  assert.ok(importFirst || order === 'replace');
  assert.deepEqual(preview.rows.map(row => row.outcome), ['Ready']);
  assert.deepEqual((await read()).readings, []);
  writes.add(replacePath);

  const series = page.waitForResponse(response => response.url().endsWith(seriesPath));
  await page.locator('label').filter({ hasText: /^Точка обліку води/ }).locator('select').selectOption(installation);
  assert.equal((await series).status(), 200);
  const replacement = page.locator('details').filter({ has: page.locator(':scope > summary', { hasText: /^Замінити водомір$/ }) });
  await replacement.locator(':scope > summary').click();
  for (const [name, value] of Object.entries({
    meterDesignation: 'Synthetic concurrent replacement', effectiveOn: date, reason: 'Synthetic import and replacement acceptance',
  })) await replacement.locator(`input[name="${name}"]`).fill(value);

  const actions = {
    recognize: { path: applyPath, button: area.getByRole('button', { name: 'Підтвердити й застосувати CSV', exact: true }) },
    replace: { path: replacePath, button: replacement.getByRole('button', { name: 'Зареєструвати заміну водоміра', exact: true }) },
  };
  const input = readline.createInterface({ input: process.stdin });
  const replies = input[Symbol.asyncIterator]();
  let appliedResponse, replacedResponse;
  try {
    console.log('LOCK_RACE');
    assert.equal((await replies.next()).value, 'LOCKED');
    const pending = Object.fromEntries(Object.entries(actions).map(([key, { path }]) => [
      key, page.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith(path)),
    ]));
    await actions[order].button.click();
    assert.equal((await replies.next()).value, 'START_SECOND');
    await actions[importFirst ? 'replace' : 'recognize'].button.click();
    assert.equal((await replies.next()).value, 'RELEASED');
    [appliedResponse, replacedResponse] = await Promise.all([pending.recognize, pending.replace]);
  } finally {
    input.close();
  }

  assert.equal(appliedResponse.status(), 200);
  const applied = await appliedResponse.json();
  assert.deepEqual(applied.rows.map(row => [row.line, row.outcome]),
    [[2, importFirst ? 'Recognized' : 'OutsideInstallation']]);
  assert.equal(replacedResponse.status(), importFirst ? 409 : 200);
  const replaced = await replacedResponse.json();
  assert.equal(replaced.outcome, importFirst ? 'ExistingReading' : 'Replaced');
  const history = await read(historyPath);
  const final = await read();
  if (importFirst) {
    assert.ok(applied.rows[0].readingId);
    assert.deepEqual(final.readings.map(row => [row.id, row.date, row.valueExact]),
      [[applied.rows[0].readingId, date, '10']]);
    assert.deepEqual(history.map(item => [item.id, item.endsBefore]), [[installation, null]]);
  } else {
    assert.equal(applied.rows[0].readingId, null);
    assert.ok(replaced.installationId);
    assert.notEqual(replaced.installationId, installation);
    assert.deepEqual(history.map(item => [item.id, item.startsOn, item.endsBefore]),
      [[replaced.installationId, date, null], [installation, '2026-01-01', date]]);
    assert.deepEqual(final.readings, []);
    assert.deepEqual((await read(`${base}/installations/${replaced.installationId}/readings`)).readings, []);
  }
  const report = area.getByRole('table', { name: 'Результат застосування CSV', exact: true });
  await report.getByRole('cell', { name: importFirst ? 'Визнано' : 'Дата поза періодом установки', exact: true }).waitFor();
  await page.getByText(importFirst ? 'Є визнані показання старого водоміра на дату заміни або пізніше.' :
    'Заміну водоміра зареєстровано.', { exact: true }).waitFor();
  await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT, fullPage: true });
  assert.deepEqual(errors, []);
  console.log(`PASS: ${order} acquired the installation first and the competing write respected its boundary`);
};
