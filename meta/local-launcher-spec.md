# Local Goldstandard Launcher Specification

## Ziel

Der Local Goldstandard Launcher ist ein lokales Tool mit einfacher UI, das Nutzer Schritt für Schritt durch die Erstellung eines neuen Projekts auf Basis des Goldstandard-Templates führt.

Ziel ist nicht maximale Automatisierung von Anfang an, sondern ein geführter, sicherer und reproduzierbarer Projektstart.

---

## Grundidee

Der Launcher soll:

- das Goldstandard-Template als Basis verwenden
- Projektname und grundlegende Projektdaten abfragen
- GPT-Prompts sichtbar und nutzbar machen
- den GPT-Handover-Kontext speichern
- Agent-Prompts passend zur nächsten Phase bereitstellen
- den Nutzer durch den gesamten Startprozess führen

---

## MVP-Ziel

Die erste Version soll:

- lokal laufen
- eine einfache UI bieten
- keinen Cloud-Zwang haben
- keine automatisierte Steuerung von ChatGPT oder Cursor voraussetzen
- Copy/Paste sauber unterstützen
- Reihenfolge und Kontext sichern

---

## Nicht-Ziele im MVP

Im MVP nicht enthalten:

- automatische ChatGPT-Ausführung
- automatische Cursor-Agent-Steuerung
- automatische GitHub-Ruleset-Konfiguration
- Secrets-Management
- Team-/Permission-Verwaltung
- komplexe Deployment-Automation

Diese Punkte können später ergänzt werden.

---

## Nutzerfluss

1. Launcher starten
2. Projektname eingeben
3. Zielordner wählen
4. Goldstandard-Template klonen oder kopieren
5. GPT-Phase Schritt für Schritt durchlaufen
6. Handover-Kontext speichern
7. Agent-Phase vorbereiten
8. Projekt lokal initialisieren
9. GitHub-Schritte anzeigen oder später automatisieren

---

## Phasen

### Phase 1 – Projektanlage

- Projektname erfassen
- Zielverzeichnis wählen
- Template-Quelle definieren
- Projektordner erzeugen

---

### Phase 2 – GPT-Workflow

- GPT-Prompts 01–05 anzeigen
- aktuelle Prompt-Stufe markieren
- Copy/Paste unterstützen
- Ergebnisse je Schritt optional speichern
- finalen Handover-Kontext validieren

---

### Phase 3 – Agent-Workflow

- Agent-Prompts 01–04 anzeigen
- Handover-Kontext einblenden
- klare Anweisung für Cursor-Agent bereitstellen
- Fortschritt anzeigen

---

### Phase 4 – Projektabschluss

- prüfen, ob Pflichtdokumente vorhanden sind
- offene Punkte anzeigen
- optional Finalize-/Cleanup-Flow vorbereiten

---

## UI-Prinzipien

Die UI soll:

- einfach
- ruhig
- schrittweise
- verständlich
- nicht technisch überladen

sein.

Der Nutzer soll jederzeit wissen:

- wo er im Prozess steht
- was als Nächstes zu tun ist
- welcher Prompt verwendet wird
- welcher Output erwartet wird

---

## Technische Architektur

Empfohlener Start:

- Node.js als Runtime
- lokale Web-UI oder einfacher Browser-Wizard
- Dateisystemzugriff lokal
- keine Serverpflicht außerhalb des lokalen Rechners

Mögliche technische Varianten:

### Variante A – CLI + lokale Browser-UI

- CLI startet lokalen Server
- Browser öffnet Wizard
- leichtgewichtig und plattformnah

### Variante B – Desktop-App

- z. B. Electron oder Tauri
- später möglich
- im MVP nicht notwendig

---

## Datenhaltung

Lokal gespeicherte Daten:

- Projektname
- Zielpfad
- aktueller Schritt
- GPT-Ergebnisse
- Handover-Kontext

Möglicher Speicherort:

`.goldstandard/`

Beispiele:

- `.goldstandard/context.txt`
- `.goldstandard/progress.json`
- `.goldstandard/project-config.json`

---

## GitHub-Integration

Im MVP:

- GitHub-Schritte nur anzeigen
- keine automatische Repo-Erstellung erzwingen

Später möglich:

- GitHub-Repo automatisch erstellen
- Remote setzen
- initial push
- Rulesets per API setzen
- Secrets verwalten

---

## Cursor-/Agent-Integration

Im MVP:

- Agent-Prompts anzeigen
- Handover-Kontext bereitstellen
- Copy/Paste in Cursor-Agent unterstützen

Später möglich:

- Cursor automatisch öffnen
- Agent-Prompt vorbereiten
- direkte Übergabe verbessern

---

## Sicherheitsprinzipien

- keine Secrets automatisch speichern
- keine API-Tokens ohne explizite Zustimmung
- keine versteckten Netzwerkzugriffe
- keine automatischen destruktiven Aktionen

---

## Erweiterungsstufen

### Version 1
- UI zeigt Flow
- Prompt-Anzeige
- Kontextspeicherung

### Version 2
- Projektordner automatisch erzeugen
- Template kopieren
- Platzhalter ersetzen

### Version 3
- Git initialisieren
- GitHub-Repo optional erstellen
- Push vorbereiten

### Version 4
- Rulesets / Governance automatisieren
- Wizard mit Validierung
- stärkerer Cursor-Handoff

---

## Erfolgsdefinition

Der Launcher ist erfolgreich, wenn:

- ein neuer Entwickler ohne Vorwissen starten kann
- die Prompt-Reihenfolge eingehalten wird
- kein Kontext zwischen GPT und Agent verloren geht
- ein neues Projekt reproduzierbar nach Goldstandard entsteht

---

## Abschlussprüfung

Führe aus:

git status --short

Erwartung:

- genau eine neue Datei:
  meta/local-launcher-spec.md
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

Eine klare Spezifikation für den zukünftigen lokalen Goldstandard Launcher.
