# Phase UI-2 File Metadata And Quotation Admin-read Plan

## Purpose

Plan future read-only Admin Read Dispatcher resources for File Metadata and Quotation / Pre-Quotation Review.

This plan is documentation-only. It does not implement API routes, modify Admin UI code, modify schema, change package files, deploy, run migrations, add AI calls, upload/download/delete files, generate quotations, calculate prices, generate PI/contracts/orders, or execute business actions.

The goal is to make the next implementation step safe, small, and compatible with the current Vercel Hobby deployment shape.

## Current State

The production Admin UI has already migrated these high-priority read-only surfaces to `/api/admin-read/...`:

| UI surface | Current admin-read path | Status |
| --- | --- | --- |
| 工作台 | `/api/admin-read/dashboard-summary` | Production verified. |
| 客户中心 | `/api/admin-read/customers` | Production verified. |
| 询盘中心 | `/api/admin-read/inquiries` | Production verified. |
| AI 复核中心 | `/api/admin-read/ai-review` | Production verified. |
| 供应商中心 | `/api/admin-read/supplier-capabilities` | Production verified through shared supplier capability read model. |
| 制造能力中心 | `/api/admin-read/supplier-capabilities` | Production verified. |

The remaining high-value UI candidates are:

- 文件中心 / File Center
- 报价 / 报价前复核 / Quotation and Pre-Quotation Review

These are higher risk than the current migrated sections because they can touch real customer attachments, supplier quotes, PI/contracts, price calculations, payment/order boundaries, and downstream production/shipment commitments.

## Source Readiness Review

Current source inspection found the following readiness:

| Source area | Evidence found | Readiness | Notes |
| --- | --- | --- | --- |
| `documents` | `public.documents` table exists with `related_type`, `related_id`, `doc_type`, `file_name`, `file_url`, `summary`, timestamps, RLS policies, and indexes. | Partial | Good metadata base, but no dedicated Admin-read resource exists. `file_url` must be treated carefully and may be hidden or omitted if sensitive. |
| `files` | No standalone `files` table or `/api/files` route found. | Missing / partial through metadata | Use `documents` and `attachments` metadata first. Do not plan real file operations yet. |
| `attachments` | `public.attachments` table exists with `lead_id`, `customer_id`, `inquiry_id`, `file_name`, `file_type`, `file_size`, `storage_path`, `source`, metadata; `api/inquiries.js` reads/writes attachment metadata. | Partial / ready for metadata | Metadata exists, but `storage_path` can be sensitive. Future admin-read should expose only safe display fields. |
| `inquiry_documents` | No table or route found. | Missing | Do not rely on this name unless a future schema task adds it. |
| `quotations` | `public.quotations` table exists with `quote_no`, customer/company/inquiry links, `business_line`, `quote_model`, `incoterm`, `payment_terms`, `total_amount`, `currency`, `status`, `approval_required`, notes, timestamps, RLS policies, and indexes. | Partial | Table exists, but no `/api/quotations` or admin-read quotation resource exists. Payment terms and amount require conservative display rules. |
| `quotation_items` | `public.quotation_items` table exists with product link, quantity, unit, unit price, total amount, dimensions, kg/m, material/machining/finish cost, tolerance, drawing ref, notes. | Partial / sensitive | Table exists, but internal cost fields must not be exposed in customer-facing or casual Admin preview. Use summary-level metadata first. |
| `orders` | No current order table/API found in inspected API/migrations. | Missing | Defer order admin-read planning until schema exists. |
| `products` | `public.products` table and legacy `/api/products` rewrite-backed route exist. | Partial / ready | Useful reference source, but not first priority for File/Quotation migration. |
| `customers` | `public.customers` table and `/api/admin-read/customers` exist. | Ready | Safe for linking names/IDs in read-only summaries. |
| `inquiries` | `public.inquiries` table and `/api/admin-read/inquiries` exist. | Ready | Best source for first pre-quotation review resource. |
| related suppliers/capabilities | `public.manufacturing_capabilities` and `/api/admin-read/supplier-capabilities` exist. No standalone suppliers table found. | Partial | Use capability metadata only. Do not imply supplier commitment. |

Readiness conclusion:

- File metadata is feasible as a read-only metadata resource, using `documents` first and optionally `attachments` as a second metadata source.
- Pre-quotation review is feasible as a derived read-only resource from `inquiries`, with optional links to `customers` and safe capability summaries.
- Full quotation display is possible later because quotation tables exist, but it needs a stricter projection to avoid exposing internal cost, payment, price, PI, or order commitment risk.

## File Metadata Admin-read Plan

### Target Route

```text
GET /api/admin-read/documents
```

### Purpose

Provide read-only file/document metadata for the Admin UI 文件中心.

This route should show enough information for operators to understand what needs review, without exposing sensitive file contents or enabling file operations.

### Strictly Forbidden

This route must not:

- upload files
- delete files
- parse files
- run OCR
- download sensitive files
- mutate external storage
- promote files to archive
- call AI for file analysis
- generate quotes
- generate PI/contracts/orders
- send anything to customers or suppliers

### Proposed Response Shape

```json
{
  "meta": {
    "generated_at": "2026-06-19T00:00:00.000Z",
    "source": "admin_read",
    "resource": "documents",
    "is_fallback": false
  },
  "records": [],
  "summary": {},
  "safety": {
    "human_review_required": true,
    "disabled_actions": [
      "upload_file",
      "delete_file",
      "parse_file",
      "run_ocr",
      "download_sensitive_file",
      "generate_quote",
      "generate_pi",
      "send_to_customer"
    ]
  },
  "warnings": []
}
```

### Suggested Record Shape

Use safe display fields only:

- `id`
- `title`
- `file_type`
- `linked_business_type`
- `linked_business_id`
- `status`
- `risk`
- `source`
- `created_at`
- `updated_at`

Optional safe fields:

- `summary`
- `doc_type`
- `file_size`
- `manual_review_required`

Fields to omit or mask by default:

- raw `storage_path`
- direct signed/private file URLs
- full `file_url` if it grants access to sensitive customer files
- parsed file text
- OCR output
- internal cost or pricing details
- bank/payment data

### Source Strategy

Recommended first implementation:

1. Read from `public.documents`.
2. Normalize into display-only metadata rows.
3. If `documents` is empty or unavailable, optionally read metadata from `public.attachments`.
4. Return empty `records` plus `warnings` instead of throwing when optional metadata is unavailable.
5. Keep 文件中心 static fallback in the UI.

## Quotation / Pre-Quotation Admin-read Plan

### Target Routes

Recommended route split:

```text
GET /api/admin-read/pre-quotation-review
GET /api/admin-read/quotations
```

Reason:

- `pre-quotation-review` can be safely derived from existing `inquiries` before real quotation display is ready.
- `quotations` should read actual quotation records later and must be more restrictive because quote totals, payment terms, and line items can carry business risk.

### Purpose

Provide read-only metadata for 报价 / 报价前复核 without generating prices, creating quotations, generating PI, approving anything, or confirming orders.

### Strictly Forbidden

These routes must not:

- generate quotes
- calculate official prices
- generate PI
- generate contracts
- send quotes
- approve/reject quotes
- confirm orders
- confirm payment
- trigger production
- trigger shipment
- expose internal cost, profit, exchange rate details, internal weight uplift, or supplier cost breakdown

### Proposed `quotations` Response Shape

```json
{
  "meta": {
    "generated_at": "2026-06-19T00:00:00.000Z",
    "source": "admin_read",
    "resource": "quotations",
    "is_fallback": false
  },
  "records": [],
  "summary": {},
  "safety": {
    "human_review_required": true,
    "disabled_actions": [
      "generate_quote",
      "calculate_price",
      "send_quote",
      "approve_quote",
      "generate_pi",
      "confirm_order"
    ]
  },
  "warnings": []
}
```

### Suggested Quotation Record Shape

Use summary metadata only:

- `id`
- `quote_no`
- `customer_name`
- `inquiry_id`
- `status`
- `risk`
- `currency`
- `total_amount` only if already stored and safe to display internally
- `created_at`
- `updated_at`

Do not include by default:

- `payment_terms`
- detailed line items
- `material_cost`
- `machining_cost`
- `finish_cost`
- profit
- exchange rate
- internal uplift
- supplier cost breakdown
- bank/payment details
- send/approve callback fields

### Proposed `pre-quotation-review` Response Shape

`pre-quotation-review` can use the same standard admin-read envelope:

```json
{
  "meta": {
    "generated_at": "2026-06-19T00:00:00.000Z",
    "source": "admin_read",
    "resource": "pre-quotation-review",
    "is_fallback": false
  },
  "records": [],
  "summary": {},
  "safety": {
    "human_review_required": true,
    "disabled_actions": [
      "generate_quote",
      "calculate_price",
      "send_quote",
      "generate_pi",
      "confirm_order",
      "confirm_payment",
      "trigger_production",
      "trigger_shipment"
    ]
  },
  "warnings": []
}
```

### Suggested Pre-Quotation Record Shape

- `id`
- `inquiry_id`
- `customer_name`
- `readiness_status`
- `missing_information`
- `supplier_status`
- `risk`
- `ai_suggestion_summary` if already stored
- `human_next_step`
- `disabled_actions`

### Source Strategy

Recommended first implementation:

1. Add `pre-quotation-review` first, derived from `inquiries`.
2. Use inquiry fields such as `missing_info`, `ai_summary`, `recommended_next_action`, `status`, `business_line`, `product_category`, and customer/company links.
3. Do not read `quotation_items` in the first implementation.
4. Add `quotations` later with a conservative projection over `quotations`, and only after reviewing whether `total_amount`, `payment_terms`, and status values are safe for internal operator display.

## Data Source Mapping

| Admin-read resource | Candidate source table | Existing route? | Existing UI section? | Readiness | Fallback requirement | Risk level | Implementation note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `documents` | `documents`, optional `attachments` | No dedicated route | 文件中心 | Partial | Keep static File Center fallback | Medium | Add metadata-only projection. Omit sensitive URLs/storage paths by default. |
| `quotations` | `quotations`, later `quotation_items` | No dedicated route | 报价 / 报价前复核 | Partial | Keep quotation static/derived fallback | High | Read summary metadata first. Do not expose item-level internal cost fields. |
| `pre-quotation-review` | `inquiries`, optional `customers`, optional `manufacturing_capabilities` | No dedicated route; currently derived in UI from inquiry state | 报价 / 报价前复核 | Ready / partial | Keep static fallback | Medium | Best first quotation-adjacent route because it can remain review-only and inquiry-derived. |
| related inquiries | `inquiries` | `/api/admin-read/inquiries` | 询盘, quotation-derived view | Ready | Keep fallback | Low | Already migrated; can be reused as source logic. |
| related customers | `customers` | `/api/admin-read/customers` | 客户 | Ready | Keep fallback | Low | Use safe display name/ID only. |
| related products | `products` | Legacy `/api/products` route | 产品 | Partial / ready | Keep fallback | Medium | Lower priority. Do not use product pricing as official quote logic. |
| related suppliers/capabilities | `manufacturing_capabilities` | `/api/admin-read/supplier-capabilities` | 供应商, 制造能力 | Partial / ready | Keep fallback | Medium | Metadata only. Do not imply supplier capacity, feasibility, or delivery commitment. |

## Vercel Hobby Strategy

Future implementation should not create new physical `api/*.js` files for documents or quotations.

Recommended strategy:

- Extend the existing physical `api/admin-read.js` dispatcher.
- Keep using the existing `/api/admin-read/*` rewrite in `vercel.json`.
- Add logical resources through path dispatch inside `api/admin-read.js`.
- Keep Vercel-routable function count at or below the current safe deployment shape.
- Add resources incrementally:
  - first `documents`
  - then `pre-quotation-review`
  - then `quotations` only after a safety review
- Keep write/action routes in a future separate namespace such as `/api/admin-actions/...`.

## API Safety Rules

Future implementation must:

- support `GET` only
- return `405` with `Allow: GET` for non-GET methods
- perform no database mutations
- call no OpenAI, AI Gateway, OCR, parser, Gmail, WhatsApp, or external channel
- upload no files
- download no sensitive files
- delete no files
- parse no files
- generate no quote, PI, contract, order, payment, production, or shipment records
- expose no secrets, service keys, raw env values, payment credentials, bank details, internal costs, profit, exchange rates, or private file contents
- return stable JSON envelopes with `records`, `summary`, `safety`, and `warnings`
- preserve empty/fallback behavior
- preserve human review safety payloads

Future implementation must not treat any returned record as:

- quote-ready
- price-confirmed
- PI-ready
- order-confirmed
- supplier-confirmed
- production-feasible
- delivery-confirmed
- payment-confirmed

## Frontend Migration Plan

After API implementation and sanity review:

1. Migrate 文件中心 from static-only preview to `GET /api/admin-read/documents`.
2. Preserve static fallback if the route returns `401`, `404`, empty data, invalid data, or errors.
3. Keep all file rows display-only. Do not add upload, download, delete, parse, OCR, archive, send, quote, or PI controls.
4. Migrate 报价 / 报价前复核 to `GET /api/admin-read/pre-quotation-review` first.
5. Preserve the current inquiry-derived fallback until the new route is production verified.
6. Do not add quote generation, price calculation, PI generation, approval, send, order, payment, production, or shipment controls.
7. Consider `GET /api/admin-read/quotations` only after the pre-quotation resource is stable and a safe quotation projection is reviewed.

## Risk Matrix

| Risk | Severity | Mitigation |
| --- | --- | --- |
| File metadata route becomes file operations | High | Metadata-only projection; no upload/download/delete/parse/OCR actions; disabled actions in safety payload. |
| Quotation metadata becomes price generation | High | Do not calculate prices; read stored summary metadata only; keep generation in future explicit action workflow. |
| Sensitive customer/payment/bank/internal cost data leaks | High | Omit payment terms, bank details, internal cost, profit, exchange rate, internal uplift, supplier cost breakdown, private file paths, and file contents. |
| Vercel function count grows | Medium | Extend `api/admin-read.js`; do not create new physical API files. |
| Static fallback masks missing real data | Medium | Return clear `warnings`; UI should show source/fallback status. |
| Read-only resources mix with write-capable CRM handlers | High | Use `/api/admin-read/...` dispatch only; never route through mixed legacy write handlers for new UI surfaces. |
| UI implies quote readiness | High | Use wording like "报价前复核" and "人工判断"; avoid "ready to quote" or confirmation wording unless data and approval are explicit. |
| Quotation item fields expose internal costs | High | Do not expose `material_cost`, `machining_cost`, `finish_cost`, supplier costs, or internal calculation details by default. |
| Document URLs expose private files | High | Omit URLs by default or expose only non-sensitive display labels until storage access policy is planned. |

## Recommended Implementation Order

1. Extend Admin Read Dispatcher with a `documents` metadata resource if source readiness remains adequate.
2. Migrate File Center UI to `GET /api/admin-read/documents`, preserving static fallback and adding no controls.
3. Extend Admin Read Dispatcher with `pre-quotation-review` derived from existing inquiries.
4. Migrate Quotation / Pre-Quotation UI to `GET /api/admin-read/pre-quotation-review`.
5. Plan `quotations` table/read endpoint separately if the safe projection is still unclear.

Do not implement full quotation display, quotation items, price totals, payment terms, or quote generation before a dedicated safety review.

## Recommended Next Tasks

1. CBM-CODEX-SPRINT-API-READONLY-009 - Extend Admin Read Dispatcher For File Metadata
2. CBM-CODEX-SPRINT-DATA-013 - Migrate File Center UI To Admin Read Documents
3. CBM-CODEX-SPRINT-API-READONLY-010 - Extend Admin Read Dispatcher For Pre-Quotation Review
4. CBM-CODEX-SPRINT-DATA-014 - Migrate Pre-Quotation UI To Admin Read Resource
5. CBM-CODEX-SPRINT-SAFETY-002 - Write Action Approval Architecture Plan

## Progress Report

- Full product vision: 33% -> 33%
- Internal MVP / foundation: 77% -> 77%
- File/Quotation Admin-read Planning: 0% -> 100%
- Overall: [███░░░░░░░] 33%
- Internal MVP: [████████░░] 77%
- Current module: [██████████] 100%
