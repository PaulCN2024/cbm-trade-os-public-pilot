# Business Card Capture Upload Implementation Roadmap

## Current Completed State

Business Card Capture currently has:

- static UI preview
- upload UI preview
- data model plan
- read-only data foundation
- DEMO data
- RLS
- admin-read routes
- production verification
- upload safety plan
- private storage planning

The current system remains read-only. It has no real upload, OCR, image parsing, customer creation, message sending, or business execution.

## Next Stages

### U1 upload safety plan

Status: completed by this planning pack.

Defines upload risks, file restrictions, private storage expectations, access control, error handling, and non-goals.

### U2 storage bucket plan

Status: completed at planning level.

Plan the exact private storage bucket, path convention, access policy, signed URL behavior, and audit expectations before any upload implementation.

Current planning result:

- proposed private bucket: `business-card-captures`
- no public URL
- no anonymous access
- authenticated access only
- safe path shape: `business-card-captures/{year}/{month}/{capture_source_id}/{safe_filename}`
- no raw email, phone, WhatsApp, or private contact data in object paths
- short-lived preview access only after review
- real upload remains blocked until bucket setup, policy, API, and preview boundaries are approved

### U3 upload static UI with disabled controls

Status: completed and production-smoke verified.

Add a disabled or mock-only upload preview if useful for operator review.

Rules:

- no real file input
- no drag/drop listener
- no network upload
- no OCR
- no customer creation

### U4 protected upload API plan

Plan a future authenticated upload endpoint.

The plan must define:

- authentication
- accepted file validation
- size limit
- metadata creation
- storage behavior
- failure handling
- audit fields

### U5 storage RLS/access plan

Plan storage and table access rules:

- private bucket
- authenticated internal users only
- no public access
- no service-role exposure in frontend
- future role-based permissions

### U6 OCR provider selection

Select OCR/vision provider only after privacy and provider retention review.

No provider key or live OCR call should be added during planning.

### U7 demo OCR extraction

Use demo images first to prove extraction output shape, confidence fields, uncertainty, and failure states.

### U8 human review queue

Show reviewed extraction results and duplicate warnings in a human review queue.

Actions remain disabled until approval workflow exists.

### U9 approved customer creation

Add controlled customer creation only after approval/audit architecture is ready.

This must require explicit approval and must not be tied directly to upload or OCR.

### U10 follow-up draft review

Generate follow-up drafts only after reviewed customer data exists.

Sending remains a separate approval-gated workflow.

## Recommended Next Executable Task

Recommended:

`CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-STORAGE-SQL-PACK-001`

This should prepare a manual SQL/storage setup pack for the future private `business-card-captures` bucket and storage policies.

Warning:

Do not enable real upload until bucket setup, storage policy, upload API, preview boundary, retention/deletion workflow, and human review behavior are all reviewed.

## Safety Gates Before Real Upload

Real upload should wait for:

- private storage bucket plan
- upload API plan
- file validation rules
- retention/deletion policy
- access-control/RLS review
- audit field plan
- user-facing error copy
- browser smoke checklist

Until then, upload surfaces should remain disabled, informational, or documentation-only.
