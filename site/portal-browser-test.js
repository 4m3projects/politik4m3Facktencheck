/*
 * Browsertest für den Seitenaufbau: Übersichtsdaten statt Volldaten, Details der Aussagen erst beim Öffnen,
 * Fokus nach Seitenwechsel, Handy-Kopfzeile und Link teilen.
 * Ausführen (Playwright und Chromium müssen vorhanden sein): node site/portal-browser-test.js
 * Baut die Seite mit scripts/build-site.js wie der Workflow. Alle Anfragen an fremde Hosts werden abgefangen.
 * Wird nicht veröffentlicht.
 */
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const B = require('../scripts/build-site.js');

const VIDEO = 'bPXMY7Reeek';

function serve(dir) {
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.md': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
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
  try { await fn(); results.push(true); console.log('ok   ' + name); }
  catch (e) { results.push(false); console.log('FAIL ' + name + '\n     ' + String(e.stack || e.message).split('\n').slice(0, 6).join('\n     ')); }
}

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'p4m3-portal-'));
  B.build(dir, { commit: 'test' });
  /* Zweiter Aufbau ohne Übersichtsdaten: So lud die Seite früher alle Videos vollständig. */
  const legacy = fs.mkdtempSync(path.join(os.tmpdir(), 'p4m3-portal-alt-'));
  fs.cpSync(dir, legacy, { recursive: true });
  fs.rmSync(path.join(legacy, 'daten', 'uebersicht.json'));
  const server = await serve(dir), legacyServer = await serve(legacy);
  const url = `http://127.0.0.1:${server.address().port}/`;
  const legacyUrl = `http://127.0.0.1:${legacyServer.address().port}/`;
  const data = JSON.parse(fs.readFileSync(path.join(dir, 'daten', VIDEO, 'strukturiert', 'aussagen.json'), 'utf8'));

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.route(u => !u.href.startsWith('http://127.0.0.1:'), r => r.abort());
  const page = await ctx.newPage();
  const errors = [], requests = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
  page.on('request', r => requests.push(r.url()));
  const open = async (base, hash) => {
    await page.goto('about:blank');
    await page.goto(base + hash);
    await page.waitForFunction(h => document.documentElement.dataset.route === h, hash, { timeout: 20000 });
  };
  const html = () => page.$eval('#inhalt', m => m.innerHTML);

  await step('Startseite lädt nur Übersichtsdaten, keine vollständigen Aussagen', async () => {
    requests.length = 0;
    await open(url, '#/');
    assert.ok(requests.some(u => u.endsWith('/daten/uebersicht.json')));
    const heavy = requests.filter(u => /\/daten\/[^/]+\/(strukturiert\/|README\.md|rhetorik\.json|01_kurz\.md)/.test(u));
    assert.deepEqual(heavy, [], 'keine Einzeldateien je Video');
    assert.ok(await page.locator('.cards a.card').count() > 0);
  });

  for (const hash of ['#/', '#/methodik', '#/rangliste', '#/rangliste/kanaele']) {
    await step(`${hash}: mit Übersichtsdaten genau wie mit Volldaten`, async () => {
      await open(url, hash);
      const fast = await html();
      await open(legacyUrl, hash);
      const slow = await html();
      assert.equal(fast, slow);
    });
  }

  await step('Videoseite: Details erst beim Öffnen aufgebaut, Inhalt vollständig', async () => {
    await open(url, '#/video/' + VIDEO);
    const pending = await page.locator('#claims details[data-claim-body="pending"]').count();
    assert.equal(pending, data.claims.length, 'alle Details zunächst leer');
    assert.equal(await page.locator('#claims .claim-body').count(), 0);
    const first = page.locator('#claims .claim').first();
    await first.locator(':scope > details > summary').click();
    await first.locator('.claim-body').waitFor();
    const body = await first.locator('.claim-body').textContent();
    assert.match(body, /Grundlage der Bewertung/);
    assert.match(body, /Fundstellen im Video/);
    assert.match(body, /Herkunft/);
    await first.locator(':scope > details > summary').click();
    await first.locator(':scope > details > summary').click();
    assert.equal(await first.locator('.claim-body').count(), 1, 'nicht doppelt eingefügt');
  });

  await step('Videoseite: Suche findet auch Text aus noch geschlossenen Details', async () => {
    await open(url, '#/video/' + VIDEO);
    const sources = Object.fromEntries(data.sources.map(s => [s.id, s]));
    const claim = data.claims.find(c => (c.sourceRefs || []).some(r => sources[r.sourceId]?.title?.length > 12));
    const title = sources[claim.sourceRefs.find(r => sources[r.sourceId]?.title?.length > 12).sourceId].title;
    const head = await page.locator('#' + claim.id + ' .claim-head').innerText();
    assert.ok(!head.toLowerCase().includes(title.toLowerCase()), 'Suchtext steht nur in den Details');
    await page.fill('#f-q', title);
    await page.waitForFunction(id => !document.getElementById(id).hidden, claim.id);
    assert.match(await page.innerText('#count'), /von/);
  });

  await step('Direktlink auf eine Aussage öffnet deren Details', async () => {
    const id = data.claims[5].id;
    await open(url, `#/video/${VIDEO}/aussage/${id}`);
    assert.equal(await page.$eval('#' + id + ' > details', d => d.open), true);
    assert.equal(await page.locator('#' + id + ' .claim-body').count(), 1);
  });

  await step('Fokus wandert nach einem Seitenwechsel auf die Hauptüberschrift', async () => {
    await open(url, '#/');
    await page.locator('.cards a.card').first().click();
    await page.waitForFunction(() => /^#\/video\//.test(document.documentElement.dataset.route || ''));
    await page.waitForFunction(() => document.activeElement?.tagName === 'H1');
    await page.click('.mainnav a[data-nav="methodik"]');
    await page.waitForFunction(() => document.documentElement.dataset.route === '#/methodik');
    assert.equal(await page.evaluate(() => document.activeElement.tagName + ':' + document.activeElement.textContent), 'H1:So prüfen wir');
    await page.click('.mainnav a[data-nav="themen"]');
    await page.waitForFunction(() => document.documentElement.dataset.route === '#/themen');
    assert.equal(await page.evaluate(() => document.activeElement.tagName), 'H1');
  });

  await step('Erster Aufruf und Filter behalten ihren Fokus', async () => {
    await open(url, '#/video/' + VIDEO);
    assert.notEqual(await page.evaluate(() => document.activeElement.tagName), 'H1', 'kein Fokussprung beim ersten Laden');
    await page.focus('#f-v');
    await page.selectOption('#f-v', 'widerlegt');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'f-v');
  });

  await step('Link teilen: Einstiegsseite mit Vorschaudaten, Knopf kopiert ihre Adresse', async () => {
    await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: url.replace(/\/$/, '') });
    await open(url, '#/video/' + VIDEO);
    await page.click(`[data-share-video="${VIDEO}"]`);
    await page.waitForFunction(() => /Link kopiert/.test(document.querySelector('.share-status')?.textContent || ''));
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    assert.equal(copied, `${url}video/${VIDEO}/`);
    const res = await page.request.get(copied);
    const text = await res.text();
    assert.match(text, /<meta property="og:title"/);
    await page.goto(copied);
    await page.waitForFunction(id => document.documentElement.dataset.route === '#/video/' + id, VIDEO, { timeout: 20000 });
  });

  await step('Handy: Kopfzeile einzeilig, Navigation wischbar, kein seitliches Verschieben', async () => {
    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await mobile.route(u => !u.href.startsWith('http://127.0.0.1:'), r => r.abort());
    const p = await mobile.newPage();
    await p.goto(url + '#/video/' + VIDEO);
    await p.waitForFunction(h => document.documentElement.dataset.route === h, '#/video/' + VIDEO);
    const m = await p.evaluate(() => {
      const nav = document.querySelector('.mainnav');
      const links = [...nav.querySelectorAll('a')].map(a => a.getBoundingClientRect().top);
      return { bar: document.querySelector('.topbar').getBoundingClientRect().height, oneRow: new Set(links.map(Math.round)).size === 1,
        overflow: document.documentElement.scrollWidth > innerWidth, scrollable: nav.scrollWidth >= nav.clientWidth };
    });
    assert.ok(m.bar <= 110, 'Kopfzeile ' + m.bar + ' px hoch');
    assert.ok(m.oneRow, 'Navigation in einer Zeile');
    assert.equal(m.overflow, false);
    await p.locator('.mainnav a[data-nav="verlauf"]').scrollIntoViewIfNeeded();
    await p.locator('.mainnav a[data-nav="verlauf"]').tap();
    await p.waitForFunction(() => document.documentElement.dataset.route === '#/verlauf');
    await mobile.close();
  });

  await step('Keine Skriptfehler und keine fehlenden Dateien', async () => {
    /* Der Vergleichsaufbau ohne Übersichtsdaten meldet für uebersicht.json absichtlich 404. */
    const port = String(legacyServer.address().port);
    assert.deepEqual(errors.filter(e => !(e.includes(':' + port + '/daten/uebersicht.json') || /^Failed to load resource/.test(e))), []);
    assert.ok(!errors.some(e => /^404 /.test(e) && !e.includes(':' + port + '/')), 'keine fehlenden Dateien im echten Aufbau');
  });

  await browser.close();
  server.close(); legacyServer.close();
  const ok = results.filter(Boolean).length;
  console.log(`\n${ok} von ${results.length} Browserprüfungen bestanden.`);
  process.exit(ok === results.length ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
