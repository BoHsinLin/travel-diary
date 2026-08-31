# 旅程誌 UI／UX 動效參考｜60fps.design

研究時間：2026-08-27 10:25:13 +08:00（Asia/Taipei）  
參考來源：[60fps.design](https://60fps.design/)

## 採用原則

60fps.design 的核心價值是「delightful details」：以短、可理解、具因果關係的微互動，讓使用者知道操作已被接收、狀態正在改變、結果已完成。旅程誌不採用其黑白展示站版面，而只吸收互動方法。

本次研究聚焦 Drag、Map、Tabs、Success State、Toast 五類案例，轉譯為：

- 按鈕按壓：140ms 內縮放至 0.97，鬆開後回彈。
- Tab／Segmented Control：顏色與選取狀態在 140–220ms 內連續切換。
- 拖曳：項目升起、陰影加深、微量放大；放下後回到列表層級。
- 清單進場：同一組項目以 45ms 間隔輕微 stagger，避免突然整頁跳出。
- 地圖：pins 以低強度週期提示目前路線焦點，不使用高干擾彈跳。
- 成功狀態：notice 由上方短距離進場並快速穩定，不用 confetti 破壞行程工具感。
- 所有動效遵守 `prefers-reduced-motion`，降為接近即時切換。

## 已直接納入（不改 Figma 版面）

- motion duration／easing／floating shadow tokens。
- 全域 pressed、hover、focus-visible 回饋。
- 頁面、時間軸、景點卡 stagger entrance。
- 行程列 dragging elevation。
- 地圖 pins 低強度 focus pulse。
- 成功 notice entrance。
- reduced-motion fallback。

## 未採用

- 純裝飾性 bounce、spin、confetti、長時間 idle animation。
- 改變旅程誌象牙白／柿橘／森林綠品牌的高對比黑白展示風格。
- 為了動效新增不必要步驟或降低資訊可讀性。

## 驗收指標

- 常用操作回饋在 100–250ms 出現。
- 內容轉場不阻擋下一步操作。
- 60Hz 裝置上避免 layout thrashing；優先使用 transform／opacity。
- reduced-motion 下流程與資訊完全可用。
