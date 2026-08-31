# 前端資料完整性與 Application Smoke 交付

- 交付時間：2026-08-31 12:59:08 +08:00（Asia/Taipei）
- 指派來源：`FRONTEND_MANAGER.md`，2026-08-31 12:03:04 資料完整性 P0。

## 已完成

1. 移除新增行程的固定日期；現在依選定 `TripDay.date`、使用者選擇的時間與旅程 IANA timezone 轉成 ISO timestamp。
2. 移除固定 `sortKey='z0'`；現在以該日最後排序鍵加 UUID 產生唯一、可排序的 append key。
3. 透過 Owner UI 刪除前一輪錯誤日期 smoke row，再以修正後流程連續新增兩筆。
4. 完成 Owner 持久化、雙分頁 Realtime、登出／受保護路由，以及 Viewer read-only 應用層驗收。

## 驗證

| 項目 | 結果 |
| --- | --- |
| Day 2 日期 | 通過；資料庫 rows 為 `2026-10-10`。 |
| 時區 | 通過；`Asia/Seoul 2026-10-10 14:15` 儲存為 `2026-10-10T05:15:00.000Z`。 |
| 同日連續新增 | 通過；兩筆 sort key 不同且無 23505 collision。 |
| 23505 rollback | 通過；新增單元測試確認還原原行程並呈現 `SORT_KEY_CONFLICT`。 |
| Owner refresh persistence | 通過。 |
| Owner 雙頁籤 Realtime | 通過。 |
| Viewer 唯讀 | 通過；寫入控制皆 disabled。 |
| 登出／ProtectedRoute | 通過；回到 `/login`。 |
| Console | Owner Realtime 與 Viewer 驗證分頁均為 0 error。 |
| Typecheck／Test／Build | 通過；8 test files／28 tests、`pnpm typecheck`、`pnpm build`。 |

## 實際 artifacts

- [Owner、Realtime 與路由證據](../evidence/application-smoke-2026-08-31/owner-realtime-and-route.md)
- [Viewer 唯讀證據](../evidence/application-smoke-2026-08-31/viewer-read-only.md)

## 備註

本機 Day 2 保留兩筆修正後 smoke rows，供經理複驗；未開始 PWA、CI 或部署。
