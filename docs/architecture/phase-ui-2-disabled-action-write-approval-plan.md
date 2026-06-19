# Phase UI-2 Disabled Action And Write Approval Architecture Plan

## Purpose

Define how future CBM Trade OS write and business actions must be blocked, staged, approved, logged, and executed only after explicit human approval.

This is a planning document only. It does not implement write actions, approval execution, API routes, schema migrations, UI controls, external channel integrations, or production deployment.

## Current Read-only Baseline

The current Admin UI production baseline is read-only for operator action surfaces.

Current read-only or static Admin UI areas include:

- 工作台
- 询盘
- 客户
- AI 复核
- 供应商
- 制造能力
- 文件中心
- 报价前复核

Current admin-read coverage includes:

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

The current baseline must continue to preserve:

- no automatic customer email or WhatsApp sending
- no supplier RFQ sending
- no quotation generation or sending
- no PI, contract, order, payment, production, or shipment execution
- no approval or rejection execution
- no hidden business action on page load
- static fallback for unavailable or unauthenticated read APIs
- human review for every business-risk action

## Action Category Model

| Level | Category | Meaning | Examples | Current phase policy |
| --- | --- | --- | --- | --- |
| A | Read-only | Display data or static/fallback preview only. | View customer, view inquiry, view file metadata, view AI review, view supplier capability, view pre-quotation review. | Allowed. Must use GET/read-only data paths and must not mutate state. |
| B | Draft-only | Generate or display a draft that has no external or official effect. | Draft customer reply, draft supplier RFQ, draft quotation summary, draft PI data, draft internal task. | Planning-safe only when explicitly approved; draft must be marked draft-only and cannot be sent or executed. |
| C | Staged action | Prepare a payload for future human review without executing it. | Prepare email, prepare WhatsApp message, prepare supplier RFQ, prepare quote PDF, prepare PI document. | Future phase only. Must create a reviewable staged record, not an external action. |
| D | Approval-required action | Any action that creates external, official, financial, legal, production, shipment, or irreversible business effects. | Send email, send WhatsApp, send RFQ, send quotation, send PI, approve quote, reject quote, confirm order, request payment, start production, arrange shipment. | Blocked until approval architecture, schema, UI confirmation, audit, and execution queue are implemented and reviewed. |
| E | Prohibited for current phase | Automation that bypasses human review or makes commercial commitments. | Automatic customer send, automatic supplier commitment, automatic price approval, automatic order confirmation, automatic payment request, automatic production start, automatic shipment arrangement. | Prohibited. Must not be implemented in Phase UI-2. |

## Approval Gate Requirements

Every future write or business action must pass through an approval gate before execution.

Required gate fields:

| Field | Requirement |
| --- | --- |
| `action_id` | Stable unique action identifier. |
| `action_type` | Explicit action key such as `send_customer_reply` or `generate_quote`. |
| `source_module` | Originating module, for example `inquiries`, `ai_review`, `pre_quotation`, or `orders`. |
| `business_object_type` | Business object type, for example `customer`, `inquiry`, `quotation`, `pi`, `order`, `shipment`. |
| `business_object_id` | Stable reference to the target business object. |
| `proposed_by` | User or system actor that proposed the action. |
| `proposed_at` | Timestamp when action was proposed. |
| `proposed_payload_preview` | Sanitized preview of exactly what would be sent, generated, confirmed, or changed. |
| `risk_level` | Conservative risk label such as `low`, `medium`, `high`, or `blocked`. |
| `required_approver_role` | Role required to approve the action. |
| `approval_status` | `draft`, `staged_for_review`, `human_review_required`, `approved`, `rejected`, or `cancelled`. |
| `approved_by` | Human approver. Empty until approval. |
| `approved_at` | Approval timestamp. Empty until approval. |
| `execution_status` | `not_started`, `queued`, `attempted`, `succeeded`, `failed`, `cancelled`, or `blocked`. |
| `execution_result` | Result summary after execution attempt. Must never contain secrets. |
| `audit_log_id` | Link to the immutable audit log record. |

Rules:

- Execution must never happen before `approval_status = approved`.
- Approval must be performed by a human user with the required role.
- A generated draft, AI suggestion, model output, or raw user prompt must not count as approval.
- Approval and execution should be separate steps.
- Rejected or cancelled actions must not be executable.
- Approval records must be immutable enough for audit, or must preserve versioned history.

## Action Lifecycle

Future write/business actions should follow this lifecycle:

```text
read_only_view
-> draft_created
-> staged_for_review
-> human_review_required
-> approved or rejected
-> execution_queued
-> execution_attempted
-> execution_succeeded or execution_failed
-> audit_logged
```

Lifecycle constraints:

- `read_only_view` may happen in the current system.
- `draft_created` must not send, approve, quote, order, collect payment, produce, or ship.
- `staged_for_review` must show payload preview, target, risk, and disabled execution state.
- `human_review_required` must block execution until approval.
- `approved` must be explicit and tied to a human identity.
- `execution_queued` must require an approved action record and idempotency key.
- `execution_attempted` must write an audit record.
- `execution_succeeded` and `execution_failed` must both be logged.
- Execution must never happen before approved.

## UI Safety Rules

Current read-only sections may show disabled buttons or disabled capability chips only.

UI rules for current and future phases:

- Read-only sections may display disabled controls only when their disabled state is visually clear.
- Disabled buttons must explain "Coming later", "Requires approval workflow", or equivalent Chinese operator-facing copy.
- Disabled capability chips must remain informational and non-clickable.
- No active forms for send, approval, quotation, PI, order, payment, production, shipment, or after-sales commitments are allowed in the read-only phase.
- Any future active action button must show a confirmation modal.
- Any future confirmation modal must show:
  - payload preview
  - target recipient, supplier, customer, or business object
  - risk level
  - irreversible effects
  - required approver role
  - audit logging notice
  - explicit disabled/blocked alternatives when approval is missing
- Any future send/approve/reject/quote/PI/order/payment/production/shipment button must require explicit human action.
- No hidden auto-send on page load.
- No business action triggered by opening a page.
- No business action triggered by loading fallback data.
- No business action triggered by selecting a row.
- No raw AI suggestion may be converted into an executable action without a visible review step.
- Chinese UI copy must not imply confirmed price, delivery time, payment, production feasibility, supplier commitment, quotation, PI, order, shipment, warranty, compensation, or liability unless a future approved workflow explicitly supports that state.

Recommended Chinese disabled-state labels:

- `只读`
- `需要审批流程`
- `稍后开放`
- `不可发送`
- `不可报价`
- `不可生成 PI`
- `不可确认订单`
- `不可触发付款`
- `不可下达生产`
- `不可安排发货`

## API Safety Rules

GET endpoints must remain read-only.

API rules:

- `GET` endpoints must perform no mutations.
- `POST`, `PUT`, `PATCH`, and `DELETE` endpoints must require authentication.
- Business action endpoints must require an explicit approval token or approved approval record.
- No business action endpoint can be callable from public/static UI without authentication and approval validation.
- Business action endpoints must not trust raw frontend labels or disabled state as authority.
- Business action endpoints must validate:
  - user identity
  - role
  - action type
  - source module
  - business object type
  - business object ownership or tenant boundary
  - approval status
  - idempotency key
  - risk status
  - payload checksum or reviewed payload version when relevant
- Execution endpoints must not accept a raw user prompt as authority.
- Execution endpoints must not accept AI-generated text as approval.
- Execution endpoints must reject missing or stale approval records.
- Execution endpoints must reject mismatched payload versions after approval.
- Execution endpoints must return stable JSON errors for blocked, missing approval, stale approval, permission denied, idempotency conflict, and validation failure cases.

Recommended namespace separation:

| Namespace | Purpose | Allowed methods |
| --- | --- | --- |
| `/api/admin-read/...` | Internal read-only Admin UI data. | `GET` only |
| `/api/admin-drafts/...` | Future draft creation and draft review, no external effect. | Authenticated write only after planning |
| `/api/admin-approvals/...` | Future approval records and review workflow. | Authenticated write only after schema approval |
| `/api/admin-actions/...` | Future execution queue entry points. | Authenticated write with approved record only |

## Audit Logging Rules

Every future write or business action must produce an audit trail.

Audit log must record:

- who proposed the action
- who approved the action
- who executed the action
- what payload was sent, generated, confirmed, or changed
- target recipient, supplier, customer, or business object
- source module
- timestamp for proposal, approval, execution, and result
- before and after status where applicable
- execution result
- error details if failed
- rollback, cancel, or reversal state if available
- idempotency key
- payload version or checksum where useful
- risk level and approval rule version

Audit log must not expose:

- tokens
- passwords
- service keys
- private storage paths
- signed URLs
- raw bank credentials beyond approved system configuration views
- hidden customer document fields
- internal cost/profit/exchange-rate details in customer-facing contexts

## Disabled Action Registry Plan

A future disabled action registry should define every blocked or future action in one place.

Proposed registry fields:

| Field | Purpose |
| --- | --- |
| `action_key` | Stable internal key. |
| `label` | Operator-facing Chinese label. |
| `module` | Module that owns the action. |
| `current_status` | `disabled`, `draft_only`, `staged_only`, `approval_required`, or `prohibited_current_phase`. |
| `disabled_reason` | Human-readable reason for the disabled state. |
| `required_phase` | Future phase required before activation. |
| `required_role` | Human role required for approval. |
| `risk_level` | Conservative risk level. |
| `future_endpoint` | Planned endpoint namespace, if any. |
| `audit_required` | Whether audit logging is mandatory. Must be true for business actions. |

Example disabled actions:

| action_key | label | module | current_status | risk_level | future_endpoint | audit_required |
| --- | --- | --- | --- | --- | --- | --- |
| `send_customer_reply` | 发送客户回复 | 询盘 / AI 复核 | `prohibited_current_phase` | high | `/api/admin-actions/send-customer-reply` | true |
| `send_supplier_rfq` | 发送供应商 RFQ | 供应商 / 报价前复核 | `prohibited_current_phase` | high | `/api/admin-actions/send-supplier-rfq` | true |
| `generate_quote` | 生成报价 | 报价 | `prohibited_current_phase` | high | `/api/admin-actions/generate-quote` | true |
| `send_quote` | 发送报价 | 报价 | `prohibited_current_phase` | high | `/api/admin-actions/send-quote` | true |
| `generate_pi` | 生成 PI | 报价 / 订单 | `prohibited_current_phase` | high | `/api/admin-actions/generate-pi` | true |
| `send_pi` | 发送 PI | 订单 | `prohibited_current_phase` | high | `/api/admin-actions/send-pi` | true |
| `approve_order` | 确认订单 | 订单 | `prohibited_current_phase` | high | `/api/admin-actions/approve-order` | true |
| `request_payment` | 请求付款 | 订单 / 财务 | `prohibited_current_phase` | high | `/api/admin-actions/request-payment` | true |
| `start_production` | 下达生产 | 生产 | `prohibited_current_phase` | high | `/api/admin-actions/start-production` | true |
| `arrange_shipment` | 安排发货 | 发货 | `prohibited_current_phase` | high | `/api/admin-actions/arrange-shipment` | true |
| `close_after_sales` | 关闭售后结论 | 售后 | `prohibited_current_phase` | high | `/api/admin-actions/close-after-sales` | true |

## Module-by-module Safety Map

| Module | Current state | Allowed now | Disabled now | Future write actions | Required approval gate | Risk |
| --- | --- | --- | --- | --- | --- | --- |
| 工作台 | Read-only summary and workflow preview. | View summary cards, queues, fallback state. | Create task, send message, approve, quote, order, produce, ship. | Create task, trigger follow-up, route urgent work. | Human approval and audit for any task creation or external action. | Medium |
| 询盘 | Read-only inquiry display via admin-read. | View inquiry data, missing info, risk flags. | Create inquiry, AI auto-processing, send reply, quote, PI. | Create inquiry, stage reply, stage quote request. | Approval record with inquiry object, payload preview, recipient, risk. | High |
| 客户 | Read-only customer display via admin-read. | View customer list and follow-up metadata. | Create, update, delete, import, send follow-up. | Edit customer, create follow-up, send message. | Approval for outbound message or destructive change; role check for data edits. | Medium-high |
| AI 复核 | Read-only AI review display. | View draft/review metadata and warnings. | Send AI draft, approve automatically, reject automatically, create quote or PI. | Stage AI reply draft, stage review outcome. | Human approver must review full draft payload and risk flags. | High |
| 供应商 | Read-only supplier/capability preview. | View supplier capability and pending risk. | Send RFQ, confirm supplier price, confirm delivery, commit capability. | Stage supplier RFQ, record supplier quote, compare suppliers. | Supplier coordinator or manager approval; audit target supplier and payload. | High |
| 制造能力 | Read-only manufacturing capability display. | View capability metadata. | Confirm production feasibility, confirm delivery time, commit capacity. | Request capacity confirmation, stage production feasibility review. | Human approval; no commitment before supplier evidence. | High |
| 文件中心 | Metadata-only read display. | View safe file metadata. | Upload, download, delete, parse, OCR, promote archive, expose signed URL. | Stage file archive, request OCR, link file to project. | Approval and file safety scan before file operations. | Medium-high |
| 报价前复核 | Read-only pre-quotation review. | View missing info, supplier status, risk, boundary. | Calculate price, generate quote, send quote, generate PI, contract/order/payment/production/shipment. | Stage quote preparation, stage supplier RFQ, stage quote draft. | Commercial approval with payload preview, hidden-field check, price/delivery/payment risk. | High |
| 报价 | Static/read-only preview. | View planned quotation review information. | Generate quotation, calculate final price, send quotation, approve quote. | Generate draft quote, preview quote PDF, send quote. | Sales/owner approval; customer-facing hidden-field checklist and audit. | High |
| 订单 | Static/read-only preview. | View order preparation state. | Confirm order, generate contract, confirm payment, start production. | Stage order confirmation, stage PI/contract, stage production handoff. | Owner/manager approval; payment/order terms audit. | High |
| 生产 | Static/read-only preview. | View production readiness/risk. | Start production, confirm delivery, confirm packaging, judge quality responsibility. | Stage production order, send factory production order, update production status. | Factory-facing approval; hide customer-sensitive fields. | High |
| 发货 | Static/read-only preview. | View shipment readiness/risk. | Confirm shipment, generate packing list, confirm logistics, notify customer. | Stage shipment docs, stage customer shipment notice. | Logistics/manager approval; document and recipient audit. | High |
| 售后 | Static/read-only preview. | View after-sales cases and evidence gaps. | Admit liability, promise compensation, confirm replacement, send final conclusion. | Stage after-sales response, stage replacement proposal. | Owner/manager approval; evidence and liability review. | High |
| 设置 | Placeholder/read-only settings preview. | View placeholder state only. | Connect Gmail/WhatsApp, save AI keys, modify permissions, enable automation. | Configure providers, roles, approval rules, channel accounts. | Admin approval, secret handling process, audit. | High |

## Implementation Phases

### Phase S1: Documentation and UI disabled action audit

- Complete this plan.
- Audit all visible active-looking controls.
- Confirm disabled actions remain informational.
- Identify and clean up confusing controls such as legacy Filter or unused form samples in a separate UI safety task.
- No execution.

### Phase S2: Disabled action registry in code, still no execution

- Add a local registry of disabled/future actions.
- Display disabled reason consistently.
- Keep registry display-only.
- No API write routes.
- No action execution.

### Phase S3: Approval record schema plan, no migration yet

- Plan approval record tables/fields.
- Plan audit log tables/fields.
- Plan roles and required approver mapping.
- Plan idempotency keys and payload versioning.
- No migration until reviewed.

### Phase S4: Draft generation only, no send

- Allow drafts only where explicitly approved.
- Mark every draft as draft-only.
- Keep generated content local/display-only or stored as draft records after schema approval.
- No customer/supplier send.
- No official quote, PI, contract, order, payment, production, or shipment execution.

### Phase S5: Manual approval UI, no execution

- Add approval review UI for staged actions.
- Show payload preview, target, risk, irreversible effects, and audit note.
- Allow approve/reject status only after schema/API approval.
- Still no external execution.

### Phase S6: Execution queue with explicit approval, audit logging, and idempotency

- Add execution queue only after approval records are proven.
- Require approved action record and idempotency key.
- Log every attempt and result.
- Keep retries controlled and visible.
- Start with lowest-risk internal actions before any external channel or customer-facing action.

## Risks And Non-goals

### Risks

- Disabled UI copy could be mistaken for available capability if visual hierarchy is unclear.
- Historical mixed handlers may still contain authenticated write paths outside the admin-read namespace.
- AI-generated drafts could be mistaken for approval if not clearly labeled.
- A future endpoint could accidentally trust frontend labels instead of backend approval state.
- External channel integrations could send messages before approval if introduced without execution gates.
- Quote/PI/order/payment/production/shipment language can create accidental business commitments.
- File operations could expose storage paths, signed URLs, or private documents if not separately reviewed.

### Non-goals

This plan does not:

- implement approval tables
- implement audit log tables
- implement API routes
- implement UI controls
- implement send/approve/reject actions
- implement quotation, PI, contract, order, payment, production, or shipment execution
- implement Gmail, WhatsApp, OpenAI, or AI Gateway integration
- change existing production deployment
- change existing admin-read routes
- change database schema

## Recommended Next Tasks

1. CBM-CODEX-SPRINT-UI-SAFETY-003 - Admin UI Disabled Action Surface Audit
2. CBM-CODEX-SPRINT-SAFETY-003 - Disabled Action Registry Plan
3. CBM-CODEX-SPRINT-SCHEMA-PLAN-001 - Approval Audit Schema Plan
4. CBM-CODEX-SPRINT-DOCS-003 - Internal Trial Operator Guide Update
5. CBM-CODEX-RELEASE-013 - Authenticated Admin API Smoke Test Execution if safe token exists

## Progress Report

- Full product vision: 35% -> 35%
- Internal MVP / foundation: 83% -> 83%
- Disabled Action / Write Approval Planning: 0% -> 100%
- Overall: [████░░░░░░] 35%
- Internal MVP: [████████░░] 83%
- Current module: [██████████] 100%
