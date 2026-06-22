# Inquiry Intelligence Data Model Plan

## Purpose

This document defines the future data foundation for AI Inquiry Intelligence before real AI analysis, supplier RFQ, or quote generation is implemented.

The goal is to make inquiry analysis reviewable and structured while keeping all business-risk actions human-approved.

This is planning only. It does not create migrations, tables, API routes, AI provider calls, supplier RFQs, quotations, customer replies, or business execution.

## Core Workflow

```text
inquiry / customer message / drawing note
-> inquiry analysis request
-> product classification
-> missing information check
-> quotation readiness evaluation
-> supplier/RFQ requirement check
-> risk and confidence scoring
-> reply draft recommendation
-> Paul human review
-> future approved next action
```

## Proposed Future Tables

Plan only. Do not create migrations from this document without a separate approved schema task.

### A. `inquiry_intelligence_requests`

Purpose:

Store the root inquiry intelligence review request. It should connect a customer message, inquiry, document note, drawing note, manual note, or later upload source to one reviewable analysis package.

Fields:

- `id`
- `source_type`
- `source_entity_id`
- `inquiry_id`
- `customer_id`
- `customer_name`
- `company_name`
- `country`
- `source_channel`
- `inquiry_title`
- `inquiry_text`
- `language`
- `analysis_status`
- `priority_level`
- `risk_level`
- `confidence_level`
- `requested_by`
- `requested_at`
- `created_at`
- `updated_at`

`source_type` examples:

- `inquiry`
- `email`
- `whatsapp`
- `website_form`
- `business_card`
- `manual_note`
- `document`
- `drawing`

`analysis_status` examples:

- `draft`
- `pending`
- `analyzed`
- `needs_more_info`
- `supplier_confirm_needed`
- `quote_ready`
- `risk_hold`
- `archived`

### B. `inquiry_product_classifications`

Purpose:

Store the proposed product/category classification for operator review. Classification must remain advisory until Paul accepts it or uses it in a later approved workflow.

Fields:

- `id`
- `inquiry_intelligence_request_id`
- `primary_category`
- `secondary_category`
- `product_family`
- `material`
- `likely_process`
- `supplier_type_needed`
- `classification_confidence`
- `classification_notes`
- `created_at`

### C. `inquiry_missing_information`

Purpose:

Track information gaps that block quotation, supplier confirmation, or customer reply quality.

Fields:

- `id`
- `inquiry_intelligence_request_id`
- `info_type`
- `info_label`
- `required_level`
- `status`
- `reason`
- `created_at`

`info_type` examples:

- `specification`
- `thickness`
- `dimension`
- `drawing`
- `photo`
- `quantity`
- `quantity_breakdown`
- `surface_treatment`
- `packing`
- `target_port`
- `delivery_time`
- `installation_responsibility`
- `buyer_role`
- `brand_private_label`
- `payment_terms`
- `project_location`
- `standard_or_code`
- `other`

### D. `inquiry_quotation_readiness`

Purpose:

Store quote-readiness status and blockers so the UI can show whether a budget estimate or formal quotation is safe to prepare.

Fields:

- `id`
- `inquiry_intelligence_request_id`
- `readiness_status`
- `can_prepare_budget_estimate`
- `can_prepare_formal_quote`
- `quote_blockers`
- `assumption_needed`
- `risk_if_quoted_now`
- `confidence_level`
- `created_at`

`readiness_status` examples:

- `not_ready`
- `budget_estimate_possible`
- `formal_quote_possible`
- `supplier_confirm_needed`
- `blocked_by_missing_info`
- `risk_hold`

### E. `inquiry_supplier_rfq_requirements`

Purpose:

Store whether supplier confirmation or a supplier RFQ draft is needed before quotation or customer reply.

Fields:

- `id`
- `inquiry_intelligence_request_id`
- `supplier_required`
- `supplier_category`
- `rfq_needed`
- `rfq_reason`
- `supplier_questions`
- `priority_level`
- `created_at`

### F. `inquiry_reply_drafts`

Purpose:

Store draft-only customer reply text for Paul review. Drafts must not be sent automatically.

Fields:

- `id`
- `inquiry_intelligence_request_id`
- `language`
- `channel`
- `draft_subject`
- `draft_body`
- `draft_status`
- `safety_notes`
- `requires_approval`
- `created_at`
- `updated_at`

### G. `inquiry_intelligence_reviews`

Purpose:

Record Paul review decisions before any future controlled action.

Fields:

- `id`
- `inquiry_intelligence_request_id`
- `reviewer`
- `review_status`
- `decision`
- `reviewer_notes`
- `approved_next_action`
- `reviewed_at`
- `created_at`

## Linkage To Existing Modules

Future Inquiry Intelligence records may link to:

- Inquiries
- Customers
- Customer Verification
- Follow-up Assistant
- Supplier Intelligence
- Quote Review
- Knowledge Base
- File/Drawing Center
- AI Daily Workbench
- AI Command Center

## Non-goals

- No AI provider call now.
- No real file or drawing parsing now.
- No supplier RFQ now.
- No quote creation now.
- No customer or supplier message sending now.
- No customer mutation now.
- No inquiry mutation now.
- No PI, order, payment, production, or shipment action now.
