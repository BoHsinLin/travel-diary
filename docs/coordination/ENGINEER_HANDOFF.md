# Engineer Handoff｜工程師更換交接

最後更新：2026-09-04 10:13:27 +08:00（Asia/Taipei）
狀態：**DevOps Seoul content import runner REVIEW；remote push 待核准；production import 0**

> 本文件是更換工程師時的唯一權威交接。新工程師依 `AGENTS.md` 先讀 `docs/PROJECT_HUB.md`、`docs/current/PROJECT_STATE.md`、自身 role state，再讀本文件；不要掃描全部 archive 或重開已確定決策。

## PROJECT_STATE

### 目前 milestone

- `7-Day M1 Hardening＋TourAPI Data Vertical Slice`。
- corrective SHA：`2b0f417a825198909f6b05a131e6215395e5849e`；CI Run #6 PASS：`https://github.com/BoHsinLin/travel-diary/actions/runs/33710890735`。已部署 Pages 基線：`09e3c6a`；M2 尚未因此視為 production verified。
- Backend、Data Engineering、Figma、Frontend Day 1–6 已驗收。
- 下一工序：Data content activation；先把可驗證的官方 TourAPI 實際內容導入既有 M2 flow。
- 單人工序鎖仍有效：一次只啟動一位工程師。

### 已完成功能

- M1：Auth、protected routes、Trip／Day／Member／Place repository、RLS／Realtime、Planner persistence、Viewer read-only、PWA／CI／GitHub Pages。
- M2 vertical slice：TourAPI raw → normalize／dedup → provenance → Event／Place → Explore／Detail → Add to Trip → PT409 conflict。
- Reviewer flow：pending → approve → approved → publish；發布完成後項目離開佇列且不可重複發布。
- RWD：320、375、430、768、1440px M2 證據；既有主要頁面亦有手機／平板／桌面基線。
- Frontend 最終驗證：TypeScript PASS；Vitest 13 files／46 tests PASS；production build 2035 modules PASS；PWA cache contract PASS。

### 未完成事項

- DevOps Day 7：production Sentry／監控、backup、cron、daily smoke、secrets、alerts 與部署後 smoke。
- Manager Day 8：rate-limit 是否升為 blocking gate、production 最終驗收。
- 人工可選 gate：若經理要求，再做 NVDA／Narrator 實體讀屏；目前已有 accessibility tree＋keyboard 證據。
- Production hardening 後續：Auth leaked-password-protection 尚待平台設定確認。

### blocker

- 目前無程式 blocker。
- Production secrets／Supabase／GitHub Environment 的外部設定不可猜值；缺權限或值時回報 `BLOCKED`，不得使用 service-role key 代替 anon／publishable key。
- 本機終端若找不到 Node，先把 Codex bundled Node 與 pnpm 加入該 session PATH；這是環境啟動，不代表專案需重建。

## FRONTEND_STATE

### FE 最近修改

- Commit `61dbae6`：完成 Reviewer publish 狀態、阻止重複發布、補回歸測試。
- 替換真實 PT409 conflict 與 published browser evidence。
- 發布成功文案：`已發布，項目已從待審佇列移除。`

### 目前 UI / state flow

- Explore：Event／Place、搜尋、篩選、cursor／load more、來源與信任狀態。
- Detail：Event／Place 詳情、來源歸屬、Report。
- Add：成功加入或顯示 PT409 conflict；不覆寫既有行程。
- Notifications：App 內變更通知可 acknowledged。
- Reviewer：pending → approve → approved → publish → row removed；Owner 進入管理路由顯示 403。
- Loading／empty／error／retry／dialog focus trap／Escape／focus return 已覆蓋。

### 重要檔案位置

- 專案總覽：`docs/PROJECT_HUB.md`
- 本交接：`docs/coordination/ENGINEER_HANDOFF.md`
- 角色補充交接索引：`docs/current/README.md`
- 前端經理紀錄：`docs/coordination/FRONTEND_MANAGER.md`
- 跨端資料契約：`docs/coordination/DATA_ENGINEERING.md`
- 前後端介面：`docs/coordination/FRONTEND_BACKEND.md`
- Figma 規格：`docs/reference/design/M2_FIGMA_DAY5_BUILD_SPEC.md`
- Icon contract：`docs/reference/design/ICON_CONTRACT.md`
- M2 主畫面：`src/features/discovery/DiscoveryPages.tsx`
- M2 tests：`src/features/discovery/DiscoveryPages.test.tsx`
- Browser evidence：`docs/evidence/m2-frontend-audit-2026-09-02/EVIDENCE.md`
- Local Supabase 啟動：`docs/runbooks/LOCAL_DEVELOPMENT_STARTUP.md`

### known issues

- `today-hero-figma` build asset 約 1.44 MB；不是本輪 blocker，但未來可做圖片壓縮／srcset。
- Browser-injected axe 受驗收工具 sandbox 限制；不可宣稱已完成該項。
- 實體 screen reader 尚未執行；現有證據為 accessibility tree 與 keyboard smoke。
- Working tree 仍有跨端未提交文件；新工程師不得清除或覆寫不屬於自己任務的變更。

### validation/test 狀態

- `pnpm run typecheck`：PASS。
- `pnpm test`：13 test files／46 tests PASS。
- `pnpm run build`：PASS，2035 modules transformed。
- `pnpm run check:pwa-cache`：PASS。
- M2 local fixture：assertions 5／5 PASS；pgTAP 115／115 PASS（後端既有驗收）。
- Frontend evidence：兩張最終補件與其餘 14 張既有證據已接受。

## DECISIONS

### 已確定且不要重新討論的架構決策

- React＋TypeScript＋Vite PWA；Supabase 提供 Auth、Postgres、RLS、Realtime。
- UI 不直接散落 Supabase query；透過 repository／adapter 與 generated DB types。
- 有正式 `VITE_SUPABASE_*` 時使用 Supabase；只有未配置環境可走 demo fallback。
- 授權安全邊界由 DB RLS／RPC 執行；前端 capability guard 只做 UX，不替代後端授權。
- TourAPI 是第一個官方資料來源；保留 raw、normalized、provenance、dedup 與 review audit。
- Review／publish 必須走 RPC／audit；不可直接 UPDATE queue 偽造狀態。
- GitHub Pages base path 與 Auth redirect 必須 base-aware。
- 手機導覽 CTA 採 icon-only；較寬 viewport 才顯示 icon＋文字。
- 一次只啟動一位工程師；交接必須由經理驗收後切換。

### 為什麼這樣做

- 壓低目前免費／低成本基礎設施費用，同時保留升級空間。
- 避免 UI 與資料來源耦合，讓 demo、local、production 可替換且可測。
- 權限放在 DB，避免只隱藏按鈕造成資料越權。
- provenance／audit 支援資料新鮮度、合法來源、下架與後續比價。
- 單人工序＋固定交接降低重工、上下文與 token 開支。

## NEXT_TASK

### 下一個具體工作

**Next assignee：Manager 驗收 DevOps runner；通過後才可明確交回 Data。**

1. `.github/workflows/seoul-content-import.yml` 已完成 manual-only、protected environment、production pin、sanitized dry-run artifact、schema preflight 與 boolean write gate。
2. 本機證據：workflow contract PASS、Data tests 15/15 PASS、typecheck PASS、附件 dry-run 45 accepted／75 quarantined；production write 0。
3. Data 接手前仍需 fixed repo dataset、Data-owned `data:seoul:import` writer，以及 environment 管理員配置 masked credentials／required reviewer；缺任一項均 fail closed。
4. OSM `22.9182/120.2371` 非首爾，本工序未設為地圖中心，也未修改 Frontend。

### acceptance criteria

- 120 筆輸入有可重現 schema mapping、唯一 canonical identity 與來源關聯。
- official／verified／unverified 分級保留；不得把 unverified 誤標為 official。
- production 寫入僅可透過核准的 server-side import path；raw／canonical／provenance／review queue 關聯完整。
- 無 auto-publish、座標猜測、無授權圖片、secret 洩漏、seed、fixture 或 reset。

## 固定交接規則

每位工程師離場前只更新以上四區：`PROJECT_STATE`、`FRONTEND_STATE`（非 FE 可改為自身角色 state，但保留 FE 摘要）、`DECISIONS`、`NEXT_TASK`。

- 只保留當前可執行資訊；長歷史放入角色 delivery／evidence 文件。
- 所有狀態必須附時間戳、commit SHA、檔案位置、驗證命令與結果。
- 未實測不得寫 PASS；無權限則寫 BLOCKED 與缺少的具體輸入。
- 不重新討論 `DECISIONS`；只有經理明確改決策時才更新理由與影響。
- `NEXT_TASK` 只能有一位 active assignee，並寫清楚禁止修改範圍與 acceptance criteria。
