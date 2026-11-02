#!/usr/bin/env node
/**
 * 極簡 DeepSeek CORS proxy
 * 用法：
 *   export DEEPSEEK_API_KEY=sk-xxx   # 可選；若未設則用前端 Authorization
 *   node server.js
 * 預設 http://127.0.0.1:8788
 *
 * 前端勾選「使用本機 proxy」，Proxy URL：
 *   http://127.0.0.1:8788/v1/chat/completions
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 8788);
const DEEPSEEK = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/$/, "");
const ROOT = __dirname;

function loadDotEnv() {
  const p = path.join(ROOT, ".env");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!(k in process.env)) process.env[k] = v;
  }
}
loadDotEnv();

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
}

function send(res, status, body, type = "application/json; charset=utf-8") {
  cors(res);
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function contentType(file) {
  if (file.endsWith(".html")) return "text/html; charset=utf-8";
  if (file.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (file.endsWith(".css")) return "text/css; charset=utf-8";
  if (file.endsWith(".json")) return "application/json; charset=utf-8";
  if (file.endsWith(".md")) return "text/markdown; charset=utf-8";
  return "application/octet-stream";
}

async function proxyChat(req, res) {
  const raw = await readBody(req);
  const envKey = process.env.DEEPSEEK_API_KEY || "";
  const headerAuth = req.headers.authorization || "";
  const bearer = envKey ? `Bearer ${envKey}` : headerAuth;
  if (!bearer || bearer === "Bearer proxy") {
    return send(res, 401, JSON.stringify({ error: "缺少 API Key（.env DEEPSEEK_API_KEY 或前端 Authorization）" }));
  }

  const upstream = await fetch(`${DEEPSEEK}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: bearer,
    },
    body: raw.length ? raw : "{}",
  });
  const text = await upstream.text();
  cors(res);
  res.writeHead(upstream.status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(text);
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      cors(res);
      res.writeHead(204);
      return res.end();
    }

    const url = new URL(req.url, `http://127.0.0.1:${PORT}`);

    if (req.method === "POST" && (url.pathname === "/v1/chat/completions" || url.pathname === "/chat/completions")) {
      return await proxyChat(req, res);
    }

    if (req.method === "GET" && url.pathname === "/health") {
      return send(res, 200, JSON.stringify({ ok: true, hasEnvKey: Boolean(process.env.DEEPSEEK_API_KEY) }));
    }

    // 靜態檔（方便只開一個埠）
    let filePath = url.pathname === "/" ? "/index.html" : url.pathname;
    filePath = path.normalize(filePath).replace(/^(\.\.[/\\])+/, "");
    const abs = path.join(ROOT, filePath);
    if (!abs.startsWith(ROOT)) {
      return send(res, 403, "Forbidden", "text/plain");
    }
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
      return send(res, 200, fs.readFileSync(abs), contentType(abs));
    }
    send(res, 404, "Not Found", "text/plain");
  } catch (e) {
    console.error(e);
    send(res, 500, JSON.stringify({ error: String(e.message || e) }));
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[yingzheng-amnesia] http://127.0.0.1:${PORT}/`);
  console.log(`proxy: POST /v1/chat/completions -> ${DEEPSEEK}/chat/completions`);
});
