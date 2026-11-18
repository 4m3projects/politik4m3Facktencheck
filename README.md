# Politik 4M3 Faktencheck

Ein offenes Lernprojekt für quellenbasierte deutschsprachige Faktenchecks zu einzelnen YouTube-Videos. Wir veröffentlichen eigene Beschreibungen, Interpretationen und begründete Bewertungen mit Zeitstempeln und Quellenlinks.

## Vorhandener Datenbestand

- [Bisherige Auswertung: Horst Lüning bei Ben](faktenchecks/mlxFA9T88I0/README.md): 14 unveränderte Berichtdateien mit 99 ursprünglichen Prüfpunkten; übernommener Arbeitsstand mit offenen Teilprüfungen.
- [Strukturierte Auswertung desselben Videos](faktenchecks/mlxFA9T88I0/strukturiert/README.md): **57 von 99** ursprünglichen Prüfpunkten übertragen, darunter alle Altpunkte der Kapitel 1 bis 5. 272 Datensätze enthalten 270 Inhalte mit eigenem Aussagebezug und zwei ausschließlich erörterte Inhalte. 42 Altpunkte bleiben offen für die Migration; die Sachrecherche bleibt eine Teilprüfung. **Keine Statistik des vollständigen Videos.**
- [Redaktioneller Prüfbericht zu Kapitel 1](docs/KAPITEL01_MIGRATION.md).
- [Migration und Recherchegrenzen von Kapitel 2](docs/KAPITEL02_MIGRATION.md).
- [Migration, Einzelentscheidungen und Recherchegrenzen von Kapitel 3](docs/KAPITEL03_MIGRATION.md), Aktualisierung 18.11.2026. Baut auf dem noch ungeprüften Kapitel-2-Draft auf; unabhängige Gegenprüfung ausstehend.
- [Migration und Recherchegrenzen von Kapitel 4](docs/KAPITEL04_MIGRATION.md), 18.11.2026, bearbeitet von Claude; unabhängige Gegenprüfung ausstehend.
- [Migration und Recherchegrenzen von Kapitel 5](docs/KAPITEL05_MIGRATION.md), 18.11.2026, bearbeitet von Claude; unabhängige Gegenprüfung ausstehend.
- [Herkunft und Migration](docs/MIGRATION.md) und [Datenmodell / Entwickleranleitung](docs/STRUKTURIERTE_DATEN.md).

## Ein Video hinzufügen und bearbeiten

1. Eine einzelne YouTube-URL im Projekt öffnen und nach [AGENTS.md](AGENTS.md) analysieren. Private Quellen mit dem Importskript außerhalb des Repositorys erfassen.
2. Die gesamte verfügbare Grundlage lesen. Prüffähige Aussagen in eigenen Worten unter `faktenchecks/<Video-ID>/strukturiert/aussagen.json` erfassen. Die Entwickleranleitung enthält ein vollständiges Beispiel für neue Videos ohne Altpunkte.
3. Sprecher und Aussagebezug getrennt prüfen. Unsichere Kandidaten bleiben plausibel oder ungeklärt. Für jede Tatsachenbewertung tatsächliche Belege lesen, zuordnen und den Bearbeitungsstatus ehrlich führen.
4. Übersicht, Kapitelberichte und Statistik aus JSON erzeugen; die generierten Dateien nicht unabhängig bearbeiten.
5. Tests und Veröffentlichungsschutz prüfen. Commit und Push nur im Rahmen eines entsprechenden Auftrags.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Import-YouTubeTranscript.ps1 -Url "https://www.youtube.com/watch?v=VIDEO_ID"
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Build-Factcheck.ps1 -VideoId mlxFA9T88I0
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Build-Factcheck.ps1 -VideoId mlxFA9T88I0 -Check
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Test-Factcheck.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Test-Publication.ps1
```

Der Import nutzt externes [yt-dlp](https://github.com/yt-dlp/yt-dlp) und [Deno](https://github.com/denoland/deno), beispielsweise aus dem benachbarten Downloadprojekt. Andere Installationen lassen sich mit -YtDlpPath und -DenoPath angeben; Werkzeuge werden nicht mitgeliefert. Er lädt nur Untertitel und Arbeitsmetadaten in eine externe private Ablage. Keine Video-, Audio- oder Bilddateien. Keine globalen PATH- oder ExecutionPolicy-Änderungen. Generator und Tests benötigen lediglich PowerShell und Git, keine Datenbank, keinen Server und keine zusätzlichen Pakete. Windows PowerShell 5.1 und PowerShell 7 werden unterstützt.

[Beispielauftrag für eine unabhängige Analyse](docs/BEISPIELAUFTRAG.md)

## Projektstruktur

```text
AGENTS.md
README.md
LICENSE
docs/
  STRUKTURIERTE_DATEN.md
  MIGRATION.md
  VEROEFFENTLICHUNG.md
scripts/
  Import-YouTubeTranscript.ps1
  Factcheck-Common.ps1
  Build-Factcheck.ps1
  Test-Factcheck.ps1
  Test-Publication.ps1
faktenchecks/<Video-ID>/
  ... vorhandene Berichte bleiben erhalten ...
  strukturiert/
    aussagen.json
    README.md
    statistik.json
    migration.md
    berichte/kapitel-<Nummer>.md
```

## Veröffentlichung und Rechte

Öffentlich sind eigene Projekttexte, eigener Code, knappe bibliografische Angaben, Zeitmarken und externe Links. Private Transkripte, Untertitel, Rohmetadaten, Originalbeschreibungen, Artikel, Audio/Video, Bilder und PDFs bleiben außerhalb des Git-Arbeitsbaums. Auch wörtliche kurze Quellpassagen gehören nicht in öffentliche Berichte oder JSON. Keine versteckten Anhänge oder Rohdaten in der Git-Historie.

Der [Publikationsprüfer](scripts/Test-Publication.ps1) kontrolliert Arbeitsbaum und Git-Index getrennt. Nur die beiden ausdrücklich vorgesehenen JSON-Dateien pro strukturiertem Video sind erlaubt. Der Prüfer ersetzt keine inhaltliche Quellen- und Rechteprüfung. [Details zu Veröffentlichung und Grenzen](docs/VEROEFFENTLICHUNG.md).

## Lizenz und Mitarbeit

Die [MIT-Lizenz](LICENSE) gilt für eigene Beiträge im Umfang der vorhandenen Rechte. Sie lizenziert keine Drittquellen, verlinkten Videos oder Persönlichkeitsrechte um. Eine Zustimmung oder Verbindung der untersuchten Kanäle wird nicht behauptet.

KI-unterstützte Auswertungen können Fehler enthalten. Jede Auswertung nennt Grundlage, Datum, Rechercheumfang und offene Punkte. Korrekturen mit konkreter Aussage-ID und Quelle sind willkommen. Die Ersterfassung wurde aus einer vorhandenen privaten Arbeitsauswertung übernommen; dabei erfolgte keine erneute vollständige Sachrecherche.

Weitere Kapitel werden auf einem eigenen Branch bearbeitet und als Draft Pull Request gegen main zur unabhängigen Prüfung vorgelegt. Die Review-Diskussion erfolgt öffentlich auf GitHub. Ein Merge setzt die ausdrückliche Freigabe des Auftraggebers voraus. Kapitel 3 wurde im gesonderten Auftrag ergänzt; Kapitel 4 ist nicht begonnen.
