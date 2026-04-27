#!/usr/bin/env node

import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function loadPromptFiles(relativeDir) {
  const targetDir = path.join(__dirname, "..", relativeDir);

  if (!fs.existsSync(targetDir)) {
    return { error: `Ordner nicht gefunden: ${relativeDir}` };
  }

  const files = fs
    .readdirSync(targetDir)
    .filter((entry) => entry.endsWith(".md"))
    .sort();

  if (files.length === 0) {
    return { error: `Keine Prompt-Dateien gefunden in: ${relativeDir}` };
  }

  return { files, targetDir };
}

async function showPromptList(relativeDir, phaseLabel) {
  const result = loadPromptFiles(relativeDir);
  if (result.error) {
    console.log(`\n${result.error}\n`);
    return;
  }

  const { files, targetDir } = result;

  console.log(`\n${phaseLabel} Prompts:\n`);
  files.forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
  });
  console.log("");

  const selection = await ask("Bitte wähle eine Prompt-Nummer: ");
  const selectedIndex = Number(selection) - 1;

  if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= files.length) {
    console.log("\nUngültige Eingabe.\n");
    return;
  }

  const selectedFile = files[selectedIndex];
  const fullPath = path.join(targetDir, selectedFile);
  const content = fs.readFileSync(fullPath, "utf8");
  const relativePath = path.join(relativeDir, selectedFile).replaceAll("\\", "/");

  console.log(`\nPfad: ${relativePath}\n`);
  console.log(content);
  console.log("");

  if (relativeDir === "prompts/gpt") {
    console.log("Kopiere diesen Prompt in ChatGPT\n");
  } else {
    console.log("Kopiere diesen Prompt in deinen Agenten\n");
  }
}

async function main() {
  console.log("\n🚀 Goldstandard Project Wizard\n");
  console.log("1. GPT-Prompts anzeigen");
  console.log("2. Agent-Prompts anzeigen");
  console.log("3. Hilfe");
  console.log("4. Beenden\n");

  const answer = await ask("Bitte wähle eine Option: ");

  if (answer === "1") {
    await showPromptList("prompts/gpt", "📘 GPT");
  } else if (answer === "2") {
    await showPromptList("prompts/agent", "🤖 Agent");
  } else if (answer === "3") {
    console.log("\nℹ️ Hilfe\n");
    console.log("Dieses Tool führt dich durch den Goldstandard-Prozess.\n");
    console.log("GPT = Denken (ChatGPT)");
    console.log("Agent = Umsetzung (Cursor)\n");
  } else if (answer === "4") {
    console.log("\nBis bald.\n");
  } else {
    console.log("\nUngültige Eingabe.\n");
  }
}

main().finally(() => {
  rl.close();
});
