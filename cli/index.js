#!/usr/bin/env node

import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("\n🚀 Goldstandard Project Wizard\n");

console.log("1. GPT Phase starten");
console.log("2. Agent Phase starten");
console.log("3. Hilfe\n");

rl.question("Bitte wähle eine Option: ", (answer) => {

  if (answer === "1") {
    console.log("\n📘 GPT Phase\n");
    console.log("Bitte arbeite folgende Prompts in ChatGPT durch:\n");
    console.log("01 – Projektstart");
    console.log("02 – Projektdefinition");
    console.log("03 – Use Cases");
    console.log("04 – Pflichtenheft Vorbereitung");
    console.log("05 – GPT → Agent Handover\n");
    console.log("Pfad: prompts/gpt/\n");
  }

  else if (answer === "2") {
    console.log("\n🤖 Agent Phase\n");
    console.log("Stelle sicher, dass du den PROJEKTKONTEXT aus dem GPT-Handover hast.\n");
    console.log("Dann führe folgende Prompts im Agent aus:\n");
    console.log("01 – Bootstrap");
    console.log("02 – Pflichtenheft");
    console.log("03 – Architektur");
    console.log("04 – Projektstruktur\n");
    console.log("Pfad: prompts/agent/\n");
  }

  else if (answer === "3") {
    console.log("\nℹ️ Hilfe\n");
    console.log("Dieses Tool führt dich durch den Goldstandard-Prozess.\n");
    console.log("GPT = Denken (ChatGPT)");
    console.log("Agent = Umsetzung (Cursor)\n");
  }

  else {
    console.log("\nUngültige Eingabe.\n");
  }

  rl.close();
});
