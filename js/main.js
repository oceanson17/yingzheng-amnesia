/**
 * 啟動入口
 */
import { bindUI } from "./ui.js";
import * as Game from "./game.js";
import { loadSettings, saveSettings, loadGame } from "./save.js";

const VERSION = "1.0.1";

function fillSettingsForm(root) {
  const s = loadSettings();
  root.querySelector("#set-apikey").value = s.apiKey || "";
  root.querySelector("#set-base").value = s.baseUrl || "https://api.deepseek.com";
  root.querySelector("#set-model").value = s.model || "deepseek-flash";
  root.querySelector("#set-proxy").checked = !!s.useProxy;
  root.querySelector("#set-proxy-url").value = s.proxyUrl || "http://127.0.0.1:8788/v1/chat/completions";
  root.querySelector("#set-demo-force").checked = !!s.demoForce;
}

function readSettingsForm(root) {
  return {
    apiKey: root.querySelector("#set-apikey").value.trim(),
    baseUrl: root.querySelector("#set-base").value.trim() || "https://api.deepseek.com",
    model: root.querySelector("#set-model").value.trim() || "deepseek-flash",
    useProxy: root.querySelector("#set-proxy").checked,
    proxyUrl:
      root.querySelector("#set-proxy-url").value.trim() ||
      "http://127.0.0.1:8788/v1/chat/completions",
    demoForce: root.querySelector("#set-demo-force").checked,
  };
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

async function boot() {
  const root = document.documentElement;
  document.querySelector("#app-version").textContent = `v${VERSION}`;

  const hasSave = !!loadGame();
  const contBtn = document.querySelector("#btn-continue");
  if (contBtn) contBtn.disabled = !hasSave;

  const ui = bindUI(document, {
    onNewGame: () => Game.startNewGame(),
    onContinue: () => Game.continueGame(),
    onChoice: (id, text) => Game.choose(id, text),
    onCustom: (t) => Game.submitCustom(t),
    onSave: () => {
      const ok = Game.doSave();
      document.querySelector("#status-line").textContent = ok ? "已存檔" : "存檔失敗";
    },
    onExport: () => {
      downloadText(`yingzheng-save-day${Game.getState().day}.json`, Game.doExport());
      document.querySelector("#status-line").textContent = "已匯出 JSON";
    },
    onImport: async () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json,.json";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        try {
          const text = await file.text();
          Game.doImport(text);
          ui.showScreen("game");
        } catch (e) {
          alert("匯入失敗：" + (e.message || e));
        }
      };
      input.click();
    },
    onOpenSettings: () => fillSettingsForm(document),
    onSaveSettings: () => {
      const s = readSettingsForm(document);
      saveSettings(s);
      document.querySelector("#settings-msg").textContent = "設定已儲存（API Key 僅存本機 localStorage）";
      // 刷新 badge
      ui.onUpdate(Game.getSnapshot(), {});
    },
  });

  Game.subscribe((snap, extra) => ui.onUpdate(snap, extra));

  ui.showScreen("title");
  fillSettingsForm(document);

  // URL ?v= 僅供 cache-bust；可 ?demo=1 強制示範
  const params = new URLSearchParams(location.search);
  if (params.get("demo") === "1") {
    const s = loadSettings();
    s.demoForce = true;
    saveSettings(s);
  }
  if (params.get("autostart") === "1") {
    ui.showScreen("game");
    await Game.startNewGame();
  }
}

boot().catch((e) => {
  console.error(e);
  const n = document.querySelector("#narrative");
  if (n) n.textContent = "啟動失敗：" + e;
});
