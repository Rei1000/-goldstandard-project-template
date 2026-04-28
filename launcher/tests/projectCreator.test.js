import test from "node:test";
import assert from "node:assert";
import fs from "fs";
import os from "os";
import path from "path";
import { execSync } from "node:child_process";
import { createProjectFromTemplate } from "../lib/projectCreator.js";

function makeTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function setupTemplateRoot() {
  const templateRoot = makeTempDir("goldstandard-template-");

  const requiredDirs = [
    ".github",
    ".cursor",
    "docs",
    "backend",
    "frontend",
    "infra",
    "cli",
    "prompts",
    "meta"
  ];
  for (const dir of requiredDirs) {
    fs.mkdirSync(path.join(templateRoot, dir), { recursive: true });
  }

  writeFile(path.join(templateRoot, "README.md"), "# Projekt-Template (Goldstandard)\n\nTemplate.");
  writeFile(path.join(templateRoot, "docker-compose.yml"), "version: '3'\n");
  writeFile(path.join(templateRoot, ".github", "CODEOWNERS"), "* @team\n");
  writeFile(path.join(templateRoot, ".cursor", "cursor.rules"), "rules\n");
  writeFile(path.join(templateRoot, "docs", "architecture.md"), "arch\n");
  writeFile(path.join(templateRoot, "prompts", "gpt.md"), "gpt\n");
  writeFile(path.join(templateRoot, "meta", "plan.md"), "plan\n");
  writeFile(path.join(templateRoot, "backend", "app.py"), "print('x')\n");
  writeFile(path.join(templateRoot, "frontend", "app.ts"), "export {};\n");
  writeFile(path.join(templateRoot, "infra", "main.tf"), "resource {}\n");
  writeFile(path.join(templateRoot, "cli", "index.js"), "console.log('cli')\n");
  writeFile(path.join(templateRoot, ".env.example"), "PORT=3000\n");
  writeFile(path.join(templateRoot, ".gitignore"), "node_modules/\n");

  fs.mkdirSync(path.join(templateRoot, ".git"), { recursive: true });
  writeFile(path.join(templateRoot, ".git", "config"), "dummy");
  fs.mkdirSync(path.join(templateRoot, ".goldstandard"), { recursive: true });
  writeFile(path.join(templateRoot, ".goldstandard", "context.txt"), "ctx");
  fs.mkdirSync(path.join(templateRoot, "launcher"), { recursive: true });
  writeFile(path.join(templateRoot, "launcher", "server.js"), "server");

  return templateRoot;
}

test("erstellt Projektordner unter targetDir/projectName", () => {
  const templateRoot = setupTemplateRoot();
  const targetDir = makeTempDir("goldstandard-target-");
  const result = createProjectFromTemplate({
    projectName: "my-project",
    targetDir,
    templateRoot,
    contextContent: "Projektkontext: Testlauf."
  });

  assert.equal(result.success, true);
  assert.equal(result.projectPath, path.join(targetDir, "my-project"));
  assert.equal(fs.existsSync(result.projectPath), true);
});

test("kopiert notwendige Zielstruktur-Ordner", () => {
  const templateRoot = setupTemplateRoot();
  const targetDir = makeTempDir("goldstandard-target-");
  const result = createProjectFromTemplate({
    projectName: "copy-dirs",
    targetDir,
    templateRoot,
    contextContent: "Projektkontext: Struktur."
  });

  const projectPath = result.projectPath;
  for (const dir of [".github", ".cursor", "docs", "backend", "frontend", "infra", "cli"]) {
    assert.equal(fs.existsSync(path.join(projectPath, dir)), true, `Fehlender Ordner: ${dir}`);
  }
});

test("kopiert wichtige Root-Dateien", () => {
  const templateRoot = setupTemplateRoot();
  const targetDir = makeTempDir("goldstandard-target-");
  const result = createProjectFromTemplate({
    projectName: "copy-files",
    targetDir,
    templateRoot,
    contextContent: "Projektkontext: Root-Dateien."
  });

  assert.equal(fs.existsSync(path.join(result.projectPath, "README.md")), true);
  assert.equal(fs.existsSync(path.join(result.projectPath, "docker-compose.yml")), true);
  assert.equal(fs.existsSync(path.join(result.projectPath, ".env.example")), true);
  assert.equal(fs.existsSync(path.join(result.projectPath, ".gitignore")), true);
});

test("kopiert Template-Artefakte nicht ins Zielprojekt", () => {
  const templateRoot = setupTemplateRoot();
  const targetDir = makeTempDir("goldstandard-target-");
  const result = createProjectFromTemplate({
    projectName: "exclude-check",
    targetDir,
    templateRoot,
    contextContent: "Projektkontext: Exclusions."
  });

  assert.equal(fs.existsSync(path.join(result.projectPath, "launcher")), false);
  assert.equal(fs.existsSync(path.join(result.projectPath, "meta")), false);
  assert.equal(fs.existsSync(path.join(result.projectPath, "prompts")), false);
});

test("übernimmt .goldstandard/context.txt ins Zielprojekt", () => {
  const templateRoot = setupTemplateRoot();
  const targetDir = makeTempDir("goldstandard-target-");
  const contextContent = "PROJEKTKONTEXT\n\nZiel: Eine saubere Testplattform.";
  const result = createProjectFromTemplate({
    projectName: "config-check",
    targetDir,
    templateRoot,
    contextContent
  });

  const contextPath = path.join(result.projectPath, ".goldstandard", "context.txt");
  assert.equal(fs.existsSync(contextPath), true);
  assert.equal(fs.readFileSync(contextPath, "utf8"), contextContent);
});

test("erstellt projektspezifische README mit Kontext-Hinweis", () => {
  const templateRoot = setupTemplateRoot();
  const targetDir = makeTempDir("goldstandard-target-");
  const contextContent = "Kurzbeschreibung: Testplattform\nZiel: End-to-end Build";
  const result = createProjectFromTemplate({
    projectName: "renamed-project",
    targetDir,
    templateRoot,
    contextContent
  });

  const readme = fs.readFileSync(path.join(result.projectPath, "README.md"), "utf8");
  assert.ok(readme.startsWith("# renamed-project"));
  assert.ok(readme.includes("## Kurzbeschreibung"));
  assert.ok(readme.includes("## Ziel des Projekts"));
  assert.ok(readme.includes(".goldstandard/context.txt"));
  assert.ok(readme.includes("docs/"));
});

test("initialisiert Git-Repository und erstellt Initial-Commit", () => {
  const templateRoot = setupTemplateRoot();
  const targetDir = makeTempDir("goldstandard-target-");
  const result = createProjectFromTemplate({
    projectName: "git-ready",
    targetDir,
    templateRoot,
    contextContent: "Kontext für Initial-Commit."
  });

  const projectPath = result.projectPath;
  assert.equal(fs.existsSync(path.join(projectPath, ".git")), true);
  const head = execSync("git rev-parse --verify HEAD", { cwd: projectPath, encoding: "utf8" }).trim();
  assert.ok(head.length > 0);
  const trackedContext = execSync("git ls-files .goldstandard/context.txt", {
    cwd: projectPath,
    encoding: "utf8"
  }).trim();
  assert.equal(trackedContext, ".goldstandard/context.txt");
  const commitMessage = execSync("git log -1 --pretty=%s", {
    cwd: projectPath,
    encoding: "utf8"
  }).trim();
  assert.equal(commitMessage, "chore: initialize git-ready from goldstandard template");
});

test("bricht ab, wenn Zielordner bereits existiert", () => {
  const templateRoot = setupTemplateRoot();
  const targetDir = makeTempDir("goldstandard-target-");
  const existingPath = path.join(targetDir, "already-there");
  fs.mkdirSync(existingPath, { recursive: true });

  assert.throws(
    () =>
      createProjectFromTemplate({
        projectName: "already-there",
        targetDir,
        templateRoot,
        contextContent: "ctx"
      }),
    /Projektordner existiert bereits/
  );
});

test("bricht ab, wenn targetDir nicht absoluter Pfad ist", () => {
  const templateRoot = setupTemplateRoot();

  assert.throws(
    () =>
      createProjectFromTemplate({
        projectName: "invalid-target",
        targetDir: "relative/path",
        templateRoot,
        contextContent: "ctx"
      }),
    /absoluter Pfad/
  );
});

test("bricht ab, wenn projectName ungültig ist", () => {
  const templateRoot = setupTemplateRoot();
  const targetDir = makeTempDir("goldstandard-target-");

  assert.throws(
    () =>
      createProjectFromTemplate({
        projectName: "x",
        targetDir,
        templateRoot,
        contextContent: "ctx"
      }),
    /Ungültiger Projektname/
  );
});

test("bricht ab, wenn kein verwertbarer Kontext übergeben wurde", () => {
  const templateRoot = setupTemplateRoot();
  const targetDir = makeTempDir("goldstandard-target-");

  assert.throws(
    () =>
      createProjectFromTemplate({
        projectName: "missing-context",
        targetDir,
        templateRoot,
        contextContent: "   "
      }),
    /Kein verwertbarer Projektkontext/
  );
});
