const assert = require('node:assert/strict');
const readline = require('node:readline');

module.exports = async function checkCsvImportRevocation({
  page, area, applyPath, previewPath, click, read, empty, preview, firstValue, errors, expectedSource,
}) {
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
  assert.deepEqual(await report.locator('tbody td:last-child').allTextContents(),
    ['Визнано', 'Дозвіл відкликано', 'Дозвіл відкликано']);
  const final = await read();
  assert.deepEqual(final.readings.map(row => [row.id, row.date, row.valueExact]),
    [[applied.rows[0].readingId, '2026-01-01', firstValue]]);
  if (expectedSource !== undefined) assert.equal(final.readings[0].source, expectedSource);
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
};
