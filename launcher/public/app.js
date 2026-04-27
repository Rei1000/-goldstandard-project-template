const gptList = document.getElementById("gpt-list");
const agentList = document.getElementById("agent-list");
const promptPath = document.getElementById("prompt-path");
const promptContent = document.getElementById("prompt-content");
const copyPromptBtn = document.getElementById("copyPromptBtn");
const contextInput = document.getElementById("context-input");
const saveContextBtn = document.getElementById("save-context");
const loadContextBtn = document.getElementById("load-context");
const statusMessage = document.getElementById("status-message");
const stepCounter = document.getElementById("step-counter");
const stepTitle = document.getElementById("step-title");
const stepHint = document.getElementById("step-hint");
const stepPromptPath = document.getElementById("step-prompt-path");
const phaseBadge = document.getElementById("phase-badge");
const progressTrack = document.getElementById("progress-track");
const prevStepBtn = document.getElementById("prev-step");
const nextStepBtn = document.getElementById("next-step");
const markDoneBtn = document.getElementById("mark-done");
const saveProgressBtn = document.getElementById("save-progress");

let currentPromptContent = "";
let activePromptButton = null;
let currentStep = 0;
let completedSteps = [];

const WIZARD_STEPS = [
  {
    title: "GPT 01 - Project Start",
    phase: "GPT",
    promptPath: "prompts/gpt/01-gpt-project-start.md",
    hint: "Kläre Problem, Zielgruppe und Nutzen."
  },
  {
    title: "GPT 02 - Project Definition",
    phase: "GPT",
    promptPath: "prompts/gpt/02-gpt-project-definition.md",
    hint: "Definiere Scope, Ziele und Systemgrenzen."
  },
  {
    title: "GPT 03 - Use Case Definition",
    phase: "GPT",
    promptPath: "prompts/gpt/03-gpt-usecase-definition.md",
    hint: "Priorisiere die zentralen Use Cases."
  },
  {
    title: "GPT 04 - Pflichtenheft Prep",
    phase: "GPT",
    promptPath: "prompts/gpt/04-gpt-pflichtenheft-prep.md",
    hint: "Bereite strukturierte Anforderungen vor."
  },
  {
    title: "GPT 05 - Agent Handover",
    phase: "GPT",
    promptPath: "prompts/gpt/05-gpt-agent-handover.md",
    hint: "Erzeuge den finalen PROJEKTKONTEXT für den Agenten."
  },
  {
    title: "Agent 01 - Project Bootstrap",
    phase: "Agent",
    promptPath: "prompts/agent/01-agent-project-bootstrap.md",
    hint: "Initialisiere den Git- und Arbeitskontext."
  },
  {
    title: "Agent 02 - Write Pflichtenheft",
    phase: "Agent",
    promptPath: "prompts/agent/02-agent-write-pflichtenheft.md",
    hint: "Überführe Anforderungen nach docs/pflichtenheft.md."
  },
  {
    title: "Agent 03 - Architecture Setup",
    phase: "Agent",
    promptPath: "prompts/agent/03-agent-architecture-setup.md",
    hint: "Lege die Architekturgrundlage an."
  },
  {
    title: "Agent 04 - Project Structure",
    phase: "Agent",
    promptPath: "prompts/agent/04-agent-project-structure.md",
    hint: "Leite die Projektstruktur aus Architektur und Anforderungen ab."
  }
];

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "#b42318" : "#334e68";
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Unbekannter Fehler");
  }
  return data;
}

function renderProgressTrack() {
  progressTrack.innerHTML = "";
  WIZARD_STEPS.forEach((_, idx) => {
    const chip = document.createElement("div");
    chip.className = "progress-step";
    chip.textContent = String(idx + 1);
    if (completedSteps.includes(idx)) {
      chip.classList.add("done");
    }
    if (idx === currentStep) {
      chip.classList.add("active");
    }
    progressTrack.appendChild(chip);
  });
}

async function loadPromptContentByPath(promptPathValue, phaseLabel = null, button = null) {
  const result = await fetchJson(`/api/prompt?path=${encodeURIComponent(promptPathValue)}`);
  if (activePromptButton) {
    activePromptButton.classList.remove("active");
  }
  if (button) {
    activePromptButton = button;
    activePromptButton.classList.add("active");
  } else {
    activePromptButton = null;
  }

  promptPath.textContent = `Pfad: ${result.path}`;
  currentPromptContent = result.content || "";
  promptContent.textContent = currentPromptContent;
  copyPromptBtn.disabled = currentPromptContent.trim().length === 0;
  if (phaseLabel) {
    setStatus(`${phaseLabel}-Prompt geladen: ${result.path}`);
  } else {
    setStatus(`Prompt geladen: ${result.path}`);
  }
}

function renderPromptList(targetList, prompts, phaseLabel) {
  targetList.innerHTML = "";
  if (!prompts || prompts.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Keine Prompts gefunden.";
    targetList.appendChild(li);
    return;
  }

  prompts.forEach((promptPathValue) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = "prompt-item";
    btn.textContent = promptPathValue;
    btn.addEventListener("click", async () => {
      try {
        await loadPromptContentByPath(promptPathValue, phaseLabel, btn);
      } catch (error) {
        setStatus(`Prompt konnte nicht geladen werden: ${error.message}`, true);
      }
    });
    li.appendChild(btn);
    targetList.appendChild(li);
  });
}

async function loadPrompts() {
  try {
    const [gptData, agentData] = await Promise.all([
      fetchJson("/api/prompts/gpt"),
      fetchJson("/api/prompts/agent")
    ]);
    renderPromptList(gptList, gptData.prompts, "GPT");
    renderPromptList(agentList, agentData.prompts, "Agent");
    setStatus("Prompt-Listen erfolgreich geladen.");
  } catch (error) {
    setStatus(`Prompt-Listen konnten nicht geladen werden: ${error.message}`, true);
  }
}

async function hasSavedContext() {
  try {
    const data = await fetchJson("/api/context");
    return Boolean((data.content || "").trim());
  } catch {
    return false;
  }
}

async function updateStepUI() {
  const step = WIZARD_STEPS[currentStep];
  stepCounter.textContent = `Schritt ${currentStep + 1} von ${WIZARD_STEPS.length}`;
  stepTitle.textContent = step.title;
  stepHint.textContent = step.hint;
  stepPromptPath.textContent = `Prompt: ${step.promptPath}`;

  phaseBadge.textContent = step.phase;
  phaseBadge.classList.remove("gpt", "agent");
  phaseBadge.classList.add(step.phase.toLowerCase());

  prevStepBtn.disabled = currentStep === 0;
  nextStepBtn.disabled = currentStep === WIZARD_STEPS.length - 1;

  renderProgressTrack();

  try {
    await loadPromptContentByPath(step.promptPath);
  } catch (error) {
    setStatus(`Prompt konnte nicht geladen werden: ${error.message}`, true);
  }

  if (step.phase === "Agent") {
    const hasContext = await hasSavedContext();
    if (!hasContext) {
      setStatus(
        "Warnung: Kein Handover-Kontext gespeichert. Speichere zuerst den PROJEKTKONTEXT aus GPT Prompt 05.",
        true
      );
    } else {
      setStatus("Agent-Schritt bereit. Gespeicherter Handover-Kontext vorhanden.");
    }
  }
}

async function loadProgress() {
  try {
    const data = await fetchJson("/api/progress");
    const maxIndex = WIZARD_STEPS.length - 1;
    currentStep =
      Number.isInteger(data.currentStep) && data.currentStep >= 0 && data.currentStep <= maxIndex
        ? data.currentStep
        : 0;
    completedSteps = Array.isArray(data.completedSteps)
      ? data.completedSteps.filter(
          (idx) => Number.isInteger(idx) && idx >= 0 && idx <= maxIndex
        )
      : [];
    setStatus("Gespeicherter Fortschritt geladen.");
  } catch (error) {
    currentStep = 0;
    completedSteps = [];
    setStatus(`Fortschritt konnte nicht geladen werden: ${error.message}`, true);
  }
}

async function saveProgress() {
  try {
    await fetchJson("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentStep,
        completedSteps
      })
    });
    setStatus("Fortschritt gespeichert.");
  } catch (error) {
    setStatus(`Fortschritt konnte nicht gespeichert werden: ${error.message}`, true);
  }
}

async function saveContext() {
  try {
    const content = contextInput.value || "";
    await fetchJson("/api/context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content })
    });
    setStatus("Handover-Kontext gespeichert.");
  } catch (error) {
    setStatus(`Kontext konnte nicht gespeichert werden: ${error.message}`, true);
  }
}

async function loadContext() {
  try {
    const data = await fetchJson("/api/context");
    contextInput.value = data.content || "";
    setStatus("Gespeicherter Kontext geladen.");
  } catch (error) {
    setStatus(`Kontext konnte nicht geladen werden: ${error.message}`, true);
  }
}

async function copyPrompt() {
  if (!currentPromptContent.trim()) {
    setStatus("Kein Prompt zum Kopieren geladen.", true);
    return;
  }

  try {
    await navigator.clipboard.writeText(currentPromptContent);
    setStatus("Kopiert ✓");
  } catch (error) {
    setStatus(`Kopieren fehlgeschlagen: ${error.message}`, true);
  }
}

function goToPreviousStep() {
  if (currentStep > 0) {
    currentStep -= 1;
    updateStepUI();
  }
}

function goToNextStep() {
  if (currentStep < WIZARD_STEPS.length - 1) {
    currentStep += 1;
    updateStepUI();
  }
}

function markCurrentStepDone() {
  if (!completedSteps.includes(currentStep)) {
    completedSteps.push(currentStep);
    completedSteps.sort((a, b) => a - b);
  }
  setStatus(`Schritt ${currentStep + 1} als erledigt markiert.`);
  renderProgressTrack();
}

saveContextBtn.addEventListener("click", saveContext);
loadContextBtn.addEventListener("click", loadContext);
copyPromptBtn.addEventListener("click", copyPrompt);
prevStepBtn.addEventListener("click", goToPreviousStep);
nextStepBtn.addEventListener("click", goToNextStep);
markDoneBtn.addEventListener("click", markCurrentStepDone);
saveProgressBtn.addEventListener("click", saveProgress);

promptContent.textContent = "Wähle links einen Prompt aus, um den Inhalt anzuzeigen.";
copyPromptBtn.disabled = true;

async function init() {
  await loadPrompts();
  await loadProgress();
  await updateStepUI();
}

init();
