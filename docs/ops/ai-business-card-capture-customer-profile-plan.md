# AI Business Card Capture And Customer Profile Plan

## Purpose

Allow Paul to upload or photograph a business card, exhibition card, WhatsApp contact image, or customer name card. AI extracts contact data and creates a customer profile draft.

## Why This Matters

This is valuable for:

- trade shows
- WhatsApp customer contacts
- customer referrals
- supplier-recommended contacts
- offline networking
- fast customer data entry

## Workflow

```text
Card image/upload
-> OCR/vision extraction later
-> extract customer fields
-> customer profile draft
-> AI customer type/risk analysis
-> Paul confirms
-> create customer record later
-> generate follow-up draft
```

## Extracted Fields

- name
- company
- title
- email
- phone
- WhatsApp
- website
- country
- address
- business type
- product interest
- source event/channel
- confidence
- missing fields
- risk notes

## AI Role

- extract
- normalize
- identify country/domain
- infer customer type
- suggest follow-up
- flag missing/uncertain fields
- cross-check against existing customers

## Safety Boundary

- no automatic customer creation
- no automatic sending
- no use of uncertain fields without review
- no private data exposed externally
- human confirmation required

## Future Data Model

Plan only. No migration now.

- `customer_profile_drafts`
- `captured_contact_sources`
- `card_extraction_results`
- `customer_profile_review_queue`

## Future UI

- upload/drop zone
- extracted field preview
- confidence badges
- missing field warnings
- confirm/create later disabled first
- duplicate customer warning

## Implementation Phases

- BC1 planning
- BC2 static UI preview
- BC3 file/image upload planning
- BC4 OCR/vision provider plan
- BC5 read-only extraction result preview
- BC6 customer draft approval
- BC7 customer creation with approval
