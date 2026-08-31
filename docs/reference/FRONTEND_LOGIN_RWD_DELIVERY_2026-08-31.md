# 前端登入頁 RWD 修正交付

- 交付時間：2026-08-31 14:24:15 +08:00（Asia/Taipei）
- 範圍：登入頁桌面版容器／雙欄跑版修正。

## 已完成

1. 登入頁所有 breakpoint 與 desktop 規則集中在 `src/features/auth/auth.css`；`src/design-system/responsive.css` 不再含任何 `.auth-*` selector。
2. 桌面 `.auth-shell` 明確使用 `width:min(100%,1040px)`，且 grid 為 `minmax(0,44fr) minmax(0,56fr)`。
3. `.auth-brand`、`.auth-form` 均加上 `min-width:0`，避免 grid child 的 intrinsic width 推開容器。
4. 700–1099px 保持單欄 card；僅 1100px 起啟用雙欄。

## 驗證

- 本機 320px：視覺確認無水平跑版。
- 本機 1024px：視覺確認仍為單欄。
- 本機 1920px：視覺確認為置中的完整雙欄，沒有被 390px 外殼截斷。
- 靜態 breakpoint contract 覆蓋 320、375、430、768、1024、1280、1440、1920px：小於 1100px 不符合雙欄 media query；1100px 以上使用可收縮 grid 與最大 1040px 容器。
- `pnpm typecheck`、`pnpm test -- --run`（9 files／30 tests）與 `pnpm build` 通過。

## GitHub Pages 正式網址驗收

已實際檢查 [目前線上登入頁](https://bohsinlin.github.io/travel-diary/login)。它仍是部署前的舊 CSS：1920px 下計算到 `360px 480px` grid，但外層 shell 只有 390px，正是截圖中的截斷原因。

本次修正尚未推送或部署（先前經理限制不得自行部署），因此不能把本機驗證冒充為正式網址驗收。待有部署權限者將本提交發布到 GitHub Pages 後，應以同一網址重新檢查八個指定寬度並確認新版本已載入。
