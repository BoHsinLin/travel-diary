# 後端 Supabase M1 交付

最後更新：2026-08-28 17:15:42 +08:00（Asia/Taipei）

> 經理驗收狀態：**M1 FINAL INTEGRATION ACCEPTED／WAIT**。51/51 remote smoke、Advisors、回歸與清理已完成；下一工序為前端 contract regression。

## 重建指令

```sh
supabase start
supabase db reset
```

本批檔案：

- `supabase/config.toml`
- `supabase/migrations/202608270001_m1_core_schema.sql`
- `supabase/migrations/202608280001_icon_category_contract.sql`
- `supabase/migrations/202608280002_m1_security_rpc_rls.sql`
- `supabase/migrations/20260828050122_harden_function_exposure.sql`
- `supabase/migrations/20260828051640_complete_m1_rpc_and_data_api.sql`
- `supabase/seed.sql`
- `supabase/tests/rls_matrix.sql`
- `supabase/tests/rpc_contracts.sql`
- `supabase/types/database.types.ts`
- `.env.example`

目前驗證狀態：

- 已通過：`supabase db reset --local`，五支 migration 與 local seed 可從空資料庫完整重播。
- 已通過：`supabase test db --local`，RLS matrix 18 項加 RPC contracts 28 項，共 46 項全數通過。
- 已通過：`supabase db lint --local --level error --fail-on error`，無 schema errors。
- 已通過：Supabase local advisors `No issues found`；遠端 Security Advisors 無 lint。
- 已通過：bundled Node `tsc -b`、Vitest 3 files／5 tests、Vite production build。
- `supabase/types/database.types.ts` 已由 reset 後的本機 schema 使用 CLI 正式重新產生。

遠端專案：

- Project：`travel-planner-pwa`
- Project ref：`mgxsjobicqyddoaejqvf`
- Region：`ap-northeast-1`
- API URL：`https://mgxsjobicqyddoaejqvf.supabase.co`
- 遠端已套用五支 migration；開發 seed 未推送至遠端。

## 核心資料表

| 表 | 用途 | 前端 contract |
|---|---|---|
| `trips` | 旅程主檔、timezone、currency、version | `Trip` |
| `trip_members` | 四角色 membership | `TripMember` |
| `trip_days` | 日期與可插入排序 | `TripDay` |
| `places` | 旅程內景點資料 | `Place` |
| `itinerary_items` | 行程項目、狀態、排序、version | `ItineraryItem` |
| `invitations` | 邀請與預設角色 | `Invitation` |
| `trip_events` | Realtime/event log payload | `SyncState` 輔助 |

## RLS Matrix

| 行為 | Owner | Admin | Editor | Viewer |
|---|---|---|---|---|
| 讀取旅程、成員、天、景點、行程 | allow | allow | allow | allow |
| 建立／更新旅程內容 | allow | allow | allow | deny |
| 刪除旅程 | allow | deny | deny | deny |
| 管理成員與邀請 | allow | allow | deny | deny |
| 讀取邀請 | allow | allow | deny | deny |
| 讀取 event log | allow | allow | allow | allow |

RLS helper：

- `current_user_role(trip_id uuid)`
- `can_read_trip(trip_id uuid)`
- `can_edit_trip(trip_id uuid)`
- `can_admin_trip(trip_id uuid)`
- `is_trip_owner(trip_id uuid)`
- `trip_id_for_day(day_id uuid)`

## Realtime Payload

Realtime 已加入 publication：

- `trips`
- `trip_members`
- `trip_days`
- `places`
- `itinerary_items`
- `invitations`
- `trip_events`

建議前端訂閱 `trip_events`，以 `trip_id` 過濾後依 `created_at` 更新 local cache。

```ts
type TripEventPayload = {
  id: string;
  trip_id: string;
  actor_id: string | null;
  event_type: 'insert' | 'update' | 'delete';
  entity_table: 'trips' | 'trip_members' | 'trip_days' | 'places' | 'itinerary_items' | 'invitations';
  entity_id: string;
  payload: { new: unknown; old: unknown };
  created_at: string;
};
```

敏感資料規則：

- `trip_events.payload` 對 `invitations` 會移除 `token_hash` 與 `email`，避免所有 trip members 透過 event log 讀到邀請秘密。
- 管理邀請清單請讀 `public.safe_invitations` view；原表不對 client 開放 `select` policy，避免直接暴露 `token_hash`。

## RPC Contract

### `accept_trip_invitation(invitation_token text)`

- 權限：`authenticated`。
- 驗證：使用 `digest(token, 'sha256')` 比對不可逆 `token_hash`；要求邀請為 `pending`、未過期，且 JWT email 與邀請 email 相同。
- 原子化：在 transaction 中 `for update` 鎖定 invitation，建立／更新 membership，再將 invitation 標記為 `accepted`。
- 過期／撤回：只回 `VALIDATION_FAILED`，不嘗試更新 invitation status；錯誤 transaction 不宣稱持久化任何狀態。
- 角色保護：既有 membership 只會升級或維持，不會被較低角色邀請降級。
- 可安全重試：同一使用者已接受同一邀請時，回傳既有 accepted 結果。
- 回傳：`invitation_id uuid, trip_id uuid, role trip_role, status invitation_status`。

### `update_trip_with_version(target_trip_id uuid, expected_version integer, patch jsonb)`

- 權限：使用 caller 的 RLS；Owner／Admin／Editor 可更新，Viewer／anonymous 禁止。
- 成功時回傳更新後 `trips` row，trigger 會遞增 `version`。
- stale version 以 SQLSTATE `40001` 並附 `hint = VERSION_CONFLICT` 回報。

### `update_trip_day_with_version(target_day_id uuid, expected_version integer, patch jsonb)`

- 權限：使用 caller 的 RLS。
- 可更新 `date/title/pace_override/sort_key`。
- stale version 回 `VERSION_CONFLICT`；同 trip sort key 撞鍵回 `SORT_KEY_CONFLICT`。

### `update_itinerary_item_with_version(target_item_id uuid, expected_version integer, patch jsonb)`

- 權限：使用 caller 的 RLS。
- 可更新 day、place、time、duration、title、meta、type、status、sort_key、fixed。
- stale version 回 `VERSION_CONFLICT`；同 day sort key 撞鍵回 `SORT_KEY_CONFLICT`。

## 錯誤碼

| code | HTTP | retryable | 使用情境 |
|---|---:|---|---|
| `AUTH_REQUIRED` | 401 | false | 未登入 |
| `FORBIDDEN_ROLE` | 403 | false | Viewer 修改、Editor 管理成員 |
| `NOT_FOUND` | 404 | false | 資源不存在或不可讀 |
| `VALIDATION_FAILED` | 422 | false | schema check、表單欄位錯誤 |
| `VERSION_CONFLICT` | 409 | true | 前端 version 與資料庫不一致 |
| `SORT_KEY_CONFLICT` | 409 | true | 同一 day 或 trip sort key 重複 |
| `RATE_LIMITED` | 429 | true | Auth 或 RPC 流量限制 |

## Auth Redirect 與公開環境變數

- Local site URL：`http://localhost:5173`
- Local callback：`http://localhost:5173/auth/callback`
- Public env：`VITE_SUPABASE_URL`
- Public env：`VITE_SUPABASE_ANON_KEY`
- Server-only env 不得進前端 bundle。

## Seed 測試帳號

Local seed 建立四個角色：

- `owner@example.com`
- `admin@example.com`
- `editor@example.com`
- `viewer@example.com`

密碼皆為 `password`，僅供本機 Supabase reset 使用。

### Local Auth seed 驗證

- `supabase/seed.sql` 同時建立 `auth.users` 與 email provider `auth.identities`，包含 GoTrue 所需的空 token、provider metadata、confirmed email 與固定 UUID；不依賴 Dashboard 手動建帳號。
- 可重現 smoke：先以 `supabase status -o env` 取得本機 `API_URL`、`ANON_KEY`、`SERVICE_ROLE_KEY` 並映射為 `SUPABASE_URL`、`SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`，再執行 `node scripts/local-auth-seed-smoke.mjs`。
- Smoke 不輸出 access token、anon key 或 service-role key；只輸出 HTTP status、fixture email 與 user/JWT UUID。
- 2026-08-31 CLI 2.115.0 驗證：Admin API 列出四人；Owner／Viewer password grant 為 HTTP 200；user ID 與 JWT `sub` 均符合 `...0101`／`...0104`；共 8/8 checks passed。
- 回歸：`supabase db reset --local` 成功，pgTAP 46/46，DB lint 零錯誤，generated types SHA-256 仍為 `C230BCA29485BABF48B3ABE5679D768D77E30E4505F57CAB08DE5AC44DADD49B`。本次未修改遠端 Auth users。

### Local stack recovery 與安全啟動

- 2026-08-31 在 Docker containers/volumes 全空的情況下，依授權使用 CLI 2.115.0 重新建立 local-only stack，再執行 `db reset --local`；七支 migrations 與 seed 完整重播，未接觸遠端 project/Auth。
- 實際 ports：API/Auth/Realtime gateway `55431`、DB `55432`、Analytics `55433`、Studio `55434`、shadow reserved `55435`、Mail `55436`。日常 `55435` 無 listener 為正常狀態。
- `scripts/start-local.ps1` 預設只檢查並安全啟動既有 volume；`-Status` 唯讀；volume 缺失時預設 exit 40；只有 `-Initialize` 可建立；`-Reset` 必須再次輸入 `RESET LOCAL DATABASE`。
- 失敗模擬：Docker unavailable exit 20、port occupied exit 30、volume missing exit 40；existing healthy exit 0。所有失敗路徑均未 reset、刪除 volume、覆寫 `.env.local` 或輸出 keys。
- 持久化：`supabase stop` 後以預設模式重啟既有 `supabase_db_travel-planner-pwa`，seed trip count 仍為 1，Auth smoke 8/8。
- 最終驗證：pgTAP 46/46；lint 在 pgTAP 完成後序列化重跑為零錯誤；types hash仍為 `C230BCA29485BABF48B3ABE5679D768D77E30E4505F57CAB08DE5AC44DADD49B`。
- Warning：CLI 提示 `[inbucket]` 已棄用、後續可遷移至 `[local_smtp]`；Storage 停用時非必要 vector container 持續 restarting。兩者不阻塞 API/Auth/DB/Realtime/Studio/Mail health。
- 操作手冊：`docs/backend/LOCAL_DEVELOPMENT_STARTUP.md`，README 已加入入口。

## 2026-08-28 後端安全補強

- `log_trip_event()` 已改為脫敏 invitation payload，不寫入 `token_hash`／`email`。
- Admin membership policy 已限制 owner 操作；Admin 不得建立、指派、升級或竄改 owner。
- 新增 membership integrity trigger，禁止刪除或降級最後一位 owner。
- 新增 deferrable constraint trigger，保證 `trips.current_day_id` 必須屬於同一 trip。
- 新增 authenticated-only `accept_trip_invitation()` security-invoker API wrapper；private security-definer implementation 處理 token hash、期限、狀態、email match 與原子化接受流程。
- 新增 expected-version RPC：`update_trip_with_version()`、`update_trip_day_with_version()`、`update_itinerary_item_with_version()`。
- RLS security-definer helpers 已移至不公開的 `private` schema；公開 helper 改為 security-invoker wrapper，trigger 函式不可由 API roles 直接執行。
- `accept_trip_invitation()` 的 privileged implementation 已移至 `private` schema，公開入口為 authenticated-only security-invoker wrapper。
- 補齊 `accepted_by`、`created_by`、event actor 與 current day foreign key covering indexes。
- `places.category` legacy seed 已改為正式 `ItineraryCategory` code，並在 migration 中 `VALIDATE CONSTRAINT places_category_code_check`。
- `supabase/tests/rls_matrix.sql` 與 `supabase/tests/rpc_contracts.sql` 共 46 項，覆蓋 invitation 全分支、event 脫敏、owner integrity、角色不降級、current day 同旅程、三種 version RPC、sort conflict 與 Viewer／anonymous 禁寫。

## 已知限制

- 遠端未推送 local seed 或範例旅程；final smoke 的四個 Auth users 與 namespaced 資料已完成清理。
- Publishable-key anonymous、Owner／Editor／Viewer／non-member REST 與 RLS 已由 final smoke 驗證；下一步是前端應用層對新 error contract 的整合回歸。
- 遠端 Performance Advisors 只回報空資料庫尚未使用索引的 INFO，待有實際流量後再依 query statistics 評估，不應現在移除必要索引。
- 目前尚未加入 Storage bucket、booking/document、public share RPC；這些仍在 M1 後續或延後範圍。

## 2026-08-28 最終遠端整合

- 可重現 runner：`scripts/supabase-final-smoke.mjs`，需設定 `SUPABASE_URL`、`SUPABASE_PUBLISHABLE_KEY`、`SUPABASE_SMOKE_PASSWORD`；不輸出 access token 或密碼。
- 遠端結果：51/51 checks passed。Owner／Viewer／non-member 的 Trip／Day／Member／Place 讀取分別為可讀、可讀、`200` 零列；Editor 可寫；Viewer／non-member 寫入為 `403 42501` 或 `200` 零列。
- Realtime：Viewer 獨立 session 從 `trip_events` 收到 itinerary `insert, insert, update, update`，涵蓋 insert／update／跨日 reorder；Viewer remote update 為 `200` 零列；invitation events 共 5 筆，payload 無 email／`token_hash`。
- Version RPC：成功為 `200`；stale 改用 PostgREST `PT409`，立即回 `409` 且 hint=`VERSION_CONFLICT`；sort collision 為 `409 23505` 且 hint=`SORT_KEY_CONFLICT`；Viewer 三支 RPC 均 `409 PT409`，無資料變更。
- Invitation：email mismatch `403 42501`；expired/revoked `400 22023`；invalid `400 02000`；valid/retry `200`；Editor 接受 Viewer invitation 後仍是 Editor；anonymous `401 42501`。
- 修正 `20260828083000_allow_trip_delete_owner_cascade.sql`：允許旅程 FK cascade 刪除最後 Owner，並避免 cascade audit event 違反 `trip_events_trip_id_fkey`。
- 修正 `20260828083100_map_version_conflicts_to_http_409.sql`：避免 SQLSTATE `40001` 被 API 層長時間重試，改為穩定 HTTP 409。
- 回歸：pgTAP 18 + 28 = 46/46；Vitest 5 files／13 tests；production build；generated types SHA-256 `C230BCA29485BABF48B3ABE5679D768D77E30E4505F57CAB08DE5AC44DADD49B`。
- 遠端 Advisors：Security 0 errors，唯一 warning 為管理設定 `auth_leaked_password_protection`；Performance 0 errors／0 warnings，5 筆 unused-index INFO 保留，未在低流量階段移除索引。
- Smoke data 已清除：trip `90000000-0000-0000-0000-000000000100` 為 `204`，確認 remaining=0，相關 days/items/members/places/invitations/events 已 cascade 清除。
- Auth 清理：使用者於 2026-08-28 即時核准後，已交易式刪除 `...0001` Owner、`...0002` outsider、`...0003` Editor、`...0004` Viewer；遠端斷言 `auth.users=0`、`auth.identities=0`。
