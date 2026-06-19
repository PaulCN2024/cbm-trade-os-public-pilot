# Post-deploy Read-only API Safety Audit

## 1. Purpose

Record post-deploy safety verification for the UI2 read-only API consolidation and Vercel Hobby compatibility work.

This audit confirms that the deployed Admin UI/API surfaces remain read-only from the UI perspective, preserve route compatibility for consolidated endpoints, and do not introduce new business execution behavior.

## 2. Deployment Context

- Production alias: `https://project-7vo99.vercel.app`
- Production deployment succeeded after Vercel Hobby API consolidation.
- Consolidation commit: `fda6603 refactor: consolidate api functions for vercel hobby`
- Production checkpoint commit: `12d769b docs: add ui2 production deployment checkpoint`
- Deployment checkpoint document: `docs/ops/ui2-production-deployment-checkpoint.md`

## 3. Function Consolidation Summary

The Vercel Hobby function count blocker was resolved by consolidating read-only API function files into an existing handler and preserving public route paths with rewrites.

- `api/admin-dashboard-summary.js` was consolidated into `api/customers.js`
- `api/follow-ups.js` was consolidated into `api/customers.js`
- `vercel.json` rewrites preserve:
  - `/api/admin-dashboard-summary`
  - `/api/follow-ups`
- Physical API function count is now within the Vercel Hobby limit.

Route compatibility was preserved for `/api/admin-dashboard-summary` and `/api/follow-ups`. Production smoke testing confirmed these paths no longer return `404`; unauthenticated calls return the expected admin auth boundary.

## 4. Current Route Compatibility Matrix

| Route | Expected method | Current behavior | Auth boundary | Route compatibility | Safety notes |
| --- | --- | --- | --- | --- | --- |
| `/api/health` | `GET` | Returns `200` with health payload | Public health check | Preserved | Read-only health endpoint. |
| `/api/admin-health` | `GET` | Returns `401` unauthenticated | Requires Bearer token | Preserved | Admin-only read surface; no business action. |
| `/api/customers` | `GET` for Admin UI read-only usage | Returns `401` unauthenticated | Requires Bearer token | Preserved | Handler contains historical CRM write methods, but Admin UI currently uses GET/read-only flow. |
| `/api/inquiries` | `GET` for Admin UI read-only usage | Existing route file remains present | Requires admin auth through Supabase helper for protected use | Preserved | Route has historical POST/PATCH behavior; Admin UI must remain GET-only unless separately approved. |
| `/api/admin-dashboard-summary` | `GET` | Returns `401` unauthenticated, not `404` | Requires Bearer token | Preserved through `vercel.json` rewrite to `api/customers.js` | Consolidated read-only dashboard summary route. Unsupported methods return `405 Allow: GET`. |
| `/api/follow-ups` | `GET` | Returns `401` unauthenticated, not `404` | Requires Bearer token | Preserved through `vercel.json` rewrite to `api/customers.js` | Consolidated read-only follow-up route. Unsupported methods return `405 Allow: GET`. |
| `/api/documents` | Not present | No current physical API file or rewrite found | Not applicable | Not implemented | Future file/document metadata API needs separate read-only planning. |
| `/api/quotations` | Not present | No current physical API file or rewrite found | Not applicable | Not implemented | Future quotation read-only API needs separate planning; no quotation generation is connected. |
| `/api/orders` | Not present | No current physical API file or rewrite found | Not applicable | Not implemented | Future order read-only API needs separate planning; no order confirmation is connected. |
| `/api/production` | Not present | No current physical API file or rewrite found | Not applicable | Not implemented | Future production read-only API needs separate planning; no production confirmation is connected. |
| `/api/shipping` | Not present | No current physical API file or rewrite found | Not applicable | Not implemented | Future shipping read-only API needs separate planning; no shipment confirmation is connected. |
| `/api/after-sales` | Not present | No current physical API file or rewrite found | Not applicable | Not implemented | Future after-sales read-only API needs separate planning. |
| `/api/settings-summary` | Not present | No current physical API file or rewrite found | Not applicable | Not implemented | Future settings summary API needs separate planning and safety review. |

Additional rewrite-backed read-only surfaces currently routed through `api/customers.js` include:

- `/api/companies`
- `/api/products`
- `/api/manufacturing-capabilities`
- `/api/ai-inquiry-analyses`

These routes preserve existing Admin UI read-only display needs, but they share a mixed-capability handler and should be separated more clearly in future API planning.

## 5. Safety Boundaries Confirmed

This post-deploy audit confirms:

- No new schema changes were introduced.
- No package dependency changes were introduced.
- No UI changes were made during this audit.
- No API code changes were made during this audit.
- No OpenAI or external AI calls were added.
- No Gmail or WhatsApp calls were added.
- No file upload, delete, parsing, OCR, or archive-promotion flow was added.
- No quote generation was added.
- No price calculation engine was added.
- No PI or contract generation was added.
- No order, payment, production, or shipment execution was added.
- No new business execution surface was added.

The current deployed system remains visibility-first and human-reviewed.

## 6. Known Historical Mixed-route Concern

`api/customers.js` may contain historical CRM write behavior for some CRM resources.

After consolidation:

- `/api/admin-dashboard-summary` is routed through `api/customers.js`
- `/api/follow-ups` is routed through `api/customers.js`
- both consolidated routes are explicitly read-only and return `405 Allow: GET` for unsupported methods

The Admin UI currently uses GET/read-only flows. Future work should more clearly separate read-only surfaces from write-capable CRM routes to reduce review burden and make production safety easier to reason about.

Recommended future direction:

- keep read-only Admin UI endpoints separate in behavior even when physically consolidated
- avoid adding new POST/PATCH/PUT/DELETE behavior to shared read-only display routes
- introduce dedicated read-only route planning before connecting more live workflow sections

## 7. Production Smoke Summary

Latest production smoke result:

- `/admin/ui-foundation/index.html?trial=1` returns `200`
- `/admin/ui-foundation/app.js` returns `200`
- production `app.js` contains `工作台`
- production `app.js` contains `/api/admin-dashboard-summary`
- stale `STEP 2E`, `Static mock`, and `Admin Dashboard` markers were not dominant
- `/api/health` returns `200`
- protected admin APIs return `401` unauthenticated, which is expected
- `/api/admin-dashboard-summary` no longer returns `404`
- `/api/follow-ups` no longer returns `404`

Browser smoke from the production checkpoint also found:

- Admin UI page title loaded as `CBM Trade OS | Admin UI Foundation`
- no obvious horizontal overflow at the checked viewport
- browser console error count was `0`

## 8. Remaining Verification Gap

Authenticated admin API smoke was deferred because no safe token workflow was available.

Do not invent, print, store, or commit admin tokens.

Future authenticated smoke should use a safe existing admin auth workflow and verify:

- `GET /api/admin-dashboard-summary` returns `200`
- response includes `meta`
- response includes `summary_cards`
- response includes `workflow_queues`
- response includes `safety`
- response includes `warnings`

## 9. Risk Classification

Risk classification after successful deployment: **Medium-low**.

The deployment is stable enough to keep because:

- production deploy is Ready
- function count is within Vercel Hobby limits
- consolidated routes preserve public path compatibility
- protected routes return expected auth boundaries
- no business execution was introduced

Follow-up is still needed for:

- dedicated authenticated smoke test
- future separation of mixed read/write routes

## 10. Recommended Next Tasks

1. `CBM-CODEX-RELEASE-012` - Authenticated Admin API Smoke Test Plan
2. `CBM-CODEX-SPRINT-SAFETY-001` - Disabled Action And Approval Boundary Audit
3. `CBM-CODEX-SPRINT-API-READONLY-004` - Separate Read-only Routes From Mixed CRM Routes Plan
4. `CBM-CODEX-SPRINT-DATA-008` - Production Dashboard Summary Authenticated Validation
5. `CBM-CODEX-SPRINT-API-PLAN-002` - File Metadata Read-only API Plan
