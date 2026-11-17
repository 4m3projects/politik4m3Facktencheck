[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..')).TrimEnd('\','/')
. (Join-Path $PSScriptRoot 'Factcheck-Common.ps1')
$script:baseline = ConvertFrom-FactcheckJson (Get-Content -LiteralPath (Join-Path $root 'faktenchecks/mlxFA9T88I0/strukturiert/aussagen.json') -Raw -Encoding UTF8)
$results = [Collections.Generic.List[string]]::new()
function Copy-Case { ConvertFrom-FactcheckJson (ConvertTo-FactcheckJson $script:baseline) }
function Check-True([bool]$Value,[string]$Message) { if (-not $Value) { throw $Message } }
function Expect-Rejection([scriptblock]$Body,[string]$Pattern) {
    $rejected = $false
    try { & $Body } catch {
        if ($_.Exception.Message -notmatch $Pattern) { throw ('Falscher Ablehnungsgrund: ' + $_.Exception.Message) }
        $rejected = $true
    }
    Check-True $rejected 'Ungueltiger Fall wurde nicht abgelehnt.'
}
function Case([string]$Name,[scriptblock]$Body) {
    & $Body
    $results.Add('PASS: ' + $Name)
}
Case 'Factcheckumfang und sechs Kategorien' {
    Assert-FactcheckData $script:baseline
    $s = Get-FactcheckStatistics $script:baseline
    Check-True ($s.uniqueStatements -eq 10 -and $s.selectedLegacyPoints -eq 3 -and $s.totalLegacyPoints -eq 99) 'Falscher Umfang.'
    Check-True (($script:baseline.scope.selectedLegacyIds -join ',') -ceq 'C03-P07,C06-P09,C08-P03') 'Andere Pruefpunkte als beauftragt migriert.'
    Check-True ($s.categories.Count -eq 6) 'Zusaetzliche/fehlende Kategorien.'
}
Case 'Status, Nenner und Kategorienzaehlung' {
    $s = Get-FactcheckStatistics $script:baseline
    Check-True ($s.statusCounts.Offen -eq 5 -and $s.statusCounts.'In Bearbeitung' -eq 2 -and $s.completedFacts -eq 3) 'Statuszahlen falsch.'
    Check-True ($s.categories[0].completedCount -eq 2 -and $s.categories[0].completedFactPercent -eq 66.7 -and $s.categories[2].completedFactPercent -eq 33.3) 'Anteile falsch.'
}
Case 'Doppelte Aussage-ID' { $d=Copy-Case; $d.claims[1].id=$d.claims[0].id; Expect-Rejection { Assert-FactcheckData $d } 'Aussage-ID' }
Case 'Identischer Aussageinhalt mit neuer ID' { $d=Copy-Case; $d.claims[1].description=$d.claims[0].description; Expect-Rejection { Assert-FactcheckData $d } 'Identische Aussage' }
Case 'Doppelte Vorkommens-ID' { $d=Copy-Case; $d.claims[1].occurrences[0].id=$d.claims[0].occurrences[0].id; Expect-Rejection { Assert-FactcheckData $d } 'Vorkommens-ID' }
Case 'Dasselbe Vorkommen nicht zweimal' {
    $d=Copy-Case; $o=($d.claims[0].occurrences[0] | ConvertTo-Json -Depth 10 | ConvertFrom-Json); $o.id='mlxFA9T88I0-O9000'
    $d.claims[0].occurrences += $o; Expect-Rejection { Assert-FactcheckData $d } 'Vorkommen doppelt'
}
Case 'Wiederholung erhoeht nur Vorkommen' {
    $d=Copy-Case; $o=($d.claims[0].occurrences[0] | ConvertTo-Json -Depth 10 | ConvertFrom-Json)
    $o.id='mlxFA9T88I0-O9000'; $o.startSeconds=3600; $o.endSeconds=3610; $d.claims[0].occurrences += $o
    $s=Get-FactcheckStatistics $d
    Check-True ($s.uniqueStatements -eq 10 -and $s.assertionOccurrences -eq 11 -and $s.additionalAssertionOccurrences -eq 1) 'Doppelzaehlung durch Wiederholung.'
}
Case 'Ungueltige Kategorie' { $d=Copy-Case; $d.claims[2].verdict='Gemischt'; Expect-Rejection { Assert-FactcheckData $d } 'gueltige Bewertung' }
Case 'Ungueltiger Status' { $d=Copy-Case; $d.claims[0].status='Spaeter'; Expect-Rejection { Assert-FactcheckData $d } 'Status ungueltig' }
Case 'Offene Aussage ohne erzwungenes Urteil' { $d=Copy-Case; $d.claims[0].verdict='Nicht ausreichend belegbar'; Expect-Rejection { Assert-FactcheckData $d } 'keine Endbewertung' }
Case 'Abgeschlossen erfordert Urteil' { $d=Copy-Case; $d.claims[2].verdict=$null; Expect-Rejection { Assert-FactcheckData $d } 'gueltige Bewertung' }
Case 'Abgeschlossene Tatsache braucht Quelle' { $d=Copy-Case; $d.claims[2].sourceRefs=@(); Expect-Rejection { Assert-FactcheckData $d } 'Sachquelle' }
Case 'Fehlender Quellenverweis' { $d=Copy-Case; $d.claims[2].sourceRefs[0].sourceId='S999'; Expect-Rejection { Assert-FactcheckData $d } 'Quellenverweis' }
Case 'Doppelte Quellen-ID' { $d=Copy-Case; $d.sources[1].id=$d.sources[0].id; Expect-Rejection { Assert-FactcheckData $d } 'Quellen-ID' }
Case 'Falsches Datum' { $d=Copy-Case; $d.sources[0].accessedOn='2026-02-30'; Expect-Rejection { Assert-FactcheckData $d } 'Abrufdatum' }
Case 'Nicht-HTTPS-Quelle' { $d=Copy-Case; $d.sources[0].url='file:///private'; Expect-Rejection { Assert-FactcheckData $d } 'HTTPS' }
Case 'Zeit ausserhalb der Laufzeit' { $d=Copy-Case; $d.claims[0].occurrences[0].endSeconds=11167; Expect-Rejection { Assert-FactcheckData $d } 'Bereichs' }
Case 'Rueckwaerts laufender Zeitbereich' { $d=Copy-Case; $d.claims[0].occurrences[0].endSeconds=10; Expect-Rejection { Assert-FactcheckData $d } 'vor seinem Anfang' }
Case 'Sekunden muessen ganzzahlig sein' { $d=Copy-Case; $d.claims[0].occurrences[0].startSeconds=1.5; Expect-Rejection { Assert-FactcheckData $d } 'ganzzahlig' }
Case 'Fehlende Herkunft' { $d=Copy-Case; $d.claims[0].legacyId='C09-P99'; Expect-Rejection { Assert-FactcheckData $d } 'Herkunftszuordnung' }
Case 'Kapitel stimmt mit Herkunft ueberein' { $d=Copy-Case; $d.claims[0].chapter=4; Expect-Rejection { Assert-FactcheckData $d } 'Kapitelzuordnung' }
Case 'Unbekannte Datenfelder zurueckweisen' {
    $d=Copy-Case; $d | Add-Member -NotePropertyName rawTranscript -NotePropertyValue 'synthetischer Test'
    Expect-Rejection { Assert-FactcheckData $d } 'unbekanntes Feld'
}
Case 'Untertitelmuster auch nach JSON-Dekodierung' {
    $d=Copy-Case; $d.claims[0].reason='[00:00:00] Synthetische Testzeile, kein Quellinhalt.'
    $encoded=ConvertTo-FactcheckJson $d
    Expect-Rejection { Assert-FactcheckData (ConvertFrom-FactcheckJson $encoded) } 'Rohquellen'
}
Case 'Medienmuster in JSON-Werten' {
    $d=Copy-Case; $d.claims[0].reason='data:image/png;base64,SYNTHETISCH'
    Expect-Rejection { Assert-FactcheckData $d } 'Medien'
}
Case 'Null abgeschlossene Tatsachen bedeutet keine Prozente' {
    $d=Copy-Case
    foreach ($c in $d.claims) { $c.status='Offen'; $c.verdict=$null; $c.openQuestions=@('Synthetische offene Testfrage.') }
    $s=Get-FactcheckStatistics $d
    Check-True ($s.percentageDenominator -eq 0 -and @($s.categories | Where-Object { $null -ne $_.completedFactPercent }).Count -eq 0) 'Division durch null oder falsche Nullprozente.'
}
Case 'Meinung getrennt vom Tatsachen-Nenner' {
    $d=Copy-Case; $d.claims[0].kind='Meinung'; $d.claims[0].status='Abgeschlossen'; $d.claims[0].verdict='Meinung / Prognose'
    $s=Get-FactcheckStatistics $d
    Check-True ($s.kindCounts.Meinung -eq 1 -and $s.percentageDenominator -eq 3 -and $s.categories[5].completedCount -eq 1 -and $null -eq $s.categories[5].completedFactPercent) 'Meinung verfaelscht Nenner.'
}
Case 'Prognose getrennt vom Tatsachen-Nenner' {
    $d=Copy-Case; $d.claims[0].kind='Prognose'; $d.claims[0].status='Abgeschlossen'; $d.claims[0].verdict='Meinung / Prognose'
    $s=Get-FactcheckStatistics $d
    Check-True ($s.kindCounts.Prognose -eq 1 -and $s.percentageDenominator -eq 3) 'Prognose verfaelscht Nenner.'
}
Case 'Nicht ausreichend belegbar ist ein abgeschlossenes Ergebnis' {
    $d=Copy-Case; $d.claims[0].status='Abgeschlossen'; $d.claims[0].verdict='Nicht ausreichend belegbar'
    $d.claims[0].sourceRefs=@([pscustomobject]@{sourceId='S001';note='Synthetischer Test einer Belegzuordnung, keine neue Sachbewertung.'})
    $s=Get-FactcheckStatistics $d
    Check-True ($s.percentageDenominator -eq 4 -and $s.categories[4].completedCount -eq 1 -and $s.categories[4].completedFactPercent -eq 25) 'Abgeschlossenes unzureichend belegbares Ergebnis fehlt.'
}
Case 'Fremdbezug und Zurueckweisung sind keine eigene Wiederholung' {
    foreach ($role in @('Fremdbezug','Zurückweisung')) {
        $d=Copy-Case; $d.claims[0].occurrences[0].role=$role
        $s=Get-FactcheckStatistics $d
        Check-True ($s.uniqueStatements -eq 9 -and $s.referenceOnlyStatements -eq 1 -and $s.referenceOccurrences -eq 1 -and $s.additionalAssertionOccurrences -eq 0) 'Referenz wurde als eigene Behauptung gezaehlt.'
    }
}
Case 'Korrekturen und Gegenargumente explizit verknuepfen' {
    $d=Copy-Case; $d.claims[1].relations=@([pscustomobject]@{type='korrigiert';claimId=$d.claims[0].id;note='Synthetische Beziehung, kein tatsaechlicher Videobefund.'})
    Assert-FactcheckData $d
    $d.claims[1].relations[0].type='widerspricht'; Assert-FactcheckData $d
    $d.claims[1].relations[0].claimId='mlxFA9T88I0-A9999'; Expect-Rejection { Assert-FactcheckData $d } 'Gegenargumentbeziehung'
}
# Ausschliesslich synthetisch bestaetigte Zuordnungen; keine neuen Videobefunde.
function Confirm-Occurrence($Occurrence,[string]$SpeakerId='SP02') {
    $Occurrence.speakerId=$SpeakerId; $Occurrence.candidateSpeakerId=$null
    $Occurrence.attributionStatus='Bestätigt'; $Occurrence.roleStatus='Bestätigt'
    $Occurrence.attributionBasis='Synthetisch bestaetigte Sprecherzuordnung fuer den Test, keine Originalkontrolle.'
    $Occurrence.roleBasis='Synthetisch bestaetigter eigener Aussagebezug fuer den Test.'
}
Case 'Schema 1 wird nicht stillschweigend aufgewertet' {
    $d=Copy-Case; $d.schemaVersion=1; Expect-Rejection { Assert-FactcheckData $d } 'Schemaversion'
    $d=Copy-Case; $d.claims[0].occurrences[0] | Add-Member -NotePropertyName speaker -NotePropertyValue 'Synthetischer alter Freitext'
    Expect-Rejection { Assert-FactcheckData $d } 'unbekanntes Feld'
}
Case 'Engere Fundstellen erhalten ungefaehre Original-Suchfenster' {
    foreach ($c in $script:baseline.claims) {
        $o=$c.occurrences[0]; $start=3380; $end=3539
        if ($c.legacyId -ceq 'C06-P09') {$start=7249;$end=7405}
        if ($c.legacyId -ceq 'C08-P03') {$start=8350;$end=8420}
        Check-True ($o.timeHistory.Count -eq 1 -and $o.timeHistory[0].startSeconds -eq $start -and $o.timeHistory[0].endSeconds -eq $end -and $o.timeHistory[0].precision -ceq 'Ungefähr') 'Alte Zeitmarke oder Herkunft verloren.'
        Check-True ($o.precision -ceq 'Ungefähr' -and $o.timeBasis.Contains('keine Audio-/Videokontrolle')) 'Scheinpraezise Zeitmarke.'
    }
    $o=$script:baseline.claims[7].occurrences[0]
    Check-True ($o.startSeconds -eq 7405 -and $o.endSeconds -eq 7415 -and $o.timeHistory[0].endSeconds -eq 7405) 'Anschlussluecke nicht nachvollziehbar behoben.'
}
Case 'Echte Factcheckzuordnungen werden nicht automatisch bestaetigt' {
    $s=Get-FactcheckStatistics $script:baseline; $p=$s.speakerStatistics
    Check-True ($script:baseline.schemaVersion -eq 2 -and $script:baseline.speakers.Count -eq 2) 'Schema/Sprecherverzeichnis falsch.'
    Check-True ($p.reliablyAssignedFacts -eq 0 -and $p.factsWithoutReliablePerson -eq 10 -and $p.factsWithUncertainAttribution -eq 10) 'Altzuordnung wurde bestaetigt.'
    Check-True ($p.occurrenceAttributionCounts.Plausibel -eq 10 -and $p.occurrenceRoleStatusCounts.Plausibel -eq 10) 'Plausibilitaet fehlt.'
    foreach ($c in $script:baseline.claims) {
        $o=$c.occurrences[0]
        Check-True ($o.legacySpeaker -ceq 'Lüning' -and $null -eq $o.speakerId -and $o.candidateSpeakerId -ceq 'SP02') 'Altangabe verloren oder aufgewertet.'
    }
    foreach ($person in $p.persons) {
        Check-True ($person.uniqueFacts -eq 0 -and $person.percentageDenominator -eq 0 -and @($person.categories | Where-Object {$null -ne $_.completedFactPercent}).Count -eq 0) 'Null-Nenner der Person falsch.'
    }
}
Case 'Bestaetigte Person mit bestaetigtem Bezug wird gezaehlt' {
    $d=Copy-Case; Confirm-Occurrence $d.claims[2].occurrences[0]
    $s=Get-FactcheckStatistics $d; $p=$s.speakerStatistics.persons[1]
    Check-True ($p.uniqueFacts -eq 1 -and $p.completedFacts -eq 1 -and $p.categories[0].completedFactPercent -eq 100 -and $s.speakerStatistics.reliablyAssignedFacts -eq 1) 'Bestaetigte Zuordnung fehlt.'
}
Case 'Unbekannte bestaetigte und vermutete Sprecher-ID' {
    foreach ($field in @('speakerId','candidateSpeakerId')) {
        $d=Copy-Case; $d.claims[0].occurrences[0].$field='SP99'
        Expect-Rejection { Assert-FactcheckData $d } 'Unbekannte Sprecher-ID'
    }
}
Case 'Sprecher-IDs sind eindeutig und gross-kleinschreibungstreu' {
    $d=Copy-Case; $d.speakers[1].id='SP01'; Expect-Rejection { Assert-FactcheckData $d } 'Sprecher-ID'
    $d=Copy-Case; $d.claims[0].occurrences[0].candidateSpeakerId='sp02'; Expect-Rejection { Assert-FactcheckData $d } 'Sprecher-ID'
}
Case 'Zuordnungsstatus verlangt konsistente IDs' {
    $d=Copy-Case; $d.claims[0].occurrences[0].attributionStatus='Bestätigt'; Expect-Rejection { Assert-FactcheckData $d } 'Bestaetigte Zuordnung'
    $d=Copy-Case; Confirm-Occurrence $d.claims[0].occurrences[0]; $d.claims[0].occurrences[0].attributionStatus='Plausibel'
    Expect-Rejection { Assert-FactcheckData $d } 'Plausible Zuordnung'
    $d=Copy-Case; $d.claims[0].occurrences[0].attributionStatus='Ungeklärt'; Expect-Rejection { Assert-FactcheckData $d } 'Ungeklaerte Zuordnung'
}
Case 'Ungeklaerte Sprecher ohne Kandidaten sind erlaubt und separat gezaehlt' {
    $d=Copy-Case; $o=$d.claims[0].occurrences[0]; $o.candidateSpeakerId=$null; $o.attributionStatus='Ungeklärt'
    $s=Get-FactcheckStatistics $d
    Check-True ($s.uniqueStatements -eq 10 -and $s.speakerStatistics.occurrenceAttributionCounts.Ungeklärt -eq 1 -and $s.speakerStatistics.factsWithoutReliablePerson -eq 10) 'Ungeklaerte Zuordnung falsch gezaehlt.'
}
Case 'Grundlagen und gueltige Sicherheitsstufen sind Pflicht' {
    foreach ($field in @('attributionBasis','roleBasis')) {
        $d=Copy-Case; $d.claims[0].occurrences[0].$field=''; Expect-Rejection { Assert-FactcheckData $d } 'nichtleerer Text'
    }
    foreach ($field in @('attributionStatus','roleStatus')) {
        $d=Copy-Case; $d.claims[0].occurrences[0].$field='Sicherlich'; Expect-Rejection { Assert-FactcheckData $d } 'Zuordnungsstatus'
    }
    $d=Copy-Case; $d.speakers[1].identityBasis=''; Expect-Rejection { Assert-FactcheckData $d } 'nichtleerer Text'
}
Case 'Anonyme identifizierte Stimme ist ohne erfundenen Namen moeglich' {
    $d=Copy-Case; $d.speakers[1].name=$null; Confirm-Occurrence $d.claims[0].occurrences[0]
    $s=Get-FactcheckStatistics $d
    Check-True ($s.speakerStatistics.persons[1].uniqueFacts -eq 1 -and $null -eq $s.speakerStatistics.persons[1].name) 'Unbenannte Sprecherkennung unmoeglich.'
    $a=Get-FactcheckArtifacts $d; Check-True ($a['berichte/kapitel-03.md'].Contains('SP02')) 'Sprecher-ID als Namensersatz fehlt.'
}
Case 'Rueckfrage Fremdzitat und Zurueckweisung zaehlen auch bestaetigt nicht' {
    foreach ($role in @('Rückfrage','Fremdbezug','Zurückweisung')) {
        $d=Copy-Case; Confirm-Occurrence $d.claims[0].occurrences[0]; $d.claims[0].occurrences[0].role=$role
        $s=Get-FactcheckStatistics $d
        Check-True ($s.uniqueStatements -eq 9 -and $s.speakerStatistics.persons[1].uniqueFacts -eq 0) 'Referierender Bezug als eigene Behauptung gezaehlt.'
    }
}
Case 'Unsicherer Aussagebezug verhindert regulaere Personenzurechnung' {
    foreach ($status in @('Plausibel','Ungeklärt')) {
        $d=Copy-Case; Confirm-Occurrence $d.claims[0].occurrences[0]; $d.claims[0].occurrences[0].roleStatus=$status
        $s=Get-FactcheckStatistics $d
        Check-True ($s.speakerStatistics.persons[1].uniqueFacts -eq 0 -and $s.speakerStatistics.factsWithUncertainOwnRole -eq 10) 'Unsicherer Bezug als sicher gezaehlt.'
        $expected=10; if ($status -ceq 'Ungeklärt') {$expected=9}
        Check-True ($s.uniqueStatements -eq $expected) 'Ungeklaerter Bezug ging in Gesamt-Hauptzaehlung ein.'
        if ($status -ceq 'Ungeklärt') {
            Check-True ($s.unresolvedRoleOccurrences -eq 1 -and $s.unresolvedRoleOnlyStatements -eq 1 -and $s.referenceOccurrences -eq 0 -and $s.referenceOnlyStatements -eq 0) 'Ungeklaerter Bezug wurde zum Fremdbezug umgedeutet.'
        }
    }
}
Case 'Bestaetigter Bezug ersetzt keine bestaetigte Person' {
    $d=Copy-Case; $d.claims[0].occurrences[0].roleStatus='Bestätigt'
    $s=Get-FactcheckStatistics $d
    Check-True ($s.speakerStatistics.reliablyAssignedFacts -eq 0 -and $s.uniqueStatements -eq 10) 'Bezugssicherheit wurde zu Personensicherheit.'
}
Case 'Wiederholung derselben Person erhoeht keine Personenzahl' {
    $d=Copy-Case; Confirm-Occurrence $d.claims[2].occurrences[0]
    $o=$d.claims[2].occurrences[0] | ConvertTo-Json -Depth 10 | ConvertFrom-Json
    $o.id='mlxFA9T88I0-O9000'; $o.startSeconds=3600; $o.endSeconds=3610; $d.claims[2].occurrences += $o
    $s=Get-FactcheckStatistics $d
    Check-True ($s.uniqueStatements -eq 10 -and $s.speakerStatistics.persons[1].uniqueFacts -eq 1 -and $s.speakerStatistics.persons[1].completedFacts -eq 1) 'Personendoppelzaehlung.'
}
Case 'Gemeinsame ausdrueckliche Zustimmung zaehlt je Person und insgesamt einmal' {
    $d=Copy-Case; Confirm-Occurrence $d.claims[2].occurrences[0]
    $o=$d.claims[2].occurrences[0] | ConvertTo-Json -Depth 10 | ConvertFrom-Json
    $o.id='mlxFA9T88I0-O9000'; $o.role='Ausdrückliche Zustimmung'; Confirm-Occurrence $o 'SP01'
    $d.claims[2].occurrences += $o
    $s=Get-FactcheckStatistics $d
    Check-True ($s.uniqueStatements -eq 10 -and $s.completedFacts -eq 3 -and $s.speakerStatistics.reliablyAssignedFacts -eq 1) 'Gemeinsame Aussage insgesamt doppelt.'
    foreach ($p in $s.speakerStatistics.persons) { Check-True ($p.uniqueFacts -eq 1 -and $p.completedFacts -eq 1) 'Gemeinsame Zustimmung nicht je Person gezaehlt.' }
    $d.claims[2].occurrences[1].roleStatus='Plausibel'; $s=Get-FactcheckStatistics $d
    Check-True ($s.speakerStatistics.persons[0].uniqueFacts -eq 0 -and $s.speakerStatistics.persons[1].uniqueFacts -eq 1) 'Unsichere Mit-Zustimmung regulaer gezaehlt.'
}
Case 'Teilweise bestaetigte Zurechnung behaelt unsichere weitere Person sichtbar' {
    $d=Copy-Case; Confirm-Occurrence $d.claims[2].occurrences[0]
    $o=$d.claims[2].occurrences[0] | ConvertTo-Json -Depth 10 | ConvertFrom-Json
    $o.id='mlxFA9T88I0-O9000'; $o.role='Ausdrückliche Zustimmung'; $o.speakerId=$null; $o.candidateSpeakerId='SP01'; $o.attributionStatus='Plausibel'
    $d.claims[2].occurrences += $o; $s=Get-FactcheckStatistics $d
    Check-True ($s.speakerStatistics.reliablyAssignedFacts -eq 1 -and $s.speakerStatistics.factsWithoutReliablePerson -eq 9 -and $s.speakerStatistics.factsWithUncertainAttribution -eq 10) 'Teilzuordnung verdeckt Unsicherheit.'
}
Case 'Eigene Selbstkorrektur bleibt mit frueherer Aussage verknuepft' {
    $d=Copy-Case; Confirm-Occurrence $d.claims[0].occurrences[0]; Confirm-Occurrence $d.claims[1].occurrences[0]
    $o=$d.claims[1].occurrences[0]; $o.role='Selbstkorrektur'; $o.startSeconds=3600; $o.endSeconds=3610
    $d.claims[1].relations=@([pscustomobject]@{type='korrigiert';claimId=$d.claims[0].id;note='Synthetische Selbstkorrektur, kein Videobefund.'})
    $s=Get-FactcheckStatistics $d
    Check-True ($s.uniqueStatements -eq 10 -and $s.speakerStatistics.persons[1].uniqueFacts -eq 2) 'Korrektur loescht alte Aussage oder fehlt.'
    $d.claims[1].relations=@(); Expect-Rejection { Assert-FactcheckData $d } 'Selbstkorrektur braucht'
}
Case 'Selbstkorrektur darf nicht fremde oder spaetere Behauptung sein' {
    $d=Copy-Case; Confirm-Occurrence $d.claims[0].occurrences[0] 'SP01'; Confirm-Occurrence $d.claims[1].occurrences[0]
    $o=$d.claims[1].occurrences[0]; $o.role='Selbstkorrektur'; $o.startSeconds=3600; $o.endSeconds=3610
    $d.claims[1].relations=@([pscustomobject]@{type='korrigiert';claimId=$d.claims[0].id;note='Synthetische Beziehung.'})
    Expect-Rejection { Assert-FactcheckData $d } 'derselben Person'
    Confirm-Occurrence $d.claims[0].occurrences[0]; $d.claims[0].occurrences[0].startSeconds=3700; $d.claims[0].occurrences[0].endSeconds=3710
    Expect-Rejection { Assert-FactcheckData $d } 'derselben Person'
}
Case 'Personenstatistik trennt offene laufende und abgeschlossene Pruefungen' {
    $d=Copy-Case; foreach ($c in $d.claims) { Confirm-Occurrence $c.occurrences[0] }
    $s=Get-FactcheckStatistics $d; $p=$s.speakerStatistics.persons[1]
    Check-True ($p.uniqueFacts -eq 10 -and $p.completedFacts -eq 3 -and $p.openFacts -eq 5 -and $p.inProgressFacts -eq 2) 'Personenstatus falsch.'
    Check-True ($p.percentageDenominator -eq 3 -and $p.categories[0].completedCount -eq 2 -and $p.categories[0].completedFactPercent -eq 66.7 -and $p.categories[2].completedFactPercent -eq 33.3) 'Personen-Nenner oder Kategorien falsch.'
}
Case 'Meinungen und Prognosen bleiben ausserhalb der Personen-Faktenstatistik' {
    foreach ($kind in @('Meinung','Prognose')) {
        $d=Copy-Case; Confirm-Occurrence $d.claims[0].occurrences[0]; $d.claims[0].kind=$kind; $d.claims[0].status='Abgeschlossen'; $d.claims[0].verdict='Meinung / Prognose'
        $s=Get-FactcheckStatistics $d
        Check-True ($s.speakerStatistics.persons[1].uniqueFacts -eq 0 -and $s.percentageDenominator -eq 3) 'Nicht-Tatsache in Personenfakten.'
    }
}
Case 'Berichte machen Unsicherheiten und Altzuordnung sichtbar' {
    $a=Get-FactcheckArtifacts $script:baseline; $r=$a['berichte/kapitel-03.md']
    Check-True ($r.Contains('Kandidat: Horst Lüning') -and $r.Contains('Sprecherzuordnung: **Plausibel**') -and $r.Contains('Erhaltene Altzuordnung: Lüning') -and $r.Contains('Personenstatistik: ausgeschlossen')) 'Unsicherheitsdarstellung fehlt.'
    Check-True ($a['README.md'].Contains('Keine Glaubwuerdigkeitsnote') -and $a['README.md'].Contains('Null zugeordnete Tatsachen')) 'Statistikgrenzen fehlen.'
}
Case 'Rechtefilter gilt auch fuer neue Sprecherfelder' {
    $d=Copy-Case; $d.speakers[0].identityBasis='[00:00:00] Synthetischer Test.'
    Expect-Rejection { Assert-FactcheckData $d } 'Rohquellen'
    $d=Copy-Case; $d.claims[0].occurrences[0].attributionBasis='data:audio/mp3;base64,SYNTHETISCH'
    Expect-Rejection { Assert-FactcheckData $d } 'Medien'
}
Case 'Zusaetzliche Vorkommen sind keine bestaetigten Personenwiederholungen' {
    $d=Copy-Case; $o=$d.claims[0].occurrences[0] | ConvertTo-Json -Depth 10 | ConvertFrom-Json
    $o.id='mlxFA9T88I0-O9000';$o.startSeconds=3600;$o.endSeconds=3610;$d.claims[0].occurrences += $o
    $s=Get-FactcheckStatistics $d
    Check-True ($s.additionalAssertionOccurrences -eq 1 -and $s.sameSpeakerRepeatedAssertionOccurrences -eq 0) 'Plausible Zuordnung als sichere Wiederholung dargestellt.'
    foreach ($o in $d.claims[0].occurrences) { Confirm-Occurrence $o }
    $s=Get-FactcheckStatistics $d
    Check-True ($s.sameSpeakerRepeatedAssertionOccurrences -eq 1 -and $s.uniqueStatements -eq 10) 'Wiederholung derselben bestaetigten Person falsch.'
}
Case 'Zustimmung einer zweiten Person ist keine Wiederholung derselben Person' {
    $d=Copy-Case;Confirm-Occurrence $d.claims[0].occurrences[0]
    $o=$d.claims[0].occurrences[0] | ConvertTo-Json -Depth 10 | ConvertFrom-Json
    $o.id='mlxFA9T88I0-O9000';$o.role='Ausdrückliche Zustimmung';Confirm-Occurrence $o 'SP01';$d.claims[0].occurrences += $o
    $s=Get-FactcheckStatistics $d
    Check-True ($s.additionalAssertionOccurrences -eq 1 -and $s.sameSpeakerRepeatedAssertionOccurrences -eq 0 -and $s.speakerStatistics.reliablyAssignedFacts -eq 1) 'Zweite Person als Wiederholung des ersten Sprechers dargestellt.'
}
Case 'Zeithistorie braucht gueltige Grenzen und echte Grundlage' {
    $d=Copy-Case;$d.claims[0].occurrences[0].timeHistory[0].endSeconds=1;Expect-Rejection {Assert-FactcheckData $d} 'Historischer Zeitbereich'
    $d=Copy-Case;$d.claims[0].occurrences[0].timeHistory[0].basis='';Expect-Rejection {Assert-FactcheckData $d} 'nichtleerer Text'
    $d=Copy-Case;$d.claims[0].occurrences[0].timeBasis='';Expect-Rejection {Assert-FactcheckData $d} 'nichtleerer Text'
}
Case 'Teilbestand und Migrationsabdeckung werden nicht als Gesamtvideo ausgegeben' {
    $s=Get-FactcheckStatistics $script:baseline;$a=Get-FactcheckArtifacts $script:baseline
    Check-True ($s.scope -ceq 'Teilbestand' -and $s.selectedLegacyPoints -eq 3 -and $s.totalLegacyPoints -eq 99 -and $a['README.md'].Contains('Keine Statistik des vollständigen Videos')) 'Teilabdeckung verschleiert.'
    $d=Copy-Case;$d.scope.kind='Vollbestand';Expect-Rejection {Assert-FactcheckData $d} 'kein Vollbestand'
}
function New-SyntheticVideo {
    $d=Copy-Case;$newId='TESTvideo01'
    $d.scope.videoId=$newId;$d.scope.videoUrl='https://www.youtube.com/watch?v='+$newId
    $d.scope.baselineCommit=$null;$d.scope.selectedLegacyIds=@();$d.scope.totalLegacyPoints=0;$d.scope.unmigratedLegacyPoints=0
    $d.scope.coverageNote='Synthetischer Teilbestand eines anderen Videos, keine Videobehauptungen.'
    $d.legacyPoints=@();$d.claims=@($d.claims[0]);$d.claims[0].legacyId=$null
    $d.claims[0].videoId=$newId;$d.claims[0].id=$newId+'-A0001';$d.claims[0].chapter=12
    $d.claims[0].occurrences[0].id=$newId+'-O0001';$d.claims[0].occurrences[0].timeHistory=@()
    return $d
}
Case 'Weiteres Video ohne Altpunkte braucht keine Programmaenderung' {
    $d=New-SyntheticVideo;Assert-FactcheckData $d;$s=Get-FactcheckStatistics $d;$a=Get-FactcheckArtifacts $d
    Check-True ($s.uniqueStatements -eq 1 -and $s.totalLegacyPoints -eq 0 -and $a.Contains('berichte/kapitel-12.md') -and $a['berichte/kapitel-12.md'].Contains($d.claims[0].id)) 'Direkte Neuerfassung fehlt in Berichten.'
    $texts=@{};$prefix='faktenchecks/'+$d.scope.videoId+'/strukturiert/';$texts[$prefix+'aussagen.json']=ConvertTo-FactcheckJson $d
    foreach ($key in $a.Keys) {$texts[$prefix+$key]=$a[$key]}
    Assert-FactcheckCollection $texts
}
Case 'Verwaiste Artefakte eines weiteren Videos werden abgelehnt' {
    $d=New-SyntheticVideo;$a=Get-FactcheckArtifacts $d;$texts=@{};$prefix='faktenchecks/'+$d.scope.videoId+'/strukturiert/'
    $texts[$prefix+'aussagen.json']=ConvertTo-FactcheckJson $d
    foreach($key in $a.Keys){$texts[$prefix+$key]=$a[$key]}
    $texts['faktenchecks/ORPHANvid01/strukturiert/statistik.json']='{}'
    Expect-Rejection {Assert-FactcheckCollection $texts} 'ohne zentrale Daten'
}
Case 'Erzeugung deterministisch und drei Beispielberichte' {
    $a=Get-FactcheckArtifacts $script:baseline; $b=Get-FactcheckArtifacts $script:baseline
    Check-True ($a.Count -eq 6 -and @($a.Keys | Where-Object { $_ -like 'berichte/*' }).Count -eq 3) 'Falsche Artefaktzahl.'
    foreach ($key in $a.Keys) { Check-True ($a[$key] -ceq $b[$key]) 'Nichtdeterministisches Ergebnis.' }
}
Case 'JSON-Zahlenformat 0 und 0.0 aendert nicht die Bedeutung' {
    $a=ConvertFrom-FactcheckJson '{"zahl":0}'
    $b=ConvertFrom-FactcheckJson '{"zahl":0.0}'
    Check-True (Test-FactcheckEqual $a $b) 'Numerisch identische JSON-Zahlen wurden ungleich behandelt.'
}
Case 'String statt statistischer Zahl wird nicht akzeptiert' {
    $a=ConvertFrom-FactcheckJson '{"zahl":2}'
    $b=ConvertFrom-FactcheckJson '{"zahl":"2"}'
    Check-True (-not (Test-FactcheckEqual $a $b)) 'Statistikvergleich akzeptierte falschen Zahlentyp.'
}
Case 'Bestehende Quellenbelege und Alttexte erhalten' {
    foreach ($l in $script:baseline.legacyPoints) {
        $text=Get-Content -LiteralPath (Join-Path $root $l.path) -Raw -Encoding UTF8
        Check-True ((Get-FactcheckTextHash $text) -ceq $l.fileSha256) 'Herkunftshash geaendert.'
        $pattern='(?ms)^## Prüfpunkt ' + $l.point + '\r?\n(.*?)(?=^## (?:Prüfpunkt \d+|Kapitel-Fazit)|\z)'
        $section=[regex]::Match($text,$pattern).Value.Trim()
        Check-True ((Normalize-FactcheckText $section) -ceq (Normalize-FactcheckText $l.section)) 'Alttext unvollstaendig.'
    }
}
# Der existierende Publikationspruefer liest Arbeitsbaum und Index nur.
. (Join-Path $PSScriptRoot 'Test-Publication.ps1') -Root $root
Case 'Dokumentiertes JSON-Beispiel ist vollstaendig valide' {
    $doc=Get-Content -LiteralPath (Join-Path $root 'docs/STRUKTURIERTE_DATEN.md') -Raw -Encoding UTF8
    $examples=[regex]::Matches($doc,'(?s)```json\s*(.*?)\s*```')
    Check-True ($examples.Count -eq 1) 'Dokumentationsbeispiel fehlt.'
    $d=ConvertFrom-FactcheckJson $examples[0].Groups[1].Value
    Assert-FactcheckData $d; $a=Get-FactcheckArtifacts $d
    Check-True ($a.Contains('berichte/kapitel-01.md')) 'Dokumentationsbeispiel laesst sich nicht generieren.'
}
Case 'Mehrere Videos im selben Snapshot bleiben unabhaengig' {
    $texts=$workTexts.Clone();$d=New-SyntheticVideo;$prefix='faktenchecks/'+$d.scope.videoId+'/strukturiert/'
    $texts[$prefix+'aussagen.json']=ConvertTo-FactcheckJson $d;$a=Get-FactcheckArtifacts $d
    foreach($key in $a.Keys){$texts[$prefix+$key]=$a[$key]}
    Assert-FactcheckCollection $texts
    $texts[$prefix+'statistik.json']='{}';Expect-Rejection {Assert-FactcheckCollection $texts} 'Factcheckartefakt'
}
Case 'Unbekannte strukturierte Ausgabepfade werden abgelehnt' {
    $texts=$workTexts.Clone();$texts['faktenchecks/mlxFA9T88I0/strukturiert/berichte/fremd.md']='Synthetischer Zusatz.'
    Expect-Rejection {Assert-FactcheckCollection $texts} 'Unbekanntes Factcheckartefakt'
}
Case 'Alte Sonderstruktur und alte Skriptnamen sind entfernt' {
    $oldNames=@(Get-ChildItem -LiteralPath $root -Recurse -Force | Where-Object {$_.Name -imatch 'pi[l]ot'})
    Check-True ($oldNames.Count -eq 0) 'Alte Sonderstruktur vorhanden.'
    foreach($f in Get-ChildItem -LiteralPath $root -File -Recurse) {
        Check-True (-not ((Get-Content -LiteralPath $f.FullName -Raw -Encoding UTF8) -imatch 'pi[l]ot')) 'Veralteter Verweis in oeffentlicher Datei.'
    }
}
Case 'JSON, Statistik und Markdown stimmen ueberein' { Assert-FactcheckCollection $workTexts }
Case 'Veraltete Statistik wird zurueckgewiesen' {
    $m=$workTexts.Clone(); $m['faktenchecks/mlxFA9T88I0/strukturiert/statistik.json']='{}'
    Expect-Rejection { Assert-FactcheckCollection $m } 'Factcheckartefakt'
}
Case 'Manuell geaenderter generierter Bericht wird erkannt' {
    $m=$workTexts.Clone(); $m['faktenchecks/mlxFA9T88I0/strukturiert/berichte/kapitel-03.md'] += 'Synthetische Aenderung.'
    Expect-Rejection { Assert-FactcheckCollection $m } 'Factcheckartefakt'
}
Case 'Gekuerzter Herkunftstext wird zurueckgewiesen' {
    $d=Copy-Case; $d.legacyPoints[0].section='Unvollstaendig'
    $m=$workTexts.Clone(); $m['faktenchecks/mlxFA9T88I0/strukturiert/aussagen.json']=ConvertTo-FactcheckJson $d
    Expect-Rejection { Assert-FactcheckCollection $m } 'Alttext'
}
Case 'Unbekanntes Factcheckartefakt wird blockiert' {
    $m=$workTexts.Clone(); $m['faktenchecks/mlxFA9T88I0/strukturiert/fremd.json']='{}'
    Expect-Rejection { Assert-FactcheckCollection $m } 'Unbekanntes Factcheckartefakt'
}
function Expect-FileRejection([string]$Path,[string]$Text) {
    $before=$problems.Count
    Test-PublicFile $Path $Text 'Synthetischer Test'
    $blocked=$problems.Count -gt $before
    while ($problems.Count -gt $before) { $problems.RemoveAt($problems.Count-1) }
    Check-True $blocked 'Publikations-Dateifilter liess unerlaubte Datei durch.'
}
Case 'JSON ausserhalb der gezielten Factcheckpfade bleibt verboten' { Expect-FileRejection 'faktenchecks/mlxFA9T88I0/daten.json' '{}' }
Case 'Beliebige JSON-Datei im Factcheck bleibt verboten' { Expect-FileRejection 'faktenchecks/mlxFA9T88I0/strukturiert/raw.json' '{}' }
Case 'Medien und Transkripte bleiben verboten' {
    Expect-FileRejection 'faktenchecks/mlxFA9T88I0/strukturiert/media.jpg' 'synthetischer Test'
    Expect-FileRejection 'faktenchecks/mlxFA9T88I0/strukturiert/source.json3' '{}'
    Expect-FileRejection 'faktenchecks/mlxFA9T88I0/strukturiert/README.md' '[00:00:00] Synthetischer Test.'
}
Case 'Index-Snapshot wird eigenstaendig validiert' {
    $snapshot=$workTexts.Clone()
    $snapshot['faktenchecks/mlxFA9T88I0/strukturiert/statistik.json']='{}'
    Expect-Rejection { Assert-FactcheckCollection $snapshot } 'Factcheckartefakt'
    Assert-FactcheckCollection $workTexts
}
Case 'Alle 14 veroeffentlichten Berichtdateien und Lizenz unveraendert' {
    $gitArgs=@('-c',('safe.directory='+$root.Replace('\','/')),'-C',$root)
    $tree=@(& git @gitArgs ls-tree -r $script:baseline.scope.baselineCommit -- faktenchecks LICENSE)
    if ($LASTEXITCODE -ne 0) { throw 'Baseline nicht lesbar.' }
    Check-True ($tree.Count -eq 15) 'Unerwarteter Baselineumfang.'
    foreach ($entry in $tree) {
        if ($entry -notmatch '^100644 blob ([0-9a-f]+)\t(.+)$') { throw 'Ungueltiger Baselineeintrag.' }
        $expected=$Matches[1]; $path=$Matches[2]
        $actual=& git @gitArgs hash-object -- (Join-Path $root $path)
        if ($LASTEXITCODE -ne 0) { throw 'Dateihash nicht lesbar.' }
        Check-True ($actual -ceq $expected) ('Veroeffentlichte Datei veraendert: '+$path)
    }
}
Case 'Lokale Factcheck-Markdownlinks existieren' {
    foreach ($f in Get-ChildItem -LiteralPath $root -Filter '*.md' -File -Recurse) {
        $body=Get-Content -LiteralPath $f.FullName -Raw -Encoding UTF8
        foreach ($m in [regex]::Matches($body,'\]\(([^)]+)\)')) {
            $link=$m.Groups[1].Value
            if ($link -notmatch '^(https?://|#)') {
                Check-True (Test-Path -LiteralPath (Join-Path $f.DirectoryName $link)) ('Fehlender Factchecklink: '+$link)
            }
        }
    }
}
Case 'PowerShell-Skripte syntaktisch gueltig' {
    foreach ($f in Get-ChildItem -LiteralPath (Join-Path $root 'scripts') -Filter '*.ps1' -File) {
        $tokens=$null; $errors=$null
        $null=[Management.Automation.Language.Parser]::ParseFile($f.FullName,[ref]$tokens,[ref]$errors)
        Check-True (@($errors).Count -eq 0) ('Syntaxfehler: '+$f.Name)
    }
}
$results | ForEach-Object { Write-Host $_ }
Write-Host ('BESTANDEN: ' + $results.Count + ' Testfaelle. Nur synthetische Negativdaten im Speicher; keine Dateien geschrieben, kein Netzabruf.')
