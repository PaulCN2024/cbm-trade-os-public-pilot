# Codex Task Card Workflow

This folder stores lightweight Codex task cards for CBM Trade OS.

The purpose is to let Codex execute one small, controlled task by reading a single Markdown task file instead of repeatedly pasting long prompts.

## Core Rules

- Codex must execute only one task card at a time.
- Codex must inspect only the files listed in the task card.
- Codex must not scan the whole repository.
- Codex must not modify files outside the allowed scope.
- Codex must first provide a short plan and wait for approval before editing.
- Codex must not commit unless the task card explicitly says commit.
- Codex must keep changes minimal and business-focused.
- Codex must preserve existing safety boundaries.

## Low-risk Autopilot Mode

For tasks marked:

- Risk Level: Low
- Action Type: Small code implementation or documentation-only
- Allowed files are explicitly listed
- Forbidden files are explicitly listed
- No schema/API/UI/Supabase/OpenAI/package.json changes are allowed

Codex may execute directly without waiting for an approval plan, if and only if:

1. It reads the task card.
2. It confirms the task is Low Risk.
3. It modifies only allowed files.
4. It does not inspect or modify forbidden files.
5. It does not scan the whole repository.
6. It runs only the test command required by the task card.
7. It reports files changed, test result, final git status, and warnings.

For Low-risk Autopilot tasks, the task card may include:

```text
Autopilot:
Allowed

Auto-commit:
Allowed only if:
- tests pass
- only allowed files changed
- commit message is provided in the task card
```

For medium-risk or high-risk tasks, Codex must still:

- provide a plan first
- wait for human approval
- never auto-commit
- never modify files outside the task card

Autopilot must never be used for:

- database schema changes
- migrations
- API behavior changes
- UI behavior changes
- auth/permission changes
- approval workflow changes
- OpenAI/AI SDK integration
- Supabase access
- email/WhatsApp sending
- quotation, PI, order, payment, shipment, or production logic

## Required Final Report

After execution, Codex must report:

- files changed
- summary of changes
- tests run
- final git status
- warnings

## Suggested Use

1. Create a task card from `TASK-TEMPLATE.md`.
2. Put only one task in the card.
3. List exact allowed files and allowed reads.
4. Paste the task card path to Codex.
5. Codex reviews the card, proposes a plan, and waits for approval.
6. Codex executes only the approved scope.

## Safety Boundary

Codex must not automatically send customer messages, official quotations, PI, price confirmations, delivery time confirmations, payment term confirmations, bank account confirmations, compensation promises, or responsibility judgments.

All high-risk commercial actions require manual review.
