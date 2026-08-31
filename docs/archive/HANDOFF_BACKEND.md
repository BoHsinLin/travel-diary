# 日韓旅遊規劃 PWA｜後端開發交接

最後更新：2026-08-27 10:27:52 +08:00（Asia/Taipei）  
目前估算：**後端完成度 0%**

> 已確認工作區仍無 Supabase migration 或後端實作。後端是目前關鍵路徑，立即依 `CURRENT_WORK_ASSIGNMENTS.md` 的後端 P0 開工。

## 開工狀態

**GO：可以開始。**

第一個工程里程碑為「Supabase 可從 migration 重建，並讓 Owner／Admin／Editor／Viewer 以 seed 資料驗證 Trip、Day、Itinerary Item、Place 與 Invitation 的 RLS」。預訂、預算、版本與公開分享可在核心權限模型穩定後加入。

開工前需與前端共同提交第一版 shared contract，並以資料庫 generated types 作為後續校正來源；涉及權限的規則以後端 RLS 為最終準則。

## 任務目標

以 Supabase 建立私人邀請制、多角色、Realtime 且可稽核的旅遊協作後端。安全邊界必須由 PostgreSQL RLS 落實，不能只依賴前端隱藏按鈕。

## 第一階段交付

1. 建立 Supabase project 與本地 CLI migration 流程。
2. 啟用 Google OAuth 與 Email magic link，設定正式／預覽 redirect URLs。
3. 建立 schema、indexes、constraints、seed 與 generated TypeScript types。
4. 實作並測試完整 RLS 權限矩陣。
5. 開啟必要資料表的 Realtime publication。
6. 建立 Storage bucket 與文件存取政策。
7. 提供 `.env.example`、本地啟動方式與 migration／seed 指令。

## 建議核心資料模型

### Identity 與旅程

- `profiles(id, display_name, avatar_url, locale, created_at)`
- `trips(id, owner_id, title, timezone, start_date, end_date, default_pace, currency, status, created_at, updated_at)`
- `trip_members(trip_id, user_id, role, status, joined_at)`
- `trip_invitations(id, trip_id, email, role, token_hash, expires_at, accepted_at, invited_by)`
- `trip_days(id, trip_id, date, title, pace_override, sort_order)`

### 行程與景點

- `places(id, owner_scope, name_zh, name_local, country, region, coordinates, address, category, source_url, verified_at, metadata)`
- `place_submissions(id, place_id, submitted_by, payload, review_status, reviewed_by, reviewed_at)`
- `itinerary_items(id, trip_day_id, place_id, type, title, starts_at, ends_at, duration_minutes, is_fixed, sort_key, notes, status, version)`
- `itinerary_dependencies(id, from_item_id, to_item_id, travel_mode, travel_minutes)`
- `favorites(id, trip_id, user_id, place_id, folder_id)`
- `favorite_folders(id, trip_id, name, created_by)`

### 預訂、預算與協作

- `bookings(id, trip_id, type, provider, reference_masked, starts_at, ends_at, metadata, created_by)`
- `booking_documents(id, booking_id, storage_path, document_type, expires_at)`
- `expenses(id, trip_id, itinerary_item_id, paid_by, amount, currency, occurred_at, category, note)`
- `expense_splits(id, expense_id, user_id, amount, settled_at)`
- `change_sets(id, trip_id, actor_id, entity_type, entity_id, action, before_data, after_data, created_at)`
- `deleted_items(id, trip_id, entity_type, entity_id, payload, deleted_by, purge_after)`
- `public_shares(id, trip_id, token_hash, expires_at, revoked_at, visibility_config, created_by)`
- `user_preferences(user_id, default_map_provider, locale, theme, notification_settings)`

實際欄位需經 migration review；JSONB 只放真正可變的供應商 metadata，不應取代可查詢的核心欄位。

## 角色與 RLS 矩陣

| 能力 | Owner | Admin | Editor | Viewer | Public |
|---|---:|---:|---:|---:|---:|
| 讀取一般旅程內容 | ✓ | ✓ | ✓ | ✓ | 依分享設定 |
| 編輯行程與景點 | ✓ | ✓ | ✓ | — | — |
| 邀請／調整角色 | ✓ | ✓ | — | — | — |
| 升級 Admin／移除 Owner | 僅 Owner | — | — | — | — |
| 查看預訂／保險／預算 | ✓ | ✓ | 依政策 | 依政策 | — |
| 建立／停用公開分享 | ✓ | ✓ | — | — | — |
| 刪除旅程 | ✓ | — | — | — | — |

RLS 測試至少涵蓋跨旅程 ID 猜測、被移除成員、過期邀請、過期分享 token 與角色降級後既有 session。

## Realtime 與並行修改

- 訂閱以 `trip_id` 範圍限制，不廣播其他旅程資料
- `itinerary_items.version` 或 `updated_at` 用於 optimistic concurrency
- 拖放排序使用可插入的 `sort_key`，避免每次重寫整天所有列
- 衝突時回傳可辨識錯誤與目前 server version，由前端提示重新載入或合併
- 重要變更寫入 `change_sets`，版本復原應以新的反向 change set 執行，不直接抹除稽核紀錄

## 公開分享與敏感資料

- 只儲存 share token hash；原始 token 僅建立時回傳一次
- 公開資料使用安全 view／RPC，只 select 可公開欄位
- 不可先回傳預訂、保險、預算或私人備註再由前端隱藏
- 文件使用 private bucket 與短效 signed URL
- 明確拒絕護照、信用卡及完整身分證件的上傳類型

## 資料保留

- 一般刪除先軟刪除，`purge_after = deleted_at + 30 days`
- 旅行版本依需求保留至旅程結束後 90 天；到期清理需有排程與日誌
- 分享連結應支援 expiry 與立即 revoke
- 備份與 restore drill 必須在正式上線前完成一次

## Edge Functions／RPC 候選

- `accept_trip_invitation`
- `create_public_share`／`resolve_public_share`
- `apply_itinerary_reorder`
- `resolve_itinerary_conflict`
- `restore_change_set`
- `create_document_signed_url`
- 未來：航班異動擷取、票價追蹤、OCR／Email 匯入

具權限提升的操作應使用 transaction、明確 authorization check 與 audit log。

## 與前端的 API Contract

後端應提供：

- Database generated types
- Query／RPC 名稱、參數、回傳型別與錯誤碼
- Realtime table／事件與 payload 範例
- Auth session、invite、public share 的 sequence 說明
- 分頁方式、搜尋策略與 rate limits
- seed：Owner、Admin、Editor、Viewer、5D4N 首爾旅程

## 測試與完成條件

- migration 可從空資料庫完整重建
- RLS 測試覆蓋所有角色與跨旅程攻擊情境
- 邀請不可重放，過期／撤銷 token 不可使用
- Realtime 僅送達有權限的旅程成員
- 版本復原、30 天軟刪除與 90 天清理規則有測試
- 公開分享回應不包含任何敏感欄位
- service role 僅存在 server-side function／安全 CI secret
- schema、seed、types 與操作說明均納入 repository

## 暫不實作

- 自動航班與船班追蹤
- 社群熱門內容自動蒐集與排名
- OCR／PDF 自動解析與 Email 匯入
- 離線修改的多端衝突合併

上述功能應在 MVP 穩定後另立 threat model、資料來源與成本評估。
