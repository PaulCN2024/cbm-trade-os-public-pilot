# Phase 0B Communication Review Summary Usage Examples

## 1. Purpose

This document shows safe usage examples for `prepareCommunicationReviewSummary`.

It explains how the helper should be used in future service orchestration, admin display, communication review, and attachment review flows without turning review preparation into execution.

## 2. Helper Status

`prepareCommunicationReviewSummary` is implemented as a pure local helper.

It:

- combines `normalizeCommunicationInput` and `classifyCommunicationInput`
- returns a communication review summary only
- does not send, save, create task, approve, upload files, archive files, or call external systems
- does not call API routes, databases, Supabase, OpenAI, AI Gateway, Gmail, or WhatsApp
- does not perform quotation, PI, order, payment, shipment, or production actions

## 3. Core Safety Rule

`prepareCommunicationReviewSummary` may prepare review information, but it must never be treated as permission to send messages, auto-reply, create tasks, upload/archive/promote files, approve communications, quote, create PI, confirm order, confirm payment, confirm production, or confirm shipment.

The helper output is advisory and display-oriented.

## 4. Standard Safe Flow

1. Receive raw communication input.
2. Call `prepareCommunicationReviewSummary(rawCommunicationInput, context, options)`.
3. Show the summary to the operator.
4. Operator reviews channel, direction, status, attachments, and warnings.
5. Do not send automatically.
6. Do not auto-reply.
7. Do not create tasks.
8. Do not write to database unless a future approved workflow explicitly adds persistence.

## 5. Example 1: Inbound Customer Email Without Sensitive Content

Conceptual input:

```js
{
  direction: "inbound",
  channel: "email",
  subject: "Project photos",
  body: "Please see the general project information below."
}
```

Expected review summary:

- `communication_only`: `true`
- `can_send`: `false`
- `can_auto_reply`: `false`
- `can_create_task`: `false`
- `review_required` may be `false` if no sensitive content is detected
- operator action: review and optionally decide the next manual step

Even low-risk communication output must remain display/review information only.

## 6. Example 2: Customer Message Mentioning Price Or Delivery

Conceptual input:

```js
{
  direction: "inbound",
  channel: "email",
  subject: "Price and delivery",
  body: "Please confirm final price and delivery lead time."
}
```

Expected review summary:

- sensitive communication warning
- `review_required`: `true`
- `needs_human_review`: `true`
- `can_send`: `false`
- no quotation commitment
- no delivery commitment

The helper may help surface risk, but it must not confirm price or delivery.

## 7. Example 3: Supplier Quote Attachment

Conceptual input:

```js
{
  direction: "inbound",
  channel: "email",
  attachment_name: "factory_quote_aluminum.xlsx",
  body: "Supplier offer attached."
}
```

Expected review summary:

- `attachment_summary` identifies `supplier_quote` if classifier supports it
- `review_required`: `true`
- no supplier quote acceptance
- no customer quotation generation
- no pricing commitment

Supplier quote review remains manual until a future approved workflow is defined.

## 8. Example 4: Payment Slip Or Invoice Attachment

Conceptual input:

```js
{
  direction: "inbound",
  channel: "whatsapp",
  attachment_name: "payment_slip_receipt.pdf",
  body: "Payment slip attached."
}
```

Expected review summary:

- attachment is review-required
- no payment confirmation
- no finance action
- no receipt confirmation
- operator must review manually

Payment-related attachments must not trigger finance or customer-facing actions.

## 9. Example 5: Unknown Attachment

Conceptual input:

```js
{
  direction: "inbound",
  channel: "email",
  attachment_name: "customer_file.bin",
  body: "Please check this file."
}
```

Expected review summary:

- unknown or `other` attachment warning
- `review_required`: `true`
- `attachment_summary` is display-only
- no file upload
- no file archive
- no Document Center promotion

The operator should inspect unknown files manually before linking or using them.

## 10. Example 6: Complaint Or Compensation Wording

Conceptual input:

```js
{
  direction: "inbound",
  channel: "email",
  subject: "Complaint",
  body: "The goods are damaged. Please confirm compensation."
}
```

Expected review summary:

- sensitive communication warning
- human review required
- no responsibility admission
- no compensation commitment
- no automatic reply

Quality responsibility and compensation topics must remain manually reviewed.

## 11. Example 7: Drawing, Product Spec, Or Certificate Attachment

Conceptual input:

```js
{
  direction: "inbound",
  channel: "email",
  attachment_name: "curtain_wall_drawing.dwg",
  body: "Please check this drawing."
}
```

Expected review summary:

- review-required or at least operator review recommended
- no automatic technical confirmation
- no production feasibility confirmation
- no delivery commitment
- no quality commitment

Technical attachments may affect quotation, production, or quality responsibility, so they should stay review-first.

## 12. Example 8: Internal Manual Note

Conceptual input:

```js
{
  direction: "internal",
  channel: "manual_note",
  body: "Internal note for later customer follow-up."
}
```

Expected review summary:

- may be low risk
- `communication_only`: `true`
- `can_send`: `false`
- `can_auto_reply`: `false`
- `can_create_task`: `false`
- internal display only

The helper must not turn internal notes into tasks or outbound communication.

## 13. Display-Only Usage In Admin UI

Future admin UI may display:

- `normalized_communication`
- `channel`
- `direction`
- `visibility`
- `status`
- `attachment_summary`
- `warnings`
- `recommended_operator_action`

UI display must:

- not mutate payloads
- not expose send buttons from this helper alone
- not expose reply buttons from this helper alone
- not expose task creation buttons from this helper alone
- not treat the summary as a saved communication record
- map Chinese display labels separately when needed

## 14. Future Service Orchestration Usage

Another orchestration helper may call `prepareCommunicationReviewSummary` as one local step.

Future API endpoints may call it only after separate API planning.

Future database persistence may happen only after schema and approval workflow planning.

External channel sending requires separate Gmail or WhatsApp planning and a human approval gate.

Task creation requires separate task workflow planning.

## 15. Fields Safe To Display

These fields are safe to display as review information:

- `normalized_communication`
- `classification`
- `attachment_summary`
- `sensitivity_flags`
- `direction`
- `channel`
- `visibility`
- `status`
- `warnings`
- `needs_human_review`
- `review_required`
- `recommended_operator_action`
- `communication_only`
- `can_send`
- `can_auto_reply`
- `can_create_task`
- `audit_note_candidate`

Display does not imply execution, persistence, sending, or approval.

## 16. Fields That Must Not Be Misinterpreted

- `communication_only` does not mean saved communication.
- `can_create_task: false` means no task should be created.
- `audit_note_candidate` does not mean an audit log has been written.
- `attachment_summary` does not mean a file has been uploaded, archived, promoted, or verified.
- `normalized_communication` does not mean a record has been saved.
- `recommended_operator_action` is advisory only.

## 17. What This Helper Must Never Trigger

`prepareCommunicationReviewSummary` must never trigger:

- database write
- API write
- send email
- send WhatsApp
- auto-reply
- task creation
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

- The current helper uses existing classifier output.
- The current classifier may not produce `risk_level` or `action_boundary`.
- The helper uses conservative `review_required` booleans instead.
- Warnings may include fallback or missing attachment information.
- Future UI may need warning display polish.
- There is no schema, API, or UI integration yet.

## 19. Future Tests Or Review Ideas

Possible future checks:

- display adapter usage
- Chinese label mapping
- sensitive attachment display
- blocked or high-risk communication display
- no mutation
- no side effects
- warning deduplication at the display layer

## 20. Recommended Next Task

Recommended next task:

- Communication Review Summary Usage Examples Readiness Review

Then choose one narrow planning review:

- `prepareInquiryReviewSummary` readiness review
- Service Orchestration Helpers Index / Registry planning

Do not move directly into schema, API, UI write actions, external channels, or AI model integration.

## 21. Final Recommendation

`prepareCommunicationReviewSummary` is safe for future display and review orchestration only.

It is not an execution helper. It must not be used to send, auto-reply, create tasks, upload/archive/promote files, approve communications, quote, create PI, confirm order, confirm payment, confirm production, or confirm shipment.
