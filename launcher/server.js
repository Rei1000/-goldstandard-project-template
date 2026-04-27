import fs from "fs";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.join(__dirname, "..");
const PUBLIC_DIR = path.join(__dirname, "public");
const CONTEXT_DIR = path.join(REPO_ROOT, ".goldstandard");
const CONTEXT_FILE = path.join(CONTEXT_DIR, "context.txt");
const PROGRESS_FILE = path.join(CONTEXT_DIR, "progress.json");

const PORT = 3000;

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function sendText(res, statusCode, text, contentType = "text/plain; charset=utf-8") {
  res.writeHead(statusCode, { "Content-Type": contentType });
  res.end(text);
}

function safeReadPromptDir(relativeDir) {
  const fullDir = path.join(REPO_ROOT, relativeDir);
  if (!fs.existsSync(fullDir)) {
    return { error: `Ordner nicht gefunden: ${relativeDir}` };
  }
  const files = fs
    .readdirSync(fullDir)
    .filter((entry) => entry.endsWith(".md"))
    .sort()
    .map((name) => `${relativeDir}/${name}`);
  return { files };
}

function isAllowedPromptPath(requestedPath) {
  if (!requestedPath || typeof requestedPath !== "string") {
    return false;
  }
  if (requestedPath.includes("..")) {
    return false;
  }
  return requestedPath.startsWith("prompts/gpt/") || requestedPath.startsWith("prompts/agent/");
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function serveStatic(reqPath, res) {
  const normalizedPath = reqPath === "/" ? "/index.html" : reqPath;
  const fullPath = path.join(PUBLIC_DIR, normalizedPath);
  const resolved = path.resolve(fullPath);
  const publicResolved = path.resolve(PUBLIC_DIR);

  if (!resolved.startsWith(publicResolved)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
    sendText(res, 404, "Not Found");
    return;
  }

  const ext = path.extname(resolved).toLowerCase();
  const contentType =
    ext === ".html"
      ? "text/html; charset=utf-8"
      : ext === ".css"
      ? "text/css; charset=utf-8"
      : ext === ".js"
      ? "application/javascript; charset=utf-8"
      : "text/plain; charset=utf-8";

  const content = fs.readFileSync(resolved);
  sendText(res, 200, content, contentType);
}

function defaultProgress() {
  return {
    currentStep: 0,
    completedSteps: []
  };
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === "GET" && url.pathname === "/api/prompts/gpt") {
      const result = safeReadPromptDir("prompts/gpt");
      if (result.error) {
        sendJson(res, 404, { error: result.error });
      } else {
        sendJson(res, 200, { prompts: result.files });
      }
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/prompts/agent") {
      const result = safeReadPromptDir("prompts/agent");
      if (result.error) {
        sendJson(res, 404, { error: result.error });
      } else {
        sendJson(res, 200, { prompts: result.files });
      }
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/prompt") {
      const requestedPath = url.searchParams.get("path");
      if (!isAllowedPromptPath(requestedPath)) {
        sendJson(res, 400, { error: "Ungültiger Prompt-Pfad." });
        return;
      }

      const fullPath = path.join(REPO_ROOT, requestedPath);
      const resolved = path.resolve(fullPath);
      if (!resolved.startsWith(path.resolve(REPO_ROOT))) {
        sendJson(res, 403, { error: "Zugriff verweigert." });
        return;
      }
      if (!fs.existsSync(resolved)) {
        sendJson(res, 404, { error: "Prompt-Datei nicht gefunden." });
        return;
      }

      const content = fs.readFileSync(resolved, "utf8");
      sendJson(res, 200, { path: requestedPath, content });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/context") {
      if (!fs.existsSync(CONTEXT_FILE)) {
        sendJson(res, 404, { error: "Kein gespeicherter Kontext gefunden." });
        return;
      }
      const content = fs.readFileSync(CONTEXT_FILE, "utf8");
      sendJson(res, 200, { content });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/context") {
      const rawBody = await readBody(req);
      let parsed = {};
      try {
        parsed = JSON.parse(rawBody || "{}");
      } catch {
        sendJson(res, 400, { error: "Ungültiges JSON." });
        return;
      }

      const content = typeof parsed.content === "string" ? parsed.content : "";
      fs.mkdirSync(CONTEXT_DIR, { recursive: true });
      fs.writeFileSync(CONTEXT_FILE, content, "utf8");
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/progress") {
      if (!fs.existsSync(PROGRESS_FILE)) {
        sendJson(res, 200, defaultProgress());
        return;
      }

      try {
        const raw = fs.readFileSync(PROGRESS_FILE, "utf8");
        const parsed = JSON.parse(raw);
        sendJson(res, 200, {
          currentStep: Number.isInteger(parsed.currentStep) ? parsed.currentStep : 0,
          completedSteps: Array.isArray(parsed.completedSteps) ? parsed.completedSteps : []
        });
      } catch {
        sendJson(res, 200, defaultProgress());
      }
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/progress") {
      const rawBody = await readBody(req);
      let parsed = {};
      try {
        parsed = JSON.parse(rawBody || "{}");
      } catch {
        sendJson(res, 400, { error: "Ungültiges JSON." });
        return;
      }

      const payload = {
        currentStep: Number.isInteger(parsed.currentStep) ? parsed.currentStep : 0,
        completedSteps: Array.isArray(parsed.completedSteps)
          ? parsed.completedSteps.filter((v) => Number.isInteger(v))
          : []
      };

      fs.mkdirSync(CONTEXT_DIR, { recursive: true });
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify(payload, null, 2), "utf8");
      sendJson(res, 200, { ok: true });
      return;
    }

    serveStatic(url.pathname, res);
  } catch (error) {
    sendJson(res, 500, { error: `Serverfehler: ${error.message}` });
  }
});

server.listen(PORT, () => {
  console.log(`Goldstandard Launcher läuft auf http://localhost:${PORT}`);
});
