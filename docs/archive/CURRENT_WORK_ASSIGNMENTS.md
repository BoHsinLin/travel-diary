# 日韓旅遊規劃 PWA｜目前工作指派

最後更新：2026-08-27 10:27:52 +08:00（Asia/Taipei）  
適用里程碑：M1 — 可登入的協作行程核心

## 執行原則

- 後端是目前關鍵路徑，立即開工。
- 前端繼續處理不依賴最終視覺決議的工程工作。
- Figma 只處理會阻塞前端的決議，不再無限擴畫面。
- 前後端先鎖 shared contract，再分頭實作。
- 新增功能前先初始化 Git，所有工作以可審查 commit／PR 交付。

## 整體專案負責人

1. 初始化 Git repository，補 `.gitignore`，排除 `node_modules/`、`.pnpm-store/`、`dist/` 與環境秘密。
2. 決定 repository 名稱、branch／PR 規則與 GitHub Pages 目標。
3. 主持前後端 contract review。
4. 將 M1 驗收拆成可追蹤 issue。

## Figma 負責人

### 現在執行（限定批次）

1. 回覆 `FIGMA_DECISION_REQUEST_60FPS_2026-08-27.md` 六項決議。
2. 定義 Button、Input、ItineraryRow、StatusNotice 的 loading／success／error／offline／dragging variants。
3. 交付正式 icon library／SVG mapping，優先處理 Bottom Navigation、返回、更多、拖曳、地圖與導航。
4. 補登入、旅程總覽與權限流程中會阻塞 M1 的必要狀態。
5. 提供 390×844、430×932、768×1024、1280×900 的響應式規則。

### 驗收輸出

- 更新 `FIGMA_PROGRESS.md` 與 `.figma-design-state.json`。
- 列出 node-specific URL、variant 名稱、motion tokens 與 reduced-motion 行為。
- 明確標記「已決議」與「Phase 2」。

## 前端負責人

### P0：立即執行

1. 修正「15:25 絧束」錯字。
2. 移除 `seoul`、`bukchon` 與固定 Day 2 的路由／資料硬編碼，改用 params 與 repository data。
3. 擴充 contracts 並與後端 migration 對齊；日期和時間不可只存顯示字串。
4. 加入 Vitest、Testing Library、axe；先測加入景點與衝突處理 vertical slice。
5. 加入 TanStack Query、React Hook Form、Zod 的基礎層。
6. 建立 Auth／protected route／旅程列表／旅程總覽骨架，可先使用 mock auth。
7. 產出四個 viewport 的最新截圖及 Figma 並排差異報告。

### P1：後端 contract 穩定後

1. 建立 Supabase adapter，替換 mock repository並保留 mock 供測試。
2. 串接 Auth、Trip、members、days、items、places。
3. 加入 optimistic update、失敗回滾與 Realtime query cache 更新。
4. 建立 PWA manifest、Service Worker、離線讀取與更新提示。
5. 加入 E2E、visual regression 及 GitHub Pages build。

## 後端負責人

### P0：立即執行

1. 建立 `supabase/`、config、第一批 migration、seed 與 `.env.example`。
2. 實作 profiles、trips、trip_members、trip_invitations、trip_days、places、itinerary_items。
3. 完成 Owner／Admin／Editor／Viewer 的 RLS matrix 與 SQL tests。
4. 建立首爾 5D4N seed 與四角色可重現測試資料。
5. 產生 database TypeScript types，交給前端校正 contracts。
6. 決定排序欄位、version／updated_at 並行控制及標準錯誤格式。
7. 開啟必要 Realtime publication，提供事件 payload 範例。

### P1

1. Google OAuth、Email Magic Link 與 redirect URL。
2. 邀請接受 RPC、角色調整與 audit log。
3. Realtime 多 session 與跨旅程隔離測試。
4. CI 中重建資料庫、執行 migration 與 RLS tests。

## 前後端共同交付

第一份共同交付必須包含：

- `Role`, `Trip`, `TripMember`, `TripDay`, `ItineraryItem`, `Place`, `Invitation`
- `SyncState`, `AppError`, `PageResult<T>`
- ISO 8601 時間與 IANA timezone 規則
- 排序、version、錯誤碼、分頁與 Realtime payload
- 前端 domain model ↔ database generated type mapping

## 暫緩項目

- 預訂文件、進階分帳、版本復原、公開分享完整流程。
- 航班自動追蹤、OCR、Email 匯入與推薦爬取。
- 未經 Figma 決議的複雜 shared-element／bottom-sheet 動效。

## M1 完成條件

- migration 可從空資料庫重建。
- 四角色 RLS 測試通過。
- 使用者可登入、建立／加入旅程及查看今天行程。
- Editor 可修改行程；Viewer 無法修改。
- 兩個 session 可看到即時更新。
- vertical slice 有自動測試且 CI 可重現。

