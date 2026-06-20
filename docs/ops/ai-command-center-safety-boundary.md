# AI Command Center Safety Boundary

## Purpose

The AI Command Center should make CBM Trade OS easier to operate, but it must not turn AI assistance into uncontrolled business execution.

AI may prepare work. Paul approves risky work. The system may execute later only through separately designed controlled workflows.

This document is planning only. It does not implement AI calls, UI code, API routes, schema, approval execution, sending, or business actions.

## Safe Actions

AI Command Center may safely help with:

- analyze
- summarize
- classify
- retrieve
- recommend
- draft
- compare
- explain risk

These actions are safe only when they remain internal, read-only, and reviewable.

## Review-only Actions

The Command Center may prepare review-only outputs such as:

- customer reply draft
- supplier RFQ draft
- quotation draft
- social content draft
- follow-up message draft
- complaint reply draft
- order checklist

These outputs must be labeled as drafts or review-only. They must not be represented as sent, approved, published, quoted, ordered, paid, produced, or shipped.

## Approval-required Actions

The following require Paul to reply exactly `APPROVED` before any future controlled execution:

- send message
- publish post
- create formal quote
- issue PI
- create order
- confirm delivery
- commit price
- commit compensation
- update sensitive status
- run database/schema changes
- change production settings

Approval is required before execution, not after.

## Forbidden Autonomous Actions

The Command Center must never autonomously:

- auto-send messages
- auto-publish posts
- auto-create official quotations
- auto-approve or reject
- auto-create orders
- auto-trigger payment, production, or shipment
- scrape unauthorized platforms
- bypass anti-bot protections
- expose confidential information
- hide source, confidence, or risk

## Standard Approval Request Format

Future approval requests should use this exact format:

```text
APPROVAL REQUEST
- Action
- Reason
- Data involved
- External party
- Exact output/command
- Risk
- Rollback
- Waiting for Paul to reply exactly: APPROVED
```

No approval request should execute the action by being displayed. Execution requires a separate controlled workflow.

## Audit And Logging Future

Future implementation should preserve:

- command history
- AI rationale
- approval records
- executed action logs
- risk flags

Audit records should make it clear:

- what AI recommended
- what Paul approved
- what the system executed
- when it happened
- which source data was used
- what risk boundary applied
