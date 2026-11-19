# Zweite Bewertungsebene: Rhetorik und Darstellung

Erstellt von: Claude, ursprünglich für das Schwesterprojekt [politik4m3FaktencheckUngeskriptet](https://github.com/4m3projects/politik4m3FaktencheckUngeskriptet) (dort Issue #21) entwickelt und von dort übernommen. Fachliche Regel: [AGENTEN_RHETORIK.md](AGENTEN_RHETORIK.md).

Neben der sachlichen Faktenprüfung (Ebene 1, unverändert in `strukturiert/aussagen.json`) kann eine Videostelle **Hinweise zur Darstellung** erhalten: Wie wird etwas gesagt? Die Hinweise sind beschreibende KI-Einschätzungen. Sie ändern keine Faktenbewertung, fließen in keine Statistik ein, zählen nicht als Fehler und ergeben keine Note für Personen. Es gibt bewusst keine Gesamtkennzahl.

## Dateien

| Datei | Inhalt |
| --- | --- |
| `faktenchecks/<ID>/rhetorik.json` | Optional. Prüfstand des Videos auf Ebene 2 und alle Rhetorik-Hinweise. Fehlt sie, gilt das Video als „noch nicht geprüft“ – nicht als unauffällig. |
| `site/rhetoric.js` | Validierung und Auswertung, gemeinsam für Webseite und Tests. Liest Aussagen nur, verändert sie nie. |
| `site/rhetoric-test.js` | Node-Tests (im Workflow), fiktive Testdaten und echte Projektdaten |
| `site/rhetoric-browser-test.js` | Playwright-Test der Anzeige (lokal, nicht im Workflow) |

Die Datei liegt bewusst **neben** `video.json` und nicht in `strukturiert/`: Dort sind nur der Faktendatensatz und seine generierten Artefakte erlaubt. Die Publikationsprüfung lässt genau diesen einen neuen Pfad zu.

## Aufbau von `rhetorik.json`

```json
{
  "schemaVersion": 1,
  "videoId": "elfstellige ID, gleich dem Verzeichnisnamen",
  "review": {
    "status": "Noch nicht geprüft | Teilweise geprüft | Vollständig geprüft",
    "checkedOn": "JJJJ-MM-TT",
    "by": "prüfender Agent oder Mensch",
    "basis": "tatsächliche Grundlage der Durchsicht",
    "coverage": "tatsächlicher Umfang, z. B. n Hinweise zu m von k Aussagen",
    "limits": ["offene Grenzen; bei „Vollständig geprüft“ leer"],
    "history": [{ "date": "JJJJ-MM-TT", "by": "…", "change": "…" }]
  },
  "annotations": [{
    "id": "<ID>-R0001",
    "claimId": "<ID>-A0001 oder null",
    "feature": "abwertung | ironie | tunnelblick | pauschalisierung | emotionalisierung | gegenposition",
    "startSeconds": 0, "endSeconds": 10,
    "speaker": { "id": "SP01 oder null", "attribution": "Bestätigt | Plausibel | Ungeklärt", "basis": "…" },
    "observation": "eigene Paraphrase der Stelle, kein Zitat",
    "reason": "kurze Begründung",
    "context": "Zitat, Satireformat, Gesprächsrolle, Reaktion auf Vorwürfe …",
    "assessment": "Erkennbar | Möglich | Nicht beurteilbar",
    "reliability": "Hoch | Mittel | Niedrig",
    "uncertainty": "was offen ist",
    "missingInformation": null,
    "status": "KI-Vorschlag | Redaktionell bestätigt | Redaktionell verworfen",
    "basis": "worauf die Markierung beruht",
    "history": [{ "date": "JJJJ-MM-TT", "by": "…", "change": "Erstmalig erfasst …" }]
  }]
}
```

Regeln, die der Validator durchsetzt:

- Je Markierung ein Merkmal. Mehrere Merkmale an derselben Stelle sind getrennte Markierungen.
- Felder wie `verdict`, `score`, `points`, `penalty` oder `rating` sind verboten; unbekannte Felder werden abgewiesen.
- `claimId` und `speaker.id` müssen in `aussagen.json` existieren; die Zeitmarke muss in der Videolaufzeit liegen.
- **Tunnelblick** braucht `missingInformation.what` und eine Quelle (`source`, HTTPS) oder nachvollziehbare Begründung (`reasoning`), außer bei „Nicht beurteilbar“.
- „Vollständig geprüft“ ist nur ohne offene Grenzen zulässig.
- Jede Markierung braucht einen Erfassungseintrag in `history`. Korrekturen werden dort ergänzt; redaktionell verworfene Markierungen bleiben in den Daten, werden aber nicht angezeigt.

## Anzeige

- Im Kopf jeder betroffenen Aussage eine gestrichelte Kennzeichnung „Darstellung: <Merkmal>“ hinter der Faktenbewertung.
- Detailseite: unter Statistik und Verteilungsbalken ein eigener Kasten „Darstellung“ mit Anzahl je Merkmal; ein Klick filtert die Aussagen.
- Startseite: jede Videokarte zeigt Anzahl und Art der Hinweise und den Prüfstand; oben die Gesamtzahl der Darstellungshinweise.
- Unter der Faktenbewertung jeder betroffenen Aussage, gestrichelt und farblich abgesetzt, mit der Kennzeichnung „KI-Hinweis, getrennt von der Faktenbewertung“. Begründung, Kontext, Unsicherheit, Zuverlässigkeit, Grundlage und Verlauf sind aufklappbar.
- Ein-/ausblendbar über „Rhetorik-Hinweise anzeigen“ (die Wahl wird nur im eigenen Browser gemerkt) und filterbar nach Merkmal.
- Seitenleiste „Darstellung (zweite Ebene)“: Prüfstand, Umfang, Anzahl je Merkmal, Grundlage und Grenzen. Startseite: Prüfstand je Interview.
- Statistik, Verteilungsbalken und Kategorien der Faktenebene sind mit und ohne `rhetorik.json` identisch (Browsertest).

## Prüfstand je Video

Stand 19.11.2026: Für [das Frankreich-Video](../faktenchecks/nrnpcqzhd44/README.md) liegt eine teilweise Darstellungsprüfung vor. Bei Videos ohne `rhetorik.json` zeigt die Webseite „Noch nicht geprüft“. „Gesamtprüfung abgeschlossen“ verlangt einen abgeschlossenen Faktencheck im Vollbestand und eine vollständige Darstellungsprüfung ohne offene Abdeckungslücken.

## Weiterarbeit

1. Neue oder bestehende Videos nur nach eigenem Auftrag einordnen; Grundlage sind die Prüfnotizen der Faktenebene und, soweit zugänglich, der Wortlaut.
2. Stellen ohne Faktenaussage (reine Rhetorik ohne prüfbaren Inhalt) können mit `claimId: null` erfasst werden.
3. Tunnelblick nur mit konkreter Gegeninformation und Quelle ergänzen.
4. Eine etwaige Rhetorik-Kennzahl braucht ein eigenes Konzept und ausdrückliche Freigabe (siehe Regel 2 in AGENTEN_RHETORIK.md).
