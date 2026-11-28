#!/usr/bin/env node
/*
 * Baut die statische Webseite (GitHub Pages) aus site/ und den Faktencheck-Daten. Nur Node.js, keine Fremdbibliotheken.
 * Einzige Stelle, an der festgelegt ist, was veröffentlicht wird: Der Workflow (.github/workflows/pages.yml) und die
 * Browsertests (site/*-browser-test.js) nutzen dieselben Funktionen, damit Test und Live-Seite nicht auseinanderlaufen.
 *
 *   node scripts/build-site.js <Zielordner>     Seite bauen (Commit/Repository aus GITHUB_SHA/GITHUB_REPOSITORY)
 *
 * Veröffentlicht werden ausschließlich (siehe docs/WEBSEITE.md):
 * - alle Seitendateien aus site/ außer *-test.js und *-fixtures.js; Skripte und Stile mit Versionsparameter je Commit,
 * - je sichtbarem Video die eigenen Markdown-Berichte, strukturiert/aussagen.json und statistik.json, video.json und
 *   rhetorik.json (JSON kompakt), dazu faktenchecks/beziehungen.json,
 * - daten/index.json (Videoliste), daten/uebersicht.json (kompakte Übersichtsdaten für Startseite, Methodik und Rangliste),
 * - daten/wissen.json (scripts/wissen.js export) und daten/verlauf.json (scripts/verlauf.js export),
 * - je Video eine kleine Einstiegsseite video/<ID>/index.html mit Vorschaudaten für geteilte Links.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SITE = path.join(ROOT, 'site');
const FC = path.join(ROOT, 'faktenchecks');
const FactIndex = require(path.join(SITE, 'faktenindex.js'));

/* Ausgeblendete Videos: Faktenchecks zu Interviews der Reihe „{ungeskriptet} by Ben“ stehen auf der Schwesterseite
   politik4m3FaktencheckUngeskriptet. Ihre Daten bleiben im Repository, erscheinen hier aber nicht auf der Webseite.
   Begründung und Rückweg: docs/WEBSEITE.md, Abschnitt „Ausgeblendete Videos“. */
const AUSGEBLENDET = ['mdo14671BPE', 'mlxFA9T88I0'];
const PUBLIC_URL = 'https://4m3projects.github.io/politik4m3Facktencheck/';
const SITE_NAME = 'Politik4M3 Faktencheck';
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

function fail(msg) { throw new Error(msg); }
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function writeJson(file, data) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(data)); }
function htmlEsc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

/* Alle Seitendateien kopieren (ohne Tests und Testdaten). Jede lokale Skript- und Stildatei in index.html bekommt
   ?v=<version>, damit Browser und Pages-Cache nach einem Deploy keine alten und neuen Dateien mischen. Bricht ab, wenn
   index.html eine Datei einbindet, die es nicht gibt, oder ein Skript in site/ nirgends eingebunden ist. */
function siteFiles(src = SITE) {
  return fs.readdirSync(src).filter(f => fs.statSync(path.join(src, f)).isFile() && !/-(test|fixtures)\.js$/.test(f)).sort();
}
function copySiteFiles(out, version, src = SITE) {
  fs.mkdirSync(out, { recursive: true });
  const files = siteFiles(src);
  for (const f of files) fs.copyFileSync(path.join(src, f), path.join(out, f));
  let html = fs.readFileSync(path.join(src, 'index.html'), 'utf8');
  const used = new Set();
  html = html.replace(/(<script\b[^>]*\ssrc|<link\b[^>]*\shref)="([^"?#:]+\.(?:js|css))"/g, (all, attr, file) => {
    if (!files.includes(file)) fail(`index.html bindet ${file} ein, die Datei fehlt in site/`);
    used.add(file);
    return `${attr}="${file}?v=${encodeURIComponent(version)}"`;
  });
  const unused = files.filter(f => /\.(js|css)$/.test(f) && !used.has(f));
  if (unused.length) fail(`In site/ liegen nicht eingebundene Dateien: ${unused.join(', ')} (in index.html einbinden oder als *-test.js benennen)`);
  fs.writeFileSync(path.join(out, 'index.html'), html);
  return files;
}

function walkMd(dir, rel = '') {
  const out = [];
  for (const e of fs.readdirSync(path.join(dir, rel), { withFileTypes: true })) {
    const r = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) out.push(...walkMd(dir, r));
    else if (e.isFile() && e.name.endsWith('.md')) out.push(r);
  }
  return out;
}

/* Daten je sichtbarem Video kopieren und daten/index.json schreiben. */
function copyVideoData(out, { commit, repository, generated, hidden = AUSGEBLENDET, requireTopics = true } = {}) {
  const daten = path.join(out, 'daten');
  fs.mkdirSync(daten, { recursive: true });
  const rel = path.join(FC, 'beziehungen.json');
  writeJson(path.join(daten, 'beziehungen.json'), fs.existsSync(rel) ? readJson(rel) : { schemaVersion: 1, relations: [] });
  const videos = [];
  for (const id of fs.readdirSync(FC).filter(x => VIDEO_ID.test(x)).sort()) {
    const dir = path.join(FC, id);
    if (!fs.statSync(dir).isDirectory() || !fs.existsSync(path.join(dir, 'README.md'))) continue;
    if (hidden.includes(id)) { console.log('Ausgeblendet: ' + id); continue; }
    const hasClaims = fs.existsSync(path.join(dir, 'strukturiert', 'aussagen.json'));
    /* Jedes sichtbare Video mit strukturierten Aussagen braucht eine Themenzuordnung (AGENTS.md, „Themen bei jedem Video
       prüfen“). Eine leere Zuordnung ist erlaubt, wenn sie in „basis“ begründet ist. */
    if (requireTopics && hasClaims && !fs.existsSync(path.join(dir, 'themen.json'))) {
      fail(`Video ${id} hat keine themen.json. Themen zuordnen (docs/AGENTEN_WISSEN.md, Abschnitt 3).`);
    }
    const files = walkMd(dir).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    for (const f of files) {
      fs.mkdirSync(path.dirname(path.join(daten, id, f)), { recursive: true });
      fs.copyFileSync(path.join(dir, f), path.join(daten, id, f));
    }
    if (hasClaims) {
      writeJson(path.join(daten, id, 'strukturiert', 'aussagen.json'), readJson(path.join(dir, 'strukturiert', 'aussagen.json')));
      const st = path.join(dir, 'strukturiert', 'statistik.json');
      if (fs.existsSync(st)) writeJson(path.join(daten, id, 'strukturiert', 'statistik.json'), readJson(st));
    }
    const rp = path.join(dir, 'rhetorik.json');
    if (fs.existsSync(rp)) writeJson(path.join(daten, id, 'rhetorik.json'), readJson(rp));
    const vp = path.join(dir, 'video.json');
    const title = (/^# (.+)$/m.exec(fs.readFileSync(path.join(dir, 'README.md'), 'utf8')) || [])[1] || id;
    videos.push({ id, title, structured: hasClaims, rhetoric: fs.existsSync(rp), files, video: fs.existsSync(vp) ? readJson(vp) : null });
  }
  writeJson(path.join(daten, 'index.json'), { generated, commit, repository, videos });
  return videos;
}

/* Kompakte Übersichtsdaten: Startseite, Methodik-Übersicht und Rangliste brauchen von jedem Video nur den Kopf der README
   (Metadaten bis zur ersten Zwischenüberschrift plus Statuszeile), Umfang, Quellenzahl, Darstellungshinweise und je Aussage
   die Felder, aus denen Faktenindex, Ampel und Verteilung berechnet werden. Die vollständigen Daten lädt die Seite erst
   beim Öffnen eines Videos. Gelesen wird aus dem gebauten daten/-Ordner, damit Tests mit eigenen Daten dasselbe bekommen. */
const OVERVIEW_CLAIM_FIELDS = ['id', 'videoId', 'chapter', 'kind', 'status', 'verdict', 'attribution', 'factIndex', 'relations'];
const OVERVIEW_OCC_FIELDS = ['role', 'roleStatus'];
function pick(o, keys) {
  const r = {};
  for (const k of keys) if (o && o[k] !== undefined) r[k] = o[k];
  return r;
}
function readmeHead(md) {
  const lines = md.split('\n');
  const end = lines.findIndex(l => /^##\s/.test(l));
  const head = (end < 0 ? lines : lines.slice(0, end)).join('\n');
  const status = /\*\*Status:\s*([^*]+)\*\*/.exec(md);
  /* readmeMeta (site/app.js) liest den Status aus der ganzen README; steht er erst später, wird er angehängt. */
  return status && !/\*\*Status:\s*([^*]+)\*\*/.test(head) ? head + '\n' + status[0] : head;
}
function overviewOf(daten, entry) {
  const dir = path.join(daten, entry.id);
  const readme = fs.existsSync(path.join(dir, 'README.md')) ? fs.readFileSync(path.join(dir, 'README.md'), 'utf8') : '';
  const ap = path.join(dir, 'strukturiert', 'aussagen.json');
  let data = null;
  if (entry.structured && fs.existsSync(ap)) {
    const full = readJson(ap);
    data = {
      schemaVersion: full.schemaVersion,
      scope: full.scope,
      sources: (full.sources || []).map(s => ({ id: s.id })),
      claims: (full.claims || []).map(c => ({
        ...pick(c, OVERVIEW_CLAIM_FIELDS),
        ...(Array.isArray(c.occurrences) ? { occurrences: c.occurrences.map(o => pick(o, OVERVIEW_OCC_FIELDS)) } : {})
      }))
    };
  }
  const rp = path.join(dir, 'rhetorik.json');
  return { id: entry.id, readmeHead: readmeHead(readme), data, rhet: entry.rhetoric && fs.existsSync(rp) ? readJson(rp) : null };
}
function writeOverview(out) {
  const daten = path.join(out, 'daten');
  const index = readJson(path.join(daten, 'index.json'));
  const videos = index.videos.map(e => overviewOf(daten, e));
  writeJson(path.join(daten, 'uebersicht.json'), { commit: index.commit, videos });
  return videos;
}

/* Einstiegsseiten für geteilte Links. Die Webseite navigiert mit #-Adressen; Messenger und Suchmaschinen lesen den Teil
   nach # nicht und zeigen sonst für jedes Video nur die Startseite. video/<ID>/ enthält Titel, Beschreibung und
   Open-Graph-Angaben und leitet ohne Skript sofort zur Videoseite weiter. Kein Vorschaubild von YouTube: Als Bild dient
   das eigene Seitensymbol. */
function readmeMetaOf(md) {
  const meta = {};
  for (const line of md.split('\n')) {
    if (/^##\s/.test(line)) break;
    const m = /^-\s+([^:]{2,60}):\s+(.+)$/.exec(line.trim());
    if (m) meta[m[1].trim()] = m[2].trim();
  }
  return meta;
}
function plain(s) { return String(s || '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*/g, '').replace(/`/g, '').replace(/\s+/g, ' ').trim(); }
function clip(s, n) { return s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + ' …'; }
function shareDescription(entry, ov) {
  const meta = readmeMetaOf(ov.readmeHead || '');
  const parts = [];
  if (ov.data) {
    const r = FactIndex.rate(ov.data, entry.video || null);
    const n = ov.data.claims.length;
    if (r.index != null) parts.push(`Faktenindex ${FactIndex.format(r.indexRounded)}${r.reliable ? ' · Ampel ' + r.name : ' (vorläufig)'}.`);
    const done = ov.data.claims.filter(c => c.status === 'Abgeschlossen').length;
    parts.push(`${n} erfasste Aussage${n === 1 ? '' : 'n'}, ${done} davon abgeschlossen.`);
  }
  const intro = plain(meta['Kurzüberblick']);
  if (intro) parts.push(intro);
  else parts.push('Unabhängiger, quellengestützter Faktencheck mit Zeitmarken zum Original.');
  return clip(parts.join(' '), 300);
}
function sharePage(entry, ov) {
  const title = `${entry.video?.title || entry.title} – ${SITE_NAME}`;
  const desc = shareDescription(entry, ov);
  const url = `${PUBLIC_URL}video/${entry.id}/`;
  const target = `../../#/video/${entry.id}`;
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>${htmlEsc(title)}</title>
<meta name="description" content="${htmlEsc(desc)}">
<link rel="canonical" href="${htmlEsc(url)}">
<meta property="og:type" content="article">
<meta property="og:locale" content="de_DE">
<meta property="og:site_name" content="${htmlEsc(SITE_NAME)}">
<meta property="og:title" content="${htmlEsc(title)}">
<meta property="og:description" content="${htmlEsc(desc)}">
<meta property="og:url" content="${htmlEsc(url)}">
<meta property="og:image" content="${PUBLIC_URL}apple-touch-icon.png">
<meta name="twitter:card" content="summary">
<meta http-equiv="refresh" content="0; url=${htmlEsc(target)}">
<link rel="icon" href="../../favicon.svg" type="image/svg+xml">
</head>
<body style="font-family:system-ui,sans-serif;max-width:40rem;margin:2rem auto;padding:0 16px;line-height:1.5">
<h1 style="font-size:1.3rem">${htmlEsc(entry.video?.title || entry.title)}</h1>
<p>${htmlEsc(desc)}</p>
<p><a href="${htmlEsc(target)}">Zum Faktencheck</a></p>
</body>
</html>
`;
}
function writeSharePages(out) {
  const daten = path.join(out, 'daten');
  const index = readJson(path.join(daten, 'index.json'));
  const ov = new Map(readJson(path.join(daten, 'uebersicht.json')).videos.map(v => [v.id, v]));
  for (const e of index.videos) {
    const file = path.join(out, 'video', e.id, 'index.html');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, sharePage(e, ov.get(e.id) || { readmeHead: '', data: null }));
  }
}

/* Ausgeblendete Videos dürfen nirgends auf der Seite auftauchen. */
function checkHidden(out, hidden = AUSGEBLENDET) {
  const daten = path.join(out, 'daten');
  const index = readJson(path.join(daten, 'index.json'));
  const rel = readJson(path.join(daten, 'beziehungen.json'));
  const w = fs.existsSync(path.join(daten, 'wissen.json')) ? readJson(path.join(daten, 'wissen.json')) : { videos: [] };
  for (const id of hidden) {
    if (fs.existsSync(path.join(daten, id))) fail(`Ausgeblendetes Video ${id}: Daten wurden veröffentlicht`);
    if (fs.existsSync(path.join(out, 'video', id))) fail(`Ausgeblendetes Video ${id}: Einstiegsseite wurde veröffentlicht`);
    if (index.videos.some(v => v.id === id)) fail(`Ausgeblendetes Video ${id} steht in index.json`);
    if ((rel.relations || []).some(r => r.reactionVideoId === id || r.originalVideoId === id)) fail(`Ausgeblendetes Video ${id} steht in beziehungen.json`);
    if ((w.videos || []).some(v => v.id === id)) fail(`Ausgeblendetes Video ${id} steht in wissen.json`);
  }
}

function build(out, opts = {}) {
  const commit = opts.commit || process.env.GITHUB_SHA || 'lokal';
  const repository = opts.repository || process.env.GITHUB_REPOSITORY || '4m3projects/politik4m3Facktencheck';
  const generated = opts.generated || new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  fs.rmSync(out, { recursive: true, force: true });
  copySiteFiles(out, commit.slice(0, 12));
  const videos = copyVideoData(out, { commit, repository, generated, hidden: opts.hidden, requireTopics: opts.requireTopics });
  for (const tool of ['wissen', 'verlauf']) {
    execFileSync(process.execPath, [path.join(__dirname, tool + '.js'), 'export', path.join(out, 'daten', tool + '.json')], { stdio: ['ignore', 'ignore', 'inherit'] });
  }
  writeOverview(out);
  writeSharePages(out);
  checkHidden(out, opts.hidden);
  return videos;
}

/* Für Tests mit eigenen Daten: nach Änderungen an daten/index.json bzw. daten/<ID>/ Übersicht und Einstiegsseiten neu schreiben. */
function refresh(out) {
  writeOverview(out);
  writeSharePages(out);
}

module.exports = { AUSGEBLENDET, refresh, siteFiles, copySiteFiles, copyVideoData, writeOverview, writeSharePages, checkHidden, build, readmeHead, OVERVIEW_CLAIM_FIELDS };

if (require.main === module) {
  const out = process.argv[2];
  if (!out) { console.error('Aufruf: node scripts/build-site.js <Zielordner>'); process.exit(2); }
  try {
    const videos = build(path.resolve(out));
    console.log(`Videos: ${videos.length}`);
  } catch (e) {
    console.log(`::error::${e.message}`);
    process.exit(1);
  }
}
