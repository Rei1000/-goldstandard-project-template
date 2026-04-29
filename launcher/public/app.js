const gptWizard = document.getElementById("gpt-wizard");
const agentList = document.getElementById("agent-list");
const gptCompleteHint = document.getElementById("gpt-complete-hint");
const contextInput = document.getElementById("context-input");
const saveContextBtn = document.getElementById("save-context");
const loadContextBtn = document.getElementById("load-context");
const statusMessage = document.getElementById("status-message");
const projectNameInput = document.getElementById("project-name");
const targetDirInput = document.getElementById("target-dir");
const refreshProjectListBtn = document.getElementById("refresh-project-list-btn");
const projectSelectionList = document.getElementById("project-selection-list");
const projectSelectionEmpty = document.getElementById("project-selection-empty");
const createProjectBtn = document.getElementById("create-project-btn");
const openExistingBtn = document.getElementById("open-existing-btn");
const cancelOpenExistingBtn = document.getElementById("cancel-open-existing-btn");
const existingProjectActions = document.getElementById("existing-project-actions");
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
const GPT_WIZARD_STORAGE_PREFIX = "gs.gptWizardState:";
const ACTIVE_PROJECT_PATH_KEY = "gs.activeProjectPath";
const LEGACY_GPT_WIZARD_KEY = "gs.gptWizardState";
const GPT_PROMPTS = [
  { path: "prompts/gpt/01-gpt-project-start.md", title: "Prompt 01" },
  { path: "prompts/gpt/02-gpt-project-definition.md", title: "Prompt 02" },
  { path: "prompts/gpt/03-gpt-usecase-definition.md", title: "Prompt 03" },
  { path: "prompts/gpt/04-gpt-pflichtenheft-prep.md", title: "Prompt 04" },
  { path: "prompts/gpt/05-gpt-agent-handover.md", title: "Prompt 05" }
];

const STEP_IDS = ["project", "gpt", "context", "workflow", "cursor"];
const state = {
  projectCreated: false,
  gptCompletedCount: 0,
  contextSaved: false,
  workflowBuilt: false,
  workflowCopied: false
};

let selectedAgentPath = null;
let selectedAgentContent = null;
let activePromptButton = null;
let gptPromptContentByPath = {};
let gptActiveIndex = 0;
let gptCompleted = [false, false, false, false, false];
let gptExpandedIndex = 0;
let activeProjectPath = "";
let pendingExistingProject = null;
let availableProjects = [];

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "#b42318" : "#334e68";
}

function setExistingProjectPrompt(visible, projectPathValue = "") {
  if (!existingProjectActions) return;
  existingProjectActions.classList.toggle("is-hidden", !visible);
  createProjectBtn.classList.toggle("is-hidden", visible);
  createProjectBtn.dataset.forceDisabled = visible ? "true" : "false";
  createProjectBtn.disabled = visible;
  if (!visible) {
    pendingExistingProject = null;
    return;
  }
  pendingExistingProject = { projectPath: projectPathValue };
}

function splitProjectPath(projectPathValue) {
  const value = String(projectPathValue || "").trim();
  if (!value) return { projectName: "", targetDir: "" };
  const clean = value.replace(/[\\/]+$/, "");
  const idx = Math.max(clean.lastIndexOf("/"), clean.lastIndexOf("\\"));
  if (idx < 0) return { projectName: clean, targetDir: "" };
  return {
    projectName: clean.slice(idx + 1),
    targetDir: clean.slice(0, idx)
  };
}

function updateGptFlowHint(promptPathValue) {
  if (promptPathValue === "prompts/gpt/01-gpt-project-start.md") {
    gptFlowHint.textContent =
      "→ Aktiv: Prompt 01. Kopiere ihn in einen neuen ChatGPT-Chat. Danach im selben Chat bleiben.";
    return;
  }
  if (
    promptPathValue === "prompts/gpt/02-gpt-project-definition.md" ||
    promptPathValue === "prompts/gpt/03-gpt-usecase-definition.md" ||
    promptPathValue === "prompts/gpt/04-gpt-pflichtenheft-prep.md"
  ) {
    gptFlowHint.textContent =
      "→ Aktiv: Diesen Prompt in denselben ChatGPT-Chat kopieren, ausführen und danach hier „Schritt erledigt“ bestätigen.";
    return;
  }
  if (promptPathValue === "prompts/gpt/05-gpt-agent-handover.md") {
    gptFlowHint.textContent =
      "→ Aktiv: Prompt 05 ausführen. Danach den finalen PROJEKTKONTEXT aus ChatGPT übernehmen und in Schritt 3 speichern.";
    return;
  }
  gptFlowHint.textContent = "Prompt-Wizard geladen. Nur der aktuell aktive Prompt ist ausführbar.";
}

function normalizeProjectPath(targetDirValue, projectNameValue) {
  const targetDir = String(targetDirValue || "").trim();
  const projectName = String(projectNameValue || "").trim();
  if (!targetDir || !projectName) return "";
  const cleanTarget = targetDir.replace(/[\\/]+$/, "");
  return `${cleanTarget}/${projectName}`;
}

function getActiveProjectPath() {
  const fromStorage = localStorage.getItem(ACTIVE_PROJECT_PATH_KEY) || "";
  if (fromStorage.trim()) return fromStorage.trim();
  return normalizeProjectPath(targetDirInput.value, projectNameInput.value);
}

function buildGptWizardStorageKey(projectPathValue) {
  const pathValue = String(projectPathValue || "").trim();
  if (!pathValue) return "";
  return `${GPT_WIZARD_STORAGE_PREFIX}${pathValue}`;
}

function resetGptWizardState() {
  gptPromptContentByPath = {};
  gptActiveIndex = 0;
  gptCompleted = Array.from({ length: GPT_PROMPTS.length }, () => false);
  gptExpandedIndex = 0;
  state.gptCompletedCount = 0;
  if (gptCompleteHint) gptCompleteHint.classList.add("is-hidden");
}

function saveGptWizardState(projectPathValue = activeProjectPath) {
  const storageKey = buildGptWizardStorageKey(projectPathValue);
  if (!storageKey) return;
  localStorage.setItem(
    storageKey,
    JSON.stringify({ completed: gptCompleted, activeIndex: gptActiveIndex, expandedIndex: gptExpandedIndex })
  );
}

function loadGptWizardState(projectPathValue = activeProjectPath) {
  resetGptWizardState();
  const storageKey = buildGptWizardStorageKey(projectPathValue);
  if (!storageKey) return;
  const raw = localStorage.getItem(storageKey);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.completed) && parsed.completed.length === GPT_PROMPTS.length) {
      gptCompleted = parsed.completed.map(Boolean);
    }
    if (Number.isInteger(parsed.activeIndex)) {
      gptActiveIndex = Math.min(Math.max(parsed.activeIndex, 0), GPT_PROMPTS.length - 1);
    }
    if (Number.isInteger(parsed.expandedIndex)) {
      gptExpandedIndex = parsed.expandedIndex;
    }
  } catch {
    resetGptWizardState();
  }
  state.gptCompletedCount = gptCompleted.filter(Boolean).length;
  if (state.gptCompletedCount === GPT_PROMPTS.length && gptCompleteHint) {
    gptCompleteHint.classList.remove("is-hidden");
  }
}

function setActiveProjectPath(projectPathValue) {
  activeProjectPath = String(projectPathValue || "").trim();
  if (activeProjectPath) {
    localStorage.setItem(ACTIVE_PROJECT_PATH_KEY, activeProjectPath);
    state.projectCreated = true;
    const parts = splitProjectPath(activeProjectPath);
    if (parts.projectName) projectNameInput.value = parts.projectName;
    if (parts.targetDir) {
      targetDirInput.value = parts.targetDir;
      localStorage.setItem("gs.targetDir", parts.targetDir);
    }
  } else {
    localStorage.removeItem(ACTIVE_PROJECT_PATH_KEY);
    state.projectCreated = false;
  }
  renderProjectSelectionList();
}

function switchActiveProject(projectPathValue) {
  const nextPath = String(projectPathValue || "").trim();
  if (!nextPath) return;
  setActiveProjectPath(nextPath);
  loadGptWizardState(nextPath);
  updateGptFlowHint(GPT_PROMPTS[Math.min(gptActiveIndex, GPT_PROMPTS.length - 1)]?.path || "");
  renderGptWizard();
  updateStepper();
}

function markGptStepperCompletedFromContext() {
  gptPromptContentByPath = {};
  gptCompleted = Array.from({ length: GPT_PROMPTS.length }, () => true);
  gptActiveIndex = GPT_PROMPTS.length - 1;
  gptExpandedIndex = -1;
  state.gptCompletedCount = GPT_PROMPTS.length;
  if (gptCompleteHint) gptCompleteHint.classList.remove("is-hidden");
}

function inferStepState(stepId) {
  if (stepId === "project") return "active";
  if (stepId === "gpt") return state.projectCreated ? "active" : "locked";
  if (stepId === "context") {
    if (!state.projectCreated) return "locked";
    return state.gptCompletedCount === GPT_PROMPTS.length ? "active" : "upcoming";
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
  if (stepId === "gpt" && state.gptCompletedCount > 0) return `${state.gptCompletedCount}/5 erledigt`;
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
  setSectionEnabled("step-context", state.projectCreated && state.gptCompletedCount === GPT_PROMPTS.length);
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

async function detectExistingProject(projectPathValue, projectName, targetDir) {
  const result = await fetchJson("/api/project/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectName, targetDir })
  });
  return Boolean(result.exists) && String(result.projectPath || "") === String(projectPathValue || "");
}

function renderProjectSelectionList() {
  if (!projectSelectionList) return;
  projectSelectionList.innerHTML = "";
  if (!availableProjects.length) {
    projectSelectionEmpty.classList.remove("is-hidden");
    return;
  }
  projectSelectionEmpty.classList.add("is-hidden");
  for (const project of availableProjects) {
    const li = document.createElement("li");
    li.className = "project-selection-item";
    if (project.path === activeProjectPath) li.classList.add("is-active");
    li.innerHTML = `
      <div>
        <p class="project-selection-name">${project.name}</p>
        <p class="project-selection-path">${project.path}</p>
      </div>
    `;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = project.path === activeProjectPath ? "secondary" : "";
    btn.textContent = project.path === activeProjectPath ? "Aktiv" : "Projekt öffnen";
    btn.disabled = project.path === activeProjectPath;
    btn.addEventListener("click", () => {
      openExistingProjectByPath(project.path).catch((e) => setStatus(e.message, true));
    });
    li.appendChild(btn);
    projectSelectionList.appendChild(li);
  }
}

async function refreshProjectSelectionList() {
  const targetDir = targetDirInput.value.trim();
  if (!targetDir || !isLikelyAbsolutePath(targetDir)) {
    availableProjects = [];
    renderProjectSelectionList();
    return;
  }
  try {
    const result = await fetchJson("/api/projects/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetDir })
    });
    availableProjects = Array.isArray(result.projects) ? result.projects : [];
    renderProjectSelectionList();
  } catch {
    availableProjects = [];
    renderProjectSelectionList();
  }
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
        await fetchJson(`/api/prompt?path=${encodeURIComponent(promptPathValue)}`);
        setStatus("Task Frame angezeigt (Pflichtregel, nicht ausführbar).");
      });
      li.appendChild(btn);
      targetList.appendChild(li);
      return;
    }

    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = "prompt-item";
    btn.textContent = promptPathValue;
    btn.addEventListener("click", async () => {
      const result = await fetchJson(`/api/prompt?path=${encodeURIComponent(promptPathValue)}`);
      if (activePromptButton) activePromptButton.classList.remove("active");
      activePromptButton = btn;
      btn.classList.add("active");
      selectedAgentPath = result.path;
      selectedAgentContent = result.content || "";
      updateHandoverAgentDisplay();
      setStatus("Alternativer Agent-Prompt ausgewählt.");
    });
    li.appendChild(btn);
    targetList.appendChild(li);
  });
}

function gptStatusLabel(idx) {
  if (gptCompleted[idx]) return "✔ erledigt";
  if (idx === gptActiveIndex) return "→ aktiv";
  return "🔒 gesperrt";
}

async function copyGptPrompt(idx) {
  const prompt = GPT_PROMPTS[idx];
  if (idx !== gptActiveIndex || gptCompleted[idx]) return;
  if (!gptPromptContentByPath[prompt.path]) {
    const result = await fetchJson(`/api/prompt?path=${encodeURIComponent(prompt.path)}`);
    gptPromptContentByPath[prompt.path] = result.content || "";
  }
  await navigator.clipboard.writeText(gptPromptContentByPath[prompt.path]);
  setStatus("Prompt kopiert.");
  updateGptFlowHint(prompt.path);
  const feedback = document.querySelector(`[data-gpt-feedback='${idx}']`);
  if (feedback) {
    feedback.textContent =
      "→ Füge den Prompt jetzt in ChatGPT ein und führe ihn dort aus. Danach hier zurückkommen und Schritt abschließen.";
  }
}

function completeGptPrompt(idx) {
  if (idx !== gptActiveIndex || gptCompleted[idx]) return;
  gptCompleted[idx] = true;
  state.gptCompletedCount = gptCompleted.filter(Boolean).length;
  if (gptActiveIndex < GPT_PROMPTS.length - 1) {
    gptActiveIndex += 1;
    gptExpandedIndex = gptActiveIndex;
    updateGptFlowHint(GPT_PROMPTS[gptActiveIndex].path);
  } else {
    gptExpandedIndex = -1;
    updateGptFlowHint("");
    if (gptCompleteHint) gptCompleteHint.classList.remove("is-hidden");
    setStatus("GPT-Phase abgeschlossen. Weiter mit Schritt 3: Projektkontext speichern.");
  }
  saveGptWizardState();
  updateStepper();
  renderGptWizard();
}

function togglePromptPanel(idx) {
  if (idx > gptActiveIndex && !gptCompleted[idx]) return;
  gptExpandedIndex = gptExpandedIndex === idx ? -1 : idx;
  saveGptWizardState();
  renderGptWizard();
}

function renderGptWizard() {
  gptWizard.innerHTML = "";
  if (gptCompleteHint) {
    gptCompleteHint.classList.toggle("is-hidden", state.gptCompletedCount !== GPT_PROMPTS.length);
  }
  GPT_PROMPTS.forEach((prompt, idx) => {
    const item = document.createElement("article");
    item.className = "gpt-accordion-item";
    const isDone = gptCompleted[idx];
    const isActive = idx === gptActiveIndex && !isDone;
    const isLocked = !isDone && idx > gptActiveIndex;
    if (isActive) item.classList.add("active");
    if (isDone) item.classList.add("done");
    if (isLocked) item.classList.add("locked");

    const head = document.createElement("button");
    head.type = "button";
    head.className = "gpt-accordion-head";
    head.innerHTML = `<span>${prompt.title}</span><span class="gpt-status-text">${gptStatusLabel(idx)}</span>`;
    head.addEventListener("click", () => togglePromptPanel(idx));
    if (isLocked) head.disabled = true;
    item.appendChild(head);

    const panel = document.createElement("div");
    panel.className = "gpt-accordion-panel";
    const shouldOpen = isActive || gptExpandedIndex === idx;
    panel.classList.toggle("open", shouldOpen);

    if (shouldOpen && !isLocked) {
      const content = gptPromptContentByPath[prompt.path] || "Prompt wird geladen...";
      panel.innerHTML = `
        <pre class="prompt-content gpt-prompt-content">${content}</pre>
        <div class="button-row">
          <button type="button" class="secondary" data-gpt-copy="${idx}">Prompt kopieren</button>
          <button type="button" data-gpt-done="${idx}" ${isDone ? "disabled" : ""}>Schritt erledigt</button>
        </div>
        <p class="gpt-inline-feedback" data-gpt-feedback="${idx}" aria-live="polite"></p>
      `;
    }
    item.appendChild(panel);
    gptWizard.appendChild(item);

    if (shouldOpen && !isLocked && !gptPromptContentByPath[prompt.path]) {
      fetchJson(`/api/prompt?path=${encodeURIComponent(prompt.path)}`)
        .then((result) => {
          gptPromptContentByPath[prompt.path] = result.content || "";
          renderGptWizard();
        })
        .catch((error) => setStatus(`GPT-Prompt konnte nicht geladen werden: ${error.message}`, true));
    }
  });

  gptWizard.querySelectorAll("[data-gpt-copy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      copyGptPrompt(Number(btn.dataset.gptCopy)).catch((e) => setStatus(e.message, true));
    });
  });
  gptWizard.querySelectorAll("[data-gpt-done]").forEach((btn) => {
    btn.addEventListener("click", () => completeGptPrompt(Number(btn.dataset.gptDone)));
  });
}

async function loadPrompts() {
  const [gptData, agentData] = await Promise.all([fetchJson("/api/prompts/gpt"), fetchJson("/api/prompts/agent")]);
  const gptFromRepo = gptData.prompts || [];
  for (const prompt of GPT_PROMPTS) {
    if (!gptFromRepo.includes(prompt.path)) {
      throw new Error(`Erwarteter GPT-Prompt fehlt: ${prompt.path}`);
    }
  }
  renderGptWizard();
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
  const projectPathCandidate = normalizeProjectPath(targetDir, projectName);
  localStorage.setItem("gs.targetDir", targetDir);
  createProjectBtn.disabled = true;
  setExistingProjectPrompt(false);
  projectCreateResult.textContent = "Projekt wird angelegt...";
  try {
    const exists = await detectExistingProject(projectPathCandidate, projectName, targetDir);
    if (exists) {
      projectCreateResult.textContent = "Projekt existiert bereits.";
      setExistingProjectPrompt(true, projectPathCandidate);
      setStatus("Bestehendes Projekt erkannt. Du kannst es jetzt öffnen.");
      return;
    }
    const result = await fetchJson("/api/project/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectName, targetDir })
    });
    projectCreateResult.textContent = formatProjectCreateSuccess(result);
    setActiveProjectPath(result.projectPath || normalizeProjectPath(targetDir, projectName));
    resetGptWizardState();
    saveGptWizardState(activeProjectPath);
    renderGptWizard();
    updateStepper();
    await refreshProjectSelectionList();
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

async function loadContextForProjectOpen() {
  const res = await fetch("/api/context");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    contextInput.value = "";
    state.contextSaved = false;
    await refreshHandoverContextState();
    return false;
  }
  contextInput.value = data.content || "";
  await refreshHandoverContextState();
  return Boolean((data.content || "").trim());
}

async function openExistingProject() {
  if (!pendingExistingProject) {
    setStatus("Kein bestehendes Projekt zum Öffnen ausgewählt.", true);
    return;
  }
  const projectName = projectNameInput.value.trim();
  const targetDir = targetDirInput.value.trim();
  const result = await fetchJson("/api/project/open", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectName, targetDir })
  });
  setActiveProjectPath(result.projectPath);
  setExistingProjectPrompt(false);
  const hasContext = await loadContextForProjectOpen();
  if (hasContext) {
    markGptStepperCompletedFromContext();
  } else {
    resetGptWizardState();
  }
  saveGptWizardState(result.projectPath);
  updateGptFlowHint(hasContext ? "" : GPT_PROMPTS[0].path);
  renderGptWizard();
  updateStepper();

  if (!hasContext) {
    setStatus("Projekt geöffnet. Dieses Projekt hat noch keinen gespeicherten Kontext.");
  } else {
    setStatus("Projekt geöffnet. Kontext gefunden - du kannst direkt ab Schritt 4 weiterarbeiten.");
  }
  projectCreateResult.textContent = [
    "Projekt geöffnet.",
    "",
    `Pfad: ${result.projectPath}`,
    hasContext
      ? "- Kontext vorhanden: GPT-Phase als abgeschlossen markiert."
      : "- Dieses Projekt hat noch keinen gespeicherten Kontext.",
    hasContext
      ? "- Kontext aus .goldstandard/context.txt wurde geladen."
      : "→ Starte den GPT-Workflow erneut (ab Prompt 01)\nODER\n→ füge den finalen PROJEKTKONTEXT direkt in Schritt 3 ein"
  ].join("\n");
}

async function openExistingProjectByPath(projectPathValue) {
  const parts = splitProjectPath(projectPathValue);
  if (!parts.projectName || !parts.targetDir) {
    setStatus("Ungültiger Projektpfad.", true);
    return;
  }
  projectNameInput.value = parts.projectName;
  targetDirInput.value = parts.targetDir;
  pendingExistingProject = { projectPath: projectPathValue };
  await openExistingProject();
  await refreshProjectSelectionList();
}

function setupDefaults() {
  localStorage.removeItem(LEGACY_GPT_WIZARD_KEY);
  const savedTarget = localStorage.getItem("gs.targetDir");
  targetDirInput.value = savedTarget || "/Users/<dein-name>/Projects";
  const initialProjectPath = getActiveProjectPath();
  if (initialProjectPath) {
    setActiveProjectPath(initialProjectPath);
    loadGptWizardState(initialProjectPath);
  } else {
    resetGptWizardState();
  }
}

saveContextBtn.addEventListener("click", () => saveContext().catch((e) => setStatus(e.message, true)));
loadContextBtn.addEventListener("click", () => loadContext().catch((e) => setStatus(e.message, true)));
createProjectBtn.addEventListener("click", () => createProject().catch((e) => setStatus(e.message, true)));
buildAgentInputBtn.addEventListener("click", () => buildFullAgentInput().catch((e) => setStatus(e.message, true)));
copyAgentInputBtn.addEventListener("click", () => copyFullAgentInput().catch((e) => setStatus(e.message, true)));
openExistingBtn.addEventListener("click", () => openExistingProject().catch((e) => setStatus(e.message, true)));
cancelOpenExistingBtn.addEventListener("click", () => {
  setExistingProjectPrompt(false);
  projectCreateResult.textContent = "Öffnen abgebrochen. Du kannst jetzt ein neues Projekt anlegen.";
});
refreshProjectListBtn.addEventListener("click", () => refreshProjectSelectionList().catch((e) => setStatus(e.message, true)));
targetDirInput.addEventListener("blur", () => refreshProjectSelectionList().catch(() => {}));

async function init() {
  setupDefaults();
  await loadPrompts();
  await refreshProjectSelectionList();
  updateHandoverAgentDisplay();
  await refreshHandoverContextState();
  updateGptFlowHint(GPT_PROMPTS[Math.min(gptActiveIndex, GPT_PROMPTS.length - 1)]?.path || "");
  updateStepper();
}

init().catch((error) => setStatus(`Initialisierung fehlgeschlagen: ${error.message}`, true));
