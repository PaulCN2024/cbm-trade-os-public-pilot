# Follow-up Assistant Workflow Plan

## Purpose

This document defines the future AI Follow-up Assistant workflow for CBM Trade OS.

The assistant should help Paul identify follow-up opportunities, missing information, priority, timing, and draft wording. It must not send messages, create real tasks, mutate customers, or make business commitments without a separate approval workflow.

## Main Workflow

```text
new inquiry / customer / verification result
-> detect follow-up candidate
-> identify missing information
-> assign priority
-> suggest next action
-> prepare draft
-> Paul review
-> approved follow-up later
```

## Follow-up Scenarios

Supported future scenarios:

- new customer inquiry with missing specifications
- quotation sent but no reply
- customer asked price only
- customer verified but needs website/project info
- possible duplicate customer
- high-risk customer
- dormant customer
- sample/order discussion pending
- after-sales/complaint follow-up later

The assistant should explain why a follow-up is suggested and what information is still missing.

## Follow-up Stages

Use stable stage labels:

- `first_response`
- `information_collection`
- `quote_preparation`
- `quote_followup`
- `negotiation`
- `sample_followup`
- `order_confirmation`
- `payment_reminder_later`
- `production_shipment_update_later`
- `dormant_reactivation`

Payment, production, shipment, and order-related stages are planning labels only. They do not authorize business execution.

## Human Review Workflow

Paul should see:

- reason
- priority
- missing info
- suggested timing
- draft message
- risk flags

Paul may decide:

- approve follow-up task
- revise draft
- ask AI to redraft later
- skip
- hold
- archive

The first UI/data implementation should be read-only. Active approve/send/task controls should wait for an approved controlled-write design.

## No Automatic Execution

AI can suggest and draft, but Paul approves.

The assistant must not:

- auto-send
- auto-create task if approval is required
- update customer or inquiry records automatically
- create quote/order/payment/shipping action
- use customer verification results in external messages without review

Every future action that affects a customer, supplier, payment, production, or shipment must remain human-reviewed.
