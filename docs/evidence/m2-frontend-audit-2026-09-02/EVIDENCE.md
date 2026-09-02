# M2 Day 6 Browser Evidence Index

- 時間戳：2026-09-02 09:50:00 +08:00（Asia/Taipei）
- 目標：本機 `http://127.0.0.1:5173`、local Supabase `http://127.0.0.1:55431`。
- 帳號：local Magic Link 的 `owner@example.com`、`viewer@example.com`；未使用 service role 或 production 環境。

## 已驗證

| 身分／路徑 | 驗證結果 |
| --- | --- |
| Owner `/trips` | Magic Link callback 登入成功，顯示首爾旅程。 |
| Owner Explore | 320×844、375×844、430×932、768×1024、1440×900 均 `scrollWidth === clientWidth`；console error／warning 為 0。 |
| Owner Filter dialog | 開啟後焦點在區域 select；Escape 關閉後焦點回到篩選按鈕。 |
| Owner Reviewer Queue | 顯示 403，沒有審核 action。 |
| Viewer `/trips` | Magic Link callback 登入成功，顯示首爾旅程。 |
| Viewer Explore | 可讀取 Explore Empty state；1280px `scrollWidth === clientWidth`；console error／warning 為 0。 |
| Viewer Reviewer Queue | 顯示 403，沒有審核 action。 |
| `/reviewer-queue` route | 已修正為不經 TripLayout，避免側欄生成 `/trips/undefined/...` 連結；1280px 無水平溢位、console error／warning 為 0。 |

## 尚未完成，禁止宣稱 REVIEW

- local seed 沒有可登入的 `data_reviewer`／`platform_admin` browser fixture，故未能驗收 Reviewer 審核操作。
- 尚未取得可保存的 9/2 screenshot artifact、browser axe、實際 screen reader、200% zoom、safe-area、reduced-motion 證據。
- Explore fixture 在 Owner／Viewer session 下為 Empty state；未能以真實 published item 完成 Detail／Add／notification browser mutation smoke。
