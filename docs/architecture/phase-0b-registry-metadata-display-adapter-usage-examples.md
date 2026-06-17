# Phase 0B Registry Metadata Display Adapter Usage Examples

## 1. Title

Phase 0B Registry Metadata Display Adapter Usage Examples

## 2. Purpose

This document shows safe usage examples for `registryMetadataDisplayAdapter` and `listRegistryMetadataDisplayModels`.

The adapter prepares display-only view models from review summary helper registry metadata for future localized Admin UI planning.

## 3. Adapter Status

`registryMetadataDisplayAdapter` is implemented as a pure display mapper.

It:

- transforms registry metadata into a display-only view model
- does not execute helper functions
- does not call API, database, AI, email, WhatsApp, or business actions
- is not wired to Admin UI yet

## 4. Core Safety Rule

`registryMetadataDisplayAdapter` may prepare display models, but it must never be treated as permission to execute helpers, send messages, approve, create tasks, create quotes, create PI, create orders, trigger payment, production, or shipment.

## 5. Standard Safe Flow: Single Domain

Safe conceptual flow:

1. Receive domain, such as `inquiry`.
2. Call `registryMetadataDisplayAdapter({ domain: "inquiry" })`.
3. Receive display-only view model.
4. Show `title`, `badges`, `safetyRows`, `warningRows`, and `disabledCapabilities`.
5. Do not execute helper.
6. Do not create UI action from helper reference.

The output is display data only.

## 6. Standard Safe Flow: Metadata Object

Safe conceptual flow:

1. Receive registry metadata object.
2. Call `registryMetadataDisplayAdapter({ metadata })`.
3. Receive display-only view model.
4. Confirm source metadata is not mutated.
5. Confirm helper function is not displayed as executable action.

This is useful for future internal documentation, diagnostics, and read-only display planning.

## 7. Standard Safe Flow: List All Helpers

Safe conceptual flow:

1. Call `listRegistryMetadataDisplayModels()`.
2. Receive three display view models.
3. Show helper domains and safety boundaries.
4. Do not execute any helper.

The current expected domains are:

- `ai_draft`
- `communication`
- `inquiry`

## 8. Example 1: `ai_draft` Registry Metadata

Expected display model:

- `title`: `AI 草稿复核`
- `summaryRows` include domain, module, and functionName
- `warningRows` include forbidden actions
- `disabledCapabilities` include risky false capabilities
- helper reference is marked `not displayed / not executable`

The display model must not imply that an AI draft has been generated, approved, or sent.

## 9. Example 2: `communication` Registry Metadata

Expected display model:

- `title`: `沟通复核`
- display model shows communication/attachment review purpose
- no send/reply/task action is created
- disabled capabilities remain visible

The display model must not create email, WhatsApp, auto-reply, or task actions.

## 10. Example 3: `inquiry` Registry Metadata

Expected display model:

- `title`: `询盘复核`
- display model shows inquiry review purpose
- no quote/PI/order/production/shipment capability is enabled

The display model must not create quotation, PI, order, production, or shipment actions.

## 11. Example 4: Unknown Domain

Expected display model:

- `title`: `未知复核助手`
- badges include unavailable state
- `warningRows` instruct operator/developer to check domain or metadata input
- no fallback helper execution

Unknown domain handling must fail closed.

## 12. Example 5: Admin UI Information Panel Planning

Future Admin UI may use the display model to show helper information.

The UI must not:

- add buttons for helper execution
- expose function references
- mutate raw metadata
- add send, approve, quote, PI, order, payment, shipment, or production actions

This adapter alone does not wire anything into Admin UI.

## 13. Example 6: Developer Documentation Table

Adapter output may be used to create documentation tables.

Safe columns may include:

- title
- subtitle
- domain
- module
- functionName
- safety rows
- disabled capabilities
- forbidden uses

This is safe because the adapter is display-only and does not execute helpers.

## 14. Fields Safe To Display

Safe display fields:

- `title`
- `subtitle`
- `badges`
- `summaryRows`
- `warningRows`
- `safetyRows`
- `disabledCapabilities`
- `technicalDetails` without executable helper
- `rawReference` with `helperReference` marked non-executable

## 15. Fields That Must Not Be Misinterpreted

- `title` does not mean helper executed.
- `functionName` does not mean callable UI action.
- `disabledCapabilities` are not available actions.
- `rawReference` does not mean raw metadata can be mutated.
- `technicalDetails` are for inspection only.

## 16. What This Adapter Must Never Trigger

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

## 17. Relationship With Registry

The registry provides metadata.

The adapter maps metadata into view models.

Registry and adapter both remain non-executing. Helper execution remains separate and explicitly planned.

## 18. Relationship With Future Admin UI

Admin UI may later consume display models only after a separate UI wiring plan.

This adapter alone does not change UI. UI wiring must remain read-only unless separately approved.

## 19. Known Current Limitations

- Only registry metadata adapter exists.
- No live helper output adapters exist yet.
- No Admin UI wiring exists.
- No schema/API integration exists.
- Helper references are intentionally not executable in display output.
- Labels are suitable for internal Chinese operator display but may need UI polish later.

## 20. Future Tests Or Review Ideas

Future tests or reviews may cover:

- browser display of view model
- Chinese label polish
- disabled capability display
- unknown domain rendering
- no helper execution after UI wiring
- no mutation after UI wiring

## 21. Recommended Next Task

Recommended next task:

- Registry Metadata Display Adapter Usage Examples Readiness Review

Then consider:

- Admin UI Display Adapter Wiring Plan
- AI Draft Review Display Adapter Readiness Review

## 22. Final Recommendation

`registryMetadataDisplayAdapter` is safe for future read-only display planning only.

It is not an execution layer, not an Admin UI wiring step, and not permission to add API, schema, approval workflow, external channel, or business-action behavior.
