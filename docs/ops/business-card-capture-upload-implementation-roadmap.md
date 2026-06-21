# Business Card Capture Upload Implementation Roadmap

## Current Completed State

Business Card Capture currently has:

- static UI preview
- data model plan
- read-only data foundation
- DEMO data
- RLS
- admin-read routes
- production verification

The current system remains read-only. It has no real upload, OCR, image parsing, customer creation, message sending, or business execution.

## Next Stages

### U1 upload safety plan

Status: completed by this planning pack.

Defines upload risks, file restrictions, private storage expectations, access control, error handling, and non-goals.

### U2 storage bucket plan

Plan the exact private storage bucket, path convention, access policy, signed URL behavior, and audit expectations before any upload implementation.

### U3 upload static UI with disabled controls

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

`CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-UPLOAD-UI-PREVIEW-001`

This should be a disabled/static UI preview only, useful for validating wording and operator flow.

Warning:

Do not enable real upload until storage/access policy is approved.

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
