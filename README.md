# 失憶贏政·流落民間

為「豆豆」製作的單頁文字冒險：你扮演**失憶、剛登基旋即流落民間的贏政**。  
**示範模式無需 API Key**；有 DeepSeek API Key 則以 AI 為劇情內核動態生成敘事與選項。

## 線上遊玩（Safari／iPhone 可用）

GitHub Pages：

**https://oceanson17.github.io/yingzheng-amnesia/**

用 Safari 打開上述 HTTPS 連結，點「**新的流亡**」即可。  
API Key（可選）只存你裝置 Safari 的 `localStorage`，不會上傳到本 repo。

## 檔案

| 路徑 | 說明 |
|------|------|
| `index.html` | 入口（相對路徑，適合 Pages 子路徑） |
| `css/style.css` | 竹簡／秦制 UI；含 safe-area、≥44px 觸控 |
| `js/main.js` | 啟動 |
| `js/game.js` | 遊戲循環 |
| `js/ai.js` | DeepSeek 呼叫＋回退示範 |
| `js/demo.js` | 示範劇本 |
| `js/save.js` | 存檔 |
| `js/ui.js` | 畫面 |
| `server.js` | **可選本機用**：靜態＋CORS proxy（Pages 上不需要） |
| `.env.example` | 本機 proxy 用 Key 範本（勿 commit `.env`） |

## 本機示範模式

```bash
python3 -m http.server 8765
# 瀏覽器開 http://127.0.0.1:8765/
```

結局傾向：**重奪皇位**／**隱於民間**／**改革民間**／**悲劇**。

## DeepSeek API（可選）

1. 標題頁 → **設定 · API**
2. 貼上 DeepSeek API Key（只存 `localStorage`：`yingzheng-amnesia-settings`）
3. 模型建議：`deepseek-flash`
4. 優先直連 `https://api.deepseek.com/chat/completions`
5. 若瀏覽器 CORS 失敗：本機執行 `node server.js` 並勾選「使用本機 proxy」（Pages 純靜態無法代跑 proxy）

## 存檔

- `localStorage` 鍵：`yingzheng-amnesia-v1`
- 支援匯出／匯入 JSON

## 注意

- 勿把 API Key commit 進 git（已 ignore `.env`）
- Safari／iOS：已設 `viewport-fit=cover`、safe-area、觸控掣 ≥44px、輸入框 16px 避免自動放大
