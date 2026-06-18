---
name: cbm-readonly-saas-ui-implementation
description: Use this skill when implementing small low-risk read-only UI improvements in CBM Trade OS Admin. It must preserve API/schema/read-only boundaries, avoid business actions, and run browser preview validation when possible.
---

# CBM Read-only SaaS UI Implementation Skill

## When to use this skill

Use this skill when the task explicitly allows:
- small UI implementation
- read-only UI polish
- layout cleanup
- CSS polish
- localized UI improvement
- static preview panel
- Admin UI display-only wiring
- browser preview validation
- small SaaS dashboard UI improvement

## Core goal

Make small, safe UI improvements without changing business behavior.

This skill is for implementation only when the task explicitly allows file changes.

## Hard safety restrictions

Always preserve:
- no API route changes
- no schema changes
- no package.json changes
- no database writes
- no Supabase changes
- no OpenAI / AI Gateway integration
- no Gmail / WhatsApp integration
- no send actions
- no approve/reject actions
- no create/update/delete actions
- no task creation
- no quotation / PI / order / payment / shipment / production actions

## Allowed implementation pattern

Prefer:
- one small section
- one small UI target
- one or two allowed UI files
- browser preview
- npm test if safe
- one commit
- final sanity report

## UI file rules

Only modify files explicitly allowed by the task.

Usually allowed files may be:
- admin/ui-foundation/app.js
- admin/ui-foundation/styles.css

Do not modify:
- admin/ui-foundation/index.html unless explicitly allowed
- api/*
- supabase/*
- package.json
- tests/*
- lib/services/* unless explicitly allowed

## Browser preview rules

When possible:

1. Start a temporary static server.
2. Open admin/ui-foundation/index.html with trial query if used.
3. Check:
   - Chinese text readable
   - no garbled characters
   - no horizontal overflow
   - no console errors caused by the change
   - no active write/action buttons
   - disabled capabilities look informational
   - no misleading business commitment wording
4. Stop server after preview.
5. Do not commit screenshots unless explicitly requested.

## Read-only UI checks

Confirm no visible UI suggests enabled:
- create
- update
- delete
- send
- approve
- reject
- quote
- PI generation
- order confirmation
- payment action
- production confirmation
- shipment confirmation

## Display adapter UI wiring rules

If working with display adapters:
- Do not execute helpers unless task explicitly approves it.
- Prefer static preview data for first UI preview.
- Do not import CommonJS service modules into browser code unless explicitly approved.
- Do not expose helper references as clickable actions.
- Do not convert disabledCapabilities into controls.
- Keep nestedReviewModels read-only.
- Keep rawReference technical and non-editable.

## UI clutter reduction rules

When implementing small polish:
- reduce repeated long text
- prefer compact badges
- use collapsible or secondary detail areas
- keep safety visible but not overwhelming
- avoid adding more boxes unless necessary
- do not create broad redesign in a small implementation task

## Diff validation

Before commit, confirm:
- only allowed files changed
- API route values unchanged
- endpoint values unchanged
- data fields unchanged
- no write actions added
- no helper execution added unless explicitly allowed
- no broad UI rewrite
- no business commitment wording added

## Final report format

Use:

1. Files modified
2. Summary of UI changes
3. Safety confirmation
4. Test command and result
5. Browser preview method and result
6. Commit hash and message
7. Final git status
8. Warnings

## Stop conditions

Stop and report instead of continuing if:
- task requires broad UI rewrite
- task needs schema/API changes
- task needs new package/install
- task would add business actions
- task would require external channel/AI integration
- task would make disabled capabilities clickable
- task needs design direction that has not been planned
