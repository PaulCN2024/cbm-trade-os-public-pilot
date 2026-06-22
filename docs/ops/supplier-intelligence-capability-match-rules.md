# Supplier Intelligence Capability Match Rules

## Purpose

This document defines planning rules for matching inquiry requirements to supplier capabilities in AI Supplier Intelligence.

The rules are advisory and review-first. They do not confirm supplier capability, select a final supplier, send RFQs, create quotations, or commit price, quality, production feasibility, or delivery time.

## Supplier Capability Dimensions

Supplier capability matching should consider:

- product category
- material
- process
- profile/system type
- drawing/customization capability
- surface treatment
- packing/loading capability
- MOQ
- lead time
- export experience
- quality standard
- region/logistics fit

## Match Levels

### `strong_match`

Use when:

- supplier category clearly matches the required product category
- material is known and supplier supports it
- process is known and supplier supports it
- prior or recorded capability supports the requirement
- missing information is minor and does not change supplier type

Meaning:

The supplier is a strong candidate for Paul review, not an automatically selected supplier.

### `possible_match`

Use when:

- broad category matches
- product family is likely in scope
- supplier type appears plausible
- key details still need confirmation

Meaning:

The supplier may be suitable, but Paul should review the uncertainty before any RFQ.

### `needs_confirm`

Use when:

- drawing is unclear or missing
- specification is incomplete
- material is uncertain
- packing/loading is uncertain
- unit weight is not confirmed
- MOQ or lead time is unknown

Meaning:

Supplier questions should be prepared before any RFQ is sent or any quotation is prepared.

### `not_ready`

Use when:

- inquiry is missing critical information
- product type cannot be identified
- supplier type cannot be determined
- customer scope or responsibility boundary is unclear

Meaning:

Ask customer or Paul for missing information before supplier matching proceeds.

### `risk_hold`

Use when:

- supplier capability or customer requirement is risky/inconsistent
- quality standard is unclear for a critical product
- engineering responsibility is unclear
- site measurement or installation responsibility is unclear
- request could create price, delivery, quality, or liability risk

Meaning:

Do not proceed to RFQ draft or quotation preparation until Paul reviews the risk.

## Product Examples

### Light steel keel

Likely supplier type:

- roll forming supplier

Key capability checks:

- galvanized steel
- thickness
- unit weight
- profile drawing/spec
- packing
- loading quantity
- MOQ
- lead time

Typical match level:

- `needs_confirm` until thickness, unit weight, packing, and loading quantity are clear

### Aluminum window/door

Likely supplier type:

- aluminum profile/window fabrication supplier

Key capability checks:

- aluminum profile system
- glass/accessory sourcing
- drawing review
- surface treatment
- site measurement or installation responsibility
- quality/standard requirement

Typical match level:

- `possible_match` or `risk_hold` when responsibility boundary is unclear

### Ceiling system

Likely supplier type:

- aluminum ceiling supplier
- light steel keel supplier

Key capability checks:

- panel type
- panel/profile thickness
- suspension system
- option/system confirmation
- packing/loading
- MOQ

Typical match level:

- `possible_match` until system option and material are confirmed

### Facade system

Likely supplier type:

- aluminum/glass/fabrication supplier
- project engineering review supplier

Key capability checks:

- drawings
- wind load/standard
- facade system type
- fabrication capability
- surface treatment
- project-specific engineering requirements

Typical match level:

- `risk_hold` when drawings, standards, or engineering responsibility are unclear

## What AI May Do

AI may:

- suggest supplier type
- flag capability match
- prepare supplier question list
- explain why match is uncertain
- suggest RFQ readiness
- summarize missing supplier confirmation points
- mark a match as advisory

## What AI Must Not Do

AI must not:

- select final supplier automatically
- send RFQ automatically
- contact suppliers automatically
- confirm production
- approve sample
- commit supplier price
- promise lead time
- create quotation
- use AI guess as confirmed supplier fact

Paul approval is required before supplier contact, RFQ sending, or using supplier information in customer-facing quotation work.
