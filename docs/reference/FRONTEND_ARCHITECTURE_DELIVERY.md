# 日韓旅遊規劃 PWA｜前端架構設計交付

交付時間：2026-08-26 17:07:52 +08:00（Asia/Taipei）  
文件版本：v1.0  
交付狀態：可作為前端初始化與 MVP Slice 1 的開工基準

## 1. 盤點結論

工作區目前沒有 `package.json`、`src/`、前端框架設定、測試或部署設定，因此本次交付是依既有產品／前後端交接文件與 Figma 設計建立「新專案架構規格」，並非對既有程式碼重構。

已核對的本地來源：

- `HANDOFF_FRONTEND.md`
- `HANDOFF_BACKEND.md`
- `HANDOFF_FIGMA.md`
- `FIGMA_PROGRESS.md`
- `PROJECT_STATUS.md`
- `.figma-design-state.json`
- `IMG_panel`、`IMG_panel_hero.png`

已取得 Figma design context 並抽樣核對：

- `28:3` 今日行程／時間軸
- `28:6` 旅程總覽
- `61:44` 行程編排工作台
- `61:46` 景點搜尋與篩選
- `61:48` 時間衝突處理

Figma 來源：[Core Screens](https://www.figma.com/design/7fFURmWK9uPeYiVTMnMsBQ?node-id=28-2)。目前共有 19 個頂層手機畫面、12 個共用元件、55 個設計變數；核心設計約完成 62%。

## 2. 架構決策摘要

採用 React + TypeScript + Vite 的 feature-first 單頁 PWA。頁面只負責組合與路由，產品邏輯放在 feature／domain，所有遠端與 mock 資料均經 repository interface。這可讓 UI 先以 mock data 完成，再無痛切換 Supabase adapter。

建議基線：

- 路由：React Router
- Server state：TanStack Query
- 表單與驗證：React Hook Form + Zod
- 後端：Supabase JS client
- 拖放：dnd-kit，需同時支援鍵盤操作
- PWA：Vite PWA plugin／Workbox
- 單元與元件測試：Vitest + Testing Library + axe
- E2E：Playwright
- 樣式：CSS Modules + 全域 design tokens；不為 Figma 參考碼額外引入 Tailwind
- 圖示：建立單一 icon adapter；最終 glyph 以 Figma 匯出資產或已驗證相符的 icon library 為準

## 3. 建議目錄

```text
src/
  app/
    App.tsx
    router.tsx
    providers.tsx
    query-client.ts
    error-boundary.tsx
  assets/
    images/
    icons/
    fonts/
  components/
    primitives/       # Button、IconButton、Input、Dialog、Toast、Skeleton
    navigation/       # AppShell、BottomNavigation、PageHeader
    feedback/         # StatusNotice、EmptyState、ErrorState、SyncIndicator
  design-system/
    tokens.css
    themes.css
    typography.css
    global.css
  contracts/
    entities.ts
    enums.ts
    errors.ts
    pagination.ts
    realtime.ts
  features/
    auth/
    trips/
    today/
    itinerary/
    places/
    companions/
    bookings/
    budget/
    history/
    sharing/
    settings/
  repositories/
    interfaces/
    mock/
    supabase/
  services/
    auth/
    maps/
    pwa/
    telemetry/
  test/
    fixtures/
    factories/
    mocks/
  main.tsx
```

每個 feature 統一包含 `components/`、`pages/`、`hooks/`、`schemas/`、`queries.ts`、`mutations.ts` 與 `index.ts`，但只在實際需要時建立，避免空資料夾與過度抽象。

## 4. 分層與依賴規則

```text
route/page → feature hooks/use-cases → repository interface → mock 或 Supabase adapter
     ↓                 ↓
shared UI          contracts/domain
```

- `app` 可組合所有 feature，但不包含產品規則。
- `features` 可依賴 `components`、`contracts` 與 repository interface，不可直接呼叫 Supabase。
- `repositories/supabase` 負責 DTO、資料庫 generated types 與 domain model 的映射。
- `components/primitives` 不可依賴 feature。
- mock data 只存在 `repositories/mock` 或測試 fixtures，不放在頁面元件。
- 權限由後端 RLS 最終裁決；前端 capability guard 只控制體驗，不作安全邊界。

## 5. 路由與版型

| 路由 | 頁面／用途 | Figma 對照 |
|---|---|---|
| `/login` | 登入與 Magic Link | `50:44` |
| `/invite/:token` | 邀請預覽／接受 | `50:44` |
| `/trips` | 旅程選擇；Figma 尚待補完整列表 | 待確認 |
| `/trips/:tripId/overview` | 旅程總覽 | `28:6` |
| `/trips/:tripId/today` | 今日時間軸／地圖 | `28:3`、`28:4` |
| `/trips/:tripId/plan` | 行程編排工作台 | `61:44` |
| `/trips/:tripId/places` | 附近、熱門、搜尋 | `61:45`、`61:46` |
| `/trips/:tripId/places/:placeId` | 地點詳情 | `28:7` |
| `/trips/:tripId/plan/add/:placeId` | 加入設定與衝突處理 | `61:47`、`61:48` |
| `/trips/:tripId/bookings` | 預訂與文件 | `50:46` |
| `/trips/:tripId/budget` | 預算與分帳 | `50:47` |
| `/trips/:tripId/people` | 旅伴與權限 | `28:9` |
| `/trips/:tripId/history` | 版本紀錄 | `50:48` |
| `/trips/:tripId/settings` | 旅程設定與步調 | `50:45` |
| `/share/:token` | 公開唯讀頁，獨立於登入 session | `50:49` |

版型分成 `PublicLayout`、`AuthLayout`、`TripLayout`。`TripLayout` 在手機使用 80px 底部導覽並處理 safe-area；平板／桌面改為置中內容欄或側欄，禁止單純把 390px 畫面無限制拉寬。

## 6. Figma 視覺系統映射

設計以 390×844 為主要 viewport，今日時間軸可延伸至 878px。全域 token 應直接映射 Figma semantic variables：

```css
:root {
  --color-bg-canvas: #fff9f0;
  --color-bg-surface: #ffffff;
  --color-bg-subtle: #f7eedf;
  --color-bg-accent: #e8753d;
  --color-bg-accent-soft: #e9ddcb;
  --color-bg-positive: #386a4a;
  --color-text-primary: #292725;
  --color-text-secondary: #514d49;
  --color-text-muted: #7b756f;
  --color-text-on-accent: #ffffff;
  --color-border-default: #e9ddcb;
  --radius-lg: 16px;
  --radius-xl: 24px;
}
```

以上色值是目前 design context 的 fallback，正式開發時需由 Figma variables 匯出表覆核 Light／Dark 值，不應散落在元件內。

- 介面字體：Noto Sans TC。
- 品牌標題／日期／時間：Noto Serif TC。
- 一般觸控目標至少 44×44px；返回控制目前為 88×44px。
- 主按鈕多為 50px 高、17px 圓角；行程卡約 82px 高、16px 圓角。
- 圖片需有固定容器、明確寬高與 `object-fit: cover`，不可依賴 intrinsic size。
- Figma 仍含符號字元圖示，實作前必須替換為正式匯出 icon，不把 `⌂`、`▤`、`⋮⋮` 當成最終 UI。

## 7. 共用元件策略

優先對應 Figma 現有元件：`Button`、`IconButton`、`SegmentedControl`、`Avatar`、`AvatarGroup`、`PaceChip`、`DaySelector`、`StatusNotice`、`BottomNavigation`、`ItineraryRow`、`FixedAnchor`、`NextStopPanel`。

第一批 primitives 必須同時定義：

- Button：default、pressed、disabled、loading、focus-visible。
- Input：empty、filled、focus、error、disabled、read-only。
- ItineraryRow：normal、dragging、drop-target、fixed、conflict、offline-pending。
- StatusNotice：saving、synced、offline、sync-failed、permission-denied。
- 頁面容器：loading、empty、no-result、error、retry、read-only。

使用 props／variant 驅動狀態，不複製多份外觀相近元件。所有互動元件需保留語意 HTML、鍵盤焦點與可讀標籤。

## 8. 領域模型與資料存取

第一版 shared contract 至少包含：

- `Role = owner | admin | editor | viewer`
- `Trip`、`TripMember`、`TripDay`
- `ItineraryItem`、`AnchorType`、`ItemStatus`、`Conflict`
- `Place`、`PlaceSource`、`PlaceVerification`
- `SyncState`、`AppError`、`PageResult<T>`

核心 repository 介面：

```ts
interface TripRepository {
  listTrips(): Promise<Trip[]>;
  getTrip(tripId: string): Promise<Trip>;
}

interface ItineraryRepository {
  getDay(tripId: string, dayId: string): Promise<TripDay>;
  addItem(input: AddItineraryItemInput): Promise<AddItemResult>;
  reorder(input: ReorderItineraryInput): Promise<TripDay>;
  resolveConflict(input: ResolveConflictInput): Promise<TripDay>;
}

interface PlaceRepository {
  search(query: PlaceSearchQuery): Promise<PageResult<Place>>;
  getPlace(placeId: string): Promise<Place>;
}
```

所有時間使用 ISO 8601 + IANA timezone；畫面以旅程 timezone 格式化。金額使用整數最小單位或 decimal 字串，禁止浮點數直接計算。

## 9. 狀態管理與同步

- TanStack Query 管理旅程、日期、景點與成員等 server state。
- URL search params 保存可分享的搜尋／篩選條件。
- React local state 處理短暫 UI 狀態；不另加全域 store，除非出現跨 feature 且非 server state 的明確需求。
- 表單狀態由 React Hook Form 管理，Zod schema 同時作前端驗證與 contract 邊界檢查。
- 拖放採 optimistic update；失敗時回滾並顯示可重試訊息。
- Realtime event 先經 trip scope 與 version 檢查，再更新 query cache。
- `SyncState` 至少區分 `saving`、`synced`、`offline`、`failed`、`conflict`。
- MVP 僅承諾離線讀取；離線編輯不可在沒有衝突策略前悄悄排隊上傳。

## 10. 核心流程切片

### Slice 1：Mock 可操作 UI

1. App shell、tokens、字體、路由與錯誤邊界。
2. 登入／邀請與旅程總覽。
3. 今日時間軸／地圖模式。
4. 行程編排、日期切換、固定錨點與暫存區。
5. `61:44 → 61:45 → 61:46 → 61:47 → 61:48 → 61:44` 景點加入流程。
6. loading／empty／error／offline／read-only 狀態。

### Slice 2：Supabase

接上 Auth、protected route、核心 CRUD、角色權限、Realtime、optimistic rollback 與同步狀態。adapter 切換不得要求改寫頁面。

### Slice 3：擴展

預訂文件、預算分帳、版本復原、公開分享與航班異動重排。

### Slice 4：PWA 與品質

離線 app shell、最近旅程快取、更新提示、Light／Dark、無障礙、效能與部署。

## 11. PWA、安全與隱私

- Service Worker 只快取 app shell、公開靜態資產與允許的最近旅程唯讀資料。
- 不快取護照、身分證、信用卡、私人預訂文件、signed URL 或分享 token。
- `/share/:token` 使用專用 public repository／安全 view，不載入敏感欄位後再用 CSS 隱藏。
- Supabase service role key 不得進入瀏覽器 bundle、`.env.example` 值或 GitHub Pages。
- private 文件只以短效 signed URL 取得。
- capability guard 依角色調整操作介面，但所有資料權限仍由 RLS 驗證。

## 12. 測試與驗收

- Unit：時間／timezone、金額、權限能力、衝突策略與 DTO mapper。
- Component：12 個共用元件的主要 variants、鍵盤操作與 axe。
- Integration：repository mock 下的登入、加入景點、衝突處理、拖放回滾。
- E2E：Owner／Editor／Viewer、公開分享、重新整理持久化、兩 session Realtime。
- Visual：以 390×844 對照各 Figma frame，另測窄手機、平板與桌面。
- PWA：offline reload、更新提示、manifest、安裝與快取排除。
- CI：typecheck、lint、unit、build、Playwright smoke、可重現 GitHub Pages build。

## 13. 尚待 Figma／產品確認

以下不得由前端自行改寫產品規則：

- 無衝突加入後的 saving／success／failure／retry 分支。
- 完整 CRUD、跨日拖放、Undo 與暫存區批次操作。
- 收藏資料夾、地圖探索與範圍搜尋。
- 表單完整 variants、深色模式逐頁值與 WCAG 2.2 AA 驗證。
- 平板／桌面響應式規則。
- 正式 icon、圖片、字體及授權清單。
- 旅程列表 `/trips` 的完整畫面。

## 14. 建議第一個 PR

第一個 PR 應只建立可驗證的工程骨架：Vite React TypeScript、providers、router、三層 token、三種 layout、shared contracts、repository interfaces、mock adapter、測試工具與 CI。接著以 `28:6` 旅程總覽作第一個垂直切片，驗證 token、元件、路由與資料邊界後，再展開行程編排流程。

## 15. 完成交付判定

本文件已完成目前資料範圍內的前端架構設計。實際前端程式尚未初始化，因此前端完成度仍為 0%；下一步可依第 14 節開始建置，不需要等待 Figma backlog 全部完成。
