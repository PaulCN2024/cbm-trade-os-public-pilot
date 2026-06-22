# Supplier Intelligence Data Model Plan

## Purpose

This document defines the future data foundation for AI Supplier Intelligence before real supplier matching, RFQ creation, or supplier outreach is implemented.

The goal is to make supplier-fit review structured and auditable while keeping all supplier contact, RFQ sending, quotation, production feasibility, price, delivery, and order decisions under Paul human review.

This is planning only. It does not create migrations, tables, API routes, SQL execution, AI provider calls, supplier RFQs, supplier messages, quotations, customer replies, or business execution.

## Core Workflow

```text
inquiry intelligence result
-> required supplier type
-> capability matching
-> supplier question list
-> RFQ readiness evaluation
-> risk/confidence scoring
-> RFQ draft recommendation
-> Paul human review
-> future approved supplier contact
```

## Proposed Future Tables

These tables are plan-only. Do not create migrations from this document without a separate approved schema task.

### A. `supplier_intelligence_requests`

Purpose:

Store the root supplier intelligence review package. It should connect an inquiry intelligence result, inquiry, quote review, manual note, supplier search note, or product requirement to one reviewable supplier-matching package.

Fields:

- `id`
- `source_type`
- `source_entity_id`
- `inquiry_intelligence_request_id`
- `inquiry_id`
- `customer_id`
- `inquiry_title`
- `product_category`
- `product_family`
- `material`
- `required_supplier_type`
- `country_or_region_preference`
- `priority_level`
- `risk_level`
- `confidence_level`
- `request_status`
- `requested_by`
- `requested_at`
- `created_at`
- `updated_at`

`source_type` examples:

- `inquiry_intelligence`
- `inquiry`
- `quotation_review`
- `manual_note`
- `supplier_search`
- `product_requirement`

`request_status` examples:

- `draft`
- `pending`
- `matched`
- `supplier_confirm_needed`
- `rfq_draft_ready`
- `risk_hold`
- `archived`

### B. `supplier_capability_matches`

Purpose:

Store proposed supplier capability matches for review. A match means "candidate fit for review", not confirmed supplier capability.

Fields:

- `id`
- `supplier_intelligence_request_id`
- `supplier_id`
- `supplier_name`
- `capability_type`
- `product_category`
- `material`
- `process`
- `match_level`
- `match_reason`
- `confidence_level`
- `risk_level`
- `created_at`

`match_level` examples:

- `strong_match`
- `possible_match`
- `needs_confirm`
- `not_ready`
- `risk_hold`

### C. `supplier_questions`

Purpose:

Store supplier questions needed before RFQ review, quotation preparation, or supplier capability confidence can improve.

Fields:

- `id`
- `supplier_intelligence_request_id`
- `question_type`
- `question_text`
- `required_level`
- `status`
- `reason`
- `created_at`

`question_type` examples:

- `capability`
- `material`
- `thickness`
- `unit_weight`
- `MOQ`
- `price_basis`
- `packing`
- `loading_quantity`
- `FOB_cost`
- `lead_time`
- `sample`
- `surface_treatment`
- `drawing_confirmation`
- `quality_standard`
- `other`

### D. `supplier_rfq_readiness`

Purpose:

Store whether an RFQ draft can be prepared for Paul review and why it cannot be sent automatically.

Fields:

- `id`
- `supplier_intelligence_request_id`
- `readiness_status`
- `can_prepare_rfq_draft`
- `can_send_rfq`
- `blockers`
- `assumptions_needed`
- `risk_if_sent_now`
- `confidence_level`
- `created_at`

`readiness_status` examples:

- `not_ready`
- `rfq_draft_possible`
- `ready_for_paul_review`
- `blocked_by_missing_info`
- `risk_hold`

### E. `supplier_rfq_drafts`

Purpose:

Store draft-only RFQ text for Paul review. Drafts must never be treated as sent messages or supplier commitments.

Fields:

- `id`
- `supplier_intelligence_request_id`
- `language`
- `channel`
- `draft_subject`
- `draft_body`
- `draft_status`
- `safety_notes`
- `requires_approval`
- `created_at`
- `updated_at`

Required defaults:

- `draft_status` should start as draft-only.
- `requires_approval` should default to true.
- `can_send` should not be implied by this table.

### F. `supplier_intelligence_reviews`

Purpose:

Record Paul review decisions before any future controlled supplier action.

Fields:

- `id`
- `supplier_intelligence_request_id`
- `reviewer`
- `review_status`
- `decision`
- `reviewer_notes`
- `approved_next_action`
- `reviewed_at`
- `created_at`

Review records should capture internal decision context only. They do not send RFQs, confirm suppliers, create quotations, or trigger business actions.

## Linkage To Existing Modules

Future Supplier Intelligence should link to:

- Inquiry Intelligence
- Suppliers
- Manufacturing Capabilities
- Knowledge Base
- Quote Review
- Follow-up Assistant
- AI Daily Workbench
- AI Command Center
- Future RFQ module
- Future ERPNext/Frappe SRM/RFQ concepts

## Data Projection Principles

Future read-only Admin UI projections should:

- show reviewed supplier-matching metadata only
- preserve internal keys in API/data layers
- avoid exposing supplier private notes unless explicitly designed
- avoid exposing customer confidential details unnecessarily in RFQ drafts
- mark all RFQ drafts as draft-only and not sent
- keep `can_send_rfq` false until a separate approved controlled-send workflow exists
- keep fallback examples available when data is unavailable

## Non-goals

This plan does not authorize:

- real supplier matching now
- RFQ creation now
- supplier outreach now
- quotation creation now
- production feasibility confirmation now
- supplier selection now
- AI provider use now
- external supplier search now
- database migration or SQL execution now
