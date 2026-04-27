# 05 – GPT → Agent Handover

## Ausführende Partei
GPT (ChatGPT)

---

## Ziel

Erstelle eine strukturierte, vollständige und agententaugliche Übergabe des Projektkontexts.

Diese Übergabe dient als **einzige Wissensbasis** für den Agenten und wird im nächsten Schritt direkt in den Agent-Prompt eingefügt.

---

## Kontext

Du hast zuvor folgende Schritte durchgeführt:

- 01 – Projektstart
- 02 – Projektdefinition
- 03 – Use Case Definition
- 04 – Pflichtenheft Vorbereitung

Alle dort erarbeiteten Inhalte sollen jetzt:

- zusammengeführt
- bereinigt
- strukturiert
- und für den Agenten optimiert werden

---

## Aufgabe

Erstelle eine **kompakte, klare und vollständige Projektübergabe** für den Agenten.

WICHTIG:
- Keine neuen Inhalte erfinden
- Keine Annahmen treffen
- Nur bestehende Erkenntnisse strukturieren und zusammenführen

---

## Ausgabeformat (VERPFLICHTEND)

Gib die Antwort **ausschließlich in folgendem Format** aus:

```text
PROJEKTKONTEXT

Projektname:
<name>

Kurzbeschreibung:
<2-4 Sätze>

Ziel des Projekts:
<klar und konkret>

---

USE CASES

- <Use Case 1>
- <Use Case 2>
- ...

---

FUNKTIONALE ANFORDERUNGEN

- <Anforderung 1>
- <Anforderung 2>
- ...

---

NICHT-FUNKTIONALE ANFORDERUNGEN

- <z. B. Performance, Sicherheit, Skalierung>

---

DOMÄNENLOGIK / BESONDERHEITEN

- <zentrale Fachlogik>
- <wichtige Regeln>
- <Sonderfälle>

---

OPTIONALE TECHNISCHE HINWEISE

- <falls vorhanden>
- <z. B. Präferenzen, Architekturideen>

---

OFFENE PUNKTE / UNSICHERHEITEN

- <falls etwas unklar ist>
```
