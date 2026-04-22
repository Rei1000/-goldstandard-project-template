# Prompt Index (Goldstandard)

## Ziel

Dieses Dokument dient als zentrale Übersicht über alle Prompts im Goldstandard-Template.

Es soll:
- die Navigation erleichtern
- die Reihenfolge verständlich machen
- Input und Output je Prompt sichtbar machen
- neue Entwickler ohne zusätzliche Erklärung unterstützen

---

## Grundprinzip

Das Prompt-System besteht aus zwei Phasen:

1. GPT-Phase
2. Agent-Phase

Die GPT-Phase ist verpflichtend und kommt immer zuerst.

Die Agent-Phase beginnt erst nach vollständigem Abschluss der GPT-Phase.

---

## Phase 1 – GPT

### 01 – Project Start
Datei:
`prompts/gpt/01-gpt-project-start.md`

Zweck:
- Projektidee fachlich klären
- Problem, Zielgruppe und Nutzen verstehen

Input:
- erste Projektidee
- grober Kontext
- offene Fragen

Output:
- Projekttitel
- Problemdefinition
- Zielgruppe
- Nutzenversprechen
- Kernidee
- offene Fragen

Pflicht:
Ja

---

### 02 – Project Definition
Datei:
`prompts/gpt/02-gpt-project-definition.md`

Zweck:
- Scope und Systemgrenzen definieren
- Hauptfunktionen festlegen

Input:
- Ergebnisse aus GPT 01

Output:
- Projektziel
- Scope
- Nicht-Ziele
- Systemgrenzen
- Hauptfunktionen
- Risiken / offene Fragen

Pflicht:
Ja

---

### 03 – Use Case Definition
Datei:
`prompts/gpt/03-gpt-usecase-definition.md`

Zweck:
- Use Cases identifizieren und priorisieren

Input:
- Ergebnisse aus GPT 02

Output:
- priorisierte Use Cases
- Primärnutzer
- Trigger
- gewünschte Ergebnisse
- Abgrenzungen

Pflicht:
Ja

---

### 04 – Pflichtenheft Preparation
Datei:
`prompts/gpt/04-gpt-pflichtenheft-prep.md`

Zweck:
- strukturierte Grundlage für das Pflichtenheft erzeugen

Input:
- Ergebnisse aus GPT 01 bis 03

Output:
- Rohstruktur für das Pflichtenheft
- priorisierte fachliche Inhalte
- MVP-Abgrenzung
- offene fachliche Fragen

Pflicht:
Ja

---

## Phase 2 – Agent

### 01 – Project Bootstrap
Datei:
`prompts/agent/01-agent-project-bootstrap.md`

Zweck:
- Git- und Arbeitskontext für die Umsetzung vorbereiten

Input:
- strukturierte GPT-Ergebnisse
- Ziel-Repository

Output:
- aktiver Branch
- synchroner main
- sauberer Working Tree

Pflicht:
Ja

---

### 02 – Write Pflichtenheft
Datei:
`prompts/agent/02-agent-write-pflichtenheft.md`

Zweck:
- GPT-Ergebnisse in `docs/pflichtenheft.md` überführen

Input:
- Ergebnisse aus GPT 04

Output:
- befüllte Datei `docs/pflichtenheft.md`

Pflicht:
Ja

---

### 03 – Architecture Setup
Datei:
`prompts/agent/03-agent-architecture-setup.md`

Zweck:
- erste Architekturgrundlage im Repository aufbauen

Input:
- Pflichtenheft
- GPT-Ergebnisse

Output:
- befüllte Datei `docs/architecture.md`

Pflicht:
Ja

---

### 04 – Project Structure
Datei:
`prompts/agent/04-agent-project-structure.md`

Zweck:
- konkrete Projektstruktur aus Architektur und Anforderungen ableiten

Input:
- Architektur
- Pflichtenheft

Output:
- `docs/projectstructure.md`
- ggf. Ordner / Platzhalterdateien

Pflicht:
Ja

---

## Offizieller Startpunkt

Der offizielle erste Prompt für jedes neue Projekt ist:

`prompts/gpt/01-gpt-project-start.md`

---

## Verbindliche Reihenfolge

1. GPT 01
2. GPT 02
3. GPT 03
4. GPT 04
5. Agent 01
6. Agent 02
7. Agent 03
8. Agent 04

---

## Pflicht vs. Optional

### Pflicht
- alle oben genannten 8 Prompts in der definierten Reihenfolge

### Optional
- spätere Zusatzprompts
- domänenspezifische Erweiterungsprompts
- Wizard-/UI-gestützte Ausführung

---

## Verwendung in README und UI

Dieses Dokument dient als Referenz für:

- README-Einstieg
- Entwickler-Onboarding
- zukünftige Wizard-/UI-Logik
- spätere Prompt-Erweiterungen

---

## Zielzustand

Das Prompt-System gilt als gut navigierbar, wenn:
- alle Prompts zentral auffindbar sind
- Input und Output je Prompt klar sind
- Pflicht- und optionale Prompts unterscheidbar sind
- ein fremder Entwickler den Ablauf ohne Rückfragen versteht

---

## 4. Abschlussprüfung

Führe aus:

git status --short

Erwartung:

- genau eine neue Datei:
  docs/prompt-index.md
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

Ein zentrales Navigationsdokument für das gesamte Prompt-System im Goldstandard-Template.
