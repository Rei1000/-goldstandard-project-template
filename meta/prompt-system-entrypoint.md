# Prompt System Entrypoint (Goldstandard)

## Ziel

Dieses Dokument definiert den offiziellen Einstiegspunkt in das Prompt-System.

Es stellt sicher, dass neue Entwickler oder Projektstarter sofort erkennen:

- womit sie beginnen müssen
- welche Reihenfolge gilt
- welche Prompts verpflichtend sind
- wann von GPT zu Agent gewechselt wird

---

## Grundsatz

Der Einstieg in ein neues Projekt erfolgt immer zuerst über die GPT-Phase.

Ein direkter Einstieg über Agent-Prompts ist nicht vorgesehen.

Die Agent-Phase beginnt erst, wenn die GPT-Phase vollständig abgeschlossen ist.

---

## Offizieller Startpunkt

Der offizielle erste Prompt für jedes neue Projekt ist:

`prompts/gpt/01-gpt-project-start.md`

Dieser Prompt ist verpflichtend.

Er dient dazu, das Projekt zunächst fachlich und strukturell zu klären, bevor Dokumente oder Dateien bearbeitet werden.

---

## Verbindliche Pflichtreihenfolge

### Phase 1 – GPT

1. `prompts/gpt/01-gpt-project-start.md`
2. `prompts/gpt/02-gpt-project-definition.md`
3. `prompts/gpt/03-gpt-usecase-definition.md`
4. `prompts/gpt/04-gpt-pflichtenheft-prep.md`

### Phase 2 – Agent

1. `prompts/agent/01-agent-project-bootstrap.md`
2. `prompts/agent/02-agent-write-pflichtenheft.md`
3. `prompts/agent/03-agent-architecture-setup.md`
4. `prompts/agent/04-agent-project-structure.md`

---

## Sichtbarkeit im Repository

Die README des Templates muss diesen Einstieg deutlich sichtbar machen.

Ein neuer Entwickler muss dort sofort erkennen:

- dass zuerst GPT genutzt wird
- welcher Prompt zuerst verwendet wird
- welche Reihenfolge danach gilt
- dass die Agent-Phase erst im zweiten Schritt folgt

---

## Pflichtinformationen für neue Entwickler

Ein neuer Entwickler muss vor Start wissen:

- dieses Repository ist ein Template-System
- das System ist geführt und nicht frei improvisiert
- zuerst GPT, dann Agent
- Dokumentation ist führend
- Git-Workflow beginnt erst mit der Agent-Phase

---

## Zielzustand

Das System gilt als intuitiv nutzbar, wenn:

- ein fremder Entwickler ohne weitere Erklärung starten kann
- die README den Einstieg eindeutig zeigt
- kein Rätselraten über die Reihenfolge notwendig ist
- GPT- und Agent-Phase klar sichtbar getrennt sind

---

## Folgeänderungen

Auf Basis dieses Dokuments sollen später angepasst werden:

- README.md
- tatsächliche Prompt-Dateien unter prompts/
- ggf. UI/Wizard-Einstieg

---

## 4. Abschlussprüfung

Führe aus:

git status --short

Erwartung:

- genau eine neue Datei:
  meta/prompt-system-entrypoint.md
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

Ein verbindliches Einstiegsdokument für das Prompt-System im Goldstandard-Template.
