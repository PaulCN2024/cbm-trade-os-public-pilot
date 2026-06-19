# Phase UI-2 Admin Read Dispatcher Plan

## Purpose

Plan a future consolidated GET-only Admin Read Dispatcher that exposes logical read-only Admin API routes while keeping physical Vercel Serverless Function count under the Hobby limit.

This is planning only. It does not implement the dispatcher, change API code, change UI code, change schema, change package files, deploy, run migrations, add external services, or introduce business execution.

## Why This Is Needed

The Admin UI needs clearer read-only API surfaces before more workflow screens move from static/fallback display into live data.

Current concerns:

- Admin UI data wiring currently calls a mix of direct read paths and paths backed by historical mixed read/write handlers.
- `api/customers.js` now safely hosts GET-only dashboard and follow-up logical resources, but it also contains historical authenticated write-capable CRM resources.
- `api/inquiries.js` supports read-only `GET`, but also historical `PATCH` and `POST` flows.
- Vercel Hobby limits physical Serverless Functions, so the project should not create one `api/*.js` file per logical resource.
- Future UI data wiring should call explicitly read-only route names so operator display screens cannot accidentally depend on mixed route semantics.

The target is logical route separation without exploding physical function count.

## Target Logical Route Namespace

Recommended future Admin read namespace:

```text
/api/admin-read/dashboard-summary
/api/admin-read/customers
/api/admin-read/inquiries
/api/admin-read/ai-review
/api/admin-read/supplier-capabilities
/api/admin-read/documents
/api/admin-read/quotations
/api/admin-read/orders
/api/admin-read/production
/api/admin-read/shipping
/api/admin-read/after-sales
/api/admin-read/settings-summary
```

Meaning:

- `admin-read` means internal operator-facing read-only display.
- The namespace must not include create/update/delete/send/approve/RFQ/quotation/PI/order/payment/production/shipment execution.
- Future write/action routes should use a separate explicit namespace such as `/api/admin-actions/...`.

## Physical Implementation Strategy

Recommended Vercel Hobby-safe design:

- Use one consolidated physical handler, for example `api/admin-read.js` or a catch-all handler if the project later chooses that Vercel pattern.
- Use `vercel.json` rewrites to map logical `/api/admin-read/*` paths to the consolidated handler if needed.
- Use path dispatch inside the handler.
- Keep total physical API function count at or below the current Hobby-safe deployment shape.
- Avoid creating one physical file per logical route.
- Do not overload `api/customers.js` further with new read-only resource families.
- Keep admin-read dispatch tables separate from any future admin-action/write dispatch tables.

Possible logical rewrite pattern:

```json
{
  "src": "^/api/admin-read/(.*)$",
  "dest": "/api/admin-read?resource=$1"
}
```

Possible internal dispatch shape for a future implementation:

```text
resource = dashboard-summary -> readDashboardSummary()
resource = customers -> readCustomers()
resource = inquiries -> readInquiries()
resource = ai-review -> readAiReview()
```

This plan does not implement that shape yet.

## GET-only Boundary

All future `admin-read` routes must:

- support `GET` only
- return `405` with `Allow: GET` for non-GET methods
- perform no database mutations
- call no AI provider
- send no customer messages
- generate no RFQ, quotation, PI, contract, order, payment, production, or shipment records
- trigger no business actions
- expose no executable action URLs
- expose no approval callback handles
- preserve human review boundaries

The dispatcher itself should reject non-GET before resource dispatch whenever possible.

## Proposed Response Pattern

Every admin-read route should return stable JSON.

Standard response pattern:

```json
{
  "meta": {
    "generated_at": "2026-06-19T00:00:00.000Z",
    "source": "admin_read",
    "resource": "customers",
    "is_fallback": false
  },
  "records": [],
  "summary": {},
  "safety": {
    "human_review_required": true,
    "disabled_actions": []
  },
  "warnings": []
}
```

Dashboard summary may keep the current aggregate shape:

```json
{
  "meta": {},
  "summary_cards": {},
  "workflow_queues": {},
  "safety": {},
  "warnings": []
}
```

Response rules:

- use arrays for list data
- use objects for summary data
- use `warnings` for optional source limitations
- keep safety metadata explicit
- never include secrets, service keys, raw environment variables, payment credentials, bank details, internal costs, profit, exchange rates, private file contents, or executable actions

## Resource Mapping Table

| Logical route | Current source route/table | Existing data readiness | Fallback requirement | Risk level | Implementation notes |
| --- | --- | --- | --- | --- | --- |
| `/api/admin-read/dashboard-summary` | Current `/api/admin-dashboard-summary`; reads `inquiries`, `customers`, `ai_inquiry_analyses`, `manufacturing_capabilities`, `follow_up_tasks` | Ready; current GET-only aggregate exists through `api/customers.js` | Keep static Workbench fallback in UI | Low | First dispatcher candidate. Preserve current response shape or provide a compatibility adapter. |
| `/api/admin-read/customers` | Current `/api/customers`; table `customers` | Ready for read-only list | Keep Customer Center fallback | Low-medium | Move display reads away from mixed default handler semantics while preserving legacy route. |
| `/api/admin-read/inquiries` | Current `/api/inquiries`; tables `inquiries`, `leads`, `attachments`, `follow_up_tasks` | Ready for read-only list, but current handler is mixed | Keep Inquiry Center fallback | Medium | Use read-only projection only. Do not expose PATCH/POST behavior under admin-read. |
| `/api/admin-read/ai-review` | Current `/api/ai-inquiry-analyses` rewrite; table `ai_inquiry_analyses` | Partial/ready for current UI display | Keep AI Review fallback | Medium | Read existing analysis records only. Do not create or approve AI drafts. |
| `/api/admin-read/supplier-capabilities` | Current `/api/manufacturing-capabilities` rewrite; table `manufacturing_capabilities` | Partial/ready for capability display | Keep Supplier/Capability fallback | Medium | Use read-only capability projection. Do not imply supplier commitment or production feasibility. |
| `/api/admin-read/documents` | Tables may include `attachments` and `documents`; no dedicated current endpoint | Partial; needs read model design | Keep File Center static preview | Medium | Plan file/document metadata only. No upload, delete, OCR, archive promotion, or file content exposure. |
| `/api/admin-read/quotations` | Tables may include `quotations` and `quotation_items`; no dedicated route | Partial; needs read model design | Keep pre-quotation fallback | Medium | Read-only status/reference only. No price calculation or official quote generation. |
| `/api/admin-read/orders` | No clear current order table/API in current audits | Not ready | Keep Orders static preview | Medium | Requires schema/read model planning before implementation. No order confirmation. |
| `/api/admin-read/production` | No clear current production table/API in current audits | Not ready | Keep Production static preview | Medium | Requires schema/read model planning. No production release or feasibility confirmation. |
| `/api/admin-read/shipping` | No clear current shipping/shipment table/API in current audits | Not ready | Keep Shipping static preview | Medium | Requires schema/read model planning. No shipment confirmation or document issuance. |
| `/api/admin-read/after-sales` | No clear current after-sales table/API in current audits | Not ready | Keep After-sales static preview | Medium | Requires schema/read model planning. No liability or compensation conclusion. |
| `/api/admin-read/settings-summary` | No dedicated current settings/config endpoint | Not ready | Keep Settings static preview | Low-medium | Read-only system summary only. No token, env, account, permission, AI provider, Gmail, or WhatsApp mutation. |

## Compatibility Strategy

Preserve existing URLs temporarily:

- `/api/customers` remains for compatibility.
- `/api/inquiries` remains for compatibility.
- `/api/admin-dashboard-summary` may continue to rewrite through `api/customers.js` or be mirrored to `/api/admin-read/dashboard-summary`.
- `/api/follow-ups` remains available while dashboard/customer follow-up wiring migrates.
- Current rewrite-backed paths such as `/api/companies`, `/api/products`, `/api/manufacturing-capabilities`, and `/api/ai-inquiry-analyses` should remain until Admin UI sections migrate and production smoke verifies the new paths.

Migration rule:

- Add admin-read paths first.
- Verify them locally.
- Verify production unauthenticated auth boundaries.
- Run authenticated smoke only when a safe token workflow exists.
- Migrate Admin UI fetch URLs section by section.
- Keep old paths until a dedicated deprecation task.

## Auth Strategy

Admin read routes should keep the existing admin auth boundary:

- protected routes require Bearer authentication
- unauthenticated protected routes should return `401`
- routes must not bypass Supabase auth
- responses must not include secret values
- responses must not print tokens or env values
- authenticated smoke testing remains a separate task

Public and maintenance routes must not share the same mental model:

- public intake routes may be public and write-capable by design
- maintenance routes may be authenticated and destructive by design
- neither should be called from normal Admin read-only display screens

## Vercel Hobby Strategy

Target deployment constraint:

- keep physical Serverless Function count within the Vercel Hobby limit of 12
- avoid adding one physical `api/*.js` file per logical read resource
- prefer one consolidated `api/admin-read.js` physical handler
- use rewrites carefully and document them as API contract
- verify function count before production deploy

Recommended future physical handler count direction:

- keep current public/page/auth/health handlers stable
- add at most one new physical admin-read handler in the first implementation
- avoid adding a matching physical file for every `/api/admin-read/...` logical path
- consider consolidating or deprecating legacy physical handlers only in later dedicated tasks

## Migration Phases

### Phase 1: Implement Dispatcher Skeleton With 2-3 Read-only Resources

Suggested first resources:

- `dashboard-summary`
- `customers`
- `inquiries`

Constraints:

- no UI wiring yet
- no schema changes
- no writes
- no AI/external calls
- no business execution
- tests/build must pass
- function count must remain under the Hobby limit

### Phase 2: Mirror Current Read-only Resources Through Admin-read

Mirror or call equivalent read-only logic for:

- dashboard summary
- customers
- inquiries
- follow-ups if useful

Legacy paths stay active.

### Phase 3: Wire Admin UI To Admin-read Paths

Update Admin UI fetch URLs gradually:

- dashboard first
- customer and inquiry after dashboard verification
- AI review and supplier capabilities after read models are stable

No buttons, forms, or write actions should be added during this phase.

### Phase 4: Add Missing Read-only Resources One By One

Add only after each has a narrow read model:

- documents
- quotations
- orders
- production
- shipping
- after-sales
- settings summary

Each new resource should keep fallback behavior in the UI.

### Phase 5: Keep Legacy Mixed Routes For Compatibility

Do not remove existing paths until:

- new admin-read path passes local tests
- production smoke passes
- Admin UI has migrated
- rollback path is documented

### Phase 6: Plan Explicit Write/action API Namespace Separately

Write/action APIs require separate planning:

- approval model
- audit logging
- validation
- method gating
- UI permission model
- human approval workflow

Do not hide business execution behind `GET` or admin-read route names.

## Testing Plan

Future implementation should verify:

- `node --check api/admin-read.js`
- `npm test`
- `npm run build`
- `GET` returns stable JSON
- non-GET returns `405`
- `Allow: GET` is present for non-GET
- no mutation calls are present in admin-read handler
- no external AI/channel calls are present
- route compatibility is preserved
- Vercel function count remains `<= 12`
- production unauthenticated protected routes return `401`
- authenticated smoke is run only if a safe token exists
- response payloads do not include secrets, env values, bank details, internal costs, executable action URLs, or business execution flags

Recommended static checks for future implementation review:

- search `api/admin-read.js` for `insert(`, `update(`, `delete(`, `upsert(`, mutating `rpc(`, `fetch(`, `OpenAI`, `Gmail`, `WhatsApp`, `send`, `approve`, `quote`, `payment`, `production`, and `shipment`
- confirm any risky words appear only in disabled action metadata or safety copy

## Risks

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| Breaking existing route compatibility | Current production UI and smoke checks rely on existing paths. | Mirror first, migrate later, keep legacy paths until verification. |
| Accidentally exposing writes under read-only namespace | A read-only route name with write behavior would undermine operator safety. | Reject non-GET before dispatch and keep admin-read dispatch table read-only. |
| Vercel function count growth | Adding many physical functions can break Hobby deployment again. | Use one consolidated handler and rewrites/path dispatch. |
| Auth boundary mismatch | Protected Admin data must not become public. | Keep existing Bearer auth boundary and smoke unauthenticated `401`. |
| Overloading `customers.js` further | It already carries mixed historical concerns and new read-only consolidation. | Add a separate admin-read handler instead of expanding `customers.js`. |
| Confusing public and admin routes | Public intake is write-capable and should not be mistaken for Admin read-only display. | Keep `/api/public-inquiries` outside admin-read. |
| Hiding business execution behind GET routes | GET routes must not change state or imply approval. | Do not mutate, create tasks, generate documents, or execute business workflows inside admin-read. |

## Recommended Next Implementation Task

`CBM-CODEX-SPRINT-API-READONLY-006 - Implement Admin Read Dispatcher Skeleton`

Recommended scope:

- implement only dispatcher skeleton
- include `dashboard-summary`, `customers`, and `inquiries` only if safe
- no UI wiring yet
- no schema changes
- no writes
- no AI or external channel calls
- no send/approve/RFQ/quotation/PI/order/payment/production/shipment execution
- function count must remain `<= 12`
- `npm test` and `npm run build` must pass

## Recommended Next 5 Tasks

1. `CBM-CODEX-SPRINT-API-READONLY-006` - Implement Admin Read Dispatcher Skeleton
2. `CBM-CODEX-SPRINT-DATA-009` - Migrate Dashboard Summary UI To Admin Read Path
3. `CBM-CODEX-SPRINT-DATA-010` - Migrate Customer/Inquiry UI To Admin Read Paths
4. `CBM-CODEX-RELEASE-013` - Authenticated Admin API Smoke Test Execution if safe token is available
5. `CBM-CODEX-SPRINT-SAFETY-002` - Write Action Approval Architecture Plan

## Final Recommendation

Proceed to an implementation skeleton only after this plan is reviewed.

The first implementation should be deliberately small: one consolidated `admin-read` physical handler, `GET` only, two or three existing read models, no UI wiring, and no write/action behavior. The project should keep legacy paths intact until the new read-only namespace is tested locally, smoke-tested in production, and migrated section by section.
