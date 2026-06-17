# Phase 0B Service Orchestration Helper Plan

## 1. Title

Phase 0B Service Orchestration Helper Plan

## 2. Purpose

This document defines future pure service orchestration helper boundaries before implementation.

It explains how CBM Trade OS can combine existing Phase 0A local utilities in a safe order without introducing database writes, API calls, external AI calls, sending, approval execution, or commercial commitments.

## 3. What Service Orchestration Means In CBM Trade OS

Service orchestration means coordinating existing local utilities in a safe, repeatable order.

It does not mean:

- Database write
- API call
- Sending messages
- Approval execution
- AI model execution
- Quotation, PI, order, payment, shipment, or production execution

In Phase 0B, orchestration helpers should be pure input/output functions that prepare review summaries, draft metadata, warnings, and recommended action boundaries.

## 4. Why Orchestration Is Needed

Orchestration is needed to:

- Avoid scattered utility calls across UI, API routes, and future services.
- Enforce a standard safe order for normalization, classification, risk checks, and display preparation.
- Preserve the human review boundary.
- Make future UI/API integration easier.
- Prevent accidental business commitments.
- Keep AI-first workflows draft-first and review-first.

## 5. Core Orchestration Rules

- Pure input/output only.
- No side effects.
- No database access.
- No Supabase access.
- No API calls.
- No external AI calls.
- No email or WhatsApp sending.
- No approval execution.
- No quotation, PI, order, payment, shipment, or production execution.
- All business-risk outputs must be marked draft-only or review-required.
- Helpers must not mutate input objects.
- Helpers may return warnings, risk flags, and suggested next operator actions.

## 6. Proposed Helper Categories

Conceptual helper categories only:

- Inquiry intake orchestration
- Customer/company display preparation
- Numbering suggestion orchestration
- Communication classification orchestration
- Attachment classification orchestration
- AI draft safety orchestration
- Admin display adapter orchestration

These categories should remain separate so display formatting, risk review, and future API behavior do not become tangled.

## 7. Example Safe Flow: Inquiry Intake Preparation

Future conceptual flow:

1. Receive raw inquiry object.
2. Normalize relevant fields.
3. Classify communication sensitivity.
4. Suggest numbering code if needed.
5. Prepare AI draft input.
6. Classify AI draft safety.
7. Return a review summary.

This flow must not:

- Save data
- Send messages
- Execute approval
- Create quotation, PI, order, production, shipment, or payment actions

## 8. Example Safe Flow: Supplier RFQ Draft Preparation

Future conceptual flow:

1. Normalize communication.
2. Classify attachments.
3. Prepare supplier RFQ draft metadata.
4. Classify draft safety.
5. Mark the result as `review_required`.
6. Return a draft-only suggestion.

This flow must not send anything to suppliers. Supplier-facing RFQs remain draft-only until a human explicitly approves a later sending workflow.

## 9. Example Safe Flow: Customer Reply Draft Preparation

Future conceptual flow:

1. Normalize customer message.
2. Classify communication risk.
3. Detect price, delivery, payment, quality, order, quotation, or PI language.
4. Classify AI draft safety.
5. Return a draft-only suggested reply.
6. Require human approval before any send action.

This flow must never send customer-facing messages automatically.

## 10. Example Safe Flow: Numbering Suggestion Preparation

Future conceptual flow:

1. Run `normalizeCodeInput`.
2. Run `checkDuplicateCodeCandidate` with current local/stub behavior.
3. Run `generateCodeSuggestion`.
4. Return suggestion, warnings, confidence, and review indicators.

This flow must not:

- Create records
- Reserve database sequences
- Save final codes
- Merge duplicate candidates

Final record creation and code saving require a future approved write flow.

## 11. Example Safe Flow: Admin Display Preparation

Future conceptual flow:

1. Receive read-only records.
2. Map display labels with Chinese UI labels.
3. Preserve internal keys.
4. Return display-only view model.

This flow must not:

- Mutate API payloads
- Change API contracts
- Change database schema
- Perform risk classification
- Add write actions

Display preparation is for operator-facing readability only.

## 12. Proposed Input/Output Contract Pattern

Exact implementation is not part of this task, but future helpers should use a clear pattern.

Suggested input:

- `raw_object`
- `context`
- `options`

Suggested output:

- `normalized_object`
- `classification_result`
- `risk_flags`
- `warnings`
- `recommended_action_boundary`
- `approval_required`
- `display_labels` or `display_view_model`
- `next_suggested_operator_action`
- `audit_note_candidate`

Outputs should be advisory and review-oriented. They should not imply that any action has been executed.

## 13. Action Boundary Definitions

- `auto_allowed`: only for internal low-risk display or preparation steps.
- `review_required`: for customer-facing drafts, supplier-facing drafts, or business-risk content.
- `blocked`: for permission, finance, banking, unsafe action requests, or requests that could create unauthorized commitments.

`auto_allowed` must never mean auto-send, auto-approve, or auto-write.

## 14. Human Review Requirements

Human review is required when output involves:

- Customer-facing message
- Supplier-facing message
- Price
- Delivery
- Payment
- Bank details
- Compensation
- Quality responsibility
- Quotation
- PI
- Order
- Production
- Shipment
- Supplier commitment

Human review is also required when source data is incomplete, classification is uncertain, or a helper returns warnings that affect business interpretation.

## 15. What Orchestration Helpers Must Never Do

Orchestration helpers must never:

- Save records
- Create database rows
- Update database rows
- Delete records
- Send email
- Send WhatsApp
- Call OpenAI or AI Gateway
- Approve drafts
- Reject drafts
- Generate official quotations
- Generate official PI
- Confirm orders
- Trigger payment
- Trigger shipment
- Confirm production feasibility
- Confirm price, delivery time, payment terms, bank details, compensation, or responsibility

## 16. Difference Between Orchestration Helper And Display Adapter

An orchestration helper combines business-safe utility outputs, such as normalization, classification, risk flags, warnings, and action boundary recommendations.

A display adapter maps data into UI-safe labels or view models.

Neither should write data. Neither should mutate API payloads.

A display adapter should not perform risk classification. It should consume already-prepared values and make them readable for operators.

## 17. Difference Between Orchestration Helper And Future API Endpoint

An orchestration helper is pure logic.

A future API endpoint may call a helper, but API endpoint planning must happen separately.

Future API endpoints must enforce:

- Auth boundary
- Read/write boundary
- Validation
- Approval requirements
- Rate and abuse controls where relevant
- Safe response shaping

The helper itself should not know about HTTP, Supabase sessions, cookies, request headers, or deployment environment.

## 18. Testing Expectations For Future Implementation

Future implementation should include:

- Pure function tests
- No mutation tests
- Risk boundary tests
- Blocked-action tests
- `approval_required` tests
- Display label preservation tests
- No side-effect tests
- No database/API/network access tests
- Snapshot or fixture tests for representative inquiry/draft inputs

Tests should prove that helpers return advisory data only and never execute business actions.

## 19. Recommended Implementation Sequence

Recommended sequence:

1. Planning doc accepted.
2. Create task card for first pure orchestration helper.
3. Implement one pure helper only.
4. Add tests.
5. No UI/API/schema wiring.
6. Review.
7. Repeat only after approval.

Each helper should be small enough to inspect and rollback easily.

## 20. Candidate First Helper

Recommended first helper: `prepareAiDraftReviewSummary`.

Why this is lower risk:

- It can combine existing AI Draft normalization and safety classification.
- It does not need database access.
- It does not need API access.
- It does not need UI wiring.
- It does not send messages.
- It can keep all outputs draft-only and review-required.

Alternative helper: `prepareInquiryReviewSummary`.

That may be useful soon, but it is slightly broader because inquiry review can touch communication classification, numbering suggestions, and customer/company context.

## 21. What Should Wait

The following should wait:

- Database duplicate check
- Schema migration
- API integration
- UI wiring
- OpenAI or AI Gateway integration
- Gmail or WhatsApp integration
- Approval workflow execution
- Official quotation, PI, order, payment, shipment, or production flows

## 22. Acceptance Criteria Before Implementation

Implementation may start only when:

- Helper name is approved.
- Input/output contract is clear.
- Allowed files are explicit.
- Tests are defined.
- No side effects are guaranteed.
- No API/schema/UI changes are included.
- User explicitly approves the implementation task.

## 23. Recommended Next Task

Recommended next task:

1. Service Orchestration Helper Readiness Review
2. Then create a `prepareAiDraftReviewSummary` task card or implementation plan

The next step should still avoid schema, API, UI, external AI, channel integration, and write-action implementation.
