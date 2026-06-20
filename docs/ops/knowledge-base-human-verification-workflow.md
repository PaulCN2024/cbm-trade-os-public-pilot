# Knowledge Base Human Verification Workflow

## Purpose

Define how Knowledge Base records should move from draft or source material into trusted internal knowledge.

This is workflow planning only. It does not implement approval buttons, database writes, review execution, or audit tables.

## Why Verification Matters

AI knowledge should not become trusted just because AI summarized it.

CBM Trade OS handles price, delivery, supplier capability, product feasibility, compliance, customer communication, and operational commitments. If unverified AI summaries become trusted knowledge, they can create wrong quotes, unsafe customer replies, supplier commitment leakage, or stale operating rules.

Human verification is the safety layer between raw information and AI-usable business knowledge.

## Verification Statuses

- `draft`: manually entered or generated but not ready for review.
- `needs_review`: ready for human review before use.
- `verified`: reviewed and safe for its declared visibility scope.
- `outdated`: no longer reliable without update.
- `archived`: retained for history but not active.

## Workflow

### A. Manual Entry

An operator or future admin writes a knowledge item and links it to a source or business context.

### B. AI Draft Summary Later

In a later phase, AI may summarize an inquiry, supplier note, customer document, product catalog, or SOP draft.

AI-generated knowledge starts as `draft` or `needs_review`, never `verified`.

### C. Source Attached

Each item should include a source type and source reference. For files, show only safe metadata labels, not private paths or signed URLs.

### D. Human Review

The reviewer checks the source, business meaning, risk level, language, confidentiality, and whether the item can be used by AI.

### E. Verified Or Needs Correction

The reviewer marks the item as verified, leaves it in needs-review, requests correction, or marks it outdated/archived in a future controlled workflow.

The first implementation should only display this state.

### F. Expiration / Review Date

Knowledge that depends on supplier capability, price assumptions, product standards, tax, port fees, or compliance should have an expiration or review date.

### G. Archived If Outdated

Outdated knowledge should be archived or superseded by a new version. AI should warn when a relevant record is outdated.

## Review Checklist

Reviewer checks:

- source exists
- no unsupported price commitment
- no outdated rule is marked active
- no confidential info is exposed
- correct product, supplier, customer, or file context
- language is correct
- `visibility_scope` is correct
- customer-safe label is only used after review
- supplier capability or lead time is not treated as a commitment

## Risk Handling

High-risk knowledge includes:

- price or margin rules
- supplier commitment
- payment terms
- legal or compliance rules
- customer complaint handling
- project-specific technical promises
- quality responsibility
- delivery time assumptions

High-risk knowledge must remain internal-only or needs-review until a human confirms its use.

## AI Usage Rules

AI can cite:

- verified internal knowledge for internal suggestions
- customer-safe knowledge only after human review
- draft templates as draft-only guidance if clearly labeled

AI must not cite:

- draft or unverified knowledge as fact
- confidential internal rules to a customer
- expired or outdated rules without warning
- supplier capability notes as confirmed delivery or production feasibility
- internal margin, exchange rate, cost, or weight uplift rules in customer output

## UI Behavior

The UI should show:

- verification badges
- review queue
- source pills
- expiration warnings
- confidence display
- risk level
- visibility scope
- disabled capabilities

The first real implementation must not add approve, reject, edit, delete, archive, upload, RAG, or send execution.

## Future Approval Flow

Later controlled workflow may include:

- approve knowledge
- request changes
- archive item
- create a new version
- reviewer audit log
- role-based review permissions

No implementation is included now.
