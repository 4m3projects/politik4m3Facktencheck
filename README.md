# Politik 4M3 Faktencheck

Ein offenes Lernprojekt für quellenbasierte, deutschsprachige Faktenchecks zu einzelnen YouTube-Videos. Veröffentlicht werden unsere eigenen Beschreibungen, Interpretationen und begründeten Bewertungen mit Zeitstempeln und Quellenlinks.

## Vorhandene Auswertung

- [Horst Lüning bei Ben – Wirtschafts- und Staatsfinanzthesen](faktenchecks/mlxFA9T88I0/README.md)
  Zehn Kapitel, 99 Prüfpunkte. Übernommener Arbeitsstand vom 17.11.2026 mit offenen Teilprüfungen; keine vollständige unabhängige Verifikation aller Einzelheiten.

## Ein neues Video prüfen

Dieses Verzeichnis als Projekt öffnen und eine einzelne YouTube-URL an den Agenten senden. Der Agent arbeitet nach [AGENTS.md](AGENTS.md), liest die verfügbare Grundlage vollständig, recherchiert die Behauptungen und schreibt die öffentlichen Markdown-Berichte.

[Beispielauftrag für einen unabhängigen neuen Durchlauf](docs/BEISPIELAUFTRAG.md)

Private Beschaffung unter Windows, mit bereits vorhandenen Tools:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Import-YouTubeTranscript.ps1 -Url "https://www.youtube.com/watch?v=VIDEO_ID"
```

Das Skript nutzt externe portable yt-dlp-/Deno-Dateien aus dem benachbarten Downloadprojekt, einen angegebenen Toolpfad oder installierte Programme. Bezugsquellen: [yt-dlp](https://github.com/yt-dlp/yt-dlp), [Deno](https://github.com/denoland/deno). Werkzeuge werden nicht mit diesem Repository verteilt. Metadaten und Untertitel landen ausschließlich außerhalb des Git-Arbeitsbaums; keine Video-, Audio- oder Bilddateien werden angefordert. Der Agent erstellt anschließend die Recherchetexte – das Importskript erledigt keinen Faktencheck.

## Öffentlich und privat strikt trennen

**Öffentlich:** unsere eigenständig verfassten Analyse- und Methodiktexte, eigener Code, minimale Quellenangaben, Zeitmarken und externe Links.

**Privat, außerhalb dieses Repositorys:** sämtliche Transkripte und Untertitel, rohe Metadaten, Originalbeschreibungen und andere heruntergeladene Quellen. Sie werden weder kopiert noch angehängt, eingebettet oder in der Git-Historie abgelegt. Auch Thumbnails und Screenshots gehören nicht zur Veröffentlichung.

Öffentliche Prüfpunkte enthalten unsere kurze Beschreibung der zu prüfenden These. Die Zeitmarke verweist auf das Original. Keine wörtlichen Passagen aus Videos oder Recherchequellen. Eigene Formulierungen werden auf ausreichenden Abstand zum Original geprüft.

[Veröffentlichungsregeln und Grenzen der automatischen Prüfung](docs/VEROEFFENTLICHUNG.md)

## Vor einem Commit prüfen

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Test-Publication.ps1
```

Der Prüfer kontrolliert den Arbeitsbaum und Git-Index auf zulässige Dateipfade, Rohdatenmuster und typische Transkriptzeilen. Er ist ein technisches Hilfsmittel; eine Rechtefreigabe oder vollständige inhaltliche Prüfung kann er nicht leisten.

## Lizenz und Verantwortung

Die bestehenden [MIT-Lizenzbedingungen](LICENSE) gelten für unsere eigenen Projektbeiträge im Umfang der daran vorhandenen Rechte. Verlinkte Videos und Drittquellen behalten ihre jeweiligen Rechte; sie werden nicht unter MIT gestellt. Keine Verbindung oder Zustimmung der untersuchten Kanäle wird behauptet.

KI-unterstützte Auswertungen können Fehler enthalten. Jede Auswertung nennt Grundlage, Datum, Reichweite der Recherche und offene Punkte. Begründete Korrekturen mit konkretem Prüfpunkt und Quelle sind willkommen.

## Herkunft der Erstfassung

Die Erstübernahme wurde aus einer vorhandenen privaten Arbeitsauswertung erstellt und für dieses Repository redaktionell aufbereitet. Ihre Recherche wurde bei dieser Übernahme nicht erneut vollständig durchgeführt. Der Stand bleibt ausdrücklich eine Teilprüfung.
