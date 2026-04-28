import fs from "fs";
import path from "path";
import { spawnSync } from "node:child_process";

const EXCLUDED_ROOT_ENTRIES = new Set([".git", ".goldstandard", "launcher", "meta", "prompts"]);

function isValidProjectName(name) {
  return typeof name === "string" && /^[a-zA-Z0-9._-]{2,100}$/.test(name);
}

function copyTemplateRecursive(sourceDir, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(sourceDir, entry.name);
    const destPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyTemplateRecursive(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function firstMeaningfulContextLine(contextText) {
  const lines = String(contextText || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("#"))
    .filter((line) => !/^projektkontext:?$/i.test(line));
  return lines[0] || "";
}

function generateProjectReadme(projectName, contextText) {
  const summary = firstMeaningfulContextLine(contextText) || "Projektbeschreibung siehe Kontextdatei.";
  return [
    `# ${projectName}`,
    "",
    "## Kurzbeschreibung",
    summary,
    "",
    "## Ziel des Projekts",
    "Die fachliche Grundlage ist im Projektkontext dokumentiert und dient als verbindlicher Ausgangspunkt.",
    "",
    "## Hinweise",
    "- Vollständiger Kontext: `.goldstandard/context.txt`",
    "- Projektdokumentation und Architektur: `docs/`"
  ].join("\n");
}

function runGit(projectPath, args, errorPrefix) {
  const result = spawnSync("git", args, {
    cwd: projectPath,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: process.env.GIT_AUTHOR_NAME || "Goldstandard Launcher",
      GIT_AUTHOR_EMAIL: process.env.GIT_AUTHOR_EMAIL || "launcher@goldstandard.local",
      GIT_COMMITTER_NAME: process.env.GIT_COMMITTER_NAME || "Goldstandard Launcher",
      GIT_COMMITTER_EMAIL: process.env.GIT_COMMITTER_EMAIL || "launcher@goldstandard.local"
    }
  });
  if (result.status !== 0) {
    const details = (result.stderr || result.stdout || "").trim();
    throw new Error(`${errorPrefix}${details ? `: ${details}` : ""}`);
  }
}

export function createProjectFromTemplate(options) {
  const projectName = typeof options?.projectName === "string" ? options.projectName.trim() : "";
  const targetDirInput = typeof options?.targetDir === "string" ? options.targetDir.trim() : "";
  const templateRoot = typeof options?.templateRoot === "string" ? options.templateRoot.trim() : "";
  const contextContent = typeof options?.contextContent === "string" ? options.contextContent.trim() : "";

  if (!isValidProjectName(projectName)) {
    throw new Error(
      "Ungültiger Projektname. Erlaubt sind 2-100 Zeichen: Buchstaben, Zahlen, Punkt, Unterstrich, Minus."
    );
  }

  if (!path.isAbsolute(targetDirInput)) {
    throw new Error("Der Zielordner muss als absoluter Pfad angegeben werden.");
  }

  if (!path.isAbsolute(templateRoot)) {
    throw new Error("templateRoot muss als absoluter Pfad angegeben werden.");
  }
  if (!contextContent) {
    throw new Error("Kein verwertbarer Projektkontext vorhanden. Bitte zuerst im Launcher speichern.");
  }

  const targetDirResolved = path.resolve(targetDirInput);
  const templateRootResolved = path.resolve(templateRoot);

  if (!fs.existsSync(targetDirResolved) || !fs.statSync(targetDirResolved).isDirectory()) {
    throw new Error("Der Zielordner existiert nicht oder ist kein Verzeichnis.");
  }

  if (!fs.existsSync(templateRootResolved) || !fs.statSync(templateRootResolved).isDirectory()) {
    throw new Error("Das Template-Root existiert nicht oder ist kein Verzeichnis.");
  }

  const projectPath = path.join(targetDirResolved, projectName);
  if (fs.existsSync(projectPath)) {
    throw new Error("Projektordner existiert bereits. Bitte anderen Namen oder Zielordner wählen.");
  }

  fs.mkdirSync(projectPath, { recursive: false });

  const rootEntries = fs.readdirSync(templateRootResolved, { withFileTypes: true });
  for (const entry of rootEntries) {
    if (EXCLUDED_ROOT_ENTRIES.has(entry.name)) {
      continue;
    }

    const srcPath = path.join(templateRootResolved, entry.name);
    const destPath = path.join(projectPath, entry.name);

    if (entry.isDirectory()) {
      copyTemplateRecursive(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }

  const projectContextDir = path.join(projectPath, ".goldstandard");
  fs.mkdirSync(projectContextDir, { recursive: true });
  fs.writeFileSync(path.join(projectContextDir, "context.txt"), contextContent, "utf8");

  const readmePath = path.join(projectPath, "README.md");
  fs.writeFileSync(readmePath, generateProjectReadme(projectName, contextContent), "utf8");

  runGit(projectPath, ["init"], "Git-Initialisierung fehlgeschlagen");
  runGit(projectPath, ["add", "."], "Git-Add fehlgeschlagen");
  runGit(
    projectPath,
    ["commit", "-m", `chore: initialize ${projectName} from goldstandard template`],
    "Initial-Commit fehlgeschlagen"
  );

  return {
    success: true,
    projectPath,
    nextSteps: [
      "Im Launcher bleiben und GPT-Handover abschließen",
      "Workflow-Input erzeugen und kopieren",
      "Zielprojekt in Cursor öffnen und Agent starten",
      "Nach dem ersten Push GitHub Setup Checkliste prüfen: meta/github-setup-checklist.md"
    ]
  };
}
