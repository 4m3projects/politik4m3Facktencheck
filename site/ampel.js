/*
 * Politik4M3 Faktencheck – Faktenampel: Gesamteinschätzung eines Videos auf einen Blick.
 * Eigener Code ohne Fremdbibliotheken. Reine Logik ohne DOM-Zugriff, damit sie im Browser
 * (window.FactAmpel) und unter Node (require) gleich geprüft werden kann.
 *
 * Regel (öffentlich in der Methodik, verbindlich in docs/AMPEL.md):
 *  - Grundlage sind ausschließlich die abgeschlossen bewerteten Tatsachenbehauptungen aus
 *    strukturiert/statistik.json („entschieden“: Belegt, Teilweise belegt, Irreführend / Kontext fehlt,
 *    Widerlegt). Meinungen, Prognosen, offene, laufende, nicht überprüfbare und „nicht ausreichend
 *    belegbare“ Aussagen zählen nicht mit – ungeprüft ist nicht falsch.
 *  - Fehleranteil = (Widerlegt + Irreführend / Kontext fehlt) / entschiedene Tatsachenbehauptungen.
 *  - Grün < 10 %, Gelb 10 bis unter 25 %, Rot ab 25 %.
 *  - Nicht bewertbar, wenn weniger als 10 Tatsachenbehauptungen entschieden sind, weniger als
 *    20 % aller erfassten Tatsachenbehauptungen oder wenn insgesamt weniger als 20 Tatsachenbehauptungen
 *    je Stunde Laufzeit erfasst sind (dann ist der Bestand eine gezielte Auswahl, kein Querschnitt).
 *  - „Erfasste Tatsachenbehauptungen“ umfasst abgeschlossene, noch nicht geprüfte (Offen), laufende
 *    und nicht überprüfbare Aussagen (docs/AGENTEN_PRUEFSTATUS.md).
 *  - Vorläufig (keine Ampel), solange die Analyse als „In Bearbeitung“ geführt wird oder bei zu
 *    kleiner Grundlage noch Prüfungen ausstehen (noch nicht geprüft oder in Bearbeitung).
 *    Ist die Analyse in video.json als „Abgeschlossen“ geführt, gibt es nie „Vorläufig“: Bei zu
 *    kleiner Grundlage heißt das Ergebnis dann „Nicht bewertbar“ (verbliebene offene Aussagen
 *    werden im Grund genannt), damit ein fertiges Video nicht dauerhaft als „in Prüfung“ erscheint.
 *  - YouTube Shorts (video.json format "short"): Ein Short wird vollständig erfasst (Vollerhebung statt
 *    Auswahl). Deshalb genügen 3 entschiedene Tatsachenbehauptungen, sofern mindestens die Hälfte aller
 *    erfassten entschieden ist (RULES.short). Alles andere gilt unverändert.
 *  - Musikvideos (video.json format "musikvideo"): ebenfalls immer vollständig erfasst und meist mit
 *    nur wenigen prüfbaren Tatsachenkernen; es gilt dieselbe Mindestgrundlage (RULES.musikvideo,
 *    docs/MUSIKVIDEOS.md). Künstlerische Zuspitzung ohne Tatsachenkern zählt nie mit.
 *  - Darstellungshinweise (Rhetorik) gehen nie ein. Die Ampel beschreibt den geprüften Bestand,
 *    nicht das ganze Video und keine Person.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FactAmpel = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const RULES = Object.freeze({
    minDecided: 10,      // mindestens so viele entschiedene Tatsachenbehauptungen
    minShare: 0.2,       // und mindestens dieser Anteil aller erfassten Tatsachenbehauptungen
    minPerHour: 20,      // erfasste Tatsachenbehauptungen je Stunde Videolaufzeit (Schutz vor gezielter Kleinauswahl)
    yellowFrom: 0.10,    // Fehleranteil ab hier gelb
    redFrom: 0.25,       // Fehleranteil ab hier rot
    /* YouTube Shorts: ganze Laufzeit erfasst, wenige Aussagen; siehe docs/SHORTS.md */
    short: Object.freeze({ minDecided: 3, minShare: 0.5 }),
    /* Musikvideos: ganzes Lied erfasst, wenige Tatsachenkerne; siehe docs/MUSIKVIDEOS.md */
    musikvideo: Object.freeze({ minDecided: 3, minShare: 0.5 })
  });

  const DECIDED = ['Belegt', 'Teilweise belegt', 'Irreführend / Kontext fehlt', 'Widerlegt'];
  const ERRORS = ['Irreführend / Kontext fehlt', 'Widerlegt'];

  const LEVELS = Object.freeze({
    gruen: { name: 'Grün', label: 'Überwiegend zutreffend', text: 'Weniger als 10 % der entschiedenen Tatsachenbehauptungen sind widerlegt oder irreführend.' },
    gelb: { name: 'Gelb', label: 'Gemischt', text: '10 bis unter 25 % der entschiedenen Tatsachenbehauptungen sind widerlegt oder irreführend.' },
    rot: { name: 'Rot', label: 'Viele Fehler', text: 'Mindestens 25 % der entschiedenen Tatsachenbehauptungen sind widerlegt oder irreführend.' },
    nicht_bewertbar: { name: 'Nicht bewertbar', label: 'Nicht bewertbar', text: 'Zu wenige prüfbare Tatsachen: weniger als 10 entschieden, weniger als 20 % der erfassten Tatsachenbehauptungen entschieden oder weniger als 20 erfasste Tatsachenbehauptungen je Stunde Video (nur eine kleine Auswahl geprüft). Bei YouTube Shorts und Musikvideos: weniger als 3 entschieden oder weniger als die Hälfte der erfassten.' },
    vorlaeufig: { name: 'Vorläufig', label: 'Noch in Prüfung', text: 'Die Prüfung läuft noch; bis zum Abschluss gibt es keine Ampel.' }
  });

  function count(stats, name) {
    const c = (stats?.categories || []).find(x => x.category === name);
    return Number(c?.completedCount) || 0;
  }

  /* stats: Inhalt von strukturiert/statistik.json (oder null); video: Inhalt von video.json (oder null);
     durationSeconds: Videolaufzeit laut aussagen.json (scope.durationSeconds), falls bekannt. */
  function rate(stats, video, durationSeconds) {
    const n = Object.fromEntries(DECIDED.map(k => [k, count(stats, k)]));
    const decided = DECIDED.reduce((s, k) => s + n[k], 0);
    const errors = ERRORS.reduce((s, k) => s + n[k], 0);
    const inProgress = Number(stats?.inProgressFacts) || 0;
    const unchecked = Number(stats?.openFacts) || 0;
    const unverifiable = Number(stats?.unverifiableFacts) || 0;
    const facts = (Number(stats?.completedFacts) || 0) + unchecked + inProgress + unverifiable;
    const base = { decided, errors, facts, unchecked, unverifiable, counts: n, errorShare: decided ? errors / decided : null, rules: RULES };
    const out = (key, reason) => ({ ...base, key, ...LEVELS[key], reason });

    if (video?.workStatus === 'In Bearbeitung') return out('vorlaeufig', 'Die Analyse dieses Videos ist als „In Bearbeitung“ gekennzeichnet.');
    if (!stats) return out('nicht_bewertbar', 'Für dieses Video liegen keine strukturierten Prüfdaten vor.');
    const rest = inProgress + unchecked > 0 ? ` Die Analyse ist abgeschlossen; ${inProgress + unchecked} Aussagen bleiben als noch nicht geprüft vermerkt.` : '';
    /* Vollständig erfasste Kurzformate mit eigener Mindestgrundlage (Shorts, Musikvideos). */
    const full = video?.format === 'short' || video?.format === 'musikvideo' ? RULES[video.format] : null;
    const minDecided = full ? full.minDecided : RULES.minDecided;
    const minShare = full ? full.minShare : RULES.minShare;
    const fullName = video?.format === 'short' ? 'bei einem Short ' : video?.format === 'musikvideo' ? 'bei einem Musikvideo ' : '';
    const tooFew = decided < minDecided || !facts || decided / facts < minShare;
    if (tooFew) {
      if (inProgress + unchecked > 0 && video?.workStatus !== 'Abgeschlossen') return out('vorlaeufig', `Erst ${decided} Tatsachenbehauptungen entschieden, ${inProgress + unchecked} noch nicht fertig geprüft.`);
      return out('nicht_bewertbar', `Nur ${decided} von ${facts} erfassten Tatsachenbehauptungen sind entschieden; nötig sind ${fullName}mindestens ${minDecided} und mindestens ${Math.round(minShare * 100)} %.${rest}`);
    }
    const hours = Number(durationSeconds) > 0 ? Number(durationSeconds) / 3600 : null;
    if (hours && facts / hours < RULES.minPerHour) {
      if (inProgress + unchecked > 0 && video?.workStatus !== 'Abgeschlossen') {
        return out('vorlaeufig', `${decided} von ${facts} erfassten Tatsachenbehauptungen entschieden, ${inProgress + unchecked} noch nicht fertig geprüft. Bei dieser Laufzeit müssen mindestens ${Math.ceil(hours * RULES.minPerHour)} Tatsachenbehauptungen erfasst sein.`);
      }
      return out('nicht_bewertbar', `Nur ${facts} Tatsachenbehauptungen bei ${hours.toLocaleString('de-DE', { maximumFractionDigits: 1 })} Stunden Laufzeit erfasst – eine kleine Auswahl, kein Querschnitt des Videos; nötig sind mindestens ${RULES.minPerHour} je Stunde.${rest}`);
    }
    const share = errors / decided;
    const key = share >= RULES.redFrom ? 'rot' : share >= RULES.yellowFrom ? 'gelb' : 'gruen';
    return out(key, `${errors} von ${decided} entschiedenen Tatsachenbehauptungen sind widerlegt oder irreführend.`);
  }

  return { RULES, LEVELS, DECIDED, ERRORS, rate };
});
