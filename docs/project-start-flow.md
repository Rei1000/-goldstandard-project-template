# Project Start Flow (Goldstandard)

## Ziel

Dieses Dokument definiert den verbindlichen Ablauf, mit dem ein neues Projekt auf Basis des Goldstandard-Templates gestartet wird.

Der Ablauf muss:
- für neue Entwickler intuitiv sein
- GPT- und Agent-Phase klar trennen
- reproduzierbar sein
- definierte Outputs erzeugen

---

## Grundprinzip

Ein neues Projekt wird in zwei Phasen gestartet:

1. GPT-Phase – Verstehen, Strukturieren, Definieren
2. Agent-Phase – Umsetzen, Anlegen, Befüllen

Ein direkter Einstieg in die Agent-Phase ohne vorherige GPT-Phase ist nicht vorgesehen.

---

## Phase 1 – GPT-Start

### Schritt 1
Prompt:
`prompts/gpt/01-gpt-project-start.md`

Ziel:
- Projektidee klären
- Problem verstehen
- Zielgruppe benennen
- Nutzen formulieren

Output:
- Projekttitel
- Problemdefinition
- Zielgruppe
- Nutzenversprechen
- offene Fragen

---

### Schritt 2
Prompt:
`prompts/gpt/02-gpt-project-definition.md`

Ziel:
- Projektgrenzen schärfen
- Scope und Nicht-Ziele festlegen
- Kernfunktionen definieren

Output:
- Ziel
- Scope
- Nicht-Ziele
- Systemgrenzen
- Hauptfunktionen

---

### Schritt 3
Prompt:
`prompts/gpt/03-gpt-usecase-definition.md`

Ziel:
- Use Cases definieren und priorisieren

Output:
- priorisierte Use Cases
- Primärnutzer
- Trigger
- gewünschtes Ergebnis
- Abgrenzungen

---

### Schritt 4
Prompt:
`prompts/gpt/04-gpt-pflichtenheft-prep.md`

Ziel:
- Rohstruktur für das Pflichtenheft vorbereiten

Output:
- strukturierte Pflichtenheft-Inhalte
- MVP-Abgrenzung
- offene fachliche Lücken

---

## Übergang zur Agent-Phase

Die Agent-Phase beginnt erst, wenn die Outputs der GPT-Phase vollständig vorliegen.

Die Übergabe muss strukturiert erfolgen:
- kein unstrukturierter Freitext
- klare Übernahme der zuvor erzeugten Inhalte

---

## Phase 2 – Agent-Start

### Schritt 1
Prompt:
`prompts/agent/01-agent-project-bootstrap.md`

Ziel:
- Projektdateien und Grundstruktur vorbereiten

Output:
- geänderte oder angelegte Dateien
- klar definierter Branch
- sauberer Scope

---

### Schritt 2
Prompt:
`prompts/agent/02-agent-write-pflichtenheft.md`

Ziel:
- `docs/pflichtenheft.md` befüllen

Output:
- vollständige erste Version des Pflichtenhefts

---

### Schritt 3
Prompt:
`prompts/agent/03-agent-architecture-setup.md`

Ziel:
- `docs/architecture.md` aufbauen

Output:
- Architekturgrundlage
- Schichtenmodell
- technischer Rahmen

---

### Schritt 4
Prompt:
`prompts/agent/04-agent-project-structure.md`

Ziel:
- Projektstruktur aus Architektur und Pflichtenheft ableiten

Output:
- Strukturdefinition
- ggf. neue Platzhalterdateien und Ordner

---

## Git-Workflow im Startprozess

Der Git-Workflow beginnt mit der Agent-Phase.

Regeln:
- niemals direkt auf main
- jede Änderung auf eigenem Branch
- PR ist verpflichtend
- Merge bevorzugt per Squash
- nach Merge Branch löschen

Die GPT-Phase erzeugt noch keine Repository-Änderungen.

---

## Pflichtartefakte des Startprozesses

Nach korrekt ausgeführtem Startfluss müssen mindestens vorliegen:

- README mit Projekttitel und Ziel
- `docs/pflichtenheft.md`
- `docs/architecture.md`
- `docs/projectstructure.md` (falls im Verlauf ergänzt)
- definierte Use Cases
- dokumentierte Scope-Grenzen

---

## Pflicht vs. Optional

### Pflicht
- GPT-Phase vollständig durchführen
- strukturierte Outputs erzeugen
- Agent-Phase erst danach starten
- Git-Workflow einhalten

### Optional
- spätere UI / Wizard
- zusätzliche Prompt-Stufen
- projektspezifische Zusatz-Prompts

---

## README-Integration

Die README des Templates soll auf diesen Startfluss verweisen.

Ein neuer Entwickler muss in der README sofort erkennen:
- womit gestartet wird
- welche Prompt-Reihenfolge gilt
- wo GPT endet und Agent beginnt

---

## Zielzustand

Der Startfluss gilt als korrekt, wenn:
- ein fremder Entwickler ohne Erklärung starten kann
- die Reihenfolge eindeutig ist
- die Übergabe zwischen GPT und Agent klar ist
- aus dem Prozess definierte Artefakte entstehen

---

## 4. Abschlussprüfung

Führe aus:

git status --short

Erwartung:

- genau eine neue Datei:
  docs/project-start-flow.md
- keine Änderungen außerhalb von docs/
- nichts gestaged
- kein Commit

---

## Verboten

- kein git add .
- kein Commit
- kein Push
- keine Änderungen an bestehenden Dateien

---

## Ergebnis

Ein verbindliches Ablaufdokument für den geführten Projektstart im Goldstandard-Template.
