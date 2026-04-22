# 01 – Agent Project Bootstrap

## Ziel

Dieser Prompt ist der Einstiegspunkt in die Agent-Phase.

Er übernimmt die strukturierten Ergebnisse aus der GPT-Phase und bereitet das Repository für die Umsetzung vor.

---

## Anweisung an den Agenten

Du arbeitest in einem Goldstandard-Repository.

Die GPT-Phase wurde bereits vollständig durchgeführt und hat strukturierte Ergebnisse geliefert.

Jetzt sollst du:

- den Arbeitskontext vorbereiten
- den Git-Workflow korrekt einleiten
- sicherstellen, dass nur erlaubte Änderungen durchgeführt werden

---

## Deine Aufgabe

Führe folgende Schritte aus:

1. Git-Status prüfen
2. auf main wechseln
3. origin/main holen
4. lokalen main synchronisieren
5. neuen Feature-Branch erstellen

Branch-Name:

feat/project-bootstrap

---

## Regeln

- niemals direkt auf main arbeiten
- keine bestehenden Dateien verändern
- keine neuen Dateien erstellen (in diesem Schritt)
- keine Implementierung starten
- keine Dokumente befüllen

---

## Erwarteter Output

Am Ende musst du liefern:

- aktiver Branch-Name
- Bestätigung, dass main synchron ist
- Bestätigung, dass Working Tree sauber ist

---

## Nächster Schritt

Nach erfolgreichem Bootstrap folgt:

`prompts/agent/02-agent-write-pflichtenheft.md`

---

## Verwendung

Diesen Prompt erst verwenden, wenn die GPT-Phase vollständig abgeschlossen ist.
