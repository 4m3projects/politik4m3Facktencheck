# Migration der ersten strukturierten Faktenchecks

Stand: 17.11.2026. Die reguläre JSON-Struktur und Berichtserzeugung sind für weitere Videos verwendbar. Die nachstehenden Abschnitte dokumentieren den veröffentlichten Erststand mit drei Altpunkten. Zusätzlich ist nun Kapitel 1 mit drei weiteren Altpunkten übertragen; keine automatische Gesamtumstellung.

## Erhaltener Bestand

Die 14 bisherigen Berichte und die MIT-Lizenz bleiben gegenüber dem Herkunftscommit bb6e666961baf719d02671a7ad2f439086f3c530 unverändert. Die ursprünglichen zehn strukturierten Aussagen bleiben erhalten; der erweiterte aktuelle Datensatz befindet sich in [aussagen.json](../faktenchecks/mlxFA9T88I0/strukturiert/aussagen.json). [Übersicht](../faktenchecks/mlxFA9T88I0/strukturiert/README.md), [Herkunftsvergleich](../faktenchecks/mlxFA9T88I0/strukturiert/migration.md) und [Statistik](../faktenchecks/mlxFA9T88I0/strukturiert/statistik.json) werden daraus erzeugt.

| Herkunft | Aussage-IDs mit Videopräfix | Inhalt |
| --- | --- | --- |
| C03-P07 | A0001–A0004 | Registrierungsabstand, Erwerb von whisky.de, Preis von whisky.com, historische Rangposition |
| C06-P09 | A0005–A0008 | Renditemöglichkeit, Maschineninvestitionen, Produktivitätsstagnation, späterer Rückgang |
| C08-P03 | A0009–A0010 | Nennung von Abstimmungen in Artikel 20, weitergehende Rechtsfolgerung |

Bewertungen, Begründungen, Quellenzuordnungen, Sprecherkandidaten und deren Sicherheit, Herkunftstexte, IDs und Migrationsentscheidungen bleiben erhalten. Frühere Bezeichnungen des Strukturversuchs in Recherchehinweisen wurden redaktionell in Strukturübernahme geändert; daraus wird keine neue Quellenprüfung. Die eigene frühere Darstellung ist mit Kapitelhash und vollständigem Prüfpunkttext dokumentiert. Kein Transkript oder fremder Originalwortlaut wurde übernommen.

Zehn Einzelaussagen sind nicht zehn migrierte Altpunkte. Im veröffentlichten Ausgangsstand waren es **drei von 99** mit **96 noch nicht migrierten Punkten**. Nach Kapitel 1 sind es **sechs von 99** und **93 noch nicht migrierte Punkte**. Die Statistik beschreibt ausschließlich diese strukturierte Auswahl.

## Präzisierte ungefähre Fundstellen

| Aussage | Neuer Textbereich |
| --- | --- |
| A0001 | 00:56:53–00:57:01 |
| A0002 | 00:56:28–00:56:53 |
| A0003 | 00:57:54–00:58:08 |
| A0004 | 00:58:08–00:58:13 |
| A0005 | 02:00:35–02:01:12 |
| A0006 | 02:03:17–02:03:24 |
| A0007 | 02:03:05–02:03:17 |
| A0008 | 02:03:25–02:03:35 |
| A0009 | 02:19:34–02:19:46 |
| A0010 | 02:19:46–02:19:54 |

Die Bereiche wurden anhand der vorhandenen automatischen Originaluntertitel eingegrenzt, ohne Audio-/Videokontrolle. Sie bleiben Ungefähr. timeHistory erhält jeweils den bisherigen breiteren Suchbereich, dessen Präzision und vollständigen Hinweis. Bei A0008 wird das frühere Ende 02:03:25 dokumentiert und der Anschluss bis 02:03:35 eingeschlossen. Sprechergrundlagen und Sachbewertungen sind davon unabhängig.

## Ergebnis und Grenzen

Weiterhin zehn Aussagen: drei abgeschlossen, fünf offen und zwei in Bearbeitung. Die abgeschlossenen Teilbefunde sind zweimal Belegt und einmal Irreführend / Kontext fehlt. Keine neue Webrecherche oder Vollverifikation. Die offenen Sachfragen bleiben direkt zugeordnet.

Alle zehn Sprecherzuordnungen bleiben Plausibel mit Kandidat Horst Lüning. Null wurden bestätigt. Metadaten benennen Ben und Horst Lüning als Beteiligte, aber die konkreten Passagen sind nicht sicher identifiziert. Die vorhandenen 468 JSON3-Wechselereignisse liefern keine stabilen Personenlabels. Reguläre Personenstatistiken zählen deshalb aktuell keine bestätigten Zurechnungen; das ist keine Glaubwürdigkeitsbewertung.

Zusätzliche Vorkommen und bestätigte Wiederholungen derselben Person werden separat berechnet. Gemeinsame ausdrückliche Zustimmung zählt je Person höchstens einmal und im Video einmal. Die Sonderfälle werden synthetisch getestet; im realen Bestand wurden keine zusätzlichen Wiederholungen oder Selbstkorrekturen erfunden.

## Übernommene Funktionen und Bereinigung

Die Sonderablage und ihre alten Test-/Abschlussberichte wurden aus dem Projekt entfernt. Daten, Herkunft und methodische Regeln sind in die reguläre Ablage und Entwicklerdokumentation integriert. Die regulären Skripte heißen Factcheck-Common.ps1, Build-Factcheck.ps1 und Test-Factcheck.ps1. Die bisherigen Regeln zu Quellen, Sprecherzuordnung, sechs Bewertungskategorien, Status, Null-Nennern und Veröffentlichungsschutz gelten weiter. Es gibt keine zusätzlich zu pflegende Experimentstruktur.

## Nächste Migrationen

Im veröffentlichten Ausgangsstand waren 96 Altpunkte offen. Davon sind drei aus Kapitel 1 übertragen; die noch übrigen 93 Altpunkte müssen einzeln redaktionell geprüft, in eigenständig bewertbare Aussagen zerlegt, mit Herkunft und gelesenen Quellen verknüpft sowie auf Wiederholungen untersucht werden. Bestehende Sammelurteile und Namen nicht automatisch bestätigen. Den Umfang nach jeder Übernahme aktualisieren und Berichte neu erzeugen. Zusätzliche reale Fälle von Wiederholung, Zustimmung und Selbstkorrektur verdienen eine manuelle Gegenkontrolle. Die bisherigen Originalberichte werden auch bei weiteren Übernahmen nicht stillschweigend überschrieben.

## Überprüfung

Die automatischen Prüfungen umfassen Datenstruktur, Fakten- und Personenstatistik, Sprecher- und Rollenstatus, Wiederholungen, gemeinsame Zustimmung, Selbstkorrekturen, Zeithistorie, neue Videos ohne Altbestand, Herkunftshashes, Quellenverweise, unveränderte bisherige Berichte, deterministische Artefakte, sämtliche relativen Markdown-Links und Veröffentlichungsschutz für Arbeitsbaum und Index. Zusätzlich werden die synthetischen Beispiele der Entwicklerdokumentation validiert. 78 Testfälle bestanden unter Windows PowerShell 5.1 und PowerShell 7. Auch Generator -Check unter beiden Versionen und die Publikationsprüfung bestanden. Vor jeder weiteren Veröffentlichung erneut prüfen.

## Erweiterung um Kapitel 1

[Redaktioneller Prüfbericht](KAPITEL01_MIGRATION.md): drei weitere Altpunkte, acht neue IDs A0011–A0018 und O0019 an der bestehenden A0007. Die folgenden Kapitel sind nicht weiter migriert. Die redaktionellen Entscheidungen zu A0011/A0012 (In Bearbeitung, ohne Endbewertung) und A0014 (Belegt, korrigierte Seitenangabe) sind akzeptiert. Dieser Stand ist zur Veröffentlichung freigegeben; die frühere Quellen- und Statusbilanz oben beschreibt den Ausgangsstand.
