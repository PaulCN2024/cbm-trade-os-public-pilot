# Phase UI-2 Read-only Route Separation Plan

## Purpose

Plan a safe separation between future Admin UI read-only API surfaces and historical mixed read/write CRM handlers.

This plan is documentation only. It does not implement API routes, schema changes, UI wiring, write actions, AI calls, external channel integrations, deployment changes, or production data changes.

The immediate goal is to reduce ambiguity before more Admin UI sections move from static or fallback data into live read-only data.

## Current Mixed Handler Inventory

| Current file / route area | Supported methods | Read-only behavior | Write-capable behavior | Auth boundary | Current Admin UI usage | Risk level | Recommended separation approach |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `api/customers.js` default `/api/customers` | `GET` by default; shared resource paths may also allow `POST`, `PATCH`, `PUT` | Default customer list uses authenticated `GET` and returns customer records. | Shared CRM resource dispatcher supports create/update for `companies`, `products`, `manufacturing-capabilities`, and `ai-inquiry-analyses`. | Uses `getSupabaseClient(request)` and requires Bearer token. | Customer Center uses `GET /api/customers`. Dashboard summary and follow-ups are also consolidated here by rewrite. | Medium | Keep legacy compatibility, but move future Admin UI reads to an explicit `admin-read` logical namespace handled by a read-only dispatcher. Keep write-capable resources out of read-only dispatch tables. |
| `api/customers.js` rewrite-backed `/api/admin-dashboard-summary` | `GET` only | Builds dashboard summary cards and queues from existing records. Non-GET returns `405 Allow: GET`. | None in this logical resource. | Requires Bearer token before reading. | Dashboard Workbench uses this read-only aggregate path. | Low | Preserve as a read-only surface, but migrate route naming to `/api/admin-read/dashboard-summary` in a future compatibility phase. |
| `api/customers.js` rewrite-backed `/api/follow-ups` | `GET` only | Reads `follow_up_tasks`, ordered by next follow-up. Non-GET returns `405 Allow: GET`. | None in this logical resource. | Requires Bearer token before reading. | Candidate source for dashboard/customer follow-up display. | Low | Preserve as read-only and migrate to `/api/admin-read/follow-ups` when the admin-read dispatcher exists. |
| `api/customers.js` rewrite-backed `/api/companies` | `GET`, `POST`, `PATCH`, `PUT` through shared resource dispatcher | `GET` reads `companies`. | Authenticated create/update remains available historically. | Requires Bearer token. | Company reference display uses read-only behavior. | Medium | Split future reads to `/api/admin-read/companies`; keep legacy write path only until explicit admin action planning exists. |
| `api/customers.js` rewrite-backed `/api/products` | `GET`, `POST`, `PATCH`, `PUT` through shared resource dispatcher | `GET` reads `products`. | Authenticated create/update remains available historically. | Requires Bearer token. | Product reference display uses read-only behavior. | Medium | Split future reads to `/api/admin-read/products`; prevent UI display code from relying on mixed path semantics. |
| `api/customers.js` rewrite-backed `/api/manufacturing-capabilities` | `GET`, `POST`, `PATCH`, `PUT` through shared resource dispatcher | `GET` reads `manufacturing_capabilities`. | Authenticated create/update remains available historically. | Requires Bearer token. | Supplier and Manufacturing Capability sections use read-only behavior. | Medium | Split future reads to `/api/admin-read/manufacturing-capabilities`; write actions require a separate approval/action plan. |
| `api/customers.js` rewrite-backed `/api/ai-inquiry-analyses` | `GET`, `POST`, `PATCH`, `PUT` through shared resource dispatcher | `GET` reads `ai_inquiry_analyses`. | Authenticated create/update remains available historically. | Requires Bearer token. | AI Review section uses read-only behavior. | Medium | Split future reads to `/api/admin-read/ai-inquiry-analyses`; keep AI draft writes out of read-only handlers. |
| `api/inquiries.js` `/api/inquiries` | `GET`, `PATCH`, `POST` | `GET` reads inquiries, leads, attachments, and follow-up tasks. | `PATCH` updates lead status. `POST` can convert lead to customer or create customer/lead/inquiry/task/attachment metadata. | Requires Bearer token. | Inquiry Center and pre-quotation review use `GET` only. | High | Create `/api/admin-read/inquiries` for display. Keep lead conversion and inquiry intake under explicit future action namespaces, not hidden under read-only UI paths. |
| `api/public-inquiries.js` `/api/public-inquiries` | `POST` only | None; this is an intake route. | Creates or updates website lead/inquiry/follow-up/attachment metadata for manual review. | Public route using server-side Supabase admin client. | Public website intake, not Admin UI read-only display. | Medium | Keep in a public intake namespace. Do not mix with Admin UI read routes. Add durable rate limiting before production hardening. |
| `api/admin-pilot-cleanup.js` `/api/admin-pilot-cleanup` | `GET`, `DELETE` | `GET` returns pilot row counts and confirmation requirements. | `DELETE` deletes pilot rows after auth and exact confirmation phrase. | Requires Bearer token and authenticated user. | Not normal Admin UI workflow. | High | Move future cleanup/maintenance behavior to `/api/maintenance/...` planning. Keep excluded from display routes and production operator workflows. |

## Current Safe Read-only Surfaces

The following logical surfaces are safe enough to preserve for current UI2 read-only behavior:

- `GET /api/health`
- `GET /api/admin-health`
- `GET /api/admin-dashboard-summary`
- `GET /api/follow-ups`
- `GET /api/customers`
- `GET /api/inquiries`
- `GET /api/companies`
- `GET /api/products`
- `GET /api/manufacturing-capabilities`
- `GET /api/ai-inquiry-analyses`

Important caveat: several paths above are currently served by mixed-capability handlers. The current Admin UI uses them as read-only GET surfaces, but future work should make that boundary explicit in route naming and dispatcher logic.

## Target Route Architecture

Future API surfaces should be grouped by intent:

### A. Admin Read-only API Surfaces

Logical examples:

```text
GET /api/admin-read/dashboard-summary
GET /api/admin-read/customers
GET /api/admin-read/inquiries
GET /api/admin-read/follow-ups
GET /api/admin-read/companies
GET /api/admin-read/products
GET /api/admin-read/manufacturing-capabilities
GET /api/admin-read/ai-inquiry-analyses
GET /api/admin-read/files
GET /api/admin-read/quotations
GET /api/admin-read/orders
```

These routes should be display-only. They should have no create/update/delete/send/approve behavior, even if they are physically served by a consolidated Vercel function.

### B. Admin Write/action API Surfaces

Logical examples for future planning only:

```text
POST /api/admin-actions/lead-status
POST /api/admin-actions/lead-conversion
POST /api/admin-actions/customer-update
POST /api/admin-actions/approval-review
```

These should require explicit planning, audit logging, approval boundaries, tests, and separate human approval before any UI wiring.

They must not be hidden behind read-only route names.

### C. Public Inquiry Intake Routes

Current example:

```text
POST /api/public-inquiries
```

Public intake is write-capable by design, but it is not Admin UI execution. It should remain separate from Admin read-only APIs and should keep manual-review safety payloads.

### D. Maintenance / Cleanup / Admin-only Routes

Current example:

```text
GET /api/admin-pilot-cleanup
DELETE /api/admin-pilot-cleanup
```

Future maintenance routes should live under a clearly separate logical namespace such as:

```text
/api/maintenance/...
```

These routes must remain unavailable from normal operator display workflows.

## Vercel Hobby Consolidation Strategy

Vercel Hobby function limits mean the project should not create one physical `api/*.js` file per logical route.

Recommended strategy:

1. Keep physical function count under the Hobby limit.
2. Use one consolidated physical admin-read handler in a future task.
3. Preserve logical route clarity through `vercel.json` rewrites or path dispatch.
4. Keep read-only dispatch tables separate from write/action dispatch tables.
5. Avoid mixing read-only and write-capable resources in the same dispatcher map unless the method gate is impossible to bypass and tests enforce it.

Future physical layout example:

```text
api/admin-read.js
api/admin-actions.js
api/public-inquiries.js
api/maintenance.js
api/health.js
api/admin-health.js
```

Future logical rewrites example:

```text
/api/admin-read/dashboard-summary -> /api/admin-read?resource=dashboard-summary
/api/admin-read/customers -> /api/admin-read?resource=customers
/api/admin-read/inquiries -> /api/admin-read?resource=inquiries
```

This gives the Admin UI clear read-only paths while keeping the physical serverless function count controlled.

## Read-only Route Rules

Future read-only routes must:

- support `GET` only
- return `405` and `Allow: GET` for non-GET methods
- require admin auth where records are internal
- read only the fields needed for display
- return stable JSON shapes
- use empty arrays and zero counts instead of throwing for missing optional data where safe
- preserve static/fallback UI behavior
- include safety metadata for disabled actions where relevant
- avoid leaking secrets, env values, service keys, bank information, internal costs, profit, exchange rates, or private file contents

Future read-only routes must not:

- mutate records
- call `insert`, `update`, `delete`, `upsert`, or mutating `rpc`
- call OpenAI or external AI providers
- send Gmail, WhatsApp, email, or customer messages
- create tasks
- create RFQs
- generate quotations
- calculate official prices
- generate PI, contracts, orders, payments, production records, or shipment records
- confirm supplier capability, price, delivery time, payment, production feasibility, liability, or compensation
- expose executable action URLs or callback references

## Write/action Route Rules

Future write/action routes must:

- be planned separately before implementation
- use explicit namespaces such as `/api/admin-actions/...`
- require authenticated admin access
- define exact allowed fields and validation rules
- include audit logging planning before UI wiring
- include manual approval boundaries for all commercial-risk actions
- return safety payloads that make clear whether anything was only drafted, reviewed, or actually executed
- have focused tests for method gating, validation, auth, and blocked actions

Future write/action routes must not:

- live inside read-only dispatch maps
- be connected to UI display screens by accident
- execute send/approve/RFQ/quotation/PI/order/payment/production/shipment workflows before explicit approval
- use route names that imply read-only behavior while allowing mutation

## Migration Strategy

### Phase A: Document Current Mixed Route Behavior

Completed by the current safety audit and this route separation plan.

Expected output:

- mixed handler inventory
- known read-only surfaces
- known write-capable historical surfaces
- compatibility risks

### Phase B: Create Consolidated Admin-read Dispatcher

Future implementation should introduce a physical dispatcher such as `api/admin-read.js`.

Initial scope should be small:

- no UI wiring yet
- `GET` only
- one or two resources first, preferably `dashboard-summary` and `follow-ups`
- same response shape as current read-only endpoints
- no schema changes
- focused tests

### Phase C: Move Read-only GET Logic Into Admin-read Paths

Move or duplicate read-only logic into admin-read dispatch functions while preserving legacy routes.

Candidate logical routes:

- `/api/admin-read/dashboard-summary`
- `/api/admin-read/follow-ups`
- `/api/admin-read/customers`
- `/api/admin-read/inquiries`

The first implementation should avoid moving write logic.

### Phase D: Keep Legacy Mixed Paths Temporarily

Legacy paths should remain available during transition:

- `/api/customers`
- `/api/inquiries`
- `/api/companies`
- `/api/products`
- `/api/manufacturing-capabilities`
- `/api/ai-inquiry-analyses`
- `/api/admin-dashboard-summary`
- `/api/follow-ups`

This avoids breaking current production UI and smoke checks.

### Phase E: Update Admin UI To Use Admin-read Paths

Only after the new admin-read paths pass local tests and production smoke:

- update Admin UI fetch URLs section by section
- preserve fallback data
- do not add new controls
- do not add write actions
- verify browser preview and production smoke

### Phase F: Deprecate Old Read Paths After Verification

After Admin UI has moved to admin-read paths and smoke tests pass:

- document legacy compatibility paths
- decide which rewrites should remain
- avoid deleting working routes until a dedicated deprecation task

### Phase G: Separately Design Explicit Write/action APIs

Only after read-only route separation is stable:

- plan action routes
- define approval and audit rules
- decide which human-reviewed workflows should exist first
- avoid connecting actions to UI until separately approved

## Compatibility And Rewrite Considerations

- Existing production paths must remain compatible until a migration checkpoint approves changes.
- `vercel.json` rewrites should be treated as part of the API contract.
- Rewrites should not make a route look read-only if the dispatched resource allows mutation.
- Admin UI should use the clearest read-only paths available, even if the physical handler is consolidated.
- Route names should communicate intent:
  - `admin-read` means read-only display.
  - `admin-actions` means explicit planned mutation or workflow action.
  - `public-inquiries` means public intake.
  - `maintenance` means restricted operational tooling.
- Authenticated smoke tests should verify both method gating and expected JSON shape before production UI wiring changes.

## Risk Matrix

| Risk | Example | Severity | Mitigation | Owner / next task |
| --- | --- | --- | --- | --- |
| Accidental write exposure | Admin UI display path points to a handler that accepts `POST` or `PATCH`. | High | Create explicit admin-read routes with `GET` only and `405 Allow: GET` for non-GET. | `CBM-CODEX-SPRINT-API-READONLY-005` |
| Route rewrite confusion | `/api/companies` looks like a simple read path but dispatches to a mixed CRM handler. | Medium | Document rewrites and migrate UI to `/api/admin-read/companies`. | Admin read dispatcher planning |
| Auth boundary mismatch | Public route or maintenance route is confused with admin route. | High | Use separate namespaces and require Bearer auth for all admin read/action routes. | Authenticated smoke test execution |
| Vercel function count growth | Adding one physical function per resource exceeds Hobby limit again. | Medium | Use consolidated physical handlers with logical path dispatch. | Admin read dispatcher implementation |
| UI accidentally calling mixed route | Future UI section uses `/api/inquiries` and later someone wires POST/PATCH. | High | Move UI fetches to `GET /api/admin-read/...` paths only. | UI migration tasks after dispatcher |
| Public inquiry route confused with admin route | `/api/public-inquiries` writes CRM records and is mistaken for read-only data source. | Medium | Keep public intake separate and document it as write-capable/manual-review intake. | Public intake hardening plan |
| Maintenance cleanup reachable from operator workflow | Cleanup route appears in normal Admin UI or gets linked from settings. | High | Keep cleanup under maintenance planning; do not link from read-only workflow UI. | Maintenance route safety review |
| Business commitment implied by read model | Summary labels imply ready-to-quote, ready-to-ship, or payment confirmed. | Medium | Use conservative labels such as needs_review, missing_information, high_risk. | Read model review tasks |
| Hidden action fields in read JSON | Response includes callback URLs or action names that UI could render as controls. | High | Read-only payloads should expose disabled actions, not executable actions. | Admin read route tests |

## Recommended Next Tasks

1. `CBM-CODEX-SPRINT-API-READONLY-005` - Admin Read Dispatcher Plan
2. `CBM-CODEX-SPRINT-API-READONLY-006` - Implement Admin Read Dispatcher Skeleton
3. `CBM-CODEX-SPRINT-DATA-009` - Move Dashboard Summary UI To Admin Read Path
4. `CBM-CODEX-SPRINT-SAFETY-002` - Write Action Approval Architecture Plan
5. `CBM-CODEX-RELEASE-013` - Authenticated Admin API Smoke Test Execution if safe token becomes available

## Final Recommendation

Proceed with read-only route separation planning before adding more live Admin UI data wiring.

The safest next step is `CBM-CODEX-SPRINT-API-READONLY-005 - Admin Read Dispatcher Plan`. That task should define the exact dispatcher shape, supported first resources, tests, and Vercel rewrite strategy, without moving UI fetch URLs yet.

Do not implement write/action APIs until the read-only route layer is separated and verified. Write/action APIs need separate approval, audit logging, validation, and human-review design.
