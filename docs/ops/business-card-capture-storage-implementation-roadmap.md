# Business Card Capture Storage Implementation Roadmap

## Current Completed State

Business Card Capture currently has:

- static UI preview
- upload UI preview
- data model plan
- read-only data foundation
- DEMO SQL
- RLS
- admin-read
- production verification
- upload safety plan

The current system remains read-only. It has no real upload, OCR, image parsing, storage bucket setup, customer creation, message sending, or business execution.

## Next Stages

### S0 private storage planning

Status: completed by this planning pack.

Defines private bucket model, file path strategy, access-control boundary, preview boundary, deletion/retention workflow, and future implementation order.

### S1 bucket creation SQL/manual guide

Status: executed and verified after Paul's explicit approval.

The manual Supabase setup pack for the `business-card-captures` private bucket and first-stage policies has been executed through Supabase Dashboard SQL Editor.

Verified result:

- bucket exists
- bucket is private
- file size limit is 5 MB
- allowed MIME types are JPEG, PNG, and WEBP
- authenticated read policy exists
- authenticated upload policy exists
- unsafe policy count is 0

Real upload is still not enabled. Codex must not upload files, create signed URLs, add upload APIs, or touch storage objects until a separate upload API plan is approved.

### S2 storage policy plan

Define exact storage policies:

- authenticated upload
- authenticated internal read
- no anonymous read
- no public delete
- approved archive/delete flow later

### S3 upload API design

Plan a protected API route that validates MIME, extension, size, auth, storage path, and metadata linkage.

No API should be implemented until this design is approved.

### S4 upload UI disabled-to-enabled transition plan

Plan how the current disabled upload preview could become an enabled upload flow without confusing operators or exposing unsafe controls.

The UI must keep clear labels such as:

- 需人工确认
- 不自动创建客户
- 不自动发送
- 仅生成内部复核草稿

### S5 metadata DB migration

Plan schema changes for storage metadata only after bucket and API plans are accepted.

Possible future fields include:

- `storage_bucket`
- `storage_path`
- `file_mime_type`
- `file_size_bytes`
- `storage_status`
- `preview_status`

### S6 preview/signed URL plan

Plan short-lived preview access and placeholder behavior.

Signed URLs should not become permanent records or customer-facing links.

### S7 OCR provider integration

Plan provider selection, privacy review, prompt/output schema, confidence fields, provider logging, and demo-image validation.

No provider key or live OCR call should be added during planning.

### S8 human review queue

Show uploaded source, extracted fields, confidence, missing fields, duplicate warnings, and recommended manual actions.

Actions remain disabled until approval workflow exists.

### S9 approved customer creation

Add controlled customer creation only after approval/audit architecture is ready.

This must require explicit approval and must not be tied directly to upload or OCR.

### S10 retention/delete workflow

Implement archive/delete request and approval handling only after storage object deletion, audit, and privacy policy are approved.

## Recommended Next Executable Task

Recommended:

```text
CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-UPLOAD-API-PLAN-001
```

Goal:

Plan the protected upload API boundary, validation rules, metadata linkage, and approval-safe storage behavior before enabling any real upload.

Warning:

Do not enable real upload until bucket/policy execution is verified and upload API, storage preview, retention, and OCR boundaries are separately reviewed.

## Storage SQL Executed And Verified

Paul explicitly approved the storage SQL execution, and the private bucket/policy setup was verified after the Supabase Dashboard SQL Editor run.

Verified storage baseline:

- Supabase project: PaulCN2024's Project / `zswtekjtkyvfagbudkia`
- Bucket: `business-card-captures`
- Public access: `false`
- File size limit: `5242880`
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
- Authenticated read policy: `business_card_captures_authenticated_read`
- Authenticated upload policy: `business_card_captures_authenticated_upload`
- Unsafe policy count: `0`

Remaining boundary:

- no real upload API
- no file input enabled in Admin UI
- no OCR/vision provider call
- no storage object upload/download/delete
- no signed URL generation
- no customer creation
- no sending or business execution

Recommended next executable task:

```text
CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-UPLOAD-API-PLAN-001
```

## Safety Gates Before Real Upload

Real upload should wait for:

- verified private bucket setup
- reviewed private bucket setup pack
- reviewed storage policies
- upload API design
- MIME and extension validation
- 5 MB first-stage size limit
- storage metadata schema plan
- preview/signed URL boundary
- retention/deletion workflow
- audit expectations
- user-facing Chinese error copy
- browser smoke checklist

Until then, upload surfaces should remain disabled, informational, or documentation-only.
