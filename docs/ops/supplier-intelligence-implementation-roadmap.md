# Supplier Intelligence Implementation Roadmap

## Purpose

This roadmap sequences AI Supplier Intelligence from the completed static preview toward future read-only data and later controlled supplier workflows.

It is planning only. It does not authorize migrations, SQL execution, API implementation, AI provider calls, supplier contact, RFQ sending, quotation, or business execution.

## Current Completed State

Completed foundations:

- AI Supplier Intelligence UI Preview
- AI Supplier Intelligence Production Deployment
- AI Inquiry Intelligence foundation complete
- AI Follow-up Assistant foundation complete
- AI Customer Verification foundation complete
- AI-first safety patterns established

Current module status:

- UI preview exists
- production smoke passed
- data model is not implemented
- real supplier matching is not implemented
- supplier RFQ creation/sending is not implemented
- AI provider integration is not implemented

## Roadmap

### SI0 - UI preview complete

Status: completed.

The Admin UI shows a static/read-only Supplier Intelligence preview with summary cards, DEMO matching examples, RFQ readiness, supplier questions, draft preview, and safety boundaries.

### SI1 - data model and matching rules plan

Status: this planning package.

Define future data entities, capability match levels, RFQ draft rules, risk/confidence rules, and human review workflow.

### SI2 - read-only data foundation

Create approved migration/SQL pack and read-only projection plan after separate approval.

Required boundary:

- no supplier contact
- no RFQ sending
- no quotation creation
- no business execution

### SI3 - demo seed data

Prepare safe DEMO supplier intelligence records for internal trial and fallback review.

Required boundary:

- DEMO-only data
- no real supplier promises
- no confidential customer details

### SI4 - admin-read routes

Expose protected GET-only admin-read supplier intelligence resources.

Required boundary:

- GET only
- auth-gated
- stable JSON 404 for unknown resource
- 405 for non-GET
- no write behavior

### SI5 - UI data binding

Bind the existing AI Supplier Intelligence UI to admin-read projections while preserving static fallback.

Required boundary:

- no active send/create/RFQ controls
- no external calls
- no supplier mutation
- no inquiry/customer mutation

### SI6 - capability match rules

Implement deterministic read-only capability match projection after rules are approved.

Required boundary:

- advisory match only
- no supplier confirmation
- no final supplier selection

### SI7 - RFQ draft rules

Create draft-only supplier RFQ rule helpers or templates after approval.

Required boundary:

- draft only
- not sent
- human approval required

### SI8 - supplier RFQ plan

Plan the future controlled RFQ workflow, including approval, audit, supplier message draft, send boundary, and supplier response capture.

Required boundary:

- no actual supplier sending until controlled write workflow exists

### SI9 - supplier response capture later

Plan safe read-only capture and review of supplier responses.

Required boundary:

- no automatic quote use
- supplier answer must be reviewed before customer-facing use

### SI10 - quote review integration

Connect supplier intelligence outputs to quote review readiness after safe read-only foundations exist.

Required boundary:

- no official quotation generation
- no price commitment

### SI11 - approved RFQ send later

Only after controlled write and approval/audit workflow exists, consider supplier RFQ send.

Required boundary:

- exact message preview
- explicit Paul approval
- audit trail
- rollback/cancel note

### SI12 - supplier performance/risk analytics later

Plan supplier risk and performance analytics based on reviewed history.

Required boundary:

- read-only analytics first
- no automatic supplier blocking or selection

## Recommended Next Executable Task

Recommended:

```text
CBM-CODEX-SPRINT-SUPPLIER-INTELLIGENCE-DATA-READONLY-001
```

Goal:

Create the read-only supplier intelligence data foundation after this planning package is reviewed and approved.

Alternative:

```text
CBM-CODEX-SPRINT-QUOTE-REVIEW-INTELLIGENCE-UI-001
```

Use this alternative if the next priority is to visualize how supplier intelligence informs quotation readiness before creating supplier intelligence tables/routes.

## Stop Conditions

Stop and plan again before implementation if a future task would require:

- supplier contact
- RFQ sending
- quotation creation
- supplier selection
- customer-facing price/delivery confirmation
- database write execution without approval
- AI provider calls
- external supplier search
- file upload or confidential document sharing
