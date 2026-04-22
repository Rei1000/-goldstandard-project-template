# Artifact Reclassification Analysis (Goldstandard)

## Ziel

Diese Analyse bewertet die aktuell im Repository vorhandenen Dokumente und ordnet sie den Ebenen `docs/`, `prompts/` oder `meta/` zu.

Ziel ist es, eine saubere Grundlage für die nächste strukturelle Migration zu schaffen.

---

## Bewertungsmaßstab

Eine Datei gehört zu:

### docs/
wenn sie dauerhaft zur Fach- oder Projektdokumentation eines realen Projekts gehört.

### prompts/
wenn sie aktiv als auszuführender bzw. zu kopierender Prompt verwendet wird.

### meta/
wenn sie das Goldstandard-System, das Template, die Bootstrap-Logik, den Prompt-Mechanismus oder die Template-Weiterentwicklung beschreibt.

---

## Untersuchte Dateien

### `docs/github-setup-checklist.md`

- **Kurzbeschreibung:** Schritt-für-Schritt-Anleitung zur Einrichtung von GitHub (Rulesets, Branch Protection, CI-Anbindung) für ein neues Repo auf Goldstandard-Niveau.
- **aktueller Charakter:** Mischung aus **projektbezogener Betriebsanleitung** (jedes echte Projekt braucht GitHub) und **Template-/Standardvorgaben** (konkrete Goldstandard-Werte).
- **empfohlene Zielkategorie:** `meta/` (als **Template-Betriebsdokumentation**), optional Duplikat oder Kurzverweis unter `docs/` nur wenn explizit als „Projekt-Runbook“ im Sinne des Kunden geführt.
- **Begründung:** Inhalt ist nicht fachdomänenspezifisch, sondern beschreibt die **Wiederholbarkeit des Goldstandards** beim Repo-Setup; passt zur Meta-Ebene neben Prompt-System und Migration.
- **Migrationsbedarf:** ja
- **Bemerkung:** In echten Projekten weiterhin **hoch relevant**; Verschiebung nach `meta/` ändert nicht die Nutzung, nur die logische Einordnung. README kann weiterhin darauf verlinken.

---

### `docs/goldstandard-template-plan.md`

- **Kurzbeschreibung:** Definiert Ziele des Goldstandards, wiederverwendbare vs. projektspezifische Bausteine, Governance und Dokumentationsstruktur.
- **aktueller Charakter:** **Reine Template- und Standarddokumentation**, kein fachliches Pflichtenheft.
- **empfohlene Zielkategorie:** `meta/`
- **Begründung:** Beschreibt **das Referenzmodell** und die Philosophie des Templates, nicht die konkrete Fachlösung eines Projekts.
- **Migrationsbedarf:** ja
- **Bemerkung:** Wird in `template-repository-spec.md` und `bootstrap-system-plan.md` explizit als Bestandteil genannt.

---

### `docs/bootstrap-system-plan.md`

- **Kurzbeschreibung:** Plan für reproduzierbare Projekterstellung (Varianten Template / Master Prompt / Kombination), Abhängigkeiten und Rollen.
- **aktueller Charakter:** **System- und Prozessdesign** auf Template-Ebene.
- **empfohlene Zielkategorie:** `meta/`
- **Begründung:** Steuert **wie** Projekte aus dem Standard entstehen, nicht **was** das Fachprojekt leistet.
- **Migrationsbedarf:** ja
- **Bemerkung:** Verweist auf Master Start Prompt und Checklisten; nach Migration Pfade in verweisenden Dokumenten anpassen.

---

### `docs/template-repository-spec.md`

- **Kurzbeschreibung:** Spezifikation der Zielstruktur des Template-Repos, Verzeichnisse, 1:1-Übernahmen, Ausschlüsse.
- **aktueller Charakter:** **Technische Template-Spezifikation** (noch mit teils veralteten Pfadlisten unter `docs/` für Dateien, die künftig unter `meta/` liegen).
- **empfohlene Zielkategorie:** `meta/`
- **Begründung:** Definiert das **Artifact-Set des Standards**, nicht die fachliche Projektdokumentation.
- **Migrationsbedarf:** ja (inkl. **Pfad- und Listenkorrektur** in einem späteren Schritt, ohne inhaltliche Neuausrichtung).
- **Bemerkung:** Zentrale Referenz für „was gehört ins Template“; gehört logisch neben `meta-migration-plan` und `artifact-lifecycle`.

---

### `docs/template-repository-file-map.md`

- **Kurzbeschreibung:** Tabellarische Datei- und Ordnerkarte (Root, .github, docs, Backend, Frontend) mit Typ/Status.
- **aktueller Charakter:** **Inventar und Zielbild** des Template-Repos; teils **Legacy-Drift** (z. B. Referenz auf `docs/project-scope.md`, die im aktuellen Tree nicht vorkommt).
- **empfohlene Zielkategorie:** `meta/`
- **Begründung:** Rein **struktur- und templatebezogen**; begleitet Spezifikation und Migration.
- **Migrationsbedarf:** ja
- **Bemerkung:** Eignet sich für einen **kleinen inhaltlichen Bereinigungsschritt** (fehlende Dateien klären oder Zeilen entfernen) – getrennt von der reinen Ordnermigration.

---

### `docs/master-start-prompt.md`

- **Kurzbeschreibung:** Großer **Agent-Prompt** zur Initialisierung eines neuen Projekts (Struktur, Governance, Doku-Platzhalter, Cursor-Regeln).
- **aktueller Charakter:** **Operatives Prompt-Artefakt** (analog zu `prompts/agent/*`), historisch der „Einstieg vor dem Prompt-Ordnersystem“.
- **empfohlene Zielkategorie:** `prompts/` (z. B. `prompts/agent/00-agent-master-start.md` oder unter `meta/` falls ausschließlich als **archivierte Referenz** geführt werden soll).
- **Begründung:** Inhalt ist **copy-paste-/agent-ausführbar**, nicht klassische lesende Projektdokumentation; überschneidet sich funktional mit der **neuen geführten GPT→Agent-Kette** unter `prompts/`.
- **Migrationsbedarf:** ja (Kategorie-Wechsel + **Klärung** gegenüber `01-agent-project-bootstrap` und README).
- **Bemerkung:** **Grenzfall „Legacy vs. Kanon“:** Entweder offiziell deprecaten und auf `prompts/` verweisen oder in `prompts/` integrieren und hier entfernen.

---

### Zusätzlich: übrige Dateien unter `docs/` (Platzhalter / Projektdokumentation)

| Pfad | Kurzbeschreibung | empfohlene Zielkategorie | Migrationsbedarf | Bemerkung |
|------|------------------|--------------------------|------------------|-----------|
| `docs/pflichtenheft.md` | Fachliches Pflichtenheft (Platzhalter) | `docs/` | nein | Kern der Projektdokumentation |
| `docs/architecture.md` | Architektur (Platzhalter) | `docs/` | nein | |
| `docs/projectstructure.md` | Projektstruktur (Platzhalter) | `docs/` | nein | |
| `docs/projektrules.md` | Projektregeln (Platzhalter) | `docs/` | nein | |
| `docs/datenbankmodell.md` | Datenmodell (Platzhalter) | `docs/` | nein | |

---

### Zusätzlich: `README.md` (Repository-Root)

- **Kurzbeschreibung:** Einstieg, Prompt-Reihenfolge, Verweis auf `meta/prompt-index.md`, Trennung docs/prompts/meta.
- **aktueller Charakter:** **Onboarding- und Navigationsdokument** für Menschen und Agenten; projekt- und templateübergreifend.
- **empfohlene Zielkategorie:** am **Root** belassen (üblich); inhaltlich **Meta-nah**, technisch keine der drei Ordner.
- **Begründung:** Standard für alle GitHub-Repos; nicht nach `docs/` verschieben ohne explizite Repo-Politik.
- **Migrationsbedarf:** nein (Pfad)
- **Bemerkung:** Links zu künftig nach `meta/` verschobenen **Checklisten/Specs** müssen bei Migration angepasst werden.

---

### Zusätzlich: `prompts/gpt/*.md` und `prompts/agent/*.md`

- **Kurzbeschreibung:** Verbindliche GPT- und Agent-Prompts für den geführten Projektstart.
- **aktueller Charakter:** **Operative Prompts** (kanonisch).
- **empfohlene Zielkategorie:** `prompts/` (bereits korrekt)
- **Begründung:** Erfüllt exakt die Prompt-Ebene.
- **Migrationsbedarf:** nein
- **Bemerkung:** Beziehung zu `master-start-prompt.md` in Sonderfällen klären.

---

### Zusätzlich: bestehende Dateien unter `meta/`

- **Kurzbeschreibung:** Prompt-System, Startfluss, Index, Lifecycle, Migrationsplan (bereits verschoben).
- **aktueller Charakter:** **Systemdokumentation** (korrekt eingeordnet).
- **empfohlene Zielkategorie:** `meta/` (unverändert)
- **Migrationsbedarf:** nein
- **Bemerkung:** Nach Verschieben der übrigen Kandidaten aus `docs/` hier Querverweise und ggf. `prompt-index.md` aktualisieren.

---

## Sonderfälle

### Gemischter Charakter

- **`docs/github-setup-checklist.md`:** operativ für jedes Projekt nützlich, inhaltlich aber **Standard-/Template-getrieben** → praktisch **Meta mit Projektbezug**; einheitlich `meta/` reduziert Verwechslung mit `docs/pflichtenheft.md` & Co.

### Historisch / überholt / Legacy

- **`docs/master-start-prompt.md`:** älteres **Monolith-Prompt**-Modell; das Repository hat nun **nummerierte Prompts** unter `prompts/`. Risiko: **doppelte Wahrheit** für den Projektstart, wenn beides ohne Erklärung existiert.
- **`docs/template-repository-file-map.md`:** veraltete oder nie angelegte Einträge (z. B. `docs/project-scope.md`) → **Dokumentations-Drift**, nicht nur Ordnerfrage.

### Durch neues Prompt-System teilweise ersetzt

- Der **geführt GPT-first**-Ablauf in `meta/project-start-flow.md` / `prompts/*` **überlappt thematisch** mit Teilen des Master-Start-Prompts (Initialstruktur, Governance). Klärung nötig: **ein kanonischer Einstieg** im README.

### Eher archivieren als verschieben

- Falls `master-start-prompt.md` **nicht** mehr gepflegt werden soll: nach `meta/archive/` oder mit Deprecation-Header in `meta/` ablegen – **nur nach expliziter Entscheidung**, nicht blind löschen.

---

## Vorläufige Zielstruktur

### docs/
- `docs/pflichtenheft.md`
- `docs/architecture.md`
- `docs/projectstructure.md`
- `docs/projektrules.md`
- `docs/datenbankmodell.md`

*(Ausschließlich dauerhafte, fach- und projektbezogene Dokumentation.)*

### prompts/
- `prompts/gpt/01-gpt-project-start.md` … `04-gpt-pflichtenheft-prep.md`
- `prompts/agent/01-agent-project-bootstrap.md` … `04-agent-project-structure.md`
- optional nach Klärung: **`master-start-prompt`-Inhalt** hier konsolidieren oder durch Verweis ersetzen

### meta/
- Bereits vorhandene: `prompt-index.md`, `project-start-flow.md`, `prompt-system-*`, `artifact-lifecycle.md`, `meta-migration-plan.md`
- **empfohlen als Nächstes zu verschieben:**  
  `github-setup-checklist.md`, `goldstandard-template-plan.md`, `bootstrap-system-plan.md`, `template-repository-spec.md`, `template-repository-file-map.md`
- optional: `master-start-prompt.md` (als Prompt unter `prompts/` **oder** als archivierte Meta-Referenz)

---

## Empfehlung für den nächsten Migrationsschritt

1. **Als Nächstes verschieben (niedriges Risiko, hoher Klarheitsgewinn):**  
   `goldstandard-template-plan.md`, `bootstrap-system-plan.md`, `template-repository-spec.md`, `template-repository-file-map.md`, `github-setup-checklist.md` → alles nach `meta/` in einem PR, **inkl. README- und Querverweis-Update** (keine inhaltliche Neuschreibung, nur Pfade).
2. **Bewusst in `docs/` lassen:**  
   `pflichtenheft.md`, `architecture.md`, `projectstructure.md`, `projektrules.md`, `datenbankmodell.md`.
3. **Zuerst inhaltlich klären (vor Verschiebung):**  
   Rolle von **`master-start-prompt.md`** vs. `prompts/agent/01-agent-project-bootstrap.md` und README-Einstieg; danach entweder Migration nach `prompts/`, Deprecation, oder Archiv unter `meta/`.
4. **Separater Cleanup-/Legacy-Schritt sinnvoll:** ja – für **`template-repository-file-map.md`** (fehlende Pfade) und für **Doppelführung Master-Start vs. Prompt-System**; getrennt von der reinen Ordnermigration, damit Git-Historie und Reviews überschaubar bleiben.

---

## Abschluss

Die Analyse soll eine Entscheidungsgrundlage sein, aber noch keine Migration durchführen.

---

## 5. Abschlussprüfung

Führe aus:

git status --short

Erwartung:

- genau eine neue Datei:
  meta/artifact-reclassification-analysis.md
- keine Änderungen an bestehenden Dateien
- nichts gestaged
- kein Commit

---

## Verboten

- keine bestehenden Dateien verschieben
- keine Inhalte bestehender Dateien ändern
- kein git add .
- kein Commit
- kein Push

---

## Ergebnis

Eine saubere Analyse als Grundlage für die nächste Re-Klassifikation und Migration der verbleibenden Goldstandard-Artefakte.
