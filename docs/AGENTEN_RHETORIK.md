# Dauerhafte Agentenregel: Zwei getrennte Bewertungsebenen

Diese Anleitung gilt für alle Video- und Aussageprüfungen. Die Darstellungsprüfung wird unabhängig von der Faktenbewertung dokumentiert. Konkrete Hinweise werden bei Bedarf einzelnen Aussagen oder weiteren Videostellen zugeordnet.

## Wann die Gesamtprüfung abgeschlossen ist

- Prüfe die Sachpunkte über die gesamte Folge. Der strukturierte Vollbestand hat weder offene noch laufende Prüfpunkte. Eine begründete abschließende Einordnung kann Beleggrenzen enthalten.
- Prüfe die Darstellung über die gesamte Laufzeit einschließlich Vor- und Abspann auf sprachliche Mittel, Stimmführung, Bildauswahl, Einblendungen, Schnitt und Ton, soweit sie die Aussage oder den Eindruck beeinflussen. Dokumentiere tatsächliche Grundlage und Abdeckung in `rhetorik.json`. Bei geprüfter Darstellung ohne Hinweise kann `annotations` leer sein.
- Bei einer bloßen Untertiteldurchsicht, Bildstichproben oder konkreten offenen Abdeckungslücken gilt eine begonnene Darstellungsprüfung als `Teilweise geprüft`. Halte in `review.limits` fest, was noch kontrolliert werden muss. Bei `Vollständig geprüft` sind diese Kontrollen durchgeführt und `review.limits` ist leer.
- Berichte den Gesamtabschluss erst, wenn beide Ebenen vollständig geprüft sind. Nenne sonst beide Stände ausdrücklich, zum Beispiel „Erfasste Faktenpunkte geprüft. Darstellung teilweise geprüft.“

## Ebene 1: Sachliche Faktenprüfung (unverändert)

Bestehende Kategorien, Status, Quellen, Aussage-IDs, Zeitmarken und Bewertungen bleiben bestehen: beispielsweise **Belegt**, **Teilweise belegt**, **Irreführend / Kontext fehlt**, **Widerlegt**, **Nicht ausreichend belegbar** sowie **Meinung / Prognose**. Vorhandene projektspezifische Kategorien und Berechnungen nicht umbenennen, löschen oder stillschweigend verändern. Meinungen sind nicht automatisch Fehler.

## Ebene 2: Rhetorik und Argumentationsweise (neu, zusätzlich)

Bei einer konkreten Videostelle kann die KI unabhängig von Ebene 1 folgende Merkmale als **beschreibende Hinweise** kennzeichnen:

- **Abwertende Sprache / persönliche Herabsetzung:** Trennung zwischen scharfer Sachkritik, Spott über Positionen und Angriffen auf Personen; Begründung mit konkreter Stelle.
- **Ironie / Sarkasmus / Satire:** als Stilmittel beschreiben, nicht automatisch negativ werten; Mehrdeutigkeit angeben.
- **Möglicher Tunnelblick / selektive Darstellung:** nur markieren, wenn ein **konkret benennbares, relevantes** Gegenargument oder eine entscheidende Information für die gezogene Schlussfolgerung fehlt. Nicht aus Kürze oder bloßem Fehlen beliebiger Perspektiven ableiten.
- **Pauschalisierung:** prüfen, ob Aussagen unzulässig von Einzelnen auf Gruppen verallgemeinern.
- **Emotionalisierung:** beobachtbare rhetorische Mittel benennen; emotionale Sprache allein ist kein Sachfehler.
- **Faire bzw. verzerrte Wiedergabe von Gegenpositionen:** konkrete Bezugsaussage, Kontext und mögliche Auslassungen dokumentieren.

## Verbindliche Regeln

1. **Beide Ebenen getrennt führen und anzeigen.** Eine sachlich richtige Aussage kann rhetorisch abwertend sein; eine sachlich falsche Aussage kann höflich formuliert sein. Die rhetorische Kennzeichnung ändert **niemals automatisch** die Faktenbewertung.
2. Ebene 2 ist **kein zusätzlicher Fehlerpunkt** im bestehenden Faktencheck-Index, keine neue Wahr/Falsch-Kategorie und keine automatische moralische Verurteilung. Eine etwaige spätere Rhetorik-Kennzahl braucht ein eigenständiges, transparentes Konzept und ausdrückliche Freigabe.
3. Jede Markierung enthält mindestens Video-ID, Zeitmarke, Sprecher, konkrete eigene Paraphrase/Beobachtung, Merkmal, kurze Begründung und Unsicherheit bzw. Zuverlässigkeit. Bei Tunnelblick zusätzlich die fehlende relevante Gegeninformation und eine Quelle bzw. nachvollziehbare Begründung nennen.
4. **Beobachtung und Wertung trennen.** Statt „Person X ist manipulativ“ beschreiben: „Diese Stelle verwendet eine abwertende Formulierung“ oder „Ein relevantes Gegenargument wird hier nicht behandelt“. Keine unbelegten Motive unterstellen.
5. **Kontext beachten:** Zitat, Selbstironie, satirisches Format, Gesprächsrolle, Reaktion auf Vorwürfe und Ausschnittlänge. Zitate nicht dem Zitierenden als eigene Herabsetzung zuschreiben.
6. **Keine erzwungene Vollständigkeit:** Wenn kein auffälliges Merkmal erkennbar ist, keine Kennzeichnung erfinden. Bei fehlendem Kontext „nicht beurteilbar“ statt Gewissheit.
7. **Gleiche Maßstäbe für alle:** Originalinterviews, Faktenchecks, Reaktionen und eigene Politik4M3-Videos. Keine Sonderbehandlung nach Kanal, Person oder politischer Position.
8. **UI-Ziel:** Sachliche Einordnung und Rhetorik-Hinweise nebeneinander bzw. getrennt sichtbar; Rhetorik als ein-/ausblendbare zusätzliche Ebene, ohne Faktenkategorien zu verdrängen. Hinweise als KI-Einschätzung kennzeichnen; redaktionelle Prüfung und Korrektur ermöglichen. **Deutlich sichtbar auch in Übersichten:** Die Aussage selbst trägt eine klar als Darstellung benannte Kennzeichnung (z. B. „Darstellung: Abwertende Sprache“); die Detailseite zeigt neben der Faktenstatistik die Anzahl der Hinweise je Merkmal, und jede Videokarte der Startseite zeigt Anzahl und Art der Hinweise sowie den Prüfstand. Das sind Zählungen je Merkmal, kein Index und keine Personennote; sie stehen getrennt von der Faktenstatistik.
9. **Technik:** Bestehende strukturierte Aussage-Dateien und Validierung vor Änderung prüfen. Neue Rhetorikdaten additiv und rückwärtskompatibel speichern (z. B. optionale, eigene Annotationen mit Referenz auf stabile Aussage-ID); vorhandene Kategorien, Statistik und Migrationen unangetastet lassen. Umsetzung erst nach Abstimmung mit laufenden Agentenarbeiten und Tests.
10. **Vergleich mit externen Indizes:** Kategorien wie Sinans „Schwurbel-Index“ können Anregung sein, sind aber kein übernommenes Punktesystem; eigene Definitionen und Grenzen transparent machen.

## Prüffälle

- „Belegt“ + „abwertende Sprache“ kann zugleich angezeigt werden, ohne den Faktenstatus zu ändern.
- „Widerlegt“ + „sachlicher Ton“ ist möglich, ohne Rhetorikfehler zu erfinden.
- „Meinung / Prognose“ + „Ironie“ ist möglich.
- Fehlende Gegenposition ohne konkreten Bezug wird **nicht** automatisch als Tunnelblick markiert.
- Bestehende Daten ohne Rhetorikannotation bleiben valide und in allen bisherigen Ansichten auswertbar.

## Umsetzung

Datenmodell, Validierung, Anzeige und aktueller Prüfstand je Video: [RHETORIK.md](RHETORIK.md) (Claude).
