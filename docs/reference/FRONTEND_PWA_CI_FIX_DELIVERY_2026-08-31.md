# 前端 PWA／CI 修正交付

- 交付時間：2026-08-31 13:35:42 +08:00（Asia/Taipei）
- 指派來源：`docs/coordination/FRONTEND_MANAGER.md`，2026-08-31 13:25:37 `CHANGES_REQUESTED／PWA-CI`。
- 狀態：REVIEW；未部署、未變更遠端 Supabase。

## 已完成

1. GitHub Pages workflow 以 `github-pages` Environment 的 `VITE_SUPABASE_URL`（variable）及 `VITE_SUPABASE_ANON_KEY`（secret）建置。任一值缺失即退出，production 不會落回 demo repository。
2. 新增 `authCallbackUrl`；Magic Link 和 Google OAuth 均以 Vite `BASE_URL` 產生 `/trips` 回呼。root 與 `/travel/` GitHub Pages base 已有單元測試。
3. Service worker 改於建置時生成；cache name 由 precache 清單雜湊版本化，並預快取 `index.html`、manifest、icons 和所有 hashed JS/CSS entry assets。舊版 cache 在 activate 時移除。
4. 保留安全邊界：跨來源、非 GET、帶 Authorization，以及 `/auth/`、`/rest/`、`/realtime/`、`/storage/` 都不進 service-worker cache。
5. `check:pwa-cache` 現同時檢查 hashed JS/CSS precache、敏感請求排除、`SKIP_WAITING`／`clients.claim()` 和使用者可見的「立即更新」流程。
6. Pages build 會建立 `404.html`，支援 `/&lt;repository&gt;/` base 下的 SPA deep link；README 已列出 production 設定位置與 Supabase 需允許的精確 callback URL。

## 驗證

- `pnpm typecheck`
- `pnpm test -- --run`（9 files／30 tests）
- `pnpm build`
- `pnpm check:pwa-cache`
- `pnpm bundle:report`（最大 JS 小於 500 KiB 預算）
- fail-closed build：設定 `VITE_REQUIRE_SUPABASE_CONFIG=true` 且移除兩個 Supabase 值時，建置如預期以 exit code 1 中止。
- Pages base build：`VITE_BASE_PATH=/travel/` 下確認 base asset、manifest、`404.html`、hashed JS/CSS precache 均存在。

## 部署前唯一人工設定

1. 在 GitHub 的 `github-pages` Environment 建立 variable `VITE_SUPABASE_URL`。
2. 在相同 Environment 建立 secret `VITE_SUPABASE_ANON_KEY`；不得使用 service-role key。
3. 將 `https://&lt;github-owner&gt;.github.io/&lt;repository-name&gt;/trips` 加入 Supabase Auth redirect allow list。
4. 手動觸發 Pages workflow 後，以實際 Pages URL 進行一次 Magic Link／OAuth redirect 和瀏覽器 installability 驗收。

## SVG 圖示註記

Manifest 的 192／512 SVG icons 已由 production build 輸出並納入 precache；目前沒有平台拒絕 SVG installability 的訊號，因此不產生未驗證用途的 PNG fallback。若目標瀏覽器實測拒絕，下一步才提供獨立的 192／512 PNG 與 maskable icon。

## 相關檔案

- [Pages workflow](../../.github/workflows/pages.yml)
- [PWA build cache check](../../scripts/check-pwa-cache.mjs)
- [回呼 helper](../../src/lib/authCallback.ts)
- [驗證證據](../evidence/pwa-ci-2026-08-31/fix-verification.md)
