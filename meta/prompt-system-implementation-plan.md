# Prompt System Implementation Plan (Goldstandard)

## Ziel

Ziel dieses Dokuments ist die strukturierte Weiterentwicklung des Prompt-Systems, sodass neue Projekte:

- geführt gestartet werden können
- reproduzierbar aufgebaut werden
- Architektur- und Qualitätsstandards automatisch einhalten
- sowohl ChatGPT als auch Cursor-Agent optimal nutzen

---

## Ist-Zustand

Aktuell existieren:

- Template-Struktur (backend, frontend, docs, etc.)
- cursor.rules mit Architektur- und Prozessregeln
- einzelne Prompts ohne klare Reihenfolge
- keine definierte Einstiegspunkt-Logik für neue Projekte

Probleme:

- unklarer Start für neue Entwickler
- keine klare Trennung zwischen GPT- und Agent-Prompts
- fehlende Prozessführung von Idee → Umsetzung

---

## Zielzustand

Das System soll:

- einen klaren Startpunkt haben (Master Start Prompt)
- GPT-Phase und Agent-Phase strikt trennen
- eine feste Reihenfolge von Prompts definieren
- dokumentieren, welcher Prompt wann verwendet wird
- Outputs standardisieren (Projektdefinition, Pflichtenheft, etc.)
- später durch eine UI / Wizard erweiterbar sein

---

## Phasenmodell

### Phase A – Prompt-System definieren

Ziel:
- klare Trennung zwischen GPT und Agent
- Definition von Rollen und Verantwortlichkeiten

Ergebnis:
- Dokument mit Prompt-Architektur
- Definition von Input/Output pro Prompt
- Namenskonvention

---

### Phase B – Startfluss definieren

Ziel:
- klarer Ablauf für neue Projekte

Ergebnis:
- Schritt-für-Schritt Flow:
  1. Projektstart (GPT)
  2. Projektdefinition
  3. Use Cases
  4. Pflichtenheft
  5. Übergabe an Agent

---

### Phase C – Prompt-Dateien strukturieren

Ziel:
- konkrete Umsetzung im Repository

Ergebnis:

Ordnerstruktur:

prompts/
  gpt/
    01-gpt-project-start.md
    02-gpt-project-definition.md
    03-gpt-usecase-definition.md
    04-gpt-pflichtenheft-prep.md
  agent/
    11-agent-project-bootstrap.md
    12-agent-write-pflichtenheft.md
    13-agent-architecture-setup.md

---

### Phase D – UI / Wizard (optional)

Ziel:
- geführter Projektstart ohne manuelles Prompt-Kopieren

Mögliche Varianten:
- CLI Tool
- Web UI
- Cursor Plugin
- Formular-basierter Wizard

Funktionen:
- Schritt-für-Schritt Abfrage
- automatische Prompt-Ausführung
- Übergabe an Agent

---

## Arbeitspakete

### Phase A
- Prompt-Rollen definieren
- Namensschema festlegen
- Input/Output definieren

### Phase B
- Startflow dokumentieren
- Reihenfolge festlegen
- Übergabepunkte definieren

### Phase C
- Prompts erstellen
- bestehende Prompts migrieren
- README ergänzen

### Phase D (optional)
- UI-Konzept erstellen
- Tooling evaluieren
- MVP definieren

---

## Abhängigkeiten

- Phase B benötigt Ergebnisse aus Phase A
- Phase C benötigt definierte Struktur aus Phase B
- Phase D basiert auf vollständig definiertem Prompt-System

---

## Definition of Done

Das Prompt-System gilt als vollständig, wenn:

- ein klarer Einstiegspunkt existiert
- GPT- und Agent-Prompts getrennt sind
- alle Prompts nummeriert und dokumentiert sind
- ein vollständiger Projektstart ohne externe Erklärung möglich ist
- ein fremder Entwickler das System intuitiv nutzen kann

---

## Ausblick

Nach Abschluss kann das System erweitert werden durch:

- automatisierte Projektinitialisierung
- Integration in CI/CD
- Prompt-basierte Codegenerierung
- UI-gestützten Projektstart

---

## 4. Abschlussprüfung

Führe aus:

git status --short

Erwartung:

- genau eine neue Datei:
  meta/prompt-system-implementation-plan.md
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

Ein vollständiger, strukturierter Implementierungsplan für den Ausbau des Prompt-Systems im Goldstandard-Template.
