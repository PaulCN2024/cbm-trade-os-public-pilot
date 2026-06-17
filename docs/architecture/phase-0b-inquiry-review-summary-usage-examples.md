# Phase 0B Inquiry Review Summary Usage Examples

## 1. Purpose

This document shows safe usage examples for `prepareInquiryReviewSummary`.

It explains how the helper should be used in future service orchestration, admin display, inquiry review, communication review, and AI draft review flows without turning review preparation into execution.

## 2. Helper Status

`prepareInquiryReviewSummary` is implemented as a pure local helper.

It:

- combines `prepareCommunicationReviewSummary` and `prepareAiDraftReviewSummary`
- returns an inquiry review summary only
- does not send, save, create task, approve, generate codes, quote, create PI, confirm order, payment, production, or shipment
- does not call API routes, databases, Supabase, OpenAI, AI Gateway, Gmail, or WhatsApp

## 3. Core Safety Rule

`prepareInquiryReviewSummary` may prepare operator review information, but it must never be treated as permission to send messages, create quotation, create PI, create order, trigger payment, trigger production, trigger shipment, create tasks, approve, or save records.

The helper output is advisory and display-oriented.

## 4. Standard Safe Flow

1. Receive raw inquiry input.
2. Call `prepareInquiryReviewSummary(rawInquiryInput, context, options)`.
3. Review `normalized_inquiry`.
4. Review nested `communication_review_summary`.
5. Review nested `ai_draft_review_summary`.
6. Review `missing_information`, `risk_flags`, and `warnings`.
7. Operator reviews manually.
8. Do not send automatically.
9. Do not create tasks.
10. Do not create quotation, PI, order, payment, shipment, or production actions.
11. Do not write to database unless a future approved workflow explicitly adds persistence.

## 5. Example 1: Simple Inquiry With Product Question

Conceptual input:

```js
{
  inquiry_type: "website",
  message: "We are interested in aluminum profiles for a project.",
  product_category: "aluminum profile"
}
```

Expected review summary:

- `inquiry_only`: `true`
- `can_send`: `false`
- `can_create_quote`: `false`
- `can_create_pi`: `false`
- communication summary may be present
- operator reviews inquiry manually

The helper does not create or save an inquiry record.

## 6. Example 2: Inquiry With Customer Message Mentioning Price Or Delivery

Conceptual input:

```js
{
  original_message: "Please confirm final price and delivery lead time.",
  product_category: "curtain wall"
}
```

Expected review summary:

- nested communication review or AI draft review flags sensitive content
- `review_required`: `true`
- `needs_human_review`: `true`
- no quote commitment
- no delivery commitment
- `can_send`: `false`

Price and delivery language must stay human-reviewed.

## 7. Example 3: Inquiry With Suggested Reply Draft

Conceptual input:

```js
{
  original_message: "Can you quote this profile?",
  suggested_reply: "We can prepare pricing after checking drawings and quantity."
}
```

Expected review summary:

- `ai_draft_review_summary` present
- draft remains draft-only
- `can_send`: `false`
- no auto approval
- operator must review manually

Suggested replies are not sendable output.

## 8. Example 4: Inquiry With Missing Information

Conceptual input:

```js
{
  message: "Need aluminum profile quotation.",
  missing_information: ["drawing", "quantity", "surface treatment"]
}
```

Expected review summary:

- `missing_information` preserved as review/display data
- `review_required`: `true`
- warning added
- no task creation
- no automatic follow-up

Missing information may guide operator review, but it must not create tasks by itself.

## 9. Example 5: Inquiry With Risk Flags

Conceptual input:

```js
{
  message: "Customer asks for urgent shipment.",
  risk_flags: ["delivery_related", "urgent_timeline"]
}
```

Expected review summary:

- `risk_flags` preserved as review/display data
- `review_required`: `true`
- no automatic business action

Risk flags are not final business judgment.

## 10. Example 6: Inquiry With Supplier Quote Or Payment Slip Attachment Reference

Conceptual input:

```js
{
  message: "Please check the attached supplier quote.",
  attachment_name: "factory_quote_aluminum.xlsx"
}
```

Expected review summary:

- `communication_review_summary` may flag attachment risk
- `review_required`: `true`
- no supplier quote acceptance
- no payment confirmation
- no customer quotation generation

Attachment review remains display-only until future schema/API workflows are approved.

## 11. Example 7: Inquiry With Manufacturing Capability Or Delivery Wording

Conceptual input:

```js
{
  original_message: "Can you produce this and deliver next week?"
}
```

Expected review summary:

- `review_required`: `true` if production or delivery language appears
- no production feasibility confirmation
- no delivery time confirmation
- no supplier commitment

Manufacturing capability wording must not become a customer-facing commitment.

## 12. Example 8: Inquiry With Quotation / PI / Order Wording

Conceptual input:

```js
{
  original_message: "Please send quotation, PI, and order confirmation."
}
```

Expected review summary:

- `review_required`: `true`
- no official quotation generated
- no PI generated
- no order confirmation
- no business commitment

Quotation, PI, and order actions require separate approved workflows.

## 13. Display-Only Usage In Admin UI

Future admin UI may display:

- `normalized_inquiry`
- `communication_review_summary`
- `ai_draft_review_summary`
- `missing_information`
- `risk_flags`
- `warnings`
- `recommended_operator_action`

UI display must:

- not mutate payloads
- not expose send buttons from this helper alone
- not expose quote buttons from this helper alone
- not expose PI or order buttons from this helper alone
- not expose task creation buttons from this helper alone
- map Chinese labels separately when needed

## 14. Future Service Orchestration Usage

Another orchestration helper may call `prepareInquiryReviewSummary` as one local step.

Future API endpoints may call it only after separate API planning.

Future database persistence may happen only after schema and approval workflow planning.

External channel sending requires separate Gmail or WhatsApp planning and a human approval gate.

Quotation, PI, and order flows require separate planning and explicit approval.

Numbering should remain deferred until numbering and schema planning are approved.

## 15. Fields Safe To Display

These fields are safe to display as review information:

- `normalized_inquiry`
- `communication_review_summary`
- `ai_draft_review_summary`
- `missing_information`
- `risk_flags`
- `warnings`
- `review_required`
- `needs_human_review`
- `recommended_operator_action`
- `inquiry_only`
- `can_send`
- `can_create_quote`
- `can_create_pi`
- `can_create_order`
- `can_trigger_production`
- `can_trigger_shipment`
- `audit_note_candidate`

Display does not imply execution, persistence, sending, approval, or business commitment.

## 16. Fields That Must Not Be Misinterpreted

- `normalized_inquiry` does not mean saved inquiry.
- `communication_review_summary` does not mean communication was saved or sent.
- `ai_draft_review_summary` does not mean draft can be sent.
- `missing_information` does not mean task was created.
- `risk_flags` do not mean final business judgment.
- `audit_note_candidate` does not mean audit log has been written.
- `can_create_quote: false` means quotation must not be created from this helper.
- No numbering or code suggestion is produced.

## 17. What This Helper Must Never Trigger

`prepareInquiryReviewSummary` must never trigger:

- database write
- API write
- send email
- send WhatsApp
- auto-reply
- task creation
- numbering/code generation
- file upload
- file archive
- Document Center promotion
- OpenAI call
- AI Gateway call
- approval execution
- official quotation
- official PI
- order confirmation
- payment action
- shipment action
- production confirmation

## 18. Known Current Limitations

- The helper supports flexible inquiry input shape only.
- There is no schema integration yet.
- There is no API integration yet.
- There is no UI integration yet.
- There is no numbering integration.
- Nested summaries may duplicate warnings.
- `original_message` may feed both communication and AI draft review.
- `source` is not yet part of `normalized_inquiry` safe fields unless a future task approves it.

## 19. Future Tests Or Review Ideas

Possible future checks:

- display adapter usage
- Chinese label mapping
- nested warning display
- no mutation
- no side effects
- missing information display
- risk flag display
- warning deduplication at display layer
- future schema/API planning

## 20. Recommended Next Task

Recommended next task:

- Inquiry Review Summary Usage Examples Readiness Review

Then choose one narrow planning task:

- Service Orchestration Helpers Registry Planning
- Phase 0B Review Summary Helpers Final Checkpoint

Do not move directly into schema, API, UI write actions, external channels, numbering, or AI model integration.

## 21. Final Recommendation

`prepareInquiryReviewSummary` is safe for future display and review orchestration only.

It is not an execution helper. It must not be used to send, create tasks, generate codes, create quotation, create PI, create order, trigger payment, trigger production, trigger shipment, approve, or save records.
