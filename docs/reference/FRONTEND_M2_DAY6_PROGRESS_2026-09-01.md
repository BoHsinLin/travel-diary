# M2 Day 6 前端交付紀錄（進行中）

- 時間戳：2026-09-01 13:41:42 +08:00（Asia/Taipei）
- 指派來源：`FRONTEND_MANAGER.md` 的 `M2 DAY 6 ACTIVE`。

## 本次已完成

1. 新增 discovery data adapter，只讀 `events`、`canonical_places`、provenance 與 active source；client DTO 不含 raw payload、pipeline、service-role 或管理 audit 欄位。
2. Explore 支援活動／景點模式、搜尋、首爾篩選、已驗證篩選，以及 Loading／Empty／Error／Stale／Unverified 呈現。
3. Event／Place Detail 顯示繁中 fallback、韓文原名、來源 attribution、最後確認時間；活動加入行程使用 `add_event_to_itinerary` RPC、UUID idempotency 和 PT409 conflict state，不覆寫既有行程。
4. Event report 有 success／retry state；因現有 DTO 的 `data_reports` 僅有 required `event_id`，Place report 明確不偽造寫入 contract。
5. Reviewer Queue 先以 `platform_roles` 做 403 gate，所有動作透過 `review_data_item` RPC；未使用 table UPDATE 或 service role。
6. App shell 顯示來源變更通知，只顯示 change kind 並允許 acknowledge；不讀取或顯示 before／after snapshot，也不靜默改寫行程。

## 已驗證

- `pnpm typecheck` 通過。
- `pnpm test -- --run` 通過（既有 9 test files／30 tests）。
- `pnpm build` 通過；新增 Discovery lazy chunk `15.42 kB`（gzip `5.29 kB`）。
- `pnpm check:pwa-cache` 通過。

## 尚未可宣稱完成

- 尚未做 local M2 DTO／RLS browser smoke：本批資料 migration 與 data fixture 為其他角色的未提交工作，且前端依指示不自行套 migration／啟動 ingestion。
- 尚未完成 320／375／430／768／1440 的 Figma 同尺寸截圖、axe、鍵盤／screen reader、200% reflow、safe-area、reduced-motion 實測。
- Reviewer Queue 的真實 reviewer action、Event Add 的成功／PT409，以及 source-change notification 的實際資料需在 local M2 fixture 就緒後驗收。

## 2026-09-01 14:45:00 +08:00 修正紀錄

- Explore 的 Event／Place cursor 現在分別保存最後一筆排序鍵與 `exhausted` 狀態；任一 stream 先耗盡後，不會在「載入更多」時從第一頁重複查詢。
- `verifiedOnly` 改為對兩個資料表皆使用 `trust_level in (official, verified)` 的 server-side 查詢。畫面上的 `stale` 是顯示層依最後驗證時間推導的狀態，不再作為 verified 篩選條件。
- Reviewer dialog 補上失敗提示與重試、initial focus、Tab focus trap、Escape 關閉與觸發按鈕 focus return；佇列載入失敗也可重試。
- 新增 cursor stream 耗盡回歸測試；靜態驗證已通過。此紀錄仍為「進行中」，未宣稱完成 browser／RLS／正式站驗收。

## 2026-09-01 15:10:00 +08:00 修正紀錄

- Reviewer RPC 成功後的訊息改為「審核動作已送出」，不在佇列 refetch 尚未確認成功前宣稱畫面已更新。

## 2026-09-01 15:13:00 +08:00 測試紀錄

- 新增 M2 Detail Event report 成功流程測試，以及 Reviewer RPC 失敗後 retry、initial focus、Escape 關閉與觸發點 focus return 測試。
- `pnpm test --run`：11 test files／36 tests 通過；`pnpm typecheck`、`pnpm build` 與 `git diff --check` 通過。
- 尚缺 local fixture 角色登入後的瀏覽器流程、五個 viewport、axe、screen reader、200% reflow、safe-area、reduced-motion 與 RLS smoke；因此交付維持進行中，不改標 `REVIEW`。

## 2026-09-01 15:16:00 +08:00 Browser 驗收狀態

- 已依瀏覽器驗收流程嘗試開啟 `http://127.0.0.1:5175/trips/trip-001/discover` 與目前監聽的 `http://127.0.0.1:5173/trips/trip-001/discover`。
- 驗收瀏覽器均回報 `ERR_CONNECTION_REFUSED`；因此未產出任何無效截圖，也未將 Explore／Detail／Add／Reviewer／Notifications 標示為 browser passed。

## 2026-09-02 09:00:00 +08:00 修正紀錄

- Explore 改為「全部／活動／景點」三個明確 tabs，任一時刻僅有一個 `aria-selected=true`。
- Filter dialog 採草稿值，新增套用與取消，並具備 initial focus、Tab focus trap、Escape close 與觸發按鈕 focus return。
- 新增 Explore tab／filter keyboard、Add `PT409` conflict、non-reviewer `403` regression tests。交付仍未標示 `REVIEW`，等待完整瀏覽器與角色驗收。

## 2026-09-02 09:25:00 +08:00 核心流程測試紀錄

- 新增 Explore load-more cursor、Add RPC success、Reviewer approved publish、source-change notification acknowledge 行為測試。
- Explore 分頁 append 改為以 `kind:id` 去重，避免資料源重疊時出現重複 React key 或卡片。
- 完整 browser／角色與 RLS 證據尚未具備，故此文件仍維持進行中，不標記 `REVIEW`。

## 2026-09-02 09:35:00 +08:00 真實行為補正

- `listDiscovery` query contract test 驗證 published、scheduled、region、date、category、trust、search 均在 server query 的 limit 前形成。
- Explore 第二頁測試驗證 cursor 後確實 append 新項目，並忽略重複 `kind:id`。
- Reviewer test 覆蓋 pending approve、refetch 回 approved、再 publish；通知 acknowledge 補失敗 alert 與 retry 測試。
- 完整瀏覽器／角色／RWD／a11y 實證仍未完成，交付狀態維持進行中。

## 2026-09-02 09:50:00 +08:00 Browser partial evidence

- Owner 與 Viewer 已透過 local Magic Link 登入；Owner／Viewer Explore 與 Reviewer 403 boundary 皆完成 browser smoke。
- Owner Explore 在 320／375／430／768／1440 無水平 overflow、console error／warning=0；Filter dialog focus/Escape/focus return 實測通過。
- 修正全域 `/reviewer-queue` 被 TripLayout 包住造成的 `/trips/undefined/...` 側欄連結。
- 證據索引：[M2 2026-09-02 evidence](../evidence/m2-frontend-audit-2026-09-02/EVIDENCE.md)。Reviewer seed、可保存 screenshot、browser axe／screen reader／200%／safe-area／reduced-motion 與具資料的 mutation smoke 仍缺，故不標記 `REVIEW`。

## 已知 contract 缺口

`data_reports` 的 generated DTO 只有 required `event_id`，無 `place_id` 或 entity-kind discriminator。因此 Place Detail 不會偽造提交 report；若產品需支援 Place report，須由後端提供明確的擴充 contract，再接續實作。
