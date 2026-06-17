# Phase 0B Admin Display Adapter Plan

## 1. Title

Phase 0B Admin Display Adapter Plan

## 2. Purpose

This document plans a future display-only adapter layer for the localized Admin UI.

The display adapter layer should transform pure review summary helper outputs and registry metadata into read-only UI view models without changing business logic, API behavior, schema, or safety boundaries.

## 3. What A Display Adapter Is

A display adapter is:

- a pure mapper from raw/helper output to UI display view model
- no side effects
- no API calls
- no database writes
- no helper execution unless explicitly planned
- no business action

It prepares data for display only.

## 4. Why Display Adapters Are Needed

Display adapters are needed because:

- helpers output technical fields
- operators need Chinese readable labels
- UI should not mutate payloads
- view models prevent raw fields from being misused
- display adapter separates display from business logic

This keeps the localized Admin UI readable while preserving English internal keys and safe business boundaries.

## 5. Current Data Sources To Display

Future display adapters may prepare view models from:

- AI draft review summary
- communication review summary
- inquiry review summary
- review summary registry metadata
- existing read-only Admin UI records

## 6. Display Adapter Core Rules

- pure input/output only
- no mutation
- no API
- no database
- no Supabase
- no OpenAI
- no Gmail/WhatsApp
- no send/approve/reject
- no task creation
- no quotation/PI/order/payment/shipment/production action
- Chinese labels are display-only
- English internal keys stay unchanged

## 7. Proposed Adapter Categories

Conceptual adapters only:

- `aiDraftReviewDisplayAdapter`
- `communicationReviewDisplayAdapter`
- `inquiryReviewDisplayAdapter`
- `registryMetadataDisplayAdapter`
- `commonSafetyFlagsDisplayAdapter`

No adapter implementation is created in this planning task.

## 8. Proposed View Model Shape

Conceptual output may include:

- `title`
- `subtitle`
- `badges`
- `summaryRows`
- `warningRows`
- `safetyRows`
- `recommendedOperatorAction`
- `disabledCapabilities`
- `technicalDetails`
- `rawReference`

Exact implementation is not part of this task.

## 9. AI Draft Review Display Plan

The AI Draft review display adapter may show:

- `risk_level`
- `action_boundary`
- `approval_required`
- `warnings`
- `draft_only`
- `can_send`
- `can_auto_approve`

It should use Chinese labels for operator-facing display, but it must not expose send or approve buttons. It must not convert any draft into an official message.

## 10. Communication Review Display Plan

The Communication review display adapter may show:

- channel
- direction
- attachment summary
- warnings
- `communication_only`
- `can_send`
- `can_auto_reply`
- `can_create_task`

`attachment_summary` is display-only. The adapter must not upload, archive, promote files, create tasks, auto-reply, or send messages.

## 11. Inquiry Review Display Plan

The Inquiry review display adapter may show:

- nested communication review
- nested AI draft review
- `missing_information`
- `risk_flags`
- `can_create_quote: false`
- `can_create_pi: false`
- `can_create_order: false`
- `can_trigger_production: false`
- `can_trigger_shipment: false`

The adapter must not create quotation, PI, order, production, or shipment buttons.

## 12. Registry Metadata Display Plan

The Registry metadata display adapter may show:

- domain
- label
- description
- `forbiddenUse`
- `safetyFlags`
- `outputCapabilities`

The helper reference must not be shown as an executable UI action. Unknown domains should display a safe fallback such as "未找到可用复核模块" while preserving the original technical key in `technicalDetails` if useful.

## 13. Chinese Label Strategy

- Use Chinese labels for operator-facing display.
- Keep internal domain keys in English.
- Do not translate API route values.
- Do not translate enum values unless a future mapping explicitly approves it.
- Customer-facing language remains separate from operator-facing UI labels.

## 14. Safety Display Strategy

Display adapters should make these states visible:

- disabled actions
- `review_required`
- `needs_human_review`
- `blocked`
- warnings
- technical values

Safety rows should make clear that disabled capabilities are not available actions.

## 15. What Display Adapters Must Never Do

Display adapters must never:

- execute helpers unexpectedly
- call API
- write database
- mutate payload
- send messages
- approve/reject
- create tasks
- generate quotation/PI/order
- trigger payment/production/shipment
- call OpenAI or external systems

## 16. Relationship With Existing Localized Admin UI

The current Admin UI is read-only and localized.

Display adapters may later feed read-only review panels, but there is no UI wiring yet. Any future UI implementation must be separate, incremental, and explicitly approved.

## 17. Relationship With Schema/API Planning

Display adapters can exist before schema/API integration.

Persistence requires schema planning. API usage requires API read/write boundary planning. The adapter must not hide missing schema/API decisions or imply that persistence exists.

## 18. Testing Expectations For Future Implementation

Future tests should verify:

- pure mapping
- no mutation
- Chinese labels present
- technical values preserved
- risky capabilities disabled
- missing fields fallback safely
- `rawReference` is not mutated
- no side effects

## 19. Recommended First Adapter

Recommended first adapter:

- `registryMetadataDisplayAdapter`

Why:

- registry metadata is stable
- metadata is lower risk than live helper output
- no helper execution is needed
- it can prove the display adapter pattern before handling nested review summaries
- it can prepare a safe foundation for future Admin UI review panels

## 20. Recommended Next Tasks

1. Display Adapter Plan Readiness Review
2. `registryMetadataDisplayAdapter` implementation
3. `registryMetadataDisplayAdapter` sanity review
4. `registryMetadataDisplayAdapter` usage examples
5. Admin UI display wiring planning only after adapter is stable

## 21. What Should NOT Happen Next

- no direct Admin UI wiring
- no API integration
- no schema migration
- no external AI/channel integration
- no write actions

## 22. Final Recommendation

Display Adapter should be the next planning/implementation layer before API/UI wiring.

The first implementation should be a pure `registryMetadataDisplayAdapter`, with no helper execution, no mutation, no API, no schema, no UI wiring, and no business actions.
