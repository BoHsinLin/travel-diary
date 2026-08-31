# 日韓旅遊規劃 PWA｜前端稽核修正回報

更新時間：2026-08-27 09:07:52 +08:00（Asia/Taipei）  
對應指派：`FRONTEND_AUDIT_2026-08-26.md`

## 已完成

- 重新取得 Figma `28:3`、`61:44`、`61:45`、`61:47`、`61:48` design context 後實作。
- 移除合成 UI 截圖；使用圖片編輯產生無文字、按鈕、頭像及波浪邊界的純首爾街景。
- Hero 所有旅伴、筆記、標題、日期、地點與天氣改為真實 DOM。
- Hero 輸出 WebP，production asset 由約 1.44 MB 降至約 262 KB。
- 手機 App Shell 改為使用完整 viewport 寬度；桌面採 main＋aside 雙欄，而非手機殼置中。
- 今日時間軸重做連接線、下一站階層與「開始導航」操作。
- 地圖模式加入 mock 路線、三個 pins 與路線摘要，不再顯示空白 placeholder。
- 行程編排 header 改為象牙白／紙張式 editorial hierarchy，柿橘保留於選取與主操作。
- 收藏、旅伴改為明確 disabled「即將推出」狀態，不觸發不存在的路由。
- 新增 route-level 404；未知路由不再靜默回到今日頁。
- 建立 mock repository interface 與共享 trip state。
- 完成可操作 vertical slice：日期切換、拖放或鍵盤按鈕排序、探索景點、加入設定、衝突方案、套用後回寫 Day 2。
- 新增景點探索、加入行程設定與衝突處理頁。

## 驗證

- TypeScript：通過。
- Vite production build：通過。
- Production Hero WebP：262,218 bytes。

## 尚待後續

- 四個 viewport 的新截圖與 Figma 並排差異報告。
- unit test、accessibility smoke test 與 visual regression 自動化。
- 取得正式核准 icon library／Figma SVG mapping 後補回底部導覽 icon。
- dnd-kit 鍵盤 sensor 與完整 Undo toast；本批提供原生拖放＋明確上／下移按鈕。
