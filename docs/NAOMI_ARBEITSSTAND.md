# Übernahme und Arbeitsstand: Naomi-Seibt-Interview

Bearbeitet von: Codex. Aktualisierung: 18.11.2026. **In Bearbeitung, keine fertige Gesamtprüfung.**

## Zuständigkeit und Wiederaufnahme

- Auftrag: [Issue #3](https://github.com/4m3projects/politik4m3Facktencheck/issues/3), [Draft PR #5](https://github.com/4m3projects/politik4m3Facktencheck/pull/5).
- Eigener Branch: `codex/faktencheck-mdo14671BPE`; benachbarter Worktree mit Namen `politik4m3-naomi`. Den Arbeitsbaum des Migrations-Chats nicht verwenden.
- Letzter vor dieser Aktualisierung geprüfter und gepushter Sachstand: `ca2a2eec6e2cfbfe046c08bb87da2eb76568ceff`. Den neueren gesicherten Stand im PR und mit `git log -1` prüfen; lokale Änderungen nicht ungeprüft verwerfen.
- Aktuelle Nutzerfreigabe: [ChatGPTs Dokumentation vom 18.11.2026](https://github.com/4m3projects/politik4m3Facktencheck/issues/3#issuecomment-6970001314). Fertigstellung und Veröffentlichung einschließlich Merge sind für diesen Auftrag autorisiert. Die älteren Einzel-Freigabesätze sind insoweit übersteuert. Quellen-, Rechte- und Testpflichten gelten weiter.
- Aktueller Integrationsschritt: vorhandene Website aus `origin/main` (`d79ec4f`) in den eigenen Branch übernehmen. Kein Rebase mit Force-Push, keine fremden Branchänderungen. Der einzige Konflikt betraf den Kommentar neben der bereits beidseitig erlaubten CLAUDE.md im Publikationsprüfer; Website-Freigaben aus main erhalten.
- Issue #8 zur Synchronisierung bei YouTube-Werbung ist Claudes gesonderter Auftrag; keine konkurrierende Reparatur in diesem Branch.

## Gesicherter fachlicher Stand

Zentrale Daten: [aussagen.json](../faktenchecks/mdo14671BPE/strukturiert/aussagen.json). Berichte und Statistik im Unterverzeichnis `strukturiert` ausschließlich mit dem Generator erzeugen. Eigene Einordnung und Abdeckungsregister stehen eine Ebene darüber.

248 Datensätze, davon zwei reine Fremdbezüge; 246 eigenbezogene Aussagen mit 276 eigenen Vorkommen. 222 Tatsachenbehauptungen: 57 abgeschlossen, 123 offen, 42 in Bearbeitung. 24 Meinungen/Prognosen außerhalb des Tatsachennenners. Werbung ist eine enthaltene Teilmenge, keine zusätzlich zu addierende Menge.

Alle verfügbaren automatischen deutschen Originaluntertitel wurden gelesen. Beide deutschen Spuren haben dieselbe Lücke bei ungefähr 02:10:48–02:12:44. Letzte vier Sekunden ebenfalls ohne Inhaltsnachweis. Zwei Einträge im Lückenfenster beruhen nur auf einer öffentlichen Podcast-Transkription mit abweichender Zeitachse. Nicht als synchronisiert oder kontrolliert ausgeben. Audio-/Videokontrolle und bestätigte Sprecheridentitäten fehlen vollständig; keine persönlichen Prozentquoten erfinden.

Private Grundlagen ausschließlich in der vom Importskript vorgesehenen externen Ablage verwenden. Keine Pfade, Originalpassagen oder Dateien daraus in öffentliche Berichte, Kommentare, Screenshots oder Build-Ausgaben kopieren. Ein erneuter Import darf vorhandene Quellen nicht überschreiben. Die ältere private 328-Punkte-Auswertung liegt nicht vor und wurde nicht übernommen.

## Konkrete nächste Arbeit

1. Website-Integration testen und diesen konsistenten Arbeitsstand committen/pushen; SHA und Testergebnis in Issue/PR nennen. Video-Metadaten in der eigenen README im von der Website unterstützten Stichpunktformat halten.
2. Noch offene öffentliche Angaben weiter recherchieren, zuerst A0096–A0103 (öffentliche Auftritte, Heartland, Medien), A0072–A0074 (Veröffentlichungen und Plattformgeschichte), A0001–A0005 (Alter, öffentliche Termine, behauptete Vermittlung und kostenloses Folgen), A0168 und A0210–A0231 (konkrete Verfahren und Rechtsbehauptungen). Nicht alles in einem Sammelurteil schließen.
3. A0064 unterscheidet noch nicht sicher zwischen Kontakt zu Epstein und strafbarer Beteiligung. Originalstelle und Belege prüfen; ein Kontakt ist kein Schuldbeweis. A0059 nennt das Wahljahr nicht eindeutig; erste Q-Beiträge 2017 rechtfertigen ohne diese Klärung kein pauschales Urteil über eine Vorhersage.
4. A0196 wurde nach Kontextprüfung wieder geöffnet: persönlicher Loyalitätsvorsatz und behauptete rechtliche Asylvoraussetzung sind nicht eindeutig dieselbe Aussage. Die frühere Endbewertung nicht ungeprüft wiederherstellen.
5. Private Krankheits-, Missbrauchs-, Familien-, Aufenthalts- und Kostenberichte erfordern geeignete Einzelfallbelege. Keine massenhafte Umstellung offener Fälle auf Nicht ausreichend belegbar, um die Abschlusszahl zu erhöhen. Tatsächlich unzugängliche Fälle nachvollziehbar begrenzen; fehlende Bestätigung bedeutet nicht falsch.
6. Danach alle Teilbehauptungen mit der vollständigen zugänglichen Grundlage abgleichen, Wiederholungen zusammenführen und unsichere Rollen einzeln prüfen. Bestätigte Sprecherstatistik erst nach entsprechend dokumentierter Identifizierung.
7. Website-Aufbau, Navigation, Aussagefilter, Videoansicht, Berichtslinks und mobile Darstellung mit den neuen Daten kontrollieren. Ein nachgebildeter Player ist keine Prüfung des echten YouTube-Videos. Erst nach belegtem Abschluss reviewfähigen PR, Merge und Pages-Deployment durchführen; verbleibende Sachlücken sichtbar lassen.

## Quellenhinweise

S041/S062 betreffen Heartlands eigene Darstellung und die Originalrecherche von CORRECTIV/Frontal21. S059 dokumentiert historische institutionelle Tabakspenden, keine persönliche Bezahlung Seibts. S060/S061 betreffen § 188 und seine Erweiterung 2021. S063 und S066 sind erfolglose Abrufe; Ersatzquellen und Grenzen stehen jeweils im Datensatz. S069 ist Originalforschung über Q-Beiträge, kein Beweis einer tatsächlichen Insideridentität. Alle neuen Quellen tatsächlich öffnen und die gelesenen Abschnitte dokumentieren.

## Vorgeschriebene Sicherung

Im eigenen Worktree ausführen, Fehler vor einem Commit beheben:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Build-Factcheck.ps1 -VideoId mdo14671BPE
git add -- faktenchecks/mdo14671BPE docs/NAOMI_ARBEITSSTAND.md
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Build-Factcheck.ps1 -VideoId mdo14671BPE -Check
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Test-Factcheck.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Test-Publication.ps1
node --test site/sync-test.js
git diff --cached --check
```

Bei Websiteänderungen zusätzlich den Aufbau aus `.github/workflows/pages.yml` sowie `node site/browser-test.js` mit extern bereitgestelltem Playwright/Chromium ausführen. Abhängigkeiten und Build-Ausgaben außerhalb des Repositorys halten. Inhaltliche Rechteprüfung bleibt zusätzlich zum technischen Filter erforderlich. Danach sinnvoll abgegrenzten Commit erstellen, normal pushen, Remote-SHA prüfen und Issue/PR mit nächstem konkretem Schritt aktualisieren.
