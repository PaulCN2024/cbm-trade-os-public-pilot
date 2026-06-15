# Phase 0A: Numbering Utility Implementation Plan

## 1. Purpose

Plan how CBM Trade OS should safely implement a future business numbering utility/service.

This document is planning only. It does not implement code, database fields, migrations, API routes, or UI changes.

## 2. Relationship With The Human-Readable Business Numbering Plan

This document follows `phase-0a-human-readable-numbering-plan.md`.

The previous document defines what future codes should look like. This document defines how a future controlled service should generate, validate, suggest, and protect those codes.

## 3. Why Numbering Should Be Implemented As A Controlled Service

Business codes must be stable, unique, searchable, and rule-based. If code generation is scattered across UI, API routes, AI tools, or manual scripts, the system may create duplicates, unstable codes, or misleading references.

A controlled numbering service provides one safe path for generating code suggestions and locking final codes after record creation.

## 4. Future Location Proposal

Suggested future structure:

```text
lib/services/numbering/
lib/services/numbering/generate-code.js
lib/services/numbering/code-dictionaries.js
lib/services/numbering/duplicate-check.js
```

This folder is not created in Phase 0A.

## 5. Core Responsibilities Of The Numbering Service

The numbering service should:

- normalize country, type, source, and category codes
- choose the correct code pattern for the object type
- generate the next sequence number
- check possible duplicate records before creation
- return a code suggestion with warnings
- lock the code after creation
- prevent automatic changes to existing codes
- provide structured output for APIs, UI, and AI tools

## 6. Supported Future Object Types

- `customer_company`
- `customer_contact`
- `supplier_company`
- `supplier_contact`
- `inquiry`
- `project`
- `supplier_rfq`
- `supplier_quote`
- `customer_quotation`
- `pi`
- `order`
- `purchase_order`
- `document`
- `attachment`
- `communication_thread`
- `task`
- `knowledge_article`
- `approval_review`

## 7. Suggested Input Contract

Future service input may include:

```json
{
  "object_type": "customer_company",
  "country_code": "PE",
  "customer_type": "DIST",
  "source_code": "ALI",
  "supplier_category": "ALU",
  "parent_code": "CUST-PE-DIST-ALI-2026-0001",
  "created_at": "2026-06-15T00:00:00.000Z"
}
```

Fields should be optional where not relevant to the object type.

## 8. Suggested Output Contract

Future service output may include:

```json
{
  "code": "CUST-PE-DIST-ALI-2026-0001",
  "code_parts": {
    "prefix": "CUST",
    "country_code": "PE",
    "type_code": "DIST",
    "source_code": "ALI",
    "year": "2026",
    "sequence": "0001"
  },
  "confidence": 0.92,
  "warnings": [],
  "needs_human_review": false
}
```

If required inputs are missing or uncertain, the service should return warnings and `needs_human_review: true`.

## 9. Duplicate Detection Strategy

Before final code creation, the service should check possible duplicates using:

- existing business code
- company or contact name
- country
- email
- WhatsApp or phone
- website
- source platform ID if available
- folder alias if available
- tax or registration identifier if available

The service should not automatically merge duplicates. It should return candidate matches for human review.

## 10. Sequence Strategy

Recommended sequence behavior:

- sequence is scoped by object type, year, and relevant prefix pattern
- sequence uses fixed-width numbers such as `0001`
- sequence should be allocated by the backend, not the browser
- final allocation should happen during record creation
- previewed codes should be marked as suggestions, not final locks
- code generation should be safe under concurrent creation attempts

## 11. Handling Unknown Values

Use safe placeholders when values are unknown:

- `XX` for unknown country
- `UNK` for unknown customer type
- `OTH` for other supplier category
- `MAN` for manual source

Unknown placeholders should trigger a warning but should not block low-risk draft previews.

## 12. AI Agent Usage Rules

AI agents may:

- suggest likely country, type, source, or category codes
- call the numbering service for a code suggestion
- explain why a code was suggested
- flag uncertain components for human review

AI agents must not:

- manually invent final codes outside system rules
- modify existing codes
- bypass duplicate checks
- allocate final sequence numbers directly
- create customer, supplier, order, quotation, PI, or document records without approved workflow

## 13. Human Review Rules

Human review should be required when:

- country is unknown
- customer type is uncertain
- source is uncertain
- supplier category is uncertain
- duplicate candidates exist
- AI confidence is low
- the object is high business value or high risk

Human review may approve the suggested code or adjust input components before final creation.

## 14. What Should Remain Immutable After Creation

After a code is finalized, these should not change automatically:

- final business code
- object type prefix
- year segment
- sequence number
- parent-code relationship for contact codes

Business fields may change later, but the original code should remain stable.

## 15. Relationship With Future Schema Fields

Future schema may add code fields such as:

- `customer_code`
- `supplier_code`
- `inquiry_code`
- `rfq_code`
- `quotation_code`
- `pi_code`
- `order_code`
- `document_code`
- `attachment_code`
- `task_code`
- `approval_code`

These fields should be indexed and unique where appropriate.

UUID primary keys should remain the real database identifiers.

## 16. Relationship With Future API Routes

Future API routes should call the numbering service instead of generating codes inline.

Possible future API behavior:

- preview code suggestion
- create record with finalized code
- check duplicate candidates
- return code warnings

API routes should not allow clients to force unsafe or duplicate final codes.

## 17. Relationship With Future UI Display

Future UI should show:

- final business code near the record title
- code parts only when helpful
- warnings when placeholder values are used
- duplicate candidates before record creation
- clear distinction between suggested code and finalized code

UI should not allow silent code overwrites.

## 18. What Should NOT Be Implemented Yet In Phase 0A

Do not implement yet:

- numbering utility files
- code dictionaries in JavaScript
- database columns
- migrations
- API routes
- UI create flows
- duplicate merge flows
- AI model calls
- automatic customer or supplier creation
- automatic quotation, PI, order, shipment, payment, or document creation

## 19. Low-Risk Future Implementation Roadmap

Recommended order:

1. Finalize code dictionaries in documentation.
2. Write pure tests for code formatting rules.
3. Implement a pure `generateCodeSuggestion` utility without database writes.
4. Add duplicate-check interface design.
5. Add read-only API preview for code suggestions.
6. Add database fields through approved migration.
7. Add manual create workflow with finalized code allocation.
8. Add AI-assisted code suggestions after manual workflow is stable.

## 20. Acceptance Criteria For Future Implementation

Future implementation should be accepted only if:

- code generation is deterministic and testable
- final codes are stable after creation
- duplicate checks happen before creation
- AI can suggest but cannot finalize codes outside system rules
- unknown values produce safe placeholders and warnings
- UUID primary keys remain separate from business codes
- no UI or API can silently overwrite a finalized code
- no numbering workflow creates business commitments by itself
