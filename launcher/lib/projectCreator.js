import fs from "fs";
import path from "path";

const EXCLUDED_ROOT_ENTRIES = new Set([".git", ".goldstandard", "launcher"]);
const GENERIC_TITLES = new Set([
  "# Projekt-Template (Goldstandard)",
  "# Project Template (Goldstandard)",
  "# Projekt Template (Goldstandard)"
]);

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

function rewriteReadmeTitle(projectDir, projectName) {
  const readmePath = path.join(projectDir, "README.md");
  if (!fs.existsSync(readmePath)) {
    return;
  }

  const original = fs.readFileSync(readmePath, "utf8");
  const lines = original.split("\n");
  if (lines.length === 0) {
    return;
  }

  const first = lines[0].trim();
  if (GENERIC_TITLES.has(first)) {
    lines[0] = `# ${projectName}`;
    fs.writeFileSync(readmePath, lines.join("\n"), "utf8");
  }
}

export function createProjectFromTemplate(options) {
  const projectName = typeof options?.projectName === "string" ? options.projectName.trim() : "";
  const targetDirInput = typeof options?.targetDir === "string" ? options.targetDir.trim() : "";
  const templateRoot = typeof options?.templateRoot === "string" ? options.templateRoot.trim() : "";

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
  const projectConfig = {
    projectName,
    createdAt: new Date().toISOString(),
    templateSource: templateRootResolved
  };
  fs.writeFileSync(
    path.join(projectContextDir, "project-config.json"),
    JSON.stringify(projectConfig, null, 2),
    "utf8"
  );

  rewriteReadmeTitle(projectPath, projectName);

  return {
    success: true,
    projectPath,
    nextSteps: [
      "Projekt in Cursor öffnen",
      "GPT-Phase über den Launcher starten",
      "Nach dem ersten Push GitHub Setup Checkliste prüfen: meta/github-setup-checklist.md"
    ]
  };
}
