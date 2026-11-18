/*
 * Politik4M3 Faktencheck – Zeitsynchronisierung zwischen Videoposition und Aussagen.
 * Eigener Code ohne Fremdbibliotheken. Reine Logik ohne DOM- oder YouTube-Zugriff,
 * damit sie im Browser (window.FactSync) und unter Node (require) getestet werden kann.
 *
 * Grundsatz: Es werden keine Zeiten erfunden. Die Fundstellen kommen unverändert aus
 * aussagen.json (startSeconds/endSeconds/precision). Ungefähre Zeitmarken erhalten nur
 * für die Anzeige „in der Nähe“ einen Toleranzbereich; die Daten selbst bleiben unberührt.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FactSync = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* Toleranz in Sekunden je Zeitpräzision, nur für den Status „in der Nähe“. */
  const TOLERANCE = { 'Ungefähr': 5, 'Kontrolliert': 1 };
  const UNKNOWN_PRECISION_TOLERANCE = 5;

  const ISSUE_TEXT = {
    'ohne-ende': 'Ende der Fundstelle fehlt; nur der Beginn ist bekannt.',
    'ende-vor-start': 'Ende liegt vor dem Beginn; nur der Beginn wird verwendet.',
    'ausserhalb-laufzeit': 'Fundstelle liegt außerhalb der angegebenen Videolaufzeit.',
    'unbekannte-praezision': 'Zeitpräzision nicht angegeben oder unbekannt; als ungefähr behandelt.',
    'ohne-zeitmarke': 'Keine verwendbare Zeitmarke; kann nicht mit dem Video synchronisiert werden.'
  };

  function isTime(x) { return typeof x === 'number' && Number.isFinite(x) && x >= 0; }

  /*
   * Baut aus den Aussagen eine nach Zeit sortierte Liste aller Fundstellen.
   * Jede Fundstelle (auch Wiederholungen derselben Aussage) ist ein eigener Eintrag.
   * Rückgabe: { entries, untimed } – untimed enthält Fundstellen ohne verwendbare Zeitmarke.
   */
  function buildTimeline(claims, opts) {
    const duration = opts && isTime(opts.durationSeconds) ? opts.durationSeconds : null;
    const entries = [];
    const untimed = [];
    for (const c of claims || []) {
      const occs = Array.isArray(c.occurrences) ? c.occurrences : [];
      occs.forEach((o, i) => {
        const base = {
          key: String(o.id || (c.id + '#' + (i + 1))),
          claimId: c.id,
          occurrenceId: o.id || null,
          index: i + 1,
          count: occs.length,
          precision: o.precision || null,
          issues: []
        };
        if (!isTime(o.startSeconds)) {
          base.issues.push('ohne-zeitmarke');
          untimed.push(base);
          return;
        }
        const start = o.startSeconds;
        let end = o.endSeconds;
        if (!isTime(end)) { base.issues.push('ohne-ende'); end = start; }
        else if (end < start) { base.issues.push('ende-vor-start'); end = start; }
        if (duration != null && start > duration) base.issues.push('ausserhalb-laufzeit');
        let tolerance = TOLERANCE[o.precision];
        if (tolerance == null) { base.issues.push('unbekannte-praezision'); tolerance = UNKNOWN_PRECISION_TOLERANCE; }
        entries.push({ ...base, start, end, tolerance });
      });
    }
    entries.sort((a, b) => a.start - b.start || a.end - b.end || String(a.claimId).localeCompare(String(b.claimId)) || a.index - b.index);
    return { entries, untimed };
  }

  /* Ende eines Bereichs für den Vergleich: Punktmarken gelten eine Sekunde lang. */
  function effectiveEnd(e) { return Math.max(e.end, e.start + 1); }

  /*
   * Welche Fundstellen gehören zur Zeit t?
   * 'genau': t liegt im angegebenen Bereich [start, end).
   * 'nahe':  t liegt nur im Toleranzbereich einer (ungefähren) Zeitmarke.
   * Sortierung: genaue Treffer zuerst, dann nach Beginn.
   */
  function matchAt(timeline, t) {
    if (!isTime(t)) return [];
    const out = [];
    for (const e of timeline.entries) {
      const end = effectiveEnd(e);
      if (t >= e.start && t < end) out.push({ entry: e, match: 'genau' });
      else if (t >= e.start - e.tolerance && t < end + e.tolerance) out.push({ entry: e, match: 'nahe' });
    }
    out.sort((a, b) => (a.match === b.match ? 0 : a.match === 'genau' ? -1 : 1) || a.entry.start - b.entry.start);
    return out;
  }

  /* Nächste Fundstelle, die nach t beginnt (für die neutrale Meldung). */
  function nextAfter(timeline, t) {
    for (const e of timeline.entries) if (e.start > t) return e;
    return null;
  }

  /* Stabile Signatur einer Trefferliste, um Änderungen zu erkennen. */
  function signature(matches) {
    return matches.map(m => m.entry.key + ':' + m.match).join('|');
  }

  /*
   * Steuert die Abfrage der Playerzeit. Abhängigkeiten werden injiziert, damit die
   * Logik ohne echten Player und ohne echte Uhr getestet werden kann.
   *
   * opts.getTime()        aktuelle Playerzeit in Sekunden
   * opts.getRate()        optional, Wiedergabegeschwindigkeit
   * opts.onUpdate(info)   info = { time, state, matches, next, changed, seeked }
   * opts.now()            Millisekunden (Standard: Date.now)
   * opts.setInterval / opts.clearInterval  Timerfunktionen
   */
  const POLL_MS = { playing: 250, buffering: 500, paused: 1000, cued: 1000, unstarted: 1000 };

  function SyncController(timeline, opts) {
    this.timeline = timeline;
    this.o = Object.assign({
      getRate: () => 1,
      now: () => Date.now(),
      setInterval: (f, ms) => setInterval(f, ms),
      clearInterval: id => clearInterval(id),
      seekThreshold: 2
    }, opts);
    this.state = 'unstarted';
    this.timer = null;
    this.timerMs = 0;
    this.lastTime = null;
    this.lastNow = null;
    this.lastSig = null;
    this.forceSeek = false;
    this.destroyed = false;
  }

  SyncController.prototype.setState = function (s) {
    if (this.destroyed) return;
    const prev = this.state;
    this.state = s;
    const ms = POLL_MS[s] || 0;
    if (ms !== this.timerMs) {
      if (this.timer != null) this.o.clearInterval(this.timer);
      this.timer = ms ? this.o.setInterval(() => this.tick(), ms) : null;
      this.timerMs = ms;
    }
    this.tick(undefined, prev !== s);
  };

  /* Vom Nutzer ausgelöster Sprung: nächste Aktualisierung gilt als Seek, optional mit Zielzeit. */
  SyncController.prototype.markSeek = function (target) {
    if (this.destroyed) return;
    this.forceSeek = true;
    if (isTime(target)) this.tick(target);
  };

  SyncController.prototype.tick = function (override, stateChanged) {
    if (this.destroyed) return null;
    let t = isTime(override) ? override : Number(this.o.getTime());
    if (!isTime(t)) t = this.lastTime != null ? this.lastTime : 0;
    const now = this.o.now();
    let seeked = this.forceSeek;
    if (!seeked && this.lastTime != null && this.lastNow != null) {
      const elapsed = Math.max(0, now - this.lastNow) / 1000;
      const rate = this.state === 'playing' ? (Number(this.o.getRate()) || 1) : 0;
      const expected = this.lastTime + elapsed * rate;
      // Pufferpausen lassen die Zeit nur zurückbleiben; ein Seek ist ein deutlicher Sprung vor oder zurück.
      const tol = this.o.seekThreshold;
      if (t > expected + tol || t < this.lastTime - 1) seeked = true;
    }
    this.forceSeek = false;
    this.lastTime = t;
    this.lastNow = now;
    const matches = matchAt(this.timeline, t);
    const sig = signature(matches);
    const changed = sig !== this.lastSig || !!stateChanged || seeked;
    this.lastSig = sig;
    const info = { time: t, state: this.state, matches, next: nextAfter(this.timeline, t), changed, seeked };
    if (this.o.onUpdate) this.o.onUpdate(info);
    return info;
  };

  SyncController.prototype.destroy = function () {
    if (this.timer != null) this.o.clearInterval(this.timer);
    this.timer = null;
    this.timerMs = 0;
    this.destroyed = true;
  };

  /* YouTube-Player-Zustände (IFrame API) auf eigene Namen abbilden. */
  function stateName(code) {
    return ({ '-1': 'unstarted', 0: 'ended', 1: 'playing', 2: 'paused', 3: 'buffering', 5: 'cued' })[code] || 'unstarted';
  }

  /* Fehlercodes der IFrame API in verständliche Hinweise übersetzen. */
  function errorText(code) {
    switch (Number(code)) {
      case 2: return 'Der Player hat eine ungültige Anfrage erhalten.';
      case 5: return 'Das Video kann im eingebetteten Player dieses Browsers nicht abgespielt werden.';
      case 100: return 'Das Video wurde nicht gefunden oder ist nicht öffentlich.';
      case 101:
      case 150: return 'Die Einbettung dieses Videos ist vom Kanal nicht erlaubt.';
      case 153: return 'YouTube hat die Einbettung abgelehnt (fehlende Herkunftsangabe des Browsers).';
      default: return 'Der YouTube-Player meldet einen Fehler.';
    }
  }

  /* Elfstellige YouTube-ID nur aus einer HTTPS-Watch-/Kurz-URL akzeptieren. */
  function youtubeId(url) {
    const m = /^https:\/\/(?:www\.|m\.)?(?:youtube\.com\/watch\?(?:[^#]*&)?v=|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[&#?]|$)/.exec(String(url || ''));
    return m ? m[1] : null;
  }

  return { TOLERANCE, ISSUE_TEXT, buildTimeline, matchAt, nextAfter, signature, SyncController, stateName, errorText, youtubeId };
});
