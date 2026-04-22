# Prompt System Architecture (Goldstandard)

## Ziel

Dieses Dokument definiert die verbindliche Struktur und Funktionsweise des Prompt-Systems.

Ziel ist es, neue Projekte:

- geführt zu starten
- strukturiert zu planen
- reproduzierbar aufzubauen
- nahtlos von ChatGPT zu Cursor-Agent zu übergeben

---

## Grundprinzip

Das Prompt-System besteht aus zwei strikt getrennten Phasen:

1. GPT-Phase (Denken & Strukturierung)
2. Agent-Phase (Umsetzung & Dateimanipulation)

Diese Trennung ist verpflichtend.

---

## Speicherort

Prompts werden zentral im Repository abgelegt unter:

prompts/

Unterstruktur:

prompts/
  gpt/
  agent/

---

## Namenskonvention

Alle Prompts folgen diesem Schema:

NN-<system>-<purpose>.md

Beispiele:

### GPT

01-gpt-project-start.md  
02-gpt-project-definition.md  
03-gpt-usecase-definition.md  
04-gpt-pflichtenheft-prep.md  

### Agent

01-agent-project-bootstrap.md  
02-agent-write-pflichtenheft.md  
03-agent-architecture-setup.md  
04-agent-project-structure.md  

---

## Nummerierungsregel

Die Nummerierung gilt **innerhalb der jeweiligen Kategorie** (gpt / agent).

Die tatsächliche Ausführungsreihenfolge erfolgt in zwei Phasen:

1. GPT-Phase (01–XX)
2. Agent-Phase (01–XX)

Eine globale Nummerierung über beide Phasen hinweg ist nicht vorgesehen.

---

## Startfluss

### Phase 1 – GPT

Ziel: Verständnis und Struktur

Reihenfolge:

1. Projektstart
2. Projektdefinition
3. Use Case Definition
4. Pflichtenheft Vorbereitung

---

### Phase 2 – Agent

Ziel: Umsetzung im Repository

Reihenfolge:

1. Projekt-Setup
2. Pflichtenheft schreiben
3. Architektur aufbauen
4. Projektstruktur anlegen

---

## Output-Verpflichtung

Jeder Prompt muss definierte Outputs erzeugen.

### GPT-Prompts

Müssen liefern:

- strukturierte Inhalte (Text, Listen, Definitionen)
- keine Implementierung
- keine Code-Erstellung ohne Kontext

Beispiele:

- Problemdefinition
- Zielgruppe
- Use Cases
- Pflichtenheft-Struktur

---

### Agent-Prompts

Müssen liefern:

- konkrete Änderungen im Repository
- definierte Dateien
- klaren Git-Workflow

Beispiele:

- neue Dateien
- angepasste Dokumente
- initiale Projektstruktur

---

## Übergabe zwischen GPT und Agent

Die Übergabe erfolgt über strukturierte Outputs.

Das bedeutet:

- GPT erzeugt definierte Inhalte
- diese Inhalte werden in Agent-Prompts übernommen
- der Agent setzt diese Inhalte im Repository um

Freitext-Übergaben sind nicht erlaubt.

---

## Erweiterungsregeln

Neue Prompts dürfen nur hinzugefügt werden, wenn:

- sie klar einer Phase zugeordnet sind
- sie eine eindeutige Aufgabe haben
- sie definierte Inputs und Outputs besitzen
- sie die bestehende Reihenfolge nicht brechen

---

## Verbotene Patterns

- gemischte Prompts (GPT + Agent kombiniert)
- fehlende Output-Definition
- unklare Reihenfolge
- implizite Prozessschritte
- direkte Implementierung ohne vorherige GPT-Phase

---

## Zielzustand

Das System gilt als korrekt umgesetzt, wenn:

- ein neuer Entwickler ohne Erklärung starten kann
- die Reihenfolge klar dokumentiert ist
- GPT und Agent sauber getrennt sind
- alle Prompts nummeriert und strukturiert sind
- ein vollständiger Projektstart reproduzierbar möglich ist

---

## Ausblick

Dieses System ermöglicht später:

- automatisierte Projektinitialisierung
- CLI-basierte Projektstarts
- Web-basierte Wizard-Interfaces
- Integration in Entwicklungsumgebungen

---

## 4. Abschlussprüfung

Führe aus:

git status --short

Erwartung:

- genau eine neue Datei:
  meta/prompt-system-architecture.md
- keine Änderungen außerhalb von meta/
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

Ein verbindliches Architektur-Dokument für das Prompt-System im Goldstandard-Template.
