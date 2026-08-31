# 日韓旅遊規劃 PWA｜前端實作進度

最後更新：2026-08-27 10:27:52 +08:00（Asia/Taipei）  
目前估算：**前端約完成 28%**

## 已完成並驗證

- React + TypeScript + Vite 骨架與 Figma CSS tokens。
- 今日時間軸、mock 地圖與桌面雙欄布局。
- 行程編排、日期切換、原生拖放、上／下移。
- 景點探索、搜尋、加入設定、衝突選擇與回寫 Day 2。
- Repository interface、mock adapter、shared trip state。
- 純 Hero WebP；production 約 262 KB。
- Route-level 404。
- `pnpm run typecheck` 與 `pnpm run build` 通過。

## 尚未完成

- Auth、邀請、protected routes、旅程列表／總覽。
- 旅伴與角色權限。
- TanStack Query、React Hook Form、Zod、Supabase adapter、Realtime。
- PWA manifest、Service Worker、離線讀取與更新提示。
- 正式 icon library。
- Unit、accessibility、E2E 與 visual regression。
- Git、CI/CD 與 GitHub Pages。

## 已知技術債

- `seoul`、`bukchon`、Day 2 等仍有硬編碼。
- `ConflictPage` 有「絧束」錯字。
- contracts 只覆蓋極簡 Trip／ItineraryItem，未與資料庫 schema 對齊。
- `package.json` 尚無 test／e2e scripts。

## 下一步

以 `CURRENT_WORK_ASSIGNMENTS.md` 的前端 P0 為唯一執行順序。

