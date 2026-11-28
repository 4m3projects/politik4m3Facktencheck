/*
 * Tests für den Seitenaufbau (scripts/build-site.js): veröffentlichte Dateien, Versionsparameter, ausgeblendete Videos,
 * kompakte Übersichtsdaten und Einstiegsseiten für geteilte Links. Ausführen: node --test site/build-site-test.js
 * Wird nicht veröffentlicht.
 */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const B = require('../scripts/build-site.js');
const FactIndex = require('./faktenindex.js');
const FactRhetoric = require('./rhetoric.js');
const FactRelations = require('./relations.js');

const OUT = fs.mkdtempSync(path.join(os.tmpdir(), 'p4m3-build-'));
const videos = B.build(OUT, { commit: '0123456789abcdef', generated: '2026-11-28T00:00:00Z' });
const read = f => fs.readFileSync(path.join(OUT, f), 'utf8');
const json = f => JSON.parse(read(f));

/* readmeMeta aus site/app.js unverändert übernehmen, damit der Test genau die Funktion der Seite prüft. */
function appFunction(name) {
  const src = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
  const start = src.indexOf(`function ${name}(`);
  assert.ok(start >= 0, name + ' fehlt in app.js');
  let depth = 0, i = src.indexOf('{', start);
  for (; i < src.length; i++) { if (src[i] === '{') depth++; else if (src[i] === '}' && --depth === 0) break; }
  return vm.runInNewContext(`(${src.slice(start, i + 1)})`);
}
const readmeMeta = appFunction('readmeMeta');

test('Veröffentlicht alle Seitendateien außer Tests und Testdaten', () => {
  for (const f of fs.readdirSync(__dirname)) {
    const published = fs.existsSync(path.join(OUT, f));
    if (/-(test|fixtures)\.js$/.test(f)) assert.equal(published, false, f + ' darf nicht veröffentlicht werden');
    else assert.equal(published, true, f + ' fehlt');
  }
});

test('Jede lokale Skript- und Stildatei in index.html trägt den Versionsparameter', () => {
  const html = read('index.html');
  const refs = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css)(?:\?[^"]*)?)"/g)].map(m => m[1]).filter(u => !/^https?:/.test(u));
  assert.ok(refs.length >= 12);
  for (const r of refs) assert.match(r, /\?v=0123456789ab$/, r);
  for (const f of fs.readdirSync(__dirname).filter(f => /\.js$/.test(f) && !/-(test|fixtures)\.js$/.test(f))) {
    assert.ok(refs.includes(`${f}?v=0123456789ab`), f + ' ist nicht eingebunden');
  }
});

test('Ausgeblendete Videos erscheinen nirgends', () => {
  for (const id of B.AUSGEBLENDET) {
    assert.equal(fs.existsSync(path.join(OUT, 'daten', id)), false);
    assert.equal(fs.existsSync(path.join(OUT, 'video', id)), false);
    assert.ok(!json('daten/index.json').videos.some(v => v.id === id));
    assert.ok(!json('daten/uebersicht.json').videos.some(v => v.id === id));
  }
  assert.doesNotThrow(() => B.checkHidden(OUT));
});

test('index.json: Commit, Repository und je Video Titel, Dateien und Metadaten', () => {
  const index = json('daten/index.json');
  assert.equal(index.commit, '0123456789abcdef');
  assert.equal(index.repository, process.env.GITHUB_REPOSITORY || '4m3projects/politik4m3Facktencheck');
  assert.equal(index.videos.length, videos.length);
  for (const v of index.videos) {
    assert.ok(v.files.includes('README.md'), v.id);
    for (const f of v.files) assert.ok(fs.existsSync(path.join(OUT, 'daten', v.id, f)), v.id + '/' + f);
    assert.equal(v.structured, fs.existsSync(path.join(OUT, 'daten', v.id, 'strukturiert', 'aussagen.json')));
    assert.equal(v.rhetoric, fs.existsSync(path.join(OUT, 'daten', v.id, 'rhetorik.json')));
  }
});

/* Kernprüfung der Übersichtsdaten: Alles, was Startseite, Methodik und Rangliste daraus berechnen, ist identisch mit
   der Berechnung aus den vollständigen Daten. */
test('Übersichtsdaten ergeben dieselben Kennzahlen wie die vollständigen Daten', () => {
  const index = json('daten/index.json');
  const ov = new Map(json('daten/uebersicht.json').videos.map(v => [v.id, v]));
  assert.equal(json('daten/uebersicht.json').commit, index.commit);
  for (const e of index.videos) {
    const o = ov.get(e.id);
    assert.ok(o, e.id);
    const readme = read(`daten/${e.id}/README.md`);
    assert.deepEqual(readmeMeta(o.readmeHead), readmeMeta(readme), e.id + ': README-Metadaten');
    const full = e.structured ? json(`daten/${e.id}/strukturiert/aussagen.json`) : null;
    const rhet = e.rhetoric ? json(`daten/${e.id}/rhetorik.json`) : null;
    assert.deepEqual(o.rhet, rhet, e.id + ': Darstellungshinweise');
    if (!full) { assert.equal(o.data, null); continue; }
    assert.deepEqual(o.data.scope, full.scope, e.id + ': Umfang');
    assert.equal(o.data.sources.length, full.sources.length, e.id + ': Quellenzahl');
    assert.equal(o.data.claims.length, full.claims.length);
    const strip = r => JSON.parse(JSON.stringify(r));
    assert.deepEqual(strip(FactIndex.rate(o.data, e.video)), strip(FactIndex.rate(full, e.video)), e.id + ': Faktenindex/Ampel');
    for (let i = 0; i < full.claims.length; i++) {
      const a = full.claims[i], b = o.data.claims[i];
      for (const k of ['id', 'chapter', 'kind', 'status', 'verdict']) assert.deepEqual(b[k], a[k], `${a.id}.${k}`);
      assert.equal(FactIndex.classify(b), FactIndex.classify(a), a.id + ': Klasse');
    }
    assert.equal(FactRhetoric.overallReviewComplete(o.data, e.video, o.rhet), FactRhetoric.overallReviewComplete(full, e.video, rhet), e.id);
    const meta = readmeMeta(readme);
    const other = index.videos[0];
    assert.equal(
      FactRelations.compareVideoRecency({ id: e.id, meta: readmeMeta(o.readmeHead), data: o.data }, { id: other.id, meta: {}, data: null }),
      FactRelations.compareVideoRecency({ id: e.id, meta, data: full }, { id: other.id, meta: {}, data: null }), e.id + ': Reihenfolge');
  }
});

test('Übersichtsdaten sind deutlich kleiner als die vollständigen Daten', () => {
  const full = json('daten/index.json').videos.filter(v => v.structured)
    .reduce((n, v) => n + fs.statSync(path.join(OUT, 'daten', v.id, 'strukturiert', 'aussagen.json')).size, 0);
  const small = fs.statSync(path.join(OUT, 'daten', 'uebersicht.json')).size;
  assert.ok(small * 3 < full, `${small} Bytes Übersicht gegenüber ${full} Bytes Volldaten`);
});

test('Einstiegsseite je Video: Vorschaudaten, Weiterleitung ohne Skript, sauber maskiert', () => {
  for (const v of json('daten/index.json').videos) {
    const html = read(`video/${v.id}/index.html`);
    assert.match(html, /<meta property="og:title" content="[^"]+">/);
    assert.match(html, /<meta property="og:description" content="[^"]+">/);
    assert.match(html, new RegExp(`<meta property="og:url" content="https://4m3projects\\.github\\.io/politik4m3Facktencheck/video/${v.id}/">`));
    assert.match(html, new RegExp(`<meta http-equiv="refresh" content="0; url=\\.\\./\\.\\./#/video/${v.id}">`));
    assert.doesNotMatch(html, /<script/i, 'keine Skripte');
    assert.doesNotMatch(html, /ytimg|youtube/i, 'nichts von YouTube');
    const title = /<title>([^<]*)<\/title>/.exec(html)[1];
    assert.doesNotMatch(title, /[<>"]/);
  }
});

test('Aufbau bricht ab, wenn index.html eine fehlende Datei einbindet oder ein Skript nicht eingebunden ist', () => {
  const copy = () => {
    const src = fs.mkdtempSync(path.join(os.tmpdir(), 'p4m3-src-'));
    for (const f of B.siteFiles()) fs.copyFileSync(path.join(__dirname, f), path.join(src, f));
    return src;
  };
  const ok = copy();
  assert.doesNotThrow(() => B.copySiteFiles(fs.mkdtempSync(path.join(os.tmpdir(), 'p4m3-o-')), 'x', ok));
  const missing = copy();
  fs.rmSync(path.join(missing, 'themen.js'));
  assert.throws(() => B.copySiteFiles(fs.mkdtempSync(path.join(os.tmpdir(), 'p4m3-o-')), 'x', missing), /themen\.js/);
  const extra = copy();
  fs.writeFileSync(path.join(extra, 'neu.js'), '// nicht eingebunden');
  assert.throws(() => B.copySiteFiles(fs.mkdtempSync(path.join(os.tmpdir(), 'p4m3-o-')), 'x', extra), /neu\.js/);
});
