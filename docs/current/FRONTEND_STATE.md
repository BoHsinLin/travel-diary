# FRONTEND ROLE STATE — DISTILL HANDOFF

T: 2026-09-03 +08:00 (Asia/Taipei)
S: ACTIVE / corrective Pages build repair
L: `61dbae6 fix: finalize M2 review evidence states`
O: Frontend Day 6 is accepted. Do not start new frontend work until the Manager assigns it.

## 1. CURRENT MILESTONE

M: `7-Day M1 Hardening + TourAPI Data Vertical Slice`.
P: M2 Day 6 / frontend discovery vertical slice = ACCEPTED.
R: frontend owns UI architecture, responsive behavior, accessibility semantics, route UX, repository consumption, client-state handling, and browser evidence.
X: Frontend is the sole active corrective owner. DevOps remains BLOCKED pending a corrective SHA and workflow proof.

## 2. COMPLETED

C1: M1 frontend baseline accepted: Auth entry, protected routes, trip/day/member/place repositories, planner persistence, Viewer read-only UX, Realtime client wiring, PWA shell, CI/Pages-ready build, responsive baselines.
C2: M2 Explore accepted: explicit All/Event/Place tabs; server-side search, date, region, category, trust filters; independent Event/Place cursor state; load-more append + `kind:id` de-dup; loading/empty/error/end states.
C3: M2 Detail accepted: Chinese fallback, Korean name, source attribution, verification state, Event report success/retry, Place-report contract boundary.
C4: M2 Add accepted: `add_event_to_itinerary` RPC, UUID idempotency, success state, PT409 conflict state, no itinerary overwrite.
C5: M2 notifications accepted: acknowledge flow, failure alert + retry, no before/after snapshot leak, no silent itinerary rewrite.
C6: M2 Reviewer accepted: `platform_roles` 403 gate; pending -> approve -> approved -> publish via RPC; dialog focus trap / Escape / return focus / retry; publish success removes actionable target.
C7: P0 final evidence accepted: real PT409 screenshot after RPC settlement; real publish screenshot after RPC + refetch, explicit success text, zero publish buttons.
C8: accepted artifacts must not be regenerated without a new Manager request.

## 3. CURRENT STATE

A: React + TypeScript + Vite PWA. TanStack Query manages request/cache state. React Router owns protected route composition.
D: frontend reads only DTO-shaped data through repository/adapter modules and generated database types; it does not use service-role credentials or raw pipeline/admin payloads.
F: `DiscoveryExplorePage` -> repository query -> server-side filters/cursors -> merged UI list.
F: `DiscoveryDetailPage` -> Event/Place DTO -> source metadata -> report/add action.
F: `AddEventPage` -> `add_event_to_itinerary` RPC -> success | PT409 conflict | failure state.
F: `ReviewerQueuePage` -> role gate -> `review_data_item` RPC -> await refetch -> publish success removes local actionable row.
F: App notification -> acknowledge RPC -> success | visible retry state.
F: `ChangeNotifications` -> `changeNotificationsRepository` -> generated `event_change_notifications` DTO/update types -> acknowledge + query invalidation.

K: `src/features/discovery/DiscoveryPages.tsx` — M2 routes, views, dialog and mutation state.
K: `src/features/discovery/discoveryRepository.ts` — Discovery query/RPC adapter.
K: `src/features/discovery/DiscoveryPages.test.tsx` — M2 component/interaction regressions.
K: `src/features/discovery/discoveryRepository.test.ts` — query/cursor contract regressions.
K: `src/app/App.tsx` — route mounting; `/reviewer-queue` is global, not under `TripLayout`.
K: `docs/evidence/m2-frontend-audit-2026-09-02/EVIDENCE.md` — accepted browser evidence index.
K: `docs/archive/deliveries/frontend/FRONTEND_M2_DAY6_PROGRESS_2026-09-01.md` — detailed Day 6 delivery history.
K: `docs/coordination/ENGINEER_HANDOFF.md` — current single entrypoint for role changes.

DEP: Supabase Auth/anon client, generated DB types, RLS policies, RPC contracts, local fixture SQL, Figma M2 design spec, DevOps environment configuration.

## 4. OPEN ITEMS

O1: P0 corrective code repair is complete locally: `ChangeNotifications` no longer queries or updates Supabase directly; `changeNotificationsRepository.ts` owns generated-type query/update mapping. Corrective SHA and CI/Pages workflow proof remain pending authorized GitHub publication; do not mark REVIEW before that proof exists.
O2: browser-injected axe cannot run in the current readonly browser sandbox. Do not claim browser axe PASS.
O3: physical NVDA/Narrator validation is not automated. Existing proof is accessibility tree + keyboard smoke only.
O4: `today-hero-figma` is ~1.44 MB; image compression/srcset is future performance debt, not a release blocker.
O5: Place reports remain intentionally unavailable: current data contract has `event_id` only, no `place_id`/entity discriminator.
O6: production hardening remains outside frontend scope: monitoring, backups, cron, daily smoke, secret rotation, alerts, deployment verification.
B: no frontend code blocker. External secrets/production access must be reported `BLOCKED`; never substitute a service-role key.

## 5. DECISIONS

D1: React + TypeScript + Vite PWA; Supabase owns Auth/Postgres/RLS/Realtime.
W: cost-efficient base with a replaceable, testable frontend boundary.

D2: UI never spreads direct Supabase queries across pages; repository/adapter + generated types are the data boundary.
W: preserves DTO privacy and allows demo/local/production replacement.

D3: RLS/RPC are the authorization boundary; frontend guards only improve UX.
W: hidden buttons are not authorization.

D4: Review/publish must use `review_data_item` RPC/audit; no direct queue-table update.
W: preserves review state integrity and auditability.

D5: publish completion requires RPC + successful queue refetch; then target disappears and `已發布，項目已從待審佇列移除。` is shown.
W: prevents false success and repeat publish.

D6: PT409 must show a non-destructive conflict UI; it must not overwrite an itinerary.
W: explicit user-safe scheduling contract.

D7: TourAPI is first official discovery source; retain raw/normalized/provenance/dedup/review audit upstream.
W: source legality, freshness, traceability, and future expansion.

D8: GitHub Pages base path and Auth redirect must remain base-aware. Mobile navigation stays icon-only; wide layouts may show icon + text.

D9: single-active-engineer lock is mandatory. Do not reopen frontend while DevOps is active without Manager direction.

## 6. VALIDATION

V1: `pnpm typecheck` — PASS.
V2: `pnpm test` / `pnpm vitest run` — PASS; 13 files, 46 tests.
V3: `pnpm build` — PASS; 2035 modules transformed.
V4: `pnpm check:pwa-cache` — PASS.
V5: local fixture replay — assertions 5/5 PASS; pgTAP 115/115 PASS.
V6: browser smoke accepted: Owner Explore at 320/375/430/768/1440; filter focus/Escape/return; Event detail/report; Add success/PT409; notification acknowledge; Reviewer pending/approved/published; 720x450 200%-equivalent reflow; Owner 403.
V7: browser console error/warning = 0 for recorded flows.
V8: accessibility baseline accepted: semantic tree, keyboard dialog handling, `vitest-axe` Explore 0 violations with color-contrast rule excluded by existing jsdom policy.
V9: 2026-09-03 corrective local validation PASS: `node node_modules/vitest/vitest.mjs run src/features/discovery/ChangeNotifications.test.tsx --pool=forks --maxWorkers=1 --reporter=verbose` (1 file, 2 tests); `pnpm typecheck`; `pnpm build` (2036 modules); `pnpm check:pwa-cache`.
N: not verified/claimable: browser-injected axe, physical screen-reader output, future production-hardening smoke.

## 7. NEXT TASK

N: no schema, migration, RLS/RPC, generated DB types, production configuration, deployment, fixture, or unrelated UI changes.
P: use repository/adapter + generated DB types; do not leave direct UI-level Supabase table mutation that bypasses the established boundary.
X: DevOps remains BLOCKED until a corrective SHA passes CI/Pages; Manager Day 8 remains WAIT.
AC: targeted ChangeNotifications regression PASS; `pnpm typecheck` PASS; `pnpm build` PASS; `pnpm check:pwa-cache` PASS; corrective SHA CI/Pages workflow PASS; no direct contract/schema change; report REVIEW and stop. Local checks pass; corrective SHA and CI/Pages are still required.

## 8. HANDOFF NOTES

H1: read `docs/PROJECT_HUB.md` -> `docs/current/PROJECT_STATE.md` -> `docs/current/FRONTEND_STATE.md`; when ownership changes, then read `docs/coordination/ENGINEER_HANDOFF.md`.
H2: for M2 UI changes, read `docs/coordination/FRONTEND_MANAGER.md`, `docs/coordination/DATA_ENGINEERING.md`, `docs/coordination/FRONTEND_BACKEND.md`, `docs/reference/design/M2_FIGMA_DAY5_BUILD_SPEC.md`, and the evidence index before editing.
H3: local browser evidence uses local Supabase only. Fixture: `supabase/fixtures/m2_browser_evidence.sql`; runner: `scripts/verify-m2-browser-fixture.ps1`; no production fallback.
H4: fixture reviewer account is `platform-admin@example.com`, not `admin@example.com`.
H5: local Magic Link mail arrives in Inbucket. Do not put Magic Link tokens, passwords, anon keys, service-role keys, or production secrets in docs, commits, screenshots, logs, or frontend code.
H6: current repository has unrelated dirty/untracked cross-role work. Preserve it; stage exact paths only; never reset/checkout/clean broadly.
H7: bundled Node/pnpm may be required when system PATH lacks them. Use the runtime documented in `ENGINEER_HANDOFF.md`; do not change package tooling merely to solve PATH.
H8: no deployment/push is implied by frontend acceptance. Manager/DevOps controls production delivery.
