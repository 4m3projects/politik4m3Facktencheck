# Prüfstand – ausdrücklich unvollständig

Aktualisierung: 18.11.2026. Eigenständige Neuerfassung für [Issue #3](https://github.com/4m3projects/politik4m3Facktencheck/issues/3). Alle verfügbaren deutschen Originaluntertitel wurden gelesen. Die 248 Datensätze erfassen Prüfgegenstände aus sämtlichen 25 Themenbereichen, sind aber noch kein erschöpfendes Aussageninventar und kein vollständiger Faktencheck des Interviews. Frühere KI-Zahlen wurden nicht als Sollwert oder Bewertungsgrundlage verwendet.

## Ergebnis des bisher abgeschlossenen Teils

57 einmalig gezählte Tatsachenbehauptungen sind sachlich abschließend bewertet. Die Begründungen und direkt zugeordneten Quellen stehen bei den jeweiligen Aussage-IDs. Beispiele für unterschiedliche Ergebnisse:

- Die Schulveröffentlichungen bestätigen einzelne Wettbewerbserfolge; daraus folgt keine Bestätigung sämtlicher biografischer Leistungsangaben.
- Die Erweiterung von § 188 im Jahr 2021 ist belegt. Die Erklärung über eine Umwandlung des früheren § 103 vermischt dagegen unterschiedliche Normen und Entwicklungen.
- Optionsprämien können Verluste teilweise abfedern. Sie machen die zugrunde liegende Anlage nicht umfassend sicher.
- Allgemeine US-Einreise- und Asylregeln tragen keine pauschalen Aussagen über automatisch zurückgesetzte Aufenthaltsfristen oder immer eintretende zehnjährige Sperren. Individuelle Folgen bleiben eine gesonderte Prüfung.
- Aktenzugang, Rosenholz und biografische Verbindungen sind keine Nachweise für eine eigene Geheimdiensttätigkeit Merkels.
- Historische Tabakspenden an Heartland sind dokumentiert. Persönliche Zahlungen an Seibt und ihr damaliger Kenntnisstand folgen daraus nicht.

Nach erneuter Kontextprüfung bleibt A0196 zum Loyalitätsbekenntnis in Bearbeitung: Ein persönlicher Vorsatz darf nicht ohne sichere Auslegung als behauptete gesetzliche Pflicht bewertet werden.

Dies sind eigene Zusammenfassungen der unten verlinkten Einzelprüfungen, keine Gesamtbewertung einer Person. Private Behandlungs-, Aufenthalts- und Kostenberichte bleiben ohne passende Einzelfallunterlagen offen; fehlende Bestätigung bedeutet nicht falsch.

## Vorläufige Statistik des erfassten Teilbestands

Verbindliche Berechnung: [generierte Statistik](strukturiert/statistik.json) und [Erläuterung](strukturiert/README.md). Die folgenden Zahlen geben diesen Datenstand wieder. Der Prozentnenner umfasst ausschließlich die 57 abgeschlossenen Tatsachenbehauptungen mit mindestens einem eigenen, bestätigten oder plausiblen Aussagebezug. Offene Aussagen, Meinungen, Prognosen und reine Fremdbezüge sind ausgeschlossen. Die Sprecheridentität ist davon unabhängig noch unbestätigt.

| Sachbewertung | Anzahl | Anteil an 57 abgeschlossenen Tatsachen |
|---|---:|---:|
| Belegt | 21 | 36,8 % |
| Teilweise belegt | 10 | 17,5 % |
| Irreführend / Kontext fehlt | 14 | 24,6 % |
| Widerlegt | 12 | 21,1 % |
| Nicht ausreichend belegbar | 0 | 0,0 % |

Diese Verteilung beschreibt weder alle Tatsachenbehauptungen noch das ganze Interview. Von 222 eigenbezogenen Tatsachenbehauptungen sind 123 offen und 42 in Bearbeitung. Weitere 24 Einträge sind Meinungen oder Prognosen. Zwei der 248 Datensätze enthalten ausschließlich fremdbezogene Inhalte und zählen nicht zu den 246 eigenbezogenen Aussagen.

276 eigene Aussagevorkommen gehören zu diesen 246 Aussagen; 30 zusätzliche Vorkommen sind daher keine neuen Aussagen. Hinzu kommen vier referierende Vorkommen und ein Vorkommen mit ungeklärtem Aussagebezug. Zusätzliche Vorkommen können Übernahmen oder Wiederaufnahmen sein. Sie sind bei unbestätigter Identität nicht automatisch bestätigte Wiederholungen derselben Person.

| Person | Bestätigt zurechenbare Tatsachen | Persönliche Prozentverteilung |
|---|---:|---|
| Naomi Seibt (SP01) | 0 | Nicht berechenbar |
| Ben (SP02) | 0 | Nicht berechenbar |

Die Nullen bedeuten fehlende Bestätigung von Stimme und eigenem Aussagebezug, nicht fehlende Äußerungen. Plausible Kandidaten sind bei jedem Vorkommen sichtbar. Eine gemeinsame ausdrückliche Übernahme würde beiden Personen höchstens einmal zugerechnet, im Video aber weiterhin nur einmal gezählt. Rückfragen und Fremdbezüge sind keine Übernahme. Personensummen sind deshalb grundsätzlich nicht additiv. Keine Glaubwürdigkeitsnoten, kein Ranking.

### Werbung gesondert

Kapitel 3 und 9 enthalten elf erfasste Werbeprüfgegenstände (A0021–A0027 und A0081–A0084): zehn Tatsachenbehauptungen und eine subjektive Einschätzung. Fünf Tatsachen sind teilweise belegt, fünf noch in Bearbeitung. Diese Teilmenge ist bereits im Gesamtbestand enthalten und darf nicht nochmals addiert werden. Eine vollständige Kontrolle aller beworbenen Buch- und Zusatzleistungen war nicht möglich.

Reproduzierbare Teilmengenauswertung mit derselben Statistikfunktion, ausgehend vom Repositoryverzeichnis:

```powershell
. .\scripts\Factcheck-Common.ps1
$d = Get-Content .\faktenchecks\mdo14671BPE\strukturiert\aussagen.json -Raw | ConvertFrom-Json
$d.claims = @($d.claims | Where-Object { $_.chapter -in @(3,9) })
Get-FactcheckStatistics $d | ConvertTo-Json -Depth 15
```

## Kapitelprüfungen

- [01 · Auftakt und angekündigte Lebensumstände](strukturiert/berichte/kapitel-01.md)
- [02 · Einreise, Anzeigen und schulischer Weg](strukturiert/berichte/kapitel-02.md)
- [03 · Werbung für ein Optionshandelsbuch](strukturiert/berichte/kapitel-03.md)
- [04 · Lernen, Selbsteinschätzung und Wettbewerbe](strukturiert/berichte/kapitel-04.md)
- [05 · CDU-Erlebnisse und der Todesfall Mißfelder](strukturiert/berichte/kapitel-05.md)
- [06 · Verschwörungsdeutungen und Epstein](strukturiert/berichte/kapitel-06.md)
- [07 · Studium, Essay und politische Leitbilder](strukturiert/berichte/kapitel-07.md)
- [08 · Private Kindheitserfahrungen](strukturiert/berichte/kapitel-08.md)
- [09 · Werbung für Forschungsförderungsberatung](strukturiert/berichte/kapitel-09.md)
- [10 · Familiengeschichte und persönliche Belastungen](strukturiert/berichte/kapitel-10.md)
- [11 · Schülerforschung und berufliche Neuorientierung](strukturiert/berichte/kapitel-11.md)
- [12 · Klimapolitischer Aufstieg und Medienkontakte](strukturiert/berichte/kapitel-12.md)
- [13 · Plattformmoderation und Corona-Diagnostik](strukturiert/berichte/kapitel-13.md)
- [14 · Krankheitsgeschichte und Überwachungsvorwürfe](strukturiert/berichte/kapitel-14.md)
- [15 · Öffentliche und private Kontakte zu Musk](strukturiert/berichte/kapitel-15.md)
- [16 · Ausreise, Risiken und Aufenthalt in den USA](strukturiert/berichte/kapitel-16.md)
- [17 · Asylentscheidung, Medienarbeit und Finanzierung](strukturiert/berichte/kapitel-17.md)
- [18 · Janich, Sicherheitsbefürchtungen und Parteikritik](strukturiert/berichte/kapitel-18.md)
- [19 · Merkel, DDR und vermutete Geheimdienstverbindungen](strukturiert/berichte/kapitel-19.md)
- [20 · Asylverfahren, Kontakte und Reisefragen](strukturiert/berichte/kapitel-20.md)
- [21 · Rückkehrbefürchtungen und politische Zukunft](strukturiert/berichte/kapitel-21.md)
- [22 · Geplante Medien- und Rechtshilfeorganisation](strukturiert/berichte/kapitel-22.md)
- [23 · Meinungsfreiheit und strafrechtliche Grenzen](strukturiert/berichte/kapitel-23.md)
- [24 · Heartland, Medienaufsicht und Verfahrenskosten](strukturiert/berichte/kapitel-24.md)
- [25 · Lebensdeutung, Literatur und Abschluss](strukturiert/berichte/kapitel-25.md)

## Offene Arbeit und Zugangslücken

Die originale Untertitelgrundlage fehlt von 02:10:47,880 bis 02:12:43,970; die letzten vier Sekunden bleiben ebenfalls ohne Inhaltsnachweis. Zwei Einträge im Lückenfenster beruhen nur auf einer zusätzlichen öffentlichen Podcast-Transkription mit abweichender Zeitachse. Sie schließen die Lücke nicht verlässlich. Eine Audio-/Videokontrolle und bestätigte Sprecheridentifizierung haben nicht stattgefunden.

Notwendig bleiben die vollständige Erfassung weiterer Teilbehauptungen, Quellen für die 165 offenen oder laufenden Tatsachenprüfungen und eine Kontrolle der Fundstellen am Original. Besondere Nachweislücken betreffen private Vorgänge, konkrete Straf- und Medienaufsichtsakten, Visum- und Asylstatus, Vergütungs- und Kostenunterlagen sowie beworbene Zusatzleistungen. Erfolglose Abrufe sind im Datenbestand ausdrücklich als solche vermerkt und keine Sachbelege. Allgemeines Recht und heutige Unternehmensseiten beweisen keinen individuellen oder historischen Zustand.

Die ältere private KI-Auswertung liegt dieser Prüfung nicht vor; ein Einzelvergleich ist erst nach unabhängiger Erfassung und Zugang zu ihren Prüfgegenständen möglich. [Draft PR #5](https://github.com/4m3projects/politik4m3Facktencheck/pull/5) bleibt ein prüfbarer Arbeitsstand. Das Issue wird durch diese Teilprüfung nicht abgeschlossen; kein Merge ohne Nutzerfreigabe.
