# UI2 Production Deployment Checkpoint

## 1. Purpose

This checkpoint records the production verification completed after the UI-2 read-only data wiring milestone and Vercel Hobby API function consolidation.

It confirms that the latest production deployment is live, that key read-only Admin UI surfaces are reachable, and that protected Admin API routes preserve the expected authentication boundary.

## 2. Deployment Summary

- Deployment date: 2026-06-19
- Production status: Ready
- Production deploy command used in the previous release step: `vercel deploy --prod`
- Deployment verification mode: read-only smoke test
- Code changes in this checkpoint: none
- Production data changes: none
- Environment variable changes: none
- Database migrations: none

## 3. Deployment URL

- Deployment URL: `https://project-7vo99-py4dn4hgl-paul-s-projects2026.vercel.app`

## 4. Production Alias

- Production alias: `https://project-7vo99.vercel.app`

The production alias resolves to the new Ready deployment.

## 5. Related Commits

- `fda6603 refactor: consolidate api functions for vercel hobby`
- `6807051 feat: wire dashboard workbench read-only summary`
- `9c5d132 feat: add admin dashboard summary read-only api`
- `7db41cb docs: add read-only api coverage audit`
- `2335166 docs: add ui2 read-only data wiring checkpoint`

## 6. What Was Deployed

The production deployment includes:

- Phase UI-2 read-only data wiring
- Dashboard Workbench read-only summary wiring
- GET-only dashboard summary API surface
- Vercel Hobby API function consolidation
- Existing Admin UI static assets

No write workflow, approval execution, external channel integration, quotation generation, PI generation, order confirmation, payment confirmation, production confirmation, or shipment confirmation was deployed.

## 7. Vercel Hobby Consolidation Summary

The Vercel Hobby function count blocker was addressed by consolidating read-only API function files:

- `api/admin-dashboard-summary.js` was consolidated into `api/customers.js`
- `api/follow-ups.js` was consolidated into `api/customers.js`
- `vercel.json` rewrites preserve the public routes:
  - `/api/admin-dashboard-summary`
  - `/api/follow-ups`

The physical API function count is now within the Vercel Hobby limit.

Production no longer returns `404` for `/api/admin-dashboard-summary` or `/api/follow-ups`. Without admin authentication, both routes return the expected protected API response.

## 8. Smoke Test Results

Production alias tested:

`https://project-7vo99.vercel.app`

| Surface | Result | Notes |
| --- | ---: | --- |
| `/` | `200` | Root page served |
| `/admin/ui-foundation/index.html?trial=1` | `200` | Admin UI shell served |
| `/admin/ui-foundation/app.js` | `200` | Admin UI JavaScript served |
| `/api/health` | `200` | Health API returned `ok`, `service`, and `mode` keys |
| `/api/admin-health` | `401` | Expected unauthenticated admin boundary |
| `/api/admin-dashboard-summary` | `401` | Expected unauthenticated admin boundary; not `404` |
| `/api/follow-ups` | `401` | Expected unauthenticated admin boundary; not `404` |
| `/api/customers` | `401` | Expected unauthenticated admin boundary |

Browser smoke test:

- Admin UI page title loaded as `CBM Trade OS | Admin UI Foundation`
- `工作台` marker was present
- `/api/admin-dashboard-summary` marker was present
- Old `STEP 2E`, `Static mock`, and `Admin Dashboard` markers were not dominant
- No horizontal overflow was detected at the browser viewport used for the smoke test
- Browser console error count was `0`

## 9. Authenticated API Result Or Deferred Note

Authenticated API smoke was deferred.

Reason:

- The Admin API requires an authenticated Bearer token.
- No safe existing admin token or documented local token workflow was available during this checkpoint.
- No token values were printed, stored, copied, or committed.
- No authentication bypass was attempted.

Expected future authenticated check:

- `GET /api/admin-dashboard-summary` should return `200`
- Response JSON should include:
  - `meta`
  - `summary_cards`
  - `workflow_queues`
  - `safety`
  - `warnings`

## 10. Known Expected Auth Boundaries

The following production API routes are protected and may return `401` without admin authentication:

- `/api/admin-health`
- `/api/admin-dashboard-summary`
- `/api/follow-ups`
- `/api/customers`

This is expected and preserves the existing Admin API safety model.

## 11. Known Warnings

- Existing Node module type warnings may appear during local tests.
- Vercel build may warn that Node.js functions are compiled from ESM to CommonJS.
- The previous manual deploy printed a Vercel CLI warning about a possible `deploy` subdirectory, but the deploy targeted the expected `project-7vo99` project and completed successfully.
- Full authenticated production JSON validation remains pending until a safe admin auth method is available.

## 12. What Remains Not Implemented

Still not implemented:

- API write routes for UI workflows
- Approval workflow execution
- AI provider or model gateway integration
- Gmail or WhatsApp integration
- Supplier RFQ sending
- Quotation generation
- PI generation
- Order confirmation
- Payment confirmation
- Production confirmation
- Shipment confirmation
- File upload, delete, OCR, or parsing workflow

All high-risk business actions remain manual-review only.

## 13. Recommended Next Tasks

1. Authenticated Admin API Smoke Test with safe token if deferred
2. Dashboard summary production data wiring validation
3. Vercel Git auto-deploy integration fix or documentation
4. File Metadata Read-only API Plan
5. Disabled Action And Approval Boundary Audit
