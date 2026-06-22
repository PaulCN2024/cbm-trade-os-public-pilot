# Inquiry Intelligence Supplier/RFQ Boundary

## Purpose

This document defines when AI Inquiry Intelligence may recommend supplier confirmation or prepare supplier RFQ questions, and what must remain approval-gated.

This is planning only. It does not create RFQs, contact suppliers, select suppliers, or confirm production.

## When Supplier Confirmation Is Needed

Supplier confirmation is likely needed when the inquiry involves:

- new product category
- custom drawing
- uncertain material
- uncertain processing method
- missing unit weight
- unclear packaging
- production lead time needed
- FOB/local cost needed
- quality standard unclear

## Supplier/RFQ Questions To Prepare

AI may prepare draft supplier questions such as:

- Can you make it?
- What material and thickness can you supply?
- What is the unit weight or weight basis?
- What is the MOQ?
- What is the price basis?
- What packing method do you recommend?
- What is the loading quantity?
- What is the lead time?
- Is sample available?
- What surface treatment is available?
- Can you confirm the drawing?

## What AI May Do

AI may:

- identify supplier confirmation need
- prepare RFQ draft text
- prepare supplier question list
- explain why supplier input is needed
- flag missing technical or commercial fields
- mark the item as `supplier_confirm_needed`

## What AI Must Not Do

AI must not:

- send RFQ automatically
- contact supplier automatically
- commit price
- select supplier automatically
- confirm production
- approve samples
- promise delivery
- use supplier data in a customer quote without review

## Human Approval

Paul approval is required before:

- contacting supplier
- sending RFQ
- confirming supplier quote
- using supplier data in customer quote
- relying on supplier answer for production feasibility, quality standard, delivery time, or price

## Future Controlled Workflow Boundary

A future controlled workflow may prepare an RFQ package after review, but execution must remain separate:

```text
AI prepares supplier questions
-> Paul reviews
-> approved supplier RFQ draft later
-> approved send later
-> supplier reply reviewed later
-> quote preparation only after approval
```
