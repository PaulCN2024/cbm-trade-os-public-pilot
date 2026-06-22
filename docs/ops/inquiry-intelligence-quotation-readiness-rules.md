# Inquiry Intelligence Quotation Readiness Rules

## Purpose

This document defines planning rules for deciding whether an inquiry is ready for a budget estimate, formal quotation preparation, supplier confirmation, or risk hold.

The rules are advisory and review-first. They do not create official quotations or commercial commitments.

## Readiness Levels

### `not_ready`

Use when:

- core specifications are missing
- product is unclear
- quantity is missing
- drawing/photo is missing for a custom item

### `budget_estimate_possible`

Use when:

- enough assumptions exist for a rough estimate
- the estimate can be clearly marked as assumption-based
- formal quote is still blocked

### `formal_quote_possible`

Use when:

- specification is clear
- quantity is clear
- packing is clear enough
- delivery port or trade term basis is clear enough
- supplier cost or internal cost basis is clear
- Paul has reviewed the risk boundary

### `supplier_confirm_needed`

Use when:

- product is custom
- material or process is uncertain
- unit weight is missing
- packing/loading is unclear
- supplier category is new
- production feasibility or lead time requires supplier confirmation

### `risk_hold`

Use when:

- customer or request looks suspicious
- request may come from a competitor
- requested price, delivery, or responsibility is unrealistic
- information is conflicting
- payment, warranty, or quality responsibility risk is high

## Budget Estimate vs Formal Quote

Budget estimate:

- can include assumptions
- must be marked as non-binding
- should avoid final delivery, payment, production, or quality commitments
- still requires Paul review before customer-facing use

Formal quote:

- requires confirmed data
- requires human approval
- should use reviewed supplier/internal cost basis
- must not expose hidden internal cost, profit, uplift, exchange-rate detail, or factory-only notes

## Quote Blockers

Common blockers:

- missing thickness
- missing dimensions
- missing drawing
- missing quantity split
- missing surface finish
- missing port
- missing supplier cost
- unclear packaging
- unclear installation responsibility

## Safety Boundary

AI may suggest quotation readiness.

AI must not:

- create a formal quote automatically
- send a budget estimate automatically
- confirm price
- confirm delivery time
- confirm payment terms
- create PI/order/payment/production/shipment actions

Paul approval is required before any commercial quotation or customer-facing pricing is used.
