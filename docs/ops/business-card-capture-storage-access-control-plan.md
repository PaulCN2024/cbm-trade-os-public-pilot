# Business Card Capture Storage Access Control Plan

## Purpose

This plan defines the access-control boundary for future private storage of Business Card Capture image files.

It is planning only. It does not create storage policies, create a bucket, modify Supabase Storage, add API routes, change schema, run SQL, implement upload, enable OCR, create customers, send messages, or execute business actions.

## Access Principles

- private by default
- authenticated only
- least privilege
- no public access
- no anonymous read
- no public bucket
- no service-role key in browser code
- no raw storage path exposed unnecessarily
- no customer-facing direct image access
- no long-lived public preview link

## Future Storage Policies

Future Supabase Storage policies should be planned before implementation:

- authenticated upload to `business-card-captures`
- authenticated read for allowed internal files
- no anonymous read
- no public delete
- delete/archive only through an approved server flow later
- policy checks should fail closed when session or file ownership/context is unclear

The first policy pack should be reviewed as SQL text before execution. It should be applied manually or through an approved database execution channel only after Paul approves it.

## Upload Endpoint Boundary

Future upload should go through a safe API endpoint later.

That endpoint should enforce:

- authenticated request
- MIME validation
- extension validation
- size validation
- empty/corrupt file rejection
- storage path generation
- private bucket upload
- database record creation or linkage
- safe error response without storage paths, provider payloads, tokens, or secrets

No upload endpoint is implemented by this plan.

## Preview Boundary

Preview should follow these rules:

- preview only inside authenticated Admin UI
- signed URLs should be short-lived
- do not embed public image links in customer-facing output
- do not print signed URLs in logs
- do not show raw storage paths in normal operator UI
- do not screenshot or export sensitive card data by default
- show a placeholder when preview is unavailable or permission is denied

## Team/Future Roles

Plan later:

- `owner`
- `admin`
- `reviewer`
- `readonly_user`

Possible future role intent:

- owner/admin: configure storage policy and approve deletion/archive actions
- reviewer: preview internal card images and review extracted fields
- readonly_user: see safe metadata and review status only

No role implementation is authorized now.

## Risks

- public bucket misconfiguration
- long-lived signed URLs
- accidental exposure in logs
- privileged key leaked to frontend code
- storing personal data in paths
- using raw email/phone/WhatsApp in object names
- allowing delete directly from browser
- allowing OCR provider access before privacy review
- keeping rejected/private cards longer than necessary

## Required Future Checks Before Implementation

Before any real upload is enabled, confirm:

- bucket is private
- storage policy blocks anonymous access
- upload API requires auth
- file size limit is enforced
- MIME and extension checks both exist
- no public URL is produced
- no raw storage path is exposed in normal UI
- preview URLs expire quickly
- rejected file handling does not create customers or drafts
- audit plan exists for upload, preview, archive, and delete
