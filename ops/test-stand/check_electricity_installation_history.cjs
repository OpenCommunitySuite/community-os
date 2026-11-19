// Exercise the real registration and replacement forms for a synthetic plot.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const readline = require('node:readline');

(async () => {
  const origin = 'https://127.0.0.1:5543';
  const community = process.env.STAND_COMMUNITY;
  assert.match(community, /^[0-9a-f-]{36}$/);
  const base = `/community/electricity/${community}`;
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
        throw new Error('Unexpected request outside isolated installation history probe');
      await route.continue();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const reply = (path, method = 'GET') => page.waitForResponse(response =>
      new URL(response.url()).pathname === path && response.request().method() === method);
    const get = path => page.evaluate(async path => {
      const response = await fetch(path);
      if (!response.ok) throw new Error('Installation history read failed');
      return response.json();
    }, path);
    const electricity = page.getByRole('region', { name: 'Облік електроенергії', exact: true });
    const plotPicker = electricity.getByLabel(/^Точка або ділянка для обліку/);
    const historyPicker = electricity.getByLabel(/^Історія установок/);
    const setupForm = electricity.getByRole('group', { name: 'Зареєструвати точку обліку та установку', exact: true });
    const replaceForm = electricity.getByRole('group', { name: 'Замінити лічильник', exact: true });
    async function fill(form, fields) {
      for (const [name, value] of Object.entries(fields)) await form.locator(`input[name="${name}"]`).fill(value);
    }
    async function submit(form, button, path, status, message) {
      const submitted = reply(path, 'POST');
      await form.getByRole('button', { name: button, exact: true }).click();
      const response = await submitted;
      assert.equal(response.status(), status);
      await electricity.getByText(message, { exact: true }).waitFor();
      return response;
    }
    function assertDetails(item, designation, startsOn, endsBefore, details) {
      const { multiplier, ...attributes } = details;
      assert.equal(item.meterDesignation, designation);
      assert.equal(item.registerMode, 'dual');
      assert.equal(item.startsOn, startsOn);
      assert.equal(item.endsBefore, endsBefore);
      assert.deepEqual(item.details, { ...attributes, sealSerialNumber: attributes.sealSerialNumber || null,
        multiplier: Number(multiplier), multiplierExact: multiplier });
    }
    async function assertPanel(item) {
      await electricity.getByText(`Лічильник ${item.meterDesignation} · початок установки ${item.startsOn}`, { exact: true }).waitFor();
      const details = electricity.locator('dl').filter({ has: page.getByText('Ідентифікатор установки', { exact: true }) });
      const fields = await details.evaluate(panel =>
        Object.fromEntries([...panel.querySelectorAll('dt')].map(term => [term.textContent, term.nextElementSibling.textContent])));
      assert.deepEqual(fields, {
        'Модель': item.details.model,
        'Ідентифікатор установки': item.id,
        'Серійний номер лічильника': item.details.serialNumber,
        'Регістри': 'День і ніч',
        'Місце встановлення': item.details.location,
        'Дата монтажу': item.details.mountedOn,
        'Серійний номер пломби': item.details.sealSerialNumber ?? 'Не вказано',
        'Коефіцієнт показань': item.details.multiplierExact,
      });
    }

    const communitiesReply = reply('/community/register/communities');
    await page.goto(origin + '/community/');
    const selected = (await (await communitiesReply).json()).find(item => item.id === community);
    assert.ok(selected.canSetupElectricity && selected.canReplaceElectricity);
    const plotsReply = reply(base + '/plots');
    await page.locator('select').first().selectOption(community);
    const plot = (await (await plotsReply).json()).find(item => item.number === 'Plot 0');
    assert.equal(plot.installation, null);
    const setupPath = `${base}/plots/${plot.id}/installation`;
    const historyPath = `${base}/plots/${plot.id}/installations`;
    writes.add(setupPath);
    await plotPicker.selectOption(plot.id);
    await setupForm.locator('select[name="registerMode"]').selectOption('dual');
    const oldDetails = { model: 'Synthetic dual model A', serialNumber: 'METER-A', location: 'Synthetic east cabinet',
      mountedOn: '2026-01-01', sealSerialNumber: 'SEAL-A', multiplier: '40' };
    await fill(setupForm, { designation: 'Synthetic initial meter', startsOn: '2026-01-02', ...oldDetails,
      mountedOn: '2026-01-03' });
    const invalid = 'Перевірте дані та повторіть спробу.';
    await submit(setupForm, 'Зареєструвати установку', setupPath, 400, invalid);
    assert.deepEqual(await get(historyPath), []);
    await fill(setupForm, { mountedOn: oldDetails.mountedOn });
    await submit(setupForm, 'Зареєструвати установку', setupPath, 204, 'Точку обліку та установку зареєстровано.');
    writes.delete(setupPath);
    const initial = await get(historyPath);
    assert.equal(initial.length, 1);
    const [old] = initial;
    assertDetails(old, 'Synthetic initial meter', '2026-01-02', null, oldDetails);
    await assertPanel(old);

    const replacePath = id => `${base}/installations/${id}/replacement`;
    writes.add(replacePath(old.id));
    const newDetails = { model: 'Synthetic dual model B', serialNumber: 'METER-B', location: 'Synthetic west cabinet',
      mountedOn: '2026-01-03', sealSerialNumber: '', multiplier: '1' };
    const effective = '2026-01-04';
    const reason = 'Synthetic meter history';
    await fill(replaceForm, { designation: 'Synthetic successor meter', effectiveOn: effective, reason, ...newDetails,
      mountedOn: '2026-01-05' });
    await submit(replaceForm, 'Зареєструвати заміну', replacePath(old.id), 400, invalid);
    assert.deepEqual(await get(historyPath), initial);
    await fill(replaceForm, { mountedOn: newDetails.mountedOn });
    const replacement = await submit(replaceForm, 'Зареєструвати заміну', replacePath(old.id), 200,
      'Заміну лічильника зареєстровано.');
    const change = await replacement.json();
    assert.equal(change.outcome, 'Replaced');
    writes.delete(replacePath(old.id));
    const history = await get(historyPath);
    assert.equal(history.length, 2);
    const [current, previous] = history;
    assert.equal(current.id, change.installationId);
    assert.equal(current.pointId, old.pointId);
    assert.notEqual(current.id, old.id);
    assert.notEqual(current.meterId, old.meterId);
    assert.deepEqual(previous, { ...old, endsBefore: effective });
    assertDetails(current, 'Synthetic successor meter', effective, null, newDetails);
    assert.equal(current.replacement.reason, reason);
    await assertPanel(current);
    await historyPicker.selectOption(previous.id);
    await assertPanel(previous);
    await electricity.getByText(`Установку закрито з ${effective}. Кінцевого граничного показання немає.`,
      { exact: true }).waitFor();
    assert.equal(await replaceForm.count(), 0);
    await historyPicker.selectOption(current.id);
    await assertPanel(current);

    await fill(replaceForm, { designation: 'Synthetic denied meter', effectiveOn: '2026-01-06', reason, ...newDetails,
      mountedOn: '2026-01-05' });
    writes.add(replacePath(current.id));
    const input = readline.createInterface({ input: process.stdin });
    const acknowledged = new Promise(resolve => input.once('line', resolve));
    console.log('REVOKE');
    assert.equal(await acknowledged, 'REVOKED');
    input.close();
    await submit(replaceForm, 'Зареєструвати заміну', replacePath(current.id), 403, 'Дозвіл на цю дію відсутній.');
    assert.deepEqual(await get(historyPath), history);
    const refreshed = reply('/community/register/communities');
    await page.reload();
    const permissions = (await (await refreshed).json()).find(item => item.id === community);
    assert.equal(permissions.canReplaceElectricity, false);
    assert.equal(permissions.canSetupElectricity, true);
    await page.locator('select').first().selectOption(community);
    await plotPicker.selectOption(plot.id);
    await assertPanel(current);
    await historyPicker.selectOption(previous.id);
    await assertPanel(previous);
    await page.screenshot({ path: process.env.STAND_HELP_SCREENSHOT, fullPage: true });
    assert.deepEqual(errors, []);
    console.log('PASS: dual meter registration and replacement, separate attributes, date validation and retained history after revocation');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
