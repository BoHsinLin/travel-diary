# Owner、Realtime 與受保護路由結構化證據

- 產生時間：2026-08-31 12:30:45 +08:00（Asia/Taipei）
- 本機 URL：`http://127.0.0.1:5175`
- 目標 Day：`20000000-0000-0000-0000-000000000002`（Day 2 Seoul Classic，日期 `2026-10-10`）

## Owner 寫入前

Day 2 只有：

1. `Gyeongbokgung Palace`，`09:30`，`a0`
2. `Bukchon Hanok Village`，`13:30`，`b0`

## Owner 寫入後與資料庫驗證

以 Owner UI 連續新增兩筆項目後，REST 讀回的 Day 2 rows：

| title | starts_at | sort_key |
| --- | --- | --- |
| Gwangjang Market | `2026-10-10T13:15:00+08:00` | `b0~44c93a68-2285-4c49-a4f3-16b2ca81346a` |
| Gyeongbokgung Palace | `2026-10-10T13:15:00+08:00` | `b0~44c93a68-2285-4c49-a4f3-16b2ca81346a~c22bda8b-10c8-4503-8090-339d356169c7` |

API 的回傳時區為本機 `+08:00`；兩筆代表的 UTC instant 為 `2026-10-10T05:15:00.000Z`，等同旅程 `Asia/Seoul` 的 `2026-10-10 14:15`。因此資料日期與旅程 Day 2 一致，且連續新增沒有 `(trip_day_id, sort_key)` collision。

## 刷新與 Realtime

- Owner 主分頁重新整理後，四筆 Day 2 rows 全部仍存在。
- 第二個已開啟的 Owner Day 2 分頁，無重新整理即收到兩筆新增，顯示相同四筆 rows。
- 第二分頁 console error log：`[]`。

## 登出與路由保護

- 由 `/trips` 點擊「登出」後，直接前往 Day 2 Planner URL。
- 實際結果：導向 `http://127.0.0.1:5175/login`，並顯示登入頁。

## 清理紀錄

本輪開始前已透過 Owner UI 刪除前一輪錯誤日期的 Gwangjang Market smoke row；以上兩筆為修正後重新驗收所建立的本機 smoke rows。
