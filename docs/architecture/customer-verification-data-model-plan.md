# Customer Verification Data Model Plan

## Purpose

This document defines the future data foundation for AI Customer Verification before any real verification API, external lookup, scraping, search engine, or AI provider call is implemented.

The goal is to help Paul evaluate whether a customer, company, contact, or inquiry source is credible, relevant, duplicated, risky, and worth following up. This plan is data design only. It does not create migrations, run SQL, change API code, modify UI code, mutate customers, send messages, or execute business actions.

## Core Workflow

```text
customer / contact / inquiry source
-> verification request
-> evidence collection
-> duplicate check
-> risk and confidence scoring
-> AI recommendation
-> Paul human review
-> customer status update later, only after approval
```

AI may organize evidence, explain confidence, flag risk, and recommend a next step. AI must not make a final trust decision, create or update customer records, send follow-up, prepare an official quotation, or trigger order/payment/production/shipment actions.

## Proposed Future Tables

These tables are planning targets only. Do not create migrations from this document without a separate schema implementation task, SQL review, RLS plan, and Paul approval.

### A. `customer_verification_requests`

Purpose: one verification case for a customer, contact, inquiry, business card, prospecting lead, WhatsApp contact, email contact, or manual entry.

Fields:

- `id`
- `source_type`
- `source_entity_id`
- `customer_name`
- `company_name`
- `contact_name`
- `email`
- `phone`
- `whatsapp`
- `website`
- `country`
- `inquiry_id`
- `requested_by`
- `requested_at`
- `verification_status`
- `created_at`
- `updated_at`

`source_type` examples:

- `customer`
- `inquiry`
- `business_card`
- `whatsapp_contact`
- `email_contact`
- `manual_entry`
- `prospecting_lead`

`verification_status` examples:

- `draft`
- `pending`
- `in_review`
- `verified`
- `needs_more_info`
- `possible_duplicate`
- `risky`
- `rejected`
- `archived`

Rules:

- `verification_status` is advisory until a human review record exists.
- No automatic transition should create, merge, archive, or update customer records.
- `source_entity_id` should link back to the originating record but should not imply ownership of that record.

### B. `customer_verification_evidence`

Purpose: source-aware evidence rows used to explain why a verification request is credible, uncertain, risky, or incomplete.

Fields:

- `id`
- `verification_request_id`
- `evidence_type`
- `evidence_label`
- `evidence_value`
- `evidence_source`
- `evidence_status`
- `confidence_level`
- `risk_level`
- `notes`
- `created_at`

`evidence_type` examples:

- `email_domain`
- `company_website`
- `company_name`
- `country_match`
- `phone_country_code`
- `whatsapp_identity`
- `inquiry_content`
- `product_interest`
- `duplicate_match`
- `social_profile`
- `registration_info_later`
- `manual_note`

Rules:

- Evidence must keep source and status separate from AI interpretation.
- `ai_inference` later may produce evidence notes, but it must not be treated as fact.
- Missing evidence should be visible without automatically labeling the contact high risk.
- Conflict evidence should always trigger human review.

### C. `customer_verification_scores`

Purpose: normalized score snapshot for a verification request.

Fields:

- `id`
- `verification_request_id`
- `credibility_score`
- `relevance_score`
- `risk_score`
- `duplicate_score`
- `followup_priority_score`
- `confidence_level`
- `risk_level`
- `score_explanation`
- `created_at`

Suggested score meanings:

- `credibility_score`: how complete and consistent the identity/company evidence appears.
- `relevance_score`: how relevant the customer appears to CBM product lines and foreign-trade workflows.
- `risk_score`: how many risk or conflict signals require caution.
- `duplicate_score`: how likely the record matches an existing customer/contact/inquiry.
- `followup_priority_score`: whether Paul should spend time asking for more information.

Rules:

- Scores are advisory.
- Scores must be accompanied by `score_explanation`.
- Scores must not directly trigger sending, customer creation, customer status mutation, quote generation, or order workflow.

### D. `customer_verification_duplicate_matches`

Purpose: record possible duplicate matches for human review.

Fields:

- `id`
- `verification_request_id`
- `matched_entity_type`
- `matched_entity_id`
- `match_type`
- `matched_label`
- `match_confidence`
- `match_reason`
- `created_at`

`match_type` examples:

- `same_email`
- `same_company`
- `same_website`
- `same_phone`
- `same_whatsapp`
- `similar_company_name`
- `same_country_and_company`
- `possible_related_contact`

Rules:

- Duplicate matches are warnings, not merge commands.
- Human review is required before linking, merging, rejecting, or archiving records.
- No automatic deduplication should run from this table.

### E. `customer_verification_reviews`

Purpose: Paul or another reviewer records the actual decision and next step.

Fields:

- `id`
- `verification_request_id`
- `review_status`
- `reviewer`
- `reviewer_notes`
- `decision`
- `decision_reason`
- `next_action`
- `reviewed_at`
- `created_at`

`decision` examples:

- `continue_followup`
- `request_more_info`
- `mark_verified`
- `mark_possible_duplicate`
- `mark_risky`
- `hold`
- `reject`
- `archive`

Rules:

- Review decisions are the boundary between AI suggestion and business action.
- Future system effects require a separate controlled-write workflow.
- Reviewer identity and reason should be preserved for auditability.

## Linkage To Existing Modules

### Customers

Customer verification may read existing customer metadata and later propose customer status updates. It must not auto-create, auto-update, merge, or archive customers.

### Inquiries

Inquiry source and product interest can create a verification request. Inquiry analysis can provide relevance evidence, missing information, and risk signals.

### AI Development Customer / Prospecting

Prospecting leads should enter verification before outreach. Verification should show source, confidence, and risk before any draft follow-up is prepared.

### Business Card Capture

Business card extraction results can become verification requests. Real upload/OCR remains paused/deferred, so early integration should use existing read-only/demo metadata only.

### Follow-up Assistant

Follow-up Assistant should consume only reviewed verification context. It may draft questions or follow-up text, but it must not send.

### Quote Review

Quote readiness should not rely on unverified customer identity. Verification may flag missing buyer role, company website, country mismatch, or duplicate risk before quote preparation.

### AI Daily Workbench

The workbench may show customer verification queue counts, blocked follow-ups, risky leads, and needs-more-info items.

### AI Command Center

AI Command Center may route commands such as "verify this customer" into the verification workflow, but it must show approval boundaries before any write or outreach action.

### Knowledge Base

Knowledge Base may store customer type rules, product fit rules, country/domain notes, and safe follow-up templates. Verified knowledge should be cited; AI guesses should be labeled.

## Non-goals

- No real company lookup now.
- No external search now.
- No scraping now.
- No AI provider call now.
- No automatic customer status mutation.
- No automatic customer creation.
- No customer merge or archive action.
- No sending.
- No quote, PI, order, payment, production, or shipment action.
- No schema migration or SQL execution from this plan.
