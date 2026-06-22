# Supplier Intelligence Risk And Confidence Rules

## Purpose

This document defines planning rules for risk, confidence, and RFQ readiness in AI Supplier Intelligence.

The rules are advisory and review-first. They do not confirm supplier capability, create RFQs, contact suppliers, create quotations, or make business commitments.

## Confidence Levels

### `low`

Use when:

- drawings/specs are missing
- material or process is unclear
- supplier category is unknown
- customer requirement is vague
- product family is uncertain
- supplier capability evidence is weak or unavailable

Meaning:

AI should avoid confident language and recommend collecting more information before supplier matching or RFQ preparation.

### `medium`

Use when:

- supplier type is likely correct
- product category is reasonably understood
- some key details still need supplier confirmation
- capability evidence is partial
- RFQ draft may be possible with assumptions

Meaning:

AI may prepare a question list or draft-only RFQ for Paul review, but must not imply readiness to send.

### `high`

Use when:

- product category is known
- process is known
- material/spec is clear
- supplier capability matches the requirement
- missing information is minor
- risk level is low or controlled

Meaning:

AI may suggest that the item is ready for Paul review, but Paul still controls supplier contact and RFQ sending.

## Risk Levels

### `low`

Use when:

- standard product
- known supplier category
- clear specs
- common process
- low confidentiality concern
- no price/delivery/quality responsibility pressure

### `medium`

Use when:

- some missing info
- new supplier category
- uncertain packing/loading
- lead time unknown
- unit weight unknown
- supplier confirmation needed

### `high`

Use when:

- custom engineering
- unclear drawing
- unknown material
- supplier capability not verified
- quality/standard risk
- price-only inquiry with incomplete specs
- installation/site measurement responsibility is unclear
- customer expects delivery, warranty, or feasibility confirmation before enough evidence exists

## RFQ Readiness

### `not_ready`

Use when core product, specification, drawing, quantity, or responsibility information is missing.

### `rfq_draft_possible`

Use when a draft can be prepared for Paul review, but the draft must include assumptions and must not be sent yet.

### `ready_for_paul_review`

Use when the supplier type, questions, and risks are clear enough for Paul to decide whether to send an RFQ later.

### `blocked_by_missing_info`

Use when missing customer or product information blocks even a useful supplier RFQ draft.

### `risk_hold`

Use when supplier contact could create commercial, technical, quality, responsibility, confidentiality, or relationship risk.

## Risk Controls

AI Supplier Intelligence should:

- ask supplier questions first when confirmation is required
- ask customer for missing information when supplier questions would be premature
- avoid quotation readiness when supplier confirmation is required
- mark assumptions explicitly
- separate RFQ draft preparation from RFQ sending
- require Paul approval before supplier contact
- flag missing drawings, unclear specs, unknown material, unit weight, packing/loading, MOQ, lead time, quality standard, and responsibility boundary

AI Supplier Intelligence must not:

- quote before supplier confirmation when required
- promise lead time before supplier confirms
- rely on AI guess as fact
- confirm supplier capability from incomplete evidence
- mark RFQ as sent
- select a final supplier automatically

## Paul Approval Required

Paul approval is required before:

- RFQ sending
- supplier contact
- supplier selection
- customer-facing quote preparation using supplier data
- price confirmation
- delivery time confirmation
- production feasibility confirmation
- payment, PI, order, production, or shipment actions
