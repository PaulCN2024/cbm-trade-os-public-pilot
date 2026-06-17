# Phase 0B Admin UI Display Adapter Wiring Plan

## 1. Title

Phase 0B Admin UI Display Adapter Wiring Plan

## 2. Purpose

This document plans how completed Phase 0B display adapter view models can later be shown in the localized read-only Admin UI without adding write actions, API changes, schema changes, or business execution.

This is planning only. It does not implement Admin UI wiring and does not change adapter, helper, registry, API, schema, or business logic.

## 3. Current Status

Current project status:

- Full product vision progress: 24%
- Internal MVP / foundation progress: 51%
- Current phase: Phase 0B - Display Adapter Layer Frozen
- Next stage: Admin UI Display Adapter Wiring Planning
- Progress tracker: `docs/PROJECT_PROGRESS.md`

The system is still early overall because schema/API/write workflows, external AI/channel integration, and business execution are not implemented.

## 4. Completed Prerequisites

Completed prerequisites:

- localized read-only Admin UI foundation
- Phase 0B review summary helpers
- review summary helper registry
- display adapter layer
- browser preview / layout polish

These foundations are useful, but they do not create permission for write actions or business execution.

## 5. Display Adapters Available

### 5.1 `registryMetadataDisplayAdapter`

Input type:
Registry metadata or domain key.

Output view model:
Read-only metadata display model with title, subtitle, badges, summary rows, warning rows, safety rows, disabled capabilities, technical details, and raw reference.

Safe usage:
Show helper registry metadata and safety rules for operators.

What it must never trigger:
Helper execution, API calls, writes, task creation, approval, sending, quote, PI, order, payment, production, or shipment actions.

### 5.2 `aiDraftReviewDisplayAdapter`

Input type:
Already-created `prepareAiDraftReviewSummary` output.

Output view model:
Read-only AI Draft review display model with risk, action boundary, warning, disabled capability, recommended operator action, and technical details.

Safe usage:
Show draft-only review state for future operator review panels.

What it must never trigger:
AI calls, send actions, approval execution, auto approval, customer message, quotation, PI, order, payment, production, or shipment actions.

### 5.3 `communicationReviewDisplayAdapter`

Input type:
Already-created `prepareCommunicationReviewSummary` output.

Output view model:
Read-only Communication review display model with channel/direction, warnings, attachment rows, disabled capabilities, and technical details.

Safe usage:
Show communication/attachment review information.

What it must never trigger:
Sending, auto-reply, task creation, upload, archive, Document Center promotion, approval, quotation, PI, order, payment, production, or shipment actions.

### 5.4 `inquiryReviewDisplayAdapter`

Input type:
Already-created `prepareInquiryReviewSummary` output.

Output view model:
Read-only Inquiry review display model with inquiry rows, missing info rows, risk flag rows, nested review models, disabled capabilities, and technical details.

Safe usage:
Show inquiry review status and nested display-only Communication / AI Draft panels.

What it must never trigger:
Helper execution, message sending, task creation, numbering/code generation, approval, quotation, PI, order, payment, production, shipment, or business commitment.

## 6. Core Wiring Principle

Admin UI wiring must consume display-only view models.

Admin UI must not call API writes, mutate payloads, send messages, approve drafts, create tasks, generate quotations, create PI, create orders, trigger payment, production, or shipment.

Display adapter output is view data, not workflow permission.

## 7. Display Adapter Wiring Rules

Future UI wiring must follow these rules:

- UI may render view model fields only.
- UI must not expose disabled capabilities as clickable controls.
- UI must not convert `nestedReviewModels` into actions.
- UI must not mutate `rawReference`.
- UI must not execute helper functions unless separately planned and approved.
- UI must not import server-only modules into browser code if unsafe.
- UI must preserve English internal keys and technical values.
- UI should use Chinese operator-facing labels.

## 8. Current Admin UI Constraints

Current Admin UI constraints:

- `admin/ui-foundation` is currently a localized read-only shell.
- `app.js` is browser-oriented.
- Existing sections use fallback/static preview behavior when API is unavailable.
- Previous UI localization was done section-by-section.
- No write actions should be added.

The first wiring step should respect this lightweight browser-oriented structure.

## 9. Candidate Wiring Targets

### A. Registry Metadata Preview Panel

Value:
Shows available review helpers, allowed/forbidden use, safety flags, and disabled capabilities.

Risk level:
Lowest.

Required data:
Static registry display models or browser-safe preview data.

Likely UI location:
AI Drafts area, a small dedicated "复核助手" preview card, or an existing review panel if strictly safe.

Why it should be first:
Registry metadata is stable, does not need live helper output, does not need API/schema, and can prove the display view model pattern safely.

### B. AI Draft Review Display Preview

Value:
Shows draft-only / approval-required safety state.

Risk level:
Low to medium.

Required data:
Example AI Draft review summary output.

Likely UI location:
AI Drafts read-only section.

Why it should not be first:
It is closer to real review output and may be mistaken as live AI workflow if not clearly marked as static preview.

### C. Communication Review Display Preview

Value:
Shows communication, attachment, sensitivity, and disabled reply/task actions.

Risk level:
Medium.

Required data:
Example Communication review summary output.

Likely UI location:
Future Communication/Attachment review area or read-only preview panel.

Why it should not be first:
Communication and attachment topics can be confused with message sending, task creation, file upload, or Document Center promotion.

### D. Inquiry Review Display Preview

Value:
Shows inquiry review, missing information, risk flags, and nested review models.

Risk level:
Medium.

Required data:
Example Inquiry review summary output with nested display models.

Likely UI location:
Inquiry Center or dedicated helper preview area.

Why it should not be first:
It has the broadest business surface: inquiry, communication, AI draft, quotation, PI, order, production, and shipment safety boundaries.

## 10. Recommended First Wiring Target

Recommended first target:

- Registry metadata preview panel

Why:

- metadata is stable
- no live helper output required
- no API required
- no schema required
- no business action
- can prove UI rendering pattern safely
- lower risk than live AI Draft / Communication / Inquiry review display

## 11. First Wiring Implementation Concept

Future implementation concept only:

- create a read-only panel in `admin/ui-foundation`
- show registry display models from `registryMetadataDisplayAdapter`
- show domain, label, description, `forbiddenUse`, `safetyFlags`, and `disabledCapabilities`
- no helper execution
- no API calls
- no write actions
- no buttons for execution

The implementation should be small, reversible, and clearly marked as preview/read-only.

## 12. Data Source Decision

Possible data source options:

### A. Static Mock Display Models Copied From Adapter Output

Safest for the first browser preview. It avoids module compatibility risk and avoids importing CommonJS/server-oriented files into browser code.

### B. Browser-Safe Local Display Model Data

Acceptable if kept as static local preview data and clearly marked as preview-only.

### C. Direct Adapter Output Import Later

Possible only if architecture supports it safely. This may require bundling or module strategy decisions and should not be introduced just for the first wiring.

Preferred first step:

- use static display-preview data
- do not directly import display adapter modules if browser/CommonJS compatibility is unclear
- do not introduce bundling or module changes for the first wiring task

## 13. UI Placement Recommendation

Possible locations:

- existing AI Drafts area
- a new read-only "复核助手" preview card if minimal
- existing review panel if strictly safe

Preferred placement:

- a small read-only preview card inside AI Drafts or a dedicated read-only helper preview section, whichever requires the smallest UI diff

The preview should be clearly marked as static and read-only.

## 14. What Should Remain Untouched

Future UI wiring should leave these untouched:

- API calls
- data loading
- existing customers/inquiries/products/companies/capabilities logic
- schema
- `package.json`
- tests unless future implementation specifically adds UI tests
- external integrations
- business logic

## 15. Safety Copy Requirements

Future UI should clearly show:

- `仅预览`
- `只读`
- `不执行助手`
- `不发送`
- `不审批`
- `不创建任务`
- `不生成报价 / PI / 订单`
- `不触发付款 / 生产 / 发货`

These labels must be visible enough that operators do not mistake preview data for executable workflow.

## 16. Browser Preview Requirements

Future implementation must:

- run local browser preview
- check no console errors
- check no horizontal overflow
- check Chinese labels are readable
- check disabled capabilities are not shown as active buttons
- check no write actions appear

Browser preview should be treated as required evidence after any UI wiring task.

## 17. Future Implementation Allowed Files

For the first wiring implementation, recommend allowing only:

- `admin/ui-foundation/app.js`
- `admin/ui-foundation/styles.css`

Do not allow:

- `admin/ui-foundation/index.html` unless absolutely required and separately approved
- API files
- schema files
- `package.json`
- `lib/services` files

## 18. Future Implementation Forbidden Changes

Forbidden changes:

- no API route changes
- no schema migrations
- no package changes
- no helper/adapter modifications
- no Gmail/WhatsApp/OpenAI
- no sending
- no approval execution
- no quotation/PI/order/payment/shipment/production

## 19. Test And Review Expectations

For future implementation:

- `npm test` should pass if safe
- browser preview should be performed
- final review should confirm read-only behavior
- no console errors
- no layout regression
- no business action

If tests are not relevant to a UI-only preview task, the reason should be clearly reported.

## 20. Rollback Plan

Rollback should remain simple:

- keep implementation small
- one commit only
- revert single commit if UI preview fails
- no data changes involved
- no API/schema rollback needed

## 21. Recommended Next Tasks

1. Admin UI Display Adapter Wiring Plan Readiness Review
2. Registry Metadata Read-only UI Preview Implementation
3. Registry Metadata UI Preview Sanity Review
4. Browser preview verification
5. Update project progress after successful UI preview

## 22. What Should NOT Happen Next

Do not proceed directly to:

- schema/API work
- real helper execution in UI
- live review summary persistence
- AI Gateway/OpenAI integration
- Gmail/WhatsApp sending
- approval workflow execution
- quote/PI/order/payment/shipment/production flow

## 23. Final Recommendation

Admin UI Display Adapter Wiring should begin only with a static/read-only registry metadata preview.

It should not begin with live business review output, helper execution, persistence, API integration, AI integration, external channel integration, or any write/business action.
