# Customer Verification Evidence Rules Plan

## Purpose

This document defines evidence categories, statuses, source types, and handling rules for future AI Customer Verification.

The rules are planning-only. They do not authorize external lookup, scraping, AI provider calls, database writes, customer mutation, messaging, quotation, order, payment, production, or shipment actions.

## Evidence Categories

### A. Identity Evidence

Identity evidence describes who the contact claims to be and how they can be reached.

- name
- company
- title
- email
- phone
- WhatsApp
- website

Usage:

- Show completeness and uncertainty.
- Preserve original values from source records.
- Do not treat a single field as proof of legitimacy.

### B. Business Relevance Evidence

Business relevance evidence describes whether the contact appears related to CBM's product and export workflows.

- product interest
- inquiry detail
- project location
- quantity
- buyer role
- industry
- source channel

Usage:

- Map to product categories and business lines later.
- Highlight missing project details before quotation readiness.
- Keep relevance separate from credibility; a real company may still be low relevance.

### C. Consistency Evidence

Consistency evidence checks whether fields agree with each other.

- email domain matches company
- website country matches stated country
- phone country code matches country
- company name matches website
- inquiry content matches product category

Usage:

- Conflicts should be highlighted for human review.
- Lack of consistency evidence should be `not_checked` or `missing`, not automatically `high risk`.

### D. Duplicate Evidence

Duplicate evidence checks whether this contact or company may already exist in CBM records.

- same email
- same phone
- same website
- same company
- similar company name
- same WhatsApp

Usage:

- Duplicate evidence should produce candidate matches only.
- Human review is required before merge, link, archive, or rejection.

### E. Risk Evidence

Risk evidence identifies patterns requiring caution.

- personal email only
- refuses company info
- vague request
- asks only for price
- competitor-like behavior
- inconsistent country/contact data
- suspicious domain
- unrealistic quantity/timeline

Usage:

- Risk evidence should explain why review is required.
- Risk evidence should not automatically trigger rejection without human review.
- Price-only or vague requests should normally lead to `request_more_info`, not immediate quote preparation.

## Evidence Status

Use a small stable status set:

- `confirmed`: supported by reviewed source evidence.
- `likely`: plausible but not fully confirmed.
- `needs_review`: ambiguous or requires Paul review.
- `missing`: expected evidence is absent.
- `conflict`: evidence contradicts another field or source.
- `not_checked`: the system has not checked this evidence.

Rules:

- `confirmed` requires source-backed evidence, not only AI inference.
- `likely` and `needs_review` must remain advisory.
- `conflict` should require human review.
- `not_checked` must be clearly distinguished from `missing`.

## Source Types

Use source types to make evidence traceable:

- `user_provided`
- `inquiry_text`
- `business_card`
- `email_header`
- `whatsapp`
- `customer_record`
- `manual_note`
- `external_lookup_later`
- `ai_inference`

Rules:

- `external_lookup_later` is a future placeholder and must not imply current external lookup exists.
- `ai_inference` must never be treated as fact.
- Source type should be visible in review UI when evidence affects confidence or risk.

## Evidence Handling Rules

- Never treat AI inference as fact.
- Missing evidence should not equal high risk automatically.
- Conflicts should require human review.
- External lookup later must store source and timestamp.
- External lookup later must respect source licensing, robots/protection rules, and privacy boundaries.
- Customer mutation requires approval.
- Evidence should be append-only or auditable when it affects customer status.
- Evidence should preserve the original source value and any normalized display value separately.
- Evidence should not expose secrets, private file paths, signed URLs, raw payment details, or confidential customer files.
- Evidence must not trigger automatic sending, quotation, PI, order, payment, production, or shipment actions.

## Safe Early Evidence Sources

For the first read-only data foundation, safest evidence sources are:

- existing customer record fields
- existing inquiry text
- existing business-card demo/read-only records
- manual notes
- existing source channel labels

Avoid in the first implementation:

- live external lookup
- scraping
- automated website checks
- email sending
- WhatsApp sending
- AI provider calls
- real-time enrichment services

## Review UI Expectations

Future UI should show:

- evidence category
- evidence value
- source type
- status
- confidence level
- risk level
- notes

It should also clearly state:

- `not checked` means no lookup was performed
- `AI inference` is not fact
- Paul must approve any status change
