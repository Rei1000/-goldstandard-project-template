# Artifact Lifecycle (Goldstandard)

## Ziel

Dieses Dokument definiert die Trennung und den Lebenszyklus der Artefakte im Goldstandard-Template.

Es legt fest:
- welche Inhalte dauerhaft Teil eines realen Projekts sind
- welche Inhalte nur für die Projektinitialisierung benötigt werden
- welche Inhalte zur Meta-Ebene des Goldstandards gehören
- wie ein späterer Finalize- oder Cleanup-Schritt aussehen soll

---

## Grundprinzip

Ein auf dem Goldstandard basierendes Projekt besteht aus drei Ebenen:

1. Projektdokumentation
2. operative Startwerkzeuge
3. Meta-/Systemdokumentation

Diese Ebenen sollen künftig strukturell getrennt werden.

---

## Zielstruktur

### docs/
Enthält die dauerhafte Projektdokumentation.

Beispiele:
- `docs/pflichtenheft.md`
- `docs/architecture.md`
- `docs/projectstructure.md`
- `docs/projektrules.md`
- `docs/datenbankmodell.md`

Diese Dateien bleiben dauerhaft Teil des Projekts.

---

### prompts/
Enthält die operativen Start- und Übergabeprompts.

Beispiele:
- `prompts/gpt/...`
- `prompts/agent/...`

Diese Dateien dienen dem geführten Projektstart.

Sie können:
- dauerhaft im Projekt bleiben
- oder später optional archiviert bzw. entfernt werden

abhängig vom gewünschten Betriebsmodell.

---

### meta/
Enthält Goldstandard-spezifische Meta-Dokumentation.

Beispiele:
- Prompt-System-Implementierungsplan
- Prompt-System-Architektur
- Startfluss
- Einstiegspunkt
- Prompt-Index
- Wizard-/UI-Spezifikation

Diese Dateien dienen:
- dem Aufbau und Verständnis des Systems
- der Template-Weiterentwicklung
- der späteren UI-/Wizard-Logik

Sie gehören nicht zwingend zur dauerhaften Projektdokumentation eines Fachprojekts.

---

## Klassifikation der Artefakte

### Dauerhaft im Projekt behalten

Diese Artefakte bleiben in jedem echten Projekt:

- README
- `.github/`
- `.cursor/cursor.rules`
- `docs/pflichtenheft.md`
- `docs/architecture.md`
- `docs/projectstructure.md`
- `docs/projektrules.md`
- `docs/datenbankmodell.md`
- Docker-/CI-/Infra-Basis

---

### Für die Initialphase erforderlich

Diese Artefakte sind für den Start wichtig, aber nicht immer dauerhaft notwendig:

- `prompts/gpt/...`
- `prompts/agent/...`

Sie können später:
- erhalten bleiben
- archiviert werden
- oder in einem Finalize-Schritt entfernt werden

---

### Meta-/Systemartefakte

Diese Artefakte dienen dem Goldstandard selbst:

- Prompt-System-Plan
- Prompt-System-Architektur
- Prompt-Index
- Startfluss
- Einstiegspunkt
- zukünftige Wizard-/UI-Spezifikationen

Diese sollen künftig unter `meta/` statt unter `docs/` liegen.

---

## Empfohlenes Betriebsmodell

### Standardmodell
- `docs/` bleibt im Projekt
- `prompts/` bleibt zunächst im Projekt
- `meta/` bleibt im Template und kann im Projekt optional erhalten bleiben

### Lean Project Mode
Nach abgeschlossener Projektinitialisierung:
- `prompts/` optional archivieren oder entfernen
- `meta/` archivieren oder entfernen
- nur projektrelevante `docs/` und technische Basis behalten

### Transparent Project Mode
- `docs/`, `prompts/` und `meta/` bleiben erhalten
- vollständige Nachvollziehbarkeit des Projektstarts bleibt im Repo sichtbar

---

## Finalize-/Cleanup-Idee

Ein späterer Finalize- oder Cleanup-Prompt kann dafür sorgen, dass:

- nicht mehr benötigte Meta-Dateien entfernt oder archiviert werden
- optionale Startprompts entfernt werden
- das Projekt in einen „Lean Project Mode“ überführt wird

WICHTIG:
Ein solcher Schritt darf nie blind löschen, sondern muss auf klaren Regeln basieren.

---

## Konsequenz für die zukünftige Template-Struktur

Die zukünftige Struktur soll langfristig sein:

- `docs/` → Projektdokumentation
- `prompts/` → operative Startprompts
- `meta/` → Goldstandard-Meta-Ebene

Diese Trennung soll schrittweise eingeführt werden.

---

## Zielzustand

Das System gilt als sauber getrennt, wenn:

- Projektdokumentation klar von Meta-Dokumentation getrennt ist
- Startprompts klar von dauerhaften Projektdokumenten getrennt sind
- ein reales Projekt nicht unnötig mit Goldstandard-Meta-Artefakten überladen bleibt
- ein optionaler Finalize-Schritt später möglich ist

---

## Folgeänderungen

Auf Basis dieses Dokuments können später erfolgen:

- Einführung eines `meta/`-Ordners
- Migration bestehender Meta-Dokumente aus `docs/` nach `meta/`
- Definition eines Finalize-/Cleanup-Prompts
- Spezifikation eines Wizard-/UI-gestützten Start- und Abschlussprozesses

---

## 4. Abschlussprüfung

Führe aus:

git status --short

Erwartung:

- genau eine neue Datei:
  docs/artifact-lifecycle.md
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

Ein verbindliches Dokument zur Trennung und zum Lebenszyklus der Artefakte im Goldstandard-Template.
