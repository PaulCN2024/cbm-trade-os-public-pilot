# Business Card Capture Storage Verification Checklist

## Purpose

This checklist defines what should be verified after the Business Card Capture private storage SQL is run.

## Expected Bucket Status

Expected bucket:

```text
business-card-captures
```

Expected settings:

- bucket exists
- `public = false`
- `file_size_limit = 5242880`
- allowed MIME types include:
  - `image/jpeg`
  - `image/png`
  - `image/webp`

The bucket should not be public and should not expose a permanent public URL.

## Expected Policies

Expected storage object policies for `storage.objects`:

- `business_card_captures_authenticated_read`
  - command: `SELECT`
  - role: `authenticated`
  - bucket condition: `business-card-captures`
- `business_card_captures_authenticated_upload`
  - command: `INSERT`
  - role: `authenticated`
  - bucket condition: `business-card-captures`

No first-stage update/delete policy should exist.

## Expected Non-goals

After storage SQL execution, these must still remain true:

- upload UI still disabled or preview-only
- no real upload API
- no OCR
- no image parsing
- no customer creation
- no public URL
- no service-role exposure
- no message sending
- no quotation, PI, order, payment, production, or shipment action

## What Paul Should Send Back After SQL

Paul should send Codex:

- bucket query result
- policy query result
- any SQL error text, if an error appears
- confirmation that `public = false`
- confirmation that only JPEG/PNG/WebP MIME types are allowed
- confirmation that no update/delete policy was created

Paul should not send:

- database password
- project secret
- service-role key
- browser cookies
- bearer token
- private storage object URL
- signed URL

## Future Verification Task

Recommended follow-up task:

```text
CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-STORAGE-POST-VERIFY-001
```

The future verification task should document the SQL result and confirm real upload remains blocked until API, preview, retention, and OCR boundaries are separately approved.
