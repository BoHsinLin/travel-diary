# M2 Day 6 Browser Evidence Index - REVIEW

- 時間戳：2026-09-02 10:14:16 +08:00（Asia/Taipei）
- 目標：本機 `http://127.0.0.1:5173`、local Supabase `http://127.0.0.1:55431`。
- 帳號：local Magic Link 的 `owner@example.com`、`admin@example.com`；未使用 service role 或 production 環境。
- Fixture：`supabase/fixtures/m2_browser_evidence.sql`，僅能套用於 local stack，無金鑰、不屬於 production migration。

## 已驗證

| 身分／路徑 | 驗證結果 |
| --- | --- |
| Owner `/trips` | Magic Link callback 登入成功，顯示首爾旅程。 |
| Owner Explore | 320×844、375×844、430×932、768×1024、1440×900 無水平 overflow，均為 2 張 published cards、1 個 selected tab。 |
| Owner Filter dialog | 開啟後焦點在區域 select；Escape 關閉後焦點回到篩選按鈕。 |
| Event Detail／report | 真實 published Event 可讀；修正 report category contract 後實際 INSERT 成功且 UI 顯示「已送交審核」。 |
| Add Event | Day 2 10:00 實際命中 `PT409`，不覆寫原行程；Day 1 10:00 實際新增成功。 |
| Change Notification | Owner 看到 time change notice，按「知道了」後資料庫 `acknowledged_at` 非 null。 |
| Reviewer | `admin@example.com` 可看 pending row，實際完成 approve → approved → publish；Event 為 published，audit 有 2 筆。 |
| Owner Reviewer Queue | 375px 顯示 403 且無管理 action；console error／warning 為 0。 |
| Reflow／safe area／motion | 720×450 作為 1440px 的 200% reflow 等效寬度，`scrollWidth <= clientWidth`；CSS 實際含 safe-area 與 reduced-motion media rules。 |

## Screenshot artifacts

- `01-owner-explore-{320,375,430,768,1440}.png`
- `02-owner-filter-dialog-375.png`
- `03-owner-event-detail-375.png`
- `04-owner-report-success-375.png`
- `05-owner-notification-acknowledged-375.png`
- `06-owner-add-conflict-375.png`
- `07-owner-add-success-375.png`
- `08-reviewer-pending-1440.png`
- `09-reviewer-approved-1440.png`
- `10-reviewer-published-1440.png`
- `11-reviewer-200pct-equivalent-720x450.png`
- `12-owner-reviewer-403-375.png`

## Accessibility and limitations

- Filter 與 Reviewer dialogs 已實測 initial focus、Tab／Shift+Tab trap、Escape close 及 focus return；DOM accessibility snapshot 確認 heading、tab、dialog、status、alert 與 form labels。
- `vitest-axe` Discovery 基線 0 violations（jsdom 不支援 computed color contrast，該 rule 依既有專案規則關閉）。內建驗收瀏覽器因唯讀 sandbox 禁止 axe-core 掛到 page global，無法偽稱完成 browser-injected axe。
- 本輪工具沒有實體 screen reader 輸出通道；以 accessibility tree／keyboard 實測作為自動化證據，保留人工 NVDA／Narrator 作為經理若要求的外部 gate。
