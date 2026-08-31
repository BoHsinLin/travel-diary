# Travel Icon Contract v1

最後更新：2026-08-28 15:25:04 +08:00（Asia/Taipei）

## 前端正式映射

- React adapter：`src/components/icons/Icon.tsx`。
- 資產來源：`lucide-react@2.112.4`（由 package lock 固定版本），不再保存手工 inline SVG path。
- Figma stable key 仍由 `src/contracts/icons.ts` 管理；adapter 使用 `data-icon-key` 留下 DOM 可追溯標記。
- Figma node 對照：Category `91:62`、UI Action `99:74`、Trip Utility `100:62`、Status & Service `101:32`。

## 原則

- 資料庫只保存語意 code，不保存 Figma node ID、SVG、emoji 或中文顯示文字。
- key 採小寫 kebab-case；發布後不改變既有 key 的意思，只能新增或標記 deprecated。
- 未知 category 一律正規化為 `generic`；警告、錯誤、權限與離線狀態必須同時提供文字。
- decorative icon 使用 `aria-hidden`；icon-only control 必須有中文 `aria-label` 及至少 44×44 觸控區。

## Figma component sets

| 分組 | Node | Keys |
|---|---|---:|
| Category | `Icon / Travel Category` `91:62` | 20 |
| UI Action | `Icon / UI Action` `99:74` | 24 |
| Trip Utility | `Icon / Trip Utility` `100:62` | 20 |
| Status & Service | `Icon / Status & Service` `101:32` | 10 |
| Badge State | `Icon / Category Badge` `94:23` | 5 states |

完整 key 的單一程式來源為 `src/contracts/icons.ts`。Figma variant 使用 `Key=<key>`；Category 使用 `Category=<key>`。

## 後端界線

- `places.category` 只接受 20 個 `ItineraryCategory` codes；migration `202608280001_icon_category_contract.sql` 對新資料加上 constraint。
- UI Action、Trip Utility icons 不進資料庫，由 route、capability 或元件狀態決定。
- sync／offline／conflict 等 icon 由既有狀態 contract 映射，不另增 `icon` 欄位。
- 舊資料若不是允許值，API adapter 必須回傳 `generic`；完成資料清理後再 `VALIDATE CONSTRAINT places_category_code_check`。

## 相容策略

前端暫時保留 `today`、`plan`、`trash` 三個舊別名，分別遷移至 `home`、`itinerary`、`delete`。尚未在 React path registry 實作的新 key 會安全 fallback 到 `generic`，但正式頁面交付前必須補齊對應 path 並完成視覺測試。
