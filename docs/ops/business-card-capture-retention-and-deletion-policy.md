# Business Card Capture Retention And Deletion Policy

## Purpose

This policy defines how future Business Card Capture source images, extraction results, and customer-profile drafts should be retained, archived, or deleted.

It is planning only. It does not implement deletion, storage, upload, OCR, API routes, schema changes, SQL, customer creation, message sending, or business execution.

## Retention Principle

Store only what is needed for business follow-up and human review.

Business Card Capture should not become a permanent dump of every contact image. If a card is irrelevant, duplicated, private, or no longer needed, the system should support rejection, archiving, or deletion according to a reviewed policy.

## Suggested Retention States

- `active_review`
- `approved_linked_to_customer`
- `rejected`
- `archived`
- `delete_requested`

State meanings:

- `active_review`: still being reviewed; not approved as a customer.
- `approved_linked_to_customer`: source is linked to an approved customer record.
- `rejected`: not useful for customer creation or follow-up.
- `archived`: kept for internal reference but not active.
- `delete_requested`: marked for removal, pending confirmation or policy execution.

## When To Delete Or Archive

Consider deletion or archive when:

- duplicate
- wrong contact
- irrelevant card
- private/unwanted contact
- user request
- outdated source
- low-quality image that cannot be reviewed
- accidental upload
- source no longer has business purpose

Deletion should be conservative when audit trail is needed, but personal contact data should not be retained without business reason.

## Future Deletion Workflow

Future deletion workflow:

```text
mark for deletion
-> confirm
-> delete/soft-delete image metadata
-> remove or expire storage object access
-> retain audit log if needed
```

The workflow should distinguish:

- deleting the original image
- deleting extracted draft fields
- unlinking a customer draft
- keeping an audit event without retaining sensitive content

## Privacy Notes

- Avoid storing personal contacts without business reason.
- Protect phone, Email, WhatsApp, and address fields.
- Do not expose public links.
- Do not export captured contact data without approval.
- Do not keep raw images longer than needed if the reviewed customer record is sufficient.
- Respect future customer/contact deletion requests where applicable.

## Audit Notes

Future audit should record:

- who uploaded
- who reviewed
- who requested deletion/archive
- reason
- timestamp
- final outcome

Audit logs should avoid storing raw image content or unnecessary personal details.

## Non-goals

This policy does not authorize:

- real deletion implementation now
- storage bucket changes now
- schema changes now
- automatic deletion without approval
- customer record deletion
- public file access
- uncontrolled data export
