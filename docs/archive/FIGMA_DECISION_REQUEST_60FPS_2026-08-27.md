# Figma 設計決議請求｜60fps 動效延伸

提出時間：2026-08-27 10:25:13 +08:00（Asia/Taipei）  
狀態：等待 Figma 設計師決議；以下項目尚未修改正式版面

## 決議原則

程式端已加入不改版面的微互動。以下建議會改變版面、內容或元件 variants，依使用者要求，必須由 Figma 設計師先確認後才能實作。

## 待決議項目

1. 行程拖曳時是否顯示原位置 placeholder 與跨日 drop zone。
2. 景點加入成功是否使用底部 Toast、頂部 StatusNotice，或兩者依情境分流。
3. 衝突解決套用後，是否使用 shared-element transition 返回行程列。
4. 地圖與清單切換是否採 bottom sheet，及手機 sheet 的停靠高度。
5. Day Selector 是否加入滑動指示器，並同步支援水平 swipe。
6. Undo Toast 的位置、停留時間、倒數呈現與多人 Realtime 規則。

## 建議決議輸出

- 對應 component variants 與命名。
- 進場／退場 duration、easing、delay。
- loading／success／error／offline／reduced-motion 對照。
- Prototype 連線與返回行為。

決議完成後再更新 `FIGMA_PROGRESS.md`、`.figma-design-state.json` 與前端 motion tokens。
