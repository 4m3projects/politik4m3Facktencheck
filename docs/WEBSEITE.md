# Webseite (GitHub Pages)

Erstellt/bearbeitet von: Claude (auf Nutzerauftrag, eigener Branch). Fachliche Daten bleiben unverändert in der Verantwortung von Codex.

Die öffentliche Webseite stellt die Faktenchecks dieses Repositorys lesbar dar. Sie wird **automatisch aus den vorhandenen Projektdateien erzeugt**; für ein neues Video ist keine Änderung an der Webseite nötig.

## Aufbau

- `site/index.html`, `site/style.css`, `site/app.js`: statische Seite aus eigenem Code. Keine Fremdbibliotheken, keine externen Schriften, keine Tracker, keine eingebetteten Videos.
- `.github/workflows/pages.yml`: führt `scripts/Test-Publication.ps1` aus, stellt die Seite zusammen und veröffentlicht sie bei einem Push auf `main` über GitHub Pages. Bei Pull Requests wird nur geprüft und testweise zusammengestellt, nicht veröffentlicht.

## Welche Daten auf die Seite gelangen

Je Video unter `faktenchecks/<Video-ID>/` (elfstellige ID, `README.md` vorhanden):

- alle eigenen Markdown-Berichte (`*.md`), als lesbare Berichte mit Kapitelnavigation,
- `strukturiert/aussagen.json` und `strukturiert/statistik.json`, falls vorhanden, als filterbare Aussagenansicht.

Andere Dateien werden nicht übernommen. Der Titel stammt aus der ersten Überschrift der Video-`README.md`, Kanal, Veröffentlichung und Laufzeit aus deren Stichpunkten. Die Seite zeigt nur Inhalte, die bereits öffentlich im Repository stehen; die Rechte- und Inhaltsregeln aus `AGENTS.md` gelten unverändert.

## Darstellung

- Sechs feste Bewertungen mit Farbe **und** Text; offene und laufende Prüfungen erscheinen ausdrücklich ohne Bewertung.
- Teilbestände tragen einen deutlichen Hinweis, dass keine Bilanz des ganzen Videos vorliegt.
- Je Fundstelle: Zeitmarke mit Link zum Original, Zeitpräzision, Sprecherzuordnung (bestätigt / plausibel / ungeklärt) und Aussagebezug mit Begründung.
- Quellen mit direktem Link, Datenstand, Abrufdatum und Zugriffsgrundlage.
- Keine Personenrankings oder Glaubwürdigkeitsnoten.

## Einmalige Einrichtung

In den Repository-Einstellungen unter **Settings → Pages → Build and deployment → Source** „GitHub Actions“ wählen. Danach veröffentlicht jeder Push auf `main` die Seite neu.

## Lokale Vorschau

Den Schritt „Webseite zusammenstellen“ aus dem Workflow in einer Bash-Umgebung (z. B. Git Bash oder WSL, mit `jq`) mit gesetzter Variable `OUT` ausführen und das Ausgabeverzeichnis über einen beliebigen lokalen Webserver öffnen. Direktes Öffnen der HTML-Datei ohne Server funktioniert wegen der Datenabrufe nicht.
