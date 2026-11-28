/*
 * Browsertest der öffentlichen Themen-Wissensdatenbank (themen.js) mit Playwright.
 * Ausführen (Playwright und Chromium müssen lokal vorhanden sein): node site/wissen-browser-test.js
 * Wird nicht veröffentlicht und nicht im Workflow ausgeführt. Externe Anfragen werden blockiert.
 * Optional: SCREENSHOTS=<Verzeichnis> speichert Bildschirmfotos.
 */
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');

/* Seite mit demselben Aufbau wie der Workflow (scripts/build-site.js), mit den ausgeblendeten Videos wie live. */
function buildSite() {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'p4m3-wissen-'));
  require('../scripts/build-site.js').build(out, { commit: 'test' });
  const wf = path.join(out, 'daten', 'wissen.json');
  // Nur im Test: ein ausgedachter umgesetzter Korrekturvorgang, um das öffentliche Protokoll zu prüfen.
  const w = JSON.parse(fs.readFileSync(wf, 'utf8'));
  w.corrections = (w.corrections || []).concat({ id: 'UG-C9999', kind: 'Fehlbewertung', date: '2026-11-19', decidedBy: 'Test', basis: 'Testvorgang.', description: 'Testkorrektur für den Browsertest.',
    evidence: [{ title: 'Testquelle', url: 'https://example.org/test', accessedOn: '2026-11-19', finding: 'Testbefund.' }],
    changes: [{ target: 'GbhI-p_ycJE-A0023', field: 'verdict', before: 'Belegt', after: 'Teilweise belegt' }], topics: ['geschlecht/selbstbestimmungsgesetz'] });
  fs.writeFileSync(wf, JSON.stringify(w));
  return out;
}

function serve(dir) {
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.md': 'text/plain; charset=utf-8' };
  const server = http.createServer((req, res) => {
    const p = path.join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/\/$/, '/index.html'));
    if (!p.startsWith(dir) || !fs.existsSync(p)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' });
    fs.createReadStream(p).pipe(res);
  });
  return new Promise(r => server.listen(0, '127.0.0.1', () => r(server)));
}

const results = [];
async function step(name, fn) {
  try { await fn(); results.push(['ok', name]); console.log('ok   ' + name); }
  catch (e) { results.push(['FAIL', name, e.message]); console.log('FAIL ' + name + '\n     ' + e.message.split('\n').join('\n     ')); }
}

(async () => {
  const dir = buildSite();
  const server = await serve(dir);
  const url = 'http://127.0.0.1:' + server.address().port + '/';
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
  // Vorschaubilder nicht aus dem Netz laden: ein graues Ersatzbild statt YouTube.
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8+v9/PQAJaAPNQ6R2HgAAAABJRU5ErkJggg==', 'base64');
  await page.route(/^https:\/\/i\.ytimg\.com\//, r => r.fulfill({ status: 200, contentType: 'image/png', body: png }));
  const shot = async name => { if (process.env.SCREENSHOTS) await page.screenshot({ path: path.join(process.env.SCREENSHOTS, name + '.png'), fullPage: true }); };

  await step('Navigation enthält „Themen“', async () => {
    await page.goto(url + '#/');
    await page.waitForSelector('.card');
    assert.equal(await page.locator('.mainnav a[data-nav="themen"]').count(), 1);
  });
  await step('Themenübersicht zeigt öffentliche Hauptthemen, interne getrennt', async () => {
    await page.goto(url + '#/themen');
    await page.waitForSelector('.topic-card');
    const names = await page.locator('.topic-card h3').allTextContents();
    for (const n of ['Geschlecht', 'Corona', 'Reaktanz']) assert.ok(names.includes(n), n + ' fehlt: ' + names.join(', '));
    assert.ok(!names.includes('Waffenrecht'), 'Waffenrecht ist nur in einem Video ausreichend behandelt');
    assert.ok((await page.locator('.topic-others').innerText()).includes('Waffenrecht'));
    for (const n of ['Klima', 'Geld']) assert.ok(!names.includes(n), n + ': ausgeblendete Videos dürfen keine Themen liefern');
    assert.equal(await page.locator('.mainnav a[aria-current="page"]').getAttribute('data-nav'), 'themen');
    await shot('themen');
  });
  await step('Suche findet Themen und Aussagen', async () => {
    await page.fill('#kb-q', 'Selbstbestimmungsgesetz Geschlechtseintrag');
    await page.waitForSelector('#kb-results li');
    const t = await page.locator('#kb-results').innerText();
    assert.match(t, /Selbstbestimmungsgesetz/);
  });
  await step('Themenseite Selbstbestimmungsgesetz: Abschnitte, Herkunft, Empfehlungsbegründung', async () => {
    await page.goto(url + '#/thema/geschlecht/selbstbestimmungsgesetz');
    await page.waitForFunction(h => document.documentElement.dataset.route === h, '#/thema/geschlecht/selbstbestimmungsgesetz');
    assert.equal(await page.locator('h1').innerText(), 'Selbstbestimmungsgesetz');
    assert.ok(await page.locator('#belegt .kb-item').count() > 0, 'belegte Tatsachen');
    assert.ok(await page.locator('#falsch .kb-item').count() > 0, 'widerlegte Behauptungen');
    const first = page.locator('.kb-origin a').first();
    assert.match(await first.getAttribute('href'), /^#\/video\/[A-Za-z0-9_-]{11}\/aussage\//);
    if (await page.locator('#empfehlungen').count()) assert.match(await page.locator('#empfehlungen').innerText(), /Warum:/);
    await shot('thema-sbgg');
  });
  await step('Themenseite: Faktenampel des ganzen Videos bei jeder Herkunft, berechnet wie auf der Videoseite', async () => {
    await page.goto(url + '#/thema/geschlecht/selbstbestimmungsgesetz');
    await page.waitForFunction(h => document.documentElement.dataset.route === h, '#/thema/geschlecht/selbstbestimmungsgesetz');
    const items = page.locator('#belegt .kb-item, #falsch .kb-item, #teilweise .kb-item, #unbelegt .kb-item').filter({ has: page.locator('.kb-origin') });
    assert.ok(await items.count() > 0);
    assert.equal(await items.locator('.occ-ampel .ampel').count(), await items.count(), 'Video-Ampel je Aussage');
    const checks = await page.locator('.kb-origin').evaluateAll(ps => ps.map(p => {
      const vid = p.querySelector('a[href^="#/video/"]').getAttribute('href').split('/')[2];
      const v = state.videos.get(vid);
      return [vid, p.nextElementSibling.querySelector('.ampel').className, FactIndex.rate(v.data, v.video).key];
    }));
    for (const [vid, cls, key] of checks) assert.match(cls, new RegExp('ampel-' + key + '\\b'), vid);
  });
  await step('Unbelegt steht nie unter „falsch“', async () => {
    for (const id of ['geschlecht', 'geschlecht/selbstbestimmungsgesetz', 'geschlecht/sport', 'corona', 'reaktanz']) {
      await page.goto(url + '#/thema/' + id);
      await page.waitForFunction(h => document.documentElement.dataset.route === h, '#/thema/' + id);
      const txt = await page.locator('#falsch').innerText().catch(() => '');
      assert.ok(!txt.includes('Nicht ausreichend belegbar'), id);
    }
  });
  await step('Wissenseinträge erscheinen mit Herkunft, verknüpfte Aussagen nicht doppelt', async () => {
    await page.goto(url + '#/thema/geschlecht');
    await page.waitForFunction(h => document.documentElement.dataset.route === h, '#/thema/geschlecht');
    const entries = page.locator('.kb-entry');
    if (!(await entries.count())) return; // Bestand ohne Einträge: nichts zu prüfen
    const txt = await page.locator('main').innerText();
    const ids = await page.locator('.kb-origin a').evaluateAll(as => as.map(a => a.getAttribute('href').split('/').pop()));
    const linked = await page.evaluate(() => state.wissen.raw.entries.flatMap(e => e.links.filter(l => l.relation === 'gleichwertig').map(l => l.claimId)));
    for (const id of linked) assert.ok(!ids.includes(id), id + ' doppelt');
    assert.match(txt, /Wissenseintrag/);
    await shot('thema-geschlecht');
  });
  await step('Videos zu Aussagen: Vorschaubild nur nach Zustimmung, Videoliste bei Wissenseinträgen', async () => {
    await page.goto(url + '#/thema/geschlecht');
    await page.waitForFunction(h => document.documentElement.dataset.route === h, '#/thema/geschlecht');
    assert.equal(await page.locator('img[src*="ytimg"]').count(), 0, 'ohne Zustimmung keine Vorschaubilder');
    assert.equal(await page.locator('.thumb-ask').count(), 1, 'Frage nach Vorschaubildern');
    await page.click('[data-thumbs="ja"]');
    await page.waitForSelector('.kb-origin img.origin-thumb');
    const occ = page.locator('.kb-entry .kb-occ').first();
    if (await occ.count()) {
      await occ.locator('summary').click();
      const hrefs = await occ.locator('.occ-item a[href^="#/video/"]').evaluateAll(as => as.map(a => a.getAttribute('href')));
      assert.ok(hrefs.length && hrefs.every(h => /\/aussage\//.test(h)), hrefs.join(', '));
      assert.equal(await occ.locator('.occ-item .occ-ampel .ampel').count(), await occ.locator('.occ-item').count(), 'Video-Ampel je Eintrag');
    }
    await page.evaluate(() => { localStorage.removeItem('p4m3.ytVorschaubilder'); state.thumbChoice = null; });
  });
  await step('Korrekturprotokoll: Übersicht und betroffene Themenseite, nicht auf fremden Themen', async () => {
    await page.goto(url + '#/themen');
    await page.waitForSelector('#korrekturen');
    const t = await page.locator('#korrekturen').innerText();
    assert.match(t, /UG-C9999/);
    assert.match(t, /Belegt\s*→\s*Teilweise belegt/);
    /* Die Testkorrektur verlinkt die betroffene Aussage (echte Korrekturvorgänge stehen ebenfalls in der Liste). */
    const hrefs = await page.locator('#korrekturen .kb-changes a').evaluateAll(a => a.map(x => x.getAttribute('href')));
    assert.ok(hrefs.includes('#/video/GbhI-p_ycJE/aussage/GbhI-p_ycJE-A0023'), hrefs.join(', '));
    for (const [id, expect] of [['geschlecht', true], ['geschlecht/selbstbestimmungsgesetz', true], ['corona', false]]) {
      await page.goto(url + '#/thema/' + id);
      await page.waitForFunction(h => document.documentElement.dataset.route === h, '#/thema/' + id);
      assert.equal(await page.locator('#korrekturen').count(), expect ? 1 : 0, id);
    }
  });
  await step('Internes Thema ist erreichbar und gekennzeichnet', async () => {
    await page.goto(url + '#/thema/waffenrecht');
    await page.waitForFunction(h => document.documentElement.dataset.route === h, '#/thema/waffenrecht');
    assert.match(await page.locator('.video-head').innerText(), /noch keine eigene Kategorie/);
  });
  await step('Videoseite zeigt Themen-Chips', async () => {
    await page.goto(url + '#/video/bPXMY7Reeek');
    await page.waitForSelector('.topic-line');
    const t = await page.locator('.topic-line').innerText();
    assert.match(t, /Geschlecht/);
    await page.locator('.topic-line a', { hasText: 'Geschlecht' }).click();
    await page.waitForSelector('h1:text("Geschlecht")');
  });
  await step('Unbekanntes Thema: Hinweis statt Absturz', async () => {
    await page.goto(url + '#/thema/gibt-es-nicht');
    await page.waitForSelector('.notice.warn');
  });
  await step('Schmale Ansicht ohne waagrechtes Scrollen', async () => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(url + '#/thema/geschlecht');
    await page.waitForFunction(h => document.documentElement.dataset.route === h, '#/thema/geschlecht');
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(over <= 1, 'Überbreite ' + over);
    await shot('thema-geschlecht-mobil');
  });
  await step('Gegendarstellung: kritische Aussage zeigt belegte Gegenaussage aus der Reaktion mit Zeitmarke', async () => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(url + '#/video/bPXMY7Reeek/aussage/bPXMY7Reeek-A0083');
    await page.waitForSelector('.claim');
    const box = page.locator('[id="bPXMY7Reeek-A0083"] .counter');
    assert.equal(await box.count(), 1);
    assert.match(await box.innerText(), /Gegendarstellung/);
    assert.ok(await box.locator('a[href*="/aussage/GbhI-p_ycJE-A0035"]').count() > 0);
    assert.ok(await box.locator('.ampel').count() > 0, 'Ampel des Gegenvideos fehlt');
    await shot('gegendarstellung');
  });
  await step('Gegendarstellung: belegte Aussagen bekommen keine', async () => {
    const ids = await page.evaluate(() => [...document.querySelectorAll('.claim')].filter(el => el.querySelector('.counter')).map(el => el.id));
    assert.deepEqual(ids.sort(), ['bPXMY7Reeek-A0076', 'bPXMY7Reeek-A0078', 'bPXMY7Reeek-A0083']);
  });
  await step('Gegendarstellung erscheint auch neben dem laufenden Video', async () => {
    await page.goto(url + '#/video/bPXMY7Reeek/video');
    await page.waitForSelector('.vc-item');
    assert.ok(await page.locator('.vc-item .counter-compact').count() >= 3);
  });
  await step('Keine Skriptfehler', async () => { assert.deepEqual(errors, []); });

  await browser.close();
  server.close();
  fs.rmSync(dir, { recursive: true, force: true });
  const failed = results.filter(r => r[0] !== 'ok');
  console.log(`\n${results.length - failed.length}/${results.length} bestanden`);
  process.exitCode = failed.length ? 1 : 0;
})();
