# Launcher Automation Plan (Goldstandard)

## Ziel

Dieses Dokument definiert die schrittweise Automatisierung des lokalen Goldstandard Launchers.

Ziel ist es, den Nutzer stärker zu entlasten, ohne den kontrollierten Goldstandard-Prozess zu gefährden.

---

## Grundsatz

Automatisierung darf den Prozess unterstützen, aber nicht unkontrolliert übernehmen.

Der Launcher soll:
- Reihenfolge erzwingen
- Kontext sichern
- Copy/Paste reduzieren
- Projektanlage vorbereiten
- Fehler vermeiden

Der Launcher soll im MVP nicht:
- ChatGPT automatisch steuern
- Cursor-Agent automatisch starten
- GitHub-Einstellungen ungefragt ändern
- destruktive Aktionen ohne Bestätigung ausführen

---

## Automatisierungsstufen

### Stufe 1 – Unterstützung

Ziel:
- Nutzer führen
- Prompts anzeigen
- Prompts kopieren
- Kontext speichern
- Fortschritt speichern

Status:
- weitgehend vorhanden

---

### Stufe 2 – Projektanlage lokal

Ziel:
- Projektname abfragen
- Zielverzeichnis wählen
- Template lokal kopieren oder klonen
- Platzhalter ersetzen
- Projektkonfiguration speichern

Automatisierbar:
- Ordner anlegen
- Template-Dateien kopieren
- README-Projekttitel ersetzen
- `.goldstandard/project-config.json` schreiben

Nicht automatisch:
- fachliche Inhalte erfinden
- Pflichtenheft ohne GPT-Ergebnis befüllen

---

### Stufe 3 – Git-Vorbereitung

Ziel:
- Git lokal initialisieren
- ersten Commit vorbereiten
- Remote-Setup optional anzeigen

Automatisierbar:
- `git init`
- initialer Branch `main`
- vorbereitende Commit-Hinweise
- optional `git status`

Mit Bestätigung:
- Commit ausführen
- Remote setzen
- Push vorbereiten

---

### Stufe 4 – GitHub-Integration

Ziel:
- GitHub-Repository optional erstellen
- Remote setzen
- initial push vorbereiten

Automatisierbar mit Token:
- Repository erstellen
- Remote setzen
- Push ausführen

Nicht im ersten Schritt:
- Branch Protection Rules
- Secrets
- Teams / Permissions

Diese können später über GitHub API ergänzt werden.

---

### Stufe 5 – Agent-Handoff verbessern

Ziel:
- Agent-Prompt automatisch mit Handover-Kontext kombinieren
- fertigen Agent-Eingabetext erzeugen

Automatisierbar:
- aktuellen Agent-Prompt laden
- gespeicherten Kontext davor einfügen
- Copy-Button für kombinierten Agent-Input

Nicht automatisch:
- Cursor-Agent ohne Nutzeraktion starten

---

## Priorisierte nächste Automatisierung

Der nächste sinnvolle Schritt ist:

### Projektanlage lokal

Begründung:
- hoher Nutzen
- geringes Risiko
- keine externen APIs
- kein ChatGPT-/Cursor-Zwang
- passt gut zum bestehenden Launcher

MVP-Feature:
- Eingabe Projektname
- Eingabe Zielordner
- Kopieren des Templates in neuen Projektordner
- Speichern von `.goldstandard/project-config.json`

---

## Sicherheitsregeln

- Keine bestehenden Ordner überschreiben ohne Bestätigung
- Keine Secrets speichern
- Keine GitHub API ohne explizites Token
- Keine automatischen destruktiven Aktionen
- Keine versteckten Netzwerkzugriffe

---

## UX-Regeln

Jede Automatisierung muss erklären:

- was passiert
- warum es passiert
- wo etwas gespeichert wird
- wie der Nutzer den Schritt rückgängig machen kann

---

## Empfohlener nächster Implementierungsschritt

Nach diesem Plan sollte implementiert werden:

`Launcher Projektanlage lokal`

Dazu gehören:

- UI-Bereich „Neues Projekt anlegen“
- Felder:
  - Projektname
  - Zielpfad
- API-Endpunkt:
  - POST `/api/project/create`
- Ausgabe:
  - angelegter Projektpfad
  - gespeicherte Konfiguration
  - nächste Schritte

---

## Spätere Erweiterungen

- Git init
- GitHub Repo Erstellung
- GitHub Ruleset Automatisierung
- kombinierter Agent-Prompt
- Projekt-Finalisierung / Cleanup
- optional Web-Wizard Packaging

---

## Erfolgskriterien

Die Automatisierung ist erfolgreich, wenn:

- Nutzer weniger manuell kopieren muss
- Reihenfolge weiterhin kontrolliert bleibt
- Kontext nicht verloren geht
- kein gefährlicher Automatismus eingeführt wird
- ein Projekt reproduzierbar vorbereitet werden kann

---

## Abschlussprüfung

Führe aus:

git status --short

Erwartung:

- genau eine neue Datei:
  meta/launcher-automation-plan.md
- keine Änderungen an bestehenden Dateien
- nichts gestaged
- kein Commit

---

## Verboten

- kein Code
- keine bestehenden Dateien ändern
- kein git add .
- kein Commit
- kein Push

---

## Ergebnis

Ein kontrollierter Automatisierungsplan für den lokalen Goldstandard Launcher.
