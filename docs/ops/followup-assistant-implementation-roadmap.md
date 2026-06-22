# Follow-up Assistant Implementation Roadmap

## Current Completed State

Current foundations:

- AI Customer Verification foundation complete
- duplicate check planning complete
- AI Daily Workbench exists
- read-only safety patterns established

The system can display read-only customer and verification context, but it still does not execute follow-up tasks, send messages, or mutate records.

## Roadmap

### FU0 - follow-up planning

Status: complete after this document set.

Defines future data model, workflow, draft rules, approval boundary, priority/timing rules, and implementation roadmap.

### FU1 - UI preview

Create a static/read-only Follow-up Assistant UI preview. It should show candidate follow-ups, missing information, priority, timing, draft-only labels, and disabled actions.

### FU2 - data model/read-only foundation

Plan and later create read-only-friendly tables or views for candidates, missing information, recommendations, drafts, and reviews.

### FU3 - demo seed data

Add safe DEMO follow-up candidates and draft examples. Use no real customer secrets and no message sending.

### FU4 - admin-read routes

Expose protected GET-only admin-read resources for follow-up candidates and drafts.

### FU5 - UI data binding

Bind the UI to admin-read data while preserving static fallback behavior.

### FU6 - message draft templates

Create reviewed draft templates for information request, quote follow-up, buyer-role clarification, dormant reactivation, and short WhatsApp-style messages.

### FU7 - AI provider plan

Plan AI provider usage, privacy, cost, prompt boundaries, and human review before any live AI call.

### FU8 - human review queue

Design the review queue for draft messages and proposed follow-up tasks. Keep decisions disabled until controlled-write architecture exists.

### FU9 - approved task creation

Only after approval workflow and audit logging exist, allow Paul-approved task creation.

### FU10 - approved send integration later

Only after external channel safety is proven, allow Paul-approved send integration.

### FU11 - follow-up analytics later

Later, analyze follow-up conversion, reply rate, dormant reactivation, and quote response timing.

## Recommended Next Executable Task

Recommended:

```text
CBM-CODEX-SPRINT-FOLLOWUP-ASSISTANT-UI-001
```

Reason:

Build a static/read-only Follow-up Assistant UI preview before creating database tables. This lets Paul judge workflow usefulness and copy quality without schema, API, AI provider, sending, or customer mutation risk.

Alternative:

```text
CBM-CODEX-SPRINT-INQUIRY-INTELLIGENCE-UI-001
```

Use this alternative if Paul wants to improve inquiry decomposition and missing-info review before adding a dedicated follow-up view.

## Stop Conditions

Stop and return to planning if a future task requires:

- schema changes without a reviewed migration plan
- SQL execution without explicit approval
- AI provider calls
- Email/WhatsApp sending
- real task creation
- customer or inquiry mutation
- quotation, PI, order, payment, production, or shipment execution
