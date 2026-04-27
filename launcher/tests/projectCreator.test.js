import test from "node:test";
import assert from "node:assert";
import fs from "fs";
import os from "os";
import path from "path";
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
    "prompts",
    "meta",
    "backend",
    "frontend",
    "infra"
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
    templateRoot
  });

  assert.equal(result.success, true);
  assert.equal(result.projectPath, path.join(targetDir, "my-project"));
  assert.equal(fs.existsSync(result.projectPath), true);
});

test("kopiert wichtige Template-Ordner", () => {
  const templateRoot = setupTemplateRoot();
  const targetDir = makeTempDir("goldstandard-target-");
  const result = createProjectFromTemplate({
    projectName: "copy-dirs",
    targetDir,
    templateRoot
  });

  const projectPath = result.projectPath;
  for (const dir of [".github", ".cursor", "docs", "prompts", "meta"]) {
    assert.equal(fs.existsSync(path.join(projectPath, dir)), true, `Fehlender Ordner: ${dir}`);
  }
});

test("kopiert wichtige Root-Dateien", () => {
  const templateRoot = setupTemplateRoot();
  const targetDir = makeTempDir("goldstandard-target-");
  const result = createProjectFromTemplate({
    projectName: "copy-files",
    targetDir,
    templateRoot
  });

  assert.equal(fs.existsSync(path.join(result.projectPath, "README.md")), true);
  assert.equal(fs.existsSync(path.join(result.projectPath, "docker-compose.yml")), true);
});

test("kopiert ausgeschlossene Pfade nicht", () => {
  const templateRoot = setupTemplateRoot();
  const targetDir = makeTempDir("goldstandard-target-");
  const result = createProjectFromTemplate({
    projectName: "exclude-check",
    targetDir,
    templateRoot
  });

  assert.equal(fs.existsSync(path.join(result.projectPath, ".git")), false);
  assert.equal(fs.existsSync(path.join(result.projectPath, ".goldstandard", "context.txt")), false);
  assert.equal(fs.existsSync(path.join(result.projectPath, "launcher")), false);
});

test("erzeugt .goldstandard/project-config.json", () => {
  const templateRoot = setupTemplateRoot();
  const targetDir = makeTempDir("goldstandard-target-");
  const result = createProjectFromTemplate({
    projectName: "config-check",
    targetDir,
    templateRoot
  });

  const configPath = path.join(result.projectPath, ".goldstandard", "project-config.json");
  assert.equal(fs.existsSync(configPath), true);
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  assert.equal(config.projectName, "config-check");
  assert.equal(config.templateSource, path.resolve(templateRoot));
  assert.equal(typeof config.createdAt, "string");
});

test("ersetzt generischen README-Titel durch Projektname", () => {
  const templateRoot = setupTemplateRoot();
  const targetDir = makeTempDir("goldstandard-target-");
  const result = createProjectFromTemplate({
    projectName: "renamed-project",
    targetDir,
    templateRoot
  });

  const readme = fs.readFileSync(path.join(result.projectPath, "README.md"), "utf8");
  assert.ok(readme.startsWith("# renamed-project"));
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
        templateRoot
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
        templateRoot
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
        templateRoot
      }),
    /Ungültiger Projektname/
  );
});
