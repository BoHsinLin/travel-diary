# 日韓旅遊規劃 PWA — Figma 工作交接點

原始記錄：2026-08-25 16:18:16 +08:00（Asia/Taipei）  
狀態更新：2026-08-26 17:02:57 +08:00（Asia/Taipei）  
狀態：此檔為 Phase 0 歷史交接點，已被 `FIGMA_PROGRESS.md` 與 `HANDOFF_FIGMA.md` 取代；不可再據此判定目前 Figma 尚未開始。

## 接續指令

在新的工作分支中，請先閱讀本檔與 `.figma-design-state.json`，接著從 **Phase 1：設計基礎與變數** 開始。不要重新進行需求訪談或重新選擇視覺方向，除非使用者主動要求變更。

## 已選定的視覺方向

採用「方案 2：旅程誌」。

- 溫暖象牙白底色、柿橘主要行動色、森林綠輔助色、深炭灰文字
- Noto Serif TC 用於旅程標題；Noto Sans TC 用於操作與資訊
- 兼具旅行雜誌的溫度，以及班機、時間、下一站與衝突警示所需的清晰度

選定概念圖：`C:\Users\diorl\.codex\generated_images\01a03770-f3d6-7563-8c6a-546954b2c659\exec-b1407e7f-3906-4f17-8bde-42c8354c81f5.png`

## Figma

- 檔名：日韓旅遊規劃 PWA
- File key：`7fFURmWK9uPeYiVTMnMsBQ`
- 連結：https://www.figma.com/design/7fFURmWK9uPeYiVTMnMsBQ
- 現況：只有空白 Page 1，尚未建立正式元件或畫面
- Material 3 與 Simple Design System 可用，但外觀應依「旅程誌」重新包裝
- Figma Starter 的變數模式限制需留意；淺色／深色可用兩組語意色彩集合實作

## Phase 1 預定範圍

1. 色彩 primitives 與 light/dark semantic tokens
2. 字體、間距、圓角與陰影樣式
3. Button、Icon Button、Segmented Control
4. Bottom Navigation、Avatar／Avatar Group
5. Pace Chip、Day Selector、Status／Notice
6. Itinerary Row、Fixed Anchor、Next Stop Panel

## 第一批核心畫面

1. 今日行程／時間軸
2. 今日行程／地圖
3. 快速調整行程
4. 旅程總覽
5. 地點詳情
6. 編輯行程
7. 旅伴與權限

示範情境：桃園往返仁川、首爾 5 天 4 夜、2 位成人、中等步調。

## 產品需求摘要

- 私人邀請制 PWA，旅伴即時看到修改
- 角色：擁有者、管理員、編輯者、檢視者
- 無限天數；5 段旅遊步調，可全旅程設定並逐日覆寫
- 固定錨點包含班機、住宿、預約；預設起飛前 3 小時抵達機場
- 航班變動時提示調整後續行程
- 行程可拖曳、暫存與處理衝突；首頁先顯示下一站，再切換時間軸／地圖
- 保存航班、住宿、保險、訂房與特定票券；不保存護照、信用卡或完整身分證件
- Google 登入與 Email magic link
- 即時協作、版本紀錄與復原；刪除保留 30 天，旅行版本保留至結束後 90 天
- 公開唯讀連結隱藏敏感預訂、保險、私人資訊與預算
- 地圖支援 Google、Naver、Kakao；韓國預設 Naver
- 預算支援預估／實際、KRW／JPY／TWD 與分帳
- 離線先做讀取，離線編輯與同步後續加入
- GitHub Pages 前端；Supabase Auth／Postgres／RLS／Realtime 後端
- 繁體中文，保留地點當地語名稱；WCAG 2.2 AA；淺色／深色

## 地區推進順序

1. 韓國：首爾（ICN／GMP）、釜山（PUS）、濟州（CJU）
2. 日本石垣島
3. 沖繩
4. 日本本島
5. 未來追蹤台南往返石垣島航班與船班

## 舊專案參考

- Repo：https://github.com/BoHsinLin/travel
- React／Vite／PWA，使用靜態 JSON，缺少編輯與同步
- 不沿用舊版配色與版面；只在需要時參考資料欄位

## 尚未執行

- 尚未向 Figma 寫入 variables、styles、components 或 screens
- 尚未建立新 GitHub repository
- 尚未開始 PWA 程式碼、Supabase schema 或部署

## 接續時的第一個確認點

直接建立 Phase 1 foundations；完成後提供 token、字體與元件預覽，再進入核心畫面。不需要重新詢問 Phase 0 是否核准。
