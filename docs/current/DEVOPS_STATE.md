# ROLE_STATE｜DEVOPS / DEPLOYMENT ENGINEER

Timestamp: `2026-09-04 10:13:22 +08:00`

Status: `REVIEW / Seoul content import runner ready; no import executed`

## 1. CURRENT MILESTONE

- Milestone：`7-Day M1 Hardening + TourAPI Data Vertical Slice`。
- 唯一 ACTIVE：DevOps Engineer。
- Backend production M2 contract：ACCEPTED／WAIT。
- Data attachment staging：ACCEPTED／WAIT；45 accepted、75 quarantined、production import 0。

## 2. COMPLETED

- Pages deployment、Auth redirect、manifest、service worker 已驗證。
- Production migration runner 與 masked migration secrets 已建立。
- Migration Run `33827518261`、contract verification Run `33827993083` SUCCESS。
- Production M2 8 tables、3 protected RPC、RLS contract ready。
- Supabase Pro／自動備份明確不作目前 gate。

## 3. CURRENT STATE

- Data 已提供 deterministic attachment adapter 與 dry-run。
- 120 筆：45 可導入、75 因缺 HTTPS source evidence 隔離。
- 45 筆必須維持 draft、建立 raw hash／canonical／provenance／pending review；不得 publish。
- OSM `22.9182,120.2371` 不是首爾，本任務不得設定地圖中心或修改 Frontend。

## 4. OPEN ITEMS

- 建立並發布 `.github/workflows/seoul-content-import.yml`。
- Runner 使用獨立受保護 environment 與 masked server-side secrets。
- Runner 先產生 dry-run summary；只有明確 boolean gate 才允許後續 Data 寫入。

## 5. DECISIONS / NO-GO

- 本輪只建立 runner，不實際匯入 production。
- `SUPABASE_SERVICE_ROLE_KEY` 不得進入 Vite、Pages、browser、repo、artifact 或 log。
- 不得 direct SQL、seed、fixture、reset、auto-publish、座標猜測或匯入無授權圖片。
- 不得要求 Supabase Pro、自動備份、cron、監控或 alerts 作本輪前置條件。
- 不得修改 Frontend、schema、RLS、RPC 或既有 migration history。

## 6. VALIDATION

- `node scripts/validate-seoul-import-workflow.mjs`：PASS。
- `pnpm test:data`：15/15 PASS；`pnpm typecheck`：PASS。
- Attachment dry-run：120 total、45 accepted、75 quarantined；accepted official 12、verified 33、unverified 0；all draft／no images／all queued。
- Production writes：0。Secret values 未進入 workflow output、artifact、repo 或 docs。
- Runner 固定 production ref `mgxsjobicqyddoaejqvf`、dataset path `data/imports/seoul_canonical_places_optimized_v5.json`，並使用 protected environment `production-content-import`。
- `SUPABASE_URL`／`SUPABASE_SERVICE_ROLE_KEY` 只在明確 write gate 後注入；`TOURAPI_SERVICE_KEY` 僅在 matching=true 時要求。
- Production write 同時要求 Data-owned `data:seoul:import` command；目前尚未存在，因此即使誤開 gate 仍 fail closed。

## 7. NEXT TASK

- Runner commit 已在本機完成；remote push 因外部安全核准不足而被阻擋。Manager／使用者核准推送目的地後再驗收，通過後才重新指派 Data。
- Data 後續提供固定 repo dataset 與 idempotent `data:seoul:import` writer，再執行 controlled import。

## 8. HANDOFF NOTES

- PM 驗收 runner 後才重新指派 Data 執行 controlled import。
- `TOURAPI_SERVICE_KEY` 只在 TourAPI official matching 階段必要；不得以其缺失阻塞 runner 本身的建立與 dry-run。
