# 前端 ↔ Figma｜協作通道

最後更新：2026-08-28 15:41:54 +08:00（Asia/Taipei）

### 2026-08-28 15:41:54 +08:00｜前端｜RWD IMPLEMENTED
- 依 `105:21`、`105:34`、`105:47`、`105:60` 完成 390／430／768／1280 共用 responsive shell。
- 1280 已加入 88px sidebar，Today 為 720＋320，Planner／Explore／People 形成規格要求的雙欄；未更改 Figma 資訊架構。
- 六路由四 viewport 無水平溢位；證據與量測見 `docs/reference/FRONTEND_RWD_DELIVERY_2026-08-28.md` 與 `docs/evidence/rwd-2026-08-28/`。

### 2026-08-27 16:58:24 +08:00｜前端｜DONE
- 查核節點：Figma file `7fFURmWK9uPeYiVTMnMsBQ`、Today node `28:3`。
- 實作決議：不改動 Figma 原始版面；直接採用節點輸出的正式 Hero 合成圖，重現底部波浪輪廓與圖內所有視覺元素。
- 前端補強：在圖上保留「筆記」互動熱區與無障礙名稱；下方日期、檢視切換與行程資料仍維持語意化 DOM。
- 驗收：390×844 參考對照通過，430×932、768×1024、1280×900 無水平溢出；詳見根目錄 `design-qa.md`。
- 後續若要把 Hero 內文字改為動態資料，需先由 Figma 設計師確認拆層規格後再改版。

## 此文件處理什麼

- node-specific Figma URL、components、variants、tokens
- icons／images／fonts 與授權
- responsive、Light／Dark、WCAG 視覺風險
- motion、loading、success、error、offline、reduced-motion
- Figma 與前端四 viewport 視覺比較

API、schema 或 RLS 問題不要寫在這裡。

## Figma 現況

- File key：`7fFURmWK9uPeYiVTMnMsBQ`
- 19 個頂層手機畫面；本批新增 Input component set 與 M1 Spec & QA 規格頁；沿用 55 variables。
- P0 景點加入 Prototype 已完成。
- 本批狀態：variants、正式 icon mapping、responsive、Dark／AA 規格及 motion 決議已提交 REVIEW。

## Figma 要交付前端

- [x] Button、Input、ItineraryRow、StatusNotice 完整 variants
- [x] Bottom Nav、返回、更多、拖曳、地圖、導航 icons／SVG mapping 規格
- [x] 390×844、430×932、768×1024、1280×900 規則
- [x] motion duration／easing／delay 與 reduced-motion
- [x] 登入、總覽、權限的 M1 必要狀態
- [x] 每項交付的 node URL 與驗收截圖

## 前端要交付 Figma

- [ ] 四 viewport 實作截圖
- [ ] Figma／implementation 並排差異
- [ ] 無法映射的元件／token 清單
- [ ] 實際文字溢位、safe area、鍵盤或 responsive 問題
- [ ] 需要設計決議的互動錄影或可重現步驟

## 已決議（詳見 `105:73`）

1. 拖曳 placeholder 與跨日 drop zone。
2. 成功 Toast 或 StatusNotice 的分流。
3. 衝突完成後返回行程的 transition。
4. 地圖／清單 bottom sheet。
5. Day Selector indicator 與 swipe。
6. Undo Toast 與 Realtime 規則。

## 問題格式

```md
### YYYY-MM-DD HH:mm:ss +08:00｜FE/FIGMA｜DEC/TODO/BLOCKED
- ID：DES-YYYY-MM-DD-NN
- Figma node／前端路由：
- 問題截圖或證據：
- 建議方案：
- 需要誰回覆：
- 決議：
```

## 更新紀錄

### 2026-08-28 15:31:39 +08:00｜經理→前端｜RWD IMPLEMENTATION REQUIRED

- Figma responsive 規格已存在於 `105:20`，缺的是前端完整實作與證據，不退回 Figma。
- 目前差異：Planner／Explore 在 768／1280 僅為 560px 置中容器；People 維持 390px；1280 缺 88px sidebar，未符合 `105:60`。
- 前端需依 `105:21`、`105:34`、`105:47`、`105:60` 完成共用 responsive shell，再交同 viewport 截圖與並排差異；Figma 維持 WAIT，除非實作時發現規格互相衝突。

### 2026-08-28 15:07:50 +08:00｜經理｜ACCEPTED／WAIT

- ID：DES-2026-08-28-04
- 驗收結論：已以 Figma `103:53` metadata 及 `104:2`、`105:20`、`107:20` 當次截圖核對，接受本批 M1 設計交付；Figma 停止修改。
- 接受項目：九個主流程狀態掛接、Button／Input／ItineraryRow／StatusNotice variants、四 viewport 規則、六項 motion／focus／reduced-motion 決議、Light／Dark 樣本及 74-key asset mapping。
- 不屬於 Figma 完成聲明：瀏覽器 computed contrast、鍵盤與讀屏、200% reflow、safe-area／軟鍵盤、實際 reduced-motion、SVG 匯出與 Code Connect records；全部移交前端實測與導入。
- 紀錄修正：根目錄 `.figma-design-state.json` 已由 8 月 26 日舊狀態同步為 M1 accepted，避免協作文件與 checkpoint 相互矛盾。
- 下一位：前端工程師；前端交付實作截圖與差異後，只有發現明確設計缺口才退回 Figma。

### 2026-08-28 15:03:38 +08:00｜FIGMA｜REVIEW

- ID：DES-2026-08-28-04
- 工序狀態：本批 Figma 工作已完成並停止；前端、後端仍為 WAIT，等待經理驗收與切換。
- 狀態掛接：`M1 Spec & QA / State Attachments` `104:2`；Login `104:3`、Trip Overview `104:11`、Today `104:19`、Planner `104:27`、Explore `104:35`、Place Details `104:43`、Add `104:51`、Conflict `104:59`、People `104:67`。各卡已標註進入條件、主要 CTA、返回／焦點及來源 screen node。
- 元件 variants：Button set `16:36`（新增 pressed `102:2`、focused `102:4`、loading `102:6`、error `102:8`、read-only `102:10`）；Input set `102:34`（7 states，說明 `102:35`）；ItineraryRow set `25:16`（8 variants）；StatusNotice set `21:23`（7 variants，含 error／offline／syncing）。均沿用既有 variables。
- Responsive 證據：規格區 `105:20`；390×844 `105:21`、430×932 `105:34`、768×1024 `105:47`、1280×900 `105:60`。已標註 Today `28:3`、Planner `61:44`、Explore `61:45`／`61:46`、Login `50:44` 的 grid、最大內容寬、Bottom Nav／sidebar、safe area、長文字與鍵盤避讓規則。
- Motion／interaction：規格區 `105:73`；拖曳／跨日 drop `105:74`、Toast vs StatusNotice `105:79`、衝突 transition `105:84`、地圖 bottom sheet `105:89`、Day swipe `105:94`、Undo／Realtime `105:99`。每項均含 duration、easing、focus 與 reduced-motion。
- Accessibility／asset handoff：規格區 `107:20`；Light `107:21`、Dark `107:31`、icon mapping `107:41`。74-key 正式 component sets：Category `91:62`、UI Action `99:74`、Trip Utility `100:62`、Status & Service `101:32`，另有 Badge State `94:23`。來源為本專案自製幾何向量，未混用第三方 icon library；規格為 24×24 viewBox、1.8px rounded stroke，並記錄 SVG／Code Connect 對映方向。
- Figma 已驗證：Light／Dark token 套用、可見 focus、44×44 target、狀態不只依靠顏色、元件 metadata 與畫面截圖。
- 前端仍需實測：瀏覽器 computed contrast、鍵盤順序與焦點返回、螢幕閱讀器、200% reflow、safe-area／軟鍵盤、reduced-motion；實際 SVG 匯出與 Code Connect records 於前端導入回合完成。
- 未決事項：四 viewport 目前為精確尺寸的規則／證據板，不是四份完整畫面複製稿；前端完成後仍須提交實作截圖並做並排差異驗收。

### 2026-08-28 14:52:27 +08:00｜經理→FIGMA｜ACTIVE／P0

- ID：DES-2026-08-28-04
- 工序狀態：後端 M1 核心已通過驗收；現在只啟動 Figma 設計師。前端與後端均 WAIT，不得平行修改。
- 任務 1：將 loading／empty／error／permission／offline／session expired／saving／success instances 掛接至 Login、Trip Overview、Today、Planner、Explore、Place Details、Add、Conflict、People；標出進入條件、主要 CTA、返回位置與 node URL。
- 任務 2：完成 Button、Input、ItineraryRow、StatusNotice 的 default／pressed／focused／disabled／loading／error／read-only 必要 variants，使用既有 variables。
- 任務 3：交付 390×844、430×932、768×1024、1280×900 的 grid、最大內容寬、Bottom Nav／sidebar、safe area、長文字與鍵盤避讓規則；至少附 Today、Planner、Explore、Login 證據。
- 任務 4：決定拖曳 placeholder／跨日 drop zone、Toast vs StatusNotice、衝突完成 transition、地圖 bottom sheet、Day Selector swipe、Undo／Realtime；每項附 duration、easing、focus、reduced-motion。
- 任務 5：提供 74-key 正式來源 library／授權、Figma variant → 前端 key mapping、SVG／Code Connect 可用輸出，讓前端移除手工 inline SVG。
- 任務 6：驗證 Light／Dark 文字與非文字對比、focus visible、44×44 targets、200% reflow、只靠顏色／icon 的狀態；區分 Figma 已驗證與仍需前端實測。
- 範圍限制：只處理 M1 主流程；Booking Vault、Version History、Public Share 等 P1 不擴充新功能。
- 完成定義：每項附 component／screen node URL、Light／Dark 截圖、四 viewport 標註與未決事項；完成後回報 REVIEW 並停止，不直接啟動前端。

### 2026-08-28 09:40:39 +08:00｜經理→FIGMA｜WAIT

- ID：DES-2026-08-28-03
- 驗收結論：接受 Today icon／對齊修正、74-key icon component sets 與 P0 System States 基線；不等於全站設計完成。
- 等待原因：專案一次只允許一位工程師／設計師工作，現在 active assignee 為後端工程師。
- 下一批已預排：先將八種 system states 掛接到 M1 主流程；再完成 390／430／768／1280 responsive 規則、六項 motion／interaction、Dark／WCAG 2.2 AA；交付正式 icon asset/library mapping，讓前端移除手工 SVG path。
- 禁止事項：等待期間不要修改 Figma；後端完成並由經理解鎖後才開始。

### 2026-08-28 09:36:30 +08:00｜FIGMA/FE/BE｜REVIEW

- ID：DES-2026-08-28-02
- Icon v1：共 74 stable keys；Category 20（`91:62`）、UI Action 24（`99:74`）、Trip Utility 20（`100:62`）、Status & Service 10（`101:32`），另有 Badge State 5 variants（`94:23`）。
- Figma 驗證：三個新增 component sets 均已完成 metadata／screenshot；所有 variants 為 24×24 vector、使用既有 `color/icon/default` variable。
- 前端 contract：`src/contracts/icons.ts` 為唯一 key registry；未知 category 正規化為 `generic`；舊 `today／plan／trash` 暫列 deprecated alias。
- 後端 contract：不保存 SVG、Figma node ID 或 UI action icon；migration `202608280001_icon_category_contract.sql` 對新 `places.category` 寫入限制 20 個 codes。
- 完整規則：`docs/design/ICON_CONTRACT.md`。
- 驗證：typecheck、3 test files／5 tests、production build 通過。

### 2026-08-28 09:27:20 +08:00｜FIGMA｜DONE

- ID：DES-2026-08-28-01
- 修正節點：Today Timeline `28:3`；時間欄 `40:39`／`40:48`／`40:55`；Timeline Connector `45:37`。
- 問題：三列時間文字寬度不同，導致 auto-layout 算出的 category badge 中心分別為 191px／186px／186px，視覺上明顯歪斜。
- 修正：三個時間欄固定為 51px 並靠右；三個 44px badge 的局部 x 統一為 63px；connector 移至 x=110.5px。
- 驗證：三個 badge 與 connector 的絕對中心均為 191px；`10:30` 恢復單行 29px 高，`12:30`／`14:30` 維持單行 26px；已重新取得 Today `28:3` 截圖確認。
- 決議：對齊問題已完成，不修改 icon 本身、行程文案、淡色線樣式或導航按鈕。

### 2026-08-27 17:09:09 +08:00｜FIGMA｜REVIEW

- ID：DES-2026-08-27-04
- Figma node／前端路由：Travel Category `91:62`；Category Badge `94:23`；P0 System States `93:44`；Today Timeline `28:3` → `/trips/:tripId/today`。
- 已完成：20 個穩定 category code 的 24px 向量 icon variants（44×44）；default／active／disabled／onAccent／dark 五狀態 badge；loading、empty、error、permission、offline、session expired、saving、success 八個 390×844 系統狀態畫面。
- Today 修正：移除「宮／湯／屋」文字節點 `40:41`／`40:50`／`40:57`，改為 heritage `93:141`、food `93:144`、neighborhood `93:147` instances；保留 Timeline Connector `45:37` 與 Navigation Icon `46:42`。
- 驗證證據：component set `91:62`、state set `94:23`、system states `93:44`、Today `28:3` 均已完成 metadata／screenshot 驗證。
- 設計決議：分類與狀態拆成兩個 component sets，避免 20×5 形成 100 variants；前端以 `ItineraryCategory` code 映射。
- 待完成：各主畫面逐頁掛接狀態 instance、Bottom Navigation 失效收藏入口、四 viewport responsive 標註、motion 六項決議、Dark／WCAG 2.2 AA 完整驗收。
- 需要誰回覆：前端接續全站 glyph mapping；經理確認下一批優先 responsive 或 motion。
- 決議：Today 正式 icon 缺口已解除；全站狀態已有共用設計基線。

### 2026-08-27 16:28:31 +08:00｜經理／FE/FIGMA｜CHANGES_REQUESTED

- ID：DES-2026-08-27-03
- Figma node／前端路由：Today Timeline `28:3` → `/trips/:tripId/today`；其餘缺頁見下方矩陣。
- 問題截圖或證據：`docs/evidence/frontend-figma-audit-2026-08-27/today-timeline-icon-issue.png`。目前「宮／湯／屋」是文字，不是可重用 icon；前端 `src/features/today/TodayPage.tsx` 以 `item.title.slice(-1)` 產生圓形標記，換名稱或語言即失效。Bottom Navigation 也仍使用 `⌂／▤／♡／◎` 字符。
- 建議方案：Figma 先完成語意化 icon component set、頁面與狀態缺口，再由前端依固定名稱及 category mapping 導入；禁止再以標題尾字、emoji 或 Unicode glyph 代替圖示。
- 需要誰回覆：Figma 提交 component node URLs、SVG mapping 與驗收圖；前端提交導入 PR／commit、四 viewport 截圖及無障礙結果。
- 決議：本項未完成前，Today Timeline 與全站 icons 不列為視覺定稿；前端可繼續 M1 資料層／Auth，不等待 icon，但不得擴散現有 glyph 實作。

#### Figma：正式 Icon System 交付

建立單一 component set：`Icon / Travel Category`，全部使用同一套合法授權的向量圖示語言，不混用不同 icon library。

| Variant key | 用途 | 畫面例子 |
|---|---|---|
| `heritage` | 宮殿、古蹟、寺廟 | 景福宮；取代「宮」 |
| `food` | 餐廳、在地料理 | 土俗村蔘雞湯；取代「湯」 |
| `neighborhood` | 聚落、街區、建築 | 北村韓屋村；取代「屋」 |
| `cafe`、`shopping`、`nature`、`museum`、`activity` | 常見景點分類 | 探索與行程共用 |
| `hotel`、`airport`、`flight`、`train`、`subway`、`bus`、`walk`、`taxi`、`ferry` | 住宿與交通 | 行程、航班與轉乘 |
| `ticket`、`reservation`、`generic` | 票券、訂位、未知分類 fallback | 全站共用 |

Figma 規格：

- 24×24 vector grid、圓角端點／接點、統一視覺重量；提供 16／20／24 三種使用尺寸。
- Timeline category badge 使用 44×44 容器；active 為橘色底＋白色 icon，default 為米色底＋深色 icon。
- variants 至少包含 `default`、`active`、`disabled`、`onAccent`、`dark`。
- 同時補齊 Bottom Nav、返回、更多、拖曳、定位、導航、收藏、分享、編輯、刪除、衝突、鎖定與離線 icons。
- 每個元件交付 component node URL、名稱、variant props、Light／Dark 截圖、SVG 或可供 Code Connect 對映的來源；SVG 必須有一致 `viewBox`，不可把文字輪廓當 icon。
- icon-only control 在 Figma 標出 accessible label；警告、權限或衝突狀態不可只靠顏色或 icon 表達。

#### 前端：導入規則

- 建立統一 `Icon` adapter 與 `ItineraryCategoryIcon`；頁面不得自行貼 SVG path 或 Unicode 字符。
- 由穩定的 `place.category`／`item.category` 映射 variant，禁止從中文標題推測分類；未知值一律使用 `generic`。
- decorative icon 使用 `aria-hidden="true"`；icon-only button 必須有中文可讀 `aria-label` 與 44×44 最小觸控區。
- 替換 Today Timeline、Bottom Navigation 及所有 `←`、`›`、`•••` 等假 icon；保留文字標籤，避免只靠圖示理解。
- 完成後交付 390×844、430×932、768×1024、1280×900 截圖，以及 axe／鍵盤焦點／200% zoom 結果。

#### 頁面與狀態完整性矩陣

| 優先級 | Figma／前端現況 | Figma 下一步 | 前端下一步 |
|---|---|---|---|
| P0 | Figma 已有 Place Details、Edit Itinerary、Quick Adjust、Flight Change Reschedule；前端尚無對應 routes | 補齊 loading／empty／error／read-only 與返回路徑，標出節點 URL | 新增路由並依定稿實作 |
| P0 | 加入行程與衝突流程已有主畫面，但缺 no-conflict、saving、success、failure 分支 | 畫完四個分支與 copy、焦點返回、Undo 行為 | 實作完整 async state，不只 happy path |
| P0 | 登入、旅程總覽、旅伴權限有主畫面 | 補首次使用、無旅程、邀請有效／過期／撤回／無權限／session expired | 建立 protected route 與對應狀態 |
| P0 | 行程編排缺空白日、跨日拖曳、drop zone、刪除確認、同步失敗 | 將互動規則與 responsive 版面畫清楚 | 依規則接 optimistic update／rollback |
| P1 | Booking Vault、Version History、Public Share Figma 已有；M1 暫緩且前端未實作 | 保留完整 flow：列表／詳情／新增編輯／刪除確認；分享成功／撤回／過期；版本 diff／restore confirm | M1 後再導入，不先做假流程 |
| P1 | 收藏 Bottom Nav 目前存在但不可用，尚無完整畫面 | 決定 M1 隱藏或補收藏列表／資料夾／空狀態；不可保留失效入口 | 依決議隱藏或實作，禁止 disabled dead end |
| P1 | 設定缺帳號、語言、通知、地圖、離線同步等子頁 | 補資訊架構、危險操作確認與權限限制 | 與 backend contract 對齊後實作 |
| 全站 | responsive、Dark、WCAG、offline／syncing／sync failed 尚未驗證完整 | 每個 template 補四 viewport 與狀態標註 | 視覺比對、safe area、鍵盤、reduced-motion 驗收 |

#### 本批完成定義

- [ ] Figma 不再出現「宮／湯／屋」或其他符號字元充當 icon。
- [ ] Icon component set 與頁面 instance 全部用 component/variant，不是散落 vector。
- [ ] 缺頁矩陣每一列都有 node URL、流程起點／終點與狀態分支。
- [ ] 前端以 category code 顯示 icon，改名與切換語言不影響分類。
- [ ] Bottom Navigation 不再有無效入口；路由與選取狀態一致。
- [ ] 四 viewport、Light／Dark、WCAG 2.2 AA 與 reduced-motion 有可追溯驗收證據。

### 2026-08-27 11:27:00 +08:00｜FE/FIGMA｜DONE

- ID：DES-2026-08-27-02
- Figma node／前端路由：`50:44` → `/login`；`28:6` → `/trips/:tripId/overview`；`28:9` → `/trips/:tripId/people`；`50:45` → `/trips/:tripId/settings`；`50:47` → `/trips/:tripId/budget`。
- 問題截圖或證據：已重新取得五個節點 design context；390×844 實機證據位於 `docs/evidence/figma-check-2026-08-27/`，五頁皆為 `scrollWidth === clientWidth === 390`。
- 建議方案：已依查核後 Figma 定稿修正登入與總覽的手機版型、橘色摘要卡、卡片尺寸及 80px Bottom Navigation，並接續完成權限、設定、預算頁。
- 需要誰回覆：無；若後續 icon library 提供正式 SVG，再以原 glyph 對位替換目前 Figma 符號字元。
- 決議：本批僅實作已存在且完成查核的 Figma 節點，未擴充未決議版面。

### 2026-08-27 10:59:24 +08:00｜FE/FIGMA｜TODO

- ID：DES-2026-08-27-01
- Figma node／前端路由：登入 node `50:44` → `/login`；總覽 node `28:6` → `/trips/:tripId/overview`。
- 問題截圖或證據：`docs/evidence/overview-mobile-360.png`、`overview-mobile-430.png`、`overview-tablet-768.png`、`overview-desktop-1440.png`；四尺寸無水平溢位。
- 建議方案：本批僅套用 Figma 的暖色底、影像主視覺、編輯式字級層次與卡片節奏；60fps.design 僅吸收回饋速度、reduced-motion 與低干擾轉場原則，未改資訊架構。
- 需要誰回覆：Figma 設計師確認正式 390／430／768／1280 responsive 規則、icons 與既列六項 motion 決議。
- 決議：待 Figma 設計師；前端不自行修改原始版面或將暫定 motion 視為設計定稿。

### 2026-08-27 10:33:13 +08:00｜經理｜TODO

- Figma 下一批限定為狀態、icons、responsive 與六項互動決議。
- 不主動擴充 M1 以外畫面。
