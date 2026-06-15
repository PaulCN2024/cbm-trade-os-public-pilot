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
