# Webseite (GitHub Pages)

Erstellt/bearbeitet von: Claude (auf Nutzerauftrag, eigener Branch). Fachliche Daten bleiben unverändert in der Verantwortung von Codex.

Die öffentliche Webseite stellt die Faktenchecks dieses Repositorys lesbar dar. Sie wird **automatisch aus den vorhandenen Projektdateien erzeugt**; für ein neues Video ist keine Änderung an der Webseite nötig.

## Aufbau

- `site/index.html`, `site/style.css`, `site/app.js`: statische Seite aus eigenem Code. Keine Fremdbibliotheken, keine externen Schriften, keine Tracker.
- `site/sync.js`, `site/video.js`: Video-Ansicht mit zeitlich synchronisierten Aussagen (siehe unten). Das Originalvideo wird nur nach ausdrücklichem Klick über den offiziellen YouTube-Player eingebettet.
- `site/sync-test.js`, `site/browser-test.js`: Tests; werden nicht veröffentlicht.
- `.github/workflows/pages.yml`: führt `scripts/Test-Publication.ps1` und die Synchronisationstests aus, stellt die Seite zusammen und veröffentlicht sie bei einem Push auf `main` über GitHub Pages. Bei Pull Requests wird nur geprüft und testweise zusammengestellt, nicht veröffentlicht.

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

## Video mit Faktencheck (Video-Ansicht)

Erstellt von: Claude, auf Auftrag aus Issue #6. Route: `#/video/<Video-ID>/video`, als Reiter „Video mit Faktencheck“ neben „Aussagen“ und „Berichte“. Erscheint nur, wenn strukturierte Daten vorliegen und `scope.videoUrl` eine gültige YouTube-Adresse mit derselben Video-ID ist.

### Datenschutz und Sicherheit

- **Bis zum Klick auf „Video laden“ keine Verbindung zu YouTube oder Google**: keine Skripte, keine iframes, keine Vorschaubilder. Der Hinweis vor dem Laden nennt die mögliche Datenübertragung an YouTube/Google.
- Erst danach wird die offizielle YouTube IFrame Player API (`https://www.youtube.com/iframe_api`) geladen; der Player läuft im erweiterten Datenschutzmodus (`youtube-nocookie.com`). Kein API-Schlüssel, kein eigener Server, keine YouTube Data API.
- Ein Klick auf eine Zeitmarke **lädt das Video nicht**, solange es nicht freigegeben ist; die gewählte Stelle wird gemerkt und nach dem Laden angesprungen.
- Die Zustimmung gilt nur für den aktuellen Seitenaufruf und wird nicht gespeichert. Lokal (nur im eigenen Browser) gemerkt werden ausschließlich Layout und Mitscrollen.
- `index.html` setzt eine Content-Security-Policy: Skripte nur von der eigenen Seite und `www.youtube.com`, iframes nur von `www.youtube-nocookie.com`, Datenabrufe nur von der eigenen Seite.
- Alle Texte aus den Daten werden maskiert; die Video-ID wird nur als elfstellige ID aus einer HTTPS-YouTube-Adresse übernommen.

### Synchronisation

- Grundlage sind ausschließlich die vorhandenen Fundstellen in `aussagen.json` (`startSeconds`, `endSeconds`, `precision`). **Es werden keine Zeiten erfunden oder verändert.**
- Jede Fundstelle ist ein Listeneintrag. Wiederholungen derselben Aussage erscheinen als „Vorkommen n von m“; überlappende Aussagen werden gleichzeitig hervorgehoben.
- „Jetzt im Video“: Playerzeit liegt im angegebenen Bereich. „In der Nähe (Zeitmarke ungefähr)“: Playerzeit liegt nur im Toleranzbereich (Ungefähr ±5 s, Kontrolliert ±1 s). Die Toleranz ist reine Anzeige; sie verändert keine Daten.
- Unklare Zeitangaben werden sichtbar markiert (fehlendes Ende, Ende vor Beginn, außerhalb der Laufzeit, unbekannte Präzision, keine Zeitmarke). Fundstellen ohne verwendbare Zeitmarke stehen in einer eigenen Liste und werden nicht synchronisiert.
- Ohne Zuordnung erscheint eine neutrale Meldung mit Sprung zur nächsten Fundstelle. Der Hinweis „Teilbestand“ bleibt sichtbar.
- Abfrage der Playerzeit: 4× je Sekunde bei Wiedergabe, 1× je Sekunde bei Pause/Bereit, keine Abfrage nach Videoende oder Fehler. Sprünge (Seek) werden an der Zeitdifferenz erkannt, auch beim Ziehen im Pausenzustand.

### Bedienung und Barrierefreiheit

- Layout umschaltbar: nebeneinander / untereinander (ab 900 px Breite; darunter immer untereinander).
- „Großansicht“: bildschirmfüllender Dialog mit Video und Aussagen; Fokus bleibt im Dialog (übrige Seite `inert`), Schließen per Knopf oder Escape. Der Player wird dabei nicht neu geladen.
- Scrollbare Aussagenliste; Mitscrollen abschaltbar. Hat der Nutzer die Liste in den letzten vier Sekunden selbst bewegt, wird nicht automatisch gescrollt (außer nach einem Sprung).
- Zeitmarken sind Knöpfe mit beschreibender Beschriftung; die Hervorhebung steht zusätzlich als Text. Änderungen der aktuellen Aussagen werden über eine höfliche Live-Region angesagt, die laufende Zeit nicht.
- Je Eintrag: Bewertung oder Status („noch ohne Bewertung“), Begründung, Grundlage, Sprecher- und Aussagezuordnung mit Sicherheit, Zeitgrundlage, Quellen, offene Fragen, Link zur vollständigen Prüfung und zur Stelle auf YouTube.
- Fallback: Bei Playerfehlern (z. B. Einbettung durch den Kanal verboten), blockiertem Skript oder Zeitüberschreitung erscheint ein Hinweis mit Link zum Video auf YouTube. Die Liste bleibt immer lesbar.

### Tests

- `node --test site/sync-test.js` – 15 Tests der Synchronisationslogik mit gesteuerter Uhr: genaue und ungefähre Zeitmarken, überlappende Aussagen, Wiederholungen, Pause, Seek vor/zurück (auch pausiert), Pufferung, doppelte Geschwindigkeit, Videoende, Fehler, Aufräumen, ungültige Zeitangaben und die echten Projektdaten. Läuft im Workflow.
- `node site/browser-test.js` – 16 Browserprüfungen mit Playwright/Chromium und einem nachgebildeten YouTube-Player (alle fremden Anfragen werden abgefangen): keine externe Anfrage vor dem Klick, nur `iframe_api` danach, `youtube-nocookie.com` als Host, Synchronisation, Sprung per Klick, Pause/Ende, Layouts, Großansicht mit Fokus und Escape, Fallback bei Fehler 150 und blockiertem Skript, Mobilansicht ohne horizontales Scrollen, bestehende Seiten. Nicht im Workflow, weil der Runner kein Playwright mitbringt.

### Bekannte Grenzen

- **Der echte YouTube-Player wurde nicht getestet**: In der Entwicklungsumgebung war YouTube nicht erreichbar. Zu prüfen sind insbesondere, ob die Content-Security-Policy alle Player-Skripte zulässt, ob das Video einbettbar ist und ob Autoplay nach dem Laden greift (sonst einmal Play drücken).
- Alle derzeitigen Zeitmarken sind „Ungefähr“ (aus Untertiteltext eingegrenzt). Die Hervorhebung kann deshalb einige Sekunden neben dem tatsächlichen Gesagten liegen.
- Der Teilbestand deckt nur wenige Stellen der rund drei Stunden ab; die meiste Zeit erscheint die neutrale Meldung.
- Drückt man Escape, während der Fokus im YouTube-Player liegt, verarbeitet YouTube die Taste; dann den Knopf „Großansicht schließen“ nutzen.
- Die Zustimmung wird bewusst nicht gespeichert; bei jedem Aufruf ist ein Klick nötig.

### Vorschläge zur Schemaerweiterung (nicht umgesetzt, Entscheidung bei Codex)

Die Video-Ansicht kommt mit dem bestehenden Schema 2 aus. Optional hilfreich wären:

1. **Kapitelzeiten in `aussagen.json`** (z. B. `chapters: [{ number, startSeconds, endSeconds }]`), damit die Ansicht auch ohne Aussage anzeigen kann, in welchem Themenabschnitt man sich befindet. Heute stehen Kapitelzeiten nur in den Markdown-Berichten.
2. **Feinere Zeitpräzision je Fundstelle**, etwa eine optionale Unsicherheit in Sekunden (`toleranceSeconds`), statt einer festen Anzeige-Toleranz je Präzisionsstufe.
3. **Kennzeichnung der Abdeckung je Zeitbereich** (welche Bereiche systematisch geprüft wurden), damit die neutrale Meldung zwischen „geprüft, nichts gefunden“ und „noch nicht geprüft“ unterscheiden kann.

