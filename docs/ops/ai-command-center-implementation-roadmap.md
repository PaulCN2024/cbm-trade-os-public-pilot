# AI Command Center Implementation Roadmap

## Purpose

This roadmap stages AI Command Center work from safe planning to controlled future execution. It keeps the system AI-first while preserving the current safety boundary: no uncontrolled write, send, approval, quotation, PI, order, payment, production, shipment, or external channel action.

## Roadmap Stages

### C0 - Planning

Define the product role, UI storyboard, routing model, safety boundary, and implementation roadmap.

Status after this document set: complete.

### C1 - Static UI Preview

Add a read-only AI Command Center preview to the Admin UI.

Scope:

- command examples
- intent cards
- static context panel
- recommended workflow preview
- disabled approval/action boundary
- no AI calls
- no API changes unless separately approved
- no helper execution
- no business actions

### C2 - Read-only Command Examples

Create read-only example commands and expected response shapes.

Scope:

- static command templates
- static route summaries
- Chinese operator-first wording
- no freeform AI execution

### C3 - Workflow Route Cards

Show how an instruction routes to Inquiry, Customer, Supplier, Knowledge, File, Quotation Pre-review, Prospecting, Social Content, Follow-up, Risk, and Approval later.

Scope:

- route card UI
- module responsibility display
- missing context display
- source/confidence display

### C4 - Admin-read Context Aggregation Plan

Plan read-only context aggregation before implementation.

Scope:

- active customer/inquiry context
- linked knowledge records
- supplier capability
- file metadata
- quotation rules
- risk rules
- approval status

No schema, API, or aggregator implementation should happen without a separate task.

### C5 - AI Provider And Model Router Integration Plan

Plan AI provider integration and model routing.

Scope:

- provider abstraction
- prompt safety
- context window limits
- cost controls
- audit logging
- no direct production execution

### C6 - Draft Generation With Source And Risk

Allow controlled draft generation after provider and safety planning.

Scope:

- source citations
- confidence display
- risk warnings
- draft-only output
- no sending or approval execution

### C7 - Approval Request Queue

Create a future queue for actions that require Paul’s approval.

Scope:

- approval request records
- exact output preview
- risk and rollback details
- human approval status
- audit trail

### C8 - Controlled Action Execution

Only after approval architecture and audit logging exist, enable selected controlled actions.

Scope:

- explicit approval
- exact command/output replay
- execution logging
- rollback or recovery note
- narrow action adapters

### C9 - Audit And BI Integration

Turn command history, approval records, and outcomes into management insight.

Scope:

- command usage analytics
- workflow bottlenecks
- response time
- conversion and quote readiness metrics
- risk trends

## Recommended Next Executable Task

`CBM-CODEX-SPRINT-AI-COMMAND-CENTER-UI-001 - Add AI Command Center Static UI Preview`

This should be a small Admin UI implementation that remains static, read-only, and non-executing.

## Expected Progress Impact

- Planning: Full product vision current + 1%
- Static UI: +1%
- Read-only route/context integration: +2%
- Internal MVP / foundation: no increase beyond 100%

The product vision should increase only when meaningful capability is planned or implemented. Internal MVP should remain capped at 100%.
