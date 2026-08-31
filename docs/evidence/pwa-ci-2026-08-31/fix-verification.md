# PWA／CI 修正驗證證據

- 產生時間：2026-08-31 13:35:42 +08:00（Asia/Taipei）
- 範圍：經理 13:25:37 `CHANGES_REQUESTED／PWA-CI`。

| 檢查 | 結果 |
| --- | --- |
| TypeScript | `pnpm typecheck` 通過。 |
| 單元測試 | `pnpm test -- --run` 通過；9 files／30 tests，包含 root 與 `/travel/` Auth callback。 |
| Production build | `pnpm build` 通過。 |
| PWA contract | `pnpm check:pwa-cache` 通過；檢查版本化 precache 的 hashed JS/CSS、同源 GET 限制、Authorization 與 Supabase path 排除、update prompt contract。 |
| Bundle budget | `pnpm bundle:report` 通過；最大 JavaScript chunk 未超過 500 KiB。 |
| Fail closed | `VITE_REQUIRE_SUPABASE_CONFIG=true` 且兩個 VITE Supabase 值為空時，`pnpm build` 如預期 exit code 1，訊息要求同時設定 URL 與 ANON key。 |
| Pages base | 使用 `VITE_BASE_PATH=/travel/` 和測試用非敏感值建置；確認 manifest／assets 使用 `/travel/`，`dist/404.html` 存在，service worker precache 內含 hashed JS 和 CSS。 |

## 可稽核的離線與更新行為

- 初次安裝：install event 將版本化 `PRECACHE`（app shell、manifest、SVG icons、hashed JS/CSS）寫入 cache；離線 navigate request 回退 `./index.html`。
- 更新：新 worker installed 後 app 顯示「新版旅程誌已可使用」；使用者選擇「立即更新」才送出 `SKIP_WAITING`，activate 取得 clients control 並清除舊版 cache。
- 敏感資料：service worker 不讀取或快取跨來源、Authorization、Auth、REST、Realtime、Storage request。

## 限制

尚未取得實際 GitHub Pages repository／Environment 及 production Supabase redirect allow-list 權限，故未部署且未聲稱完成線上 OAuth 或瀏覽器安裝。SVG icons 已由建置檢查，仍待實際目標平台在部署後的 installability 驗收；未收到拒絕前不製造不必要 PNG fallback。
