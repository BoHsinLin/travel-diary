# 前端 Application Smoke 交付紀錄

- 交付時間：2026-08-31 12:00:06 +08:00（Asia/Taipei）
- 範圍：本機 Supabase、Owner／Viewer 權限、行程寫入持久化、Realtime 與受保護路由。

## 已修正

`src/features/places/PlaceFlowPages.tsx` 的新增行程流程，原本以 `item-${place.id}` 建立項目 ID；本機 `itinerary_items.id` 為 UUID，會使新增寫入失敗。現在改用 `crypto.randomUUID()`，符合資料庫欄位型別。

## 驗收結果

| 項目 | 結果 | 證據 |
| --- | --- | --- |
| Viewer 唯讀 | 通過 | 顯示「僅能檢視」，新增、拖曳、上移與刪除皆為 disabled。 |
| 登出與受保護路由 | 通過 | 登出後直接開啟 Day 2 行程網址，導向 `/login`。 |
| Owner 寫入 | 通過 | 將 Gwangjang Market 加入 Day 2，顯示 14:15、停留 25 分。 |
| 持久化 | 通過 | 重新整理 Owner 行程頁後，Gwangjang Market 仍存在。 |
| Realtime | 通過 | 第二個 Owner 分頁在未重新整理的情況下，收到新增的 Gwangjang Market。 |
| Console | 通過 | 即時同步驗證分頁的 error log 為 0。 |
| 型別檢查 | 通過 | `pnpm typecheck`。 |
| 單元測試 | 通過 | 7 個檔案、25 項測試全數通過。 |
| Production build | 通過 | `pnpm build` 成功；僅保留 Vite 對單一 chunk 大於 500 kB 的非阻斷性警告。 |

## 本機設定

- Supabase API：`http://127.0.0.1:55431`
- Mailpit／Inbucket：`http://127.0.0.1:55436`
- Vite：`http://127.0.0.1:5175`

## 停止條件

本次經理指派的前端 application smoke 已完成；未執行 PWA、CI 或部署工作。
