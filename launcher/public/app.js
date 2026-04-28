const gptList = document.getElementById("gpt-list");
const agentList = document.getElementById("agent-list");
const promptPath = document.getElementById("prompt-path");
const promptContent = document.getElementById("prompt-content");
const copyPromptBtn = document.getElementById("copyPromptBtn");
const copyPromptFeedback = document.getElementById("copy-prompt-feedback");
const contextInput = document.getElementById("context-input");
const saveContextBtn = document.getElementById("save-context");
const loadContextBtn = document.getElementById("load-context");
const statusMessage = document.getElementById("status-message");
const projectNameInput = document.getElementById("project-name");
const targetDirInput = document.getElementById("target-dir");
const createProjectBtn = document.getElementById("create-project-btn");
const projectCreateResult = document.getElementById("project-create-result");
const projectNameError = document.getElementById("project-name-error");
const targetDirError = document.getElementById("target-dir-error");
const gptFlowHint = document.getElementById("gpt-flow-hint");
const buildAgentInputBtn = document.getElementById("build-agent-input-btn");
const copyAgentInputBtn = document.getElementById("copy-agent-input-btn");
const agentCombinedOutput = document.getElementById("agent-combined-output");
const agentInputHint = document.getElementById("agent-input-hint");
const handoverAgentPath = document.getElementById("handover-agent-path");
const cursorStepHint = document.getElementById("cursor-step-hint");

const TASK_FRAME_REF = "prompts/agent/00-agent-task-frame.md";
const WORKFLOW_PROMPT_PATH = "prompts/agent/01-agent-run-workflow.md";

const STEP_IDS = ["project", "gpt", "context", "workflow", "cursor"];
const state = {
  projectCreated: false,
  gptCopiedCount: 0,
  contextSaved: false,
  workflowBuilt: false,
  workflowCopied: false
};

let currentPromptContent = "";
let currentPromptPath = "";
let currentPromptPhase = null;
let activePromptButton = null;
let selectedAgentPath = null;
let selectedAgentContent = null;
const copiedGptPrompts = new Set();

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "#b42318" : "#334e68";
}

function setCopyPromptFeedback(message) {
  copyPromptFeedback.textContent = message;
  if (!message) return;
  window.setTimeout(() => {
    if (copyPromptFeedback.textContent === message) copyPromptFeedback.textContent = "";
  }, 1800);
}

function updateGptFlowHint(promptPathValue) {
  if (promptPathValue === "prompts/gpt/01-gpt-project-start.md") {
    gptFlowHint.textContent = "Kopiere diesen Prompt in einen neuen ChatGPT-Chat. Bleibe danach im selben Chat.";
    return;
  }
  if (
    promptPathValue === "prompts/gpt/02-gpt-project-definition.md" ||
    promptPathValue === "prompts/gpt/03-gpt-usecase-definition.md" ||
    promptPathValue === "prompts/gpt/04-gpt-pflichtenheft-prep.md"
  ) {
    gptFlowHint.textContent =
      "Kopiere diesen Prompt in denselben ChatGPT-Chat. Beantworte Rückfragen und gehe danach zum nächsten GPT-Prompt.";
    return;
  }
  if (promptPathValue === "prompts/gpt/05-gpt-agent-handover.md") {
    gptFlowHint.textContent =
      "Kopiere diesen Prompt in denselben ChatGPT-Chat. Übernimm danach den erzeugten PROJEKTKONTEXT in Schritt 3.";
    return;
  }
  gptFlowHint.textContent =
    "Wähle den nächsten GPT-Prompt. Der Wizard markiert kopierte Prompts und führt dich danach zum Kontext-Schritt.";
}

function inferStepState(stepId) {
  if (stepId === "project") return "active";
  if (stepId === "gpt") return state.projectCreated ? "active" : "locked";
  if (stepId === "context") {
    if (!state.projectCreated) return "locked";
    return state.gptCopiedCount > 0 ? "active" : "upcoming";
  }
  if (stepId === "workflow") {
    if (!state.projectCreated) return "locked";
    return state.contextSaved ? "active" : "upcoming";
  }
  if (stepId === "cursor") {
    if (!state.projectCreated) return "locked";
    return state.workflowBuilt ? "active" : "upcoming";
  }
  return "upcoming";
}

function stepBadgeText(stepId, stepState) {
  if (stepId === "project" && state.projectCreated) return "Erledigt";
  if (stepId === "gpt" && state.gptCopiedCount > 0) return `${state.gptCopiedCount} kopiert`;
  if (stepId === "context" && state.contextSaved) return "Gespeichert";
  if (stepId === "workflow" && state.workflowBuilt) return "Erzeugt";
  if (stepId === "cursor" && state.workflowCopied) return "Bereit";
  if (stepState === "locked") return "Gesperrt";
  if (stepState === "upcoming") return "Als Nächstes";
  return "Aktiv";
}

function setSectionEnabled(sectionId, enabled) {
  const el = document.getElementById(sectionId);
  if (!el) return;
  el.classList.toggle("is-locked", !enabled);
  el.setAttribute("aria-disabled", enabled ? "false" : "true");
  for (const node of el.querySelectorAll("button, input, textarea")) {
    if (node.id === "create-project-btn") continue;
    if (!enabled) node.setAttribute("disabled", "disabled");
    else if (node.dataset.forceDisabled !== "true") node.removeAttribute("disabled");
  }
}

function updateStepper() {
  for (const id of STEP_IDS) {
    const li = document.getElementById(`stepper-${id}`);
    const badge = document.getElementById(`badge-${id}`);
    const section = document.getElementById(`step-${id}`);
    const mode = inferStepState(id);
    if (li) {
      li.classList.remove("active", "done", "locked", "upcoming");
      li.classList.add(mode);
    }
    if (section) {
      section.classList.remove("is-active", "is-done", "is-upcoming", "is-locked");
      section.classList.add(
        mode === "active" ? "is-active" : mode === "upcoming" ? "is-upcoming" : mode === "locked" ? "is-locked" : "is-done"
      );
    }
    if (badge) {
      badge.textContent = stepBadgeText(id, mode);
      badge.className = `step-badge ${mode}`;
    }
  }

  setSectionEnabled("step-gpt", state.projectCreated);
  setSectionEnabled("step-context", state.projectCreated);
  setSectionEnabled("step-workflow", state.projectCreated && state.contextSaved);
  setSectionEnabled("step-agent-prompts", state.projectCreated);
  setSectionEnabled("step-cursor", state.projectCreated && state.workflowBuilt);
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Unbekannter Fehler");
  return data;
}

function updateHandoverAgentDisplay() {
  if (!selectedAgentPath) {
    handoverAgentPath.textContent = `Standard: ${WORKFLOW_PROMPT_PATH}`;
  } else if (selectedAgentPath === WORKFLOW_PROMPT_PATH) {
    handoverAgentPath.textContent = `${WORKFLOW_PROMPT_PATH} (aus Liste geladen)`;
  } else {
    handoverAgentPath.textContent = `Alternativ gewählt: ${selectedAgentPath}`;
  }
}

async function loadPromptContentByPath(promptPathValue, phaseLabel = null, button = null, options = {}) {
  const viewOnly = Boolean(options.viewOnly);
  const result = await fetchJson(`/api/prompt?path=${encodeURIComponent(promptPathValue)}`);
  if (activePromptButton) activePromptButton.classList.remove("active");
  if (button && !viewOnly) {
    activePromptButton = button;
    activePromptButton.classList.add("active");
  } else {
    activePromptButton = null;
  }

  promptPath.textContent = `Pfad: ${result.path}`;
  currentPromptContent = result.content || "";
  currentPromptPath = result.path || "";
  currentPromptPhase = phaseLabel;
  promptContent.textContent = currentPromptContent;
  copyPromptBtn.disabled = currentPromptContent.trim().length === 0;
  setCopyPromptFeedback("");

  if (promptPathValue.startsWith("prompts/agent/") && !viewOnly) {
    selectedAgentPath = result.path;
    selectedAgentContent = result.content || "";
  } else if (!promptPathValue.startsWith("prompts/agent/")) {
    selectedAgentPath = null;
    selectedAgentContent = null;
  }
  updateHandoverAgentDisplay();
  updateGptFlowHint(currentPromptPath);
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
    if (phaseLabel === "Agent" && promptPathValue === TASK_FRAME_REF) {
      const li = document.createElement("li");
      li.className = "taskframe-list-item";
      li.innerHTML = `
        <p class="taskframe-title">Agent Task Frame (Pflichtregel)</p>
        <p class="taskframe-subtitle">Verpflichtender Arbeitsrahmen für Agent-Aufgaben.</p>
      `;
      const btn = document.createElement("button");
      btn.className = "secondary";
      btn.type = "button";
      btn.textContent = "Anzeigen";
      btn.addEventListener("click", async () => {
        await loadPromptContentByPath(promptPathValue, phaseLabel, null, { viewOnly: true });
        setStatus("Task Frame angezeigt (nur Ansicht).");
      });
      li.appendChild(btn);
      targetList.appendChild(li);
      return;
    }

    const li = document.createElement("li");
    const row = document.createElement("div");
    row.className = "prompt-item-row";
    const btn = document.createElement("button");
    btn.className = "prompt-item";
    btn.textContent = promptPathValue;
    btn.addEventListener("click", async () => {
      await loadPromptContentByPath(promptPathValue, phaseLabel, btn);
      setStatus(`${phaseLabel}-Prompt geladen.`);
    });
    row.appendChild(btn);
    if (phaseLabel === "GPT") {
      const badge = document.createElement("span");
      badge.className = "prompt-copy-badge";
      badge.dataset.copyBadgeFor = promptPathValue;
      badge.textContent = "Kopiert ✓";
      badge.style.visibility = copiedGptPrompts.has(promptPathValue) ? "visible" : "hidden";
      row.appendChild(badge);
    }
    li.appendChild(row);
    targetList.appendChild(li);
  });
}

async function loadPrompts() {
  const [gptData, agentData] = await Promise.all([fetchJson("/api/prompts/gpt"), fetchJson("/api/prompts/agent")]);
  renderPromptList(gptList, gptData.prompts, "GPT");
  renderPromptList(agentList, agentData.prompts, "Agent");
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

async function refreshHandoverContextState() {
  const badge = document.getElementById("handover-context-state");
  badge.className = "context-state-badge state-pending";
  badge.textContent = "…";
  try {
    const res = await fetch("/api/context");
    const data = await res.json().catch(() => ({}));
    const hasContext = res.ok && Boolean((data.content || "").trim());
    state.contextSaved = hasContext;
    badge.className = hasContext ? "context-state-badge state-ok" : "context-state-badge state-missing";
    badge.textContent = hasContext ? "Vorhanden" : "Fehlt";
  } catch {
    state.contextSaved = false;
    badge.className = "context-state-badge state-missing";
    badge.textContent = "Lesefehler";
  }
  updateStepper();
}

async function buildFullAgentInput() {
  agentInputHint.classList.remove("is-error");
  agentInputHint.textContent = "";
  agentCombinedOutput.value = "";
  copyAgentInputBtn.disabled = true;
  const res = await fetch("/api/context");
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !(data.content || "").trim()) {
    agentInputHint.classList.add("is-error");
    agentInputHint.textContent = "Bitte zuerst PROJEKTKONTEXT aus Schritt 05 speichern.";
    setStatus("Workflow-Input benötigt gespeicherten Kontext.", true);
    return;
  }
  const contextText = (data.content || "").trim();
  let promptBody = "";
  if (selectedAgentPath && String(selectedAgentContent || "").trim()) {
    promptBody = selectedAgentContent.trim();
  } else {
    const wf = await fetchJson(`/api/prompt?path=${encodeURIComponent(WORKFLOW_PROMPT_PATH)}`);
    promptBody = (wf.content || "").trim();
  }
  agentCombinedOutput.value = buildAgentWorkflowInputMarkdown(contextText, promptBody);
  copyAgentInputBtn.disabled = false;
  state.workflowBuilt = true;
  updateStepper();
  if (cursorStepHint) {
    cursorStepHint.textContent = "Workflow-Input ist bereit. Als Nächstes Zielprojekt in Cursor öffnen und Agent ausführen.";
  }
  agentInputHint.textContent = "Workflow-Input erzeugt. Jetzt kopieren und in Cursor verwenden.";
  setStatus("Workflow-Input erzeugt.");
}

async function copyFullAgentInput() {
  const text = (agentCombinedOutput.value || "").trim();
  if (!text) {
    agentInputHint.classList.add("is-error");
    agentInputHint.textContent = 'Kein Inhalt. Zuerst „Workflow-Input erzeugen“ ausführen.';
    return;
  }
  await navigator.clipboard.writeText(agentCombinedOutput.value);
  state.workflowCopied = true;
  updateStepper();
  agentInputHint.classList.remove("is-error");
  agentInputHint.textContent = "Kopiert ✓. Öffne jetzt das Zielprojekt in Cursor und starte den Agenten.";
  setStatus("Workflow-Input kopiert.");
}

function isLikelyAbsolutePath(value) {
  return value.startsWith("/") || /^[a-zA-Z]:\\/.test(value);
}

function validateProjectForm() {
  const name = projectNameInput.value.trim();
  const target = targetDirInput.value.trim();
  let ok = true;

  if (!name) {
    projectNameError.textContent = "Bitte einen Projektnamen eintragen.";
    ok = false;
  } else if (!/^[a-zA-Z0-9._-]{2,100}$/.test(name)) {
    projectNameError.textContent = "Erlaubt: 2-100 Zeichen, Buchstaben/Zahlen/Punkt/Unterstrich/Minus.";
    ok = false;
  } else {
    projectNameError.textContent = "";
  }

  if (!target) {
    targetDirError.textContent = "Bitte einen absoluten Zielpfad eintragen.";
    ok = false;
  } else if (!isLikelyAbsolutePath(target)) {
    targetDirError.textContent = "Pfad muss absolut sein, z. B. /Users/name/Projects.";
    ok = false;
  } else {
    targetDirError.textContent = "";
  }
  return ok;
}

function formatProjectCreateSuccess(result) {
  return [
    "Projekt erfolgreich angelegt.",
    "",
    `Pfad: ${result.projectPath}`,
    "- Git wurde initialisiert.",
    "- Initial-Commit wurde erstellt.",
    "",
    "Nächster Schritt: GPT-Workflow in Schritt 2 starten."
  ].join("\n");
}

async function createProject() {
  if (!validateProjectForm()) {
    setStatus("Bitte Eingaben korrigieren.", true);
    return;
  }
  const projectName = projectNameInput.value.trim();
  const targetDir = targetDirInput.value.trim();
  localStorage.setItem("gs.targetDir", targetDir);
  createProjectBtn.disabled = true;
  projectCreateResult.textContent = "Projekt wird angelegt...";
  try {
    const result = await fetchJson("/api/project/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectName, targetDir })
    });
    projectCreateResult.textContent = formatProjectCreateSuccess(result);
    state.projectCreated = true;
    updateStepper();
    setStatus("Projektanlage erfolgreich. Weiter mit GPT-Phase.");
  } catch (error) {
    projectCreateResult.textContent = `Fehler: ${error.message}`;
    setStatus(`Projektanlage fehlgeschlagen: ${error.message}`, true);
  } finally {
    createProjectBtn.disabled = false;
  }
}

async function saveContext() {
  const content = contextInput.value || "";
  await fetchJson("/api/context", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content })
  });
  await refreshHandoverContextState();
  setStatus("Kontext gespeichert. Weiter mit Schritt 4.");
}

async function loadContext() {
  try {
    const data = await fetchJson("/api/context");
    contextInput.value = data.content || "";
    await refreshHandoverContextState();
    setStatus("Kontext geladen.");
  } catch (error) {
    setStatus(`Kontext konnte nicht geladen werden: ${error.message}`, true);
  }
}

async function copyPrompt() {
  if (!currentPromptContent.trim()) {
    setStatus("Kein Prompt zum Kopieren geladen.", true);
    return;
  }
  await navigator.clipboard.writeText(currentPromptContent);
  if (currentPromptPhase === "GPT" && currentPromptPath) {
    copiedGptPrompts.add(currentPromptPath);
    state.gptCopiedCount = copiedGptPrompts.size;
    const badge = document.querySelector(`[data-copy-badge-for="${CSS.escape(currentPromptPath)}"]`);
    if (badge) badge.style.visibility = "visible";
    updateStepper();
  }
  setCopyPromptFeedback("Prompt kopiert ✓");
  setStatus("Prompt kopiert.");
}

function setupDefaults() {
  const savedTarget = localStorage.getItem("gs.targetDir");
  targetDirInput.value = savedTarget || "/Users/<dein-name>/Projects";
}

copyPromptBtn.addEventListener("click", () => copyPrompt().catch((e) => setStatus(e.message, true)));
saveContextBtn.addEventListener("click", () => saveContext().catch((e) => setStatus(e.message, true)));
loadContextBtn.addEventListener("click", () => loadContext().catch((e) => setStatus(e.message, true)));
createProjectBtn.addEventListener("click", () => createProject().catch((e) => setStatus(e.message, true)));
buildAgentInputBtn.addEventListener("click", () => buildFullAgentInput().catch((e) => setStatus(e.message, true)));
copyAgentInputBtn.addEventListener("click", () => copyFullAgentInput().catch((e) => setStatus(e.message, true)));

async function init() {
  setupDefaults();
  promptContent.textContent = "Wähle einen Prompt, um den Inhalt anzuzeigen.";
  copyPromptBtn.disabled = true;
  await loadPrompts();
  updateHandoverAgentDisplay();
  await refreshHandoverContextState();
  updateGptFlowHint("");
  updateStepper();
}

init().catch((error) => setStatus(`Initialisierung fehlgeschlagen: ${error.message}`, true));
