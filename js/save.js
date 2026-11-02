/**
 * 存檔系統 — SAVE_VERSION + localStorage + 匯出 JSON
 */
export const SAVE_VERSION = 1;
export const SAVE_KEY = "yingzheng-amnesia-v1";
export const SAVE_BAK_KEY = "yingzheng-amnesia-v1.bak";
export const SETTINGS_KEY = "yingzheng-amnesia-settings";

export function createInitialState() {
  return {
    version: SAVE_VERSION,
    day: 1,
    hour: 6,
    location: "咸陽郊外·破驛",
    locationId: "post_station",
    hp: 72,
    energy: 55,
    coin: 8,
    grain: 2,
    renown: 0, // 民間聲望 -50..100
    courtThreat: 0, // 朝廷追查 0..100
    identityHint: 0, // 身份覺察 0..100（唔直接劇透）
    memories: [], // {id, title, text, day}
    flags: {
      woke: false,
      met_innkeeper: false,
      helped_orphan: false,
      saw_edict: false,
      spoke_scholar: false,
      joined_rebel_talk: false,
      quiet_life: false,
      claimed_name: false,
      ending: null, // throne | folk | tragedy | reform | null
    },
    inventory: ["破布衣", "空囊"],
    log: [], // 最近敘事摘要
    sceneId: "wake",
    turn: 0,
    customInputCount: 0,
  };
}

function migrate(raw) {
  if (!raw || typeof raw !== "object") return null;
  let s = { ...createInitialState(), ...raw };
  if (!s.version || s.version < 1) s.version = 1;
  s.flags = { ...createInitialState().flags, ...(raw.flags || {}) };
  if (!Array.isArray(s.memories)) s.memories = [];
  if (!Array.isArray(s.inventory)) s.inventory = ["破布衣", "空囊"];
  if (!Array.isArray(s.log)) s.log = [];
  return s;
}

export function validateState(s) {
  if (!s || typeof s !== "object") return false;
  if (typeof s.hp !== "number" || typeof s.day !== "number") return false;
  return true;
}

export function saveGame(state) {
  try {
    const prev = localStorage.getItem(SAVE_KEY);
    if (prev) localStorage.setItem(SAVE_BAK_KEY, prev);
    const payload = JSON.stringify({ ...state, version: SAVE_VERSION, savedAt: Date.now() });
    localStorage.setItem(SAVE_KEY, payload);
    return true;
  } catch (e) {
    console.warn("save failed", e);
    return false;
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const s = migrate(parsed);
    if (!validateState(s)) return null;
    return s;
  } catch (e) {
    console.warn("load failed", e);
    try {
      const bak = localStorage.getItem(SAVE_BAK_KEY);
      if (!bak) return null;
      return migrate(JSON.parse(bak));
    } catch {
      return null;
    }
  }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}

export function exportJson(state) {
  return JSON.stringify({ ...state, version: SAVE_VERSION, exportedAt: Date.now() }, null, 2);
}

export function importJson(text) {
  const parsed = JSON.parse(text);
  const s = migrate(parsed);
  if (!validateState(s)) throw new Error("無效存檔");
  return s;
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return {
        apiKey: "",
        baseUrl: "https://api.deepseek.com",
        useProxy: false,
        proxyUrl: "http://127.0.0.1:8788/v1/chat/completions",
        model: "deepseek-flash",
        demoForce: false,
      };
    }
    return {
      apiKey: "",
      baseUrl: "https://api.deepseek.com",
      useProxy: false,
      proxyUrl: "http://127.0.0.1:8788/v1/chat/completions",
      model: "deepseek-flash",
      demoForce: false,
      ...JSON.parse(raw),
    };
  } catch {
    return {
      apiKey: "",
      baseUrl: "https://api.deepseek.com",
      useProxy: false,
      proxyUrl: "http://127.0.0.1:8788/v1/chat/completions",
      model: "deepseek-flash",
      demoForce: false,
    };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function applyStateDelta(state, delta) {
  if (!delta || typeof delta !== "object") return state;
  const next = { ...state, flags: { ...state.flags } };
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  if (delta.hp != null) next.hp = clamp(next.hp + Number(delta.hp), 0, 100);
  if (delta.energy != null) next.energy = clamp(next.energy + Number(delta.energy), 0, 100);
  if (delta.coin != null) next.coin = Math.max(0, next.coin + Number(delta.coin));
  if (delta.grain != null) next.grain = Math.max(0, next.grain + Number(delta.grain));
  if (delta.renown != null) next.renown = clamp(next.renown + Number(delta.renown), -50, 100);
  if (delta.courtThreat != null) next.courtThreat = clamp(next.courtThreat + Number(delta.courtThreat), 0, 100);
  if (delta.identityHint != null) next.identityHint = clamp(next.identityHint + Number(delta.identityHint), 0, 100);
  if (delta.day != null) next.day = Math.max(1, next.day + Number(delta.day));
  if (delta.hour != null) {
    let h = next.hour + Number(delta.hour);
    while (h >= 24) {
      h -= 24;
      next.day += 1;
    }
    while (h < 0) {
      h += 24;
      next.day = Math.max(1, next.day - 1);
    }
    next.hour = h;
  }
  if (typeof delta.location === "string") next.location = delta.location;
  if (typeof delta.locationId === "string") next.locationId = delta.locationId;
  if (typeof delta.sceneId === "string") next.sceneId = delta.sceneId;

  if (delta.flags && typeof delta.flags === "object") {
    for (const [k, v] of Object.entries(delta.flags)) next.flags[k] = v;
  }
  if (Array.isArray(delta.addInventory)) {
    next.inventory = [...next.inventory];
    for (const item of delta.addInventory) {
      if (item && !next.inventory.includes(item)) next.inventory.push(item);
    }
  }
  if (Array.isArray(delta.removeInventory)) {
    next.inventory = next.inventory.filter((i) => !delta.removeInventory.includes(i));
  }
  if (Array.isArray(delta.addMemories)) {
    next.memories = [...next.memories];
    for (const m of delta.addMemories) {
      if (!m || !m.id) continue;
      if (next.memories.some((x) => x.id === m.id)) continue;
      next.memories.push({
        id: m.id,
        title: m.title || "記憶碎片",
        text: m.text || "",
        day: next.day,
      });
    }
  }
  if (delta.ending) next.flags.ending = delta.ending;
  return next;
}
