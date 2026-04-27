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
const projectNameInput = document.getElementById("project-name");
const targetDirInput = document.getElementById("target-dir");
const createProjectBtn = document.getElementById("create-project-btn");
const projectCreateResult = document.getElementById("project-create-result");
const buildAgentInputBtn = document.getElementById("build-agent-input-btn");
const copyAgentInputBtn = document.getElementById("copy-agent-input-btn");
const agentCombinedOutput = document.getElementById("agent-combined-output");
const agentInputHint = document.getElementById("agent-input-hint");
const handoverAgentPath = document.getElementById("handover-agent-path");

const TASK_FRAME_REF = "prompts/agent/00-agent-task-frame.md";
const WORKFLOW_PROMPT_PATH = "prompts/agent/00-agent-run-workflow.md";

let currentPromptContent = "";
let activePromptButton = null;
/** Wenn zuletzt ein Eintrag aus „Agent-Prompts“ geladen wurde: Pfad und Inhalt. */
let selectedAgentPath = null;
let selectedAgentContent = null;
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
    title: "Agent 00 - Run Workflow (gesamt)",
    phase: "Agent",
    promptPath: WORKFLOW_PROMPT_PATH,
    hint:
      "Zentraler Einstieg: ein Prompt steuert Task Frame, Bootstrap, Pflichtenheft, Architektur und Projektstruktur. Nutze unten „Workflow-Input erzeugen“, um Kontext + Workflow an den Cursor-Agenten zu übergeben."
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

  if (promptPathValue.startsWith("prompts/agent/")) {
    selectedAgentPath = result.path;
    selectedAgentContent = result.content || "";
  } else {
    selectedAgentPath = null;
    selectedAgentContent = null;
  }
  updateHandoverAgentDisplay();

  if (phaseLabel) {
    setStatus(`${phaseLabel}-Prompt geladen: ${result.path}`);
  } else {
    setStatus(`Prompt geladen: ${result.path}`);
  }
}

function updateHandoverAgentDisplay() {
  if (!handoverAgentPath) {
    return;
  }
  if (!selectedAgentPath) {
    handoverAgentPath.textContent = `Standard: ${WORKFLOW_PROMPT_PATH} (wird beim Erzeugen automatisch geladen)`;
    return;
  }
  if (selectedAgentPath === WORKFLOW_PROMPT_PATH) {
    handoverAgentPath.textContent = `${WORKFLOW_PROMPT_PATH} (aus Liste geladen)`;
    return;
  }
  handoverAgentPath.textContent = `Alternativ gewählt: ${selectedAgentPath} (ersetzt den Standard-Workflow-Prompt)`;
}

function buildAgentWorkflowInputMarkdown(contextText, promptBody) {
  return `# Agent Workflow Input

## Projektkontext

${contextText}

---

## Auszuführender Workflow-Prompt

${promptBody}

---

## Hinweis

Der Workflow-Prompt koordiniert die weiteren Agent-Prompts 01–04.
Der Agent Task Frame ist verpflichtend anzuwenden:
${TASK_FRAME_REF}
`;
}

function clearAgentInputHint() {
  if (agentInputHint) {
    agentInputHint.textContent = "";
    agentInputHint.classList.remove("is-error");
  }
}

async function refreshHandoverContextState() {
  const badge = document.getElementById("handover-context-state");
  if (!badge) {
    return;
  }
  badge.className = "context-state-badge state-pending";
  badge.textContent = "…";
  try {
    const res = await fetch("/api/context");
    const data = await res.json().catch(() => ({}));
    if (res.ok && (data.content || "").trim()) {
      badge.className = "context-state-badge state-ok";
      badge.textContent = "Vorhanden";
    } else {
      badge.className = "context-state-badge state-missing";
      badge.textContent = res.ok ? "Leer" : "Fehlt";
    }
  } catch {
    badge.className = "context-state-badge state-missing";
    badge.textContent = "Lesefehler";
  }
}

async function buildFullAgentInput() {
  if (!agentCombinedOutput || !agentInputHint || !copyAgentInputBtn) {
    return;
  }
  clearAgentInputHint();
  agentCombinedOutput.value = "";
  copyAgentInputBtn.disabled = true;

  const res = await fetch("/api/context");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    agentInputHint.classList.add("is-error");
    agentInputHint.textContent =
      "Kein gespeicherter Kontext. Speichere zuerst den Handover in „Handover-Kontext“ (Datei .goldstandard/context.txt).";
    return;
  }
  const contextText = (data.content || "").trim();
  if (!contextText) {
    agentInputHint.classList.add("is-error");
    agentInputHint.textContent = "Gespeicherter Kontext ist leer. Ergänze und speichere den Handover-Kontext.";
    return;
  }

  let promptBody = "";
  let usedAlternative = false;
  if (selectedAgentPath && String(selectedAgentContent || "").trim()) {
    promptBody = selectedAgentContent.trim();
    usedAlternative = selectedAgentPath !== WORKFLOW_PROMPT_PATH;
  } else {
    try {
      const wf = await fetchJson(`/api/prompt?path=${encodeURIComponent(WORKFLOW_PROMPT_PATH)}`);
      promptBody = (wf.content || "").trim();
      if (!promptBody) {
        agentInputHint.classList.add("is-error");
        agentInputHint.textContent = `Workflow-Prompt ist leer oder nicht lesbar: ${WORKFLOW_PROMPT_PATH}`;
        return;
      }
    } catch (error) {
      agentInputHint.classList.add("is-error");
      agentInputHint.textContent = `Workflow-Prompt konnte nicht geladen werden: ${error.message}`;
      return;
    }
  }

  const combined = buildAgentWorkflowInputMarkdown(contextText, promptBody);
  agentCombinedOutput.value = combined;
  copyAgentInputBtn.disabled = false;
  agentInputHint.classList.remove("is-error");
  agentInputHint.textContent = usedAlternative
    ? "Workflow-Input mit alternativem Agent-Prompt erzeugt. Zum Übernehmen: „Workflow-Input kopieren“."
    : "Workflow-Input mit zentralem Workflow-Prompt erzeugt. Zum Übernehmen: „Workflow-Input kopieren“.";
  setStatus("Workflow-Input erzeugt.");
}

async function copyFullAgentInput() {
  if (!agentCombinedOutput || !agentInputHint) {
    return;
  }
  const text = (agentCombinedOutput.value || "").trim();
  if (!text) {
    agentInputHint.classList.add("is-error");
    agentInputHint.textContent = 'Kein Inhalt. Zuerst „Workflow-Input erzeugen“ ausführen.';
    return;
  }
  if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
    agentInputHint.classList.add("is-error");
    agentInputHint.textContent = "Clipboard-API in diesem Browser nicht verfügbar.";
    return;
  }
  try {
    await navigator.clipboard.writeText(agentCombinedOutput.value);
    agentInputHint.classList.remove("is-error");
    agentInputHint.textContent = "Kopiert.";
    setStatus("Workflow-Input in die Zwischenablage kopiert.");
  } catch (error) {
    agentInputHint.classList.add("is-error");
    agentInputHint.textContent = `Kopieren fehlgeschlagen: ${error.message || "unbekannter Fehler"}`;
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
    await refreshHandoverContextState();
  } catch (error) {
    setStatus(`Kontext konnte nicht gespeichert werden: ${error.message}`, true);
  }
}

async function loadContext() {
  try {
    const data = await fetchJson("/api/context");
    contextInput.value = data.content || "";
    setStatus("Gespeicherter Kontext geladen.");
    await refreshHandoverContextState();
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

async function createProject() {
  const projectName = projectNameInput.value.trim();
  const targetDir = targetDirInput.value.trim();

  if (!projectName || !targetDir) {
    projectCreateResult.textContent = "Bitte Projektname und Zielordner ausfüllen.";
    setStatus("Projektanlage: Eingaben unvollständig.", true);
    return;
  }

  createProjectBtn.disabled = true;
  projectCreateResult.textContent = "Projekt wird angelegt...";

  try {
    const result = await fetchJson("/api/project/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectName, targetDir })
    });

    const nextSteps = (result.nextSteps || []).map((step, idx) => `${idx + 1}. ${step}`).join("\n");
    projectCreateResult.textContent =
      `Erfolg:\n${result.projectPath}\n\nNächste Schritte:\n${nextSteps}\n\nWichtig: Nach dem Push zu GitHub müssen die Repository-Einstellungen anhand der Checkliste geprüft werden: meta/github-setup-checklist.md`;
    setStatus("Projektanlage erfolgreich abgeschlossen.");
  } catch (error) {
    projectCreateResult.textContent = `Fehler: ${error.message}`;
    setStatus(`Projektanlage fehlgeschlagen: ${error.message}`, true);
  } finally {
    createProjectBtn.disabled = false;
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
createProjectBtn.addEventListener("click", createProject);
buildAgentInputBtn.addEventListener("click", () => {
  buildFullAgentInput().catch((error) => {
    if (agentInputHint) {
      agentInputHint.classList.add("is-error");
      agentInputHint.textContent = `Fehler: ${error.message || "unbekannt"}`;
    }
    setStatus(`Workflow-Input: ${error.message || "Fehler"}`, true);
  });
});
copyAgentInputBtn.addEventListener("click", copyFullAgentInput);

promptContent.textContent = "Wähle links einen Prompt aus, um den Inhalt anzuzeigen.";
copyPromptBtn.disabled = true;

async function init() {
  await loadPrompts();
  await loadProgress();
  await updateStepUI();
  updateHandoverAgentDisplay();
  await refreshHandoverContextState();
}

init();
