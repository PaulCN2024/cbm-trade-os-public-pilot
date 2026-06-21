# Business Card Capture OCR Provider Boundary Plan

## Purpose

This plan defines the privacy and safety boundary for future OCR/vision extraction from Business Card Capture images.

It is planning only. It does not choose a provider, call a provider, add keys, implement OCR, upload images, parse files, create API routes, change schema, execute SQL, create customers, send messages, or perform business execution.

## Possible Providers

Possible future providers to evaluate:

- OpenAI vision
- Gemini vision
- Qwen vision
- local OCR later
- third-party OCR later

No provider should be integrated until privacy, retention, cost, accuracy, logging, and compliance questions are answered.

## Data Sent To Provider

Data minimization rule:

- send only the card image or an extracted crop needed for OCR
- do not send unrelated customer records
- do not send pricing data
- do not send quotation, PI, order, payment, production, or shipment data
- do not send secrets, service-role keys, database URLs, env values, or internal credentials
- do not send unrelated business files

If the image contains private notes or unrelated personal information, the future workflow should let Paul reject or crop before OCR where practical.

## Output Expected From OCR/Vision

Expected extraction output:

- name
- company
- title
- Email
- phone
- WhatsApp
- website
- country
- address
- confidence per field
- raw text
- uncertain fields

Recommended structured output properties:

- `field`
- `value`
- `confidence`
- `source_region` if available
- `needs_review`
- `normalization_note`

Raw text and raw provider payload should be internal-only and should not be treated as verified customer data.

## Safety Rules

- OCR output is not trusted automatically.
- Low-confidence fields need manual review.
- Missing fields must remain missing; AI should not invent them.
- Possible duplicates must be surfaced before customer creation.
- No automatic customer creation.
- No automatic message sending.
- No automatic merge into existing customer records.
- No quotation, PI, order, payment, production, shipment, price, or delivery commitment.
- Keep provider abstraction so one provider can be replaced without changing business workflow semantics.

## Provider Logging And Privacy Questions

Before implementation, decide:

- whether the provider stores images
- provider retention policy
- whether provider data is used for training
- region/compliance concerns
- business privacy risk
- how logs are redacted
- whether images can be deleted from provider-side processing logs
- whether the provider supports enterprise privacy controls
- whether sensitive cards can be processed locally instead

If these questions cannot be answered, do not enable provider OCR for real customer data.

## Future Implementation Stages

OCR implementation should be staged:

1. OCR1 provider selection
2. OCR2 prompt/output schema
3. OCR3 test with demo images
4. OCR4 extraction result draft
5. OCR5 human review
6. OCR6 approved customer creation later

Each stage should have its own approval and verification task. Demo images should be used before real customer images.

## Review Requirements

Future OCR review UI should show:

- original source reference
- extracted fields
- confidence values
- uncertain fields
- duplicate warning
- missing information
- recommended manual action
- disabled future actions

The UI must make it obvious that OCR prepared a draft only.
