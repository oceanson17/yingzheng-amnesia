/**
 * 遊戲循環：狀態、行動、結局判定
 */
import {
  createInitialState,
  applyStateDelta,
  saveGame,
  loadGame,
  clearSave,
  exportJson,
  importJson,
} from "./save.js";
import { generateTurn, isApiConfigured } from "./ai.js";
import { getDemoScene } from "./demo.js";

let state = createInitialState();
let lastChoices = [];
let busy = false;
let listeners = [];

export function subscribe(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((x) => x !== fn);
  };
}

function emit(extra = {}) {
  const snap = getSnapshot();
  for (const fn of listeners) fn(snap, extra);
}

export function getSnapshot() {
  return {
    state: { ...state, flags: { ...state.flags }, memories: [...state.memories], inventory: [...state.inventory], log: [...state.log] },
    choices: lastChoices.map((c) => ({ ...c })),
    busy,
    apiReady: isApiConfigured(),
  };
}

export function getState() {
  return state;
}

function pushLog(narrative) {
  const summary = String(narrative || "").replace(/\s+/g, " ").slice(0, 180);
  state = {
    ...state,
    log: [...(state.log || []), summary].slice(-8),
  };
}

function checkHardEndings(s) {
  if (s.hp <= 0 && s.flags.ending !== "tragedy") {
    return {
      force: true,
      narrative:
        "氣力散盡。你倒在塵土裡，眼前浮起未完成的天下與未說出口的名字。\n\n【結局·悲劇】力竭而終。",
      choices: [{ id: "restart", text: "重新開始" }],
      stateDelta: { ending: "tragedy", flags: { ending: "tragedy" } },
    };
  }
  if (s.courtThreat >= 95 && s.identityHint >= 40 && !s.flags.ending) {
    return {
      force: false,
      hint: "朝廷追查已近在咫尺……",
    };
  }
  return null;
}

export async function startNewGame() {
  state = createInitialState();
  clearSave();
  lastChoices = [];
  busy = true;
  emit({ event: "boot" });

  // 開場固定示範／AI：先播 wake
  const opening = getDemoScene("wake");
  const delta = opening.stateDelta || {};
  state = applyStateDelta(state, delta);
  state = { ...state, sceneId: "wake", turn: 1 };
  pushLog(opening.narrative);
  lastChoices = opening.choices;
  saveGame(state);
  busy = false;
  emit({
    event: "narrative",
    narrative: opening.narrative,
    memoryHints: opening.memoryHints || [],
    ending: null,
  });
}

export async function continueGame() {
  const loaded = loadGame();
  if (!loaded) {
    await startNewGame();
    return false;
  }
  state = loaded;
  // 恢復時給通用選項，並用 log 最後一段作回顧
  lastChoices = [
    { id: "seek_truth", text: "繼續探尋真相" },
    { id: "to_village", text: "在附近村落活動" },
    { id: "quiet_path", text: "先求安穩度日" },
    { id: "look_around", text: "觀察四周（自訂／AI）" },
  ];
  if (state.flags?.ending) {
    lastChoices = [{ id: "restart", text: "重新開始" }];
  }
  busy = false;
  const narrative =
    (state.log && state.log[state.log.length - 1]) ||
    `你在${state.location}醒來。記憶仍如煙。日數：第${state.day}日。`;
  emit({ event: "narrative", narrative: `【讀檔】${narrative}`, memoryHints: [], ending: state.flags.ending });
  return true;
}

export async function choose(choiceId, choiceText) {
  if (busy) return;
  if (choiceId === "restart") {
    await startNewGame();
    return;
  }
  busy = true;
  emit({ event: "busy" });

  try {
    const useDemo = !isApiConfigured();
    // 示範模式：選項 id 直接對應場景
    const turn = await generateTurn({
      state,
      choiceId,
      choiceText,
      useDemo,
    });

    // look_around 等無 demo 場景時
    if (useDemo && choiceId === "look_around") {
      const t2 = await generateTurn({
        state,
        customText: "我仔細觀察四周環境與行人",
        useDemo: true,
      });
      await applyTurn(t2);
      return;
    }

    await applyTurn(turn, choiceId);
  } catch (e) {
    busy = false;
    emit({ event: "error", error: String(e.message || e) });
  }
}

export async function submitCustom(text) {
  if (busy) return;
  const t = (text || "").trim();
  if (!t) return;
  busy = true;
  emit({ event: "busy" });
  try {
    state = { ...state, customInputCount: (state.customInputCount || 0) + 1 };
    const turn = await generateTurn({
      state,
      customText: t,
      useDemo: !isApiConfigured(),
    });
    await applyTurn(turn);
  } catch (e) {
    busy = false;
    emit({ event: "error", error: String(e.message || e) });
  }
}

async function applyTurn(turn, fromChoiceId) {
  let delta = { ...(turn.stateDelta || {}) };
  if (turn._demoScene) delta.sceneId = turn._demoScene;
  else if (fromChoiceId && !delta.sceneId) delta.sceneId = fromChoiceId;

  if (turn.ending) {
    delta.ending = turn.ending;
    delta.flags = { ...(delta.flags || {}), ending: turn.ending };
  }

  // 時間自然流逝
  if (delta.hour == null && delta.day == null) delta.hour = 1;
  delta.energy = (delta.energy || 0) - 1;

  state = applyStateDelta(state, delta);
  state = { ...state, turn: (state.turn || 0) + 1 };

  // 記憶提示轉入碎片（若 AI 只給 hints）
  if (turn.memoryHints?.length && Math.random() < 0.35) {
    const h = turn.memoryHints[0];
    state = applyStateDelta(state, {
      addMemories: [
        {
          id: `hint_${state.turn}_${String(h).slice(0, 8)}`,
          title: "閃念",
          text: String(h),
        },
      ],
      identityHint: 1,
    });
  }

  pushLog(turn.narrative);

  const hard = checkHardEndings(state);
  let narrative = turn.narrative;
  let choices = turn.choices;
  if (hard?.force) {
    state = applyStateDelta(state, hard.stateDelta);
    narrative = hard.narrative;
    choices = hard.choices;
    pushLog(narrative);
  } else if (hard?.hint) {
    narrative += `\n\n（${hard.hint}）`;
  }

  lastChoices = choices;
  saveGame(state);
  busy = false;
  emit({
    event: "narrative",
    narrative,
    memoryHints: turn.memoryHints || [],
    ending: state.flags.ending || turn.ending || null,
    fallback: turn._fallback || false,
    errorNote: turn._error || null,
  });
}

export function doSave() {
  return saveGame(state);
}

export function doExport() {
  return exportJson(state);
}

export function doImport(text) {
  state = importJson(text);
  lastChoices = [{ id: "seek_truth", text: "繼續" }];
  saveGame(state);
  emit({ event: "narrative", narrative: "【匯入存檔成功】你回到當下這一刻。", memoryHints: [], ending: state.flags?.ending || null });
}
