/**
 * UI：竹簡／秦制美學
 */
const hourName = (h) => {
  const names = ["夜半","雞鳴","平旦","日出","食時","隅中","日中","日昳","晡時","日入","黃昏","人定"];
  const i = Math.floor((((h % 24) + 24) % 24) / 2);
  return names[i] || `${h}時`;
};

export function bindUI(root, api) {
  const els = {
    narrative: root.querySelector("#narrative"),
    choices: root.querySelector("#choices"),
    custom: root.querySelector("#custom-input"),
    customBtn: root.querySelector("#custom-btn"),
    hp: root.querySelector("#stat-hp"),
    energy: root.querySelector("#stat-energy"),
    coin: root.querySelector("#stat-coin"),
    grain: root.querySelector("#stat-grain"),
    renown: root.querySelector("#stat-renown"),
    threat: root.querySelector("#stat-threat"),
    identity: root.querySelector("#stat-identity"),
    place: root.querySelector("#stat-place"),
    time: root.querySelector("#stat-time"),
    memories: root.querySelector("#memories"),
    inventory: root.querySelector("#inventory"),
    flags: root.querySelector("#flags"),
    mode: root.querySelector("#mode-badge"),
    status: root.querySelector("#status-line"),
    screens: {
      title: root.querySelector("#screen-title"),
      game: root.querySelector("#screen-game"),
      settings: root.querySelector("#screen-settings"),
    },
  };

  function showScreen(name) {
    Object.entries(els.screens).forEach(([k, el]) => {
      if (!el) return;
      el.hidden = k !== name;
    });
  }

  function renderStats(snap) {
    const s = snap.state;
    els.hp.textContent = s.hp;
    els.energy.textContent = s.energy;
    els.coin.textContent = s.coin;
    els.grain.textContent = s.grain;
    els.renown.textContent = s.renown;
    els.threat.textContent = s.courtThreat;
    els.identity.textContent = s.identityHint;
    els.place.textContent = s.location;
    els.time.textContent = `第${s.day}日 · ${hourName(s.hour)}`;
    els.mode.textContent = snap.apiReady ? "DeepSeek 內核" : "示範模式";
    els.mode.classList.toggle("api", snap.apiReady);

    els.memories.innerHTML = (s.memories || []).length
      ? s.memories
          .map((m) => `<li><strong>${escapeHtml(m.title)}</strong> — ${escapeHtml(m.text)}</li>`)
          .join("")
      : "<li class='muted'>尚無記憶碎片</li>";

    els.inventory.innerHTML = (s.inventory || []).map((i) => `<li>${escapeHtml(i)}</li>`).join("");

    const activeFlags = Object.entries(s.flags || {})
      .filter(([, v]) => v && v !== false)
      .map(([k, v]) => (typeof v === "string" ? `${k}:${v}` : k));
    els.flags.innerHTML = activeFlags.length
      ? activeFlags.map((f) => `<span class="tag">${escapeHtml(f)}</span>`).join("")
      : '<span class="muted">無</span>';
  }

  function renderChoices(snap) {
    els.choices.innerHTML = "";
    if (snap.busy) {
      els.status.textContent = "筆墨運思中……";
      els.custom.disabled = true;
      els.customBtn.disabled = true;
      return;
    }
    els.custom.disabled = false;
    els.customBtn.disabled = false;
    els.status.textContent = snap.apiReady ? "DeepSeek 生成劇情中亦可自訂行動" : "示範劇本 · 可輸入關鍵詞自訂行動";

    for (const c of snap.choices || []) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-btn";
      btn.textContent = c.text;
      btn.addEventListener("click", () => api.onChoice(c.id, c.text));
      els.choices.appendChild(btn);
    }
  }

  function typeNarrative(text) {
    els.narrative.textContent = "";
    const parts = String(text || "").split("\n");
    els.narrative.innerHTML = parts.map((p) => (p.trim() ? `<p>${escapeHtml(p)}</p>` : "<br/>")).join("");
    els.narrative.parentElement?.scrollTo?.({ top: 0, behavior: "smooth" });
  }

  function onUpdate(snap, extra = {}) {
    renderStats(snap);
    renderChoices(snap);
    if (extra.event === "narrative" || extra.event === "boot") {
      if (extra.narrative) typeNarrative(extra.narrative);
      if (extra.memoryHints?.length) {
        els.status.textContent = "閃念：" + extra.memoryHints.join("／");
      }
      if (extra.ending) {
        els.status.textContent = `結局：${extra.ending}`;
        root.querySelector("#game-shell")?.classList.add("ending");
      } else {
        root.querySelector("#game-shell")?.classList.remove("ending");
      }
      if (extra.fallback) {
        els.status.textContent = (els.status.textContent || "") + " · 已回退示範";
      }
    }
    if (extra.event === "error") {
      els.status.textContent = "錯誤：" + (extra.error || "");
    }
    if (extra.event === "busy") {
      els.status.textContent = "筆墨運思中……";
    }
  }

  // 標題／設定按鈕
  root.querySelector("#btn-new")?.addEventListener("click", () => {
    showScreen("game");
    api.onNewGame();
  });
  root.querySelector("#btn-continue")?.addEventListener("click", () => {
    showScreen("game");
    api.onContinue();
  });
  root.querySelector("#btn-settings")?.addEventListener("click", () => {
    showScreen("settings");
    api.onOpenSettings();
  });
  root.querySelector("#btn-settings-game")?.addEventListener("click", () => {
    showScreen("settings");
    api.onOpenSettings();
  });
  root.querySelector("#btn-back-game")?.addEventListener("click", () => showScreen("game"));
  root.querySelector("#btn-back-title")?.addEventListener("click", () => showScreen("title"));
  root.querySelector("#btn-settings-to-title")?.addEventListener("click", () => showScreen("title"));
  root.querySelector("#btn-save")?.addEventListener("click", () => api.onSave());
  root.querySelector("#btn-export")?.addEventListener("click", () => api.onExport());
  root.querySelector("#btn-import")?.addEventListener("click", () => api.onImport());
  root.querySelector("#settings-save")?.addEventListener("click", () => api.onSaveSettings());

  els.customBtn?.addEventListener("click", () => {
    const v = els.custom.value;
    els.custom.value = "";
    api.onCustom(v);
  });
  els.custom?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      els.customBtn.click();
    }
  });

  return { showScreen, onUpdate, typeNarrative, els };
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
