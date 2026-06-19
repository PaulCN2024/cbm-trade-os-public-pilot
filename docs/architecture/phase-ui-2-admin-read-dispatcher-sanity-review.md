# Phase UI-2 Admin Read Dispatcher Sanity Review

## Purpose

Record safety review and deployment readiness for the Admin Read Dispatcher skeleton.

This review is documentation-only. It does not change API code, UI code, schema, package files, environment variables, deployment settings, or production data.

## Implementation Summary

Reviewed implementation:

- `9abeb84 feat: add admin read dispatcher skeleton`

Implemented logical routes:

- `GET /api/admin-read/dashboard-summary`
- `GET /api/admin-read/customers`
- `GET /api/admin-read/inquiries`

Vercel rewrite pattern:

```text
/api/admin-read/(dashboard-summary|customers|inquiries)
  -> /api/admin-read?resource=$1
```

No Admin UI wiring has been added yet. Existing compatibility routes remain in place.

## Function Count Review

| Count type | Result | Notes |
| --- | ---: | --- |
| Total `api/*.js` files | 13 | Includes internal helper `api/_supabase.js`. |
| Vercel-routable API files | 12 | Excludes internal helper `api/_supabase.js`. |

The Vercel-routable function count remains at the Hobby limit of 12. This is acceptable for the skeleton, but the count is tight and future API work should avoid adding one physical function per logical resource.

## Route Behavior Review

| Logical route | Method | Expected behavior | Auth boundary | Notes |
| --- | --- | --- | --- | --- |
| `/api/admin-read/dashboard-summary` | `GET` | Returns dashboard aggregate shape with `meta`, `summary_cards`, `workflow_queues`, `safety`, and `warnings`. | Uses existing `getSupabaseClient(request)` Bearer auth boundary. | No UI migration yet. |
| `/api/admin-read/customers` | `GET` | Returns stable read-only payload with `meta`, `records`, `summary`, `safety`, and `warnings`. | Uses existing `getSupabaseClient(request)` Bearer auth boundary. | Reads customer records only. |
| `/api/admin-read/inquiries` | `GET` | Returns stable read-only payload with `meta`, `records`, `summary`, `safety`, and `warnings`. | Uses existing `getSupabaseClient(request)` Bearer auth boundary. | Reads inquiry records only. |
| Unknown admin-read resource | `GET` | Returns stable `404` JSON with `error: "not_found"`. | Requires auth before unknown-resource response when environment/auth shape is available. | Does not expose secrets or executable actions. |
| Admin-read route | non-`GET` | Returns `405` with `Allow: GET`. | Method gate happens before auth. | No write method is dispatched. |

## Rewrite Compatibility Review

Confirmed rewrite added:

```json
{
  "src": "^/api/admin-read/(dashboard-summary|customers|inquiries)$",
  "dest": "/api/admin-read?resource=$1"
}
```

Confirmed existing compatibility rewrites remain intact:

- `/api/follow-ups -> /api/customers?crm_resource=follow-ups`
- `/api/admin-dashboard-summary -> /api/customers?crm_resource=admin-dashboard-summary`
- `/api/companies -> /api/customers?crm_resource=companies`
- `/api/products -> /api/customers?crm_resource=products`
- `/api/manufacturing-capabilities -> /api/customers?crm_resource=manufacturing-capabilities`
- `/api/ai-inquiry-analyses -> /api/customers?crm_resource=ai-inquiry-analyses`

Confirmed compatibility routes remain available:

- `/api/customers`
- `/api/inquiries`
- `/api/admin-dashboard-summary`
- `/api/follow-ups`
- `/api/health`
- `/api/admin-health`

The new rewrite is narrow and does not broadly capture unrelated routes.

## Safety Scan Result

Confirmed absent from `api/admin-read.js` and the new rewrite:

- new `insert` calls
- new `update` calls
- new `delete` calls
- new `upsert` calls
- new `rpc` calls
- external `fetch` calls
- OpenAI or AI Gateway calls
- Gmail or WhatsApp integration
- file upload, delete, parse, OCR, or archive promotion behavior
- send execution
- approve or reject execution
- task creation
- RFQ sending
- quotation generation
- PI generation
- order confirmation
- payment confirmation
- production confirmation
- shipment confirmation
- secret or service-key exposure

The strings for `send`, `approve`, `reject`, `quote`, `generate_pi`, `confirm_order`, `confirm_payment`, `confirm_production`, and `confirm_shipment` appear only as disabled action metadata or high-risk text detection terms. They are not executable actions.

## Test And Build Results

| Check | Result | Notes |
| --- | --- | --- |
| `node --check api/admin-read.js` | Passed | Direct syntax check for the new dispatcher. |
| `npm test` | Passed | `471` tests passed. Existing `MODULE_TYPELESS_PACKAGE_JSON` warning remains non-blocking. |
| `npm run build` | Passed | Existing build script passed. |
| Handler check: `POST /api/admin-read/customers` | Passed | Returned `405` with `Allow: GET`. |
| Handler check: unauthenticated `GET /api/admin-read/customers` | Passed | Returned `401`. |
| Handler check: unknown admin-read resource | Passed | Returned stable `404` JSON. |

Build note: `package.json` was intentionally not modified in the implementation task, so the existing `npm run build` script does not explicitly include `api/admin-read.js`. This review covers the new file with a separate `node --check api/admin-read.js`.

## Known Limitations

- No production deployment has been run after the Admin Read Dispatcher skeleton.
- No authenticated production JSON smoke test has been run for `/api/admin-read/...`.
- Admin UI has not been migrated to `/api/admin-read/...` yet.
- Legacy mixed handlers still exist, especially `api/customers.js` and `api/inquiries.js`.
- API function count is tight at the Vercel Hobby limit of 12 routable functions.
- The current build script does not explicitly list `api/admin-read.js`; this is deferred because package files were forbidden in the implementation task.

## Risk Classification

Medium-low.

The dispatcher itself is GET-only, protected by the existing Bearer auth boundary, narrowly routed, and does not add mutation or business execution behavior. The main residual risk is deployment/function-count tightness and the continued presence of legacy mixed handlers until future read-only UI migration and route separation work is completed.

## Recommended Next Task

`CBM-CODEX-RELEASE-014 - Deploy Admin Read Dispatcher To Production And Smoke Test`

Recommended deployment smoke checks:

- production deploy only from clean synced `main`
- verify Vercel deployment is ready
- unauthenticated `/api/admin-read/customers` returns `401`
- unauthenticated `/api/admin-read/inquiries` returns `401`
- unauthenticated `/api/admin-read/dashboard-summary` returns `401`
- `POST /api/admin-read/customers` returns `405 Allow: GET`
- authenticated JSON smoke only if a safe token workflow is available

## Progress Report

- Full product vision: 32% -> 32%
- Internal MVP / foundation: 70% -> 70%
- Admin Read Dispatcher Sanity Review: 0% -> 100%

Progress bars:

- Overall: `[███░░░░░░░] 32%`
- Internal MVP: `[███████░░░] 70%`
- Current module: `[██████████] 100%`
