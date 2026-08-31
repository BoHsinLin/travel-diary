# M1 RWD 前端交付

時間戳：2026-08-28 15:41:54 +08:00（Asia/Taipei）

## 實作結果

- 共用 `TripLayout`：手機／平板保留既有導覽；1280 breakpoint 顯示 88px sidebar，內容最大 1120px。
- 390×844：單欄、Bottom Navigation／頁內返回、safe-area、無水平溢位。
- 430×932：Login、Today、Overview、People 使用完整可用寬度；長標題允許換行。
- 768×1024：主要內容最大 680px；Planner 控制欄＋行程欄、Explore 兩欄景點卡；表單維持單欄。
- 1280×900：Today 720px 主欄＋320px 側欄；Planner／Explore 使用 300px context column＋820px 工作區；People 使用 320px 摘要＋內容欄。
- 窄版與輔助規則：320px fallback、`env(safe-area-inset-bottom)`、`prefers-reduced-motion`、長文換行、表單單欄。

## 瀏覽器驗收矩陣

實測路由：Login、Today、Planner、Explore、Overview、People。

| Viewport | 路由數 | Overflow | 主要規則 |
|---|---:|---|---|
| 390×844 | 6 | 全數 `scrollWidth <= clientWidth` | 單欄／手機導覽 |
| 430×932 | 6 | 全數 `scrollWidth <= clientWidth` | 全寬／長文換行 |
| 768×1024 | 6 | 全數 `scrollWidth <= clientWidth` | 680px／內容雙欄 |
| 1280×900 | 6 | 全數 `scrollWidth <= clientWidth` | 88px sidebar／1120px workspace |

- 截圖：`docs/evidence/rwd-2026-08-28/`，共 26 張（六路由 × 四 viewport、Today 額外矩陣及 reflow 證據）。
- 1280 Today computed columns：`720px 320px`；sidebar `display:flex`；Bottom Nav `display:none`。
- 390／430 Today：sidebar `display:none`；Bottom Nav `display:flex`。
- 200% 等效 reflow：640×450 CSS viewport 下 Planner `scrollWidth === clientWidth`；證據為 `planner-640x450-reflow-equivalent.png`。

## 無障礙檢查

- Today：1 個 main、具名稱的主要 navigation、0 個缺少 alt 的圖片、0 個無名稱 icon-only buttons。
- 選取狀態控制項 computed contrast：6.31:1，通過 WCAG AA 一般文字門檻。
- CSS 已包含 `prefers-reduced-motion: reduce`，取消 page／pin／drag motion。
- safe-area 語法由瀏覽器 `CSS.supports()` 確認支援。
- Vitest axe 基線持續通過；所有可操作控制維持原生 link／button／input 語意。

## 驗證結果

- TypeScript：passed。
- Vitest：3 files／7 tests passed。
- Production build：passed，2023 modules transformed。

## 工具限制

- In-app browser 的 Ctrl+Plus 未改變其 zoom／visualViewport，因此未將該結果冒充原生 200% browser zoom；本輪以 1280 邏輯畫面對應 640 CSS px 的等效 reflow 驗證補證。RWD 實作與 overflow matrix 已完成。
