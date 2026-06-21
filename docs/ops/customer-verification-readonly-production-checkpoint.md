# Customer Verification Read-only Production Checkpoint

## Purpose

Record production deployment and smoke verification for the AI Customer Verification read-only data foundation.

## Deployment Summary

- Production alias: https://project-7vo99.vercel.app
- Deployment URL: https://project-7vo99-d7ucwijja-paul-s-projects2026.vercel.app
- Deployment ID: dpl_J8GFusmHSBAa5MEDJnMqZemW5Zy2
- Status: Ready
- Target: production
- Created: Sun Jun 21 2026 23:22:14 GMT+0800

## Implementation Summary

- Migration SQL file created but not executed by Codex.
- DEMO seed SQL file created but not executed by Codex.
- Manual SQL execution pack created for Paul review and Supabase SQL Editor execution.
- Admin-read customer-verification routes added to the existing dispatcher.
- AI 客户验证 UI is bound to admin-read data with safe fallback demo.
- Fallback demo remains available when auth, SQL tables, or API data are unavailable.
- No external lookup, AI provider call, customer mutation, message sending, or business execution was added.

## API Routes

- `GET /api/admin-read/customer-verification-summary`
- `GET /api/admin-read/customer-verification-requests`
- `GET /api/admin-read/customer-verification-evidence`
- `GET /api/admin-read/customer-verification-scores`
- `GET /api/admin-read/customer-verification-duplicate-matches`
- `GET /api/admin-read/customer-verification-review-queue`
- `GET /api/admin-read/customer-verification-reviews`

## Production Smoke

| Route | Result | Expected? | Notes |
| --- | --- | --- | --- |
| `/` | 200 | Yes | Production root reachable |
| `/admin/ui-foundation/index.html?trial=1` | 200 | Yes | Admin UI trial page reachable |
| `/admin/ui-foundation/app.js` | 200 | Yes | Updated JS served |
| `/admin/ui-foundation/styles.css` | 200 | Yes | CSS served |
| `/api/health` | 200 | Yes | Health route OK |
| `/api/admin-read/dashboard-summary` | 401 JSON | Yes | Existing auth gate |
| `/api/admin-read/business-card-summary` | 401 JSON | Yes | Existing auth gate |
| `/api/admin-read/customer-verification-summary` | 401 JSON | Yes | New route deployed, protected |
| `/api/admin-read/customer-verification-requests` | 401 JSON | Yes | New route deployed, protected |
| `/api/admin-read/customer-verification-evidence` | 401 JSON | Yes | New route deployed, protected |
| `/api/admin-read/customer-verification-scores` | 401 JSON | Yes | New route deployed, protected |
| `/api/admin-read/customer-verification-duplicate-matches` | 401 JSON | Yes | New route deployed, protected |
| `/api/admin-read/customer-verification-review-queue` | 401 JSON | Yes | New route deployed, protected |
| `/api/admin-read/customer-verification-reviews` | 401 JSON | Yes | New route deployed, protected |
| `/api/admin-read/unknown` | 404 JSON | Yes | Stable unknown-resource response |
| `POST /api/admin-read/customer-verification-summary` | 405 Allow: GET | Yes | GET-only boundary preserved |

## UI Smoke

- `AI 客户验证` renders in production.
- Records or fallback demo render safely.
- Active controls inside the AI Customer Verification area: 0.
- No `undefined` or `null` text is visible.
- No horizontal overflow at 1440px viewport.
- Console 401 messages are expected because protected admin-read resources require a safe admin bearer token.

## SQL Operation Status

- SQL files were reviewed and executed after Paul's explicit `APPROVED` confirmation.
- SQL execution used Supabase Dashboard SQL Editor.
- The five `customer_verification_*` tables now exist with first-stage DEMO data.
- RLS is enabled on all five tables.
- Authenticated SELECT-only policies are verified on all five tables.

## Manual/Approved SQL Execution Completed

- Approval phrase received: `APPROVED`
- Execution time: 2026-06-21 23:33 CST / 2026-06-21 15:33 UTC
- Execution channel: Supabase Dashboard SQL Editor
- SQL file executed: `docs/ops/customer-verification-manual-sql-combined.sql`
- `customer_verification_requests`: 3 rows
- `customer_verification_evidence`: 13 rows
- `customer_verification_scores`: 3 rows
- `customer_verification_duplicate_matches`: 1 row
- `customer_verification_reviews`: 3 rows
- RLS result: `true` for all five tables
- Policy result: authenticated `SELECT` only for all five tables
- Detailed record: `docs/ops/customer-verification-sql-execution-report.md`

## SQL Execution Completed And Verified

- Post-SQL verification completed against production on 2026-06-21.
- Public/static production routes returned 200.
- Existing protected admin-read routes remained JSON 401 when unauthenticated.
- Customer Verification admin-read routes returned JSON 401 when unauthenticated, not 404.
- `/api/admin-read/unknown` returned stable JSON 404.
- `POST /api/admin-read/customer-verification-summary` returned 405 with `Allow: GET`.
- Production `AI 客户验证` UI rendered safely.
- Active controls inside the `AI 客户验证` area remained 0.
- No visible `undefined` or `null` appeared.
- No horizontal overflow was observed in browser smoke.
- Detailed post-SQL report: `docs/ops/customer-verification-post-sql-verification-report.md`
- Production checkpoint: `docs/ops/customer-verification-post-sql-production-checkpoint.md`

## Safety Boundary

- Read-only only.
- No external lookup.
- No AI provider call.
- No customer creation.
- No customer mutation.
- No message sending.
- No quotation, PI, order, payment, production, or shipment action.
- No write policies are created by the prepared SQL.

## Known Limitations

- No real external lookup.
- No real AI verification.
- No real duplicate check against live customer data unless a future task adds it.
- No approved customer status update.
- Authenticated JSON smoke is deferred without a safe admin token.
- Post-SQL production JSON smoke remains deferred until a safe admin token is available.

## Recommended Next Tasks

1. `CBM-CODEX-SPRINT-CUSTOMER-VERIFICATION-DUPLICATE-CHECK-PLAN-001`
2. `CBM-CODEX-SPRINT-FOLLOWUP-ASSISTANT-PLAN-001`
3. `CBM-CODEX-SPRINT-INQUIRY-INTELLIGENCE-UI-001`
4. Authenticated production JSON smoke when a safe admin token is available.
5. Customer Verification human review queue planning.

## Progress

- Full product vision: 55% -> 56%
- Internal MVP / foundation: 100% -> 100%
