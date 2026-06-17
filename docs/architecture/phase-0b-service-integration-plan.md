# Phase 0B Service Integration Plan

## 1. Title

Phase 0B Service Integration Plan

## 2. Purpose

Phase 0B defines how the completed Phase 0A local utility foundations can be safely integrated into CBM Trade OS.

The purpose is planning only: Phase 0B should not prematurely add write actions, schema changes, external AI calls, customer/supplier sending, or approval workflow execution. It should clarify where local utilities can support future UI, API, and service logic while keeping business-risk actions human-reviewed.

## 3. Phase 0A Completed Foundations

Completed or temporarily frozen foundations:

- Numbering Foundation
- Communication + Attachment Foundation
- AI Draft & Approval Foundation
- Chinese UI Labels Foundation
- Localized Read-only Admin UI Foundation

## 4. Core Integration Principle

- Local utilities may assist UI, API, and service-layer logic.
- Business-risk actions require human review.
- All draft, send, quote, order, payment, production, and shipping flows remain approval-gated.
- No auto-send.
- No auto-approve.
- No hidden write actions.
- AI may draft, classify, organize, and recommend; human operators make final business decisions.

## 5. Integration Order Recommendation

Recommended safe order:

1. UI read-only display helpers
2. Service-layer pure orchestration helpers
3. Schema planning documents
4. API read-only integration planning
5. Draft-only workflow planning
6. Approval workflow planning
7. External channel integration planning
8. Write-action implementation only after explicit approval

This order keeps low-risk display and pure local logic ahead of schema, API, AI, channel, and write-action work.

## 6. Numbering Integration Plan

- `normalizeCodeInput` should run before `generateCodeSuggestion`.
- Code generation remains suggestion-only until a future approved write flow exists.
- Duplicate check remains local/stub until database integration is planned.
- Future database duplicate checking requires separate schema and API planning.
- Numbering should not create records by itself.
- Generated code suggestions require operator review before saving.
- Existing codes should remain immutable after creation unless a future exceptional correction process is explicitly approved.

## 7. Communication + Attachment Integration Plan

- Normalize communication input before classification.
- Classify attachments and communication sensitivity locally first.
- Attachment classification is advisory only.
- Communication sensitivity flags should help operators triage review risk.
- No email or WhatsApp sending should be added in Phase 0B.
- Future inbound/outbound channel integration must be planned separately and approval-gated.
- Important attachments may later be promoted to Document Center, but that requires schema/API planning first.

## 8. AI Draft & Approval Integration Plan

- Run `normalizeAiDraftInput` before `classifyAiDraftSafety`.
- `approval_required` remains conservative by default.
- Sensitive content routes to `review_required` or `blocked`.
- AI drafts are draft-only.
- No customer-facing or supplier-facing message can be sent automatically.
- No price, delivery, payment, quality, order, quotation, or PI commitment can be made without human approval.
- Safety classification may support UI badges, review queues, and future approval planning, but must not execute approvals.

## 9. Chinese UI Labels Integration Plan

- Chinese labels help Chinese business operators review work faster.
- Internal keys remain English.
- API fields, enum values, route paths, test names, and payload keys remain unchanged.
- Label dictionaries should be used for display only.
- Label mapping must not alter data payloads.
- Future UI wiring should remain incremental and section-by-section.
- Customer-facing language remains separate from operator-facing UI labels.

## 10. Localized Admin UI Integration Plan

- The localized read-only Admin UI can be treated as temporarily frozen.
- Future UI work should start with browser preview and issue lists.
- No write UI should be added until schema, API, and approval planning are complete.
- Disabled/mock actions must remain disabled.
- The current read-only UI should continue to preserve visible safety boundaries.
- UI polish should remain small, reviewed, and separate from business feature implementation.

## 11. Proposed Phase 0B Module Boundaries

Conceptual future module boundaries only; do not create these folders in this planning step:

- Service orchestration
- Display adapters
- Approval planning
- Draft workflow planning
- Channel integration planning
- Schema planning
- API planning

These boundaries should prevent AI tools, UI code, API routes, and database access from becoming tightly coupled.

## 12. What Phase 0B Should NOT Implement Yet

- No schema migrations
- No new API write routes
- No OpenAI or AI Gateway calls
- No Gmail or WhatsApp sending
- No quotation generation execution
- No PI, order, payment, shipment, or production execution
- No approval workflow execution
- No customer-facing auto-send
- No supplier-facing auto-send
- No hidden database writes
- No business commitment automation

## 13. Risk Classification

| Area | Risk level | Why | Required approval before implementation? |
| --- | --- | --- | --- |
| Read-only label display | Low | Display-only, no data mutation | Yes, small UI approval |
| Local normalization | Low | Pure local utility logic | Yes, implementation task approval |
| Local classification | Low to Medium | Advisory output may influence operator attention | Yes |
| Duplicate check with DB | Medium | Requires database reads and matching rules | Yes, schema/API plan required |
| Approval workflow | High | Can change business decision flow | Yes, explicit approval required |
| Sending messages | High | External customer/supplier communication | Yes, explicit approval required |
| Quotation / PI / order / payment / shipment / production | High | Creates commercial or operational commitments | Yes, explicit approval required |

## 14. Recommended Next 5 Tasks

1. Phase 0B service integration readiness review
2. Service orchestration helper planning document
3. Schema planning document for numbering, communication, and AI drafts
4. API read-only integration planning document
5. Admin UI issue/polish review document

These should remain planning or read-only review tasks before any schema/API/write implementation begins.

## 15. Acceptance Criteria for Entering Implementation

Actual implementation should begin only when:

- Schema impact is clear.
- API impact is clear.
- Read/write boundary is clear.
- Approval gate is defined.
- Rollback plan is clear.
- Tests are planned.
- User has explicitly approved the implementation task.

## 16. Final Recommendation

Freeze the localized read-only Admin UI for now.

Move next into Phase 0B planning before any schema, API, AI, external channel, approval execution, or write-action implementation. This keeps CBM Trade OS on the AI-first path while protecting the system from premature automation and unsafe business commitments.
