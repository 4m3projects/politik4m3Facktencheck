/*
 * Tests der Zeitsynchronisierung (site/sync.js). Ausführen: node --test site/sync-test.js
 * Wird nicht auf der Webseite veröffentlicht. Nutzt nur Node-Bordmittel.
 */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const S = require('./sync.js');

const occ = (id, start, end, precision = 'Ungefähr') => ({ id, startSeconds: start, endSeconds: end, precision });
const claim = (id, ...occurrences) => ({ id, occurrences });

/* Nachbildung typischer Fälle aus aussagen.json: Überlappung, Wiederholung, Punktmarke. */
const CLAIMS = [
  claim('A', occ('O1', 0, 2)),
  claim('B', occ('O2', 1, 5)),                       // überlappt mit A
  claim('C', occ('O3', 100, 110), occ('O4', 30, 36)), // Wiederholung, Reihenfolge in den Daten nicht chronologisch
  claim('D', occ('O5', 60, 60, 'Kontrolliert'))       // Punktmarke, genau
];

test('Zeitleiste: jede Fundstelle ein Eintrag, chronologisch sortiert', () => {
  const tl = S.buildTimeline(CLAIMS);
  assert.deepEqual(tl.entries.map(e => e.key), ['O1', 'O2', 'O4', 'O5', 'O3']);
  const rep = tl.entries.filter(e => e.claimId === 'C');
  assert.deepEqual(rep.map(e => [e.index, e.count]), [[2, 2], [1, 2]]);
  assert.equal(tl.untimed.length, 0);
});

test('Zeitleiste: Zeiten werden nicht verändert oder erfunden', () => {
  const tl = S.buildTimeline(CLAIMS);
  const o4 = tl.entries.find(e => e.key === 'O4');
  assert.equal(o4.start, 30); assert.equal(o4.end, 36); assert.equal(o4.precision, 'Ungefähr');
});

test('Ungültige oder unklare Zeitmarken werden sichtbar markiert', () => {
  const tl = S.buildTimeline([
    claim('X', occ('N1', null, 10), occ('N2', 'abc', 10), occ('N3', -5, 3)),
    claim('Y', occ('E1', 50, null), occ('E2', 80, 70), occ('E3', 9999, 10000), occ('E4', 5, 6, 'Irgendwas'))
  ], { durationSeconds: 1000 });
  assert.deepEqual(tl.untimed.map(e => e.key), ['N1', 'N2', 'N3']);
  tl.untimed.forEach(e => assert.deepEqual(e.issues, ['ohne-zeitmarke']));
  const by = Object.fromEntries(tl.entries.map(e => [e.key, e]));
  assert.deepEqual(by.E1.issues, ['ohne-ende']); assert.equal(by.E1.end, 50);
  assert.deepEqual(by.E2.issues, ['ende-vor-start']); assert.equal(by.E2.end, 80);
  assert.deepEqual(by.E3.issues, ['ausserhalb-laufzeit']);
  assert.deepEqual(by.E4.issues, ['unbekannte-praezision']); assert.equal(by.E4.tolerance, 5);
  for (const k of Object.keys(S.ISSUE_TEXT)) assert.ok(S.ISSUE_TEXT[k].length > 10);
});

test('Synchronisation: genaue Treffer innerhalb des Bereichs', () => {
  const tl = S.buildTimeline(CLAIMS);
  const at = t => S.matchAt(tl, t).filter(m => m.match === 'genau').map(m => m.entry.key);
  assert.deepEqual(at(0), ['O1']);
  assert.deepEqual(at(1.5), ['O1', 'O2']); // Überlappung: beide gleichzeitig
  assert.deepEqual(at(2), ['O2']);         // Ende exklusiv
  assert.deepEqual(at(33), ['O4']);
  assert.deepEqual(at(60.5), ['O5']);      // Punktmarke gilt eine Sekunde
  assert.deepEqual(at(105), ['O3']);       // zweites Vorkommen derselben Aussage
});

test('Ungenaue Zeitmarken: Toleranzbereich nur als „nahe“, je nach Präzision', () => {
  const tl = S.buildTimeline(CLAIMS);
  const m = t => S.matchAt(tl, t).map(x => x.entry.key + ':' + x.match);
  assert.deepEqual(m(26), ['O4:nahe']);   // 4 s vor ungefährem Beginn
  assert.deepEqual(m(24.9), []);          // außerhalb ±5 s
  assert.deepEqual(m(40.5), ['O4:nahe']); // kurz nach Ende
  assert.deepEqual(m(41), []);
  assert.deepEqual(m(59.2), ['O5:nahe']); // kontrolliert: nur ±1 s
  assert.deepEqual(m(58.9), []);
  assert.deepEqual(m(6), ['O1:nahe', 'O2:nahe']);
  // genaue Treffer stehen vor nahen
  assert.deepEqual(m(3), ['O2:genau', 'O1:nahe']);
});

test('Keine Zuordnung: leere Liste und nächste Fundstelle', () => {
  const tl = S.buildTimeline(CLAIMS);
  assert.deepEqual(S.matchAt(tl, 80), []);
  assert.equal(S.nextAfter(tl, 80).key, 'O3');
  assert.equal(S.nextAfter(tl, 200), null);
  assert.deepEqual(S.matchAt(tl, NaN), []);
  assert.deepEqual(S.matchAt(tl, -1), []);
});

/* Gesteuerte Uhr und Timer für den Controller. */
function harness(claims = CLAIMS) {
  const tl = S.buildTimeline(claims);
  const env = { t: 0, now: 0, rate: 1, timers: new Map(), nextId: 1, updates: [] };
  const ctl = new S.SyncController(tl, {
    getTime: () => env.t,
    getRate: () => env.rate,
    now: () => env.now,
    setInterval: (f, ms) => { const id = env.nextId++; env.timers.set(id, { f, ms }); return id; },
    clearInterval: id => env.timers.delete(id),
    onUpdate: i => env.updates.push(i)
  });
  env.advance = (ms, playing = true) => {
    // simuliert verstrichene Zeit und lässt den aktiven Timer feuern
    env.now += ms; if (playing) env.t += ms / 1000 * env.rate;
    for (const { f } of env.timers.values()) f();
  };
  env.last = () => env.updates[env.updates.length - 1];
  env.interval = () => [...env.timers.values()].map(x => x.ms);
  return { ctl, env };
}

test('Wiedergabe: fortlaufende Aktualisierung, Änderung nur beim Wechsel', () => {
  const { ctl, env } = harness();
  env.t = 28; ctl.setState('playing');
  assert.deepEqual(env.interval(), [250]);
  assert.deepEqual(env.last().matches.map(m => m.entry.key + ':' + m.match), ['O4:nahe']);
  env.advance(250);
  assert.equal(env.last().changed, false);
  assert.equal(env.last().seeked, false);
  for (let i = 0; i < 8; i++) env.advance(250); // jetzt 30.25 s
  assert.equal(env.last().matches[0].match, 'genau');
  assert.ok(env.updates.some(u => u.changed && u.matches[0]?.match === 'genau'));
});

test('Pause: langsamere Abfrage, keine Seek-Fehlmeldung, Zeit bleibt', () => {
  const { ctl, env } = harness();
  env.t = 31; ctl.setState('playing');
  env.advance(250);
  ctl.setState('paused');
  assert.deepEqual(env.interval(), [1000]);
  assert.equal(env.last().state, 'paused');
  assert.equal(env.last().changed, true); // Zustandswechsel
  env.advance(5000, false);
  assert.equal(env.last().seeked, false);
  assert.equal(env.last().changed, false);
  assert.equal(env.last().time, 31.25);
});

test('Seek: Sprünge vor und zurück werden erkannt, auch während der Pause', () => {
  const { ctl, env } = harness();
  env.t = 10; ctl.setState('playing');
  env.advance(250);
  env.t = 103; env.advance(250, false); // Sprung nach vorn
  assert.equal(env.last().seeked, true);
  assert.equal(env.last().matches[0].entry.key, 'O3');
  env.advance(250);
  assert.equal(env.last().seeked, false);
  env.t = 1; env.advance(250, false); // Sprung zurück
  assert.equal(env.last().seeked, true);
  assert.deepEqual(env.last().matches.filter(m => m.match === 'genau').map(m => m.entry.key), ['O1', 'O2']);
  ctl.setState('paused');
  env.t = 33; env.advance(1000, false); // Ziehen der Zeitleiste im Pausenzustand
  assert.equal(env.last().seeked, true);
  assert.equal(env.last().matches[0].entry.key, 'O4');
});

test('Seek durch Klick in der Liste: sofortige Aktualisierung mit Zielzeit', () => {
  const { ctl, env } = harness();
  env.t = 0; ctl.setState('playing');
  ctl.markSeek(60);
  assert.equal(env.last().time, 60);
  assert.equal(env.last().seeked, true);
  assert.equal(env.last().matches[0].entry.key, 'O5');
});

test('Pufferung und doppelte Geschwindigkeit lösen keinen falschen Seek aus', () => {
  const { ctl, env } = harness();
  env.t = 10; ctl.setState('playing');
  env.advance(250);
  env.advance(3000, false); // Zeit bleibt stehen (Puffer), Uhr läuft weiter
  assert.equal(env.last().seeked, false);
  env.rate = 2; env.advance(250); env.advance(250);
  assert.equal(env.last().seeked, false);
});

test('Videoende und Fehler beenden die Abfrage; destroy räumt auf', () => {
  const { ctl, env } = harness();
  env.t = 5; ctl.setState('playing');
  ctl.setState('ended');
  assert.deepEqual(env.interval(), []);
  assert.equal(env.last().state, 'ended');
  ctl.setState('playing');
  assert.deepEqual(env.interval(), [250]);
  ctl.setState('error');
  assert.deepEqual(env.interval(), []);
  ctl.setState('playing');
  ctl.destroy();
  assert.deepEqual(env.interval(), []);
  const n = env.updates.length;
  ctl.setState('playing'); ctl.tick(); ctl.markSeek(3);
  assert.equal(env.updates.length, n);
});

test('Ungültige Playerzeit fällt auf die letzte bekannte Zeit zurück', () => {
  const { ctl, env } = harness();
  env.t = 33; ctl.setState('paused');
  env.t = NaN; env.advance(1000, false);
  assert.equal(env.last().time, 33);
});

test('Hilfsfunktionen: Zustände, Fehlertexte, Video-ID', () => {
  assert.equal(S.stateName(1), 'playing');
  assert.equal(S.stateName(0), 'ended');
  assert.equal(S.stateName(2), 'paused');
  assert.equal(S.stateName(-1), 'unstarted');
  assert.equal(S.stateName(99), 'unstarted');
  assert.match(S.errorText(150), /Einbettung/);
  assert.match(S.errorText(101), /Einbettung/);
  assert.match(S.errorText(100), /nicht gefunden/);
  assert.equal(S.youtubeId('https://www.youtube.com/watch?v=mlxFA9T88I0'), 'mlxFA9T88I0');
  assert.equal(S.youtubeId('https://youtu.be/mlxFA9T88I0?t=3'), 'mlxFA9T88I0');
  assert.equal(S.youtubeId('https://www.youtube.com/watch?feature=x&v=mlxFA9T88I0'), 'mlxFA9T88I0');
  assert.equal(S.youtubeId('http://www.youtube.com/watch?v=mlxFA9T88I0'), null);
  assert.equal(S.youtubeId('https://evil.example/watch?v=mlxFA9T88I0'), null);
  assert.equal(S.youtubeId('https://www.youtube.com/watch?v=mlxFA9T88I0"><script>'), null);
  assert.equal(S.youtubeId('https://www.youtube.com/watch?v=short'), null);
});

test('Echte Projektdaten: alle Fundstellen synchronisierbar, Überlappung und Wiederholung vorhanden', () => {
  const dir = path.join(__dirname, '..', 'faktenchecks');
  const ids = fs.readdirSync(dir).filter(id => fs.existsSync(path.join(dir, id, 'strukturiert', 'aussagen.json')));
  assert.ok(ids.length > 0);
  for (const id of ids) {
    const d = JSON.parse(fs.readFileSync(path.join(dir, id, 'strukturiert', 'aussagen.json'), 'utf8'));
    const tl = S.buildTimeline(d.claims, { durationSeconds: d.scope.durationSeconds });
    const occCount = d.claims.reduce((n, c) => n + c.occurrences.length, 0);
    assert.equal(tl.entries.length + tl.untimed.length, occCount, id);
    assert.equal(tl.untimed.length, 0, id + ': Fundstellen ohne Zeitmarke');
    for (const e of tl.entries) assert.deepEqual(e.issues, [], id + ' ' + e.key);
    assert.equal(S.youtubeId(d.scope.videoUrl), d.scope.videoId, id);
    if (id === 'mlxFA9T88I0') {
      const at = t => S.matchAt(tl, t).filter(m => m.match === 'genau').map(m => m.entry.claimId.slice(-5));
      assert.deepEqual(at(1.5), ['A0011', 'A0012']); // überlappende Aussagen im Auftakt
      const rep = tl.entries.filter(e => e.claimId.endsWith('A0007'));
      assert.equal(rep.length, 2);                    // Teaser und Hauptstelle
      assert.deepEqual(at(32), ['A0007']);
    }
  }
});
