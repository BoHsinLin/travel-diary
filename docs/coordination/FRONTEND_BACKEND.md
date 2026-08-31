# 前端 ↔ 後端｜協作通道

最後更新：2026-08-31 11:43:24 +08:00（Asia/Taipei）

## 此文件處理什麼

- shared contracts、database generated types
- query／mutation／RPC、分頁、搜尋、錯誤碼
- Auth、RLS、Realtime、optimistic concurrency
- 環境變數名稱、seed 與測試資料

Figma 或純視覺問題不要寫在這裡。

## 共同 contract v0.1

必須包含：`Role`、`Trip`、`TripMember`、`TripDay`、`ItineraryItem`、`Place`、`Invitation`、`SyncState`、`AppError`、`PageResult<T>`。

共同規則：

- 時間：ISO 8601；旅程保存 IANA timezone。
- 金額：integer minor unit 或 decimal string。
- 排序：可插入的 `sort_key`。
- 並行：`version` 或 `updated_at`，衝突需回標準錯誤。
- 權限：前端 guard 只管體驗，RLS 是安全邊界。
- 公開資料不得先載入敏感欄位再由 CSS 隱藏。

## 後端交付前端

- [ ] migration 路徑與重建指令
- [ ] generated TypeScript types
- [ ] RLS matrix 與測試結果
- [ ] RPC／錯誤碼／Realtime payload 範例
- [ ] Auth redirect URLs 與公開環境變數名稱
- [ ] 首爾 5D4N seed 與四角色測試情境

## 前端交付後端

- [ ] 每頁 query／mutation 清單
- [ ] optimistic update／rollback 需求
- [ ] 搜尋、排序、分頁參數
- [ ] 離線快取範圍與敏感資料排除清單
- [ ] domain model ↔ database types mapping

## 決策與問題格式

```md
### YYYY-MM-DD HH:mm:ss +08:00｜FE/BE｜DEC/TODO/BLOCKED
- ID：DEC-YYYY-MM-DD-NN
- 主題：
- 現況／證據：
- 建議：
- 需要誰在何時前回覆：
- 決議／交付位置：
```

## 更新紀錄

### 2026-08-31 11:43:24 +08:00｜經理｜ACCEPTED／FRONTEND ACTIVE

- 驗收：接受 `DEC-2026-08-31-03` 與 startup preflight；後端 local recovery 工作完成並停止。
- 獨立證據：`start-local.ps1 -Status` exit 0；主要 health 全綠；Auth seed 8/8；typecheck、25 tests、build 通過。
- 保留 warning：Storage disabled 下非必要 vector container restarting；不阻塞目前 M1，後續基礎設施整理時決定停用或修正設定。
- 工序：後端 WAIT；前端唯一 active，接續 Owner persistence、Viewer read-only、雙頁籤 Realtime 與登出／protected route application smoke。

### 2026-08-31 11:40:22 +08:00｜後端｜REVIEW

- ID：DEC-2026-08-31-04
- 主題：LOCAL SUPABASE RECOVERY 與 LOCAL STARTUP PREFLIGHT 完成交付。
- Recovery：Docker Engine 正常但 local containers/volumes 全空；依授權以 CLI 2.115.0 建立 local-only stack，`db reset --local` 完整套用七支 migrations 與 Auth seed，未觸碰遠端 project/Auth。
- Ports/health：API/Auth/Realtime gateway `55431`、DB `55432`、Analytics `55433`、Studio `55434`、shadow reserved `55435`、Mail `55436`；主要 containers healthy，Auth/API/Studio/Mail HTTP 200，DB `pg_isready`。`55435` 日常無 listener 為正常。
- Startup preflight：新增 `scripts/start-local.ps1`。預設只安全恢復既有 volume；`-Status` 唯讀；volume 缺失預設停止；`-Initialize` 才可建立；`-Reset` 要求二次文字確認；不覆寫 `.env.local`、不輸出 keys。
- 模擬證據：existing healthy exit 0、Docker unavailable exit 20、port occupied exit 30、volume missing exit 40；失敗路徑均未 reset/刪除資源。停止後預設重啟沿用 `supabase_db_travel-planner-pwa`，seed trip count=1，Auth smoke 8/8。
- 回歸：pgTAP 46/46；序列化 DB lint 零錯誤；types hash `C230BCA29485BABF48B3ABE5679D768D77E30E4505F57CAB08DE5AC44DADD49B`。
- Warning：CLI 2.115.0 回報 `[inbucket]` deprecated；Storage 停用時非必要 vector container restarting。API/Auth/DB/Realtime/Studio/Mail 均不受影響。
- 文件：新增 `docs/backend/LOCAL_DEVELOPMENT_STARTUP.md`，README 已加入入口。狀態 REVIEW，後端停止，前端維持 WAIT。

### 2026-08-31 10:56:05 +08:00｜經理→後端｜ACTIVE／LOCAL SUPABASE RECOVERY

- ID：DEC-2026-08-31-03
- 環境證據：Docker Server 正常，但 containers／volumes 均為空，5543x 無 listener；舊 local DB volume 已不存在，無法原地恢復。
- 授權：允許重新建立「本機」Supabase database／volume 並套用既有 migrations／seed；不得觸碰遠端 project 或遠端 Auth users。
- 執行：依 `config.toml` 的 55431–55436 啟動 local stack；執行 reset，確認 migrations／seed；重跑 Auth seed 8/8、pgTAP 46/46、lint，以及 API/Auth/DB/Realtime/Studio/Mail port health。
- 回報：列出實際 ports、容器 health、Auth smoke、DB tests 與任何 warning；完成後 `REVIEW` 並停止，前端維持 WAIT。

### 2026-08-31 10:58:20 +08:00｜經理→後端｜P0／LOCAL STARTUP PREFLIGHT

- 目的：避免每次 Windows／Docker 重開機時誤把「服務停止」當成「資料庫遺失」，也避免工程師習慣性執行具破壞性的 `db reset`。
- 建立 `scripts/start-local.ps1`，由專案根目錄執行；預設模式只能做 Docker Engine、CLI、55431–55436 port、container／volume、Supabase health 與 `.env.local` URL 一致性檢查，並安全啟動既有 local stack。
- 腳本不得在預設模式執行 `db reset`、刪除 container／volume、覆寫 `.env.local` 或輸出 anon／service-role keys。
- 如果 volume 不存在，預設應停止並清楚回報；只有明確 `-Initialize` 才能建立本機 stack／套用 migrations／seed。只有明確 `-Reset` 且二次確認後才允許清空並重播 local database。
- 支援 `-Status` 唯讀檢查；每個失敗分支需給可操作訊息與非零 exit code。Docker Desktop 未啟動、port 被占用、CLI 不可用、env URL 不一致、容器 unhealthy、volume 缺失必須可區分。
- 建立 `docs/backend/LOCAL_DEVELOPMENT_STARTUP.md`，說明日常開機、首次建立、異常恢復、明確 reset、資料持久化與「不得影響遠端」邊界；README 加入入口連結。
- 驗收：模擬至少 existing healthy、Docker unavailable、port occupied、volume missing 四條路徑；實際重開 local stack 後資料仍存在，Auth smoke 8/8。完成後與 `DEC-2026-08-31-03` 一起回報 REVIEW。

### 2026-08-31 09:53:49 +08:00｜經理｜BACKEND ACCEPTED／WAIT

- 驗收：接受 `DEC-2026-08-31-02`；seed user／identity、Auth smoke 與文件符合完成定義。
- 獨立證據：local Auth smoke 8/8；Admin API 四人、Owner／Viewer HTTP 200、固定 user ID／JWT `sub` 全部正確。
- 回歸：typecheck、7 files／25 tests、build、types hash 全通過；遠端 Auth 未修改。
- 工序：後端停止並 WAIT；現在只啟動前端 application smoke。若前端發現可重現 schema／RLS 缺陷，再透過本文件回報。

### 2026-08-31 09:27:33 +08:00｜後端｜REVIEW

- ID：DEC-2026-08-31-02
- 主題：LOCAL AUTH SEED REPAIR 完成交付。
- 修正：`supabase/seed.sql` 補齊四角色 GoTrue user 欄位與 email `auth.identities`，固定 UUID 與密碼 `password` 不變；不依賴 Dashboard 手動建帳號，未修改遠端 Auth。
- 可重現驗證：新增 `scripts/local-auth-seed-smoke.mjs`，使用本機 status 提供的 anon/service-role keys；Admin API 斷言四人，Owner／Viewer password grant 與 JWT `sub` 斷言固定 UUID，全程不輸出 key 或 token。
- 證據：CLI 2.115.0 `db reset --local` 成功；Auth smoke 8/8；pgTAP 18+28=46/46；`db lint --local --level error --fail-on error` 零錯誤；types SHA-256 `C230BCA29485BABF48B3ABE5679D768D77E30E4505F57CAB08DE5AC44DADD49B` 無漂移。
- 決議／交付位置：`supabase/seed.sql`、`scripts/local-auth-seed-smoke.mjs`、`docs/backend/SUPABASE_DELIVERY.md`。狀態 REVIEW，後端停止，等待經理接受後再啟動前端 application smoke。

### 2026-08-31 09:18:35 +08:00｜經理→後端｜ACTIVE／LOCAL AUTH SEED REPAIR

- ID：DEC-2026-08-31-01
- 缺陷：CLI `2.115.0` reset、migration、seed 與容器重啟成功，但 Owner／Viewer password grant 為 `400 invalid_credentials`，service-role Auth Admin users 為 `200 []`。
- P0-1：修正四角色 local Auth seed，使 `owner/admin/editor/viewer@example.com`、密碼 `password` 可由 GoTrue password grant 登入；建立目前 local GoTrue 所需的 user 與 identity fixture，不得依賴手動 Dashboard 建帳號。
- P0-2：新增可重現 Auth seed smoke，自動斷言 Admin API 列出四人、Owner／Viewer password grant 成功、JWT `sub` 與既定 UUID 相符；不得輸出 token 或 service-role key。
- P0-3：重跑 `db reset --local`、46 項 DB tests、Auth seed smoke與 generated types hash；不要修改遠端 Auth users。
- 完成定義：後端 `REVIEW` 並停止；經理接受後才重新啟動前端 application smoke。

### 2026-08-28 17:27:48 +08:00｜經理→前端｜FINAL APPLICATION VERIFICATION

- Backend contract mapper 程式已接受；後端保持 WAIT，不需新增遠端帳號或 schema。
- 前端以 local seed Owner／Viewer 驗證 UI→repository→local Supabase 完整路徑，避免遠端 smoke users 已清理後又建立永久 fixture。
- 必驗：Owner 編輯與刷新持久化、Viewer read-only、PT409／sort conflict rollback、雙頁籤 Realtime、登出／protected route。
- 若 local 環境阻塞，必須附 `supabase status/start/reset` 與 Vite 的實際錯誤；前端不得以未建立 listener 或缺 `.env` 當作未嘗試的阻塞理由。

### 2026-08-28 17:15:42 +08:00｜經理｜BACKEND ACCEPTED／FRONTEND ACTIVE

- ID：DEC-2026-08-28-11
- 驗收：接受 `DEC-2026-08-28-10`；51/51 remote smoke、46/46 pgTAP、13/13 Vitest、build、types hash、Advisors 與 smoke cleanup 證據完整。後端停止並 WAIT。
- Contract 變更：version stale 現為 `HTTP 409 + code=PT409 + hint=VERSION_CONFLICT`；sort collision 為 `HTTP 409 + code=23505 + hint=SORT_KEY_CONFLICT`。前端不得只檢查 `error.message`。
- 前端任務 1：建立集中式 `mapSupabaseError`／typed AppError，依 `code`、`hint`、HTTP status 映射 `VERSION_CONFLICT`、`SORT_KEY_CONFLICT`、`FORBIDDEN_ROLE`、`NOT_FOUND`、`AUTH_REQUIRED`；未知錯誤保留安全 fallback。
- 前端任務 2：讓 Supabase Itinerary／Trip repositories 全部使用同一 error mapper；Planner 的 conflict／rollback／retry UI 必須分辨 stale、sort conflict、離線與權限拒絕。
- 前端任務 3：補單元／整合測試，直接以 `{code:'PT409',hint:'VERSION_CONFLICT'}`、`{code:'23505',hint:'SORT_KEY_CONFLICT'}`、`42501` 驗證 UI sync state 與 rollback。
- 前端任務 4：以正式 Supabase 設定做 application-level smoke：登入返回、旅程列表、Today、Planner 編輯／重新整理持久化、Viewer read-only、兩個頁籤 Realtime；不得建立未規劃且未清理的永久帳號。
- 完成定義：typecheck、tests、build、四條核心路由與錯誤狀態證據；回報 REVIEW 後停止。PWA／CI 暫不與本批平行。

### 2026-08-28 17:12:48 +08:00｜後端｜DONE

- ID：DEC-2026-08-28-10
- 主題：FINAL INTEGRATION 清理完成，後端交付結案。
- 核准與執行：使用者已即時核准刪除四個 Auth 測試帳號；已在單一 transaction 中刪除 `...0001`、`...0002`、`...0003`、`...0004`。
- 驗證：同 transaction 斷言固定 namespace 的 `auth.users=0`、`auth.identities=0`；先前 smoke trip 與所有 namespaced data 已為零筆。
- 決議：`DEC-2026-08-28-08` 所有交付與清理完成。狀態 DONE，後端停止工作並交由經理驗收。

### 2026-08-28 16:54:47 +08:00｜後端｜REVIEW

- ID：DEC-2026-08-28-09
- 主題：FINAL INTEGRATION 完成交付，等待 Auth users 清理核准。
- 遠端證據：可重現 smoke runner `scripts/supabase-final-smoke.mjs` 共 51/51；authenticated REST/RLS、雙 session `trip_events` Realtime、Viewer remote update 零列、三支 version RPC success/stale/sort collision/Viewer deny、invitation 全分支與脫敏均通過。
- 修正：新增 `20260828083000_allow_trip_delete_owner_cascade.sql`，修復刪旅程時 final-owner trigger 與 cascade audit FK 阻擋；新增 `20260828083100_map_version_conflicts_to_http_409.sql`，stale RPC 由會被 API 重試的 `40001` 改為 `409 PT409` + `VERSION_CONFLICT`。
- 回歸：pgTAP 46/46、前端 13/13、production build、types hash `C230BCA29485BABF48B3ABE5679D768D77E30E4505F57CAB08DE5AC44DADD49B`。
- Advisors：Security 僅管理設定 `auth_leaked_password_protection` WARN；Performance 0 errors／0 warnings，5 unused-index INFO 保留。
- 清理：smoke trip `...0100` 已 REST DELETE `204` 且 remaining=0，所有 namespaced data 已 cascade 清除。Auth users `...0001`、`...0002`、`...0003`、`...0004` 尚保留；刪除前依任務要求取得使用者即時核准。
- 決議／交付位置：`docs/backend/SUPABASE_DELIVERY.md`、`scripts/supabase-final-smoke.mjs`、兩支新增 migrations。狀態 REVIEW，後端停止修改。

### 2026-08-28 16:21:03 +08:00｜經理→後端｜ACTIVE／FINAL INTEGRATION

- ID：DEC-2026-08-28-08
- 工序狀態：前端 M1 adapters 已通過；現在只啟動後端工程師，前端與 Figma 均 WAIT。
- 任務 1：以 publishable key 與 authenticated Owner／Viewer／non-member 實測 REST：Trip／Day／Member／Place 讀取、Owner／Editor 可寫、Viewer／non-member 禁寫或零列；記錄 HTTP、PostgREST code 與 RLS 結果。
- 任務 2：使用兩個獨立 authenticated sessions 驗證 itinerary insert／update／reorder 後另一 session 收到 Realtime；payload 不得含 invitation email／token hash，remote update 不可越權。
- 任務 3：實測 `update_trip_with_version`、`update_trip_day_with_version`、`update_itinerary_item_with_version`：正常更新、stale `VERSION_CONFLICT`、sort collision `SORT_KEY_CONFLICT`、Viewer deny。
- 任務 4：實測 invitation valid／expired／revoked／email mismatch／retry；確認角色不降級，anonymous 無 execute 權限。
- 任務 5：重跑遠端 Security／Performance Advisors；`auth_leaked_password_protection` 要記錄為需管理設定的 WARN，unused-index INFO 不可在空資料庫階段誤刪必要索引。
- 任務 6：盤點兩個臨時 auth users `90000000-0000-0000-0000-000000000001`／`...0002` 與本輪新增 smoke data。完成 smoke 後先回報精確清理清單；刪除 Auth users 前取得使用者即時核准，其他可由明確 test namespace／IDs 安全辨識的 smoke rows 依既定測試清理流程移除。
- 驗收門檻：保留可重現的指令／結果；local 46 SQL tests、lint、generated types hash 與前端 13 tests／build 不回歸；更新 `SUPABASE_DELIVERY.md` 後回報 REVIEW 並停止。

### 2026-08-28 16:13:13 +08:00｜經理→前端｜FINAL DATA ADAPTER P0

- 後端 schema／generated types 維持已接受且 WAIT；本批仍只允許前端修改。
- 前端需依既有 `trips`、`trip_days`、`trip_members`、`places` schema 建正式 read repositories，並透過 factory 在 Supabase／mock demo 間選擇。
- `queries.ts` 不得直接依賴 mock；UI 不得散落 Data API query；row mapping、nullable 欄位與錯誤需集中處理。
- Budget／expenses 為 M1 暫緩，可保持 mock；不得因此阻擋 Trip／Day／Member／Place 正式資料流。
- 前端完成並由經理驗收後，才啟動後端做 authenticated REST、兩 session Realtime、Viewer 禁寫、expected-version conflict、邀請與臨時使用者清理。

### 2026-08-28 14:52:27 +08:00｜經理→後端｜CORE_ACCEPTED／WAIT

- ID：DEC-2026-08-28-07
- 驗收結論：接受 M1 後端核心，解除後端單人工序鎖；後端停止修改並進入 WAIT，下一位為 Figma 設計師。
- 本輪獨立驗證：重建後 `rls_matrix.sql` 18 項、`rpc_contracts.sql` 28 項，共 46／46 通過；`db lint --level error --fail-on error` 為零錯誤；TypeScript、Vitest 3 files／5 tests、production build 通過；generated types SHA-256 為 `C230BCA29485BABF48B3ABE5679D768D77E30E4505F57CAB08DE5AC44DADD49B`。
- 遠端唯讀驗證：五支 migration 存在；七張 public tables 全部啟用 RLS；private security-definer helpers 均使用空 `search_path`；公開邀請與 version RPC 為 security-invoker／authenticated-only；anonymous 不可執行修改 RPC。
- 非阻塞保留：authenticated publishable-key REST member／non-member smoke 尚未完成；兩個無 smoke trip 的臨時 auth users 尚待清理；Security Advisor 有 `auth_leaked_password_protection` WARN；空資料庫的 unused-index INFO 不刪除必要索引。
- 最後後端整合回合：先取得刪除授權再清理兩個臨時 auth users，完成 authenticated REST smoke、雙 session Realtime、Viewer 禁寫、version conflict 與遠端 advisors；不得在 Figma 工作期間平行修改。

### 2026-08-28 14:28:39 +08:00｜後端｜BLOCKED

- ID：DEC-2026-08-28-06
- 主題：經理 P0 修正已完成本機驗收並推送遠端；authenticated REST smoke 與測試帳號清理被 Codex 使用額度阻塞。
- 已完成：新增 `20260828051640_complete_m1_rpc_and_data_api.sql`，過期／撤回邀請改為只回錯且不宣稱持久化；消除輸出欄位歧義；接受邀請只升級或維持 membership，禁止低角色邀請降級既有角色；所有 private security-definer functions 使用空 `search_path` 與 schema-qualified references；明確設定 Data API table／view／sequence／function grants 與 default privileges。
- 測試證據：新增 `supabase/tests/rpc_contracts.sql`；`rls_matrix.sql` 18 項與 RPC contracts 28 項，共 46／46 通過。覆蓋成功接受、同人重試、email mismatch、expired、revoked、invalid token、anonymous、角色不降級、trip/day matching/stale version、itinerary sort collision、Viewer／anonymous RPC 禁寫。
- 驗收證據：`supabase db reset --local` 通過；`db lint --local --level error --fail-on error` 回 `No schema errors found`；local advisors 回 `No issues found`；generated types 前後 SHA-256 均為 `C230BCA29485BABF48B3ABE5679D768D77E30E4505F57CAB08DE5AC44DADD49B`，無漂移。
- 遠端證據：第五支 migration `complete_m1_rpc_and_data_api` 已成功套用至 `mgxsjobicqyddoaejqvf`。publishable-key anonymous REST：讀 trips 回 `200 []`，寫 trips 與呼叫 invitation RPC 均回 `401`。
- 阻塞與清理：為 authenticated REST smoke 暫建 `backend-owner@travelplanner.test`（ID `90000000-0000-0000-0000-000000000001`）及 `backend-outsider@travelplanner.test`（ID `90000000-0000-0000-0000-000000000002`）與對應 identities；尚未建立 smoke trip。Auth fixture 欄位補正與刪除操作被 Supabase 連接器以 Codex 使用額度限制拒絕，下一輪必須優先刪除這兩個 auth users（identity 會一併刪除）或完成 smoke 後立即清理。
- 需要誰回覆：環境／帳戶負責人恢復 Codex 使用額度；後端再完成 authenticated member write/read、non-member zero-row REST smoke、清理兩個測試帳號、遠端 advisors，然後回報 REVIEW。Figma 與前端維持 WAIT。

### 2026-08-28 13:11:16 +08:00｜經理→後端｜CHANGES_REQUESTED／ACTIVE

- ID：DEC-2026-08-28-05
- 驗收結論：後端已從「尚未建置」進展為「核心可運作、尚有 P0 修正」；不接受 `DEC-2026-08-28-04` 的最終 DONE，後端仍是唯一 active 工作流。
- 本輪獨立通過：Supabase local status 正常；`supabase test db --local` 18／18；TypeScript；Vitest 3 files／5 tests；production build。
- 本輪獨立失敗：`supabase db lint --local --level error` 在 `private.accept_trip_invitation_impl` 回 `42702 column reference "status" is ambiguous`，位置為過期邀請更新分支。現有 18 tests 沒有執行該分支。
- P0 修正 1：修正過期邀請 SQL 的欄位歧義，並決定一致 transaction 語意；目前函式先 `update status='expired'` 再 `raise exception`，exception 會回滾該 update，文件卻宣稱會標記 expired。必須改為「只回錯且不宣稱持久化」或「提交 expired 狀態後回傳可辨識結果」。
- P0 修正 2：新增 invitation RPC tests：成功接受、同人重試、email mismatch、expired、revoked、無效 token、anonymous；驗證 membership 角色不會被較低權限邀請意外降級。
- P0 修正 3：補 `update_trip_with_version`、`update_trip_day_with_version`、itinerary sort-key collision、Viewer／anonymous RPC 禁寫測試；目前只有 itinerary matching/stale version 被覆蓋。
- P0 修正 4：依 Supabase 官方安全建議，所有 `SECURITY DEFINER` 使用空 `search_path` 並完整 schema-qualified；重新檢查從 public 移至 private 的 helper 與 invitation implementation，不能只靠所在 schema。
- P0 修正 5：新 Supabase 專案可能不再自動將新表暴露給 Data API；migration 必須明確定義 anon／authenticated 的 table、view、sequence、function privileges，並用 REST／publishable key smoke test 證明前端所需讀寫可達、非成員不可達。
- 驗收門檻：上述 tests 全通過；`db lint --level error` 回零 issues；重新 reset 後 generated types 無漂移；更新 `SUPABASE_DELIVERY.md` 移除與實際 transaction 不符的敘述。
- 完成後：回報 REVIEW，等待經理重驗；Figma 與前端繼續 WAIT。

### 2026-08-28 13:05:19 +08:00｜後端｜DONE

- ID：DEC-2026-08-28-04
- 主題：M1 Supabase 後端完成本機與遠端驗收。
- 現況／證據：Docker 已恢復；`supabase db reset --local` 可從空資料庫重播四支 migration 與 seed，`supabase test db --local` 18／18 通過，local advisors 為 `No issues found`。正式 generated types 已由 CLI 覆蓋暫定版本；TypeScript、3 files／5 tests、production build 通過。
- 遠端交付：已於 `bolin company` 建立 `travel-planner-pwa`，project ref `mgxsjobicqyddoaejqvf`，region `ap-northeast-1`；四支 migration 已套用，7 張 public tables 全部啟用 RLS，Security Advisors 無 lint，anonymous 可執行的 public security-definer function 為 0。
- 安全補強：新增 `20260828050122_harden_function_exposure.sql`，將 privileged RLS helper 與 invitation implementation 移至 `private` schema，公開 RPC 使用 security-invoker wrapper，並補齊 foreign key indexes。
- 前端連線：公開 URL、publishable key 與 project ref 已更新於 `.env.example`；未寫入任何 service-role／secret key。
- 決議／交付位置：`docs/backend/SUPABASE_DELIVERY.md`、`supabase/migrations/`、`supabase/tests/rls_matrix.sql`、`supabase/types/database.types.ts`。後端 P0 完成，等待經理驗收。

### 2026-08-28 09:49:24 +08:00｜後端｜REVIEW／BLOCKED

- ID：DEC-2026-08-28-03
- 主題：M1 後端安全補強、RPC 與 RLS 真實矩陣測試草案已交付；local reset 仍被 Docker daemon 阻塞。
- 現況／證據：新增 `supabase/migrations/202608280002_m1_security_rpc_rls.sql`，修正 invitation event log 脫敏、owner/admin membership integrity、`current_day_id` 同旅程檢查、邀請接受 RPC、expected-version RPC 與 category constraint validate。`supabase/tests/rls_matrix.sql` 已重寫為 Owner／Admin／Editor／Viewer／anonymous 真實行為測試。`supabase/seed.sql` 已將 legacy `culture` 改為 `heritage`。
- 驗證：使用 bundled Node 執行 `tsc -b` 通過；Vitest 3 files／5 tests 通過；Vite production build 通過。`docker --context default version` 顯示 Client 29.7.2，但無法連到 `//./pipe/docker_engine`，因此 `supabase db reset --local`、`supabase test db` 與正式 generated types 尚未執行。
- 需要誰在何時前回覆：環境負責人或 PM 啟動／修復 Docker Desktop daemon；後端即可重跑 reset、DB tests 與 `supabase gen types typescript --local`。
- 決議／交付位置：交付文件已更新於 `docs/backend/SUPABASE_DELIVERY.md`；此回合停在 REVIEW／BLOCKED，等待 PM 驗收與 Docker 修復。

### 2026-08-28 09:40:39 +08:00｜經理→後端｜ACTIVE／P0

- ID：DEC-2026-08-28-02
- 主題：後端 M1 安全與可重建驗收；本回合為唯一 active 工作流。
- 現況／證據：核心 schema、seed、暫定 types 與 icon category migration 已存在；前端 typecheck、3 files／5 tests、build 通過。但本機找不到 Docker CLI／Docker Desktop 常見安裝路徑，Supabase reset 未驗證。
- 必做 1（敏感資料）：修正 `log_trip_event()`，禁止把 invitations 的 `token_hash`、email 或其他敏感欄位寫入所有成員可讀的 `trip_events.payload`；補 SQL test 證明不可讀取秘密。
- 必做 2（角色完整性）：admin 不得建立／指派／竄改 owner；不得刪除或降級最後一位 owner。若需要轉移 owner，建立明確 transaction／RPC 與測試。
- 必做 3（邀請接受）：建立 security-definer RPC，以不可逆 token hash、期限、狀態與登入者 email 驗證邀請；接受動作須原子化、可安全重試，且不得讓 client 直接取得 token hash。
- 必做 4（並行控制）：為旅程／日程／行程更新與排序定義 `expected_version` 流程；受影響列為 0 時回可辨識的 `VERSION_CONFLICT`，sort key collision 回 `SORT_KEY_CONFLICT`。只有 trigger 自動 `version + 1` 不算完成。
- 必做 5（參照完整性）：限制 `trips.current_day_id` 必須屬於同一 trip；補跨旅程 day 被拒絕的測試。
- 必做 6（RLS 實測）：重寫 `rls_matrix.sql`，實際切換 Owner／Admin／Editor／Viewer／anonymous，驗證 select／insert／update／delete，不得只用 `has_policy()`。
- 必做 7（category 與 types）：清理 legacy `places.category`、執行 `VALIDATE CONSTRAINT places_category_code_check`；local reset 成功後以 CLI 重新產生 `supabase/types/database.types.ts`，不可手改冒充 generated output。
- 必做 8（交付）：更新 `docs/backend/SUPABASE_DELIVERY.md`，附 reset、SQL tests、generated types、RPC input/output、Realtime payload 脫敏與已知限制。
- 驗收門檻：migration 從空 DB 重建；seed 成功；角色矩陣與敏感資料測試全過；generated types 無漂移；不得破壞現有 TypeScript tests／build。
- 阻塞規則：若 Docker 仍不存在，先完成可靜態完成的 migration／test／文件草案，然後以 `BLOCKED` 回報精確環境缺口；未經使用者同意不得自行安裝 Docker 或修改系統設定。
- 完成後：停止工作，等待經理驗收；不要直接叫 Figma 或前端開始。

### 2026-08-28 09:36:30 +08:00｜FE/BE｜REVIEW

- 主題：Travel Icon Contract v1 與 category 寫入約束。
- 交付：`src/contracts/icons.ts` 定義 74 個前端／Figma stable keys；`normalizeItineraryCategory` 將未知後端值轉成 `generic`。
- DB migration：`supabase/migrations/202608280001_icon_category_contract.sql` 使用 `NOT VALID` check，立即限制新資料為 20 個 `ItineraryCategory` codes，但不改寫或拒絕既有 legacy rows。
- 邊界：UI action／utility SVG 不進資料庫；後端只傳 category、sync、permission、conflict 等語意狀態，前端負責 icon 與 i18n label。
- 後續：清理 legacy category 後執行 `VALIDATE CONSTRAINT places_category_code_check`；Supabase reset 恢復後納入 SQL tests。
- 驗證：TypeScript、3 files／5 tests、production build 通過。

### 2026-08-27 16:28:31 +08:00｜FE/BE｜TODO

- ID：DEC-2026-08-27-06
- 主題：行程分類 icon 不得由景點名稱推測，需要穩定 category contract。
- 現況／證據：前端 Today Timeline 目前以 `item.title.slice(-1)` 顯示「宮／湯／屋」；資料庫已有 `places.category` text，可作為來源但尚未定義允許值與 fallback。
- 建議：後端與前端共用 `ItineraryCategory` code：`heritage | food | neighborhood | cafe | shopping | nature | museum | activity | hotel | airport | flight | train | subway | bus | walk | taxi | ferry | ticket | reservation | generic`。既有或未知資料回傳 `generic`，顯示名稱另做 i18n，不把中文文案當 code。
- 需要誰在何時前回覆：後端於下一次 contract review 確認 DB constraint／migration 與 generated types；前端確認 Place／ItineraryItem mapping。
- 決議／交付位置：視覺 variant 定義寫於 `docs/coordination/FRONTEND_FIGMA.md`；資料 contract 僅在本通道決議。

### 2026-08-27 12:11:29 +08:00｜BE｜BLOCKED

- ID：DEC-2026-08-27-05
- 主題：Docker Desktop 開啟後重試 Supabase local reset，仍卡在 Docker daemon API 500。
- 現況／證據：`pnpm dlx supabase db reset --local` 已重新執行；Supabase CLI 可啟動，但 inspect `supabase_db_travel-planner-pwa` 時 Docker API 回 500。`docker version`、`docker ps` 在 `desktop-linux` 與 `default` context 都回 500，API route 包含 `dockerDesktopLinuxEngine` 與 `docker_engine`。
- 建議：重新啟動 Docker Desktop，確認 Docker Desktop UI 顯示 Engine running；必要時執行 Docker Desktop Troubleshoot 的 Restart / Reset Kubernetes 不需要；完成後先用 `docker version` 應取得 Server 區塊，再重跑 Supabase reset。
- 需要誰在何時前回覆：環境負責人或經理確認 Docker daemon 正常；後端可立即接續 `pnpm dlx supabase db reset --local`。
- 決議／交付位置：後端交付物不變；目前阻塞是本機 Docker daemon 健康狀態。

### 2026-08-27 11:48:26 +08:00｜BE｜BLOCKED

- ID：DEC-2026-08-27-04
- 主題：開始執行 Supabase migration 驗收，但本機 Docker daemon 不可用。
- 現況／證據：Supabase CLI 可透過 `pnpm dlx supabase` 執行，版本 `2.115.0`；執行 `pnpm dlx supabase db reset --local` 失敗於 Docker API：`dockerDesktopLinuxEngine` pipe 不存在，推定 Docker Desktop 未啟動或未安裝。
- 建議：啟動或安裝 Docker Desktop 後重跑 `pnpm dlx supabase db reset --local`；接著執行 DB tests 並用正式 CLI generated types 覆蓋 `supabase/types/database.types.ts`。
- 需要誰在何時前回覆：經理或開發環境負責人於下一檢查點確認 Docker Desktop 可用。
- 決議／交付位置：後端已先完成人工 SQL review 並修正 initial owner membership RLS；現有專案驗證 `pnpm typecheck`、`pnpm test`、`pnpm build` 均通過。

### 2026-08-27 11:45:21 +08:00｜BE｜REVIEW

- ID：DEC-2026-08-27-03
- 主題：後端 M1 Supabase 第一批交付，解除前端等待 schema／types／RLS 草案的主要阻塞。
- 現況／證據：已新增 `supabase/config.toml`、`supabase/migrations/202608270001_m1_core_schema.sql`、`supabase/seed.sql`、`supabase/tests/rls_matrix.sql`、`supabase/types/database.types.ts`、`.env.example`、`docs/backend/SUPABASE_DELIVERY.md`；TypeScript typecheck 使用 bundled Node/pnpm 通過。
- 建議：前端先用 `supabase/types/database.types.ts` 對齊 adapter mapping；正式 Supabase project 建立後，後端再以 CLI 重新產生 types 覆蓋手寫版。
- 需要誰在何時前回覆：前端於下一檢查點確認欄位命名與 query/mutation 是否足夠；經理確認是否接受此批進入 Supabase CLI reset 驗收。
- 決議／交付位置：`docs/backend/SUPABASE_DELIVERY.md` 記錄重建指令、RLS matrix、Realtime payload、錯誤碼、Auth redirect URLs 與 seed 測試帳號。阻塞：目前本機 PATH 無 `supabase` CLI，尚未執行 `supabase db reset` 與 SQL tests。

### 2026-08-27 10:59:24 +08:00｜FE｜TODO

- ID：DEC-2026-08-27-02
- 主題：前端 domain contract 與 mock adapter 已擴充，等待 database types 對齊。
- 現況／證據：`src/contracts/entities.ts` 已含共同 contract、ISO 8601／IANA timezone、`sortKey`、`version`；`src/repositories/interfaces/*` 與 mock adapters 已可完成 add／reorder 垂直切片，測試 3/3 通過。
- 建議：後端交付 generated TypeScript types、RLS matrix、Auth redirect URLs 後，再新增 Supabase adapter；前端不先建立假 DB DTO。
- 需要誰在何時前回覆：後端於下一 M1 檢查點回覆 schema mapping 與 types 路徑。
- 決議／交付位置：待後端回覆；前端暫以 `src/contracts/` 為 domain boundary。

### 2026-08-27 10:33:13 +08:00｜經理｜TODO

- 後端尚未建立 Supabase 實作。
- 後端先提交 migration＋generated types；前端在此之前只擴充 domain contract，不建立假 DB DTO。
- 下一檢查點：核心七表、RLS 草案與 seed 可重建。
