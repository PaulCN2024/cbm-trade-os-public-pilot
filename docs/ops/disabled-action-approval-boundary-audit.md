# Disabled Action And Approval Boundary Audit

## Purpose

Record audit of disabled action boundaries and approval gating after UI2 production deployment.

This audit checks whether the current Admin UI and API surface still preserve the CBM Trade OS safety boundary:

- no automatic customer sending
- no approve/reject execution
- no RFQ execution
- no quotation generation
- no price calculation
- no PI generation
- no contract generation
- no order confirmation
- no payment confirmation
- no production confirmation
- no shipment confirmation
- no after-sales liability or compensation conclusion

## Scope

Audited UI files:

- `admin/ui-foundation/index.html`
- `admin/ui-foundation/app.js`
- `admin/ui-foundation/styles.css`

Audited API and routing files:

- `api/_supabase.js`
- `api/admin-health.js`
- `api/admin-pilot-cleanup.js`
- `api/customers.js`
- `api/health.js`
- `api/inquiries.js`
- `api/public-inquiries.js`
- `api/trade-os-prototype.js`
- `vercel.json`

Related docs inspected:

- `docs/PROJECT_PROGRESS.md`
- `docs/ops/authenticated-admin-api-smoke-test-plan.md`
- `docs/ops/post-deploy-read-only-api-safety-audit.md`
- `docs/ops/ui2-production-deployment-checkpoint.md`

## UI Boundary Findings

| UI Section | Dangerous controls present? | Disabled chips only? | Business action handlers found? | Notes |
| --- | --- | --- | --- | --- |
| 工作台 | No active business controls found | Yes | No | Uses read-only summary fetch and static/fallback queue display. Disabled capabilities are rendered as informational chips. |
| 询盘 | No active business controls found | Yes | No | Live data path uses `GET /api/inquiries`; UI copy states no create, AI processing, send, quote, or PI action is connected. |
| 客户 | No active business controls found | Yes | No | Live data path uses `GET /api/customers`; UI copy states no create, update, import, or delete action is connected. |
| 供应商 | No active business controls found | Yes | No | Static/read-only supplier capability preview only. RFQ, quote, delivery, and supplier commitment language remains disabled/advisory. |
| 制造能力 | No active business controls found | Yes | No | Live data path uses `GET /api/manufacturing-capabilities`; wording avoids confirmed production feasibility, quote, delivery, or shipment commitment. |
| AI 复核 | No active business controls found | Yes | No | Live data path uses `GET /api/ai-inquiry-analyses`; UI states AI content is draft/review-only and cannot send, approve, quote, create PI, or confirm orders. |
| 文件 | No active business controls found | Yes | No | Static/read-only file center preview. No upload, delete, OCR, archive, quote, PI, contract, or order execution is wired. |
| 报价 / 报价前复核 | No active business controls found | Yes | No | Uses inquiry data for read-only pre-quotation review. UI explicitly does not generate quotes, calculate prices, create PI/contracts/orders, collect payment, produce, or ship. |
| 订单 | No active business controls found | Yes | No | Static review queue only. Disabled actions include no order confirmation, contract generation, payment confirmation, or production trigger. |
| 生产 | No active business controls found | Yes | No | Static review queue only. Disabled actions include no production release, delivery confirmation, packaging confirmation, or responsibility conclusion. |
| 发货 | No active business controls found | Yes | No | Static review queue only. Disabled actions include no shipment confirmation, packing list generation, logistics confirmation, or customer notification. |
| 售后 | No active business controls found | Yes | No | Static review queue only. Disabled actions include no liability admission, compensation promise, replacement confirmation, or final conclusion sending. |
| 设置 | No active business controls found | Yes | No | Placeholder settings preview only. AI provider, Gmail, WhatsApp, approval rules, and user settings are not connected. |

### UI Event And Control Notes

- The only active JavaScript event handler found in `admin/ui-foundation/app.js` is navigation via `navList.addEventListener("click", ...)`.
- Data loading uses `fetch()` with default `GET` behavior for read-only endpoints.
- No `onclick`, `submit`, form submission, send, approve/reject, quote, PI, order, payment, production, shipment, or compensation execution handler was found in the Admin UI.
- Topbar mock action buttons remain disabled.
- A legacy visible `Filter` button in `admin/ui-foundation/index.html` has no business handler. It is not a dangerous control, but future UI cleanup should either disable it or wire it only to safe local filtering.
- `renderFormCard()` contains an unused static form sample with input/textarea and `Cancel` / `Save Draft` buttons. It is not currently called by active sections, but future cleanup should remove or disable it before any settings/form area becomes active.

## API Boundary Findings

| API Surface | Read-only? | Write-capable? | Auth protected? | Notes |
| --- | --- | --- | --- | --- |
| `/api/admin-dashboard-summary` | Yes | No | Yes | Routed through `api/customers.js` via `crm_resource=admin-dashboard-summary`; explicitly allows `GET` only and returns `405 Allow: GET` for other methods. |
| `/api/follow-ups` | Yes | No | Yes | Routed through `api/customers.js` via `crm_resource=follow-ups`; resource is marked `readOnly: true` and allows `GET` only. |
| `/api/customers` | Mixed | Yes | Yes | Historical CRM handler. Default customers route supports authenticated `GET`; the consolidated handler also contains authenticated write paths for selected CRM resources. |
| `/api/companies` | Mixed | Yes | Yes | Vercel rewrite to `api/customers.js`; authenticated `POST`, `PATCH`, and `PUT` are still available through the historical consolidated CRM resource handler. |
| `/api/products` | Mixed | Yes | Yes | Vercel rewrite to `api/customers.js`; authenticated write support exists historically. UI2 currently uses read-only `GET` display only. |
| `/api/manufacturing-capabilities` | Mixed | Yes | Yes | Vercel rewrite to `api/customers.js`; authenticated write support exists historically. UI2 currently uses read-only `GET` display only. |
| `/api/ai-inquiry-analyses` | Mixed | Yes | Yes | Vercel rewrite to `api/customers.js`; authenticated write support exists historically. UI2 currently uses read-only `GET` display only. |
| `/api/inquiries` | Mixed | Yes | Yes | Historical handler supports authenticated `GET`, `PATCH`, and `POST` for inquiry/lead/customer/follow-up flows. UI2 currently uses read-only `GET` display only. |
| `/api/health` | Yes | No | No | Public health check. Allows `GET` only. Does not expose secrets or perform business actions. |
| `/api/admin-health` | Yes | No | Yes | Allows `GET` only and requires authenticated Bearer token before Supabase count checks. Does not expose secrets. |
| `/api/public-inquiries` | No | Yes | No | Public website inquiry intake. It writes lead/inquiry/follow-up/attachment metadata and returns manual-review safety text. This is existing intake behavior, not UI2 business execution. |
| `/api/admin-pilot-cleanup` | No | Yes | Yes | Historical pilot cleanup endpoint supports authenticated `DELETE` after an explicit confirmation phrase. This should remain pilot-only and should not become a production customer data deletion workflow. |

## Confirmed Disabled Actions

Current Admin UI and current UI2 read-only surfaces do not expose enabled controls for:

- send
- approve/reject
- RFQ
- quotation generation
- price calculation
- PI generation
- contract generation
- order confirmation
- payment confirmation
- production confirmation
- shipment confirmation
- after-sales liability/compensation conclusion

Where these concepts appear, they appear as:

- disabled capability chips
- safety copy
- static preview text
- read-only queue metadata
- API safety boundary payload text

## Known Concerns

- `api/customers.js` remains a mixed historical CRM handler. It now also hosts read-only dashboard and follow-up routes for Vercel Hobby function-count compatibility, but some CRM resources under the same handler remain authenticated write-capable.
- `api/inquiries.js` contains historical authenticated `PATCH` and `POST` behavior for lead status updates, lead-to-customer conversion, inquiry creation, follow-up task creation, and attachment metadata creation.
- `/api/public-inquiries` is intentionally public and write-capable for website inquiry intake. It does not execute quotations, PI, payment, production, shipment, or outbound customer messages, but it does create pilot CRM records.
- `api/admin-pilot-cleanup.js` can delete pilot rows after authentication and a confirmation phrase. It should remain excluded from normal production workflows.
- The Admin UI has a non-dangerous but active-looking `Filter` button in static HTML and an unused `renderFormCard()` sample with active-looking controls. These are not currently wired to business actions, but future UI polish should remove or disable them to reduce ambiguity.

## Risk Classification

Medium-low after current audit, provided no active UI business controls are introduced.

The main residual risk is not the UI2 read-only wiring itself. The residual risk is that historical mixed API handlers still contain authenticated write paths. Future work should separate read-only API surfaces from write-capable CRM handlers before broadening Admin UI live data wiring or introducing approval workflows.

## Recommended Next Tasks

1. `CBM-CODEX-SPRINT-API-READONLY-004` - Separate Read-only Routes From Mixed CRM Routes Plan
2. `CBM-CODEX-RELEASE-013` - Authenticated Admin API Smoke Test Execution if safe token becomes available
3. `CBM-CODEX-SPRINT-DATA-008` - Dashboard Summary Production Data Validation
4. `CBM-CODEX-SPRINT-API-PLAN-002` - File Metadata Read-only API Plan
5. `CBM-CODEX-SPRINT-SAFETY-002` - Approval Workflow Design Plan

## Audit Conclusion

The current Admin UI remains read-only from an operator action perspective. No active dangerous business controls or business execution handlers were found in the audited Admin UI.

The API layer is safe enough to keep for the current UI2 read-only milestone, but it is not yet cleanly separated by responsibility. Before connecting more live Admin UI sections or building approval workflows, the project should plan a read-only API separation layer so UI display surfaces do not depend on mixed read/write CRM handlers.
