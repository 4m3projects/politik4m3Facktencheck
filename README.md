# Politik4M3 Faktencheck

**Unabhängige, quellenorientierte Faktenchecks zu politischen YouTube-Gesprächen und den Reaktionen darauf.**

## Zur Webseite

### **[Faktenchecks ansehen →](https://4m3projects.github.io/politik4m3Facktencheck/)**

Die Webseite ist der zentrale Zugang zu allen Videoanalysen, Aussagen, Quellen und Berichten. Sie wird bei jeder Änderung automatisch aus den Dateien dieses Repositorys erzeugt.

## Was die Webseite zeigt

- **Jede geprüfte Aussage einzeln**, in eigenen Worten zusammengefasst, mit Zeitmarke zum Original, Sprecherzuordnung, Bewertung und Begründung.
- **Sechs feste Bewertungen** mit Farbe und Text. Meinungen und Prognosen werden als solche gekennzeichnet, nicht als richtig oder falsch. Was sich nicht prüfen lässt, steht als „Nicht überprüfbar“ mit Grund da. Eine nicht belegte Aussage gilt nicht automatisch als falsch.
- **Quellen mit direktem Link**, Datenstand und Abrufdatum. Als Beleg zählt nur, was tatsächlich gelesen wurde.
- **Video mit Faktencheck:** Auf Wunsch spielt die Seite das Originalvideo ab und blendet die passenden Aussagen zeitgleich ein. YouTube wird erst nach einem Klick geladen.
- **Faktenampel** je Video, berechnet aus den Einzelbewertungen und nie von Hand gesetzt ([Regeln](docs/AMPEL.md)).
- **Originale und Reaktionen:** Reaktionsvideos erscheinen beim jeweiligen Original, mit eigener Prüfung und Abgleich der Aussagen ([Erklärung](docs/REAKTIONSVIDEOS.md)).
- **Themen:** Aussagen verschiedener Videos zum selben Thema sind gebündelt ([Wissensdatenbank](docs/WISSENSDATENBANK.md)).

## Projektstand

- **Campertalk mit Sinan (SinansWoche) bei IT Camper:** 170 erfasste Aussagen; 104 abgeschlossen, 48 mit Grund nicht überprüfbar, 18 noch nicht geprüft.
- **Reaktion „Alfred räumt auf“ über dieses Gespräch:** 66 erfasste Aussagen; 62 abgeschlossen, 4 mit Grund nicht überprüfbar.
- Beide Prüfungen sind **Teilbestände**: Nicht jede Nebenbemerkung ist erfasst, deshalb gibt es keine Bilanz des ganzen Videos.
- Faktenchecks zu Interviews bei „{ungeskriptet} by Ben“ (Horst Lüning, Naomi Seibt) stehen auf der Schwesterseite **[Faktencheck Ungeskriptet](https://4m3projects.github.io/politik4m3FaktencheckUngeskriptet/)**. Beide Seiten sind über das Menü am Seitentitel verbunden. Die älteren Daten dazu bleiben hier im Repository ([Begründung](docs/WEBSEITE.md), Abschnitt „Ausgeblendete Videos“).
- Bewertungen und Berichte können überarbeitet und korrigiert werden.

## Mitwirken

Fehlerhinweise und Verbesserungsvorschläge sind über [GitHub Issues](https://github.com/4m3projects/politik4m3Facktencheck/issues) willkommen, am besten mit der Aussage-ID (zum Beispiel `bPXMY7Reeek-A0001`) und einer Quelle.

Die Prüfungen entstehen KI-gestützt. Mehrere KI-Agenten prüfen sich gegenseitig öffentlich auf GitHub; Änderungen kommen über Pull Requests, die endgültige Freigabe liegt beim Projektverantwortlichen. KI-gestützte Auswertungen können Fehler enthalten. Jede Auswertung nennt Grundlage, Datum, Rechercheumfang und offene Punkte.

[Agentenanweisungen und Methodik](AGENTS.md) · [Datenmodell](docs/STRUKTURIERTE_DATEN.md) · [Webseite](docs/WEBSEITE.md) · [Rhetorik-Ebene](docs/RHETORIK.md) · [Veröffentlichung und Rechte](docs/VEROEFFENTLICHUNG.md) · [Beispielauftrag](docs/BEISPIELAUFTRAG.md)

## Technik

Jedes Video liegt unter `faktenchecks/<Video-ID>/`. Gepflegt wird nur `strukturiert/aussagen.json`; Übersicht, Berichte und Statistik werden daraus erzeugt und nicht von Hand bearbeitet. Die Webseite (`site/`) ist eigener Code ohne Fremdbibliotheken, Tracker oder externe Schriften und wird über GitHub Pages aus `main` veröffentlicht.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Import-YouTubeTranscript.ps1 -Url "https://www.youtube.com/watch?v=VIDEO_ID"
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Build-Factcheck.ps1 -VideoId VIDEO_ID
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Test-Factcheck.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Test-Publication.ps1
```

Der Import nutzt externes [yt-dlp](https://github.com/yt-dlp/yt-dlp) und [Deno](https://github.com/denoland/deno) und legt Untertitel nur in einer privaten Ablage außerhalb des Repositorys ab. Generator und Tests benötigen nur PowerShell (5.1 oder 7) und Git.

## Veröffentlichung, Rechte und Lizenz

Öffentlich sind nur eigene Projekttexte, eigener Code, knappe bibliografische Angaben, Zeitmarken und externe Links. Transkripte, Untertitel, Originalbeschreibungen, Artikel, Audio, Video, Bilder und PDFs werden nicht veröffentlicht, auch keine wörtlichen Quellpassagen. Der [Publikationsprüfer](scripts/Test-Publication.ps1) kontrolliert das automatisch, ersetzt aber keine inhaltliche Rechteprüfung.

Die [MIT-Lizenz](LICENSE) gilt für eigene Beiträge. Sie lizenziert keine Drittquellen, verlinkten Videos oder Persönlichkeitsrechte.

*Ein unabhängiges Projekt von Politik4M3; keine offizielle Zusammenarbeit mit den untersuchten Kanälen oder den besprochenen Personen.*
