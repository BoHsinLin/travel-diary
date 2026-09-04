# PROJECT_STATE

最後更新：2026-09-04 10:13:27 +08:00（Asia/Taipei）

## CURRENT MILESTONE

- Milestone：`7-Day M1 Hardening＋TourAPI Data Vertical Slice`。
- Backend Day 1–2：ACCEPTED／WAIT。
- Data Engineering Day 3–4：ACCEPTED／WAIT。
- Figma Day 5：ACCEPTED／WAIT。
- Frontend Day 6：ACCEPTED／WAIT。
- DevOps Day 7：Pages deployment 已完成；其餘 production hardening 延後／WAIT。
- Frontend corrective task：ACCEPTED／WAIT。
- Backend corrective task：ACCEPTED／WAIT；corrective SHA `2b0f417a…` CI Run #6 PASS。
- Data attachment staging：ACCEPTED／WAIT；120 筆完成稽核，45 筆可導入、75 筆隔離。
- Production content import：BLOCKED；runner 已建立，但 environment credentials、fixed repo dataset 與 Data writer 尚未就緒。
- DevOps data-unblock：REVIEW；Seoul content import runner 已完成本機驗證，production write 0；remote push 待外部核准。
- Backend production M2 contract deployment：ACCEPTED／WAIT；runner `33827518261` 已部署並驗證 M2 contract。
- DevOps migration-runner implementation／operation：ACCEPTED；workflow run `33718438721` SUCCESS。
- Manager Day 8：WAIT。

## ACTIVE ROLE

- 唯一 active assignee：DevOps Engineer。
- 核准 release SHA：`2b0f417a825198909f6b05a131e6215395e5849e`；CI Run #6 PASS：`https://github.com/BoHsinLin/travel-diary/actions/runs/33710890735`。
- 工作：runner implementation 已完成並停在 REVIEW；等待 PM 驗收，不實際匯入。

## COMPLETED

- M1 Auth、protected routes、Trip／Day／Member／Place repositories、RLS／Realtime、Planner persistence、Viewer read-only。
- PWA／CI／GitHub Pages baseline。
- M2 TourAPI raw → normalize／dedup → provenance → review → Event／Place discovery vertical slice。
- Explore／Detail／Report／Add／PT409 conflict／notification／Reviewer approve→publish UI。
- M2 RWD browser evidence：320、375、430、768、1440px。

## OPEN ITEMS

- DevOps Day 7 production monitoring／Sentry proof。
- 自動備份／Pro 升級不列為本輪 data activation 前置條件；backup／restore／RPO／RTO 延後由 PM 另案決策。
- TourAPI controlled secrets、cron、idempotent manual run、logs 與 alert proof。
- Pages／Auth redirect／SPA deep link／PWA／Supabase production smoke。
- Manager Day 8 rate-limit blocking gate 與最終驗收。
- Auth leaked-password-protection 平台設定確認。

## BLOCKERS

- Frontend commits `e9276663271b37c904268f655889e12c3b4931a6` 與 `2566e6a59798642db274e5a6ae163608b6d16444` 已修復 UI-side mismatches；CI `33710234107` 顯示 remote committed generated DB types 缺 `events`、`canonical_places`、`data_sources`、`event_change_notifications` 等 M2 tables。
- GitHub Pages／Actions、Supabase production、TourAPI cron、alert route 與 production test identity 的外部 authority／settings 尚不可驗證。
- Production secrets、Supabase project settings、GitHub Environment 與 release SHA 不可猜測。
- 禁止使用 service-role key 作為 Pages／Vite／browser credential。

## CROSS-ROLE DECISIONS

- React＋TypeScript＋Vite PWA；Supabase Auth／Postgres／RLS／Realtime。
- UI 經 repository／adapter 與 generated DB types 存取資料。
- DB RLS／RPC 是授權邊界；前端 guard 只改善 UX。
- TourAPI 是 M2 第一官方來源；raw、normalized、provenance、dedup、review audit 必須保留。
- Review／publish 只走受保護 RPC／audit。
- GitHub Pages base path 與 Auth redirect 必須 base-aware。
- 一次只啟動一位工程師；經理驗收後才能換手。

## VALIDATION STATUS

- Local／remote `main` HEAD：`2b0f417a825198909f6b05a131e6215395e5849e`。
- Frontend corrective commits：`e927666`、`2566e6a`；Backend generated-types corrective commit：`2b0f417a`。
- 已部署 Pages baseline：`09e3c6a`；不代表 M2 production verified。
- TypeScript：PASS。
- Vitest：13 files／46 tests PASS。
- Production build：2035 modules PASS。
- PWA cache contract：PASS。
- M2 fixture assertions：5／5 PASS。
- pgTAP：115／115 PASS。

## NEXT TASK

- Next：Manager 驗收 `.github/workflows/seoul-content-import.yml`；通過後才交回 Data 補 fixed dataset／writer 並匯入 45 筆 draft／review rows。

## ACCEPTANCE CRITERIA

- CI／Pages workflow PASS；缺 production env 時 fail closed。
- Repo、workflow、artifact、log 無 secret 洩漏。
- production schema preflight 明確列出所需 M2 tables／RPC 是否存在；只讀檢查不得改動 production。
- live ingestion 僅使用 KTO TourAPI 官方來源，且 server-side secret 不出現在 client、log、artifact 或文件。
- 成功時 `pipeline_runs.status=succeeded`，Event `<=50`、Place `<=100`，並建立 raw、draft canonical、provenance、review queue 關聯。
- 同一 idempotency key 重跑回傳 `idempotent_replay`；新 key＋相同來源不得重複 canonical／review item。
- 不得 auto-publish；無授權圖片不得匯入；缺翻譯維持 `missing_translation` review flag。
- 若 M2 schema／production authority 缺失，交付精確 blocker 與所需 Backend／DevOps handoff，不得直接 DB edit、fixture、seed、reset 或猜測 secrets。
