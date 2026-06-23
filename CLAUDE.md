# persona-nexus-character

角色創建/編輯前端（微前端），屬於 Persona Nexus（AI 角色扮演/戀愛模擬平台）的一部分。Vite + Vanilla JS，無框架。Port 5174（已用 `vite.config.js` 固定 + `strictPort: true`）。

## 平台架構總覽

| 專案 | 路徑 | 角色 | Port |
|------|------|------|------|
| auth-service | `C:\Users\MSI3090\persona-nexus-platform\auth-service` | Auth 後端，註冊/登入，發 JWT | 3000 |
| persona-nexus-auth | `C:\Users\MSI3090\persona-nexus-platform\persona-nexus-auth` | 登入/註冊前端 | 5173 |
| character-service | `C:\Users\MSI3090\persona-nexus-platform\character-service` | 角色 CRUD 後端，Express+Prisma+SQLite | 5000 |
| api-gateway | `C:\Users\MSI3090\persona-nexus-platform\api-gateway` | 統一入口，驗證 JWT 後 proxy | 8000 |
| **persona-nexus-character**（本專案） | `C:\Users\MSI3090\persona-nexus-platform\persona-nexus-character` | 角色創建/編輯前端 | 5174 |
| persona-nexus-lobby | `C:\Users\MSI3090\persona-nexus-platform\persona-nexus-lobby` | 角色大廳，服務首頁 | 5175 |

流程：登入（5173）→ 大廳（5175，首頁）→ 點「創建角色」 → 跳到本專案的 `creator-create.html`；或編輯已有角色 → 跳到 `creator-edit.html?id=xxx` → 成功後自動跳回大廳。

## 檔案結構

```
index.html              首頁，連結到 creator-create.html（較少用，主要入口是大廳）
creator-create.html     創建角色表單
creator-edit.html       編輯角色表單，靠 ?id= query string 帶角色 ID
src/
  api.js                正式版 fetch 封裝，從 localStorage 讀 JWT 做 Bearer 認證；含 getCurrentUserId()
  api.dev.js            測試備份，hardcode x-user-id header（無需登入），未串接時切換用
  create.js             creator-create.html 的邏輯入口，已正式 import api.js（非 api.dev.js）
  edit.js               creator-edit.html 的邏輯入口，已正式 import api.js
  form.js               收集表單欄位、tags 字串轉陣列、清空表單
  fewShots.js           Few Shots 動態新增/刪除/載入（用 <template> 標籤）
  style.css             深色科幻風格，與 persona-nexus-web 視覺一致
  counter.js            Vite 初始化模板殘留檔，未被使用，可刪
```

## character-service API contract

直接打 character-service（`http://localhost:5000/api/v1`），**不經過 gateway**：

- `POST /characters` — 創建
- `GET /characters?authorId=` — 列出
- `GET /characters/:id` — 取得單一
- `PUT /characters/:id` — 更新
- `DELETE /characters/:id` — 刪除

Auth：`api.js` 會送 `Authorization: Bearer <token>`，但 character-service 目前只認 `x-user-id` header（由 gateway 注入），自己不驗 JWT，所以這個 Authorization header 實際上**被後端忽略**。本前端直打 5000 而非走 8000 gateway，意味著目前完全沒有經過 JWT 驗證這一關——只要知道 character-service 的網址，任何人都能在 request 裡塞任意 `x-user-id` 偽造身分。這跟系統「前端只打 gateway」的整體設計原則不一致，是目前最值得修的銜接缺口。

### Character 資料格式

必填：`name`、`introduction`、`background`、`opening`（字串）
選填：`gender`（字串或 null）、`tags`（陣列）、`visibility`（`"private"` | `"public"`，預設 private）
`fewShots` 格式：`[{ user: "...", char: "..." }]`

## 認證與守門機制

- `getCurrentUserId()`（`api.js`）：解碼 `localStorage` 裡的 JWT payload，取 `id`；沒有 token 或解碼失敗回 `null`。
- `create.js`（`creator-create.html`）/ `edit.js`（`creator-edit.html`）進頁面時都會先呼叫 `getCurrentUserId()`，未登入則導向 `http://localhost:5173/`。
- 創建/更新成功後，顯示訊息，`setTimeout` 1.5 秒後導回 `http://localhost:5175/`（大廳）。
- `edit.js` 的檢查順序：先查登入狀態，再查 URL 是否帶 `?id=`，最後才載入角色資料（順序不可顛倒，否則未登入者會看到錯誤的提示訊息）。
- **注意**：這整套登入守門目前讀的 token 來自 `localStorage`，但 `persona-nexus-web` 登入成功後並沒有把 token 寫進 `localStorage`（見該專案 CLAUDE.md）。也就是說，即使這裡的程式碼邏輯正確，使用者實際上永遠拿不到合法 token，登入後會被導回登入頁形成循環。

## 開發慣例

- 不用框架，檔案職責拆分清楚：`api.js`（網路）/ `form.js`（資料收集）/ `fewShots.js`（動態 UI）/ `create.js`（creator-create.html 入口）/`edit.js`（creator-edit.html 入口）。
- tags 在 UI 上是逗號分隔字串輸入，送出前才 split/trim/filter 成陣列。
- fewShots 用 `<template>` 標籤定義單組 UI 結構，JS 用 `cloneNode` 複製。
- CSS 變數風格沿用 persona-nexus-web 的深色配色（`#0d1117` 背景、`#58a6ff` 主色、`#238636` 成功色）。
- 測試模式：把 `create.js` 和 `edit.js` 裡 import `api.js` 的那行註解掉，改用 `api.dev.js`（hardcode 假 user id，不需登入也能測 API）。

## 現況補充

- 沒有測試、沒有 lint 設定檔
- 沒有 git（`.git` 不存在）
- `package.json` 的 `dependencies` 裡有 `cors`，但前端程式碼完全沒用到，是遺留依賴，可移除

## 已知待辦

- character-service 尚未驗證 JWT，仍只認 `x-user-id`，且本前端直打 5000 而非走 gateway（見上方「API contract」一節）。
- persona-nexus-web 沒有把登入後的 token 存進 localStorage（見上方「認證與守門機制」一節），目前會卡住整條登入到創建角色的路徑。
