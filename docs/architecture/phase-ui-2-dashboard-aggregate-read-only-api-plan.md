# Phase UI-2 Dashboard Aggregate Read-only API Plan

## Purpose

Plan a future read-only dashboard aggregate endpoint for the Admin UI 工作台.

This plan defines the safest first backend shape for turning the current static Workbench into a live read-only dashboard without adding write actions, AI execution, external integrations, approval execution, or business commitments.

## Why This Endpoint Is Needed

The 工作台 should answer a simple operator question:

> What needs my attention today?

The current Workbench is static and useful for validating layout, Chinese wording, and safety boundaries. The next step should be a backend aggregate endpoint because:

- The 工作台 should not manually duplicate aggregation logic in browser code.
- Operators need summarized counts and queues across inquiry, customer, AI review, supplier/capability, and pre-quotation workflows.
- Aggregation should be centralized so fallback behavior and safety flags remain consistent.
- The endpoint should support UI-2 read-only display only.
- It must not perform business actions or create official business meaning.

## Proposed Endpoint

Recommended endpoint:

```text
GET /api/admin-dashboard-summary
```

Naming choice:

- `admin` makes the route clearly internal operator-facing.
- `dashboard-summary` describes a read-only aggregate payload, not a workflow executor.
- The name avoids confusing this with public website dashboards or customer-facing data.
- It matches the existing Admin UI direction without implying write, approval, or AI execution.

Alternative considered:

```text
GET /api/dashboard-summary
```

This is shorter, but less explicit about admin-only usage. For CBM Trade OS, the safer first route name is `/api/admin-dashboard-summary`.

## Strict Read-only Boundary

The future endpoint must be:

- GET only.
- Read-only.
- Non-mutating.
- Safe to call repeatedly from the Admin UI.

It must not:

- accept POST, PUT, PATCH, or DELETE
- write database rows
- mutate records
- send messages
- approve or reject anything
- create RFQs
- generate quotations
- calculate official prices
- generate PI, contract, order, payment, production, or shipment records
- execute AI generation
- call OpenAI or any AI provider
- call Gmail, WhatsApp, or external channels
- upload, parse, delete, archive, or promote files

All high-risk commercial actions remain human-reviewed and separately approved.

## Proposed Response Shape

The payload should be stable, frontend-friendly, and defensive.

```json
{
  "meta": {
    "generated_at": "2026-06-19T00:00:00.000Z",
    "source": "supabase",
    "is_fallback": false,
    "version": "ui2-dashboard-summary-v1"
  },
  "summary_cards": {
    "new_inquiries": {
      "label": "新询盘",
      "value": 0,
      "subtitle": "今日新增待查看询盘",
      "tone": "info"
    },
    "needs_review": {
      "label": "需要人工复核",
      "value": 0,
      "subtitle": "询盘、AI 草稿或沟通需要复核",
      "tone": "warning"
    },
    "missing_information": {
      "label": "缺失信息",
      "value": 0,
      "subtitle": "图纸、规格、数量或交期信息缺失",
      "tone": "warning"
    },
    "followups_due": {
      "label": "今日跟进",
      "value": 0,
      "subtitle": "需要联系客户或供应商",
      "tone": "info"
    },
    "high_risk": {
      "label": "高风险提醒",
      "value": 0,
      "subtitle": "涉及价格、付款、交期或质量责任",
      "tone": "risk"
    },
    "ai_drafts_pending": {
      "label": "AI 草稿待审",
      "value": 0,
      "subtitle": "仅草稿，发送前必须人工确认",
      "tone": "approval"
    }
  },
  "workflow_queues": {
    "inquiry_queue": [],
    "customer_queue": [],
    "ai_review_queue": [],
    "supplier_capability_queue": [],
    "pre_quotation_queue": []
  },
  "safety": {
    "disabled_actions": [
      "send",
      "approve",
      "reject",
      "create_rfq",
      "generate_quotation",
      "generate_pi",
      "create_order",
      "confirm_payment",
      "trigger_production",
      "trigger_shipment"
    ],
    "human_review_required": true,
    "read_only": true
  },
  "warnings": {
    "stale_data": [],
    "missing_sources": []
  }
}
```

Queue item shape should stay simple:

```json
{
  "id": "source-record-id",
  "source": "inquiries",
  "title": "Inquiry title",
  "category": "询盘",
  "status": "NEED_REVIEW",
  "risk_level": "medium",
  "badges": ["缺失信息", "需要复核"],
  "recommended_action": "补齐关键信息后再继续报价判断",
  "disabled_capabilities": ["不可发送", "不可报价", "不可生成 PI"],
  "technical_reference": {
    "record_type": "inquiry",
    "record_id": "source-record-id"
  }
}
```

The response should not include executable action fields, callback URLs, helper references, approval tokens, payment credentials, bank details, or private file contents.

## Source Data Candidates

| Source | Candidate tables / API paths | Current use | Dashboard use |
| --- | --- | --- | --- |
| Inquiries | `inquiries`, `/api/inquiries` | Inquiry Center and pre-quotation derived display | New inquiries, missing information, high-risk inquiry queue |
| Customers | `customers`, `/api/customers` | Customer Center | Follow-up/customer queue and customer status counts |
| AI review | `ai_inquiry_analyses`, `/api/ai-inquiry-analyses` attempted | AI Review Center | AI drafts pending review and high-risk AI review items |
| Manufacturing capabilities | `manufacturing_capabilities`, `/api/manufacturing-capabilities` attempted | Supplier and capability sections | Supplier/capability queue and feasibility review warnings |
| Follow-ups | `follow_up_tasks`, `/api/follow-ups` | API exists but not wired to dashboard | Follow-ups due today |
| Companies | `companies`, `/api/companies` attempted | Company section | Optional customer/company context |
| Products | `products`, `/api/products` attempted | Product section | Optional product/category context |
| Future quotations | `quotations`, `quotation_items` | Tables exist, no route found | Pre-quotation and quotation status after read-only API planning |
| Future documents/files | `attachments`, `documents` | Tables exist, no dedicated metadata route found | Missing file/drawing/document warnings after file metadata API planning |

## Current Schema/Table Readiness

| Data source | Status | Notes |
| --- | --- | --- |
| `inquiries` | ready | Existing GET route returns inquiry data and related lead/task/attachment context. Route also contains POST/PATCH, so dashboard implementation must use read-only access only. |
| `customers` | ready | Existing GET route returns customer records. |
| `follow_up_tasks` | ready | Existing GET route exists through `/api/follow-ups`; not yet wired into dashboard. |
| `ai_inquiry_analyses` | partial | Table exists and Admin UI attempts `/api/ai-inquiry-analyses`, but no direct route file was found. |
| `manufacturing_capabilities` | partial | Table exists and Admin UI attempts `/api/manufacturing-capabilities`, but no direct route file was found. |
| `companies` | partial | Table exists and Admin UI attempts `/api/companies`, but no direct route file was found. |
| `products` | partial | Table exists and Admin UI attempts `/api/products`, but no direct route file was found. |
| `attachments` | partial | Table exists and inquiry GET returns attachments, but there is no dedicated file metadata endpoint. |
| `documents` | partial | Table exists, but no dedicated document metadata endpoint was found. |
| `quotations` | partial | Tables exist, but no `/api/quotations` route was found. |
| `orders` | missing | No table/API found in current migration audit. |
| `production` | missing | No table/API found in current migration audit. |
| `shipping` / `shipments` | missing | No table/API found in current migration audit. |
| `after-sales` | missing | No table/API found in current migration audit. |
| `settings` / `config` | unclear | No dedicated endpoint/table found for Admin settings/config. |

## Aggregation Logic

The future endpoint should only summarize existing data.

Allowed high-level read-only logic:

- Count records.
- Count today's or recent records using existing timestamps.
- Classify missing information only from existing fields such as `missing_info`, `missing_information`, or known metadata fields.
- Mark high-risk only from existing risk/status fields or conservative keyword flags already present in records.
- Build queue items from existing records.
- Use defensive defaults for missing fields.
- Preserve stable empty arrays and numeric zero values.

Forbidden aggregation logic:

- Do not infer official price readiness.
- Do not infer production feasibility.
- Do not infer delivery commitment.
- Do not infer payment status unless a future approved read-only payment model exists.
- Do not calculate quotations or prices.
- Do not generate quotation/PI/order records.
- Do not call AI providers.
- Do not create tasks.
- Do not update status fields.
- Do not send messages.

The endpoint should prefer conservative wording such as `needs_review`, `missing_information`, and `high_risk` over business-commitment labels such as `ready_to_quote`, `ready_to_ship`, or `payment_confirmed`.

## Frontend Wiring Plan

A later UI task should wire the 工作台 like this:

1. Call `GET /api/admin-dashboard-summary`.
2. If successful, render live read-only dashboard summary.
3. If empty, render a safe empty live state.
4. If unavailable or error, keep the current static Workbench fallback.
5. Preserve existing disabled capabilities and safety copy.
6. Do not add buttons, links, inputs, send controls, approval controls, or quote/order/payment controls.

State labels should be:

- `实时只读数据`
- `静态预览 fallback`
- `API 暂不可用，显示静态预览`

The current static Workbench should remain the fallback for local static preview and API failures.

## Fallback Behavior

Static fallback must remain.

The frontend must:

- keep rendering if the endpoint returns 404, 401, 500, malformed JSON, or empty arrays
- avoid `undefined` and `null` in visible UI
- show compact status copy instead of blocking the page
- keep all queue items informational only
- keep disabled capability chips non-clickable

## Error Behavior

Recommended failure behavior:

- Non-blocking frontend failure.
- No page crash.
- No hidden retry loops.
- No mutation fallback.
- No local storage writes required.
- Preserve current static Workbench fallback.
- Show compact status label:
  - `API 暂不可用，显示静态预览`

Recommended backend behavior:

- Return a stable JSON shape even when a source table is empty.
- Include source-specific missing-source warnings when a read fails but the endpoint can still respond safely.
- Do not include stack traces, secrets, env values, service keys, or private connection details.

## Security And Safety

The future endpoint must not expose:

- secrets
- service role keys
- environment variables
- payment credentials
- bank information
- customer private file contents
- raw uploaded documents
- internal cost, profit, exchange rate, uplift, wastage, or factory-only remarks
- approval tokens
- executable action URLs

The response should include only the fields needed for a read-only Admin UI summary.

Customer-facing document rules still apply: hidden internal commercial fields must not leak into dashboard summaries.

## Testing Plan For Future Implementation

Recommended tests for a future implementation:

- `GET /api/admin-dashboard-summary` returns `200`.
- Non-GET methods are rejected with `405` and `Allow: GET`.
- Empty data returns a stable summary with zero counts and empty arrays.
- Missing optional sources do not crash the endpoint.
- Response includes `meta`, `summary_cards`, `workflow_queues`, `safety`, and `warnings`.
- `safety.read_only` is `true`.
- `safety.human_review_required` is `true`.
- Disabled actions include send, approve, reject, quotation, PI, order, payment, production, and shipment actions.
- Response does not include secrets, env values, bank info, internal cost, or executable action fields.
- Endpoint does not call POST/PATCH/PUT/DELETE queries.
- Admin UI fallback still works when the endpoint is unavailable.

## Risks

- Accidentally mixing dashboard summary with existing read/write routes.
- Over-aggregating business meaning and implying records are ready for quotation, order, production, or shipment.
- Duplicating complex aggregation logic in the frontend instead of keeping a stable backend summary.
- Leaking sensitive customer, financial, bank, or internal cost fields.
- Creating hidden writes through status normalization, task creation, or audit logging.
- Treating `auto_allowed` or low-risk labels as permission to send, approve, quote, or commit.
- Making static fallback disappear too early.

## Recommended Future Implementation Task

Title:

```text
CBM-CODEX-SPRINT-API-READONLY-002 - Implement Dashboard Aggregate GET-only API
```

Scope:

- Implement `GET /api/admin-dashboard-summary`.
- Keep route GET-only.
- Use existing tables only.
- No schema changes unless explicitly approved.
- Return defensive aggregate shape.
- Add focused tests if the existing project test pattern supports API handler testing.
- Do not wire Admin UI yet unless separately tasked.
- Do not add write actions, AI execution, external integration, quotation generation, PI/order/payment/production/shipment execution, or file operations.

## Recommended Next 5 Tasks

1. `CBM-CODEX-SPRINT-API-READONLY-002` - Implement Dashboard Aggregate GET-only API
2. `CBM-CODEX-SPRINT-DATA-007` - Dashboard Workbench Read-only Aggregate Wiring
3. `CBM-CODEX-SPRINT-API-PLAN-002` - File Metadata Read-only API Plan
4. `CBM-CODEX-SPRINT-API-PLAN-003` - Quotation Read-only API Plan
5. `CBM-CODEX-SPRINT-SAFETY-001` - Disabled Action And Approval Boundary Audit
