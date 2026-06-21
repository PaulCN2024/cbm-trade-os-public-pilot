# Business Card Capture Storage Deletion And Retention Workflow

## Purpose

This document defines the future deletion and retention workflow for Business Card Capture source images and linked metadata.

It is planning only. It does not implement deletion, storage operations, upload, OCR, API routes, schema changes, SQL, customer creation, message sending, or business execution.

## Retention States

Future states:

- `active_review`
- `approved_linked_to_customer`
- `rejected`
- `archived`
- `delete_requested`
- `deleted`

State meaning:

- `active_review`: the image and draft are still being reviewed.
- `approved_linked_to_customer`: the image supports a reviewed customer record or approved customer draft.
- `rejected`: the image is not useful or not appropriate for customer creation.
- `archived`: the image is retained for internal reference but removed from active review.
- `delete_requested`: Paul or an approved reviewer requested deletion, pending confirmation.
- `deleted`: storage object is removed or irreversibly inaccessible; only minimal audit metadata remains if needed.

## Deletion Triggers

Potential deletion triggers:

- wrong card
- duplicate
- private/unwanted contact
- low-quality image
- user request
- no business reason to retain
- mistaken upload
- sensitive private note captured accidentally
- unsupported file uploaded in error

Deletion should be possible, but not automatic while business review is unresolved.

## Future Deletion Flow

Planned future flow:

```text
Paul marks delete
-> system asks confirmation
-> record status delete_requested
-> approved delete later
-> storage object removed or archived
-> audit log retained if needed
```

The flow should distinguish:

- deleting original image object
- deleting or redacting OCR raw text
- deleting extracted draft fields
- unlinking customer-profile draft
- retaining minimal audit event without storing sensitive image content

## What Not To Delete Automatically

- do not auto-delete while review is pending
- do not delete linked customer evidence without approval
- do not delete audit log without retention decision
- do not delete data needed for an active customer dispute without human review
- do not delete source context if the corresponding customer record depends on it and no replacement evidence exists

## Privacy Considerations

- retain only business-needed data
- avoid storing unrelated personal data
- document why retained
- allow archive/delete path
- protect phone, email, WhatsApp, address, QR code, and private notes
- do not use rejected/private cards for prospecting or outreach
- do not export retained images without explicit approval

## Future Data Model Impact

Future schema may add:

- `retention_status`
- `deleted_at`
- `deletion_reason`
- `deleted_by`
- `storage_status`

No migration is authorized now.

## Audit Boundary

Future audit should record:

- who uploaded
- who reviewed
- who requested deletion
- who approved deletion
- reason
- timestamp
- final outcome

Audit should avoid storing raw image content, signed URLs, provider payloads, or unnecessary personal details.
