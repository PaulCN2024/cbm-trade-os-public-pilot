# Business Card Capture Data Model Plan

## Purpose

This plan defines the future data foundation for AI Business Card Capture, where a card, photo, exhibition card, WhatsApp contact image, or customer name card can become a reviewed customer profile draft.

This is planning only. It does not create schema, migrations, API routes, upload handling, OCR, AI provider calls, customer creation, message sending, or business execution.

## Core Workflow

```text
Business card image
-> captured source record
-> AI extraction result
-> customer profile draft
-> duplicate check
-> human review
-> approved customer creation later
-> follow-up draft later
```

The workflow should stay draft-first and human-reviewed. AI may extract, normalize, score, and suggest. Paul must approve any customer creation or external follow-up.

## Proposed Future Tables

These tables are proposed for future planning only. Do not create migrations from this document without a separate schema implementation task and explicit approval.

### A. `card_capture_sources`

Purpose: record the original captured business-card/contact source before extraction.

Proposed fields:

- `id`
- `source_type`
- `source_label`
- `original_file_id`
- `original_filename`
- `captured_channel`
- `captured_at`
- `uploaded_by`
- `processing_status`
- `created_at`
- `updated_at`

`source_type` examples:

- `business_card`
- `exhibition_card`
- `whatsapp_contact_image`
- `referral_card`
- `supplier_recommended_contact`
- `other`

`captured_channel` examples:

- `trade_show`
- `whatsapp`
- `email`
- `manual_upload`
- `referral`
- `supplier`

`processing_status` values:

- `uploaded`
- `extraction_pending`
- `extracted`
- `needs_review`
- `approved`
- `rejected`
- `archived`

### B. `card_extraction_results`

Purpose: store the AI/OCR extraction result separately from the eventual customer draft.

Proposed fields:

- `id`
- `capture_source_id`
- `extracted_name`
- `extracted_company`
- `extracted_title`
- `extracted_email`
- `extracted_phone`
- `extracted_whatsapp`
- `extracted_website`
- `extracted_country`
- `extracted_address`
- `extracted_business_type`
- `extracted_product_interest`
- `raw_extraction_json`
- `confidence_level`
- `extraction_provider`
- `extraction_language`
- `extraction_notes`
- `created_at`

Notes:

- `raw_extraction_json` should be protected and internal-only.
- Low-confidence fields must not be treated as verified data.
- Extraction output is not a customer record.

### C. `customer_profile_drafts`

Purpose: hold reviewed customer-profile proposals before any approved customer creation.

Proposed fields:

- `id`
- `capture_source_id`
- `extraction_result_id`
- `proposed_customer_name`
- `proposed_company_name`
- `proposed_country`
- `proposed_email`
- `proposed_phone`
- `proposed_whatsapp`
- `proposed_website`
- `proposed_customer_type`
- `proposed_product_interest`
- `source_channel`
- `confidence_level`
- `duplicate_status`
- `risk_level`
- `review_status`
- `reviewer_notes`
- `approved_customer_id`
- `created_at`
- `updated_at`

Notes:

- `approved_customer_id` should stay empty until a future approved customer creation workflow exists.
- `review_status` must not imply that a message was sent or a customer was created.
- Draft records should be visible to Paul as internal review material only.

### D. `card_duplicate_checks`

Purpose: record potential matches against existing customers, companies, contacts, or prospect records.

Proposed fields:

- `id`
- `customer_profile_draft_id`
- `match_type`
- `matched_entity_type`
- `matched_entity_id`
- `matched_label`
- `match_confidence`
- `match_reason`
- `created_at`

`match_type` values:

- `same_email`
- `same_company`
- `same_phone`
- `same_website`
- `similar_company_name`
- `possible_duplicate`

Notes:

- Duplicate checks are warnings, not final decisions.
- Paul should decide whether a draft is new, duplicate, related, or rejected.

### E. `card_followup_drafts`

Purpose: store draft-only follow-up messages generated from reviewed card data.

Proposed fields:

- `id`
- `customer_profile_draft_id`
- `language`
- `channel`
- `draft_subject`
- `draft_body`
- `tone`
- `review_status`
- `risk_notes`
- `created_at`
- `updated_at`

Notes:

- Follow-up drafts are never sent automatically.
- A future sending workflow must require explicit approval and audit logging.

## Enumerations

### `confidence_level`

- `low`
- `medium`
- `high`

### `risk_level`

- `low`
- `medium`
- `high`

### `review_status`

- `draft`
- `needs_review`
- `approved`
- `rejected`
- `archived`

### `channel`

- `email`
- `whatsapp`
- `linkedin`
- `phone`
- `other`

## Linkage To Existing Modules

### Customer Center

Approved drafts may later become customer records, but only after a controlled approval workflow. Until then, customer-profile drafts should remain separate from official customer data.

### AI Command Center

The AI Command Center can surface review tasks such as "review captured trade-show contact" or "prepare follow-up draft", but it must not create customers or send messages automatically.

### AI Daily Workbench

The daily workbench can show counts for pending card reviews, missing fields, possible duplicates, and follow-up drafts awaiting review.

### AI Knowledge Center

Knowledge can help classify customer type and product interest, but unverified knowledge must not become a customer commitment or final trust decision.

### Follow-up Assistant

Follow-up drafts may use approved customer-profile draft data. The assistant must keep drafts unsent until Paul approves a specific message.

### Prospecting Center

Business card capture complements prospecting. It should not scrape protected platforms or auto-import public profiles.

## RLS And Privacy Notes

Initial security posture should be conservative:

- authenticated read only first
- no public access
- no customer-facing direct access
- sensitive contact fields protected
- future role-based policy before real use
- no auto customer creation
- no anonymous read policy
- no service-role exposure in frontend

Future RLS planning should separate:

- read access to review queues
- write access for upload/extraction system jobs
- approval access for Paul/admin reviewers
- audit access for sensitive field changes

## Non-goals

- No OCR now.
- No file storage now.
- No upload now.
- No customer creation now.
- No sending now.
- No public contact exposure now.
- No schema migration now.
- No API route now.
- No AI provider integration now.
