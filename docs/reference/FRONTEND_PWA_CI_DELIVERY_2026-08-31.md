# 前端 PWA／CI／Pages 準備交付

- 交付時間：2026-08-31 13:21:48 +08:00（Asia/Taipei）
- 指派來源：`FRONTEND_MANAGER.md`，2026-08-31 13:01:23。

## 交付內容

1. PWA：新增 manifest、SVG icons、同源 app-shell service worker、offline navigation fallback 與更新提示。
2. 安全：service worker 只快取同源且無 Authorization 的 GET app-shell assets；明確排除 Supabase Auth、REST、Realtime 路徑。沒有快取 Auth token、敏感 API response、booking 或 documents。
3. 分包：所有 route 改用 `React.lazy`；最大 JS chunk 為 440.17 KiB，低於 500 KiB 預算。
4. Git：初始化 `main` local baseline，commit `a8b6cc5 chore: initialize PWA CI baseline`；`.gitignore` 排除 `.env*`（保留 `.env.example`）、`node_modules`、`dist`、logs、Supabase temp／secrets。
5. CI：新增 `.github/workflows/ci.yml`，固定 Node 24.19.0、pnpm 11.19.0，使用 frozen lockfile，執行 typecheck、tests、build、PWA cache check 與 bundle report。
6. GitHub Pages：新增手動 `workflow_dispatch` workflow，使用 repository base path 並生成 `404.html` SPA fallback；沒有 GitHub repo／Pages settings 前，未宣稱已部署。

## 驗證結果

- `pnpm typecheck`：通過。
- `pnpm test -- --run`：8 files／28 tests 通過。
- `pnpm build`：通過。
- `pnpm check:pwa-cache`：通過。
- `pnpm bundle:report`：通過，最大 JS `440.17 KiB / 500 KiB`。
- Production preview：manifest 與 `/sw.js` 均為 HTTP 200；四 viewport Login regression 及 console error=0 見實際 artifact。

## 實際 artifact

- [PWA／CI 驗證證據](../evidence/pwa-ci-2026-08-31/verification.md)
- [GitHub Pages 與 production Supabase checklist](../../README.md#github-pages-preparation)

## 部署前清單

1. 建立 GitHub repository，啟用 Pages（GitHub Actions source）。
2. 在 `github-pages` environment 設定 production `VITE_SUPABASE_URL` 與 publishable／anon key；禁止 service-role key。
3. 將精確的 `https://<owner>.github.io/<repository>/` 加入 Supabase Auth redirect URLs。
4. 手動觸發 Pages workflow，確認 Pages URL、Magic Link redirect、SPA deep link 與 PWA install prompt。

## 停止條件

本批完成後停止於 REVIEW；未自行部署、未更動遠端 Supabase，未開啟 Phase 2。
