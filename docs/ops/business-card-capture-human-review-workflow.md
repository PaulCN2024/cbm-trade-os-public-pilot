# Business Card Capture Human Review Workflow

## Purpose

This workflow defines how Paul should review future AI Business Card Capture results before any customer profile, customer record, or follow-up message is created.

The goal is to make card capture faster without letting uncertain OCR, AI inference, or duplicate matching create business risk.

This is planning only. It does not implement upload, OCR, customer creation, message sending, API routes, schema changes, or business execution.

## Workflow States

- `uploaded`
- `extraction_pending`
- `extracted`
- `needs_review`
- `approved_as_customer_draft`
- `rejected`
- `archived`

State meanings:

- `uploaded`: a source card/image exists in the future system, but no extraction is ready.
- `extraction_pending`: OCR/AI extraction is queued or processing.
- `extracted`: field extraction exists but has not been reviewed.
- `needs_review`: missing, low-confidence, duplicate, or risky fields require Paul review.
- `approved_as_customer_draft`: Paul approved the extracted data as an internal customer draft, not as an official customer record.
- `rejected`: Paul decided the capture should not be used.
- `archived`: the capture is retained for reference but not active.

## Review Steps

Paul reviews:

- name
- company
- Email
- phone
- WhatsApp
- country
- website
- customer type
- duplicate warning
- risk notes
- follow-up draft

Recommended review order:

1. Confirm the source is business-relevant.
2. Confirm name and company.
3. Confirm Email / phone / WhatsApp formatting.
4. Confirm country and website.
5. Review inferred customer type and product interest.
6. Check duplicate warnings.
7. Review risk notes and missing fields.
8. Review follow-up draft only after contact fields look usable.
9. Decide the outcome.

## Decision Outcomes

Paul can choose:

- approve customer draft
- request correction
- mark duplicate
- reject
- archive

Outcome meanings:

- `approve customer draft`: data may move to an internal customer-profile draft queue.
- `request correction`: fields need manual correction or re-extraction.
- `mark duplicate`: connect this capture to an existing customer/company/contact candidate.
- `reject`: do not use this capture for customer creation or follow-up.
- `archive`: keep source for reference, but do not treat it as active.

## Future Approved Creation

Only after approval, a future workflow may:

- create customer record
- link original capture source
- link extraction result
- create follow-up draft

Even after customer creation is approved, follow-up sending should still require a separate approval step.

Future customer creation should record:

- source capture reference
- extraction result reference
- reviewer identity
- approval timestamp
- duplicate check result
- final customer record ID

## No Automatic Execution

The workflow must preserve these boundaries:

- no auto customer creation
- no auto send
- no external contact without approval
- no automatic merge into existing customer records
- no official buyer verification without evidence
- no quotation, PI, order, payment, production, or shipment action

AI may prepare fields and drafts. Paul decides what becomes part of the business system.
