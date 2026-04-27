const gptList = document.getElementById("gpt-list");
const agentList = document.getElementById("agent-list");
const promptPath = document.getElementById("prompt-path");
const promptContent = document.getElementById("prompt-content");
const copyPromptBtn = document.getElementById("copyPromptBtn");
const contextInput = document.getElementById("context-input");
const saveContextBtn = document.getElementById("save-context");
const loadContextBtn = document.getElementById("load-context");
const statusMessage = document.getElementById("status-message");

let currentPromptContent = "";
let activePromptButton = null;

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
        const result = await fetchJson(`/api/prompt?path=${encodeURIComponent(promptPathValue)}`);
        if (activePromptButton) {
          activePromptButton.classList.remove("active");
        }
        activePromptButton = btn;
        activePromptButton.classList.add("active");

        promptPath.textContent = `Pfad: ${result.path}`;
        currentPromptContent = result.content || "";
        promptContent.textContent = currentPromptContent;
        copyPromptBtn.disabled = currentPromptContent.trim().length === 0;
        setStatus(`${phaseLabel}-Prompt geladen: ${result.path}`);
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

saveContextBtn.addEventListener("click", saveContext);
loadContextBtn.addEventListener("click", loadContext);
copyPromptBtn.addEventListener("click", copyPrompt);

promptContent.textContent = "Wähle links einen Prompt aus, um den Inhalt anzuzeigen.";
copyPromptBtn.disabled = true;
loadPrompts();
