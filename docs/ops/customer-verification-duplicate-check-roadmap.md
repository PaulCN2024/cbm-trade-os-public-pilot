# Customer Verification Duplicate Check Roadmap

## Current Completed State

AI Customer Verification has completed:

- AI Customer Verification UI preview
- data model/rules plan
- read-only data foundation
- SQL executed
- RLS verified
- admin-read routes
- production post-SQL verification

This means the system can safely display verified read-only customer verification data, but it still must not mutate customers, merge records, send messages, or execute business actions.

## Future Roadmap

### D0 - duplicate check planning

Status: complete after this document set.

Defines duplicate strategy, evidence rules, risk boundary, merge/review policy, and roadmap.

### D1 - read-only duplicate evidence model review

Review current table and projection shape for duplicate candidates before any implementation.

### D2 - exact email/phone/domain duplicate admin-read preview

Implement deterministic read-only duplicate candidates from existing internal records only.

### D3 - company-name normalization plan

Plan normalization rules for company suffixes, punctuation, casing, abbreviations, and multilingual names.

### D4 - possible duplicate queue UI

Preview possible duplicate cases as a read-only queue with evidence rows and disabled actions.

### D5 - Paul review decision workflow

Plan human review decisions, notes, status labels, and audit requirements.

### D6 - approved duplicate marking

Only after controlled-write architecture exists, allow approved duplicate marking with audit logging.

### D7 - safe merge plan

Plan exact merge mechanics, field priority, rollback, audit, and conflict handling.

### D8 - merge audit plan

Define audit views, evidence snapshots, history transfer visibility, and recovery rules.

## Recommended Next Executable Task

Recommended:

```text
CBM-CODEX-SPRINT-FOLLOWUP-ASSISTANT-PLAN-001
```

Reason:

Before building real duplicate merge logic, it is more valuable to design the follow-up workflow that uses customer verification results. This keeps momentum on operator value while avoiding premature customer mutation.

Alternative:

```text
CBM-CODEX-SPRINT-CUSTOMER-VERIFICATION-DUPLICATE-READONLY-001
```

Use the alternative if Paul wants the next step to focus specifically on deterministic read-only duplicate candidate display from existing internal records.

## Stop Conditions

Stop and return to planning if a future task requires:

- external lookup
- scraping
- search engine calls
- AI provider calls
- customer creation or mutation
- customer merge
- customer deletion
- message sending
- quotation, PI, order, payment, production, or shipment action
- database write without controlled-write approval
