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
const gptFlowHint = document.getElementById("gpt-flow-hint");
const buildAgentInputBtn = document.getElementById("build-agent-input-btn");
const copyAgentInputBtn = document.getElementById("copy-agent-input-btn");
const agentCombinedOutput = document.getElementById("agent-combined-output");
const agentInputHint = document.getElementById("agent-input-hint");
const handoverAgentPath = document.getElementById("handover-agent-path");

const TASK_FRAME_REF = "prompts/agent/00-agent-task-frame.md";
const WORKFLOW_PROMPT_PATH = "prompts/agent/01-agent-run-workflow.md";

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
  if (!copyPromptFeedback) {
    return;
  }
  copyPromptFeedback.textContent = message;
  if (message) {
    window.setTimeout(() => {
      if (copyPromptFeedback.textContent === message) {
        copyPromptFeedback.textContent = "";
      }
    }, 1800);
  }
}

function updateGptFlowHint(promptPathValue) {
  if (!gptFlowHint) {
    return;
  }
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
      "Kopiere diesen Prompt in denselben ChatGPT-Chat. Beantworte Rückfragen von ChatGPT und fahre danach mit dem nächsten GPT-Prompt fort.";
    return;
  }
  if (promptPathValue === "prompts/gpt/05-gpt-agent-handover.md") {
    gptFlowHint.textContent =
      "Kopiere diesen Prompt in denselben ChatGPT-Chat. GPT erzeugt danach den PROJEKTKONTEXT. Kopiere diesen Kontext anschließend unten in den Handover-Kontext.";
    return;
  }
  gptFlowHint.textContent = "Wähle einen GPT-Prompt aus, um den nächsten Schritt im ChatGPT-Flow zu sehen.";
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Unbekannter Fehler");
  }
  return data;
}

function updateHandoverAgentDisplay() {
  if (!handoverAgentPath) {
    return;
  }
  if (!selectedAgentPath) {
    handoverAgentPath.textContent = `Standard: ${WORKFLOW_PROMPT_PATH} (empfohlener Startpunkt)`;
    return;
  }
  if (selectedAgentPath === WORKFLOW_PROMPT_PATH) {
    handoverAgentPath.textContent = `${WORKFLOW_PROMPT_PATH} (aus Liste geladen)`;
    return;
  }
  handoverAgentPath.textContent = `Alternativ gewählt: ${selectedAgentPath} (statt Standard-Workflow)`;
}

async function loadPromptContentByPath(promptPathValue, phaseLabel = null, button = null, options = {}) {
  const viewOnly = Boolean(options.viewOnly);
  const result = await fetchJson(`/api/prompt?path=${encodeURIComponent(promptPathValue)}`);
  if (activePromptButton) {
    activePromptButton.classList.remove("active");
  }
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

  if (viewOnly && result.path === TASK_FRAME_REF) {
    setStatus("Agent Task Frame als Pflichtregel angezeigt (nicht als Ausführungsprompt).");
  } else if (phaseLabel) {
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
    if (phaseLabel === "Agent" && promptPathValue === TASK_FRAME_REF) {
      const li = document.createElement("li");
      li.className = "taskframe-list-item";

      const title = document.createElement("p");
      title.className = "taskframe-title";
      title.textContent = "Agent Task Frame (Pflichtregel)";

      const subtitle = document.createElement("p");
      subtitle.className = "taskframe-subtitle";
      subtitle.textContent =
        "Dieser Prompt definiert den verpflichtenden Arbeitsrahmen für alle Agent-Aufgaben und wird automatisch berücksichtigt.";

      const buttonRow = document.createElement("div");
      buttonRow.className = "taskframe-actions";
      const viewBtn = document.createElement("button");
      viewBtn.className = "secondary";
      viewBtn.type = "button";
      viewBtn.textContent = "Anzeigen";
      viewBtn.addEventListener("click", async () => {
        try {
          await loadPromptContentByPath(promptPathValue, phaseLabel, null, { viewOnly: true });
        } catch (error) {
          setStatus(`Prompt konnte nicht geladen werden: ${error.message}`, true);
        }
      });
      buttonRow.appendChild(viewBtn);

      li.appendChild(title);
      li.appendChild(subtitle);
      li.appendChild(buttonRow);
      targetList.appendChild(li);
      return;
    }

    const li = document.createElement("li");
    const row = document.createElement("div");
    row.className = "prompt-item-row";
    const btn = document.createElement("button");
    btn.className = "prompt-item";
    btn.dataset.promptPath = promptPathValue;
    btn.textContent = promptPathValue;
    btn.addEventListener("click", async () => {
      try {
        await loadPromptContentByPath(promptPathValue, phaseLabel, btn);
      } catch (error) {
        setStatus(`Prompt konnte nicht geladen werden: ${error.message}`, true);
      }
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

Der Kontext wird aktuell im Launcher gespeichert und beim Agent-Input mit übergeben.

### Nächster Schritt

1. Workflow-Input kopieren
2. Zielprojekt in Cursor öffnen
3. Cursor-Agent starten
4. Workflow-Input einfügen
5. Agent ausführen
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
    ? "Workflow-Input mit alternativem Agent-Prompt erzeugt. Danach: kopieren, Zielprojekt in Cursor öffnen, Agent starten."
    : "Workflow-Input mit zentralem Workflow-Prompt erzeugt. Danach: kopieren, Zielprojekt in Cursor öffnen, Agent starten.";
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
    if (currentPromptPhase === "GPT" && currentPromptPath) {
      copiedGptPrompts.add(currentPromptPath);
      const badge = document.querySelector(`[data-copy-badge-for="${CSS.escape(currentPromptPath)}"]`);
      if (badge) {
        badge.style.visibility = "visible";
      }
    }
    setCopyPromptFeedback("Prompt kopiert ✓");
    setStatus("Prompt kopiert ✓");
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

saveContextBtn.addEventListener("click", saveContext);
loadContextBtn.addEventListener("click", loadContext);
copyPromptBtn.addEventListener("click", copyPrompt);
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
  updateHandoverAgentDisplay();
  await refreshHandoverContextState();
}

init();
