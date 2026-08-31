# 日韓旅遊規劃 PWA｜前端開發交接

最後更新：2026-08-27 10:27:52 +08:00（Asia/Taipei）  
目前估算：**前端約完成 28%**

> 本文件保留完整目標規格；目前工作順序以 `CURRENT_WORK_ASSIGNMENTS.md` 與 `FRONTEND_IMPLEMENTATION_PROGRESS.md` 為準。

## 開工狀態

**GO：可以開始。**

第一個工程里程碑為「可用 mock data 跑完登入後的旅程總覽、今日行程、行程編排及景點加入流程」。在後端可用前，所有資料呼叫必須經 repository interface，不直接把 mock 寫進頁面元件。

開工前需與後端共同提交第一版 shared contract，至少包含 `Role`、`Trip`、`TripDay`、`ItineraryItem`、`Place`、`SyncState`、分頁格式與標準錯誤格式。

## 任務目標

建立可安裝、手機優先、支援即時協作與離線讀取的繁體中文 PWA。視覺以 Figma「旅程誌」為準，不沿用舊版 `BoHsinLin/travel` 的版面與配色。

## 建議技術基線

- React + TypeScript + Vite
- React Router
- TanStack Query 管理 server state
- React Hook Form + Zod
- Supabase JS client
- `dnd-kit` 處理行程拖放與鍵盤操作
- Workbox／Vite PWA plugin 處理 app shell 與離線快取
- Vitest + Testing Library；Playwright 執行核心 E2E

套件版本應在建立專案當下查官方文件，不在本文件鎖定過時版本。

## 第一階段：專案基礎

1. 初始化新 Git repository 與 Vite React TypeScript 專案。
2. 設定 `main`、`develop`、feature branch 與 PR checks。
3. 建立 `.env.example`，只放公開變數名稱，不提交 secret。
4. 建立 token 層並映射 Figma variables；禁止在元件散落硬編碼色彩。
5. 建立路由、App shell、error boundary、loading boundary、toast／dialog 基礎。
6. 設定 GitHub Pages 的 base path、SPA fallback 與 PWA manifest。

## 建議路由

- `/login`
- `/invite/:token`
- `/trips`
- `/trips/:tripId/overview`
- `/trips/:tripId/today`
- `/trips/:tripId/plan`
- `/trips/:tripId/places`
- `/trips/:tripId/bookings`
- `/trips/:tripId/budget`
- `/trips/:tripId/people`
- `/trips/:tripId/history`
- `/trips/:tripId/settings`
- `/share/:token`：公開唯讀頁，不依賴登入 session

## MVP 實作順序

### Slice 1：可用假資料完成 UI

- 登入／邀請
- 旅程列表與總覽
- 今日時間軸／地圖切換
- 行程編排、景點搜尋、加入與衝突處理
- 旅伴與權限
- 所有主要 loading／empty／error 狀態

資料存取必須透過 repository interface，先用 mock adapter，之後換 Supabase adapter，避免 UI 綁死後端。

### Slice 2：Supabase 串接

- Auth session 與 protected routes
- Trips、members、days、items、places CRUD
- 邀請加入與角色權限
- Realtime 訂閱與 query cache 更新
- optimistic update、失敗回滾與同步狀態

### Slice 3：擴展功能

- 預訂與文件
- 預算分帳
- 版本紀錄與復原
- 公開唯讀分享
- 航班異動重排 UI

### Slice 4：PWA 與品質

- app shell、最近旅程與行程的離線讀取
- 重新連線刷新與同步提示
- install prompt 與更新提示
- Light／Dark、WCAG AA、鍵盤與螢幕閱讀器檢查

## 前端領域型別（需與後端共同確認）

- `Trip`, `TripMember`, `TripDay`
- `ItineraryItem`, `AnchorType`, `ItemStatus`, `Conflict`
- `Place`, `PlaceSource`, `PlaceVerification`
- `Booking`, `BookingDocument`
- `Expense`, `ExpenseSplit`
- `Invitation`, `PublicShare`
- `ChangeSet`, `DeletedItem`
- `SyncState`, `UserPreferences`

所有時間以 ISO 8601 + IANA timezone 儲存；顯示時使用旅程 timezone。金額使用整數最小單位或 decimal，不使用浮點數直接計算。

## 與 Figma 對接

- 先讀 `HANDOFF_FIGMA.md` 與 `FIGMA_PROGRESS.md`
- 實作前取得目標 frame 的 design context，不只依賴截圖
- 先建立共用元件，再組頁面
- 每完成一個核心畫面，使用相同 viewport 與 Figma 截圖進行視覺比較
- Code Connect 等元件穩定後再加入，避免過早維護錯誤 mapping

## 與後端對接

後端需先提供：

- migration 與 TypeScript generated types
- Auth redirect URL、anon key 與環境區分
- RLS 權限矩陣與可重現測試帳號／seed
- Realtime channel／event contract
- 公開分享與文件 signed URL contract
- 錯誤碼、rate limit 與資料保留行為

前端需回饋：

- 每頁實際 query／mutation 清單
- optimistic update 與衝突處理需求
- 分頁、搜尋、排序與篩選參數
- 離線快取資料範圍及敏感資料排除清單

## 安全與隱私

- 不保存或快取護照、完整身分證、信用卡資料
- 公開分享頁不得載入隱藏資料後再只用 CSS 遮蔽
- Supabase service role key 絕不可出現在瀏覽器或 GitHub Actions 前端 build
- 文件用短效 signed URL；Service Worker 不快取私密文件與公開分享 token

## Definition of Done

- 手機核心流程可完成且刷新後資料仍存在
- 兩個瀏覽器 session 可即時看到行程修改
- 編輯權限、唯讀權限與公開分享均通過 E2E
- 離線時可讀取最近同步的旅程，重新連線後狀態正確
- Lighthouse PWA／Accessibility 達團隊設定門檻，沒有重大 axe 問題
- Build、unit test、E2E smoke test 與 GitHub Pages deploy 可在 CI 重現
