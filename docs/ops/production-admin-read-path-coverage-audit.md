# Production Admin-read Path Coverage Audit

## Purpose

Audit the current production-ready Admin UI data paths and document which sections already use `/api/admin-read/...`, which sections still use legacy read-only or static fallback patterns, and which resources should be migrated next.

This checkpoint is documentation-only. It does not change UI code, API code, schema, package files, environment variables, or production deployment state.

## Current Admin-read Migrated Sections

The production Admin UI has migrated the main read-only workflow sections to Admin Read Dispatcher routes:

| UI section | Admin-read route | Production status |
| --- | --- | --- |
| 工作台 | `/api/admin-read/dashboard-summary` | Deployed; unauthenticated request returns `401`, not `404`; fallback renders. |
| 客户中心 | `/api/admin-read/customers` | Deployed; unauthenticated request returns `401`, not `404`; fallback renders. |
| 询盘中心 | `/api/admin-read/inquiries` | Deployed; unauthenticated request returns `401`, not `404`; fallback renders. |
| AI 复核中心 | `/api/admin-read/ai-review` | Deployed; unauthenticated request returns `401`, not `404`; fallback renders. |
| 供应商中心 | `/api/admin-read/supplier-capabilities` | Deployed through the shared supplier capability read model; unauthenticated request returns `401`, not `404`; fallback renders. |
| 制造能力中心 | `/api/admin-read/supplier-capabilities` | Deployed; unauthenticated request returns `401`, not `404`; fallback renders. |

## Source API Path Inventory

`admin/ui-foundation/app.js` currently contains these frontend data paths:

| Path | Classification | Current use | Notes |
| --- | --- | --- | --- |
| `/api/admin-read/dashboard-summary` | Admin-read path | 工作台 summary and queues | Production verified. |
| `/api/admin-read/customers` | Admin-read path | 客户中心 V2 | Production verified. |
| `/api/admin-read/inquiries` | Admin-read path | 询盘中心 V2 and quotation/pre-quotation derived view | Production verified. |
| `/api/admin-read/ai-review` | Admin-read path | AI 复核中心 V2 | Production verified. |
| `/api/admin-read/supplier-capabilities` | Admin-read path | 供应商中心 and 制造能力中心 | Production verified. |
| `/api/companies` | Legacy compatible read path | 客户公司 section | Still routed through legacy compatibility. Not part of current Admin-read production batch. |
| `/api/products` | Legacy compatible read path | 产品 section | Still routed through legacy compatibility. Not part of current Admin-read production batch. |

No frontend loader string was found in `admin/ui-foundation/app.js` for:

- `/api/admin-dashboard-summary`
- `/api/customers`
- `/api/inquiries`
- `/api/ai-inquiry-analyses`
- `/api/manufacturing-capabilities`
- `/api/documents`
- `/api/quotations`
- `/api/orders`
- `/api/production`
- `/api/shipping`
- `/api/after-sales`
- `/api/settings-summary`

`vercel.json` still keeps legacy compatibility routes for some older API surfaces, including companies, products, manufacturing capabilities, AI inquiry analyses, follow-ups, and the old admin dashboard summary. These remain compatibility routes and are not current Admin UI loader paths for the migrated sections.

## UI Section Coverage Matrix

| UI section | Current data source/path | Uses admin-read? | Uses legacy route? | Static fallback preserved? | Production smoke status | Next recommended action | Risk level |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 工作台 | `/api/admin-read/dashboard-summary` | Yes | No current UI loader legacy path | Yes | Verified: Admin UI renders; protected API returns `401`, not `404`; fallback renders. | Keep; run authenticated JSON smoke later if safe token exists. | Low |
| 询盘 | `/api/admin-read/inquiries` | Yes | No current UI loader legacy path | Yes | Verified: section renders; protected API returns `401`, not `404`; fallback renders. | Keep; run authenticated JSON smoke later if safe token exists. | Low |
| 客户 | `/api/admin-read/customers` | Yes | No current UI loader legacy path | Yes | Verified: section renders; protected API returns `401`, not `404`; fallback renders. | Keep; run authenticated JSON smoke later if safe token exists. | Low |
| 供应商 | `/api/admin-read/supplier-capabilities` through shared capability state | Yes | No current UI loader legacy path | Yes | Verified: section renders; protected API returns `401`, not `404`; fallback renders. | Keep; consider a dedicated supplier resource only after a real supplier source is planned. | Low |
| 制造能力 | `/api/admin-read/supplier-capabilities` | Yes | No current UI loader legacy path | Yes | Verified: section renders; protected API returns `401`, not `404`; fallback renders. | Keep; run authenticated JSON smoke later if safe token exists. | Low |
| AI 复核 | `/api/admin-read/ai-review` | Yes | No current UI loader legacy path | Yes | Verified: section renders; protected API returns `401`, not `404`; fallback renders. | Keep; run authenticated JSON smoke later if safe token exists. | Low |
| 文件 | Static fallback only | No | No | Yes | Static preview only; no production API route is used by this section. | Plan file metadata Admin-read resource before implementation. | Medium |
| 报价 / 报价前复核 | Derived from the existing inquiry read model when inquiry data is available; otherwise static fallback | Indirectly, through `/api/admin-read/inquiries` | No separate quotation route | Yes | Static/derived preview only; no quote write action exists. | Plan quotation/pre-quotation read model before adding a dedicated route. | Medium |
| 订单 | Static commercial workflow preview | No | No | Yes | Static preview only. | Defer until order schema/API planning is approved. | Medium |
| 生产 | Static commercial workflow preview | No | No | Yes | Static preview only. | Defer until production workflow and approval boundaries are planned. | Medium |
| 发货 | Static commercial workflow preview | No | No | Yes | Static preview only. | Defer until shipment/export document read model is planned. | Medium |
| 售后 | Static commercial workflow preview | No | No | Yes | Static preview only. | Defer until after-sales data model is planned. | Medium |
| 设置 | Static boundary preview | No | No | Yes | Static preview only. | Keep static until system settings read-only API is explicitly planned. | Low |

Additional sections outside the requested matrix:

| UI section | Current data source/path | Classification | Next recommended action |
| --- | --- | --- | --- |
| 客户公司 | `/api/companies` | Legacy compatible read path | Consider later Admin-read migration if company data remains part of the Admin UI. |
| 产品 | `/api/products` | Legacy compatible read path | Consider later Admin-read migration after higher-priority workflow resources. |

## Admin-read Dispatcher Coverage

`api/admin-read.js` currently supports these resources:

| Resource | Route | GET-only? | Auth-gated? | Unknown fallback behavior | Safety notes |
| --- | --- | --- | --- | --- | --- |
| `dashboard-summary` | `/api/admin-read/dashboard-summary` | Yes | Yes, via existing admin/Supabase auth boundary | Unsupported resources return stable JSON `404` before source access. | Summary and queues are read-only; safety payload disables write/business actions. |
| `customers` | `/api/admin-read/customers` | Yes | Yes | Unsupported resources return stable JSON `404`. | Returns normalized customer records only; no create/update/delete action. |
| `inquiries` | `/api/admin-read/inquiries` | Yes | Yes | Unsupported resources return stable JSON `404`. | Returns normalized inquiry records only; no create/send/AI processing action. |
| `ai-review` | `/api/admin-read/ai-review` | Yes | Yes | Unsupported resources return stable JSON `404`. | Returns existing AI analysis records as read-only review data; no AI call, send, approval, quote, PI, or order action. |
| `supplier-capabilities` | `/api/admin-read/supplier-capabilities` | Yes | Yes | Unsupported resources return stable JSON `404`. | Returns manufacturing capability records as read-only supplier/capability data; no supplier commitment, quote, production, or delivery confirmation. |

Dispatcher behavior:

- Non-GET requests return `405` with `Allow: GET`.
- Unknown resources return stable JSON `404`.
- Protected resources remain auth-gated.
- The safety payload keeps disabled action names visible for downstream UI safety.

## Remaining Migration Candidates

| Candidate | Current state | Recommendation | Reason |
| --- | --- | --- | --- |
| 文件 | Static fallback only | Plan API first | Needs safe file metadata boundaries before any real file listing. Must not read, upload, delete, parse, archive, or expose real customer files without approval. |
| 报价 / 报价前复核 | Uses inquiry-derived read model when inquiry data exists; otherwise static fallback | Plan read model first | Quotation data is commercially sensitive. A dedicated route must stay read-only and must not calculate or confirm price, PI, contract, or order. |
| 订单 | Static fallback only | Defer | Needs order schema/API and approval boundary planning. |
| 生产 | Static fallback only | Defer | Must not imply production feasibility, supplier commitment, or delivery confirmation. |
| 发货 | Static fallback only | Defer | Needs shipment/export document read model and strict no-confirmation boundary. |
| 售后 | Static fallback only | Defer | Needs after-sales/claim evidence model and no responsibility/compensation commitment boundary. |
| 设置 | Static fallback only | Keep static for now | Settings can affect security, auth, AI, or external integrations and should be planned separately. |
| 客户公司 | `/api/companies` legacy compatible route | Lower-priority Admin-read migration | Useful but less workflow-critical than file/quotation coverage. |
| 产品 | `/api/products` legacy compatible route | Lower-priority Admin-read migration | Useful but less workflow-critical than file/quotation coverage. |

## Production Smoke Assumptions

Current production checkpoint evidence records:

- `/` returns `200`.
- `/admin/ui-foundation/index.html?trial=1` returns `200`.
- `/admin/ui-foundation/app.js` returns `200`.
- `/api/health` returns `200`.
- Protected Admin-read routes return unauthenticated `401`, not `404`:
  - `/api/admin-read/dashboard-summary`
  - `/api/admin-read/customers`
  - `/api/admin-read/inquiries`
  - `/api/admin-read/ai-review`
  - `/api/admin-read/supplier-capabilities`
- `/api/admin-read/unknown` returns stable JSON `404`.
- `POST /api/admin-read/ai-review` returns `405` with `Allow: GET`.
- Authenticated JSON smoke remains deferred because no safe admin bearer token was provided.

No deployment was run for this audit.

## Risks and Constraints

- UI could accidentally drift back to mixed legacy handlers if future work edits endpoints without checking current constants.
- Remaining sections do not yet have Admin-read resources.
- `vercel.json` still keeps legacy compatibility routes; they are useful for compatibility but can confuse future audits if not clearly labeled.
- Vercel function count remains tight, so adding many separate API files is risky.
- Static fallback can mask missing real data during unauthenticated preview.
- Authenticated JSON shape has not been verified in production because no safe token was provided.
- File, quotation, order, production, shipment, and after-sales resources carry higher business risk and need planning before read-only routing.

## Recommended Next Tasks

1. CBM-CODEX-SPRINT-API-PLAN-002 - File Metadata And Quotation Admin-read Plan
2. CBM-CODEX-RELEASE-013 - Authenticated Admin API Smoke Test Execution if safe token exists
3. CBM-CODEX-SPRINT-API-READONLY-009 - Extend Admin Read Dispatcher For File And Quotation Resources
4. CBM-CODEX-SPRINT-DATA-013 - Plan Admin-read Migration For Remaining Static Sections
5. CBM-CODEX-SPRINT-SAFETY-002 - Write Action Approval Architecture Plan

Preferred next step: create the File Metadata And Quotation Admin-read Plan first. The source audit shows these are the highest-value remaining workflow surfaces, but both need a planned read-only model before implementation.

## Progress Report

- Full product vision: 33% -> 33%
- Internal MVP / foundation: 77% -> 77%
- Production Admin-read Path Coverage Audit: 0% -> 100%
- Overall: [███░░░░░░░] 33%
- Internal MVP: [████████░░] 77%
- Current module: [██████████] 100%
