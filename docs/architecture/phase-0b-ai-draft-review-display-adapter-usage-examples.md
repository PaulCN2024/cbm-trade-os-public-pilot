# Phase 0B AI Draft Review Display Adapter Usage Examples

## 1. Title

Phase 0B AI Draft Review Display Adapter Usage Examples

## 2. Purpose

This document shows safe usage examples for `aiDraftReviewDisplayAdapter`.

The adapter transforms an already-created `prepareAiDraftReviewSummary` output object into a display-only view model for future localized Admin UI planning.

## 3. Adapter Status

`aiDraftReviewDisplayAdapter` is implemented as a pure display mapper.

It:

- accepts already-created `prepareAiDraftReviewSummary` output
- returns a display-only view model
- does not call `prepareAiDraftReviewSummary`
- does not execute helper functions
- does not call API, DB, AI, email, WhatsApp, or business actions
- is not wired to Admin UI yet

## 4. Core Safety Rule

`aiDraftReviewDisplayAdapter` may prepare display models, but it must never be treated as permission to send, approve, reject, create task, quote, create PI, create order, trigger payment, production, or shipment.

## 5. Standard Safe Flow

1. `prepareAiDraftReviewSummary` is called elsewhere in an approved orchestration layer.
2. `aiDraftReviewDisplayAdapter` receives the review summary object.
3. The adapter maps it into `title`, `badges`, `summaryRows`, `warningRows`, `safetyRows`, `disabledCapabilities`, `recommendedOperatorAction`, and `technicalDetails`.
4. UI may later display the view model after separate UI wiring planning.
5. The adapter itself does not execute anything.

## 6. Example 1: Low-Risk Internal Note Summary

Expected display:

- `title`: `AI 草稿复核`
- badge: `仅草稿`
- `disabledCapabilities` include `can_send` and `can_auto_approve`
- `recommendedOperatorAction` remains advisory
- no send or approve action is exposed

`auto_allowed` may appear only as internal preparation context. It must not be shown as permission to send or approve.

## 7. Example 2: Customer Reply Mentioning Price

Expected display:

- risk level shown with Chinese label
- `approval_required` shown clearly
- `needs_human_review` shown clearly
- `warningRows` show price-related warnings
- `disabledCapabilities` show cannot send and cannot auto approve

The display model must not confirm price or expose a send action.

## 8. Example 3: Delivery Or Payment Sensitive Draft

Expected display:

- warnings are visible
- action boundary is shown
- `technicalDetails` preserve original risk and action values
- no customer-facing action is enabled

Delivery and payment wording must remain review-only.

## 9. Example 4: Quotation Or PI Wording

Expected display:

- quotation or PI risk is visible
- `approval_required` is visible
- no official quotation or PI action appears
- no business commitment is implied

The adapter output may help an operator review the draft, but it must not create quotation or PI execution paths.

## 10. Example 5: Finance Or Permission Blocked Content

Expected display:

- blocked or review-required state is visible
- `warningRows` show relevant warning
- `recommendedOperatorAction` says review or senior review is required
- `can_send: false` and `can_auto_approve: false` remain visible

Finance and permission content must stay blocked or review-required and must not become an executable workflow.

## 11. Example 6: Invalid Or Missing Review Summary

Expected display:

- safe fallback title: `AI 草稿复核`
- subtitle says no usable review summary was found
- `warningRows` include a prompt to check input
- `disabledCapabilities` still include `can_send` and `can_auto_approve`
- no executable action appears

Fallback handling must fail closed.

## 12. Fields Safe To Display

Safe display fields:

- `title`
- `subtitle`
- `badges`
- `summaryRows`
- `warningRows`
- `safetyRows`
- `disabledCapabilities`
- `recommendedOperatorAction`
- `technicalDetails`
- `rawReference`

## 13. Technical Values To Preserve

Technical values should remain available for inspection:

- `risk_level`
- `action_boundary`
- `approval_required`
- `needs_human_review`
- `draft_only`
- `can_send`
- `can_auto_approve`
- `sensitivity_flags`
- `helperReference: not executed by display adapter`

These values remain English internal keys.

## 14. Fields That Must Not Be Misinterpreted

- View model does not mean draft was saved.
- `recommendedOperatorAction` is advisory only.
- `auto_allowed` does not mean send allowed.
- Low risk does not mean approval can be skipped for external use.
- `rawReference` does not mean payload can be mutated.
- `disabledCapabilities` are not available actions.

## 15. What This Adapter Must Never Trigger

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

## 16. Relationship With `prepareAiDraftReviewSummary`

`prepareAiDraftReviewSummary` prepares the safety review summary.

`aiDraftReviewDisplayAdapter` maps that summary to a display view model.

Orchestration and display remain separated. The adapter must not call the helper internally.

## 17. Relationship With Future Admin UI

Admin UI may later consume display models only after a separate UI wiring plan.

This adapter alone does not change UI. UI wiring must remain read-only unless separately approved.

Future UI must not expose send, approve, or reject buttons from adapter output alone.

## 18. Chinese Label Notes

- Operator-facing display uses Chinese labels.
- Internal technical keys remain English.
- `auto_allowed` should be displayed carefully as internal preparation only, not execution permission.

## 19. Known Current Limitations

- Adapter only covers AI Draft review summary.
- No live Admin UI wiring exists.
- No browser rendering exists yet.
- No schema/API integration exists.
- No persistence exists.
- Future UI polish may improve capability wording such as `不可用` or `已禁用`.

## 20. Future Tests Or Review Ideas

Future tests or reviews may cover:

- browser display preview
- Chinese wording polish
- blocked state display
- disabled capabilities display
- no helper execution after future UI wiring
- no mutation after UI wiring

## 21. Recommended Next Task

Recommended next task:

- AI Draft Review Display Adapter Usage Examples Readiness Review

Then consider:

- Communication Review Display Adapter Readiness Review
- Display Adapter Layer Checkpoint after another adapter

## 22. Final Recommendation

`aiDraftReviewDisplayAdapter` is safe for future read-only display planning only.

It must not be used for execution, Admin UI wiring, sending, approval, task creation, quotation, PI, order, payment, shipment, or production actions.
