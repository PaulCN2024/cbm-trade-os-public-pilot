# AI-first Human Approval Boundary

## Purpose

This document defines the approval boundary for AI-first CBM Trade OS workflows.

AI should help Paul move faster, but it must not take business-risk actions without approval.

## Safe AI Actions

AI may:

- summarize
- classify
- extract
- compare
- suggest
- draft
- score risk
- prepare workflow
- create internal notes
- propose follow-up

These actions are safe when they remain internal, reviewable, source-aware, and non-executing.

## Approval-required Actions

The following require Paul approval:

- sending customer/supplier messages
- publishing content
- creating formal quote
- issuing PI
- approving/rejecting quotation
- confirming price
- confirming delivery date
- submitting order
- payment-related messages
- supplier commitment
- after-sales compensation
- uploading/processing sensitive files
- applying DB/schema changes
- changing production settings

Approval should happen before the action is executed, not after.

## Forbidden Autonomous Actions

AI must not autonomously:

- send messages
- scrape protected platforms
- bypass anti-bot systems
- promise price/quality/delivery
- expose confidential data
- modify production records without approval
- publish social posts
- execute payments/orders

AI must also not hide uncertainty. If context is missing, AI must say what is missing.

## Approval Request Format

Use this standard approval request for risky actions:

```text
APPROVAL REQUEST
- Action:
- Why approval is needed:
- Data affected:
- External party affected:
- Exact message/command:
- Risk:
- Rollback:
- Waiting for Paul to reply exactly: APPROVED
```

Rules:

- The action must be specific.
- The exact message/command must be shown before execution.
- The affected data and external party must be clear.
- Approval should use an exact confirmation phrase.
- If the action changes production, data, external channels, or business commitments, do not proceed on vague approval.

## Future Approval Center

Future CBM Trade OS should include an Approval Center with:

- approval queue
- approval history
- audit log
- reviewer identity
- status
- reason
- timestamp

Future approval records should capture:

- proposed action
- source data
- AI reasoning summary
- risk level
- draft payload
- reviewer decision
- final execution status
- cancellation or rollback note where applicable

The Approval Center should become the bridge between AI assistance and controlled business execution.
