# 今日行程波浪 Hero｜Design QA

時間戳：2026-08-27 16:58:24 +08:00（Asia/Taipei）

## QA 範圍

- 設計來源：使用者提供的 `codex-clipboard-07370b2e-c154-49de-b91e-bfb2dc711761.png`，並以 Figma file `7fFURmWK9uPeYiVTMnMsBQ`、node `28:3` 取得正式設計內容與圖資。
- 實作頁面：`http://127.0.0.1:5173/trips/trip-001/today`
- 主要驗收區域：Hero 照片、旅伴列、筆記入口、標題／資訊列、底部不規則波浪，以及緊接的 Day 2 標頭與檢視切換。
- 實作截圖：`docs/evidence/today-wave-2026-08-27/today-390-final.png`
- 對照圖：`docs/evidence/today-wave-2026-08-27/comparison-final.png`

## 測試環境與正規化

- 主要 viewport：390×844 CSS px；瀏覽器截圖輸出受桌面顯示密度影響，已按 DOM `getBoundingClientRect()` 的 390 CSS px 寬度正規化後比較。
- 延伸 viewport：430×932、768×1024、1280×900。
- 狀態：已登入、本機 mock API、Today timeline view。
- DOM 量測：各 viewport 的 `documentElement.clientWidth` 與 `scrollWidth` 相等；Hero 高度 320 CSS px。

## 視覺比對結果

- 全畫面：照片裁切、暖白背景、Hero 高度、Day 標頭銜接與控制元件層級一致。
- 聚焦區域：使用者明確指出的 Hero 底部波浪。實作採用 Figma node 輸出的正式合成圖，因此波峰、波谷、左右收邊與設計稿一致，沒有用近似 border-radius 或手繪 CSS 曲線替代。
- 互動與無障礙：筆記位置保留透明原生 button 熱區，具 `aria-label="開啟旅程筆記"`；Hero image 具描述性 alt。頁面可由鍵盤操作主要切換與底部導航。
- 響應式：四個指定 viewport 均無水平溢出；較寬畫面沿用產品既有 390 px app shell 規則。

## 驗證

- TypeScript：`tsc -b` passed。
- Unit tests：Vitest 2 files／3 tests passed（single worker）。
- Production build：Vite build passed。

## Findings / Iteration History

1. 初始版本用 CSS 圓角／遮罩近似波浪，無法吻合 Figma 的不規則輪廓。
2. 第二輪取得 Figma 正式圖資後，移除重複的 DOM 視覺疊層，改由原始合成圖忠實呈現。
3. 最終對照未發現本次範圍內的 P0、P1 或 P2 視覺差異。
4. P3 備註：Hero 內文目前屬正式圖資的一部分；若未來資料需要動態化，須先和 Figma 設計師決議拆層規格。

## Final Result

passed

---

# Today「開始導航」按鈕｜Design QA

時間戳：2026-08-28 16:11:03 +08:00（Asia/Taipei）

## 比對範圍

- 視覺來源：`C:/Users/diorl/AppData/Local/Temp/codex-clipboard-072454b5-d025-4ddc-b10e-12b6462c0ed8.png`
- 實作畫面：`docs/evidence/rwd-2026-08-28/today-navigation-fixed-full.png`
- 同圖對照：`docs/evidence/rwd-2026-08-28/navigation-button-comparison.png`
- route／state：`/trips/trip-001/today`，390×844 CSS px，時間軸檢視，第一個行程項目。

## Findings / 修正歷程

1. [P1] 導航 icon 被全域 `.icon { display:block }` 規則影響；按鈕未建立圖示與文字的 flex 行列，造成圖示與「開始導航」未鎖定同一列。
2. 修正：`src/features/today/today.css` 將 `.editorial-stop button` 改為 `inline-flex`，明確設定置中、16px 固定圖示尺寸、8px gap、`white-space: nowrap`、`overflow: hidden` 及內容欄 `min-width: 0`。
3. 修正後瀏覽器量測：button `display=inline-flex`、`align-items=center`、`justify-content=center`、高度 38px，圖示 16px，無 overflow；console error 為空。

## Fidelity Surfaces

- 字體／文案：保留「開始導航」原文、字重與 12px 層級，未截斷或換行。
- 版面節奏：按鈕維持行程內容欄寬度與 19px 圓角；icon 與文字同列居中。
- 色彩：保留既有 `--color-bg-accent` 橘色與白色前景；無 token 變動。
- 資產／icons：使用既有正式 icon package mapping，未加入手工 SVG 或 CSS 圖示。
- 響應式：最小內容寬度與不換行規則避免窄版、字型載入與字體縮放造成二次分列。

## Final Result

passed
