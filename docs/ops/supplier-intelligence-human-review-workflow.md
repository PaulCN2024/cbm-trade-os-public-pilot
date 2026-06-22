# Supplier Intelligence Human Review Workflow

## Purpose

This document defines the human review workflow for AI Supplier Intelligence.

The workflow keeps AI assistance draft-only and reviewable. Supplier contact, RFQ sending, quotation preparation, and business execution remain approval-gated.

## Workflow States

### `draft`

The supplier intelligence package is being prepared or has incomplete source data.

### `pending`

The package is ready for review but has not been assessed by Paul.

### `matched`

AI has proposed supplier type or capability matches for review. This does not mean the supplier is confirmed.

### `supplier_confirm_needed`

Supplier confirmation is required before quotation readiness or customer-facing response can be trusted.

### `rfq_draft_ready`

A draft-only RFQ can be reviewed by Paul. It has not been sent.

### `risk_hold`

The package has risk that blocks supplier contact, RFQ sending, quotation, or customer commitment.

### `archived`

The package is no longer active or is kept for reference.

## Paul Review Checklist

Paul reviews:

- product category
- required supplier type
- matched capability
- missing supplier questions
- RFQ readiness
- risk/confidence
- RFQ draft
- whether customer specs are complete enough
- whether supplier can be contacted
- whether customer confidential data can be shared
- whether quotation preparation should stay blocked

## Decision Outcomes

### `request_more_customer_info`

Use when customer-side details are missing and supplier contact would be premature.

### `prepare_rfq_draft`

Use when the system may prepare a draft-only RFQ package for Paul review.

### `approve_rfq_send_later`

Use only as a future controlled workflow decision. It should not send immediately unless a separate approved send workflow exists.

### `hold_due_to_risk`

Use when technical, commercial, quality, responsibility, confidentiality, or relationship risk blocks the next step.

### `mark_not_ready`

Use when the package is insufficient for supplier matching or RFQ draft preparation.

### `archive`

Use when the package should be closed without action.

## Future Effects

Only after explicit approval, a future controlled workflow may:

- create supplier RFQ draft
- send supplier RFQ later
- link supplier response
- prepare quote review request
- prepare customer reply draft

Each future effect should be separately modeled, logged, and approval-gated.

## No Automatic Execution

AI Supplier Intelligence must not:

- auto RFQ
- auto supplier contact
- auto quote
- auto supplier selection
- auto sample approval
- auto order/payment/production/shipment action
- auto customer message

Review status must not be interpreted as external execution. A reviewed draft is still not sent.

## Audit Expectations

Future review records should capture:

- reviewer
- review status
- decision
- reviewer notes
- approved next action
- reviewed timestamp
- source package reference
- risk and confidence at review time

Audit notes should stay internal and should not be shown as supplier or customer commitments.
