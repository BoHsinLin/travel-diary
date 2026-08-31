# 日韓旅遊規劃 PWA｜整體專案進度

最後更新：2026-08-27 10:27:52 +08:00（Asia/Taipei）  
狀態來源：實際工作區、Figma 狀態、前端原始碼、typecheck 與 production build。  
任務指派基準：`CURRENT_WORK_ASSIGNMENTS.md`

## 最新結論

- **整體 MVP 完成度：約 34%**
- **產品需求：約 90%**
- **Figma／UX：約 68%**
- **前端：約 28%**
- **後端：0%**
- **測試、PWA、部署：約 2%**

百分比依可交付能力加權，不以畫面或檔案數直接計算。

## 已驗證成果

### Figma

- 55 個設計變數，含 Light／Dark。
- 12 個共用元件及 19 個頂層手機畫面。
- 景點探索 → 搜尋 → 加入設定 → 衝突處理 → 回行程的 P0 Prototype 已串接。
- 第三批返回控制及 44×44 px 觸控尺寸已完成。
- 尚缺操作狀態、完整 variants、響應式、逐頁深色與 WCAG 驗證。

### 前端

- React + TypeScript + Vite 專案可執行。
- `pnpm run typecheck` 與 `pnpm run build` 通過，42 modules transformed。
- 已完成今日時間軸、mock 地圖、行程編排、景點探索、加入設定、衝突處理及回寫 vertical slice。
- 已有 repository interface、mock adapter、shared trip state 與 route-level 404。
- Hero 已改為純影像 WebP，production 約 262 KB。
- 尚未完成 Auth、旅程總覽、權限、Supabase、Realtime、PWA、測試及部署。

### 後端／基礎設施

- 已有後端資料模型與 RLS 規格文件。
- 工作區沒有 `supabase/`、migration、seed、generated types 或後端程式。
- 工作區不是 Git repository，也沒有 `.github/` CI。

## 文件真實性

- `FRONTEND_AUDIT_2026-08-26.md`：首次失敗版本的稽核證據，保留作歷史基準。
- `FRONTEND_AUDIT_FIX_REPORT_2026-08-27.md`：P0 修正回報。
- `FRONTEND_EXECUTION_RESPONSE_2026-08-27.md`：最新可執行驗證。
- `FIGMA_PROGRESS.md` 與 `進行回報.md`：Figma 最新實際狀態。
- `FIGMA_HANDOFF.md`：Phase 0 歷史文件，不可用來判斷目前進度。
- 本文件與 `CURRENT_WORK_ASSIGNMENTS.md` 是目前管理基準。

## 當前主要風險

1. 前端 contracts 過於簡化，尚未與資料庫 schema 對齊。
2. 前端仍有 `seoul`、`bukchon`、Day 2 等硬編碼與「絧束」錯字。
3. 沒有測試，vertical slice 的回歸風險高。
4. 沒有 Git／CI，無法可靠追蹤多人修改。
5. 後端尚未開始，是整體 MVP 最大阻塞。
6. Figma motion 決議未完成，但不阻擋 Auth、schema、測試與 PWA 基礎工作。

## 下一個里程碑

目標：**M1 — 可登入的協作行程核心**

- Supabase 可由 migration 重建。
- Google／Magic Link 登入與 protected route 可運作。
- Owner／Admin／Editor／Viewer RLS 測試通過。
- 前端 Trip／Day／Itinerary／Place 從 Supabase adapter 讀寫。
- 兩個 session 可看到 Realtime 更新。
- 既有加入景點 vertical slice 有 unit／integration test。

M1 完成前，不優先開發預算、文件、版本復原、公開分享或自動航班追蹤。

