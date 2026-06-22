# Inquiry Intelligence Human Review Workflow

## Purpose

This document defines the human review workflow for AI Inquiry Intelligence.

The workflow should help Paul review product classification, missing information, quotation readiness, supplier/RFQ need, risk, and draft reply before any future business action.

## Workflow States

- `draft`
- `pending`
- `analyzed`
- `needs_more_info`
- `supplier_confirm_needed`
- `quote_ready`
- `risk_hold`
- `archived`

These states are review states only. They do not authorize sending, quoting, supplier contact, or customer/inquiry mutation.

## Paul Review Checklist

Paul reviews:

- product category
- missing information
- quotation readiness
- supplier/RFQ need
- customer verification status
- duplicate risk
- draft reply
- risk signals
- recommended next action

## Decision Outcomes

- `request_more_info`
- `prepare_supplier_rfq`
- `prepare_budget_estimate`
- `prepare_formal_quote_later`
- `hold_due_to_risk`
- `low_priority`
- `archive`

## Future Effects

Only after approval, future systems may:

- create follow-up task
- create supplier RFQ draft
- create quote review request
- prepare customer reply draft

These future effects still do not mean automatic execution. A separate controlled-write workflow must approve and execute any real action.

## No Automatic Execution

No auto quote.

No auto send.

No auto RFQ.

No auto supplier contact.

No customer or inquiry mutation.

No order/payment/production/shipment action.

## Audit Expectations

Future review records should capture:

- reviewer
- review decision
- reviewed fields
- accepted assumptions
- rejected assumptions
- approved next action
- risk notes
- timestamp

This creates an audit bridge between AI assistance and later controlled execution.
