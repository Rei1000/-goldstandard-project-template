# Prompt Wizard Specification (Goldstandard)

## Ziel

Diese Spezifikation beschreibt einen geführten Wizard, der Nutzer durch den vollständigen Goldstandard-Projektstart führt.

Der Wizard stellt sicher:
- korrekte Reihenfolge der Schritte
- vollständige Datenerhebung
- saubere Übergabe von GPT zu Agent
- reproduzierbare Projekterstellung

---

## Grundprinzip

Der Wizard besteht aus zwei Phasen:

1. GPT-Phase (Denken & Strukturieren)
2. Agent-Phase (Umsetzung im Repository)

Ein Wechsel zur Agent-Phase ist nur erlaubt, wenn die GPT-Phase vollständig abgeschlossen ist.

---

## Gesamt-Flow

1. Start
2. GPT Schritt 1
3. GPT Schritt 2
4. GPT Schritt 3
5. GPT Schritt 4
6. GPT Schritt 5 (Handover)
7. Validierung des Handover-Blocks
8. Übergang zur Agent-Phase
9. Agent Schritt 1
10. Agent Schritt 2
11. Agent Schritt 3
12. Agent Schritt 4
13. Abschluss

---

## Phase 1 – GPT

### Schritt 1 – Projektstart
Prompt:
prompts/gpt/01-gpt-project-start.md

User Input:
- Idee
- Kontext

Output:
- Problem
- Zielgruppe
- Nutzen

---

### Schritt 2 – Projektdefinition
Prompt:
prompts/gpt/02-gpt-project-definition.md

Output:
- Scope
- Ziele
- Systemgrenzen

---

### Schritt 3 – Use Cases
Prompt:
prompts/gpt/03-gpt-usecase-definition.md

Output:
- priorisierte Use Cases

---

### Schritt 4 – Pflichtenheft Vorbereitung
Prompt:
prompts/gpt/04-gpt-pflichtenheft-prep.md

Output:
- strukturierte Anforderungen

---

### Schritt 5 – Handover
Prompt:
prompts/gpt/05-gpt-agent-handover.md

Output:
- PROJEKTKONTEXT Block

---

## Validierung (kritisch)

Der Wizard muss prüfen:

- Ist ein PROJEKTKONTEXT vorhanden?
- Enthält er alle Pflichtsektionen?
- Ist er nicht leer?

Falls nicht:
→ Nutzer darf nicht zur Agent-Phase wechseln

---

## Phase 2 – Agent

### Schritt 1 – Bootstrap
Prompt:
prompts/agent/01-agent-project-bootstrap.md

Input:
- PROJEKTKONTEXT

Output:
- Repository vorbereitet

---

### Schritt 2 – Pflichtenheft
Prompt:
prompts/agent/02-agent-write-pflichtenheft.md

Output:
- docs/pflichtenheft.md

---

### Schritt 3 – Architektur
Prompt:
prompts/agent/03-agent-architecture-setup.md

Output:
- docs/architecture.md

---

### Schritt 4 – Projektstruktur
Prompt:
prompts/agent/04-agent-project-structure.md

Output:
- Struktur + Dateien

---

## UI-/CLI-Design (optional)

Der Wizard kann umgesetzt werden als:

- Web UI
- CLI Tool
- Cursor Plugin
- Chat-basierter Flow

---

## UX-Prinzipien

- klare Schrittführung
- keine freien Sprünge
- immer nur ein aktiver Schritt
- sichtbarer Fortschritt
- klare Übergabe zwischen GPT und Agent

---

## Fehlerfälle

- Nutzer überspringt GPT-Phase
- Handover fehlt
- Kontext unvollständig

→ Wizard muss blockieren

---

## Erweiterbarkeit

Später möglich:

- zusätzliche Prompts
- domänenspezifische Erweiterungen
- automatisierte Auswertung
- Integration mit APIs

---

## Zielzustand

Ein Nutzer kann ohne Vorwissen:

- ein Projekt starten
- alle notwendigen Schritte durchlaufen
- ein strukturiertes, entwicklungsbereites Projekt erhalten

---

## 4. Abschlussprüfung

Führe aus:

git status --short

Erwartung:

- genau eine neue Datei:
  meta/prompt-wizard-spec.md
- keine Änderungen an bestehenden Dateien
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

Eine vollständige Spezifikation für einen Wizard, der den Goldstandard-Prozess vollständig abbildet.
