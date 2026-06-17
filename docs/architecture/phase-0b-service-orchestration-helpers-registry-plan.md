# Phase 0B Service Orchestration Helpers Registry Plan

## 1. Title

Phase 0B Service Orchestration Helpers Registry Plan

## 2. Purpose

This document plans a future registry / unified discovery pattern for pure service orchestration helpers before any code implementation.

The registry should make helper discovery predictable while preserving the current Phase 0B safety boundary: review preparation only, no execution.

## 3. Why A Registry Is Needed

CBM Trade OS now has multiple pure review summary helpers:

- `prepareAiDraftReviewSummary`
- `prepareCommunicationReviewSummary`
- `prepareInquiryReviewSummary`

Future callers need a consistent way to discover and call these helpers. A registry can reduce scattered imports, prevent accidental unsafe helper usage, and make later API, UI, schema, and approval workflow planning clearer.

## 4. Current Helper Set

### `prepareAiDraftReviewSummary`

- Domain: AI Draft & Approval
- Purpose: Prepare review information for AI draft content.
- Input type: raw AI draft input plus optional context and options.
- Output type: normalized draft, safety classification, sensitivity flags, risk level, action boundary, warnings, recommended operator action, and audit note candidate.
- Safety boundary: draft-only, no send, no auto-approval, no AI model call, no API/database write.
- Current module path: `lib/services/ai-drafts/prepare-ai-draft-review-summary.js`

### `prepareCommunicationReviewSummary`

- Domain: Communication + Attachment
- Purpose: Prepare review information for communication and attachment-like input.
- Input type: raw communication input plus optional context and options.
- Output type: normalized communication, classification, attachment summary, sensitivity flags, review flags, warnings, recommended operator action, and audit note candidate.
- Safety boundary: communication-only, no send, no auto-reply, no task creation, no file upload/archive/promotion.
- Current module path: `lib/services/communication/prepare-communication-review-summary.js`

### `prepareInquiryReviewSummary`

- Domain: Inquiry
- Purpose: Prepare inquiry intake review information by combining communication and AI draft review summaries.
- Input type: raw inquiry input plus optional context and options.
- Output type: normalized inquiry, nested communication review, nested AI draft review, missing information, risk flags, warnings, review flags, recommended operator action, and audit note candidate.
- Safety boundary: inquiry-only, no send, no quote, no PI, no order, no production, no shipment, no numbering/code generation.
- Current module path: `lib/services/inquiries/prepare-inquiry-review-summary.js`

## 5. Registry Principles

- Registry is for discovery and safe grouping only.
- Registry must not execute side effects.
- Registry must not write data.
- Registry must not call API.
- Registry must not call AI model.
- Registry must not send messages.
- Registry must not approve drafts.
- Registry must not create tasks.
- Registry must not create quotation, PI, order, payment, shipment, or production actions.

## 6. Naming Rules

- Use `prepareXReviewSummary` for pure review helpers.
- Do not use `execute`, `send`, `approve`, or `create` prefixes for pure helpers.
- Names must describe preparation and review only.
- Avoid names that imply business execution, external communication, or system commitment.

## 7. Proposed Registry Shape

Future registry concepts may include:

- `REVIEW_SUMMARY_HELPERS`
- `REVIEW_SUMMARY_HELPER_DOMAINS`
- `getReviewSummaryHelper(domain)`
- `listReviewSummaryHelpers()`

This is conceptual only. No registry code is implemented in Phase 0B planning.

## 8. Proposed Helper Metadata

Each helper metadata entry may include:

- `key`
- `domain`
- `label`
- `description`
- `module`
- `functionName`
- `allowedUse`
- `forbiddenUse`
- `safetyFlags`
- `outputCapabilities`
- `requiresHumanReviewFor`

Metadata should describe safety and discovery. It should not perform work.

## 9. Safe Domain Keys

Future domain keys may include:

- `ai_draft`
- `communication`
- `inquiry`

Internal keys remain English and stable.

## 10. Chinese Display Labels

Future UI/display labels may include:

- `ai_draft` => `AI 草稿复核`
- `communication` => `沟通复核`
- `inquiry` => `询盘复核`

Display labels are UI/display-only and must not alter domain keys.

## 11. Standard Output Safety Flags

Registered helpers should expose or document relevant safety flags:

- `can_send: false`
- `can_auto_approve: false`
- `can_auto_reply: false`
- `can_create_task: false`
- `can_create_quote: false`
- `can_create_pi: false`
- `can_create_order: false`
- `can_trigger_production: false`
- `can_trigger_shipment: false`

Flags should be explicit where relevant to the helper domain.

## 12. What Registry Must Never Expose As Allowed

The registry must never expose these as allowed actions:

- `send`
- `auto_reply`
- `approve`
- `reject`
- `create_task`
- `create_quote`
- `create_pi`
- `create_order`
- `confirm_payment`
- `trigger_production`
- `trigger_shipment`
- `reserve_numbering_code`

## 13. Future Registry Usage Examples

Safe conceptual examples:

- Admin UI asks registry for helper metadata to display a safe helper list.
- Service layer calls `getReviewSummaryHelper("inquiry")` after separate service/API planning.
- Test suite checks all registered helpers have forbidden actions disabled.
- Documentation generation lists helper safety boundaries.

## 14. What Registry Must Not Be Used For

The registry is not:

- an API router
- a workflow engine
- an approval engine
- a channel sender
- a task creator
- a quotation/PI/order generator
- a database persistence layer
- an AI model router

## 15. Relationship With Future Display Adapters

The registry can help display adapters know which helper produced which summary.

Display adapters may map output into UI-safe labels, but they must not execute side effects, mutate payloads, or imply that a business action has been completed.

## 16. Relationship With Future API Endpoints

Future API endpoints may call helpers only after separate API planning.

The registry must not bypass authentication, read/write permissions, approval boundaries, or route-level validation. Endpoint implementation must be separately approved.

## 17. Relationship With Future Approval Workflow

The registry can state which helpers require human review.

The registry must not approve anything, reject anything, change approval status, or execute approval workflow. Approval workflow planning must remain separate.

## 18. Relationship With Future AI Provider / Model Gateway

The registry is not an AI model router.

No helper should call OpenAI or other models through the registry. AI Provider / Model Gateway integration must remain a separate future layer.

## 19. Testing Expectations For Future Registry Implementation

Future tests should verify:

- Registry exports metadata only.
- Registry does not call helpers during import.
- Registry returns helper references safely.
- All helpers have forbidden actions disabled.
- Unknown domain returns safe fallback or `null`.
- No side effects.
- No mutation.
- No API/network calls.

## 20. Recommended Implementation Sequence

1. Accept this registry plan.
2. Create a review-only readiness task.
3. Implement registry metadata only.
4. Add tests.
5. Do not wire registry to API/UI yet.
6. Review the implementation.
7. Write usage examples.

## 21. Candidate Future Implementation Files

Possible future files:

- `lib/services/orchestration/review-summary-registry.js`
- `lib/services/orchestration/index.js`
- `tests/review-summary-registry.test.js`
- `tests/orchestration-index.test.js`

These files are suggestions only and should not be created until a separate implementation task is approved.

## 22. Files That Should Remain Forbidden During First Implementation

The first registry implementation should not touch:

- `api/*`
- `supabase/migrations/*`
- `admin/*`
- `package.json`
- OpenAI/Gmail/WhatsApp code
- quotation/PI/order/payment/shipment/production code

## 23. Recommended Next Task

Recommended next task:

- Service Orchestration Helpers Registry Plan Readiness Review

If approved after review, the next implementation task should be:

- Add Pure Review Summary Registry Metadata

## 24. Final Recommendation

The registry should be implemented only as metadata/discovery first, with no API, UI, schema, external integration, approval execution, or business-action integration.
