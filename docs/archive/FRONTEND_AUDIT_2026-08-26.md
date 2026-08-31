# 日韓旅遊規劃 PWA｜前端設計與體驗稽核

最後更新：2026-08-26 17:25:09 +08:00（Asia/Taipei）  
稽核範圍：今日行程、地圖切換、行程編排、底部導覽、390×844 與 1280×900 顯示  
Figma 基準：`28:3` 今日行程、`61:44` 行程編排及既有旅程誌設計系統

## 管理結論

**目前前端不接受作為視覺完成品，需要一次結構性大修。**

可以保留的只有 React／TypeScript／Vite 骨架、路由起點、contracts 初稿及部分語意化 HTML。現有視覺與互動不應繼續往後複製，否則後續畫面會放大錯誤模式。

判定：

- 工程骨架：有條件接受
- 視覺還原：不接受
- 核心互動：不接受
- 響應式：不接受
- 無障礙：部分基礎存在，但未達可驗收狀態
- Production build：通過

## 稽核證據

1. `frontend-audit/01-today-mobile.png`：今日行程，390×844
2. `frontend-audit/02-planner-mobile.png`：行程編排，390×844
3. `frontend-audit/03-today-desktop.png`：今日行程，1280×900
4. `frontend-audit/04-map-mobile.png`：地圖切換，390×844

## 流程健康度

| 步驟 | 使用者看到的內容 | 健康度 |
|---|---|---|
| 1 | 今日行程／時間軸 | 嚴重：Hero 重複文字、比例錯誤、導覽資產缺失 |
| 2 | 切換地圖 | 嚴重：只有大型 placeholder，沒有可用的探索資訊 |
| 3 | 進入行程編排 | 不佳：能顯示資料，但品牌與 Figma 層級偏離 |
| 4 | 使用底部導覽 | 嚴重：收藏／旅伴指向未實作路由後被靜默送回今日頁 |
| 5 | 桌面顯示 | 不佳：只是手機框置中，沒有桌面資訊布局或空間利用 |

## P0 問題：必須先修正

### 1. 把完整 UI 截圖誤當 Hero 圖片

`IMG_panel_hero.png` 已包含旅伴、筆記、旅程標題、日期、地點、天氣與波浪邊界，React 又疊加同一批資料，造成肉眼可見的雙重標題與控制。

處理方式：

- 禁止把帶 UI 的合成圖直接放入 `<img>`。
- 從原始合法照片建立純攝影資產，不含任何文字、按鈕、頭像或裝飾邊界。
- 所有資訊與控制必須用真實 DOM 呈現；Hero 波浪改用設計核准的遮罩資產或簡化為穩定的裁切邊界。
- Hero 圖片需輸出合適尺寸與 WebP／AVIF，現有 PNG 約 1.44 MB，對 PWA 首屏過重。

### 2. 手機畫面沒有真正使用 390px

截圖顯示主要內容只使用約 300px 寬，右側留下大片空白。Hero 的原始比例與實際容器不一致，也讓文字、控制及卡片被縮小。

處理方式：

- 在真實 390×844 viewport 驗證 `html/body/#root/.phone-shell` 的 computed width。
- 移除會造成縮放或舊 viewport 行為的設定，確認 `meta viewport` 正確。
- 建立視覺回歸門檻：Figma 與前端同尺寸並排，容許誤差由團隊明訂。

### 3. 行程編排偏離同一套品牌系統

整片高飽和橘色 header 與 CTA 讓頁面像另一個工具；Figma 旅程誌的主體應以象牙白、紙張感、森林綠狀態與柿橘局部行動提示建立節奏，而不是大面積橘色。

處理方式：

- 重新依 `61:44` 的 design context 實作，不只從進度文件推測。
- Header 回到輕量的 editorial hierarchy；柿橘只放在主 CTA、重要狀態或選取項。
- 固定錨點、一般行程、暫存項目需有清楚且一致的型別差異。

### 4. 導覽提供不存在的功能

收藏與旅伴連結雖可點擊，但 wildcard route 會立即導回今日頁，沒有錯誤、未完成提示或 disabled 狀態。這會讓使用者以為操作失敗。

處理方式：

- MVP 未實作的 destination 不得以可用連結呈現。
- 二選一：建立對應頁面；或使用明確的「即將推出」disabled 狀態，不觸發路由。
- 補 route-level 404，不得把所有未知路由靜默 redirect。

### 5. 核心互動只是文字外觀

地圖是 placeholder；拖曳、更多操作、日期 tab 與尋找景點按鈕沒有完成主要任務。畫面可看但不可規劃旅行。

處理方式：

- 第一個可驗收 vertical slice：切換日期 → 拖曳排序 → 加入景點 → 發生衝突 → 套用方案 → 回到更新後行程。
- 所有狀態先以 mock repository 完成，不必等待 Supabase。

## P1 問題：P0 後立即處理

- 底部導覽缺少正式 icon，只剩短線 marker；需使用核准 icon library。
- Today cards 缺少清楚的交通連接線、下一站優先資訊及主要「開始導航」操作。
- 地圖模式至少需 mock pins、路線、景點清單與地圖／清單切換，不能只有說明文字。
- 桌面版不可只把 390px 手機殼置中；至少建立 sidebar＋main content 或雙欄 plan／map layout。
- 淺／深色切換沒有產品入口，CSS 只在 `data-theme='system'` 時部分覆寫。
- 需要 loading、empty、error、offline、syncing、read-only 與 permission-denied 狀態。
- 文字尺寸多落在 10–12px；需核對可讀性、縮放與 WCAG 對比。

## 可保留項目

- HTML 已使用 `main`、`nav`、`article`、heading、`time` 等基本語意。
- 部分按鈕有 `aria-label`，tab 也有 `aria-selected`。
- 觸控控制多數至少 44px。
- CSS tokens 已集中定義，可作為重建起點，但需逐一對照 Figma variables。
- TypeScript production build 已通過。

## 建議重構方案

### Batch 0：停止擴張並建立比較基準（半天）

- 暫停新增其他頁面。
- 固定 390×844、430×932、768×1024、1280×900 四個 viewport。
- 匯出 Figma 目標畫面，建立 screenshot comparison 目錄與檢查清單。
- 將現有兩頁標記為 `needs-redesign`。

### Batch 1：重建 Design System 與 App Shell（1–2 天）

- 校正 tokens、字體載入、icon library、safe area、容器與 breakpoints。
- 完成 Button、Segmented Control、Bottom Nav、Itinerary Row、Fixed Anchor、Next Stop 的 variants。
- 建立 skeleton、empty、error、offline 與 toast／dialog。

### Batch 2：重做今日行程（1–2 天）

- 替換純照片資產並移除重複 UI。
- 依 Figma 還原 Hero、Day header、pace、timeline connector、next stop 與 bottom nav。
- 時間軸／地圖切換要保留狀態；地圖先使用可信 mock，而非空 placeholder。

### Batch 3：重做行程編排 vertical slice（2–3 天）

- 依 Figma 實作 day selector、anchors、sortable items、holding area。
- 完成加入景點、衝突處理、成功回寫與 Undo。
- 使用 repository interface＋mock adapter，讓後端之後可直接替換。

### Batch 4：響應式與驗證（1–2 天）

- 手機、平板、桌面布局，不以手機殼置中當桌面版。
- 鍵盤拖曳、focus order、螢幕閱讀器名稱、200% zoom、reduced motion。
- 每個 viewport 與 Figma 比較；修正 crop、spacing、字重、圓角與 overflow。

## 前端下一次回報必須包含

1. 修正後的四個 viewport 截圖。
2. Figma／實作並排比較。
3. 可實際操作的 vertical slice 錄影或步驟。
4. 未實作導覽項目的明確處理。
5. Build、typecheck、unit test 與 accessibility smoke test 結果。
6. 不再以合成 UI 截圖作為程式內圖片資產的證明。

## 驗收門檻

- 390px 畫面無側邊空白、重疊或重複資訊。
- 今日行程與行程編排視覺屬於同一套設計系統。
- 底部每個可點導覽都有有效目的地。
- 核心 vertical slice 可完成，不是只有靜態畫面。
- Figma 比較沒有明顯比例、階層、色彩、字體及間距偏差。
- 截圖無法證明完整 WCAG；仍須完成鍵盤、語意、對比與輔助技術測試。

