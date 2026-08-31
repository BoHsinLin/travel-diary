# 前端 ↔ 專案經理｜協作通道

最後更新：2026-08-31 13:01:23 +08:00（Asia/Taipei）

### 2026-08-28 16:11:03 +08:00｜前端｜DONE
- 本批目標：修正 Today 行程列「開始導航」圖示與文字跑版，並防止再次發生。
- 已完成：將按鈕改為明確 `inline-flex` 行列，固定 icon 16px、文字不換行、置中 gap、內容最小寬度與 overflow 防護。
- 驗證證據：390×844 browser capture、同圖對照、DOM layout 量測及 console error=0；TypeScript、Vitest 3 files／7 tests、production build 已通過。
- 未完成：無。
- 阻塞：無。
- 風險與技術債：無本項風險。
- 下一批：等待經理下一項指派。
- 是否需要經理決策：否。

### 2026-08-28 15:41:54 +08:00｜前端｜RWD DONE／REVIEW
- 本批目標：完成經理 15:31:39 退回的六路由全站 RWD 與瀏覽器矩陣。
- 已完成：共用 Trip Layout、1280 的 88px sidebar／1120px workspace；Today 720＋320；Planner／Explore 平板與桌面雙欄；People／Overview／Login 解除 390px 固定寬；430 全寬、長文字、safe-area、窄版與 reduced-motion。
- 驗證證據：六路由 × 四 viewport 全數 `scrollWidth <= clientWidth`；26 張證據位於 `docs/evidence/rwd-2026-08-28/`；computed contrast 6.31:1；TypeScript、3 files／7 tests、production build（2023 modules）通過。
- 未完成：本批 RWD 程式無；原生 200% browser zoom 因 in-app browser shortcut 不改變 zoom，採 640 CSS px 等效 reflow 並明確註記。
- 阻塞：無 RWD 阻塞。
- 風險與技術債：完整資料 adapter 仍屬經理同輪另一項 P0，不納入此次使用者明確指定的 RWD 範圍。
- 下一批：等待經理驗收 RWD；不自行啟動後端。
- 是否需要經理決策：請驗收 RWD，並決定是否接續 Trip／Day／Member／Place adapter P0。

### 2026-08-28 15:25:04 +08:00｜前端｜REVIEW／BROWSER_EVIDENCE_BLOCKED
- 本批目標：完成經理 15:07:50 的正式 icon、Auth／Supabase、Realtime／version conflict／rollback 與 Planner P0。
- 已完成：74-key Lucide package mapping；清除剩餘字符 icon 與 inline SVG；typed Supabase Auth client；generated types itinerary adapter；Realtime；expected-version；optimistic rollback；跨日 drop zone；刪除確認；Viewer 禁寫；Edit／Flight 真實 repository persistence；offline／saving／failure／conflict；safe-area 與 reduced-motion。
- 驗證證據：TypeScript passed；Vitest 3 files／7 tests passed；production build passed（2021 modules）；完整清單見 `docs/reference/FRONTEND_M1_DELIVERY_2026-08-28.md`。
- 未完成：本輪新的四 viewport、axe、完整鍵盤、焦點返回、200% reflow、screen-reader 與 computed contrast 瀏覽器證據。
- 阻塞：in-app browser 建立／導覽本機驗收頁籤連續逾時；依 Browser 規則未改用未授權的外部 Playwright。
- 風險與技術債：Supabase 真實 Auth／RLS／Realtime 仍需後端整合回合以兩個 authenticated sessions 驗證；Hero 動態拆層仍需 Figma 決議。
- 下一批：瀏覽器控制恢復後補齊全部瀏覽器證據，再由經理決定是否啟動後端整合回合。
- 是否需要經理決策：請將本批程式交付先進行 REVIEW；瀏覽器證據補齊前不標記最終 DONE，也不自行啟動後端。

### 2026-08-27 16:58:24 +08:00｜前端｜DONE
- 本批目標：依 Figma 查核結果補齊「今日行程」Hero 底部不規則波浪版面。
- 已完成：改用 Figma node `28:3` 提供的正式合成圖資，保留原始照片、旅伴、標題、天氣與精確波浪遮罩；補上可鍵盤聚焦的筆記按鈕熱區與描述性替代文字。
- 驗證證據：`tsc -b`、Vitest 3 tests、Vite production build 全數通過；390／430／768／1280 viewport 無水平溢出；視覺證據位於 `docs/evidence/today-wave-2026-08-27/`。
- 未完成：本批無。
- 阻塞：無。
- 風險與技術債：Hero 文字屬 Figma 正式合成圖的一部分，若未來需依旅程資料動態變更，須由 Figma 與前端共同拆分可程式化圖層後再調整。
- 下一批：接續依排程處理其餘頁面與狀態。
- 是否需要經理決策：否。

## 此文件處理什麼

- 前端進度、風險、阻塞、驗收證據
- 範圍變更、優先級與是否接受交付
- 需要經理協調後端或 Figma 的事項

技術 contract 詳情寫到 `FRONTEND_BACKEND.md`；設計詳情寫到 `FRONTEND_FIGMA.md`，此處只放摘要與決策。

## 前端固定回報格式

```md
### YYYY-MM-DD HH:mm:ss +08:00｜前端｜TODO/DOING/BLOCKED/REVIEW/DONE
- 本批目標：
- 已完成：
- 驗證證據：build／test／route／截圖／commit
- 未完成：
- 阻塞：需要後端／Figma／經理做什麼
- 風險與技術債：
- 下一批：
- 是否需要經理決策：
```

## 經理回覆格式

```md
### YYYY-MM-DD HH:mm:ss +08:00｜經理｜ACCEPTED/CHANGES_REQUESTED/BLOCKED
- 驗收結論：
- 接受項目：
- 退回項目：
- 優先級：
- 下一檢查點：
- 跨端指派位置：
```

## 當前前端狀態

- 完成度：M1 前端核心約 90%，狀態為 `M1 ACCEPTED／PWA-CI ACTIVE`。
- 2026-08-31 重驗：typecheck、6 files／19 tests、production build（2026 modules）通過。
- 已完成：M1 UI／RWD、Auth 與 protected routes、Supabase repositories、Realtime client、typed error mapping、Planner optimistic update／rollback 實作。
- 已交付待重驗：TripDataContext rollback／retry tests（前端回報 7 files／25 tests）。
- 未完成：Owner／Viewer application-level Supabase smoke、PWA、CI 與部署。
- 施工限制：前端是目前唯一 active assignee；後端與 Figma 維持 WAIT。

## 經理目前指令

1. 不擴充預算、文件等 Phase 2 功能。
2. 先修技術債、測試與 contracts。
3. 建立 Auth／總覽骨架並等待後端 generated types。
4. 依 Figma 交付補 icons／states，不自行發明設計。
5. 每批必須附 build、test、四 viewport 截圖與變更清單。

## 更新紀錄

### 2026-08-31 13:01:23 +08:00｜經理｜M1 ACCEPTED／PWA-CI ASSIGNED

- 驗收結論：接受 12:59:08 DATA INTEGRITY P0 與 final application smoke。
- 獨立證據：local DB 錯誤日期 row=0、Day 2 四筆日期正確、四個 sort key 唯一；typecheck、8 files／28 tests、build 通過。
- P0-1：導入 PWA manifest、service worker、install/update/offline shell；不得快取 Supabase Auth token、敏感 API response 或 booking/document 資料。
- P0-2：將 routes 改為 lazy loading／合理 chunks，消除目前單一 635.87 kB JS chunk 警告或附可接受的明確預算與理由；提交 bundle report。
- P0-3：初始化 Git 基線與 `.gitignore`，必須排除 `.env*`（保留 `.env.example`）、`node_modules`、`dist`、Supabase temp／secrets、logs；不得提交任何 local keys。
- P0-4：新增 GitHub Actions，至少執行 install、typecheck、28+ tests、build；固定 Node／pnpm 版本並使用 lockfile frozen install。
- P0-5：準備 GitHub Pages SPA deployment、Vite base／fallback、Supabase production redirect checklist；尚未取得實際 GitHub repository／Pages 設定前，不可宣稱已上線。
- 驗收：離線 shell、更新提示、manifest/installability、敏感快取檢查、四 viewport 回歸、CI workflow 靜態驗證與 production build。完成後 `REVIEW` 並停止。

### 2026-08-31 12:59:08 +08:00｜前端→經理｜REVIEW／DATA INTEGRITY P0

- 本批目標：完成 12:03:04 指派的動態日期／timezone、可插入 sort key、精確 smoke row 清理與重新 application smoke。
- 已完成：新增 `toZonedIso` 與 `nextAppendSortKey`；Conflict flow 改用選取的 TripDay、旅程 timezone、使用者時間與當日既有 items。前一輪錯誤日期 smoke row 已由 Owner UI 刪除；修正後連續新增兩筆，資料庫 Day 2 日期均為 `2026-10-10`、sort key 不重複。
- 驗證證據：Owner refresh persistence、雙頁籤 Realtime、Viewer disabled、登出導回 login、Owner／Viewer console error=0；typecheck、8 files／28 tests、build 通過。Artifacts：`docs/evidence/application-smoke-2026-08-31/`；交付：`docs/reference/FRONTEND_DATA_INTEGRITY_DELIVERY_2026-08-31.md`。
- 未完成：無本批 P0 未完成項目。
- 阻塞：無。
- 風險與技術債：Vite 保留單一 JS chunk 大於 500 kB 的非阻斷 warning，未擴大至 PWA／CI／部署範圍。
- 下一批：等待經理驗收；依指示停止，不自行開始 Phase 2。
- 是否需要經理決策：請 REVIEW／ACCEPTED。

### 2026-08-31 12:03:04 +08:00｜經理｜CHANGES_REQUESTED／DATA INTEGRITY

- 驗收結論：不接受 application smoke 為 DONE；前端仍是唯一 active。
- 已通過：UUID 改為 `crypto.randomUUID()`；經理重跑 typecheck、7 files／25 tests、build 全通過；資料確實寫入 local Supabase。
- P0-1：移除 `startsAt='2026-09-22T14:15:00+09:00'` 硬編碼。必須由選取的 `TripDay.date` 加使用者時間產生 ISO timestamp，並依旅程 timezone 正確保存；Day 2 row 日期必須是 `2026-10-10`。
- P0-2：移除固定 `sortKey='z0'`。依當日現有 items 產生可插入且唯一的 sort key，連續新增兩個景點不得碰撞 `(trip_day_id, sort_key)` unique constraint。
- P0-3：新增測試覆蓋動態日期、timezone、同日連續新增、23505 rollback；修正後清理本輪錯誤日期的精確 smoke row，再重新執行 Owner persistence、Viewer read-only、雙頁籤 Realtime。
- P0-4：在 `docs/evidence/application-smoke-2026-08-31/` 保存 Owner 修改前／後／刷新、Viewer disabled、第二頁籤 Realtime、登出導回 login 與 console error=0 的截圖或結構化紀錄；交付文件連到實際 artifact。
- 下一檢查點：typecheck、測試、build、資料庫 row 日期／sort key、瀏覽器 artifacts 全部通過後 `REVIEW`；不得開始 PWA／CI／部署。

### 2026-08-31 11:43:24 +08:00｜經理｜ENV RESTORED／RESUME FINAL SMOKE

- 5543x local Supabase 與持久化啟動腳本已通過驗收；Owner／Viewer Auth seed 8/8 可用。
- 前端恢復原任務：Owner Planner 編輯／刷新持久化、Viewer read-only、雙頁籤 Realtime、登出／protected route、console error=0。
- 使用目前 `.env.local` 的 55431；完成後重跑 typecheck、25+ tests、build，提交瀏覽器應用層證據並 `REVIEW`，不得自行開始 PWA／CI／部署。

### 2026-08-31 10:56:05 +08:00｜經理｜ENV BLOCKED／WAIT FOR LOCAL RECOVERY

- 經理已確認 Docker Engine 正常，但 containers／volumes 皆為空；不是前端 UI 或 adapter 缺陷。
- 前端不得負責 DB 重建，也不要在 local Supabase 未恢復前繼續 application smoke。
- `.env.local` 的 55431 URL 與 config 一致，先保留；後端完成 5543x stack、seed 與 health 驗證後，前端再恢復原本最後 smoke。

### 2026-08-31 10:39:13 +08:00｜前端→經理｜BLOCKED／LOCAL DATABASE PORT 54322

- 重新開機後已實際執行 local Supabase stop/start 與背景 start；Auth、Inbucket 與 app health 尚不可用。
- 明確 Docker 錯誤：`LegacyContainerStartError`；`supabase_db_travel-planner-pwa` 無法綁定 TCP 54322，Windows 回覆 socket access forbidden。此為 local environment port reservation／permission，不是前端程式錯誤。
- 需要：釋放／允許 54322，或決議改用另一個 local DB port 後再重新啟動 stack。完成後前端接續既定 Owner／Viewer application smoke。
- 完整 stdout／stderr 與時間戳已在 `docs/reference/FRONTEND_M1_DELIVERY_2026-08-28.md` 留存。

### 2026-08-31 09:57:57 +08:00｜前端→經理｜BLOCKED／BROWSER APPLICATION SMOKE

- Auth seed 已驗證恢復：`scripts/local-auth-seed-smoke.mjs` 8/8 passed（四角色、Owner／Viewer password grant、固定 JWT sub）。
- 回歸：TypeScript passed；Vitest 7 files／25 tests passed；Vite production build passed（2027 modules）。
- 阻塞：內建 browser 在 reload local preview、準備 Owner UI login 時回覆 URL policy blocked。依 browser policy，前端不可繞過、不可換用其他自動化 browser surface，亦未提交登入或寫入動作。
- 需要使用者：請在目前 local preview 頁籤手動重新整理，然後告知已完成；前端將繼續 Owner edit／refresh、Viewer read-only、雙頁籤 Realtime、logout／protected route 與 console evidence，完成後回報 REVIEW。

### 2026-08-31 09:53:49 +08:00｜經理｜RESUMED／FINAL APPLICATION SMOKE

- 後端 seed 修正已接受；經理獨立重跑 Auth smoke 8/8，Owner／Viewer local login fixture 可用。
- 前端現可使用既有 `.env.local` 與 Vite，依序驗證 Owner 登入與 Planner 編輯／刷新持久化、Viewer read-only、雙頁籤 Realtime、登出／protected route、console error=0。
- 證據需包含角色、路由、修改前後值、刷新後值、第二頁籤收到事件、Viewer 寫入控制與 console；不得只提供 API smoke 代替瀏覽器應用層結果。
- 完成後執行 typecheck、25+ tests、build，回報 `REVIEW` 並停止；不得自行開始 PWA／CI／部署。

### 2026-08-31 09:18:35 +08:00｜經理｜BLOCKED／WAIT FOR BACKEND SEED

- 接受阻塞證據：local reset、migrations、seed、env 與 Vite 重啟均已執行；Owner／Viewer 均 `400 invalid_credentials`，Admin API users 為空。
- 前端不得自行用 Dashboard 或 Admin API 建立帳號掩蓋 seed 缺陷，也不要繼續無 session 的 application smoke。
- 前端停止並 WAIT；後端修正 user／identity seed，經理驗收後再切回前端。
- 恢復後只需完成 Owner persistence、Viewer read-only、雙頁籤 Realtime 與 console／route 證據。

### 2026-08-31 09:16:51 +08:00｜前端→經理｜BLOCKED／LOCAL AUTH SEED FIXTURE

- 已依指定命令成功執行 `pnpm dlx supabase@2.115.0 db reset --local`；輸出確認 migrations、`supabase/seed.sql` 與 containers restart 均完成，沒有 reset error。
- 已依 `pnpm dlx supabase@2.115.0 status -o env` 更新 gitignored `.env.local` 的 local API／anon key，並重啟 Vite。
- 實測阻塞：Owner／Viewer password grant 皆 `400 invalid_credentials`；local service-role Auth admin users 為 `200 []`。因此 reset 後 Auth seed users 不存在，application smoke 無合法 Owner／Viewer session 可使用。
- 依指示沒有建立臨時／遠端帳號。需修正 `supabase/seed.sql` 或 local Auth seed loading contract，使四個已定義 auth users 能出現，前端再接續登入、列表、Today、Planner persistence、Viewer read-only、雙頁籤 Realtime 並回報 REVIEW。完整命令與證據已寫入 `docs/reference/FRONTEND_M1_DELIVERY_2026-08-28.md`。

### 2026-08-31 09:05:02 +08:00｜前端→經理｜BLOCKED／LOCAL SUPABASE SEED REQUIRED

- Local Supabase connectivity 已恢復：Auth health `200`；新增不提交 `.env.local` 指向 `http://127.0.0.1:54321`，瀏覽器重新載入受保護 Today route 會正確導至 `/login`，console error=0。
- 仍無法完成 Owner／Viewer smoke：匿名 `trips` REST 回 `200 []`，`owner@example.com` 與 `viewer@example.com` password grant 均回 `400 Invalid login credentials`，證明 local seed 未載入。
- 需要提供：在可使用 Supabase CLI 的環境，對 `D:\旅遊安排` 執行 `supabase db reset`（或等效 local seed reset）並確認既定四角色存在。之後前端將繼續登入、列表、Today、Planner persistence、Viewer read-only、雙頁籤 Realtime，完成後回報 REVIEW。
- 未建立遠端帳號，沒有執行遠端資料寫入。詳細命令與結果記於 `docs/reference/FRONTEND_M1_DELIVERY_2026-08-28.md`。

### 2026-08-31 08:58:10 +08:00｜前端→經理｜BLOCKED／FINAL VERIFICATION TESTS

- 已完成 P0-1：新增並接入 `tripDataState` optimistic state machine。成功、PT409 rollback→conflict、23505 rollback→conflict、42501 rollback→failed、offline rollback→offline 與 retry 成功清除 error 已由單元測試覆蓋。
- 驗證：TypeScript passed；Vitest 7 files／25 tests passed；Vite production build passed（2027 modules）。
- P0-2 實際阻塞：`supabase status` 顯示 Supabase CLI command not found；`docker --context default version`／`docker --context default ps` 顯示 Docker daemon 的 `//./pipe/docker_engine` 不存在。因此 local Supabase 不能 start/reset，無法以 local seed `owner@example.com`／`viewer@example.com` 驗證登入、列表、Today、Planner persistence、Viewer read-only 與雙頁籤 Realtime。
- 未建立遠端帳號、未寫入 smoke data；待安裝 Supabase CLI 並啟動 Docker Desktop 後，會依同一指派完成 P0-2 再回報 REVIEW。

### 2026-08-31 08:54:28 +08:00｜經理｜PROGRESS_RECHECK／CONTINUE

- 驗收結論：沒有收到 8 月 28 日退回項目的新交付；Vite preview 已啟動，但僅有 listener 不等於 application smoke。
- 重驗結果：TypeScript、Vitest 6 files／19 tests、production build 全部通過，現有基線穩定。
- 前端繼續 P0-1：補 TripDataContext optimistic success、PT409／23505／42501／offline rollback 與 retry tests。
- 前端繼續 P0-2：使用 local Supabase seed Owner／Viewer 完成登入、列表、Today、Planner、刷新持久化、Viewer read-only、雙頁籤 Realtime 與 console 證據。
- 下一檢查點：兩項補件、typecheck、tests、build 全通過後提交 `REVIEW` 並停止；不得自行開始 PWA／CI／部署。

### 2026-08-28 17:27:48 +08:00｜經理｜CHANGES_REQUESTED／FINAL VERIFICATION

- 驗收結論：錯誤契約程式接受，但本批尚未完成；前端繼續為唯一施工者。
- 已通過：`mapSupabaseError`、SupabaseTrip／Itinerary 共用 mapper、Planner typed states；本輪獨立重跑 typecheck、6 files／19 tests、build 全通過。
- P0-1：新增 TripDataContext 或抽出的 optimistic state machine tests，至少驗證成功、PT409 rollback→conflict、23505 rollback→conflict、42501 rollback→failed、offline rollback→offline，以及 retry 重新載入並清除 error。
- P0-2：啟動 local Supabase 與 Vite，使用 seed `owner@example.com`／`viewer@example.com`（只限本機）執行 application smoke：登入返回、旅程列表、Today、Planner 編輯、刷新持久化、Viewer read-only、兩個頁籤 Realtime。
- P0-3：使用不提交的 `.env.local` 指向 local Supabase；不得重建遠端永久測試帳號。若 Docker／local Supabase 真的無法啟動，附實際指令與錯誤後回報 BLOCKED，不能以「沒有 listener」代替執行。
- 證據：保存路由結果、角色、刷新前後資料、Realtime 接收、console errors 與清理狀態；不得宣稱 Google OAuth 已驗證，除非實際完成 provider redirect。
- 完成定義：上述 tests＋smoke、typecheck、build 全通過後 REVIEW 並停止；PWA／CI 下一批才開始。

### 2026-08-28 17:24:50 +08:00｜前端→經理｜BLOCKED／BACKEND CONTRACT REGRESSION

- 已完成：集中式 `mapSupabaseError`／typed `AppError`，覆蓋 PT409＋VERSION_CONFLICT、23505＋SORT_KEY_CONFLICT、42501＋FORBIDDEN_ROLE、Auth、Not Found 與安全 fallback；Trip／Itinerary repositories 共用 mapper，無 `error.message` conflict 判斷。
- 已完成：TripDataContext optimistic rollback 以 typed error 決定 conflict／offline／failed；Planner 可分別呈現版本衝突、排序衝突、離線、權限拒絕、登入失效，並依 retryable 顯示操作。
- 驗證：TypeScript passed、Vitest 6 files／19 tests passed、Vite production build passed（2026 modules）；交付文件更新於 `docs/reference/FRONTEND_M1_DELIVERY_2026-08-28.md`。
- 阻塞：application-level 正式 Supabase smoke 尚無法安全執行。工作區無 `.env`、本機 Vite 無常駐 listener，且未提供經規劃可清理的 Owner／Viewer 測試登入 session；前端未自行建立帳號或寫入 smoke 資料。
- 請經理提供：可安全使用的正式環境設定與兩個已規劃測試 session（Owner／Viewer），或指派可用測試方式。取得後將執行登入→列表→Today→Planner 刷新持久化、Viewer read-only、雙頁籤 Realtime，並回報 REVIEW。

### 2026-08-28 17:15:42 +08:00｜經理｜ACTIVE／BACKEND CONTRACT REGRESSION

- 工序：後端 M1 final integration 已接受；現在只啟動前端，後端與 Figma WAIT。
- P0：將 Supabase/PostgREST `code`、`hint`、status 集中映射為 AppError；至少覆蓋 PT409／VERSION_CONFLICT、23505／SORT_KEY_CONFLICT、42501／FORBIDDEN_ROLE、Auth／Not Found。
- P0：SupabaseTripRepository 與 SupabaseItineraryRepository 共用 mapper，Planner 正確呈現 conflict、sort conflict、permission、offline 並維持 optimistic rollback。
- P0：新增 mapper、repository 與 TripDataContext tests；執行正式設定下登入→列表→Today→Planner→刷新持久化與雙頁籤 Realtime smoke。
- 禁止擴充：本批不做 Budget、Booking Vault、PWA 或部署；完成後 REVIEW 並停止。

### 2026-08-28 16:27:40 +08:00｜經理｜MOBILE CTA FIX ACCEPTED／WAIT

- 問題：390px Today 行程列的「開始導航」文字 CTA 佔據整個內容欄，使 icon／文案視覺失衡。
- 修正：`<760px` 使用 44×44 圓形 navigation icon-only button；`>=760px` 恢復 icon＋「開始導航」文字。
- 驗收：390×844 實測 44×44、無水平溢位、accessible name 為「開始導航至國立民俗博物館」；typecheck、13 tests、build 通過。
- 狀態：前端本次微修完成並 WAIT；後端繼續執行 `DEC-2026-08-28-08`。

### 2026-08-28 16:21:03 +08:00｜經理｜M1 ACCEPTED／WAIT

- 驗收結論：前端 M1 本階段接受並停止修改；下一位為後端工程師。
- 接受項目：RWD／icons／Auth／Itinerary persistence／Realtime client／expected-version／rollback，以及 Trip／Day／Member／Place 正式 Supabase repository、provider 與 query adapter。
- 驗證：`queries.ts` 無 MockTripRepository import；factory 有 Supabase／demo selection tests；row mapping、nullable、error、Viewer read path 已覆蓋；本輪獨立重跑 5 files／13 tests、typecheck、build 全通過。
- 保留事項：Budget／expenses 為 M1 deferred demo-only；原生 200% zoom 已明確以等效 reflow 取代，不冒充完整瀏覽器 zoom 證據。
- 狀態：前端 WAIT。只有後端 final integration 提交具體 contract failure 時才重新啟動前端。

### 2026-08-28 16:19:04 +08:00｜前端→經理｜REVIEW／FINAL DATA ADAPTER P0

- 已新增 `src/repositories/supabase/SupabaseTripRepository.ts`，以 generated `Database` types 支援 `listTrips/getTrip/listDays/listMembers/listPlaces/getPlace`，集中 row mapping、nullable 欄位與錯誤處理。
- 已新增 `src/repositories/TripRepositoryProvider.ts`；設定 `VITE_SUPABASE_*` 選 Supabase，未設定才選 demo mock。Trip／Day／Member／Place hooks 現在都經 factory，不再直接依賴 `MockTripRepository`。
- `useExpenses` 唯一保留 `MockBudgetRepository`，已在程式與交付文件標註為 M1 deferred demo-only。
- 驗證完成：TypeScript passed、Vitest 5 files／13 tests passed、Vite production build passed；測試包含 factory selection、row mapping、null、error、Viewer read path。交付文件：`docs/reference/FRONTEND_M1_DELIVERY_2026-08-28.md`。
- 依指示回報 REVIEW 並停止；未修改後端。

### 2026-08-28 16:13:13 +08:00｜經理｜RWD ACCEPTED／FINAL FRONTEND P0

- 驗收結論：RWD 與 Today 導航按鈕修正接受；整體前端仍差正式讀取資料 adapter，前端繼續為唯一 active assignee。
- 接受證據：六路由 × 四 viewport、88px sidebar、Today 720＋320、Planner／Explore／People 桌面結構、無水平溢位、等效 200% reflow、contrast 6.31:1、safe-area 與 reduced-motion；本輪獨立重跑 typecheck、7 tests、build 全通過。
- 最後任務 1：實作 `SupabaseTripRepository`，覆蓋 `listTrips/getTrip/listDays/listMembers/listPlaces/getPlace`，使用 generated `Database` types 並完成 row → domain mapping。
- 最後任務 2：建立 repository factory／provider；有 `VITE_SUPABASE_*` 時所有 M1 Trip／Day／Member／Place queries 必須使用 Supabase，只有未設定環境時才使用 mock demo fallback。
- 最後任務 3：重構 `src/features/trips/queries.ts`，禁止直接 import `MockTripRepository`；Budget 為 M1 暫緩，可保留 mock，但需在程式與交付文件清楚標註。
- 最後任務 4：補 factory selection、row mapping、空值／錯誤、Viewer read path 測試；不得在 component 直接呼叫 Supabase。
- 完成定義：靜態掃描確認 `queries.ts` 無 mock import；typecheck、tests、build 通過；未配置走 demo、已配置走 Supabase 的測試證據齊全。完成後回報 REVIEW 並停止，不自行啟動後端。

### 2026-08-28 15:31:39 +08:00｜經理｜CHANGES_REQUESTED／FRONTEND CONTINUES

- 驗收結論：程式核心進度接受，但尚未達 DONE；前端繼續為唯一施工者，不切換後端。
- 已獨立通過：TypeScript、Vitest 3 files／7 tests、Vite production build；靜態掃描未見舊 glyph、`setTimeout` 或手工 SVG path。
- RWD 退回：Planner／Explore 在 768 與 1280 僅為 560px 手機卡置中，People 為 390px 卡置中；1280 缺 88px sidebar，Planner／Explore 缺 tablet 雙欄，Today／其他頁桌面導覽不一致。
- 資料層退回：`src/features/trips/queries.ts` 仍直接 import `MockTripRepository`／`MockBudgetRepository`；需將 Trip、days、members、places 接入正式 adapter，M1 暫緩的 budget 可明確留在 mock。
- P0-1：新增共用 RWD shell／navigation breakpoint，不要每頁各自固定 390／560px；按 390×844、430×932、768×1024、1280×900 實作 Login、Today、Planner、Explore、Overview、People。
- P0-2：768 的 Planner／Explore 依內容採雙欄；1280 使用 88px sidebar、主內容最大 1120px，Today 約 720＋320；表單可維持單欄但使用適當最大寬。
- P0-3：提交六路由 × 四 viewport 的實際畫面或代表性 template 證據、`scrollWidth <= clientWidth`、長文字、safe-area、200% reflow，以及 contrast、axe、鍵盤／焦點、screen-reader、reduced-motion。
- P0-4：補正式 Trip／Day／Member／Place repositories 與 query adapter；驗證 Supabase 設定存在時不讀 mock，設定不存在才允許 demo fallback。
- 下一檢查點：typecheck、7+ tests、build、RWD 矩陣與 browser evidence 全部通過後回報 REVIEW 並停止；不得自行啟動後端。

### 2026-08-28 15:07:50 +08:00｜經理｜FRONTEND ACTIVE／P0

- 驗收結論：Figma `DES-2026-08-28-04` 已接受；現在只啟動前端，Figma 與後端維持 WAIT。
- 工序 1（先做）：依 `docs/design/ICON_CONTRACT.md` 與 Figma nodes `91:62`、`99:74`、`100:62`、`101:32` 匯出／導入正式資產，移除 `Icon.tsx` 手工 path 與 TripOverview／People／Planner 的 `←／›／•••／＋`；建立可追溯 Code Connect mapping。
- 工序 2：接正式 Supabase client、generated database types、Google／Magic Link 與 protected routes；以 adapter 取代 mock repository，不在 UI 直接散落查詢。
- 工序 3：實作 Realtime、expected-version conflict、optimistic reorder／rollback、跨日 drop zone、刪除確認、saving／success／failure／offline／session-expired；移除 Edit／Flight 的 `setTimeout` 假持久化。
- 工序 4：依 Figma 規格完成 390×844、430×932、768×1024、1280×900；提交同 viewport 並排差異、computed contrast、axe、完整鍵盤、焦點返回、200% reflow、safe-area、screen-reader 與 reduced-motion 證據。
- 完成定義：typecheck、unit／integration tests、production build 全通過；Viewer UI 禁寫、Editor 可改；回報 REVIEW 後停止，不自行啟動後端。

### 2026-08-28 09:40:39 +08:00｜經理｜CHANGES_REQUESTED／WAIT

- 驗收結論：接受 category registry、Today／Bottom Nav glyph 替換、四條新增 routes，以及本輪 typecheck／3 files 5 tests／production build 通過。
- 接受項目：Today 不再由標題尾字猜 icon；核心導覽沒有 disabled 收藏 dead end；缺頁已有 protected route 骨架。
- 退回項目：`src/components/icons/Icon.tsx` 仍是手工 inline SVG，需待 Figma 交付正式來源 mapping 後替換；People、TripOverview、Planner 仍有 `←／›／•••／＋`；Edit／Flight 流程仍以 `setTimeout` 模擬，不是 persistence／Realtime；Hero 內文合成在圖片中，仍無法動態化。
- 優先級：前端目前 `WAIT`，不得與後端平行修改。
- 下一檢查點：後端第一回合完成、Figma responsive／motion／asset mapping 完成後，前端才開始 Supabase adapter、正式 icons、Planner rollback 與瀏覽器驗收。
- 跨端指派位置：工序在 `docs/PROJECT_HUB.md`；後端任務在 `docs/coordination/FRONTEND_BACKEND.md`；Figma 待辦在 `docs/coordination/FRONTEND_FIGMA.md`。

### 2026-08-27 16:39:16 +08:00｜前端｜REVIEW

- 本批目標：執行經理 16:28 派發項目，補穩定分類 icon contract、缺少路由與關鍵 async states。
- 已完成：新增 `ItineraryCategory` code contract 與 `categoryLabel`；建立集中式 SVG `Icon`／`ItineraryCategoryIcon` adapter（含旅行分類、導航、操作 icons）；Today Timeline 不再使用 `title.slice(-1)`；Bottom Navigation 改為 Today／Plan／Explore／People 四個有效入口；Explore 補目前位置、附近／熱門、搜尋、loading／empty／error；新增 Place Details、Edit Itinerary、Quick Adjust、Flight Change Reschedule 四條 protected routes；衝突與新增頁補 saving／failure 狀態。
- 驗證證據：`pnpm run typecheck` 通過；Vitest 2 files／3 tests 通過；`pnpm run build` 通過（Vite 8.2.2，186 modules，JS 399.87 kB／gzip 124.48 kB，CSS 32.24 kB／gzip 6.51 kB）；新 routes 位於 `src/app/App.tsx`。
- 未完成：全站舊頁仍有 4 處字符式返回／chevron／more（TripOverview、People、ItineraryObjects、Planner），本批核心 Today 與 Bottom Nav 已移除；尚未產出四 viewport 新截圖、axe 瀏覽器與 200% zoom 證據；Planner 的跨日 drop zone、刪除確認及真正 repository rollback 尚待 Figma 互動定稿。
- 阻塞：正式 Figma SVG mapping、node URL 與 responsive／motion 決議仍未交付；後端 Supabase generated types／local reset 仍受 Docker daemon 阻塞。
- 風險與技術債：新增流程目前使用 mock repository／本地 async 模擬，不代表後端持久化或 Realtime 已完成；正式 icon 資產交付後須對映替換集中 adapter path。
- 下一批：清除剩餘 4 處 glyph；補 Planner optimistic rollback／delete confirm；執行四 viewport、axe、鍵盤與 200% zoom 視覺驗收。
- 是否需要經理決策：請確認可先以集中式合法 SVG path adapter 作為 Figma 正式 asset mapping 前的工程基線。

### 2026-08-27 11:27:00 +08:00｜前端｜REVIEW

- 本批目標：確認 Figma 查核後內容、修正不一致頁面並接續 M1 後續頁面。
- 已完成：重做登入與旅程總覽；新增旅伴與權限、旅程設定與步調、預算與分帳；Bottom Navigation 接通旅伴入口；預算與旅伴 mock data 均置於 repository。
- 驗證證據：TypeScript typecheck、production build 通過；2 test files／3 tests 通過；五頁 390×844 截圖位於 `docs/evidence/figma-check-2026-08-27/`，無水平溢位。
- 未完成：正式 Google／Magic Link、後端持久化、支出新增 mutation、權限變更 mutation。
- 阻塞：仍等待 Supabase generated types、RLS 與 Auth 設定；正式 icons 尚待資產交付。
- 風險與技術債：目前新增頁面為 mock vertical slice；不可視為真實權限或金流安全邊界。
- 下一批：依 M1 優先處理正式 Auth adapter、capability guard；若後端仍未交付則接續 Figma 已完成的地點詳情與公開唯讀頁。
- 是否需要經理決策：請確認下一批優先順序是後端整合或繼續完成已查核頁面。

### 2026-08-27 10:59:24 +08:00｜前端｜REVIEW

- 本批目標：完成經理指定 P0 七項，維持 Figma 既有資訊架構，不擅自改動待決議互動。
- 已完成：修正「結束」錯字；移除 route 中 `seoul`／`bukchon`／固定 Day 2；改用 route params、TanStack Query 與 repository；擴充共用 contracts；加入 mock Auth、protected routes、旅程清單與總覽；導入 RHF／Zod；建立 Vitest／Testing Library／axe 測試。
- 驗證證據：`pnpm` lock 已更新；TypeScript typecheck 通過；production build 通過；2 test files／3 tests 通過；`docs/evidence/overview-{mobile-360,mobile-430,tablet-768,desktop-1440}.png` 四張截圖，四 viewport `scrollWidth === clientWidth`。
- 未完成：Supabase adapter、generated database types、RLS／Realtime、正式 icon library；不在本批未授權範圍內。
- 阻塞：後端 generated types 尚未交付；Figma 六項互動與正式 responsive 規格仍待決議。
- 風險與技術債：目前 Auth 與 repository 為 mock；axe 在 jsdom 關閉 color-contrast rule，仍需瀏覽器／設計端做人工 AA 對比驗證。
- 下一批：依後端 types 建 adapter；依 Figma 決議補 states／icons／motion，再做逐畫面差異校正。
- 是否需要經理決策：請驗收本批 P0，並維持「未經 Figma 決議不改原始版面」限制。

### 2026-08-27 10:33:13 +08:00｜經理｜CHANGES_REQUESTED

- 接受：專案骨架、P0 視覺修正、mock vertical slice、build 通過。
- 退回／待補：測試、去硬編碼、contracts、四 viewport 比較、Auth 入口。
- 下一檢查點：前端 P0 七項完成並附證據。
