# Abschlussprüfung mlxFA9T88I0 (18.11.2026)

Prüf-Agent: Claude

Nach der Migration aller 99 Altpunkte (PR #15) waren 202 Datensätze offen oder in Bearbeitung. Jede dieser Aussagen ist jetzt einzeln entschieden. Grundlage ist die Vorgabe des Projektverantwortlichen: Was sich nicht überprüfen lässt, wird nicht geraten, sondern als nicht überprüfbar gekennzeichnet, mit Grund. Meinungen werden als Meinung eingeordnet.

## Ergebnis

| Entscheidung | Anzahl |
| --- | ---: |
| Mit neu gelesenen Quellen bewertet | 28 |
| Von Tatsachenbehauptung zu Meinung umgestuft | 5 |
| Als nicht überprüfbar gekennzeichnet | 169 |

Die 28 Bewertungen: 12 belegt, 7 teilweise belegt, 4 irreführend / Kontext fehlt, 3 widerlegt, 2 nicht ausreichend belegbar. Neu gelesene Quellen sind S114–S143 (u. a. AEUV Art. 123, 130 und 283, ONS, Bundesagentur für Arbeit, Destatis, KfW, S&P, SRF, NTSB).

Die 169 Kennzeichnungen nach Grund:

| Grund | Anzahl |
| --- | ---: |
| nicht öffentlicher Vorgang oder interne Daten | 54 |
| keine zugängliche Quelle in dieser Prüfung | 48 |
| persönliche Darstellung ohne öffentlichen Beleg | 29 |
| zu unbestimmt | 21 |
| Behauptung über Dritte oder Ursachen ohne Beleg | 14 |
| im Gespräch sofort zurückgewiesene Vermutung | 2 |
| nur wiedergegebene Fremderzählung | 1 |

Drei davon sind nur erörterte Inhalte und zählen nicht als eigene Aussagen. Zusammen mit den 29 Kennzeichnungen aus der Kapitelmigration sind 195 eigene Aussagen als nicht überprüfbar gekennzeichnet.

## Stand danach

392 eigene Aussagen: 197 abgeschlossen (117 Tatsachen, 80 Meinungen/Prognosen), 195 mit Grund als nicht überprüfbar gekennzeichnet, keine in Bearbeitung. Abgeschlossene Tatsachen: 32 belegt, 58 teilweise belegt, 18 irreführend, 7 widerlegt, 2 nicht ausreichend belegbar.

## Technik und Grenzen

- Kennzeichnung: Die Begründung beginnt mit `Nicht überprüfbar – <Grund>.`; Status bleibt `Offen`, Bewertung `null`, mindestens eine offene Frage nennt, was für eine Prüfung fehlt. Die Webseite zeigt diese Aussagen als „Nicht überprüfbar“.
- Jede Änderung an Aussagen aus Kapitel 1–3 ist in `migration.assessmentChange` mit „Abschlussprüfung 18.11.2026 (Claude):“ dokumentiert; `Test-Factcheck.ps1` erlaubt nur so dokumentierte Abweichungen vom Kapitel-3-Stand und prüft, dass keine Aussage mehr ohne Kennzeichnung offen ist.
- `scope.kind` bleibt `Teilbestand`: Erfasst sind die Prüfgegenstände der Altpunkte und der gelesenen Textabschnitte, nicht jede Nebenbemerkung des Gesprächs; Sprecher sind nicht bestätigt.
- „Keine zugängliche Quelle in dieser Prüfung“ heißt: Die Aussage wäre grundsätzlich prüfbar, eine tragfähige Quelle wurde aber nicht gelesen. Diese 48 Aussagen sind die erste Wahl für spätere Nachrecherche.
