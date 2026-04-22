# Meta Migration Plan (Goldstandard)

## Ziel

Dieses Dokument definiert die schrittweise Einführung eines `meta/`-Ordners im Goldstandard-Template.

Ziel ist es:
- Projektdokumentation von Meta-/Systemdokumentation zu trennen
- die Struktur für reale Projekte verständlicher zu machen
- die Grundlage für einen späteren Finalize-/Cleanup-Prozess zu schaffen

---

## Ausgangslage

Aktuell befinden sich sowohl Projektdokumentation als auch Goldstandard-/Systemdokumentation unter `docs/`.

Dadurch liegen dort gemeinsam:

### Projektdokumentation
- `docs/pflichtenheft.md`
- `docs/architecture.md`
- `docs/projectstructure.md`
- `docs/projektrules.md`
- `docs/datenbankmodell.md`

### Meta-/Systemdokumentation
- `docs/prompt-system-implementation-plan.md`
- `docs/prompt-system-architecture.md`
- `docs/project-start-flow.md`
- `docs/prompt-system-entrypoint.md`
- `docs/prompt-index.md`
- `docs/artifact-lifecycle.md`

Diese Mischung ist für reale Projekte langfristig nicht ideal.

---

## Zielstruktur

### docs/
Bleibt reserviert für dauerhafte Projektdokumentation.

Dazu gehören:

- `docs/pflichtenheft.md`
- `docs/architecture.md`
- `docs/projectstructure.md`
- `docs/projektrules.md`
- `docs/datenbankmodell.md`

### meta/
Enthält Goldstandard- und Systemdokumentation.

Dazu gehören künftig:

- `meta/prompt-system-implementation-plan.md`
- `meta/prompt-system-architecture.md`
- `meta/project-start-flow.md`
- `meta/prompt-system-entrypoint.md`
- `meta/prompt-index.md`
- `meta/artifact-lifecycle.md`

---

## Migrationskandidaten

### Von docs/ nach meta/ verschieben

- `docs/prompt-system-implementation-plan.md`
- `docs/prompt-system-architecture.md`
- `docs/project-start-flow.md`
- `docs/prompt-system-entrypoint.md`
- `docs/prompt-index.md`
- `docs/artifact-lifecycle.md`

### In docs/ belassen

- `docs/pflichtenheft.md`
- `docs/architecture.md`
- `docs/projectstructure.md`
- `docs/projektrules.md`
- `docs/datenbankmodell.md`

---

## Gründe für die Trennung

### docs/
Soll im echten Projekt nur das enthalten, was dauerhaft für das Fachprojekt relevant ist.

### meta/
Soll enthalten, was für:
- Goldstandard-Weiterentwicklung
- Prompt-System
- Wizard-/UI-Konzept
- Template-Mechanik
relevant ist.

---

## Empfohlene Migrationsreihenfolge

### Schritt 1
`meta/` als neuen Ordner einführen

### Schritt 2
Meta-Dokumente aus `docs/` nach `meta/` verschieben

### Schritt 3
README anpassen:
- Links auf Meta-Dokumente aktualisieren
- Trennung von Projekt- und Meta-Ebene sichtbar machen

### Schritt 4
Prompt- und Lifecycle-Dokumente auf neue Pfade prüfen

### Schritt 5
Optional später:
- Finalize-/Cleanup-Workflow definieren
- Lean Project Mode unterstützen

---

## Risiken

- Broken Links in README oder anderen Dokumenten
- Verwirrung bei gemischten alten und neuen Pfaden
- Dopplungen, wenn Dateien kopiert statt verschoben werden

---

## Migrationsregeln

- keine inhaltliche Änderung während der Verschiebung
- erst Struktur trennen, dann Texte bei Bedarf nachziehen
- README und Referenzen im selben Themenblock anpassen
- keine Projektdateien unnötig berühren

---

## Zielzustand

Die Migration gilt als erfolgreich, wenn:

- `docs/` nur noch Projektdokumentation enthält
- `meta/` die Goldstandard-Systemdokumentation enthält
- Links und Referenzen konsistent sind
- ein reales Projekt nicht unnötig mit Meta-Dokumentation vermischt ist

---

## Folgeänderungen

Nach diesem Plan können später folgen:

- Einführung des Ordners `meta/`
- tatsächliche Verschiebung der Meta-Dokumente
- README-Anpassung
- Finalize-/Cleanup-Prompt
- Wizard-/UI-Spezifikation

---

## 4. Abschlussprüfung

Führe aus:

git status --short

Erwartung:

- genau eine neue Datei:
  docs/meta-migration-plan.md
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

Ein verbindlicher Migrationsplan für die spätere Trennung von `docs/` und `meta/` im Goldstandard-Template.
