# 日韓旅遊規劃 PWA｜Figma 後續交接

最後更新：2026-08-27 10:27:52 +08:00（Asia/Taipei）  
目前估算：**Figma／UX 約完成 68%**

> 最新指派以 `CURRENT_WORK_ASSIGNMENTS.md` 為準。P0 景點加入 Prototype 已完成，以下舊清單中相同項目不應重複執行。

## 階段判定

核心 Figma 任務已於本時間戳告一段落，前後端不需等待剩餘畫面即可開工。本文件以下內容改列為後續設計 backlog；Figma 負責人收到新的明確指派後再繼續，不需要目前主動擴充畫面。

下一次優先指派應是「景點探索到排入行程的完整 Prototype 與其 loading／success／error 狀態」。若工程先遇到規格缺口，由整體專案負責人整理成單一批次再交回 Figma，避免零碎修改。

## 既有成果

- Figma：[Core Screens](https://www.figma.com/design/7fFURmWK9uPeYiVTMnMsBQ?node-id=28-2)
- Foundations：18 primitive 色彩、19 尺寸、18 semantic 色彩，含 Light／Dark
- 元件：Button、Icon Button、Segmented Control、Avatar、Avatar Group、Pace Chip、Day Selector、Status Notice、Bottom Navigation、Itinerary Row、Fixed Anchor、Next Stop Panel
- 19 個頂層手機畫面，詳細 node ID 見 `FIGMA_PROGRESS.md`
- 第一、二批主要流程已有 13 組跳轉

## 立即要處理（P0）

### 1. 串完景點加入行程 Happy Path

完整路徑：

`61:44 行程編排` → `61:45 附近熱門` → `61:46 搜尋篩選` → `61:47 加入設定` → 無衝突回行程／有衝突進 `61:48` → 套用後回更新行程。

補齊返回、取消、儲存中、成功與失敗。先前巢狀節點不能作 Prototype source，請用可點擊外框或透明 hotspot。

### 2. 補足前端開發所需狀態

- Button：default、pressed、disabled、loading、focus-visible
- Input：empty、filled、focus、error、disabled、read-only
- Itinerary Row：normal、dragging、drop target、fixed、conflict、offline pending
- Status：saving、synced、offline、sync failed、permission denied
- 頁面：empty、skeleton、no result、error、retry、read-only

### 3. 補齊核心 CRUD 子流程

- 新增／編輯／刪除景點與刪除確認
- 跨日移動、拖放位置、Undo toast
- 暫存區管理與批次排入日期
- 邀請旅伴、角色調整、移除確認

## 第二優先（P1）

- 航班、住宿、票券、保險新增／編輯／詳情
- QR Code／票券檢視
- 支出新增／編輯、付款人、平均與自訂比例分帳
- 版本差異、復原確認、回收區
- 公開連結成功、複製、停用、過期
- 通知中心、航班異動詳情
- 帳號、語言、地圖與通知偏好

## 設計驗證

- 為 390×844 完成逐頁 overflow／safe area 檢查
- 補至少一組較窄手機與桌面／平板響應式規則；PWA 不應只定義單一尺寸
- Light／Dark 逐頁對比，文字與控制達 WCAG 2.2 AA
- 一般觸控目標至少 44×44 px，焦點狀態不可只靠顏色
- 檢查繁中、韓文、日文與較長地名的截斷方式
- 不以符號字元替代最終 icon；整理 icon library 與匯出規範

## 要交付前端的內容

1. 每個核心畫面的 node-specific Figma URL
2. Prototype 起點與完整 Happy Path
3. Variables／tokens 命名表與 Light／Dark 對照
4. 所有共用元件的 variants、尺寸、狀態與用途
5. Auto Layout、padding、gap、min/max width 與 safe-area 規則
6. 圖片、icon、字型及授權清單
7. 空白、載入、錯誤、離線、唯讀、權限不足畫面
8. 每個操作對應的成功／失敗回饋與文案

## 完成條件

- 核心 MVP 從登入到建立旅程、排入景點、處理衝突、邀請旅伴與公開分享均可操作
- Prototype 不存在死路或無法返回的頁面
- 共用狀態皆以 component variant 表達，不以零散複製畫面替代
- 完成 Light／Dark、AA 對比與觸控尺寸檢查
- `FIGMA_PROGRESS.md` 與 `.figma-design-state.json` 更新到最新 node ID

## 不需由 Figma 處理

- 資料庫 schema、RLS 與 API 實作
- 航班或景點資料抓取邏輯
- Realtime 合併策略的程式實作
- GitHub Pages 與 Supabase 部署
