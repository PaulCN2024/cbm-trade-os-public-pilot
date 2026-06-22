# Customer Verification Merge And Review Policy

## Purpose

This document defines the human review and future merge policy for possible duplicate customer verification records.

The current phase is planning only. It does not authorize merge execution, customer mutation, deletion, archive, sending, quotation, PI, order, payment, production, or shipment actions.

## Review Before Merge

Paul should compare:

- company name
- contact names
- email/domain
- phone/WhatsApp
- website
- country
- inquiry history
- quotation history later
- notes/source channel

Review should focus on whether records represent the same buyer, same company branch, same group, same distributor, same project, or a different end customer.

## Decision Options

Use stable decision labels:

- `not_duplicate`
- `possible_duplicate`
- `confirmed_duplicate`
- `related_company`
- `same_group_different_contact`
- `same_contact_new_project`
- `archive_later`
- `merge_later`

These labels should first be read-only review outcomes. Any write effect requires a later approved workflow.

## Merge Principles

Future merge should:

- preserve all source records
- not lose inquiry history
- not lose quotation history
- keep audit trail
- keep original source labels
- prefer manual review

Merge should be reversible or at least auditable. It should never hide the origin of customer, inquiry, business-card, or quotation data.

## What Not To Merge

Do not merge:

- same distributor with different end customer
- similar names in different countries without stronger evidence
- personal email-only contacts
- competitor/information-gathering accounts
- unrelated branch companies

These cases may still be related records, but they should not be treated as confirmed duplicates without stronger evidence and human review.

## Future Approved Merge Workflow

Recommended future flow:

```text
possible duplicate detected
-> AI prepares evidence summary
-> Paul reviews
-> Paul selects decision
-> system updates duplicate status
-> actual merge only in later approved task
```

The first implementation should stop at read-only candidate display. Duplicate marking, status updates, and merge execution belong to later controlled-write tasks with audit logging.
