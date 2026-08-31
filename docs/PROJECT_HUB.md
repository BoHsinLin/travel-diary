# 日韓旅遊規劃 PWA｜Project Hub

最後更新：2026-08-31 13:01:23 +08:00（Asia/Taipei）  
目前里程碑：**M1 核心已接受；進入 PWA／GitHub CI／部署準備**

## 專案狀態

| 工作流 | 完成度 | 狀態 | 現在重點 |
|---|---:|---|---|
| 產品需求 | 90% | REVIEW | 鎖定 M1，延後非核心功能 |
| Figma／UX | 95% | M1 ACCEPTED／WAIT | M1 規格與資產已放行；等待前端實作差異回報 |
| 前端核心 | 90% | M1 ACCEPTED／WAIT | Application smoke 與資料完整性通過 |
| 後端 | 96% | ACCEPTED／WAIT | local recovery、持久化與 startup preflight 驗收通過 |
| 測試／PWA／部署 | 15% | ACTIVE | PWA、code splitting、Git／CI、GitHub Pages 準備 |

整體 MVP 管理估算：**約 82%**。

## 單人工序鎖（一次只啟動一位）

目前唯一 active assignee：**前端／PWA 工程師**。後端與 Figma 暫停修改，只能閱讀交接文件。

1. **後端工程師**：M1 final integration 已於 17:15:42 接受，現在 WAIT。
2. **Figma 設計師**：M1 規格已於 15:07:50 通過經理驗收，現在 WAIT。
3. **前端工程師（現在）**：執行後端契約變更後的應用整合回歸與錯誤映射。
4. **下一工序**：前端回歸通過後，再啟動測試／PWA／GitHub CI 與部署準備。

切換規則：前一位必須在對應協作文件寫下 `DONE`、`REVIEW` 或附證據的 `BLOCKED`，由經理確認後才能啟動下一位；不得自行平行施工。

## 已驗證成果

- Figma：55 variables、12 components、19 mobile screens，P0 景點加入 Prototype 已串接。
- 前端：React／TypeScript／Vite，可完成 typecheck 與 production build。
- 前端流程：今日時間軸、mock 地圖、行程編排、探索、加入、衝突、回寫。
- 前端資料層：repository interface、mock adapter、shared trip state。
- 後端：五支 migration、seed、46 項 SQL/RPC tests、正式 generated types、Data API grants 與遠端 RLS 已驗收；整合回合尚待。
- 基礎設施：尚無 Git repository、`.github/` 或 CI/CD。

## M1 範圍

### 必須完成

- Google／Magic Link 登入與 protected routes。
- Trip、members、days、itinerary items、places、invitations。
- Owner／Admin／Editor／Viewer RLS。
- 前端 Supabase adapter 與 Realtime。
- 兩個 session 的同步驗證。
- 核心 vertical slice 自動測試與 CI。

### M1 暫緩

- 預訂文件、進階分帳、版本復原、公開分享完整流程。
- 自動航班／船班追蹤、OCR、Email 匯入、推薦爬取。
- 複雜 shared-element 或 bottom-sheet 動效。

## 現在的任務

### 專案經理

- `TODO` 初始化 Git、`.gitignore`、branch／PR／CI 規則。
- `DOING` 主持前後端 shared contract review。
- `TODO` 將 M1 拆成 issue 與驗收清單。

### Figma

- `DONE` Today Timeline 已改為 Travel Category instances，並修正時間欄／badge／connector 對齊。
- `DONE` Icon v1：74 stable keys、四個 component sets、Category Badge 5 states。
- `DONE` P0 System States 8 畫面基線。
- `ACCEPTED／WAIT` `DES-2026-08-28-04` 已由經理核對 Figma 實際節點與截圖後放行。
- `DONE` system states 已掛接九個 M1 主畫面並附 node ID、條件、CTA、返回／焦點。
- `DONE` 六項 motion／interaction 決議已完成。
- `DONE` Button、Input、ItineraryRow、StatusNotice 必要狀態 variants 已完成。
- `DONE` 74-key 正式 icon library／SVG 與 Code Connect mapping 規格已交付。
- `DONE` 四個 viewport 響應式規則與 Today／Planner／Explore／Login 證據已交付。
- `DONE` M1 登入、總覽、權限及其他主流程狀態規格已補齊。

### 前端

- `DONE` 移除 Today 標題尾字，建立 category registry／Icon adapter，新增四條缺頁 routes。
- `M1 ACCEPTED／WAIT` RWD、icons、Auth、Itinerary 與 Trip／Day／Member／Place adapters 已通過經理驗收。
- `DONE` Lucide 正式 mapping、剩餘 glyph 清理、Auth、protected routes、Realtime client、version conflict 與 rollback。
- `DONE` Supabase Itinerary 與 Trip／Day／Member／Place repositories；正式環境走 Supabase、未配置才走 demo fallback。
- `DONE` TypeScript、5 test files／13 tests、production build；Budget 明確列為 M1 deferred。

#### RWD 驗收基線（已接受）

| viewport | 必要行為 |
|---|---|
| 390×844 | 單欄、Bottom Nav、safe-area、無水平溢位 |
| 430×932 | 單欄使用完整寬度、長標題可換行、鍵盤不遮 CTA |
| 768×1024 | 內容最大 680px；Planner／Explore 可雙欄，表單維持單欄 |
| 1280×900 | 88px sidebar；Today 約 720px 主欄＋320px 側欄；不能只把 390／560px 手機卡置中 |

- `DONE` Login、Today、Planner、Explore、Overview、People 四 viewport 證據與無水平溢位矩陣。
- `DONE` computed contrast、safe-area、reduced-motion 與等效 200% reflow 證據；原生瀏覽器 zoom 限制已誠實註記。

### 後端

- `DONE` Docker／local Supabase 已恢復；五支 migration、seed、46 項 SQL/RPC tests 與 generated types 已可執行。
- `DONE` event log 脫敏、owner integrity、current-day 約束及 expected-version RPC 基線。
- `DONE` expired invitation、46 項 SQL/RPC tests、空 search_path、Data API grants、lint 與 generated types 已通過。
- `DONE／WAIT` 51/51 authenticated REST／RLS／Realtime／RPC／invitation remote smoke 與 namespaced data／Auth users 清理完成。
- `DONE` 新增 owner cascade delete 與 PT409 conflict migrations；Advisors 與全套回歸通過。

## 關鍵風險

- 後端 M1 final integration 已驗收；唯一保留的後端管理風險是 Auth leaked-password-protection 尚未啟用。
- 前端 adapters 已接 generated database types；目前風險是新的 PT409／SORT_KEY error contract 尚未由應用層完整映射與呈現。
- 尚無 Git repository／CI；雖已有 13 個前端測試與 46 個 SQL tests，仍無自動化流水線防止回歸。
- Figma 決議不得阻塞 schema、Auth、測試與資料層。

## M1 驗收

- migration 可從空資料庫重建。
- 四角色 RLS 測試通過。
- 使用者可登入、建立／加入旅程、查看及編輯行程。
- Viewer 無法修改；Editor 可以修改。
- 兩個 session 可看到即時更新。
- unit／integration／E2E smoke test 可由 CI 重現。

## 更新紀錄

### 2026-08-31 13:01:23 +08:00｜專案經理｜FRONTEND M1 ACCEPTED／PWA-CI ACTIVE

- 接受資料完整性修正：`startsAt` 由 TripDay date／wall-clock／IANA timezone 產生；append sort key 不再固定，連續新增不碰撞。
- 經理獨立 DB 查核：前一輪 `2026-09-22` 錯誤 row 已清除；Day 2 四筆皆為 `2026-10-10`，四個 sort key 全部唯一。
- 經理獨立回歸：typecheck、Vitest 8 files／28 tests、production build（2028 modules）全通過；Owner／Realtime／Viewer／route 的結構化 artifacts 齊全。
- 前端 M1 application smoke 正式接受。後端與 Figma WAIT；下一個唯一工序仍由前端／PWA 工程師執行 PWA、route-level code splitting、Git 基線、GitHub Actions 與 GitHub Pages 部署準備。
- 效能門檻：目前單一 JS chunk 635.87 kB／gzip 188.48 kB，PWA 批次需做 route-level lazy loading 並提出新 bundle report。

### 2026-08-31 12:03:04 +08:00｜專案經理｜FRONTEND SMOKE REJECTED／DATA INTEGRITY

- 接受部分：`crypto.randomUUID()` 修正 UUID 寫入；typecheck、Vitest 7 files／25 tests、production build 通過；local DB 可讀到本次新增 row。
- P0 缺陷：Day 2 實際日期為 `2026-10-10`，新 row 卻因 `PlaceFlowPages.tsx` 硬編碼而寫成 `2026-09-22T14:15:00+09:00`。UI／refresh／Realtime 成功不能掩蓋錯誤日期。
- P0 缺陷：新增流程固定使用 `sortKey='z0'`；`itinerary_items` 有 `(trip_day_id, sort_key)` unique constraint，同日第二次新增會撞 `23505`。
- 證據缺口：新交付只有文字表格，沒有 8 月 31 日的瀏覽器截圖、Realtime event／操作紀錄或 console artifact，不符合先前完成定義。
- 工序：前端繼續唯一 active；後端與 Figma WAIT。修正動態 day date、可插入 sort key、測試與可稽核瀏覽器證據後再 REVIEW。

### 2026-08-31 11:43:24 +08:00｜專案經理｜LOCAL RECOVERY ACCEPTED／FRONTEND RESUMED

- 接受 `scripts/start-local.ps1` 與啟動文件：預設／Status 無 reset，Initialize 與 Reset 明確分離，Reset 有二次確認，錯誤狀態有專屬 exit code。
- 經理獨立執行 `-Status` exit 0：55431／55432／55433／55434／55436 正常，55435 為 shadow reserved；主要 containers healthy，Auth／API／Studio／Mail HTTP 200，DB accepting connections。
- 經理獨立回歸：Auth seed 8/8、typecheck、Vitest 7 files／25 tests、production build（2027 modules）通過。
- 接受後端持久化證據：stop 後預設啟動沿用既有 volume，seed trip count=1；pgTAP 46/46、lint 零錯誤、types hash 無漂移。
- `vector` restarting 為目前 Storage-disabled 的非必要 warning，不阻塞 API／Auth／DB／Realtime；後端轉 WAIT，前端恢復為唯一 active。

### 2026-08-31 10:56:05 +08:00｜專案經理｜LOCAL VOLUME ABSENT／BACKEND RECOVERY ACTIVE

- 重開機後唯讀查核：Docker Engine／Server 正常，但 `docker ps -a` 無任何容器、`docker volume ls` 無任何 volume；`55431–55436` 也無 listener。
- `supabase/config.toml` 已一致改為 API 55431、DB 55432、Analytics 55433、Studio 55434、Shadow 55435、Inbucket 55436；`.env.local` URL 已同步為 55431。
- 判定：不是前端程式問題，也不是可重新啟動既有 DB；舊 local volume 已不存在。因沒有現存 local 資料可再覆寫，允許重新建立 local Supabase 並套用 migrations／seed。
- 工序：前端改為環境阻塞 WAIT；後端成為唯一 active，負責 start/reset、Auth seed 8/8、46 項 DB tests 與 5543x port health。驗收後再切回前端。

### 2026-08-31 10:58:20 +08:00｜專案經理｜LOCAL STARTUP PREFLIGHT ADDED

- 正常重開機不應重建資料庫；named volume 應保留，日常只需啟動 Docker Desktop 與 local Supabase。
- 本次 reset 是因 volume 已被清除的異常恢復，不可建立成每次開機的預設流程。
- 後端目前任務追加 `scripts/start-local.ps1` 與啟動說明：預設只檢查／啟動，禁止自動 reset；首次建立與 reset 必須使用不同的明確參數並顯示風險。

### 2026-08-31 09:53:49 +08:00｜專案經理｜BACKEND ACCEPTED／FRONTEND RESUMED

- 接受後端 local Auth seed 修正：四角色 user／identity fixture 可由 reset 重播，不依賴 Dashboard，且未修改遠端 Auth。
- 經理獨立重驗 Auth smoke 8/8：Admin API 四人、Owner／Viewer password grant HTTP 200、user ID 與 JWT `sub` 均符合固定 UUID。
- 回歸：typecheck、Vitest 7 files／25 tests、production build（2027 modules）及 generated types SHA-256 全部通過；hash 維持 `C230BCA29485BABF48B3ABE5679D768D77E30E4505F57CAB08DE5AC44DADD49B`。
- 工序切換：後端 `ACCEPTED／WAIT`；前端重新成為唯一 active，只完成 Owner persistence、Viewer read-only、雙頁籤 Realtime、登出／protected route 與 console 證據後回報 REVIEW。
- 非阻塞後續：production JS chunk 約 635 kB，超過 500 kB 警告；排入 PWA／效能批次做 route-level code splitting。

### 2026-08-31 09:18:35 +08:00｜專案經理｜LOCAL AUTH SEED DEFECT／BACKEND ACTIVE

- 前端已成功執行 local reset、套用 migrations／seed、更新 local env 並重啟 Vite。
- Owner／Viewer password grant 均為 `400 invalid_credentials`，service-role Auth Admin users 為 `200 []`；reset 成功但 GoTrue 沒有可登入的 seed users。
- `supabase/seed.sql` 只有簡化的 `auth.users` rows，未交付可登入的完整 user／identity fixture；此為後端 seed contract 缺陷。
- 前端改為 `BLOCKED／WAIT`；後端成為唯一 active。修正並重驗後，再切回前端 application smoke。

### 2026-08-31 08:54:28 +08:00｜專案經理｜PROGRESS_RECHECK／FRONTEND_CONTINUES

- 8 月 28 日退回後未發現新的前端程式、測試或 smoke 證據；8 月 31 日只有 Vite preview listener 紀錄，不構成正式 Supabase 應用層驗收。
- 經理重新驗證現有基線：TypeScript、Vitest 6 files／19 tests、production build（2026 modules）均通過，沒有發現既有功能退化。
- 缺口維持不變：尚無 TripDataContext optimistic rollback／retry tests，也尚無 Owner／Viewer、刷新持久化及雙頁籤 Realtime 的應用層 smoke 證據。
- 工序決議：前端工程師繼續是唯一 active assignee；後端、Figma 維持 WAIT。前端提交兩項補件並經驗收前，不切換 PWA／CI／部署。

### 2026-08-28 17:27:48 +08:00｜專案經理｜FRONTEND_PARTIAL_ACCEPT／CHANGES_REQUESTED

- 接受：集中式 `mapSupabaseError`、PT409／23505／42501／Auth／Not Found mapping、兩個 Supabase repositories 共用 mapper、Planner conflict／offline／permission 呈現。
- 獨立驗證：TypeScript、Vitest 6 files／19 tests、production build（2026 modules）全部通過。
- 尚未完成 1：本批完成定義要求 TripDataContext optimistic rollback／retry tests；目前沒有 TripDataContext test，只有 mapper 與 repository tests。
- 尚未完成 2：交付文件明確記錄 application-level Supabase smoke 未執行；「沒有 `.env`／Vite listener」不是設計阻塞，可使用 local Supabase seed Owner／Viewer 與臨時 `.env.local` 完成，不需建立遠端永久帳號。
- 工序決議：前端繼續唯一 active；後端與 Figma WAIT。上述兩項通過前不啟動 PWA／CI／部署。

### 2026-08-28 17:15:42 +08:00｜專案經理｜BACKEND_ACCEPTED／FRONTEND_REGRESSION_ASSIGNED

- 後端 final integration 接受：可重現 runner 51/51；Owner／Editor／Viewer／non-member REST、雙 session Realtime、邀請脫敏、三支 version RPC、衝突與 RLS 分支均有結果。
- 修正與回歸：新增 owner cascade delete 與 `PT409` migrations；pgTAP 46/46、前端 5 files／13 tests、build、types hash 均通過；Security 僅 leaked-password-protection 管理 WARN，Performance 無 errors／warnings。
- 清理：文件記錄四個 Auth smoke users 與 namespaced trip data 已清為 0；後端停止並 WAIT。
- 本輪獨立可重驗範圍：前端 13 tests、typecheck、build 與 types hash 通過；本機 Supabase CLI 因工作區外 realpath 權限無法在本輪重跑，遠端使用者已清除，因此不重建 smoke 帳號冒充重跑。
- 現在只啟動前端工程師：對齊 PostgREST error code／hint、跑真實 UI integration regression；通過後才進入 PWA／CI。

### 2026-08-28 16:27:40 +08:00｜專案經理｜MOBILE ICON-ONLY CTA ACCEPTED

- 依使用者提供的 390px 畫面調整 Today 第一站導航 CTA：小於 760px 攁為 44×44 icon-only，避免文字按鈕佔滿行程內容欄；760px 以上保留 icon＋文字。
- 無障礙：按鈕保留 `aria-label="開始導航至{景點}"` 與 title；文字採 visually-hidden，不以移除文字犧牲讀屏語意。
- 實測：390×844 按鈕為 44×44、頁面 `scrollWidth === clientWidth === 390`；TypeScript、5 files／13 tests、production build 全通過。
- 工序：此為前端微修並已完成；前端恢復 WAIT，後端 final integration 繼續為唯一 active 工作流。

### 2026-08-28 16:21:03 +08:00｜專案經理｜FRONTEND_ACCEPTED／BACKEND_ASSIGNED

- 前端最後資料 adapter 通過：`SupabaseTripRepository`、repository provider、Trip／Day／Member／Place mapping 與 Supabase／demo selection 均存在；`queries.ts` 不再直接依賴 MockTripRepository。
- 獨立驗證：TypeScript、Vitest 5 files／13 tests、production build（2025 modules）全數通過；Budget mock 為 M1 明確暫緩，不阻塞放行。
- 工序切換：前端改為 WAIT；現在唯一啟動後端工程師進行 M1 final integration。Figma 維持 WAIT。
- 後端完成前不得要求前端平行修正；若整合發現 contract 問題，先在 `FRONTEND_BACKEND.md` 留可重現證據並停止於 REVIEW。

### 2026-08-28 16:13:13 +08:00｜專案經理｜RWD_ACCEPTED／FRONTEND_DATA_ADAPTER_ASSIGNED

- RWD 接受：已檢視 390／430／768／1280 證據；共用 `TripLayout`、88px sidebar、Today 720＋320、Planner／Explore 雙欄、People 桌面雙欄與無水平溢位均存在。
- 獨立驗證：TypeScript、Vitest 3 files／7 tests、production build（2023 modules）全部通過；Today 導航按鈕修正也有 390px 截圖與零 console error 證據。
- 尚未接受整體前端 DONE：`src/features/trips/queries.ts` 仍直接 import mock Trip／Budget repository；正式登入時 Trip、Day、Member、Place 仍會讀 demo data。
- 現在唯一指派仍是前端，但只剩資料 adapter 最後一批；完成後才切換後端最終整合。

### 2026-08-28 15:31:39 +08:00｜專案經理｜FRONTEND_CHANGES_REQUESTED

- 接受程式基線：typecheck、3 test files／7 tests、production build 本輪獨立重跑通過；Lucide icon、Auth client、Itinerary Supabase repository、expected-version／rollback／跨日移動程式已存在。
- 不接受為完成：沒有新的四 viewport／200%／screen-reader／computed contrast 證據；RWD 必須納入本輪。
- 瀏覽器實測：390／430 無水平溢位；但 768／1280 的 Planner／Explore 固定為 560px 置中，People 固定 390px 置中，1280 缺 88px sidebar，也未形成主欄＋側欄。這是實作缺口，不只是缺截圖。
- 資料缺口：`queries.ts` 的 Trip、days、members、places 與 budget 仍直接使用 mock repository；目前只有 itinerary mutation 接 Supabase。
- 工序決議：前端繼續作為唯一 active assignee；後端、Figma 維持 WAIT。完成 RWD、資料 adapter 與瀏覽器證據後再 REVIEW，尚不切換後端。

### 2026-08-28 15:07:50 +08:00｜專案經理｜FIGMA_ACCEPTED／FRONTEND_ASSIGNED

- 實際核對 Figma `M1 Spec & QA` page `103:53`：九個狀態掛接、四 viewport 規則、六項互動、Light／Dark／44px 與 74-key asset mapping 均存在；Figma M1 責任接受，轉為 WAIT。
- 限制：Figma 規格板不是瀏覽器驗收；computed contrast、鍵盤／讀屏、200% reflow、safe-area、reduced-motion 與 Code Connect 實際 mapping 由前端負責。
- 現在只啟動前端：正式 icon 導入與剩餘 glyph 清除 → Auth／Supabase adapter → Realtime／expected-version／rollback → 四 viewport 與無障礙證據。後端與 Figma不得平行修改。
- 資料工程：M1 不新增獨立職位；M2 外部資料整合先指定兼任 owner，達到三個以上來源、固定排程／回補、推薦新鮮度或分析負載門檻時再啟動資料工程師。

### 2026-08-28 15:03:38 +08:00｜FIGMA｜REVIEW

- `DES-2026-08-28-04` 已提交 REVIEW；Figma 停止修改，未啟動前端或後端。
- 新增 `M1 Spec & QA` page `103:53`，包含九個主畫面狀態掛接 `104:2`、四 viewport 規則 `105:20`、六項 motion 決議 `105:73`、Accessibility／Asset Handoff `107:20`。
- 元件交付：Button `16:36`、Input `102:34`、ItineraryRow `25:16`、StatusNotice `21:23`；正式 icon sets 為 `91:62`、`99:74`、`100:62`、`101:32`，Badge State `94:23`。
- Figma 已驗證 token、Light／Dark、focus、44×44 與非顏色單一提示；computed contrast、200% reflow、鍵盤／讀屏、safe-area、reduced-motion 與 Code Connect 實際紀錄留待前端實測／導入。
- 完整證據與未決事項見 `docs/coordination/FRONTEND_FIGMA.md`。

### 2026-08-28 14:52:27 +08:00｜專案經理｜CORE_ACCEPTED／FIGMA_ASSIGNED

- 後端核心放行：本機 46／46 SQL tests、零 lint、TypeScript／5 tests／build、types hash 全部獨立通過；遠端五支 migration、七表 RLS 與 function exposure 已唯讀確認。
- 保留到最後後端整合：authenticated REST smoke、兩個臨時 Auth users 清理、leaked-password-protection WARN 與雙 session Realtime。
- 工序切換：後端改為 WAIT；現在只啟動 Figma 設計師，任務詳見 `DES-2026-08-28-04`；前端仍 WAIT。

### 2026-08-28 13:11:16 +08:00｜專案經理｜CHANGES REQUESTED

- 後端已實際建置，不再是 Docker 阻塞或只有草案；local DB 與 18 項 SQL tests 可執行。
- 經理獨立重跑發現 `db lint` 未通過：expired invitation 分支存在 `42702 ambiguous status`，且該分支未被現有 tests 覆蓋。
- 依 2026 Supabase Data API 變更，要求補 explicit grants 與 publishable-key REST smoke test；依官方 function security 建議，要求 security-definer 使用空 search_path。
- 工序鎖不變：後端繼續唯一 active；修正並重驗前，不解鎖 Figma。

### 2026-08-28 09:40:39 +08:00｜專案經理｜ASSIGNED

- 已閱讀 Figma、前端、後端最新文件與實作；typecheck、3 test files／5 tests、production build 於本輪重跑通過。
- 接受：Figma icon／system-state 基線、Today 對齊修正、前端 category registry、Today／Bottom Nav 導入與四條新 routes。
- 不接受為完成：前端 `Icon.tsx` 仍使用手工 inline SVG；People／TripOverview／Planner 尚有字符 icon；新增流程仍是 mock／setTimeout；後端 RLS 測試只確認 policy 存在，尚未驗證角色行為。
- 新安全發現：`trip_events` 目前會記錄 invitation 完整 row，可能把 email／token_hash 暴露給所有旅程成員；admin membership policy 也未限制 owner 角色變更。
- 工序決議：現在只啟動後端工程師；Figma、前端等待。詳細後端工作見 `docs/coordination/FRONTEND_BACKEND.md`。

### 2026-08-28 09:36:30 +08:00｜Icon Contract｜REVIEW

- 完成 74-key 旅遊 icon v1：Figma Category `91:62`、UI Action `99:74`、Trip Utility `100:62`、Status & Service `101:32`。
- 前端新增 `src/contracts/icons.ts` registry、唯一性／fallback tests；後端新增 category constraint migration。
- 規則文件：`docs/design/ICON_CONTRACT.md`；驗證為 typecheck、3 files／5 tests、production build 通過。

### 2026-08-27 17:09:09 +08:00｜Figma｜REVIEW

- 新增 Travel Category 20 variants（`91:62`）與 Category Badge 5 states（`94:23`）。
- 新增 P0 System States 8 畫面（`93:44`）：loading／empty／error／permission／offline／session expired／saving／success。
- Today `28:3` 已以 component instances 取代「宮／湯／屋」，淡色連接線與導航 icon 保留。
- 新增內容已完成 metadata／screenshot 驗證；下一批為逐頁狀態掛接、responsive、motion、Dark／WCAG 驗收。

### 2026-08-27 16:39:16 +08:00｜前端｜REVIEW

- 已完成穩定 `ItineraryCategory` contract、集中式 SVG Icon adapter、Today 與 Bottom Navigation glyph 替換。
- 已新增 Place Details、Edit Itinerary、Quick Adjust、Flight Change Reschedule protected routes，Explore 附近／熱門搜尋與主要 loading／empty／error，衝突流程 saving／failure。
- 驗證：typecheck、2 files／3 tests、production build 皆通過。
- 待驗收：舊頁剩餘 4 處 glyph、Planner 跨日／刪除／rollback、四 viewport／axe／鍵盤／200% zoom 證據；詳見 `docs/coordination/FRONTEND_MANAGER.md`。

### 2026-08-27 16:28:31 +08:00｜專案經理｜CHANGES REQUESTED

- Figma：Today Timeline 的「宮／湯／屋」確認為暫代文字，須改成統一向量 icon component；同批補完整缺頁與 loading／empty／error／permission／offline 等狀態。
- 前端：現行 `title.slice(-1)` 與 Bottom Nav 字符 icon 不可沿用；等待 Figma asset mapping 時仍可繼續 Auth、contracts 與資料層。
- 前後端：新增穩定 `ItineraryCategory` code contract，避免依中文標題或顯示文案決定 icon。
- 驗收與任務細節：`docs/coordination/FRONTEND_FIGMA.md`；資料欄位決議：`docs/coordination/FRONTEND_BACKEND.md`。

### 2026-08-27 12:11:29 +08:00｜後端｜BLOCKED

- 交付物：後端 Supabase migration/seed/RLS/types 交付物維持可驗收狀態。
- 驗證證據：Docker Desktop 開啟後已重試 `pnpm dlx supabase db reset --local`；Docker `desktop-linux` 與 `default` context 皆回 daemon API 500。
- 阻塞：Docker daemon 未健康回應，`docker version` 無 Server 區塊，Supabase local reset 無法進入 migration 階段。
- 需要誰回覆：環境負責人確認 Docker Desktop Engine running 後通知後端重跑。
- 下一檢查點：`docker version` 顯示 Server 資訊後，執行 `pnpm dlx supabase db reset --local` 與 DB tests。

### 2026-08-27 11:48:26 +08:00｜後端｜BLOCKED

- 交付物：已開始 Supabase CLI 驗收；CLI 版本 `2.115.0` 可執行。
- 驗證證據：`pnpm typecheck` 通過；`pnpm test` 通過，2 files／3 tests；`pnpm build` 通過。
- 阻塞：`pnpm dlx supabase db reset --local` 因 Docker API `dockerDesktopLinuxEngine` 不存在而失敗，需啟動或安裝 Docker Desktop。
- 需要誰回覆：經理或環境負責人確認 Docker Desktop 可用後，後端可立即重跑 migration reset 與 SQL tests。
- 下一檢查點：完成 `supabase db reset --local`、DB tests、正式 generated types。

### 2026-08-27 11:45:21 +08:00｜後端｜REVIEW

- 交付物：新增 Supabase M1 第一批交付，位置為 `supabase/`、`.env.example`、`docs/backend/SUPABASE_DELIVERY.md`。
- 驗證證據：使用 bundled Node/pnpm 執行 `pnpm typecheck` 通過。
- 阻塞：目前本機 PATH 無 `supabase` CLI，尚未執行 `supabase db reset` 與 `supabase test db`。
- 需要誰回覆：經理驗收此批是否進入 Supabase CLI reset；前端確認 adapter mapping 欄位是否足夠。
- 下一檢查點：補正式 CLI generated types、RPC accept invitation/version conflict、RLS SQL tests 實跑結果。

### 2026-08-27 10:33:13 +08:00｜專案經理｜DONE

- 整合分散進度文件。
- 建立 Project Hub 與三條協作通道。
- 將舊文件歸檔並指定此文件為唯一進度基準。
