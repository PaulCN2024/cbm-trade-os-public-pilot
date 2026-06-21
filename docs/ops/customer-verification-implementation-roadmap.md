# Customer Verification Implementation Roadmap

## Purpose

This roadmap defines a staged path from the current static AI Customer Verification preview toward a safe, source-aware, human-reviewed customer verification workflow.

The roadmap is planning-only. It does not authorize schema changes, SQL, API implementation, UI implementation, external lookup, scraping, AI provider calls, customer mutation, sending, quotation, PI, order, payment, production, or shipment actions.

## Current Completed State

- AI Customer Verification UI Preview is completed.
- AI Customer Verification Production Deployment is completed.
- Business Card Capture real upload/OCR is paused/deferred.
- AI-first Admin UI foundation exists.
- Read-only and safety patterns are established.
- Admin-read dispatcher pattern exists for protected read-only resources.
- Human approval boundary is documented.

## Roadmap

### CV0 - UI preview complete

Status: complete.

The Admin UI contains `AI 客户验证` as a static read-only module. It shows a demo profile, checklist, type inference, duplicate risk, risk signals, recommended next action, disabled decisions, and safety notes.

### CV1 - data model and rules plan

Status: this planning task.

Deliverables:

- customer verification data model plan
- evidence rules plan
- confidence/risk rules plan
- human review workflow
- implementation roadmap

### CV2 - read-only data foundation

Goal:

Create SQL/manual pack, DEMO data, RLS plan, and safety review for customer verification tables.

Boundaries:

- no SQL execution by Codex unless Paul explicitly approves
- no customer mutation
- no external lookup
- no AI provider call

### CV3 - demo seed data

Goal:

Add DEMO records for requests, evidence, scores, duplicate matches, and review records.

Boundaries:

- demo only
- no real customer trust decisions
- no private/confidential customer data

### CV4 - admin-read routes

Goal:

Expose read-only customer verification resources through the existing protected admin-read pattern.

Potential resources:

- `customer-verification-summary`
- `customer-verification-requests`
- `customer-verification-evidence`
- `customer-verification-scores`
- `customer-verification-duplicate-matches`
- `customer-verification-reviews`

Boundaries:

- GET-only
- auth-gated
- no write routes
- no external lookup
- no customer mutation

### CV5 - UI data binding

Goal:

Bind `AI 客户验证` UI to admin-read records while preserving fallback static examples.

Boundaries:

- no active controls
- no approve/reject buttons
- no send buttons
- no customer creation
- no quote/order/payment/production/shipment action

### CV6 - duplicate check from existing customer data

Goal:

Plan and then implement safe local duplicate candidates from existing customer fields.

Boundaries:

- candidate matches only
- no auto-merge
- no archive/reject
- no customer mutation

### CV7 - external lookup plan

Goal:

Plan source-approved external lookup rules before any live lookup exists.

Topics:

- allowed sources
- licensing and terms
- rate limits
- privacy
- source citation
- freshness
- failure states
- robots/protection boundaries

Boundaries:

- no scraping implementation
- no protected-platform bypass
- no search execution

### CV8 - AI reasoning provider plan

Goal:

Plan AI reasoning for evidence explanation, score explanation, and next-step recommendation.

Boundaries:

- no provider key changes
- no live AI calls
- no customer-facing claims
- no hidden final trust decisions

### CV9 - human review queue

Goal:

Create read-only review queue first, then later controlled approval UI.

Boundaries:

- no write execution in first queue
- disabled actions remain informational
- audit design required before mutations

### CV10 - approved customer status update

Goal:

Controlled write workflow may update customer verification status only after approval architecture exists.

Prerequisites:

- approval center or equivalent workflow
- audit log
- permission/RLS review
- tests for denied actions
- rollback plan

### CV11 - follow-up assistant integration

Goal:

Use verified customer context to prepare draft-only follow-up messages.

Boundaries:

- draft only
- no auto-send
- no official quote
- no price/delivery/payment commitment

## Recommended Next Executable Task

Recommended:

```text
CBM-CODEX-SPRINT-CUSTOMER-VERIFICATION-DATA-READONLY-001
```

Goal:

Create SQL/manual pack, DEMO data, admin-read route plan/implementation boundary, and UI binding plan for customer verification records, still read-only and fallback-safe.

Alternative:

```text
CBM-CODEX-SPRINT-FOLLOWUP-ASSISTANT-PLAN-001
```

Use this alternative if Paul wants to design the customer follow-up workflow before creating customer verification data tables.

## Stop Conditions

Stop and return to planning if a future task requires:

- real external lookup
- scraping
- AI provider calls
- customer creation/mutation
- sending messages
- automatic quote generation
- PI/order/payment/production/shipment execution
- production environment changes
- uncontrolled SQL execution
