# Phase 0B AI Draft Review Summary Usage Examples

## 1. Purpose

This document shows safe usage examples for `prepareAiDraftReviewSummary`.

It explains how the helper should be used in future service orchestration, admin display, and operator review flows without turning review preparation into execution.

## 2. Helper Status

`prepareAiDraftReviewSummary` is implemented as a pure local helper.

It:

- combines `normalizeAiDraftInput` and `classifyAiDraftSafety`
- returns a review summary only
- does not send, approve, save, write, or call external systems
- does not call API routes, databases, Supabase, OpenAI, AI Gateway, Gmail, or WhatsApp
- does not perform quotation, PI, order, payment, shipment, or production actions

## 3. Core Safety Rule

`prepareAiDraftReviewSummary` may prepare review information, but it must never be treated as permission to send, approve, quote, create PI, confirm order, confirm payment, confirm production, or confirm shipment.

The helper output is advisory and display-oriented.

## 4. Standard Safe Flow

1. Receive raw draft input.
2. Call `prepareAiDraftReviewSummary(rawDraftInput, context, options)`.
3. Show the summary to the operator.
4. Operator reviews warnings, `risk_level`, and `action_boundary`.
5. Do not send automatically.
6. Do not approve automatically.
7. Do not write to database unless a future approved workflow explicitly adds persistence.

## 5. Example 1: Low-Risk Internal Note

Conceptual input:

```js
{
  draft_type: "internal_note_draft",
  task_type: "document_summary",
  risk_level: "low",
  action_boundary: "auto_allowed",
  content: "Summarize internal project notes for later review."
}
```

Expected review summary:

- `draft_only`: `true`
- `can_send`: `false`
- `can_auto_approve`: `false`
- `action_boundary` may be `auto_allowed` only for internal preparation
- operator action: review internally

`auto_allowed` does not mean the result can be sent or approved.

## 6. Example 2: Customer Reply Mentioning Price

Conceptual input:

```js
{
  draft_type: "customer_reply_draft",
  task_type: "communication_summary",
  content: "Reply to the customer with updated unit price and FOB total amount."
}
```

Expected review summary:

- price sensitivity flag
- `approval_required`: `true`
- `needs_human_review`: `true`
- `can_send`: `false`
- recommended operator action requires review before external use

The helper must not confirm price or send the reply.

## 7. Example 3: Supplier RFQ Draft

Conceptual input:

```js
{
  draft_type: "supplier_rfq_draft",
  task_type: "supplier_rfq_generation",
  target_channel: "email",
  content: "Draft an email asking a supplier for aluminum profile pricing."
}
```

Expected review summary:

- external-facing draft
- `action_boundary`: `review_required`
- `can_send`: `false`
- no supplier sending
- operator must approve manually before any future channel use

## 8. Example 4: Quotation Or PI Wording

Conceptual input:

```js
{
  draft_type: "quotation_draft",
  task_type: "quotation_generation",
  content: "Prepare quotation and PI wording for customer review."
}
```

Expected review summary:

- quotation or PI sensitivity
- high risk or `review_required`
- `approval_required`: `true`
- no official quotation generation
- no official PI generation
- no business commitment

## 9. Example 5: Finance Or Permission Related Content

Conceptual input:

```js
{
  draft_type: "internal_note_draft",
  task_type: "customer_summary",
  content: "Summarize profit margin and admin role permission changes."
}
```

Expected review summary:

- blocked or review-required based on classifier
- senior review required
- `can_send`: `false`
- `can_auto_approve`: `false`

Finance and permission topics must not be executed through this helper.

## 10. Example 6: Quality Complaint Or Compensation Wording

Conceptual input:

```js
{
  draft_type: "customer_reply_draft",
  task_type: "communication_summary",
  content: "Reply to the complaint and mention compensation for quality defects."
}
```

Expected review summary:

- quality, complaint, or compensation risk flags
- human review required
- no responsibility admission
- no compensation commitment
- `can_send`: `false`

## 11. Example 7: Manufacturing Capability Wording

Conceptual input:

```js
{
  draft_type: "customer_reply_draft",
  task_type: "communication_summary",
  content: "Tell the customer we can produce and deliver the profiles next week."
}
```

Expected review summary:

- review before any customer-facing text
- no production feasibility confirmation
- no delivery commitment
- no supplier commitment
- no quotation, PI, or order commitment
- `can_send`: `false`

## 12. Display-Only Usage In Admin UI

Future admin UI may display:

- `normalized_draft`
- `risk_level`
- `action_boundary`
- `warnings`
- `recommended_operator_action`
- `sensitivity_flags`
- `audit_note_candidate`

UI display must:

- not mutate payloads
- not expose send buttons from this helper alone
- not expose approve buttons from this helper alone
- not treat the summary as a saved record
- map Chinese display labels separately when needed

## 13. Future Service Orchestration Usage

Another orchestration helper may call `prepareAiDraftReviewSummary` as one local step.

Future API endpoints may call it only after separate API planning.

Future database persistence may happen only after schema and approval workflow planning.

External channel sending requires separate Gmail or WhatsApp planning and a human approval gate.

## 14. Fields Safe To Display

These fields are safe to display as review information:

- `risk_level`
- `action_boundary`
- `approval_required`
- `needs_human_review`
- `sensitivity_flags`
- `warnings`
- `recommended_operator_action`
- `audit_note_candidate`
- `draft_only`
- `can_send`
- `can_auto_approve`

Display does not imply execution.

## 15. Fields That Must Not Be Misinterpreted

- `auto_allowed` does not mean send allowed.
- Low risk does not mean external approval is skipped.
- `audit_note_candidate` does not mean an audit log has been written.
- `normalized_draft` does not mean a record has been saved.
- `recommended_operator_action` is advisory only.

## 16. What This Helper Must Never Trigger

`prepareAiDraftReviewSummary` must never trigger:

- database write
- API write
- send email
- send WhatsApp
- OpenAI call
- AI Gateway call
- approval execution
- official quotation
- official PI
- order confirmation
- payment action
- shipment action
- production confirmation

## 17. Future Tests Or Review Ideas

Possible future checks:

- display adapter usage
- Chinese label mapping
- blocked action display
- high-risk warning display
- no mutation
- no side effects
- no send or approve controls created from helper output alone

## 18. Recommended Next Task

Recommended next task:

- Service Orchestration Usage Examples Readiness Review

Then choose one narrow planning review:

- `prepareCommunicationReviewSummary` planning review
- `prepareInquiryReviewSummary` planning review

Do not move directly into schema, API, UI write actions, external channels, or AI model integration.

## 19. Final Recommendation

`prepareAiDraftReviewSummary` is safe for future display and review orchestration only.

It is not an execution helper. It must not be used to send, approve, save, quote, create PI, confirm order, confirm payment, confirm production, or confirm shipment.
