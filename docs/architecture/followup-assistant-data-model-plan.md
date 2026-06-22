# Follow-up Assistant Data Model Plan

## Purpose

This document defines the future data foundation for AI Follow-up Assistant before any real task creation, AI drafting, or message sending is implemented.

The Follow-up Assistant should help Paul decide who needs follow-up, why, when, and what to ask. It must remain advisory until a separate controlled-write and approval workflow exists.

## Core Workflow

```text
customer / inquiry / verification result
-> follow-up candidate
-> priority/timing evaluation
-> missing information check
-> draft recommendation
-> Paul review
-> approved follow-up task later
-> approved message draft later
-> no automatic send
```

## Proposed Future Tables

This is planning only. Do not create migrations from this document without a separate approved schema task.

### A. `followup_candidates`

Purpose:

Store candidate follow-up records from customers, inquiries, customer verification, business-card capture, quotations, and manual notes.

Fields:

- `id`
- `source_type`
- `source_entity_id`
- `customer_id`
- `inquiry_id`
- `verification_request_id`
- `customer_name`
- `company_name`
- `contact_name`
- `country`
- `language`
- `followup_reason`
- `current_stage`
- `priority_level`
- `risk_level`
- `confidence_level`
- `status`
- `created_at`
- `updated_at`

`source_type` examples:

- `customer`
- `inquiry`
- `customer_verification`
- `business_card`
- `quotation`
- `manual_note`

`current_stage` examples:

- `first_contact`
- `information_request`
- `quotation_pending`
- `quotation_sent`
- `sample_discussion`
- `negotiation`
- `waiting_response`
- `dormant`
- `risk_hold`
- `closed`

`status` examples:

- `draft`
- `needs_review`
- `approved_task`
- `waiting`
- `completed`
- `skipped`
- `archived`

### B. `followup_missing_information`

Purpose:

Track missing information that should be requested before quotation, supplier inquiry, or next customer response.

Fields:

- `id`
- `followup_candidate_id`
- `info_type`
- `info_label`
- `required_level`
- `status`
- `notes`
- `created_at`

`info_type` examples:

- `company_website`
- `project_location`
- `product_specification`
- `quantity`
- `target_price`
- `buyer_role`
- `installation_responsibility`
- `drawings_or_photos`
- `delivery_port`
- `payment_terms`
- `timeline`

### C. `followup_recommendations`

Purpose:

Store recommended next action, reason, timing, and risk level for review.

Fields:

- `id`
- `followup_candidate_id`
- `recommended_action`
- `recommendation_reason`
- `suggested_timing`
- `priority_level`
- `risk_level`
- `confidence_level`
- `created_at`

`recommended_action` examples:

- `request_more_information`
- `send_product_intro`
- `prepare_quote_after_missing_info`
- `follow_up_quotation`
- `ask_project_detail`
- `hold_due_to_risk`
- `mark_low_priority`
- `wait`

### D. `followup_message_drafts`

Purpose:

Store draft-only messages for Paul review. These drafts are not sent automatically.

Fields:

- `id`
- `followup_candidate_id`
- `language`
- `channel`
- `tone`
- `draft_subject`
- `draft_body`
- `draft_status`
- `safety_notes`
- `requires_approval`
- `created_at`
- `updated_at`

`channel` examples:

- `email`
- `whatsapp`
- `linkedin`
- `phone_script`
- `other`

`draft_status` examples:

- `draft`
- `needs_review`
- `approved`
- `rejected`
- `archived`

### E. `followup_reviews`

Purpose:

Record Paul review decisions before any future controlled action.

Fields:

- `id`
- `followup_candidate_id`
- `reviewer`
- `review_status`
- `decision`
- `reviewer_notes`
- `approved_next_action`
- `reviewed_at`
- `created_at`

`decision` examples:

- `approve_task`
- `revise_message`
- `request_more_context`
- `skip`
- `hold`
- `archive`

## Linkage To Existing Modules

Future Follow-up Assistant records may link to:

- Customers
- Inquiries
- Customer Verification
- Business Card Capture
- AI Daily Workbench
- AI Command Center
- Quote Review
- Knowledge Base
- Future Email/WhatsApp integration

Linkage should remain read-only until a controlled-write workflow exists.

## Non-goals

This plan does not authorize:

- automatic task creation now
- automatic send
- AI provider call now
- external messaging integration now
- customer mutation now
- inquiry mutation now
- quote/PI/order/payment/production/shipment action
