# Phase 0B Inquiry Review Display Adapter Usage Examples

## 1. Title

Phase 0B Inquiry Review Display Adapter Usage Examples

## 2. Purpose

This document shows safe usage examples for `inquiryReviewDisplayAdapter`.

The adapter transforms an already-created `prepareInquiryReviewSummary` output into a display-only view model for future localized Admin UI planning.

## 3. Adapter Status

`inquiryReviewDisplayAdapter` is implemented as a pure display mapper.

It:

- accepts already-created `prepareInquiryReviewSummary` output
- returns a display-only view model
- does not call `prepareInquiryReviewSummary`
- does not execute helper functions
- may use nested AI Draft and Communication display adapters for display-only nested models
- does not call API, DB, AI, email, WhatsApp, or business actions
- is not wired to Admin UI yet

## 4. Core Safety Rule

`inquiryReviewDisplayAdapter` may prepare display models, but it must never be treated as permission to send, quote, create PI, create order, create task, reserve code, approve, trigger payment, production, or shipment.

## 5. Standard Safe Flow

1. `prepareInquiryReviewSummary` is called elsewhere in an approved orchestration layer.
2. `inquiryReviewDisplayAdapter` receives the review summary object.
3. The adapter maps it into `title`, `badges`, `summaryRows`, `warningRows`, `safetyRows`, `missingInfoRows`, `riskFlagRows`, `nestedReviewModels`, `disabledCapabilities`, `recommendedOperatorAction`, and `technicalDetails`.
4. UI may later display the view model after separate UI wiring planning.
5. The adapter itself does not execute anything.

## 6. Example 1: Simple Product Inquiry

Expected display:

- `title`: `询盘复核`
- `summaryRows` show customer, company, business line, and product category if available
- `disabledCapabilities` include `can_send`, `can_create_quote`, `can_create_pi`, and `can_create_order`
- no quote or order action is exposed

The display model can help an operator understand the inquiry context, but it must not create any commercial action.

## 7. Example 2: Inquiry With Missing Information

Expected display:

- `missingInfoRows` show missing fields
- `review_required` is visible
- warning rows remain visible
- no task creation
- no automatic follow-up action

Missing information may guide operator review, but it must not create tasks by itself.

## 8. Example 3: Inquiry With Risk Flags

Expected display:

- `riskFlagRows` show risk flags
- warnings remain visible
- `needs_human_review` is visible when provided
- risk flags are display-only and not final business judgment

Risk flags should help operators notice possible issues, not replace human decision-making.

## 9. Example 4: Inquiry With Customer Message

Expected display:

- `nestedReviewModels` may include a Communication review display model
- nested Communication model is read-only
- no send, reply, or auto-reply action is exposed
- communication-sensitive warnings remain review information only

Customer message content must remain review-first.

## 10. Example 5: Inquiry With Suggested Reply Draft

Expected display:

- `nestedReviewModels` may include an AI Draft review display model
- nested AI Draft model shows draft-only state
- nested AI Draft model shows cannot send and cannot auto approve
- no approve or send action is exposed

Suggested replies are draft/display content only.

## 11. Example 6: Inquiry Mentioning Price Or Delivery

Expected display:

- warnings and `review_required` are visible
- no quotation action appears
- no delivery commitment is implied
- no customer-facing action is enabled

Price and delivery topics remain human-reviewed.

## 12. Example 7: Inquiry Mentioning Quotation / PI / Order

Expected display:

- `can_create_quote`: `false`
- `can_create_pi`: `false`
- `can_create_order`: `false`
- disabled capabilities are clearly shown
- no business commitment is implied

Quotation, PI, and order actions require separate approved workflows.

## 13. Example 8: Inquiry Mentioning Production Or Shipment

Expected display:

- `can_trigger_production`: `false`
- `can_trigger_shipment`: `false`
- no production feasibility confirmation
- no shipment action
- no supplier or factory commitment is implied

Production and shipment topics must remain manual review topics.

## 14. Example 9: Invalid Or Missing Review Summary

Expected display:

- safe fallback title: `询盘复核`
- subtitle says no usable inquiry review summary was found
- `warningRows` include a prompt to check input
- `disabledCapabilities` include send, quote, PI, order, production, and shipment
- no executable action appears

Fallback handling must fail closed.

## 15. Fields Safe To Display

Safe display fields:

- `title`
- `subtitle`
- `badges`
- `summaryRows`
- `warningRows`
- `safetyRows`
- `missingInfoRows`
- `riskFlagRows`
- `nestedReviewModels`
- `disabledCapabilities`
- `recommendedOperatorAction`
- `technicalDetails`
- `rawReference`

## 16. Nested Review Model Rules

`nestedReviewModels` may contain:

- Communication review display model
- AI Draft review display model

Nested models are display-only. They must not be converted into buttons, actions, helper execution, task creation, approval, send, quote, PI, order, production, or shipment controls.

## 17. Technical Values To Preserve

Technical values should remain available for inspection:

- `inquiry_only`
- `review_required`
- `needs_human_review`
- `can_send`
- `can_create_quote`
- `can_create_pi`
- `can_create_order`
- `can_trigger_production`
- `can_trigger_shipment`
- `helperReference: not executed by display adapter`

These values remain English internal keys.

## 18. Fields That Must Not Be Misinterpreted

- View model does not mean inquiry was saved.
- `missingInfoRows` do not mean task was created.
- `riskFlagRows` do not mean final business judgment.
- `nestedReviewModels` do not mean nested helper was executed by this adapter.
- `disabledCapabilities` are not available actions.
- `rawReference` does not mean payload can be mutated.

## 19. What This Adapter Must Never Trigger

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
- file upload/archive/promotion
- OpenAI call
- approval execution
- official quotation
- official PI
- order confirmation
- payment action
- shipment action
- production confirmation

## 20. Relationship With `prepareInquiryReviewSummary`

`prepareInquiryReviewSummary` prepares the safety review summary.

`inquiryReviewDisplayAdapter` maps that summary to a display view model.

Orchestration and display remain separated. The adapter must not call the helper internally.

## 21. Relationship With Future Admin UI

Admin UI may later consume display models only after a separate UI wiring plan.

This adapter alone does not change UI. UI wiring must remain read-only unless separately approved.

Future UI must not expose send, quote, PI, order, task, production, or shipment buttons from adapter output alone.

## 22. Chinese Label Notes

- Operator-facing display uses Chinese labels.
- Internal technical keys remain English.
- Disabled capabilities should be visually grouped as unavailable or disabled to avoid misunderstanding.
- Chinese display text must not imply commercial commitment.

## 23. Known Current Limitations

- Adapter only covers Inquiry review summary.
- No live Admin UI wiring exists.
- No browser rendering exists yet.
- No schema/API integration exists.
- No persistence exists.
- Future UI polish may improve disabled capability wording.
- Nested warnings may need display-layer deduplication.

## 24. Future Tests Or Review Ideas

Future tests or reviews may cover:

- browser display preview
- Chinese wording polish
- `nestedReviewModels` read-only rendering
- disabled capabilities display
- missing information display
- risk flag display
- no helper execution after future UI wiring
- no mutation after UI wiring

## 25. Recommended Next Task

Recommended next task:

- Inquiry Review Display Adapter Usage Examples Readiness Review

Then consider:

- Phase 0B Display Adapter Layer Final Checkpoint
- Admin UI Display Adapter Wiring Plan

## 26. Final Recommendation

`inquiryReviewDisplayAdapter` is safe for future read-only display planning only.

It is not execution, not persistence, not Admin UI wiring, not approval, and not permission to send, quote, create PI, create order, create task, reserve code, trigger payment, trigger production, or trigger shipment.
