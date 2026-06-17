# Phase 0B Communication Review Display Adapter Usage Examples

## 1. Title

Phase 0B Communication Review Display Adapter Usage Examples

## 2. Purpose

This document shows safe usage examples for `communicationReviewDisplayAdapter`.

The adapter transforms an already-created `prepareCommunicationReviewSummary` output into a display-only view model for future localized Admin UI planning.

## 3. Adapter Status

`communicationReviewDisplayAdapter` is implemented as a pure display mapper.

It:

- accepts already-created `prepareCommunicationReviewSummary` output
- returns a display-only view model
- does not call `prepareCommunicationReviewSummary`
- does not execute helper functions
- does not call API, DB, AI, email, WhatsApp, or business actions
- is not wired to Admin UI yet

## 4. Core Safety Rule

`communicationReviewDisplayAdapter` may prepare display models, but it must never be treated as permission to send, auto-reply, create task, upload/archive/promote file, approve, quote, create PI, create order, trigger payment, production, or shipment.

## 5. Standard Safe Flow

1. `prepareCommunicationReviewSummary` is called elsewhere in an approved orchestration layer.
2. `communicationReviewDisplayAdapter` receives the review summary object.
3. The adapter maps it into `title`, `badges`, `summaryRows`, `warningRows`, `safetyRows`, `attachmentRows`, `disabledCapabilities`, `recommendedOperatorAction`, and `technicalDetails`.
4. UI may later display the view model after separate UI wiring planning.
5. The adapter itself does not execute anything.

## 6. Example 1: Normal Inbound Customer Email

Expected display:

- `title`: `沟通复核`
- direction and channel labels in Chinese if mapped
- badge: `仅沟通复核`
- `disabledCapabilities` include `can_send`, `can_auto_reply`, and `can_create_task`
- no send, reply, or task action is exposed

Even normal inbound communication remains review/display information only.

## 7. Example 2: Customer Message Mentioning Price Or Delivery

Expected display:

- `warningRows` show sensitive communication warnings
- `review_required` or `needs_human_review` is displayed clearly
- `disabledCapabilities` remain visible
- no quotation or delivery commitment is implied

The display model may help operators notice risk, but it must not confirm price or delivery.

## 8. Example 3: Supplier Quote Attachment

Expected display:

- `attachmentRows` show supplier quote attachment type if available
- `attachment_summary` remains display-only
- no supplier quote acceptance action appears
- no customer quotation generation action appears

Supplier quote information must remain review-first and manual.

## 9. Example 4: Payment Slip Or Invoice Attachment

Expected display:

- `attachmentRows` show payment or invoice-related information
- `warningRows` show review-required warnings
- no payment confirmation
- no finance action
- no receipt confirmation

Payment-related attachments require human review before any finance or customer-facing action.

## 10. Example 5: Unknown Attachment

Expected display:

- `attachmentRows` show unknown or other attachment type
- `warningRows` recommend manual review
- no file upload, archive, or promotion action appears

Unknown files should be inspected manually before any future linking or storage workflow.

## 11. Example 6: Complaint Or Compensation Wording

Expected display:

- `warningRows` show complaint or compensation sensitivity
- `recommendedOperatorAction` remains advisory
- no responsibility admission
- no compensation commitment
- no auto-reply action

Quality responsibility and compensation topics must remain manually reviewed.

## 12. Example 7: Drawing, Product Spec, Or Certificate Attachment

Expected display:

- `attachmentRows` show type and confidence if available
- no technical confirmation
- no production feasibility confirmation
- no delivery or quality commitment

Technical attachments may affect quotation, production, delivery, or quality responsibility, so display remains review-only.

## 13. Example 8: Invalid Or Missing Review Summary

Expected display:

- safe fallback title: `沟通复核`
- subtitle says no usable communication review summary was found
- `warningRows` include a prompt to check input
- `disabledCapabilities` include `can_send`, `can_auto_reply`, and `can_create_task`
- no executable action appears

Fallback handling must fail closed.

## 14. Fields Safe To Display

Safe display fields:

- `title`
- `subtitle`
- `badges`
- `summaryRows`
- `warningRows`
- `safetyRows`
- `attachmentRows`
- `disabledCapabilities`
- `recommendedOperatorAction`
- `technicalDetails`
- `rawReference`

## 15. Attachment Fields Safe To Display

Safe attachment display fields:

- `attachment_type`
- `confidence`
- `warnings`
- `needs_human_review`
- `requires_review`

These fields do not create file handling actions.

## 16. Technical Values To Preserve

Technical values should remain available for inspection:

- `direction`
- `channel`
- `visibility`
- `status`
- `sensitivity_flags`
- `review_required`
- `needs_human_review`
- `communication_only`
- `can_send`
- `can_auto_reply`
- `can_create_task`
- `helperReference: not executed by display adapter`

These values remain English internal keys.

## 17. Fields That Must Not Be Misinterpreted

- View model does not mean communication was saved.
- `attachmentRows` do not mean file was uploaded or archived.
- `recommendedOperatorAction` is advisory only.
- `can_create_task: false` means task must not be created from this adapter.
- `rawReference` does not mean payload can be mutated.
- `disabledCapabilities` are not available actions.

## 18. What This Adapter Must Never Trigger

This adapter must never trigger:

- helper execution
- API call
- database write
- Admin UI write
- send email
- send WhatsApp
- auto-reply
- task creation
- numbering/code reservation
- file upload
- file archive
- Document Center promotion
- OpenAI call
- approval execution
- official quotation
- official PI
- order confirmation
- payment action
- shipment action
- production confirmation

## 19. Relationship With `prepareCommunicationReviewSummary`

`prepareCommunicationReviewSummary` prepares the safety review summary.

`communicationReviewDisplayAdapter` maps that summary to a display view model.

Orchestration and display remain separated. The adapter must not call the helper internally.

## 20. Relationship With Future Admin UI

Admin UI may later consume display models only after a separate UI wiring plan.

This adapter alone does not change UI. UI wiring must remain read-only unless separately approved.

Future UI must not expose send, reply, create-task, upload, or archive buttons from adapter output alone.

## 21. Chinese Label Notes

- Operator-facing display uses Chinese labels.
- Internal technical keys remain English.
- Attachment labels are display-only.
- Disabled capabilities should be visually grouped as unavailable or disabled to avoid misunderstanding.

## 22. Known Current Limitations

- Adapter only covers Communication review summary.
- No live Admin UI wiring exists.
- No browser rendering exists yet.
- No schema/API integration exists.
- No persistence exists.
- Future UI polish may improve capability wording such as `不可用` or `已禁用`.
- Warning deduplication may be needed at display layer.

## 23. Future Tests Or Review Ideas

Future tests or reviews may cover:

- browser display preview
- Chinese wording polish
- blocked or sensitive communication display
- `attachmentRows` display
- disabled capabilities display
- no helper execution after future UI wiring
- no mutation after UI wiring

## 24. Recommended Next Task

Recommended next task:

- Communication Review Display Adapter Usage Examples Readiness Review

Then consider:

- Inquiry Review Display Adapter Readiness Review
- Display Adapter Layer Checkpoint after Inquiry adapter

## 25. Final Recommendation

`communicationReviewDisplayAdapter` is safe for future read-only display planning only.

It must not be used for execution, Admin UI wiring, sending, auto-reply, task creation, file handling, approval, quotation, PI, order, payment, shipment, or production actions.
