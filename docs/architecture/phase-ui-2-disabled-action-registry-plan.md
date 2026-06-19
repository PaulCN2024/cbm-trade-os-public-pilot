# Phase UI-2 Disabled Action Registry Plan

## Purpose

Define the future Disabled Action Registry for CBM Trade OS.

The registry is a central catalog of all possible current and future Admin UI actions. Every write action, external action, commercial commitment, financial action, production action, shipment action, and system administration action must be disabled by default until a separately approved approval architecture exists.

This is a planning document only. It does not implement registry code, UI wiring, API routes, schema migrations, write actions, approval execution, deployment, external integrations, or business execution.

## Current Read-only Baseline

The current Admin UI production baseline is read-only or static-preview only.

Current production read-only/admin-read modules:

| Admin UI surface | Current read path |
| --- | --- |
| 工作台 | `/api/admin-read/dashboard-summary` |
| 客户中心 | `/api/admin-read/customers` |
| 询盘中心 | `/api/admin-read/inquiries` |
| AI 复核中心 | `/api/admin-read/ai-review` |
| 供应商中心 | `/api/admin-read/supplier-capabilities` |
| 制造能力中心 | `/api/admin-read/supplier-capabilities` |
| 文件中心 | `/api/admin-read/documents` |
| 报价前复核 | `/api/admin-read/pre-quotation-review` |

Current production safety baseline:

- Admin UI disabled action remediation is deployed.
- Global Filter is disabled and labelled `筛选 - 稍后开放`.
- Shell controls are disabled or mock-only:
  - `导出视图 - 未连接`
  - `新增 - 稍后开放`
  - `创建草稿 - 仅模拟`
- `renderFormCard()` sample controls are read-only, disabled, and mock-only.
- Preview regions have no active write/business controls.
- Protected admin-read APIs remain auth-gated.
- No send, approve, reject, RFQ, quotation, PI, order, payment, production, shipment, or after-sales commitment execution is enabled.

## Registry Record Shape

A future registry object or table should include these fields:

| Field | Purpose |
| --- | --- |
| `action_key` | Stable internal key. Must remain English and unique. |
| `action_label_cn` | Chinese operator-facing action label. |
| `action_label_en` | English internal/reference label. |
| `module` | Owning business module or Admin UI surface. |
| `action_category` | Category from the approved category model. |
| `current_status` | Current disabled/read-only/draft-only status. No current enabled value is allowed. |
| `disabled_reason` | Human-readable reason shown in UI tooltip/copy. |
| `risk_level` | Conservative risk level. |
| `business_object_type` | Main object affected by the action. |
| `required_phase` | Minimum future phase required before implementation. |
| `required_role` | Human role required for approval or execution. |
| `required_approval_gate` | Approval gate required before execution. |
| `required_audit_log` | Whether audit logging is mandatory. |
| `future_endpoint` | Planned future endpoint namespace, if any. |
| `idempotency_required` | Whether repeated execution must be protected by idempotency. |
| `payload_preview_required` | Whether the exact payload must be previewed before approval. |
| `irreversible_effect` | Whether the action may be difficult to undo. |
| `external_effect` | Whether the action affects a customer, supplier, bank, logistics party, or external system. |
| `enabled_by_default` | Must be `false` for all current and planned actions until separately approved. |
| `notes` | Safety notes, implementation constraints, or user-facing wording guidance. |

Example future registry object shape:

```js
{
  action_key: "send_quote",
  action_label_cn: "发送报价",
  action_label_en: "Send quotation",
  module: "pre_quotation",
  action_category: "commercial_commitment",
  current_status: "prohibited_current_phase",
  disabled_reason: "报价发送需要审批流程、审计记录和人工确认。",
  risk_level: "high",
  business_object_type: "quotation",
  required_phase: "R7",
  required_role: "sales_manager",
  required_approval_gate: "quote_send_approval",
  required_audit_log: true,
  future_endpoint: "/api/admin-actions/send-quote",
  idempotency_required: true,
  payload_preview_required: true,
  irreversible_effect: true,
  external_effect: true,
  enabled_by_default: false,
  notes: "Must never be inferred from a visible button alone."
}
```

## Current Status Model

Allowed `current_status` values for the current planning phase:

| Status | Meaning |
| --- | --- |
| `disabled` | Action is visible only as a disabled capability or planning item. |
| `mock_only` | Action may appear only as a non-executable mock label in static/internal preview. |
| `draft_only` | Action may create or display a draft in a future phase, with no external effect. |
| `read_only` | Action is display/read-only only. |
| `approval_required_future` | Action may be possible only after future approval workflow, schema, role, and audit work. |
| `prohibited_current_phase` | Action must not be implemented or exposed as executable in Phase UI-2. |
| `deprecated` | Action should not be used and should be removed or replaced by a safer action. |

There is no `enabled` status in the current phase.

A future enabled status would require:

- separate approval architecture
- explicit implementation task
- schema review
- API enforcement
- role gating
- audit logging
- idempotency protection
- production smoke plan
- human approval before activation

## Action Categories

| Category | Meaning | Example |
| --- | --- | --- |
| `read_only_view` | Display existing or fallback data without mutation. | View inquiry. |
| `draft_generation` | Create/display a draft without external effect. | Draft customer reply. |
| `staged_message` | Prepare an outbound message for later review. | Stage WhatsApp follow-up. |
| `staged_document` | Prepare a document draft for later review. | Stage quotation PDF. |
| `external_send` | Send a message or document externally. | Send quote. |
| `internal_status_change` | Change internal business state. | Approve AI suggestion. |
| `commercial_commitment` | Commit price, delivery, PI, order, warranty, or liability. | Confirm order. |
| `financial_action` | Request, confirm, or affect payment. | Request payment. |
| `production_action` | Trigger or update production execution. | Start production. |
| `logistics_action` | Arrange or confirm shipment. | Confirm shipment. |
| `after_sales_commitment` | Close cases or offer compensation/liability judgment. | Offer compensation. |
| `system_admin_action` | Change system settings, roles, or sensitive configuration. | Manage user roles. |

## Risk Levels

| Risk level | Meaning | Examples |
| --- | --- | --- |
| `low` | Read-only view or harmless local display. | View inquiry, view customer, view dashboard summary. |
| `medium` | Drafting or internal preparation that still needs review. | Draft reply, draft supplier RFQ, parse file metadata. |
| `high` | External send, commercial document, supplier selection, or customer-facing commitment. | Send quote, generate PI, approve quote. |
| `critical` | Financial, order, production, shipment, role, or irreversible business action. | Confirm order, request payment, start production, manage user roles. |

Risk examples:

- `view_inquiry` = `low`
- `draft_customer_reply` = `medium`
- `send_quote` = `high`
- `confirm_order` = `critical`
- `request_payment` = `critical`
- `start_production` = `critical`

## Initial Disabled Action Catalog

This initial catalog is planning-only. It is not an implementation source and must not be imported into UI or API code until a future approved registry implementation task.

| action_key | Module | Category | current_status | risk_level | disabled_reason | required_future_gate |
| --- | --- | --- | --- | --- | --- | --- |
| `view_dashboard_summary` | Workbench | `read_only_view` | `read_only` | `low` | Dashboard summary is read-only and may use admin-read data or fallback preview. | Existing auth-gated admin-read access. |
| `export_dashboard_view` | Workbench | `system_admin_action` | `disabled` | `medium` | Export is not connected and may expose internal data. | Export scope approval, role gate, audit log. |
| `view_inquiry` | Inquiry | `read_only_view` | `read_only` | `low` | Inquiry details are display-only. | Existing auth-gated admin-read access. |
| `draft_customer_reply` | Inquiry | `draft_generation` | `draft_only` | `medium` | Drafts must not be sent or treated as approval. | Draft-only helper plus human review gate. |
| `send_customer_reply` | Inquiry | `external_send` | `prohibited_current_phase` | `high` | Customer message sending is not enabled. | Approved message payload, role gate, audit log, idempotency key. |
| `create_follow_up_task` | Inquiry | `internal_status_change` | `approval_required_future` | `medium` | Task creation is not implemented in current read-only UI. | Task schema, approval rule, audit log. |
| `view_customer` | Customer | `read_only_view` | `read_only` | `low` | Customer profile display is read-only. | Existing auth-gated admin-read access. |
| `edit_customer` | Customer | `internal_status_change` | `prohibited_current_phase` | `high` | Customer edits can change business records. | Customer edit schema, role gate, audit log. |
| `create_customer` | Customer | `internal_status_change` | `prohibited_current_phase` | `high` | Customer creation can affect CRM records and dedupe. | Dedupe review, role gate, audit log. |
| `export_customer_list` | Customer | `system_admin_action` | `disabled` | `medium` | Export may expose customer data. | Export approval, data scope, audit log. |
| `view_ai_review` | AI Review | `read_only_view` | `read_only` | `low` | AI review summaries are display-only. | Existing auth-gated admin-read access. |
| `approve_ai_suggestion` | AI Review | `internal_status_change` | `approval_required_future` | `high` | Approval execution is not implemented. | Human approver identity, approval record, audit log. |
| `reject_ai_suggestion` | AI Review | `internal_status_change` | `approval_required_future` | `medium` | Rejection execution is not implemented. | Human reviewer identity, approval record, audit log. |
| `apply_ai_suggestion` | AI Review | `internal_status_change` | `prohibited_current_phase` | `high` | AI suggestions must not be applied automatically. | Payload preview, human approval, audit log. |
| `view_supplier_capability` | Supplier | `read_only_view` | `read_only` | `low` | Supplier capability display does not confirm feasibility. | Existing auth-gated admin-read access. |
| `draft_supplier_rfq` | Supplier | `draft_generation` | `draft_only` | `medium` | RFQ drafting must not send to supplier. | Draft-only review gate. |
| `send_supplier_rfq` | Supplier | `external_send` | `prohibited_current_phase` | `high` | Supplier RFQ sending is not enabled. | Approved RFQ payload, supplier target, role gate, audit log. |
| `confirm_supplier_selection` | Supplier | `commercial_commitment` | `prohibited_current_phase` | `critical` | Supplier selection may imply sourcing commitment. | Supplier review, manager approval, audit log. |
| `view_file_metadata` | File Center | `read_only_view` | `read_only` | `low` | File Center shows metadata only. | Existing auth-gated admin-read access. |
| `upload_file` | File Center | `system_admin_action` | `prohibited_current_phase` | `high` | Upload can introduce real customer/supplier files. | Storage plan, virus/OCR policy, role gate, audit log. |
| `download_file` | File Center | `system_admin_action` | `approval_required_future` | `medium` | Download may expose private customer files. | Access control, signed URL policy, audit log. |
| `delete_file` | File Center | `system_admin_action` | `prohibited_current_phase` | `critical` | File deletion can destroy customer records. | Retention policy, approval, audit log, recovery plan. |
| `parse_file` | File Center | `draft_generation` | `approval_required_future` | `medium` | Parsing can expose extracted sensitive content. | Safe extraction plan, redaction policy, audit log. |
| `run_ocr` | File Center | `draft_generation` | `approval_required_future` | `medium` | OCR can expose raw document content. | OCR provider review, privacy policy, audit log. |
| `view_pre_quotation_review` | Pre-Quotation | `read_only_view` | `read_only` | `low` | Pre-quotation review is display-only. | Existing auth-gated admin-read access. |
| `calculate_price` | Pre-Quotation | `commercial_commitment` | `prohibited_current_phase` | `high` | Price calculation can imply commercial terms. | Pricing rule review, hidden-field checks, approval gate. |
| `generate_quote` | Quotation | `staged_document` | `approval_required_future` | `high` | Quote generation requires approved pricing and customer-safe fields. | Quote draft schema, hidden-field audit, approval gate. |
| `approve_quote` | Quotation | `commercial_commitment` | `prohibited_current_phase` | `high` | Quote approval creates commercial authority. | Manager approval, audit log, payload checksum. |
| `send_quote` | Quotation | `external_send` | `prohibited_current_phase` | `high` | Sending quote is a customer-facing commercial action. | Approved quote payload, role gate, audit log, idempotency key. |
| `generate_pi` | Quotation/Order | `staged_document` | `approval_required_future` | `high` | PI generation requires approved terms and bank safety. | PI draft schema, hidden-field audit, approval gate. |
| `send_pi` | Quotation/Order | `external_send` | `prohibited_current_phase` | `high` | Sending PI is an official customer-facing action. | Approved PI payload, role gate, audit log, idempotency key. |
| `view_order` | Order | `read_only_view` | `read_only` | `low` | Order display is read-only. | Future admin-read order resource. |
| `confirm_order` | Order | `commercial_commitment` | `prohibited_current_phase` | `critical` | Order confirmation creates formal business commitment. | Customer terms approval, manager approval, audit log. |
| `request_payment` | Order/Finance | `financial_action` | `prohibited_current_phase` | `critical` | Payment requests affect customer obligations. | Finance approval, bank config check, audit log. |
| `view_production_status` | Production | `read_only_view` | `read_only` | `low` | Production display is read-only. | Future admin-read production resource. |
| `start_production` | Production | `production_action` | `prohibited_current_phase` | `critical` | Starting production commits factory work. | Approved order, production order, manager approval, audit log. |
| `update_production_status` | Production | `internal_status_change` | `approval_required_future` | `high` | Production status affects customer and factory expectations. | Production role gate, audit log. |
| `view_shipping_status` | Shipping | `read_only_view` | `read_only` | `low` | Shipping display is read-only. | Future admin-read shipping resource. |
| `arrange_shipment` | Shipping | `logistics_action` | `prohibited_current_phase` | `critical` | Shipment arrangement can create logistics commitment. | Shipping approval, document check, audit log. |
| `confirm_shipment` | Shipping | `logistics_action` | `prohibited_current_phase` | `critical` | Shipment confirmation affects customer and customs expectations. | Shipment record approval, audit log. |
| `view_after_sales` | After-sales | `read_only_view` | `read_only` | `low` | After-sales display is read-only. | Future admin-read after-sales resource. |
| `close_after_sales_case` | After-sales | `after_sales_commitment` | `approval_required_future` | `high` | Closing a case can imply responsibility judgment. | Owner approval, audit log. |
| `offer_compensation` | After-sales | `after_sales_commitment` | `prohibited_current_phase` | `critical` | Compensation is a financial/legal commitment. | Manager approval, finance review, audit log. |
| `view_settings` | Settings | `read_only_view` | `read_only` | `low` | Settings preview is read-only. | Existing static/admin view. |
| `update_system_settings` | Settings | `system_admin_action` | `prohibited_current_phase` | `critical` | Settings changes can affect production behavior. | Admin role, change request, audit log. |
| `manage_user_roles` | Settings | `system_admin_action` | `prohibited_current_phase` | `critical` | Role changes affect access and approval authority. | Admin approval, audit log, access review. |

## UI Integration Plan

Future UI should:

- read the registry or a static registry module only after a separately approved implementation task
- render disabled labels consistently from registry metadata
- show `title` or tooltip text from `disabled_reason`
- never infer action availability from button presence
- never enable a button only because the UI has a handler
- hide prohibited actions when showing them would create operator confusion
- disable future approval-required actions with `Requires approval workflow` or Chinese equivalent
- keep internal trial preview regions action-free
- keep disabled capability chips informational and non-clickable
- preserve Chinese operator-facing labels while keeping internal keys English
- avoid wording that implies confirmed price, delivery time, payment, production feasibility, supplier commitment, quotation, PI, order, shipment, compensation, or liability

Recommended UI labels:

- `只读`
- `稍后开放`
- `需要审批流程`
- `不可发送`
- `不可审批`
- `不可报价`
- `不可生成 PI`
- `不可确认订单`
- `不可触发付款`
- `不可下达生产`
- `不可安排发货`

## API Enforcement Plan

Future API should:

- check `action_key` against the registry before executing anything
- reject unregistered action keys
- reject disabled action keys
- reject `mock_only`, `read_only`, and `prohibited_current_phase` action keys
- require authentication for all action attempts
- require role validation for all non-read actions
- require an approval record before any business execution
- require idempotency keys for external, financial, production, logistics, and irreversible actions
- require audit logging for all non-read actions
- require payload preview/version match between approved payload and execution payload
- never execute based only on client UI state
- never trust frontend disabled state as enforcement
- return stable JSON errors for blocked, missing approval, stale approval, permission denied, idempotency conflict, and validation failure cases

Recommended future namespace separation:

| Namespace | Purpose | Current status |
| --- | --- | --- |
| `/api/admin-read/...` | Read-only Admin UI data. | Existing GET-only baseline. |
| `/api/admin-drafts/...` | Future draft-only records with no external effect. | Not implemented. |
| `/api/admin-approvals/...` | Future approval records and review workflow. | Not implemented. |
| `/api/admin-actions/...` | Future execution queue entry points. | Not implemented and prohibited in current phase. |

## Audit Integration Plan

Every future action must create or link these records before execution:

- `proposed_action` record
- approval record
- execution attempt record
- audit log record

Execution must not happen before approval.

Minimum future audit fields:

- `action_key`
- `source_module`
- `business_object_type`
- `business_object_id`
- `proposed_by`
- `proposed_at`
- `payload_preview`
- `payload_version` or checksum
- `risk_level`
- `required_role`
- `approval_status`
- `approved_by`
- `approved_at`
- `execution_status`
- `execution_attempted_at`
- `execution_result`
- `idempotency_key`
- `audit_log_id`

Audit logs must not expose:

- tokens
- passwords
- service keys
- private storage paths
- signed URLs
- raw file content
- hidden customer-facing document fields
- internal cost, profit, exchange-rate detail, RMB internal purchase cost, or other protected commercial internals

## Implementation Phases

| Phase | Scope | Boundary |
| --- | --- | --- |
| R1 | Documentation-only registry plan. | No code, schema, API, UI, or deployment changes. |
| R2 | Static disabled action registry module. | Metadata only, no execution, no UI wiring unless separately approved. |
| R3 | UI reads registry for disabled labels/tooltips. | Display-only, no execution, no active business controls. |
| R4 | Schema plan for `proposed_actions`, approvals, and `action_audit_logs`. | Planning only before migrations. |
| R5 | Draft-only actions. | No external effects; all drafts marked draft-only. |
| R6 | Approval workflow UI. | Human review/approval records only; no execution. |
| R7 | Execution queue behind approvals, idempotency, and audit logging. | Future high-risk phase requiring separate approval and production verification. |

## Non-goals

This plan does not:

- add write actions now
- add send actions now
- add approval execution now
- add quotation generation now
- add price calculation now
- add PI, contract, order, payment, production, or shipment execution now
- add schema migration now
- add UI controls now
- add API routes now
- add production deployment now
- add OpenAI, Gmail, WhatsApp, payment, shipping, supplier, or factory integration now

## Recommended Next Tasks

1. CBM-CODEX-SPRINT-SCHEMA-PLAN-001 - Approval Audit Schema Plan
2. CBM-CODEX-SPRINT-UI-SAFETY-005 - Static Disabled Action Registry Module Plan
3. CBM-CODEX-SPRINT-DOCS-003 - Internal Trial Operator Guide Update
4. CBM-CODEX-RELEASE-013 - Authenticated Admin API Smoke Test Execution if safe token exists
5. CBM-CODEX-SPRINT-API-PLAN-003 - Quotation Metadata Admin-read Safe Projection Plan

## Progress Report

- Full product vision: 35% -> 35%
- Internal MVP / foundation: 85% -> 85%
- Disabled Action Registry Planning: 0% -> 100%
- Overall: [████░░░░░░] 35%
- Internal MVP: [█████████░] 85%
- Current module: [██████████] 100%
