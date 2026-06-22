# Customer Verification Duplicate Risk Boundary

## Purpose

This document defines what AI Customer Verification may and must not do when duplicate customer, contact, company, inquiry, or business-card lead signals appear.

Duplicate checking is useful but commercially sensitive. A wrong merge can damage customer history, ownership, quotation context, and follow-up decisions.

## What AI May Do

AI or deterministic helper logic may:

- flag possible duplicate
- explain why it thinks records may match
- rank match confidence
- suggest review action
- prepare merge summary later

These outputs are advisory. They should be displayed as review information, not as executable commands.

## What AI Must Not Do

AI must not:

- merge customers automatically
- delete duplicate records
- overwrite customer fields
- change customer status
- archive or reject customer records
- send messages
- quote based on unconfirmed duplicate relation
- create PI/order/payment/production/shipment actions

No duplicate signal may become a business action without Paul's explicit approval and a controlled-write architecture.

## Risk Levels

### Low

Low-risk signals:

- weak/single-field similarity only
- same broad product interest
- same country only
- same source channel only

Low risk means the system may show a light review hint but should not interrupt normal workflow.

### Medium

Medium-risk signals:

- similar company name + same country
- same website but different contact
- same contact name with incomplete company data
- same project context with missing identifiers

Medium risk should require visible review before the system uses duplicate context.

### High

High-risk signals:

- exact email or phone match
- exact WhatsApp match
- same website/domain + same company
- multiple matching identifiers

High risk should block automatic customer mutation and require Paul review before marking a duplicate or using the match in follow-up.

## Approval Boundary

Paul must approve:

- mark as duplicate
- merge records
- archive duplicate
- transfer history
- update customer owner/status
- use duplicate context in customer reply

Future approval text should state the affected records, matched evidence, proposed effect, rollback path, and exact action waiting for approval.

## Audit Requirement

Future implementation should log:

- match rule
- matched record
- confidence
- reviewer
- decision
- timestamp
- evidence snapshot
- previous status
- new status, if any

Audit logging is required before any controlled duplicate marking or merge workflow can be considered safe.
