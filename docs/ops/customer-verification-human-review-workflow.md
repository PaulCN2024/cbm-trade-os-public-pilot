# Customer Verification Human Review Workflow

## Purpose

This document defines the future human review workflow for AI Customer Verification.

AI Customer Verification should help Paul review identity, credibility, relevance, duplicate risk, and next-step value. It must not become an automatic trust decision, customer-creation flow, outreach engine, quotation flow, or order workflow.

## Workflow States

Use stable review states:

- `draft`
- `pending`
- `in_review`
- `verified`
- `needs_more_info`
- `possible_duplicate`
- `risky`
- `rejected`
- `archived`

State meanings:

- `draft`: request exists but is not ready for review.
- `pending`: ready for Paul review.
- `in_review`: Paul or another reviewer is actively checking it.
- `verified`: reviewer marked the contact/company acceptable for normal follow-up.
- `needs_more_info`: reviewer needs more company, contact, project, or buyer-role information.
- `possible_duplicate`: record may match an existing customer/contact/inquiry.
- `risky`: record has enough risk to pause normal follow-up until clarified.
- `rejected`: reviewer decided the lead should not proceed.
- `archived`: record is no longer active but retained for audit/history.

## Review Steps

Paul reviews:

- company name
- contact person
- country
- email/domain
- website
- phone or WhatsApp
- product interest
- inquiry/project context
- buyer role
- duplicate risk
- risk signals
- recommended next action

Suggested review sequence:

1. Confirm source and contact identity.
2. Check company/contact completeness.
3. Review product interest and project context.
4. Review duplicate candidates.
5. Review risk/conflict signals.
6. Decide whether to follow up, ask for more information, hold, reject, or archive.
7. Record decision reason.

## Decision Outcomes

Allowed review outcomes:

- `continue_followup`
- `request_more_info`
- `mark_verified`
- `mark_possible_duplicate`
- `mark_risky`
- `hold`
- `reject`
- `archive`

Decision expectations:

- `continue_followup`: can prepare a draft follow-up later, but cannot send automatically.
- `request_more_info`: should draft information request only after separate follow-up workflow planning.
- `mark_verified`: marks review result, not automatic customer creation.
- `mark_possible_duplicate`: creates a review flag, not auto-merge.
- `mark_risky`: blocks normal follow-up until Paul decides.
- `hold`: keeps the case open without action.
- `reject`: prevents follow-up unless reopened.
- `archive`: removes from active queue while preserving history.

## Future System Effects

Only after approval, the system may later:

- update customer status
- create follow-up task
- generate message draft
- link verification evidence
- prepare quote review later

Each effect requires its own controlled-write design and audit trail.

## No Automatic Execution

The workflow must not automatically:

- create customer
- update customer status
- merge duplicate customers
- archive or reject customers
- send Email
- send WhatsApp
- request supplier quotation
- prepare or send official quotation
- create PI
- create order
- confirm payment
- trigger production
- trigger shipment

## Approval Boundary

Future UI should separate:

- AI recommendation
- evidence summary
- disabled actions
- Paul decision
- executed result later

Recommended approval text for future controlled-write stage:

```text
APPROVAL REQUEST
- Proposed customer verification decision:
- Evidence used:
- Risk:
- Data affected:
- External party affected:
- Exact status/action:
- Rollback:
- Waiting for Paul to reply exactly: APPROVED
```

## Review Queue Behavior

Future review queue should support:

- queue count
- risk filter
- duplicate filter
- source filter
- needs-more-info filter
- reviewer notes
- decision history

The first implementation should be read-only and should not include active approve/reject buttons until the approval workflow is implemented.

## Audit Log Requirements

Future audit records should capture:

- reviewer
- timestamp
- previous status
- new status
- decision reason
- evidence snapshot
- AI recommendation snapshot
- duplicate match snapshot
- linked source record

This is required before any customer status mutation can be considered safe.
