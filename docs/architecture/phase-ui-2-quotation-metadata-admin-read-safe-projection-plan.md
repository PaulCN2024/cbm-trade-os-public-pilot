# Phase UI-2 Quotation Metadata Admin-read Safe Projection Plan

## Purpose

Plan a future safe read-only Admin Read Dispatcher resource for quotation metadata.

This plan is documentation-only. It does not implement API routes, modify Admin UI code, modify schema, run migrations, calculate prices, generate quotations, generate PI, send quotations, approve quotes, confirm orders, or execute business actions.

The goal is to define the safest possible projection before any `GET /api/admin-read/quotations` implementation is attempted.

## Current Baseline

Current read-only/Admin-read baseline:

| Admin UI surface | Current read path | Status |
| --- | --- | --- |
| 工作台 | `/api/admin-read/dashboard-summary` | Implemented and production verified. |
| 询盘 | `/api/admin-read/inquiries` | Implemented and production verified. |
| 客户 | `/api/admin-read/customers` | Implemented and production verified. |
| AI 复核 | `/api/admin-read/ai-review` | Implemented and production verified. |
| 供应商 | `/api/admin-read/supplier-capabilities` | Implemented and production verified. |
| 制造能力 | `/api/admin-read/supplier-capabilities` | Implemented and production verified. |
| 文件中心 | `/api/admin-read/documents` | Implemented and production verified. |
| 报价前复核 | `/api/admin-read/pre-quotation-review` | Implemented and production verified. |

Pre-Quotation Review already exists and is read-only. It is derived from inquiry/customer context and remains conservative.

Final quotation generation is not implemented.

Quotation metadata Admin-read must not calculate or generate anything. It may only project already-stored, reviewed-safe metadata for internal operator display.

## Source Readiness Review

Source inspection focused on existing planning docs, `api/admin-read.js`, and Supabase migrations. No SQL was executed.

| Source | Evidence | Classification | Notes |
| --- | --- | --- | --- |
| `quotations` | `public.quotations` exists with `quote_no`, customer/company/inquiry links, `business_line`, `quote_model`, `incoterm`, `payment_terms`, `total_amount`, `currency`, `status`, `approval_required`, notes, timestamps, RLS, and indexes. | Partial | Table exists, but no Admin-read quotation resource exists. `payment_terms`, `total_amount`, and status wording need conservative projection. |
| `quotation_items` | `public.quotation_items` exists with product link, quantity, unit, unit price, total amount, dimensions, kg/m, `material_cost`, `machining_cost`, `finish_cost`, tolerance, drawing ref, notes. | Unsafe until reviewed | Internal cost fields are present. Do not expose item rows in the first quotation metadata resource. |
| `inquiries` | `public.inquiries` exists and `/api/admin-read/inquiries` plus `/api/admin-read/pre-quotation-review` are implemented. | Ready | Safe as a linking/source context for `inquiry_id`, title, and conservative readiness context. |
| `customers` | `public.customers` exists and `/api/admin-read/customers` is implemented. | Ready | Safe for display names/IDs when projected defensively. |
| `products` | `public.products` exists with product metadata and indexes. | Partial | Product reference metadata may be useful later, but product pricing must not become official quotation logic. |
| `companies` | `public.companies` exists and is linked from customers/inquiries/quotations. | Partial | Safe for display context only. Avoid treating company metadata as approval or billing authority. |

Readiness conclusion:

- `quotations` is ready enough for planning a metadata-only read resource.
- `quotation_items` should remain hidden in the first implementation.
- `inquiries` and `customers` are ready for safe linking context.
- `products` and `companies` can remain optional context and should not drive price calculation.

## Safe Quotation Metadata Projection

Proposed safe fields for a future metadata-only record:

| Field | Projection rule |
| --- | --- |
| `id` | Safe internal record identifier. |
| `quote_no` | Safe only if already stored. Do not generate it in the route. |
| `inquiry_id` | Safe linking metadata. |
| `customer_name` | Safe if derived from stored customer/company display fields. |
| `quote_status` | Safe if normalized as internal review status, not send-ready wording. |
| `currency` | Safe if already stored. Do not infer or calculate. |
| `total_amount` | Only expose if already stored and explicitly treated as unconfirmed internal metadata. Do not calculate in the route. |
| `created_at` | Safe timestamp metadata. |
| `updated_at` | Safe timestamp metadata. |
| `human_review_required` | Always true unless a future approved workflow proves otherwise. |
| `safety_status` | Conservative display label such as `metadata_only`, `human_review_required`, or `not_send_ready`. |

Do not expose:

- supplier cost
- internal cost
- margin
- profit
- bank/payment data
- quotation item internal costing
- raw calculation formulas
- auto-generated price
- send-ready status
- PI-ready status
- order-confirmed status
- internal weight uplift rules
- exchange-rate details

## Quotation Item Safety Policy

`quotation_items` should not be exposed in the early Admin-read quotation metadata resource unless a separate safety review approves a carefully projected item view.

Potentially safer item fields for a later phase:

- item/product name
- display specification
- quantity
- unit
- drawing reference label
- non-price technical summary

Fields that must remain hidden by default:

- `unit_price`
- `total_amount`
- `material_cost`
- `machining_cost`
- `finish_cost`
- supplier cost
- margin/profit
- exchange-rate details
- internal uplift or wastage notes
- raw pricing formulas

Line totals should be deferred unless already stored and specifically approved as safe for internal read-only display.

## Proposed Response Shape

Future route option:

```text
GET /api/admin-read/quotations
```

Alternative route option:

```text
GET /api/admin-read/quotation-summary
```

Conservative first version should use the standard Admin-read envelope:

```json
{
  "meta": {
    "generated_at": "...",
    "source": "admin_read",
    "resource": "quotations",
    "is_fallback": false
  },
  "records": [],
  "summary": {},
  "safety": {
    "human_review_required": true,
    "disabled_actions": [
      "calculate_price",
      "generate_quote",
      "send_quote",
      "generate_pi",
      "confirm_order"
    ]
  },
  "warnings": []
}
```

Suggested `summary` fields:

- `total_records`
- `human_review_required_records`
- `draft_or_unconfirmed_records`
- `limited_projection_records`

Do not include executable action URLs, callbacks, approval tokens, helper references, or generated document links.

## Warnings And Fallback Plan

Recommended warning codes:

- `quotations_source_unavailable`
- `quotation_projection_limited`
- `quotation_items_hidden_for_safety`
- `unsafe_cost_fields_not_exposed`
- `quotation_totals_unconfirmed`

Fallback behavior:

- If the source is unavailable, return a stable JSON envelope with empty `records`, conservative `safety`, and warnings.
- Do not fall back to generated price examples that look real.
- If UI fallback is needed, label it as static preview and not live quotation data.
- Never expose `quotation_items` as fallback just to fill the UI.

## UI Migration Plan

Future UI should:

- show quotation metadata only
- clearly separate `报价前复核` from `正式报价`
- show a source/status label such as `只读报价元数据`
- keep final quotation generation disabled
- keep price calculation disabled
- keep quote sending disabled
- keep PI generation disabled
- avoid any button, link, input, or control that suggests execution

Future UI should not:

- display "ready to send" wording
- imply an official quotation has been approved
- imply price, delivery time, payment terms, supplier feasibility, PI, order, production, or shipment has been confirmed
- expose raw quote item costing

## Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Exposing cost or margin | High | Hide `quotation_items` initially and omit cost/profit fields. |
| Implying quote is ready to send | High | Use metadata-only and human-review wording. Keep send disabled. |
| Displaying calculated amounts without approval | High | Do not calculate in route. Display stored totals only if labelled unconfirmed/internal. |
| Confusing pre-quotation readiness with final quotation | Medium | Keep `报价前复核` and `正式报价` labels separate. |
| Fallback demo data mistaken for real quotation | Medium | Clear static preview/fallback labels and conservative warnings. |
| Payment terms treated as approved terms | High | Omit `payment_terms` from first projection. |

## Recommended Implementation Order

1. Implement `GET /api/admin-read/quotations` as metadata-only inside the existing Admin Read Dispatcher.
2. Keep `quotation_items` hidden initially.
3. Add UI display as a read-only quotation metadata list.
4. Run production smoke verification.
5. Create a release checkpoint.

## Non-goals

- No write actions.
- No price engine.
- No price calculation.
- No official quotation generation.
- No quotation sending.
- No PI generation.
- No order confirmation.
- No payment, production, or shipment execution.
- No schema migration in this planning task.

## Recommended Next Tasks

1. `CBM-CODEX-SPRINT-API-READONLY-011` - Extend Admin Read Dispatcher For Quotation Metadata
2. `CBM-CODEX-SPRINT-DATA-015` - Migrate Quotation Metadata UI To Admin Read
3. `CBM-CODEX-RELEASE-028` - Deploy Quotation Metadata Admin-read
4. `CBM-CODEX-SPRINT-TRIAL-002` - Paul Manual Trial Feedback Incorporation
5. `CBM-CODEX-RELEASE-013` - Authenticated Admin API Smoke Test Execution if safe token exists

## Progress Report

- Full product vision: 35% -> 35%
- Internal MVP / foundation: 91% -> 91%
- Quotation Metadata Safe Projection Planning: 0% -> 100%
- Overall: [████░░░░░░] 35%
- Internal MVP: [█████████░] 91%
- Current module: [██████████] 100%
