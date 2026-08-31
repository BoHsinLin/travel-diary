# 日韓旅遊規劃 PWA｜文件入口

最後更新：2026-08-27 10:33:13 +08:00（Asia/Taipei）

## 唯一有效文件

1. [`PROJECT_HUB.md`](./PROJECT_HUB.md)：整體進度、里程碑、優先級、各端工作。
2. [`coordination/FRONTEND_BACKEND.md`](./coordination/FRONTEND_BACKEND.md)：前端與後端的 contract、API、阻塞及交付。
3. [`coordination/FRONTEND_FIGMA.md`](./coordination/FRONTEND_FIGMA.md)：前端與 Figma 的設計決議、資產、視覺驗證及 motion。
4. [`coordination/FRONTEND_MANAGER.md`](./coordination/FRONTEND_MANAGER.md)：前端向專案經理回報進度、風險、驗收與決策請求。

根目錄不再新增進度 Markdown。舊文件統一放在 `docs/archive/`，只能作歷史證據，不能作為最新任務指令。

## 寫入規則

- 所有更新必須附 `YYYY-MM-DD HH:mm:ss +08:00（Asia/Taipei）`。
- 不覆寫他人紀錄；在對應文件的「更新紀錄」最上方新增一筆。
- 一筆更新必須包含：作者角色、狀態、交付物、阻塞、需要誰回覆、期限或下一檢查點。
- 任務狀態只使用：`TODO`、`DOING`、`BLOCKED`、`REVIEW`、`DONE`。
- 需求或設計有變更時，必須寫 Decision ID，例如 `DEC-2026-08-27-01`。
- 程式碼完成不等於驗收完成；需附 build／test／截圖／migration 等證據。

## 各角色寫哪裡

| 角色 | 主要寫入位置 | 寫入內容 |
|---|---|---|
| 專案經理 | `PROJECT_HUB.md`、`FRONTEND_MANAGER.md` | 優先級、里程碑、決策、驗收、跨端阻塞 |
| 前端 | 三份 coordination 文件 | contract 問題、設計問題、進度、證據與決策請求 |
| 後端 | `FRONTEND_BACKEND.md` | schema、types、RLS、RPC、Realtime、錯誤碼、環境 |
| Figma | `FRONTEND_FIGMA.md` | node URL、variants、icons、responsive、motion、文案狀態 |

## 禁止事項

- 不要另建 `progress-final-v2.md` 等平行版本。
- 不要在 archive 文件追加新指令。
- 不要只寫「已完成」；必須附可驗證位置。
- 不要把 secret、token、API key、個資寫進文件。

