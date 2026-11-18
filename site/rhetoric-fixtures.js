/*
 * FIKTIVE Rhetorik-Testdaten für site/rhetoric-browser-test.js. Wird nicht veröffentlicht und nie in
 * faktenchecks/ geschrieben. Die Hinweise sind ausgedacht und sagen nichts über das echte Video aus;
 * sie hängen nur an vorhandenen Aussage-IDs, damit Anzeige, Filter und Trennung der Ebenen geprüft werden können.
 *
 * build(facts): erzeugt eine gültige rhetorik.json für das Video aus aussagen.json.
 * Ergebnis: drei Hinweise an zwei Aussagen. Die erste „Meinung / Prognose“-Aussage erhält Ironie und Abwertung,
 * die zweite eine Pauschalisierung.
 */
'use strict';
const NOTE = 'Fiktive Testdaten – nur für den Browsertest, keine echte Einordnung.';

function build(facts) {
  const id = facts.scope.videoId;
  const opinions = facts.claims.filter(c => c.verdict === 'Meinung / Prognose' && c.occurrences && c.occurrences.length);
  if (opinions.length < 2) throw new Error('Für die Rhetorik-Fixtures werden zwei Aussagen mit „Meinung / Prognose“ gebraucht.');
  const hist = [{ date: '2026-11-18', by: 'Test', change: NOTE }];
  const ann = (n, claim, feature) => ({
    id: `${id}-R${String(9000 + n)}`,
    claimId: claim.id,
    feature,
    startSeconds: claim.occurrences[0].startSeconds,
    endSeconds: claim.occurrences[0].endSeconds,
    speaker: { id: null, attribution: 'Ungeklärt', basis: NOTE },
    observation: NOTE, reason: NOTE, context: NOTE,
    assessment: 'Erkennbar', reliability: 'Mittel', uncertainty: NOTE, missingInformation: null,
    status: 'KI-Vorschlag', basis: NOTE, history: hist
  });
  return {
    schemaVersion: 1,
    videoId: id,
    review: { status: 'Teilweise geprüft', checkedOn: '2026-11-18', by: 'Test', basis: NOTE, coverage: NOTE, limits: [NOTE], history: hist },
    annotations: [ann(1, opinions[0], 'ironie'), ann(2, opinions[0], 'abwertung'), ann(3, opinions[1], 'pauschalisierung')]
  };
}

module.exports = { build, NOTE };
