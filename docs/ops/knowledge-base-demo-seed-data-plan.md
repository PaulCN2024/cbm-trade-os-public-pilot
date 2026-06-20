# Knowledge Base Demo Seed Data Plan

## Purpose

Plan safe demo seed data for the future Knowledge Base read-only foundation.

This document does not create seed SQL, run SQL, modify migrations, or insert data.

## Seed Principles

- Use `DEMO_` prefixes for demo slugs, source references, and obvious sample labels.
- Use safe sample data only.
- Do not use real confidential customer data.
- Do not create real price commitments.
- Do not create actual supplier promises.
- Use insert-only SQL in a future seed task.
- Avoid destructive SQL.
- Make seed scripts idempotent where possible.
- Clearly mark demo data as non-production knowledge.

## Demo Categories

Planned demo categories:

- `DEMO_PRODUCT_KNOWLEDGE`
- `DEMO_SUPPLIER_KNOWLEDGE`
- `DEMO_QUOTATION_RULES`
- `DEMO_FILE_KNOWLEDGE`
- `DEMO_COMMUNICATION_TEMPLATES`
- `DEMO_TRADE_SOP`
- `DEMO_COMPLIANCE_SAFETY`

## Demo Knowledge Items

### 1. Aluminum Window Inquiry Checklist

- category: `DEMO_PRODUCT_KNOWLEDGE`
- summary: Check drawings, opening size, profile system, glass, hardware, color, quantity, and destination before quote readiness.
- source_type: `manual_sop`
- confidence: `high`
- verification_status: `verified`
- risk_level: `medium`
- visibility_scope: `ai_reference_only`

### 2. Curtain Wall Quotation Readiness Checklist

- category: `DEMO_PRODUCT_KNOWLEDGE`
- summary: Curtain wall inquiries require elevation drawings, system type, glass specification, aluminum finish, quantity area, and installation responsibility confirmation.
- source_type: `manual_sop`
- confidence: `medium`
- verification_status: `needs_review`
- risk_level: `high`
- visibility_scope: `internal_only`

### 3. Light Steel Keel Quotation Assumptions

- category: `DEMO_PRODUCT_KNOWLEDGE`
- summary: Light steel keel quotes should separate material model, thickness, length, quantity, packing, and destination; assumptions must be reviewed.
- source_type: `quotation_note`
- confidence: `medium`
- verification_status: `needs_review`
- risk_level: `medium`
- visibility_scope: `ai_reference_only`

### 4. Ceiling System Option Comparison

- category: `DEMO_PRODUCT_KNOWLEDGE`
- summary: Ceiling system comparison should distinguish product type, panel size, suspension system, finish, fire rating needs, and installation notes.
- source_type: `product_catalog`
- confidence: `medium`
- verification_status: `draft`
- risk_level: `low`
- visibility_scope: `internal_only`

### 5. Supplier Capability Matching Rule

- category: `DEMO_SUPPLIER_KNOWLEDGE`
- summary: Supplier matching should consider product category, process, MOQ, surface treatment, packaging, quality risk, and recent manual confirmation.
- source_type: `supplier_record`
- confidence: `medium`
- verification_status: `needs_review`
- risk_level: `high`
- visibility_scope: `internal_only`

### 6. FOB Qingdao Quotation Cost Reminder

- category: `DEMO_QUOTATION_RULES`
- summary: FOB Qingdao quote preparation should confirm local port cost assumptions, export handling, packing, loading, and validity before customer use.
- source_type: `quotation_note`
- confidence: `medium`
- verification_status: `needs_review`
- risk_level: `high`
- visibility_scope: `confidential`

### 7. Tax-inclusive vs Non-tax Quotation Note

- category: `DEMO_QUOTATION_RULES`
- summary: Tax-inclusive and non-tax supplier quotes must be separated internally and reviewed before customer quotation preparation.
- source_type: `manual_sop`
- confidence: `medium`
- verification_status: `needs_review`
- risk_level: `high`
- visibility_scope: `confidential`

### 8. Customer Complaint Handling Principle

- category: `DEMO_COMMUNICATION_TEMPLATES`
- summary: Complaint responses should acknowledge receipt, request evidence, avoid responsibility judgment, and route to human review.
- source_type: `email_template`
- confidence: `high`
- verification_status: `verified`
- risk_level: `high`
- visibility_scope: `customer_safe_after_review`

### 9. Delay Explanation Template Principle

- category: `DEMO_COMMUNICATION_TEMPLATES`
- summary: Delay explanations should be factual, reviewed by a human, and avoid unapproved compensation, blame, or delivery promises.
- source_type: `email_template`
- confidence: `medium`
- verification_status: `needs_review`
- risk_level: `high`
- visibility_scope: `customer_safe_after_review`

### 10. Installation Manual Source Tracking Rule

- category: `DEMO_FILE_KNOWLEDGE`
- summary: Installation manual knowledge should cite document title, version/date when known, linked product, and verification status.
- source_type: `installation_manual`
- confidence: `medium`
- verification_status: `draft`
- risk_level: `medium`
- visibility_scope: `ai_reference_only`

### 11. AI Prospecting Compliance Rule

- category: `DEMO_COMPLIANCE_SAFETY`
- summary: AI prospecting suggestions must be source-reviewed, opt-out aware, and never auto-send outreach.
- source_type: `manual_sop`
- confidence: `high`
- verification_status: `verified`
- risk_level: `high`
- visibility_scope: `internal_only`

### 12. No Auto-send / No Price Commitment Rule

- category: `DEMO_COMPLIANCE_SAFETY`
- summary: AI may draft and summarize, but it must not send messages, confirm prices, confirm payment terms, or commit delivery without human approval.
- source_type: `manual_sop`
- confidence: `high`
- verification_status: `verified`
- risk_level: `high`
- visibility_scope: `internal_only`

## Future Seed SQL Plan

Create seed SQL only after the schema is reviewed and approved.

Future seed SQL should:

- insert only
- avoid `DELETE`, `DROP`, and destructive `ALTER`
- use `ON CONFLICT` if safe and if stable unique keys exist
- keep slugs and source references prefixed with `DEMO_`
- verify category and item row counts after insert
- be run only in an approved environment

## Validation Plan

Future validation should confirm:

- category count matches the seed plan
- item count matches the seed plan
- review queue count is stable
- admin-read API returns stable data
- UI shows real seeded records instead of fallback
- no forbidden private fields are exposed

## Non-goals

- No real customer data.
- No real supplier commitment.
- No real pricing.
- No confidential customer records.
- No production write without separate approval.
