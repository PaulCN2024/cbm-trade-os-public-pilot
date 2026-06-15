# Phase 0A: AI Draft & Approval Foundation

## 1. Purpose

Define a unified foundation for future AI-generated drafts, human review, approval status, and risk control in CBM Trade OS.

This document is planning only. It does not implement database tables, API routes, UI, model calls, or automation.

## 2. Why Phase 0A Starts With AI Draft & Approval Foundation

CBM Trade OS should become an AI-first foreign trade operating system, but high-risk commercial actions must remain human-controlled.

Before adding real AI model calls, the system needs a consistent way to store and review AI output as drafts. This prevents scattered AI features from bypassing manual review or creating unsafe business commitments.

## 3. Core Concepts

### ai_task

A request for AI assistance, linked to a business purpose such as inquiry analysis, reply drafting, supplier RFQ drafting, quotation drafting, document summary, or knowledge update.

### ai_draft

The AI-generated output. It is always draft-only until a human reviews it.

### approval_review

The human review record for an AI draft, including reviewer decision, notes, risk assessment, and final status.

### risk_level

A simple risk classification used to decide whether an AI draft can be shown directly, needs review, is high risk, or must be blocked.

### source_business_object

The business record that triggered the AI task, such as customer, inquiry, supplier, quotation, document, shipment, or communication log.

### human_decision_status

The human-controlled lifecycle status for the draft.

## 4. Supported Future Draft Types

- `customer_reply_draft`
- `supplier_rfq_draft`
- `quotation_draft`
- `pi_draft`
- `whatsapp_draft`
- `email_draft`
- `knowledge_article_draft`
- `document_summary_draft`

## 5. Suggested Future Fields

Suggested future `ai_task` fields:

- `id`
- `task_type`
- `source_business_object_type`
- `source_business_object_id`
- `requested_by`
- `input_summary`
- `status`
- `risk_level`
- `created_at`
- `updated_at`

Suggested future `ai_draft` fields:

- `id`
- `ai_task_id`
- `draft_type`
- `draft_title`
- `draft_content`
- `structured_payload`
- `language`
- `risk_level`
- `approval_required`
- `safety_warnings`
- `created_at`
- `updated_at`

Suggested future `approval_review` fields:

- `id`
- `ai_draft_id`
- `reviewer_id`
- `decision_status`
- `review_note`
- `risk_level`
- `approved_for_manual_use_at`
- `sent_manually_at`
- `archived_at`
- `created_at`
- `updated_at`

These fields are suggestions only and are not implemented in Phase 0A-1.

## 6. Approval Statuses

- `draft`: created but not reviewed.
- `needs_review`: requires human review before use.
- `approved_internal`: approved for internal use only.
- `rejected`: rejected by human reviewer.
- `sent_manual`: sent manually by a human outside automatic execution.
- `archived`: kept for record but no longer active.

## 7. Risk Levels

- `low`: internal summary or low-risk classification.
- `medium`: customer-facing draft or operational suggestion requiring review.
- `high`: commercial terms, quotation, PI, payment, delivery, or technical commitment.
- `blocked`: must not be executed automatically.

## 8. Actions AI Can Do Automatically

AI may automatically create draft-only internal outputs such as:

- summarize inquiries
- classify business line
- list missing information
- suggest follow-up topics
- draft internal task descriptions
- summarize documents
- propose archive paths
- suggest knowledge article updates

These actions must not send messages or confirm commercial terms.

## 9. Actions AI Must Submit For Human Approval

AI must submit these as drafts for human review:

- customer reply draft
- WhatsApp draft
- email draft
- supplier RFQ draft
- quotation draft
- PI draft
- customer-facing document draft
- production-related instruction draft
- technical feasibility suggestion
- payment or delivery discussion draft

## 10. Actions AI Must Never Execute Automatically

AI must never automatically:

- send customer messages
- send supplier messages
- send official quotations
- send PI
- confirm price
- confirm delivery time
- confirm payment terms
- confirm bank account information
- promise compensation
- judge responsibility
- place orders
- arrange shipment
- approve production
- issue official customer documents

## 11. Relationship With Existing Command-Center Parser/Executor

The existing Command Center already follows a safe pattern:

```text
command -> parse intent -> plan -> preview -> manual review -> safe result
```

Future AI Draft & Approval Foundation should reuse this pattern. Command Center can become one source of `ai_task` records, while its result cards can point to related `ai_draft` and `approval_review` records.

High-risk command results should continue to show manual review warnings and blocked actions.

## 12. Relationship With Future AI Model Gateway

Future AI model calls should go through a controlled AI Model Gateway layer.

The gateway should:

- receive a task request
- apply safety rules
- call the selected model
- save output as `ai_draft`
- assign `risk_level`
- force `approval_required` where needed
- never send customer-facing output directly

The model gateway should not bypass approval review.

## 13. Phase 0A Implementation Roadmap

Recommended future steps:

1. Document business object relationships for AI tasks and drafts.
2. Design table shapes for `ai_tasks`, `ai_drafts`, and `approval_reviews`.
3. Add read-only mock examples in documentation.
4. Add validation rules for risk levels and approval statuses.
5. Add API-only draft creation in a later approved phase.
6. Add admin read-only draft review UI.
7. Add manual approval workflow.
8. Only after approval workflow is stable, connect a real AI model gateway.

## 14. Acceptance Criteria For Future Implementation

Future implementation should be accepted only if:

- all AI output is stored as draft-only by default
- high-risk actions always require human review
- approval status is explicit and auditable
- draft content is linked to a source business object
- no AI path can send messages automatically
- no AI path can issue official quotation or PI automatically
- no AI path can confirm price, delivery, payment, bank, compensation, responsibility, order, production, or shipment
- existing Command Center safety behavior remains intact
- implementation is incremental and does not require rebuilding the whole system
