# Phase UI-2 Read-only API Coverage Audit

## Purpose

Audit existing read-only API coverage and map it against the completed static Admin UI workflow sections.

This audit identifies which Admin UI sections already have safe read-only data paths, which sections rely on static fallback, and which areas need read-only API planning before additional UI-2 wiring.

This is documentation only. It does not implement APIs, schema, UI changes, write actions, AI calls, external integrations, or business execution.

## Current UI Workflow Sections

- 工作台
- 询盘
- 客户
- 供应商
- 制造能力
- AI 复核
- 文件
- 报价 / 报价前复核
- 订单
- 生产
- 发货
- 售后
- 设置

The Admin UI also contains read-only Companies and Products sections that support current CRM/product reference data, even though they are not the primary workflow focus of this audit list.

## Existing API Route Inventory

| API file | Route / path | HTTP methods observed | Appears read-only? | Data source / role | Used by Admin UI? | Fallback behavior in UI? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `api/health.js` | `/api/health` | GET | Yes | Service health / mode | No direct workflow use found | Not applicable | Safe health endpoint. |
| `api/admin-health.js` | `/api/admin-health` | GET | Yes | Counts for `leads`, `customers`, `inquiries`, `follow_up_tasks` when Supabase mode is enabled | No direct workflow use found | Not applicable | Useful future source for dashboard aggregate planning. |
| `api/follow-ups.js` | `/api/follow-ups` | GET | Yes | `follow_up_tasks` | No direct workflow use found | Not currently wired | Candidate for future dashboard/customer follow-up aggregate. |
| `api/customers.js` | `/api/customers` | GET | Direct customer path is read-only | `customers` | Yes, Customer Center | Yes | Admin UI calls `GET /api/customers`. |
| `api/customers.js` | Internal CRM resources: `companies`, `products`, `manufacturing-capabilities`, `ai-inquiry-analyses` | GET, POST, PATCH, PUT if routed into this handler | Not strictly read-only | `companies`, `products`, `manufacturing_capabilities`, `ai_inquiry_analyses` | UI calls direct paths such as `/api/companies`, `/api/products`, `/api/manufacturing-capabilities`, `/api/ai-inquiry-analyses` | Yes | The handler contains shared CRM resource support, but matching route files were not found. Direct path availability should be verified before relying on these endpoints. |
| `api/inquiries.js` | `/api/inquiries` | GET, PATCH, POST | GET is read-only; route also contains write methods | `inquiries`, `leads`, `attachments`, `follow_up_tasks`; POST/PATCH can create/update pilot records | Yes, Inquiry Center and derived Pre-Quotation Review | Yes | UI uses GET only. Future API planning should avoid expanding UI writes through this route. |
| `api/public-inquiries.js` | `/api/public-inquiries` | POST | No | Public inquiry intake; writes `leads`, `inquiries`, `follow_up_tasks`, `attachments` metadata | Not Admin UI read-only | Not applicable | Public write intake, out of scope for UI-2 read-only wiring. |
| `api/admin-pilot-cleanup.js` | `/api/admin-pilot-cleanup` | GET, DELETE | GET is read-only; DELETE is destructive pilot cleanup | Pilot cleanup counts/deletion for CRM pilot tables | No direct workflow use found | Not applicable | Must remain outside normal Admin UI workflow. |
| `api/admin-login.js` | `/api/admin-login` | Page render | Display only | Admin login HTML | Not part of workflow data coverage | Not applicable | Injects public env config into HTML. |
| `api/admin-dev-test.js` | `/api/admin-dev-test` | Page render | Display only | Admin dev test HTML | Not part of workflow data coverage | Not applicable | Development page rendering. |
| `api/admin-system-check.js` | `/api/admin-system-check` | Page render | Display only | Admin system-check / command-center HTML | Not part of workflow data coverage | Not applicable | Development/admin page rendering. |
| `api/trade-website.js` | `/api/trade-website` | Page render | Display only | Public website HTML | No | Not applicable | Public website rendering, not Admin UI data coverage. |
| `api/trade-os-prototype.js` | `/api/trade-os-prototype` | Page render | Display only | Prototype HTML | No | Not applicable | Prototype rendering, not UI-2 data coverage. |
| `api/_supabase.js` | Internal helper | Not a route | Not applicable | Supabase client and shared API helpers | Indirect | Not applicable | Helper file only. |

## UI-to-API Coverage Matrix

| UI Section | Current route / API path | Existing API? | Wired in Admin UI? | Fallback preserved? | Missing API/data? | Risk level | Recommended next step |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 工作台 | None dedicated | No dashboard aggregate endpoint found | Static preview only | Yes | Dashboard aggregate read-only data | Low | Plan a GET-only dashboard aggregate endpoint before live dashboard wiring. |
| 询盘 | `/api/inquiries` | Yes | Yes, GET only | Yes | Dedicated GET-only inquiry read model may be useful later | Medium | Keep UI read-only; avoid using POST/PATCH from Admin UI until separately approved. |
| 客户 | `/api/customers` | Yes | Yes, GET only | Yes | None blocking for current read-only CRM list | Low | Keep current read-only path; plan follow-up aggregate separately. |
| 供应商 | `/api/manufacturing-capabilities` attempted | Direct route file not found; shared CRM resource handler exists inside `api/customers.js` | Yes, attempts read-only capability data | Yes | Supplier entity/API unclear; capability endpoint availability should be verified | Medium | Plan supplier/capability read-only API coverage explicitly. |
| 制造能力 | `/api/manufacturing-capabilities` attempted | Direct route file not found; `manufacturing_capabilities` table exists | Yes | Yes | Dedicated GET-only route or routing confirmation | Medium | Add a dedicated read-only API plan for manufacturing capabilities. |
| AI 复核 | `/api/ai-inquiry-analyses` attempted | Direct route file not found; `ai_inquiry_analyses` table exists | Yes | Yes | Dedicated GET-only route or routing confirmation | Medium | Plan a GET-only AI review records endpoint; no AI execution. |
| 文件 | None dedicated | No `/api/files` or `/api/documents` route found | Static preview only | Yes | File/document metadata API | Medium | Plan file/document metadata GET-only endpoint. |
| 报价 / 报价前复核 | Derived from inquiry read-only data | No `/api/quotations` route found; quotation tables exist | Derived read-only | Yes | Quotation read-only endpoint and quotation item read model | Medium | Plan quotation read-only API before real quotation display. |
| 订单 | None dedicated | No order API found | Static preview only | Yes | Order schema/API unclear | Medium | Plan order read-only schema/API before UI data wiring. |
| 生产 | None dedicated | No production API found | Static preview only | Yes | Production schema/API unclear | Medium | Plan production read-only model before UI data wiring. |
| 发货 | None dedicated | No shipping API found | Static preview only | Yes | Shipping/shipment schema/API unclear | Medium | Plan shipping read-only model before UI data wiring. |
| 售后 | None dedicated | No after-sales API found | Static preview only | Yes | After-sales schema/API unclear | Medium | Plan after-sales read-only model before UI data wiring. |
| 设置 | None dedicated | No settings/config endpoint found | Static preview only | Yes | Settings/config read-only model unclear | Low | Keep static until RBAC/config planning exists. |

## Wired Read-only Sections

- 询盘中心 uses `GET /api/inquiries` and preserves static fallback.
- 客户中心 uses `GET /api/customers` and preserves static fallback.
- 供应商中心 attempts read-only capability data from `/api/manufacturing-capabilities` and preserves static fallback.
- 制造能力中心 attempts read-only capability data from `/api/manufacturing-capabilities` and preserves static fallback.
- AI 复核中心 attempts read-only AI analysis records from `/api/ai-inquiry-analyses` and preserves static fallback.

Important note: `companies`, `products`, `manufacturing-capabilities`, and `ai-inquiry-analyses` support appears to exist as shared CRM resource logic inside `api/customers.js`, but matching direct API files were not found in `api/`. Direct endpoint availability should be verified or replaced with explicit GET-only route files in a future approved task.

## Static Fallback-only Sections

- 工作台
- 文件
- 订单
- 生产
- 发货
- 售后
- 设置

These sections remain useful for validating workflow order, Chinese operator wording, safety boundaries, and layout, but they are not yet backed by dedicated live read-only APIs.

## Derived Read-only Sections

- 报价 / 报价前复核 derives its read-only view from inquiry records and static fallback data.
- It does not call `/api/quotations`.
- No quotation generation, price calculation, PI generation, contract generation, order creation, or sending is connected.

## Missing Read-only API Candidates

Likely missing or not yet dedicated as GET-only APIs:

- Dashboard aggregate read-only endpoint.
- Files/documents metadata read-only endpoint.
- Quotations read-only endpoint.
- Quotation items read-only endpoint.
- Orders read-only endpoint.
- Production read-only endpoint.
- Shipping/shipment read-only endpoint.
- After-sales read-only endpoint.
- Settings/config read-only endpoint.
- Supplier read-only endpoint if supplier records become separate from manufacturing capabilities.

Do not implement these in UI-2B until each endpoint has a narrow read-only plan and safety review.

## Schema/Table Readiness Notes

Migration inspection found table support for:

- `customers`
- `leads`
- `inquiries`
- `follow_up_tasks`
- `attachments`
- `companies`
- `architectural_inquiries`
- `deep_processing_inquiries`
- `products`
- `quotations`
- `quotation_items`
- `documents`
- `manufacturing_capabilities`
- `ai_inquiry_analyses`

Schema/table readiness is unclear or not found for:

- orders
- production
- shipping / shipments
- after-sales
- settings/config
- standalone suppliers

File metadata has partial table support through `attachments` and `documents`, but no dedicated Admin UI read-only metadata endpoint was found.

Quotations have table support through `quotations` and `quotation_items`, but no `/api/quotations` route was found.

## Recommended Next Read-only API Order

1. Dashboard aggregate read-only endpoint plan.
2. Files/documents metadata read-only endpoint plan.
3. Quotations read-only endpoint plan.
4. Orders read-only endpoint plan.
5. Production/shipping read-only endpoint plan.
6. After-sales read-only endpoint plan.

This order keeps UI-2B focused on safe visibility before any write/action workflow.

## Safety Boundaries for UI-2B

Future UI-2B APIs must be GET/read-only first.

Forbidden unless a later task explicitly approves and designs the boundary:

- POST/PUT/PATCH/DELETE from Admin UI workflow screens.
- Send actions.
- Approve/reject execution.
- RFQ sending.
- Quotation generation.
- Price calculation engine.
- PI or contract generation.
- Order confirmation.
- Payment confirmation.
- Production confirmation.
- Shipment confirmation.
- File upload, deletion, parsing, OCR, or archive promotion.
- External AI/OpenAI execution.
- Gmail, WhatsApp, or external channel integration.

All high-risk commercial actions remain human-reviewed and separately approved.

## Recommended Next 5 Codex Tasks

1. `CBM-CODEX-SPRINT-API-PLAN-001` - Dashboard Aggregate Read-only API Plan
2. `CBM-CODEX-SPRINT-API-PLAN-002` - File Metadata Read-only API Plan
3. `CBM-CODEX-SPRINT-API-PLAN-003` - Quotation Read-only API Plan
4. `CBM-CODEX-SPRINT-API-PLAN-004` - Order Read-only API Plan
5. `CBM-CODEX-SPRINT-SAFETY-001` - Disabled Action And Approval Boundary Audit
