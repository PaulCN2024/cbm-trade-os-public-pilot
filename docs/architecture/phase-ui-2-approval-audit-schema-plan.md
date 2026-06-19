# Phase UI-2 Approval Audit Schema Plan

## Purpose

Define the future schema architecture for staged business actions, human approval, controlled execution attempts, idempotency, and audit logging.

This plan follows the Disabled Action / Write Approval Architecture Plan and the Disabled Action Registry Plan. It exists so future implementation work can design tables deliberately before any migration, write API, approval UI, external send, quotation generation, PI/order/payment/production/shipment action, or business execution is added.

This is a planning document only. It does not create migrations, modify database schema, modify API code, modify UI code, add write actions, deploy production, or enable approval execution.

## Current Safety Baseline

Current CBM Trade OS Admin UI state:

- Full product vision: 35%
- Internal MVP / foundation: 85%
- Admin UI read-only production baseline is deployed.
- Disabled Action / Write Approval Architecture Plan is complete.
- Disabled Action Registry Plan is complete.
- Admin UI disabled action remediation is deployed and production-smoke verified.

Current read-only/admin-read coverage:

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

The future approval/audit schema must preserve:

- no write actions now
- no approval execution now
- no customer or supplier send actions now
- no quotation, PI, order, payment, production, shipment, or after-sales execution now
- no hidden business action on page load
- no trust in frontend disabled state as backend enforcement
- human approval before every business-risk action

## Proposed Core Tables

The future schema should be planned around five core table groups:

1. `proposed_actions`
2. `action_approvals`
3. `action_execution_attempts`
4. `action_audit_logs`
5. `action_idempotency_keys`

These table names are proposed only. They must be reviewed again before any migration is created.

### proposed_actions

Purpose:

Stores staged or draft actions before approval. A proposed action is not executable by itself.

Recommended fields:

| Field | Suggested type | Purpose |
| --- | --- | --- |
| `id` | `uuid` | Primary key. |
| `action_key` | `text` | Stable action key from the Disabled Action Registry. |
| `action_label` | `text` | Human-readable label for review surfaces. |
| `action_category` | `text` | Registry category such as `external_send` or `commercial_commitment`. |
| `source_module` | `text` | Origin module such as `inquiries`, `ai_review`, `pre_quotation`, or `orders`. |
| `business_object_type` | `text` | Target object type such as `customer`, `inquiry`, `quotation`, `pi`, `order`, or `shipment`. |
| `business_object_id` | `text` or `uuid` | Target business object id. Use type matching the target object strategy. |
| `proposed_by` | `uuid` or `text` | User/system actor that proposed the action. |
| `proposed_at` | `timestamptz` | Proposal time. |
| `proposed_payload_preview` | `jsonb` | Sanitized payload preview shown to human reviewer. |
| `proposed_payload_hash` | `text` | Hash of the reviewed payload preview/version. |
| `risk_level` | `text` | Conservative risk level: `low`, `medium`, `high`, or `critical`. |
| `disabled_registry_status` | `text` | Registry status at proposal time, such as `draft_only` or `approval_required_future`. |
| `required_approver_role` | `text` | Role needed to approve. |
| `approval_status` | `text` | Proposal approval status. |
| `execution_status` | `text` | Current execution status. |
| `idempotency_key` | `text` | Optional planned execution idempotency key. |
| `expires_at` | `timestamptz` | Expiration for stale proposed actions. |
| `created_at` | `timestamptz` | Creation timestamp. |
| `updated_at` | `timestamptz` | Last update timestamp. |

Planning notes:

- `proposed_payload_preview` must be sanitized.
- Raw secrets, access tokens, bank credentials, private storage paths, signed URLs, and raw customer documents must not be stored here.
- `proposed_payload_hash` should be used to detect payload drift between proposal, approval, and execution.
- `execution_status` should start as `not_executable` or `blocked` unless the future workflow explicitly allows queuing after approval.

### action_approvals

Purpose:

Stores human approval, rejection, or revocation decisions.

Recommended fields:

| Field | Suggested type | Purpose |
| --- | --- | --- |
| `id` | `uuid` | Primary key. |
| `proposed_action_id` | `uuid` | Foreign key to `proposed_actions.id`. |
| `approval_status` | `text` | Approval decision status. |
| `approver_id` | `uuid` or `text` | Human approver id. |
| `approver_role` | `text` | Role held at decision time. |
| `approval_reason` | `text` | Safe approval note. |
| `rejection_reason` | `text` | Safe rejection note. |
| `approved_at` | `timestamptz` | Approval timestamp. |
| `rejected_at` | `timestamptz` | Rejection timestamp. |
| `approval_payload_hash` | `text` | Payload hash approved or rejected by the human reviewer. |
| `created_at` | `timestamptz` | Creation timestamp. |
| `updated_at` | `timestamptz` | Last update timestamp. |

Planning notes:

- Approval must be human and role-gated.
- AI output, a generated draft, a raw prompt, or a UI disabled label must never count as approval.
- Approval and execution should remain separate steps.
- `approval_payload_hash` must match the execution payload hash before future execution.

### action_execution_attempts

Purpose:

Stores execution attempts after approval. This table must not be used until a future execution phase is explicitly approved.

Recommended fields:

| Field | Suggested type | Purpose |
| --- | --- | --- |
| `id` | `uuid` | Primary key. |
| `proposed_action_id` | `uuid` | Foreign key to `proposed_actions.id`. |
| `approval_id` | `uuid` | Foreign key to `action_approvals.id`. |
| `action_key` | `text` | Stable action key. |
| `execution_status` | `text` | Execution lifecycle status. |
| `attempted_by` | `uuid` or `text` | User/system actor that attempted execution. |
| `attempted_at` | `timestamptz` | Attempt timestamp. |
| `idempotency_key` | `text` | Key used to prevent duplicate execution. |
| `target_endpoint` | `text` | Internal endpoint or executor route attempted. |
| `target_provider` | `text` | External provider if relevant, such as email, WhatsApp, storage, or payment provider. |
| `execution_payload_hash` | `text` | Hash of execution payload. |
| `execution_result_summary` | `jsonb` | Safe result summary without secrets or raw provider payloads. |
| `error_code` | `text` | Safe error code. |
| `error_message_safe` | `text` | Redacted human-readable failure message. |
| `retry_count` | `integer` | Retry count. |
| `created_at` | `timestamptz` | Creation timestamp. |
| `updated_at` | `timestamptz` | Last update timestamp. |

Planning notes:

- Execution attempts must require an approved proposal and matching payload hash.
- Execution attempts must require an idempotency key for external, financial, production, logistics, and irreversible actions.
- Execution result summaries must not expose tokens, credentials, raw documents, or provider secrets.
- Failed attempts must be auditable.

### action_audit_logs

Purpose:

Immutable audit trail for proposal, approval, rejection, cancellation, execution attempt, success, failure, retry-block, and revocation events.

Recommended fields:

| Field | Suggested type | Purpose |
| --- | --- | --- |
| `id` | `uuid` | Primary key. |
| `event_type` | `text` | Audit event type. |
| `action_key` | `text` | Stable action key. |
| `proposed_action_id` | `uuid` | Optional link to proposed action. |
| `approval_id` | `uuid` | Optional link to approval. |
| `execution_attempt_id` | `uuid` | Optional link to execution attempt. |
| `actor_id` | `uuid` or `text` | Actor that caused the event. |
| `actor_role` | `text` | Role at event time. |
| `business_object_type` | `text` | Target business object type. |
| `business_object_id` | `text` or `uuid` | Target business object id. |
| `event_summary` | `jsonb` | Safe event summary. |
| `payload_hash` | `text` | Hash of the relevant payload version. |
| `ip_address_hash` | `text` | Hashed or omitted IP address. |
| `user_agent_hash` | `text` | Hashed or omitted user agent. |
| `created_at` | `timestamptz` | Event timestamp. |

Planning notes:

- Audit logs should be append-only.
- Updates should be avoided or restricted to system-level correction workflows with their own audit trail.
- Raw IP/user-agent values should be hashed or omitted.
- Audit logs must avoid secrets and sensitive raw payloads.

### action_idempotency_keys

Purpose:

Prevents duplicate execution for future write/business actions.

Recommended fields:

| Field | Suggested type | Purpose |
| --- | --- | --- |
| `id` | `uuid` | Primary key. |
| `idempotency_key` | `text` | Unique key provided or generated for a future execution. |
| `action_key` | `text` | Action key protected by the key. |
| `proposed_action_id` | `uuid` | Link to proposed action. |
| `execution_attempt_id` | `uuid` | Optional link to the execution attempt that consumed the key. |
| `key_status` | `text` | Current key status. |
| `created_by` | `uuid` or `text` | Creator of the key. |
| `created_at` | `timestamptz` | Creation timestamp. |
| `expires_at` | `timestamptz` | Expiration timestamp. |
| `consumed_at` | `timestamptz` | Consumption timestamp. |

Planning notes:

- `(idempotency_key, action_key)` should be unique in a future migration.
- Keys should expire.
- Consumed keys must not be reused for a different payload.
- Idempotency should be checked before external execution.

## Status Values

### proposed_actions.approval_status

| Status | Meaning |
| --- | --- |
| `draft` | Action proposal is incomplete or only a local draft. |
| `staged_for_review` | Action is staged and visible to a reviewer. |
| `human_review_required` | Action cannot proceed without human review. |
| `approved` | Human approval has been granted. |
| `rejected` | Human reviewer rejected the action. |
| `expired` | Proposal is stale and cannot execute. |
| `cancelled` | Proposal was cancelled before execution. |

### proposed_actions.execution_status

| Status | Meaning |
| --- | --- |
| `not_executable` | Action cannot execute in its current state. |
| `blocked` | Action is blocked by registry, approval, role, validation, or risk rules. |
| `queued` | Future execution is queued after approval. |
| `attempted` | Future execution has been attempted. |
| `succeeded` | Future execution succeeded. |
| `failed` | Future execution failed. |
| `cancelled` | Future execution was cancelled. |

### action_approvals.approval_status

| Status | Meaning |
| --- | --- |
| `approved` | Human approver approved the proposal. |
| `rejected` | Human reviewer rejected the proposal. |
| `revoked` | Prior approval was revoked before execution or after discovery of an issue. |

### action_execution_attempts.execution_status

| Status | Meaning |
| --- | --- |
| `queued` | Execution is queued but not yet attempted. |
| `attempted` | Execution attempt started. |
| `succeeded` | Execution completed successfully. |
| `failed` | Execution failed. |
| `retry_blocked` | Retry is blocked by policy, idempotency, or safety rule. |
| `cancelled` | Execution attempt was cancelled. |

### action_idempotency_keys.key_status

| Status | Meaning |
| --- | --- |
| `active` | Key is available for a future execution attempt. |
| `consumed` | Key has already been used. |
| `expired` | Key has expired. |
| `revoked` | Key was revoked before use. |

## Relationships

Future relationships should be planned as:

- `proposed_actions` can have many `action_approvals`.
- `proposed_actions` can have many `action_execution_attempts`.
- `proposed_actions` can have many `action_audit_logs`.
- `action_approvals` link to `proposed_actions`.
- `action_execution_attempts` link to both `proposed_actions` and `action_approvals`.
- `action_idempotency_keys` link to `proposed_actions` and optionally to `action_execution_attempts`.
- `action_audit_logs` can link to `proposed_actions`, `action_approvals`, `action_execution_attempts`, and relevant business object references.

Important relationship rules:

- A future execution attempt must not exist without a proposed action.
- A future successful execution attempt must not exist without an approved approval record.
- A future execution payload hash must match the approved payload hash.
- Rejected, expired, cancelled, or revoked actions must not execute.
- Audit log records should be created for proposal, approval, rejection, expiration, cancellation, execution attempt, success, failure, retry-block, and revocation events.

## Future Admin-read Exposure

Future read-only resources may include:

| Future resource | Purpose | Boundary |
| --- | --- | --- |
| `/api/admin-read/proposed-actions` | List proposed/staged actions for review dashboards. | GET-only, no execution. |
| `/api/admin-read/action-audit-logs` | Display safe audit history. | GET-only, sanitized summaries only. |
| `/api/admin-read/action-approvals-summary` | Summarize pending/approved/rejected counts. | GET-only, no approval execution. |

Admin-read exposure rules:

- Must not execute anything.
- Must not create proposal records.
- Must not approve or reject actions.
- Must not queue execution.
- Must not expose raw payloads.
- Must not expose secrets, tokens, service keys, private storage paths, signed URLs, raw file content, raw customer private documents, or hidden customer document fields.
- Should expose payload hashes, safe summaries, status labels, risk levels, and linked business object identifiers only when safe.

## RLS And Security Expectations

Future RLS/security expectations:

- Users can only see actions for their tenant/company if multi-tenant scope is added.
- Users can only see proposed actions related to business objects they are authorized to view.
- Only admin/manager roles can approve high-risk actions.
- Critical actions require stricter role and approval gates.
- Execution attempts require `approved` approval status and matching payload hash.
- Audit logs should be append-only.
- Raw payloads should not be exposed in admin-read responses.
- Payload hashes can be exposed instead of raw payloads.
- IP address and user-agent values should be hashed or omitted.
- Service-role writes, if ever needed, must be isolated to backend-only execution paths and never exposed to browser code.
- Client-provided role, disabled state, label, or action text must never be trusted.

Recommended future role posture:

| Role | Planning posture |
| --- | --- |
| `operator` | Can view read-only summaries and draft proposals only when explicitly enabled. |
| `sales_manager` | Can approve high-risk customer-facing commercial actions after schema/UI/API approval. |
| `finance_manager` | Can approve payment-related actions after finance workflow approval. |
| `production_manager` | Can approve production-related actions after production workflow approval. |
| `admin` | Can manage role-sensitive workflows only after system-admin approval schema exists. |

## Data Sensitivity Rules

Do not store or expose:

- raw secrets
- access tokens
- service role keys
- bank/payment credentials
- full sensitive file paths
- signed URLs
- raw customer private documents
- raw supplier private documents
- raw provider responses that contain credentials or message ids beyond safe summaries
- internal cost, profit, exchange-rate detail, RMB internal purchase cost, or other protected commercial internals in customer-facing contexts
- hidden customer document fields

Use instead:

- sanitized payload preview
- payload hash
- safe result summary
- redacted fields
- business object references
- status values
- risk labels
- audit event summaries

Payload preview guidance:

- Customer-facing quotation/PI previews must not show internal cost, profit, exchange-rate details, aluminum internal uplift rules, wastage, packing weight, RMB costs, or customs cost breakdowns.
- Factory-facing production previews must not show customer contact details, sales prices, bank information, payment terms, exchange rate, profit, or customer-facing financial terms.
- File-related previews must not expose `storage_path`, signed URLs, private bucket names, or raw file contents.

## Implementation Phases

| Phase | Scope | Boundary |
| --- | --- | --- |
| A1 | Schema plan only. | No migration, no code, no execution. |
| A2 | Migration draft review. | Draft SQL review only; no production migration. |
| A3 | Create tables with RLS. | Still no write/business execution. |
| A4 | Admin-read summary resources for proposed actions and audit logs. | GET-only, sanitized summaries only. |
| A5 | Draft-only proposal creation. | No external effects; proposal records only. |
| A6 | Approval UI. | Approval/rejection records only; no execution. |
| A7 | Execution queue with idempotency and audit logging. | Future high-risk phase requiring separate approval and production verification. |

Phase gate rules:

- A1 completion does not authorize migration creation.
- A2 completion does not authorize production schema changes.
- A3 completion does not authorize execution.
- A4 completion does not authorize approval or proposal creation.
- A5 completion does not authorize external effects.
- A6 completion does not authorize execution.
- A7 requires a separate safety review, authenticated smoke plan, and production release plan.

## Non-goals

Current-phase shorthand:

- no migration now
- no write API now

This plan does not:

- authorize migration now
- authorize write API now
- enable migration now
- enable write API now
- perform migration now
- add write API now
- create migrations now
- modify database schema now
- add write APIs now
- add approval execution now
- add send actions now
- add quote generation now
- add PI, contract, order, payment, production, or shipment execution now
- add token or secrets handling now
- add UI controls now
- add admin-read resources now
- deploy production now
- change environment variables now

## Recommended Next Tasks

1. CBM-CODEX-SPRINT-DOCS-003 - Internal Trial Operator Guide Update
2. CBM-CODEX-SPRINT-SCHEMA-PLAN-002 - Approval Audit Migration Draft Plan
3. CBM-CODEX-SPRINT-API-PLAN-003 - Quotation Metadata Admin-read Safe Projection Plan
4. CBM-CODEX-RELEASE-013 - Authenticated Admin API Smoke Test Execution if safe token exists
5. CBM-CODEX-SPRINT-UI-SAFETY-005 - Static Disabled Action Registry Module Plan

## Progress Report

- Full product vision: 35% -> 35%
- Internal MVP / foundation: 85% -> 85%
- Approval Audit Schema Planning: 0% -> 100%
- Overall: [████░░░░░░] 35%
- Internal MVP: [█████████░] 85%
- Current module: [██████████] 100%
