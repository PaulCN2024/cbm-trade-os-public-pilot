# Business Card Capture Privacy And Safety Plan

## Purpose

This plan defines privacy and safety rules for the future AI Business Card Capture workflow.

The feature can eventually help Paul turn business cards, exhibition cards, WhatsApp contact images, or referral cards into customer profile drafts. It must protect personal contact data and keep all customer creation and outreach actions human-reviewed.

This is planning only. It does not implement upload, OCR, image parsing, AI provider calls, API routes, schema changes, customer creation, message sending, or business execution.

## Main Risks

- Personal contact data may be exposed or over-shared.
- OCR or AI extraction may read the wrong name, email, phone, company, or country.
- Duplicate customers may be created if existing records are not checked.
- A message may be sent to the wrong person or channel.
- Phone, Email, WhatsApp, website, or address fields may be displayed too broadly.
- The system may store unnecessary private data from a card image.
- Uncertain extraction may be treated as fact.
- A low-confidence contact may be mistaken for a verified buyer.
- A draft follow-up may sound like an official business commitment.

## Safety Controls

- Extraction confidence must be visible.
- Human review is required before customer creation.
- Duplicate check must run before any approved creation workflow.
- Source tracking must show where the card came from.
- No auto-send.
- No auto-create customer.
- No public access to captured contact data.
- No unreviewed external use of extracted contact fields.
- No unreviewed export of captured contact data.
- No use of extracted data for pricing, quotation, PI, order, payment, production, or shipment commitments.

## Data Minimization

Only store business contact fields needed for foreign trade follow-up:

- name
- company
- title
- Email
- phone
- WhatsApp
- website
- country
- address when business-relevant
- business type
- product interest
- source channel
- review status
- confidence level
- risk level

Avoid storing:

- unnecessary personal notes
- unrelated private data
- non-business personal details
- full raw image contents beyond business need
- private bucket paths in UI
- signed URLs in UI
- secret tokens or provider credentials
- sensitive payment or bank details

If source images are stored later, storage policy must be planned separately with retention, access, deletion, and audit rules.

## AI Behavior

AI can:

- extract fields
- normalize values
- infer customer type
- suggest follow-up
- identify missing fields
- flag likely duplicates
- score confidence and risk

AI must not:

- create customers automatically
- send messages
- treat low-confidence fields as verified
- expose contact details externally without approval
- make a final buyer trust decision
- promise pricing, delivery time, payment terms, quality, production feasibility, or supplier commitment
- bypass opt-out or do-not-contact rules

## Approval Requirements

Paul must approve:

- customer creation
- follow-up message
- any export
- permanent customer profile creation
- uncertain field correction
- duplicate override
- contact data merge into an existing customer
- any future upload/OCR provider activation

Approval should be explicit and auditable. A future approval request should include:

- proposed action
- contact data affected
- source card/capture reference
- confidence level
- duplicate status
- risk notes
- exact follow-up message if sending is proposed
- rollback or cancellation behavior

## Future Audit

Future audit should include:

- extraction log
- review log
- approval log
- customer creation link
- duplicate decision history
- follow-up draft history
- sent-message link only after approved sending exists
- reviewer identity
- timestamps
- risk notes

Audit records should distinguish between:

- extracted
- reviewed
- approved as draft
- created as customer
- follow-up drafted
- follow-up sent

Review or approval must not imply that a customer was created or a message was sent.
