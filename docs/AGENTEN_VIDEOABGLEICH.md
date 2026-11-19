# Bild und Ton eines Videos abgleichen

## Geeignete Fassung wählen

1. **Öffentliche Wiedergabe.** Öffne das Original in einem unterstützten Browser oder Player. Falls die Wiedergabe dort scheitert, suche eine offizielle Zweitveröffentlichung, etwa in der Mediathek des Herausgebers. Dafür ist kein eigener Webserver erforderlich. Gleiche Titel, Laufzeit und mehrere erkennbare Stellen mit der verlinkten Fassung ab. Werbung, Vorspann und Schnitt können die Zeitachse verschieben. Nutze die Zeitmarken der verlinkten Fassung und dokumentiere ungeklärte Abweichungen.
2. **Lokale Wiedergabe.** Wenn bereits eine zulässig bezogene und für die Prüfung freigegebene lokale Datei vorliegt, verwende sie in der privaten Ablage außerhalb des Git-Arbeitsbaums. FFprobe zeigt Laufzeit und vorhandene Bild- und Tonspuren. FFmpeg erzeugt Standbilder zu konkreten Fundstellen. VLC eignet sich zum direkten Springen, Pausieren und schrittweisen Ansehen einer Szene sowie zum Anhören, soweit die Arbeitsumgebung den Ton tatsächlich zugänglich macht. [FFprobe-Dokumentation](https://ffmpeg.org/ffprobe.html) · [FFmpeg-Dokumentation](https://ffmpeg.org/ffmpeg.html) · [VLC-Wiedergabe](https://docs.videolan.me/vlc-user/desktop/3.0/en/basic/playback.html)
3. **Optionaler Szenenindex.** Bei einem öffentlichen YouTube-Video kann eine verfügbare Szenenanalyse wie vidIQ Video Watch Fundstellen vorschlagen. Eine kostenpflichtige Ausführung setzt die Zustimmung des Nutzers voraus. Die automatisch erzeugten Szenennotizen dienen als Suchhilfe. Für einen bestätigten Bild- oder Tonbefund muss die jeweilige Stelle tatsächlich gesehen oder gehört werden. Verwende für einen solchen Dienst nur den öffentlichen Link. Private Dateien und Rohquellen bleiben lokal. [vidIQ MCP und Credits](https://support.vidiq.com/en/articles/15082430-vidiq-mcp)

Eine einzelne YouTube-URL ist weiterhin ein Auftrag zur Analyse. Der Untertitelimport lädt keine Video- oder Audiodateien. Zugangssperren werden nicht umgangen. Quellen, Standbilder und Ausschnitte bleiben als Arbeitsmaterial außerhalb aller Git-Arbeitsbäume und Veröffentlichungsartefakte.

## Standbild aus einer lokalen Datei oder einem öffentlichen Stream

Wenn die offizielle Fassung im Player nicht zugänglich ist, kann FFmpeg eine vom Herausgeber öffentlich bereitgestellte MP4- oder HLS-Adresse direkt lesen. Ermittle die Adresse über das öffentliche Angebot oder mit dem Metadatenmodus von yt-dlp ohne Video- oder Audiodownload. Setze die Streamadresse im folgenden Beispiel als Quelle ein und speichere nur die benötigten Standbilder privat. Gleiche die Zeitachse nach Möglichkeit anhand passender Untertitel und überprüfbarer Bildstellen ab. Beende diesen Weg bei Zugangssperren oder DRM. Im Bericht steht der Link zur offiziellen Wiedergabeseite.

Das Beispiel verwendet eine lokale Datei und setzt ein bestehendes privates Zielverzeichnis voraus. Passe Pfade und Zeitmarke an. Wenn die portablen Werkzeuge im benachbarten Downloadprojekt liegen, verwende deren explizite Pfade. Eine globale PATH-Änderung ist dafür entbehrlich.

```powershell
$video = 'D:\privat\folge.mp4'
$bild = 'D:\privat\pruefung\standbild-000930.png'
$ffprobe = (Resolve-Path -LiteralPath '..\youtubedownload\.tools\ffprobe.exe').Path
$ffmpeg = (Resolve-Path -LiteralPath '..\youtubedownload\.tools\ffmpeg.exe').Path

& $ffprobe -v error -show_entries 'format=duration:stream=index,codec_type,codec_name' -of json $video
& $ffmpeg -hide_banner -loglevel error -nostdin -n -ss '00:09:30.000' -i $video -map '0:v:0' -frames:v 1 -update 1 $bild
```

Öffne das erzeugte Standbild mit dem verfügbaren lokalen Bildwerkzeug. Prüfe bei kurzen Einblendungen oder Schnitten mehrere Bilder vor und nach der Fundstelle oder verwende die laufende Wiedergabe. Ein Standbild belegt nur den sichtbaren Bildinhalt. Für gesprochene Zahlen, Ironie, Sprecherwechsel oder die zeitliche Beziehung zwischen Ton und Bild kontrolliere den jeweiligen Abschnitt mit zugänglichem Ton.

## Abdeckung in der Auswertung ausweisen

- Erfasse je Fundstelle die geprüfte Fassung, den Zeitbereich und die tatsächliche Grundlage, etwa Untertitel, Standbild, bewegte Szene oder tatsächlich gehörter Originalton. Nenne eine zusätzliche Bild- oder Tonkontrolle erst nach ihrer Durchführung. Markiere die Zeit als `Ungefähr`, solange die Fundstelle nur aus dem Text abgeleitet wurde oder ihre Lage in der Originalfassung unsicher ist.
- Unterscheide den Abschluss der Sachprüfung erfasster Aussagen von der Abdeckung der Bild- und Tonebene. Vereinzelte Standbilder erlauben keine Aussage über sämtliche Einblendungen oder über die Häufigkeit eines Motivs. Bei einer vollständigen Prüfung der Bild- und Tonebene muss die ganze Laufzeit einschließlich Abspann auf eigenständige Prüfinhalte gesichtet werden.
- Bleibt eine konkrete Behauptung wegen einer fehlenden Bild- oder Tonstelle ungeprüft, dokumentiere die Stelle und den fehlenden Zugriff. Eine anderweitig recherchierte Tatsachenbewertung kann bestehen bleiben, wenn die Aussage selbst eindeutig erfasst ist. Beschreibe die verbleibende Abdeckungslücke im Bericht.
