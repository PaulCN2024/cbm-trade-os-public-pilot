# Phase UI-2 Approval Audit Migration Draft Plan

## Purpose

Plan a future migration draft for approval and audit tables without creating migration files now.

This document is planning-only. It does not create migrations, modify schema, execute SQL, modify API/UI code, enable approvals, enable writes, deploy, or execute business actions.

The goal is to make the future approval/audit migration reviewable before any database change is proposed.

## Current Baseline

Existing planning baseline:

- The Disabled Action / Write Approval Architecture Plan exists.
- The Disabled Action Registry Plan exists.
- The Approval Audit Schema Plan exists.
- No write execution exists.
- No approval execution exists.
- The Admin UI production baseline remains read-only or static-preview only.
- All business-risk actions remain disabled or mocked.

Current safety boundary:

- no send actions
- no approve/reject execution
- no RFQ sending
- no quotation generation
- no price calculation
- no PI generation
- no contract/order/payment/production/shipment execution
- no file operations

## Migration Principles

Future migrations must follow these rules:

- Migrations must be reviewed manually before execution.
- Tables must be created before execution APIs.
- RLS must be required from the first migration.
- No service-role exposure in client code.
- No raw secrets in schema defaults, stored payloads, logs, or seed data.
- No automatic execution is triggered by migration.
- Rollback or disable strategy must be documented before applying migration.
- Approval records and execution attempts must remain separate.
- AI output, a generated draft, or a frontend disabled state must never count as approval.
- Audit data must be append-only or strongly versioned.

## Table Creation Draft Outline

This section is descriptive schema planning, not executable SQL.

### A. `proposed_actions`

Purpose:

Store draft or staged actions before human review. A proposed action is not executable by itself.

Recommended columns:

- `id`: primary key.
- `action_key`: stable English key from the disabled action registry.
- `action_label`: display label captured at proposal time.
- `action_category`: registry category such as `external_send`, `commercial_commitment`, or `financial_action`.
- `source_module`: origin module, for example `inquiries`, `ai_review`, `pre_quotation`, `orders`, or `files`.
- `business_object_type`: target object type.
- `business_object_id`: target object id as text or uuid, matching the target strategy.
- `proposed_by`: authenticated human/system actor id.
- `proposed_at`: proposal timestamp.
- `proposed_payload_preview`: sanitized JSON preview shown to the reviewer.
- `proposed_payload_hash`: hash of the reviewed payload version.
- `risk_level`: conservative risk label.
- `disabled_registry_status`: registry status at proposal time.
- `required_approver_role`: role required to approve.
- `approval_status`: proposal approval status.
- `execution_status`: execution lifecycle status.
- `idempotency_key`: optional planned key for later execution.
- `expires_at`: stale proposal cutoff.
- `created_at` / `updated_at`: timestamps.

Constraints to plan:

- `action_key` required.
- `approval_status` constrained to approved status vocabulary.
- `execution_status` constrained to execution status vocabulary.
- payload preview must be sanitized.
- no raw secrets, storage paths, signed URLs, bank credentials, or raw customer documents.

### B. `action_approvals`

Purpose:

Store human approval, rejection, revocation, or cancellation decisions.

Recommended columns:

- `id`: primary key.
- `proposed_action_id`: foreign key to `proposed_actions`.
- `approval_status`: `approved`, `rejected`, `revoked`, or similar reviewed status.
- `approver_id`: human approver identity.
- `approver_role`: role held at decision time.
- `approval_reason`: safe approval note.
- `rejection_reason`: safe rejection note.
- `approved_at`: approval timestamp.
- `rejected_at`: rejection timestamp.
- `approval_payload_hash`: payload hash approved or rejected by the human reviewer.
- `created_at` / `updated_at`: timestamps.

Constraints to plan:

- Approval must point to a proposed action.
- Approval must capture a human identity and role.
- Approval payload hash must match the reviewed payload version before any future execution.
- Rejected/revoked approvals must not be executable.

### C. `action_execution_attempts`

Purpose:

Store future execution attempts after approval. This table must not be used until an execution phase is explicitly approved.

Recommended columns:

- `id`: primary key.
- `proposed_action_id`: foreign key to `proposed_actions`.
- `approval_id`: foreign key to `action_approvals`.
- `action_key`: stable action key.
- `execution_status`: queued, attempted, succeeded, failed, retry_blocked, cancelled.
- `attempted_by`: human/system actor.
- `attempted_at`: attempt timestamp.
- `idempotency_key`: execution idempotency key.
- `target_endpoint`: internal executor route attempted.
- `target_provider`: external provider label if relevant.
- `execution_payload_hash`: hash of attempted payload.
- `execution_result_summary`: safe JSON result summary.
- `error_code`: safe error code.
- `error_message_safe`: redacted failure message.
- `retry_count`: retry counter.
- `created_at` / `updated_at`: timestamps.

Constraints to plan:

- Execution attempt requires an approved proposal.
- Execution payload hash must match the approved payload hash.
- External, financial, production, logistics, and irreversible actions require idempotency.
- Result summaries must not include provider secrets or raw payloads.

### D. `action_audit_logs`

Purpose:

Append-only audit trail for proposal, approval, rejection, cancellation, execution attempt, success, failure, retry-block, and revocation events.

Recommended columns:

- `id`: primary key.
- `event_type`: audit event type.
- `action_key`: stable action key.
- `proposed_action_id`: optional link.
- `approval_id`: optional link.
- `execution_attempt_id`: optional link.
- `actor_id`: actor identity.
- `actor_role`: role at event time.
- `business_object_type`: target business object type.
- `business_object_id`: target business object id.
- `event_summary`: sanitized JSON summary.
- `payload_hash`: relevant payload hash.
- `ip_address_hash`: hashed or omitted IP address.
- `user_agent_hash`: hashed or omitted user agent.
- `created_at`: event timestamp.

Constraints to plan:

- Append-only by default.
- No delete policy for ordinary users.
- No raw secrets, signed URLs, raw customer documents, payment credentials, or internal cost details.

### E. `action_idempotency_keys`

Purpose:

Prevent duplicate future execution for write/business actions.

Recommended columns:

- `id`: primary key.
- `idempotency_key`: unique key.
- `action_key`: action protected by the key.
- `proposed_action_id`: linked proposed action.
- `execution_attempt_id`: linked execution attempt after consumption.
- `key_status`: active, consumed, expired, revoked.
- `payload_hash`: optional payload hash bound to the key.
- `created_by`: creator identity.
- `created_at`: creation timestamp.
- `expires_at`: expiration timestamp.
- `consumed_at`: consumption timestamp.

Constraints to plan:

- Unique `(idempotency_key, action_key)`.
- Consumed key cannot be reused for a different payload.
- Keys should expire.
- Idempotency check must happen before any external execution.

## RLS Draft Policy Outline

Future RLS policies should be planned before migration execution.

Recommended policy direction:

| Table | Select | Insert | Update | Delete |
| --- | --- | --- | --- | --- |
| `proposed_actions` | Authenticated internal/admin users can select tenant/owned actions. | Authenticated internal/admin users can insert proposed actions only through approved paths. | Restricted to safe status updates before execution; role-gated. | No ordinary delete. |
| `action_approvals` | Authorized internal/admin reviewers can select relevant approvals. | Authorized approver role only. | Restricted revocation/correction paths only. | No ordinary delete. |
| `action_execution_attempts` | Authorized internal/admin users can select relevant attempts. | Controlled service path only after approval. | Controlled executor status update only. | No ordinary delete. |
| `action_audit_logs` | Authorized internal/admin users can select relevant audit logs. | Append-only controlled path. | No ordinary update. | No ordinary delete. |
| `action_idempotency_keys` | Controlled internal/admin view only. | Controlled service path. | Controlled service path for consume/expire/revoke. | No ordinary delete. |

RLS must not expose service role details, environment values, secrets, raw provider payloads, or customer private file content.

## Index Plan

Recommended future indexes:

- `proposed_actions.action_key`
- `proposed_actions.business_object_type, business_object_id`
- `proposed_actions.proposed_by`
- `proposed_actions.approval_status`
- `proposed_actions.execution_status`
- `proposed_actions.created_at`
- `action_approvals.proposed_action_id`
- `action_approvals.approval_status`
- `action_execution_attempts.proposed_action_id`
- `action_execution_attempts.execution_status`
- `action_execution_attempts.idempotency_key`
- `action_audit_logs.action_key`
- `action_audit_logs.business_object_type, business_object_id`
- `action_audit_logs.created_at`
- unique `action_idempotency_keys.idempotency_key, action_idempotency_keys.action_key`

## Data Retention Plan

Planning rules:

- Audit logs retained long-term.
- Failed attempts retained.
- Rejected and revoked approvals retained.
- Payload previews redacted.
- Payload hashes retained.
- Raw payloads avoided or redacted.
- Raw documents, storage paths, signed URLs, provider tokens, and credentials must not be stored.
- Retention policy should be reviewed before production execution workflows.

## Migration Validation Checklist

Before applying any future migration:

- human review completed
- dry-run locally if possible
- no destructive SQL
- no table drops or renames
- RLS enabled from first migration
- no public unrestricted policies
- no service-role exposure
- no sensitive raw fields
- no automatic execution triggers
- tests/build pass
- rollback/disable plan documented
- production deployment plan separated from migration review

## Non-goals

- No actual migration now.
- No schema change now.
- No SQL execution now.
- No write API now.
- No approval execution now.
- No business execution now.
- No UI controls now.

## Recommended Next Tasks

1. `CBM-CODEX-SPRINT-SCHEMA-DRAFT-001` - Draft Approval Audit Migration File For Review Only
2. `CBM-CODEX-SPRINT-UI-SAFETY-005` - Static Disabled Action Registry Module Plan
3. `CBM-CODEX-SPRINT-API-PLAN-003` - Quotation Metadata Admin-read Safe Projection Plan
4. `CBM-CODEX-SPRINT-TRIAL-002` - Paul Manual Trial Feedback Incorporation
5. `CBM-CODEX-RELEASE-013` - Authenticated Admin API Smoke Test Execution if safe token exists

## Progress Report

- Full product vision: 35% -> 35%
- Internal MVP / foundation: 91% -> 91%
- Approval Audit Migration Draft Planning: 0% -> 100%
- Overall: [████░░░░░░] 35%
- Internal MVP: [█████████░] 91%
- Current module: [██████████] 100%
