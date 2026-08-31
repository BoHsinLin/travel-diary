# M1 前端整合交付

時間戳：2026-08-31 10:39:13 +08:00（Asia/Taipei）

## 已完成

- 將 74-key icon adapter 改為可追溯的 `lucide-react` package mapping，清除手工 SVG path 與 `←／›／•••／＋` 字符圖示。
- 建立 typed Supabase client，接 Google OAuth、Email Magic Link、session restore、auth state subscription 與 protected-route loading state。
- 新增 `SupabaseItineraryRepository`，使用 generated `Database` types、expected-version RPC、Realtime postgres changes 與資料列映射；UI 不直接散落 Supabase query。
- 新增 `SupabaseTripRepository`，以 generated `Database` types 集中處理 `trips`、`trip_days`、`trip_members`、`places` 的 read queries 與 row → domain mapping。
- 新增 `TripRepositoryProvider`：設定 `VITE_SUPABASE_URL` 與 `VITE_SUPABASE_ANON_KEY` 時，所有 M1 Trip／Day／Member／Place query 使用 Supabase；未設定時才使用 demo mock fallback。
- `src/features/trips/queries.ts` 已不再直接 import `MockTripRepository`；Budget／expenses 是明確標記的 M1 deferred demo-only mock，未阻擋正式旅程讀取資料流。
- TripDataContext 支援 optimistic update、失敗 rollback、offline／failed／conflict／saving／synced 狀態。
- Planner 支援同日排序、跨日 drop zone、固定行程保護、刪除確認、Realtime refresh、Viewer 禁寫及 Editor／Admin／Owner 編輯能力。
- Edit／Flight 移除 `setTimeout` 假持久化，改走 repository update 與 expected version。
- 加入 safe-area 與 `prefers-reduced-motion` 規則。

## 驗證

- TypeScript：passed。
- Vitest：5 files／13 tests passed，包含 Supabase row mapping、nullable 欄位、錯誤、Viewer read path 及 factory Supabase/demo selection。
- Vite production build：passed；2025 modules transformed。
- 靜態掃描：`queries.ts` 無 `MockTripRepository` import；僅保留並標註 M1 deferred 的 `MockBudgetRepository`。
- 靜態掃描：`src` 內無殘留 `←／›／•••／＋`、`setTimeout` 或手工 `<path>/<circle>/<rect>`。

## 環境說明

- `.env.example` 已提供公開 Supabase URL／publishable key；未設定 `VITE_SUPABASE_*` 時保留 mock adapter，方便本機 UI 開發與單元測試。
- 本輪 in-app browser 在建立新驗收頁籤時連續逾時；因此不可宣稱已完成新的四 viewport、screen-reader、200% reflow 或 computed contrast 瀏覽器證據。舊 Today 四尺寸證據仍在 `docs/evidence/today-wave-2026-08-27/`。

## 後續整合門檻

- 後端整合回合需以實際測試帳號完成 Google／Magic Link redirect、Viewer／Editor、雙 session Realtime 與遠端 expected-version smoke。
- 前端待瀏覽器控制恢復後補 390×844、430×932、768×1024、1280×900、axe、完整鍵盤、焦點返回、200% reflow、safe-area、screen-reader、reduced-motion 證據。

## 狀態

- 2026-08-28 16:19:04 +08:00：FINAL DATA ADAPTER P0 已完成，提交經理 REVIEW；依指示停止於前端範圍，未啟動後端工作。

## BACKEND CONTRACT REGRESSION（2026-08-28 17:24:50 +08:00）

- 新增集中式 `mapSupabaseError` 與 `SupabaseAppError`，將 PostgREST/Auth `code`、`hint`、HTTP status 映射為 typed `AppError`：`VERSION_CONFLICT`（PT409）、`SORT_KEY_CONFLICT`（23505）、`FORBIDDEN_ROLE`（42501/403）、`AUTH_REQUIRED`、`NOT_FOUND` 與安全的 `UNKNOWN` fallback。
- `SupabaseTripRepository` 與 `SupabaseItineraryRepository` 已共用 mapper；不再以 `error.message` 判斷 conflict。`TripDataContext` 用 typed error 驅動 optimistic rollback 與 `conflict`／`offline`／`failed` sync state。
- Planner 會區分版本衝突、排序衝突、離線、權限不足與登入失效，並只在可重試的狀態顯示重試／載入最新版操作。
- 驗證：TypeScript passed；Vitest 6 files／19 tests passed（含 PT409、23505、42501、Auth、Not Found、sync state、repository error mapping）；Vite production build passed（2026 modules）。
- 應用層正式 Supabase smoke 尚未執行：工作區無 `.env`，本機 Vite 無常駐 listener，且沒有可安全使用的測試登入帳號。未自行建立或提交帳號／資料；需經理提供正式環境設定與已規劃、可清理的 Owner／Viewer 測試 session 後再驗證登入、Today、Planner persistence、Viewer read-only 與雙頁籤 Realtime。

## FINAL VERIFICATION TESTS（2026-08-31 08:58:10 +08:00）

- 新增 `src/app/tripDataState.ts`，把 optimistic operation 的開始、成功完成與 rollback 狀態轉換集中為可測試 state machine，並已由 `TripDataContext` 實際使用。
- 新增 `src/app/tripDataState.test.ts`：覆蓋 optimistic success、PT409／VERSION_CONFLICT rollback → conflict、23505／SORT_KEY_CONFLICT rollback → conflict、42501 rollback → failed、offline rollback → offline，以及 retry reload success 清除 error。
- 驗證：TypeScript passed；Vitest 7 files／25 tests passed；Vite production build passed（2027 modules）。
- Local Supabase 實測阻塞（已執行而非假設）：`supabase status` 回覆 command not found；`docker --context default version` 與 `docker --context default ps` 回覆 Docker daemon 的 `//./pipe/docker_engine` 不存在。故無法執行 `supabase start/reset`、local seed Owner／Viewer login、持久化與雙頁籤 Realtime smoke。未建立遠端帳號或資料。

## LOCAL SUPABASE CONNECTIVITY RECHECK（2026-08-31 09:05:02 +08:00）

- Local Auth 現已可連線：`GET http://127.0.0.1:54321/auth/v1/health` 回 `200`（GoTrue v2.196.0）。已建立不提交且被 `.gitignore` 排除的 `.env.local`，使前端指向 local Supabase。
- 瀏覽器實測：重新載入 `/trips/trip-001/today` 後，未登入者正確導向 `/login`，console error 為 0，證明受保護 route 與 local Supabase 設定已生效。
- Seed 實測：匿名 REST `trips` 回 `200 []`；`owner@example.com`、`viewer@example.com` 皆回 `400 Invalid login credentials`。因此 seed 尚未套入，目前不能以不存在的帳號宣稱完成 Owner／Viewer、Planner persistence、刷新與雙頁籤 Realtime smoke。
- 後續必要操作：在具有 Supabase CLI 的終端對本專案執行 `supabase db reset`，確認 seed 成功後再執行剩餘 application smoke；不需建立遠端永久帳號。

## LOCAL RESET EXECUTED／SEED AUTH FIXTURE BLOCKED（2026-08-31 09:16:51 +08:00）

- 已按指令於 `D:\旅遊安排` 成功執行 `pnpm dlx supabase@2.115.0 db reset --local`。stdout 明確記錄：所有七支 migrations 套用、`Seeding data from supabase/seed.sql...`、`Restarting containers...`、`Finished supabase db reset on branch main.`；命令未回傳失敗輸出。
- 已接著執行 `pnpm dlx supabase@2.115.0 status -o env`，取得 local `API_URL=http://127.0.0.1:54321` 與 `ANON_KEY`，並更新不提交、gitignored 的 `.env.local`；Vite 已重啟於 `http://127.0.0.1:5175`。
- 實測結果：Owner／Viewer password grant 仍皆為 `400 invalid_credentials`；以 local service-role 呼叫 `GET /auth/v1/admin/users?page=1&per_page=100` 得 `200` 且 users 為空陣列。即使 reset 日誌宣告 seed 已執行，現行 local Auth database 沒有 seed user，無法繼續合法的登入、持久化、Viewer read-only 或 Realtime smoke。
- 結論：此為 local Auth seed fixture／reset contract 異常；依經理規定，未自行建立臨時或遠端帳號。需修復 seed 對 `auth.users`／identity 的載入後再繼續 application smoke。

## FINAL APPLICATION SMOKE RESUME（2026-08-31 09:57:57 +08:00）

- Auth fixture 已修復並直接驗證：既有 `scripts/local-auth-seed-smoke.mjs` 在由 `status -o env` 暫時注入 local keys 後 8/8 通過，包含 Admin API 四角色、Owner／Viewer password grant 與固定 JWT `sub`。
- 基線回歸：TypeScript passed；Vitest 7 files／25 tests passed；Vite production build passed（2027 modules）。
- Browser application smoke 尚未完成：在 reload local preview、準備 Owner UI login 前，內建瀏覽器回覆 URL policy blocked。依 browser policy 未嘗試繞過、未改用其他 browser surface，也沒有提交任何登入或寫入動作。
- 待使用者在目前 local preview 頁籤手動重新整理並告知後，繼續 Owner Planner edit／refresh persistence、Viewer read-only、雙頁籤 Realtime、logout／protected route 與 console evidence。

## REBOOT RECOVERY／LOCAL PORT BLOCKED（2026-08-31 10:39:13 +08:00）

- 重新開機後確認 Auth、Inbucket 與前端預覽皆不可連線；已執行 `pnpm dlx supabase@2.115.0 start`，並以背景程序保留完整 stdout／stderr。
- 明確失敗：`LegacyContainerStartError`，Docker 無法啟動 `supabase_db_travel-planner-pwa`，因 TCP `0.0.0.0:54322` 綁定遭 Windows 拒絕（`An attempt was made to access a socket in a way forbidden by its access permissions`）。
- 結論：需釋放／允許 54322，或由後端變更 local Supabase database port 後再執行 `supabase start`。在資料庫容器可啟動前，Auth／Inbucket／application smoke 不能進行；未進行任何帳號或資料寫入。
