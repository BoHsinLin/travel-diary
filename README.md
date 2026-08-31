# 旅程誌

專案文件已集中至 [`docs/README.md`](./docs/README.md)。本機 Supabase 日常啟動與異常恢復請先閱讀 [`docs/backend/LOCAL_DEVELOPMENT_STARTUP.md`](./docs/backend/LOCAL_DEVELOPMENT_STARTUP.md)，並由專案根目錄執行 `.\scripts\start-local.ps1`。

所有負責人開始工作前必須先閱讀：

1. [`docs/PROJECT_HUB.md`](./docs/PROJECT_HUB.md)
2. 與自己相關的協作通道：
   - 前端 ↔ 後端：[`docs/coordination/FRONTEND_BACKEND.md`](./docs/coordination/FRONTEND_BACKEND.md)
   - 前端 ↔ Figma：[`docs/coordination/FRONTEND_FIGMA.md`](./docs/coordination/FRONTEND_FIGMA.md)
   - 前端 ↔ 專案經理：[`docs/coordination/FRONTEND_MANAGER.md`](./docs/coordination/FRONTEND_MANAGER.md)

不要在根目錄新增新的進度文件。歷史資料位於 `docs/archive/`，不得用作最新指令。

## Local development

```powershell
pnpm dev
```

Local Supabase startup and recovery instructions are in [docs/backend/LOCAL_DEVELOPMENT_STARTUP.md](docs/backend/LOCAL_DEVELOPMENT_STARTUP.md).

## Verification

```powershell
pnpm typecheck
pnpm test -- --run
pnpm build
pnpm check:pwa-cache
pnpm bundle:report
```

## GitHub Pages preparation

`.github/workflows/pages.yml` is intentionally manual (`workflow_dispatch`) until a GitHub repository and Pages settings are supplied. It builds with `VITE_BASE_PATH=/<repository-name>/` and copies `index.html` to `404.html` for SPA fallback.

Before enabling the workflow, set production `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as GitHub environment secrets or variables, then add the exact Pages URL to Supabase Auth redirect URLs. Do not put service-role keys or local `.env` files in GitHub Pages.
