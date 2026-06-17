# Phase 0B Review Summary Registry Usage Examples

## 1. Title

Phase 0B Review Summary Registry Usage Examples

## 2. Purpose

This document shows safe usage examples for the pure metadata review summary helper registry.

The registry may help operators, developers, and future service planning discover which review summary helpers exist, but it must not execute helpers or trigger business actions.

## 3. Registry Status

The registry is implemented as a pure metadata/discovery registry.

It:

- supports `ai_draft`, `communication`, and `inquiry` domains
- stores helper function references
- does not execute helpers during import, list, or lookup
- does not call API, database, Supabase, AI model, email, WhatsApp, or any business action

## 4. Core Safety Rule

The registry may help discover which review summary helpers exist, but it must never be treated as a workflow executor, API router, approval engine, sender, task creator, or business-action engine.

## 5. Supported Domains

- `ai_draft` => `AI 草稿复核`
- `communication` => `沟通复核`
- `inquiry` => `询盘复核`

Internal domain keys remain English and stable.

## 6. Standard Safe Usage: List Helpers For Documentation

Safe conceptual flow:

1. Call `listReviewSummaryHelpers()`.
2. Display each helper's `domain`, `label`, `description`, `allowedUse`, `forbiddenUse`, and `safetyFlags`.
3. Do not execute helper functions.
4. Do not create UI actions from metadata alone.

This is safe because listing metadata does not perform review, send messages, create tasks, approve drafts, or write data.

## 7. Standard Safe Usage: Lookup Helper Metadata

Safe conceptual flow:

1. Call `getReviewSummaryHelper("inquiry")`.
2. Inspect metadata.
3. Confirm `forbiddenUse` and `outputCapabilities` before planning future integration.
4. If domain is unknown, receive `null`.
5. Do not execute the returned `helper` reference unless a separate implementation task explicitly approves helper execution.

Lookup is discovery only.

## 8. Example 1: Admin UI Helper Information Panel Planning

A future Admin UI information panel may show available helper domains and Chinese labels.

Safe display examples:

- `ai_draft` / `AI 草稿复核`
- `communication` / `沟通复核`
- `inquiry` / `询盘复核`

The UI must not call helper functions from registry metadata without separate approved planning. It must not expose send, approve, quote, PI, order, payment, shipment, or production actions from registry metadata.

## 9. Example 2: Developer Documentation Generation

Developer documentation may list helper purposes and boundaries from registry metadata.

Safe fields include:

- `domain`
- `label`
- `description`
- `module`
- `functionName`
- `forbiddenUse`
- `safetyFlags`

This is safe because documentation generation is discovery only and does not execute helpers.

## 10. Example 3: Future Service-layer Planning

A future service layer may use registry metadata to select a helper after separate planning.

Important boundaries:

- The registry metadata alone does not grant execution permission.
- Helper execution must be explicit in approved service code.
- API, schema, persistence, approval workflow, and external channel integration must each be planned separately.

## 11. Example 4: Unknown Domain Handling

Expected behavior:

- `getReviewSummaryHelper("unknown")` returns `null`.
- Caller should fail closed.
- No fallback helper should execute.
- No unsafe default behavior should occur.

Unknown domain handling must stay conservative.

## 12. Example 5: Safety Metadata Checks

Future tests can verify that every registered helper:

- forbids `send`
- forbids `approve`
- forbids `create_quote`
- forbids `create_pi`
- forbids `create_order`
- forbids payment, production, and shipment actions
- has risky `outputCapabilities` set to `false`
- keeps conservative `safetyFlags`

These checks protect the registry from becoming an accidental execution surface.

## 13. Fields Safe To Display

These fields are safe to display in internal planning or operator-facing metadata panels:

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

Display should remain internal and explanatory.

## 14. Fields That Must Not Be Misinterpreted

- `helper` reference does not mean helper has been executed.
- `module` path does not mean API route.
- `allowedUse` does not mean business action allowed.
- `metadata_only` does not mean output was generated.
- `listReviewSummaryHelpers()` does not mean review has been performed.

Registry metadata describes capabilities and boundaries only.

## 15. What The Registry Must Never Trigger

The registry must never trigger:

- helper execution during import, list, or lookup
- database write
- API write
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

## 16. Relationship With Review Summary Helpers

The registry helps discover helpers.

Review summary helpers prepare review summaries.

Neither registry nor helpers execute business actions. Helper execution must remain explicit, planned, and covered by a separate implementation task.

## 17. Relationship With Future Display Adapters

Display adapters may use registry metadata for labels and descriptions.

Display adapters must not:

- mutate payloads
- execute business actions
- treat metadata as review output
- treat Chinese labels as changed domain keys

Chinese labels remain display-only.

## 18. Relationship With Future API Endpoints

API endpoints may use the registry only after API planning.

The registry must not bypass:

- authentication
- authorization
- read/write boundary
- validation
- approval gates

API implementation must remain separate and explicitly approved.

## 19. Relationship With Future Approval Workflow

The registry may indicate human review requirements.

The registry must not:

- approve
- reject
- change approval status
- send after approval
- convert review metadata into workflow execution

Approval workflow execution must be separately planned and approved.

## 20. Relationship With Future AI Provider / Model Gateway

The registry is not model routing.

No OpenAI, AI Gateway, or AI provider call should happen through the registry. AI Provider / Model Gateway integration remains a separate future layer.

## 21. Known Current Limitations

- Registry only covers three domains.
- No API integration exists.
- No UI integration exists.
- No schema integration exists.
- Metadata is not persisted.
- The shallow copy/freeze strategy should be maintained if metadata grows.
- Helper references remain functions but are not executed by registry operations.

## 22. Future Tests Or Review Ideas

Future tests or reviews should cover:

- no helper execution on import/list/lookup
- unknown domain fail-closed behavior
- all risky `outputCapabilities` remain `false`
- all forbidden actions remain present
- metadata immutability/copy safety
- future display adapter usage
- future API planning review

## 23. Recommended Next Task

Recommended next task:

- Review Summary Registry Usage Examples Readiness Review

Then consider:

- Phase 0B Orchestration Layer Final Checkpoint
- Display Adapter Planning for Admin UI

## 24. Final Recommendation

The registry is safe for metadata/discovery use only.

It should not be wired into API, UI, schema, approval workflow, AI Provider, Gmail, WhatsApp, quotation, PI, order, payment, shipment, or production flows until separate planning is complete.
