# PWA／CI 驗證證據

- 產生時間：2026-08-31 13:21:48 +08:00（Asia/Taipei）
- Production preview：`http://localhost:4173`

## PWA

| 檢查 | 結果 |
| --- | --- |
| Manifest | `name=旅程誌`、`start_url=./`、`display=standalone`、2 個圖示。 |
| Service worker | `/sw.js` 回應 HTTP 200。 |
| Offline shell | cache 預載 `./`、`./index.html` 與 manifest；navigate request 的網路失敗會回退 `./index.html`。 |
| 敏感快取邊界 | `pnpm check:pwa-cache` 通過；只允許 same-origin、GET、無 Authorization 的 app-shell assets，明確排除 `/auth/`、`/rest/`、`/realtime/`。 |
| 更新提示 | 安裝中的新版 service worker 進入 `installed` 後會顯示「新版旅程誌已可使用」，使用者選擇「立即更新」才會 `SKIP_WAITING`。 |

## Production browser regression

| Viewport | 結果 |
| --- | --- |
| 390×844 | Login production preview 視覺檢查通過；無 console error。 |
| 430×932 | Login heading 正常呈現；console error=0。 |
| 768×1024 | Login heading 正常呈現；console error=0。 |
| 1280×900 | Login heading 正常呈現；console error=0。 |

Browser automation 對 `document`／`navigator` 的讀取受限，因此 service worker registration 與水平捲動的判定以 production served manifest／worker、UI snapshot、`check:pwa-cache` 及既有 RWD screenshots 交叉驗證；未虛構離線瀏覽器斷網測試結果。

## Bundle report

- 最大 JavaScript chunk：`440.17 KiB`（預算 `500.00 KiB`）。
- 原本的單一 `635.87 kB` JS chunk 已拆成主 chunk 加 route chunks；Vite 建置不再輸出 500 kB chunk warning。
- 最大非 JS asset：Today Figma hero PNG，`1,408.92 KiB`；保留為既有正式 Figma 合成圖，不納入 JS 預算。
