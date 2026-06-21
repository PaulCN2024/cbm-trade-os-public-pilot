# Business Card Capture Storage Manual SQL Pack

## Purpose

This guide prepares Paul to create the future private Supabase Storage bucket and first-stage authenticated access policies for Business Card Capture.

This is an execution pack. Codex may execute it only after Paul approves the exact database action. Codex must not run it silently.

## Important Warning

This step is higher risk than previous read-only table work because it prepares future authenticated upload into a private storage bucket.

It still does not implement:

- UI upload
- API upload endpoint
- OCR
- image parsing
- customer creation
- message sending
- quotation, PI, order, payment, production, or shipment execution

## SQL File To Review/Run

Use this file:

```text
docs/ops/business-card-capture-storage-bucket-policy.sql
```

Target Supabase project:

```text
PaulCN2024's Project / zswtekjtkyvfagbudkia
```

## What The SQL Does

- creates or updates the private bucket `business-card-captures`
- sets `public = false`
- sets file size limit to `5242880` bytes, or 5 MB
- allows only `image/jpeg`, `image/png`, and `image/webp`
- creates authenticated `SELECT` policy for objects in this bucket
- creates authenticated `INSERT` upload policy for objects in this bucket
- avoids anonymous/public access
- avoids update/delete policies in this first stage

## What It Does Not Do

- no UI upload
- no API upload endpoint
- no OCR
- no image parsing
- no customer creation
- no sending
- no public URL
- no service-role exposure
- no direct customer-facing image access
- no quotation, PI, order, payment, production, or shipment action

## Manual Execution Steps

1. Confirm target project: `PaulCN2024's Project / zswtekjtkyvfagbudkia`.
2. Review `docs/ops/business-card-capture-storage-bucket-policy.sql`.
3. Confirm the pre-run checklist below.
4. Run the SQL only after Paul gives explicit approval for this exact action.
5. If an error appears, stop and copy the full error text for review.

## Pre-run Checklist

Paul confirms:

- correct Supabase project is selected
- bucket name is `business-card-captures`
- bucket is `public = false`
- allowed file types are only JPEG, PNG, and WebP
- max size is 5 MB
- no anonymous policy is present
- no public policy is present
- no update/delete policy is present
- no service-role credential appears
- no `DROP`, `DELETE`, or `TRUNCATE` executable statement appears

## Verification SQL

After the SQL succeeds, run this verification SQL:

```sql
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'business-card-captures';

select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname like 'business_card_captures_%'
order by policyname;
```

Expected bucket result:

- `business-card-captures` exists
- `public = false`
- `file_size_limit = 5242880`
- `allowed_mime_types` includes `image/jpeg`, `image/png`, and `image/webp`

Expected policies:

- `business_card_captures_authenticated_read`
  - command: `SELECT`
  - role: `authenticated`
- `business_card_captures_authenticated_upload`
  - command: `INSERT`
  - role: `authenticated`

Expected non-result:

- no update/delete policy for `business-card-captures`
- no anonymous/public policy
- no public bucket

## Next Task After Execution

After the SQL is executed and the verification result is captured, the next Codex task should be:

```text
CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-STORAGE-POST-VERIFY-001
```

That task should verify the SQL result, document the checkpoint, and keep upload/OCR/customer creation blocked until later implementation planning is approved.
