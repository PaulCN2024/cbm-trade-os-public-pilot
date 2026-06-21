# Business Card Capture Implementation Roadmap

## Roadmap

### BC0 planning complete

Initial feature concept is complete. The feature is positioned as business-card/photo/contact-image capture into a reviewed customer profile draft.

### BC1 static UI preview complete

The Admin UI now includes a static/read-only `AI 名片识别` preview. It has no upload, OCR, AI provider call, customer creation, message sending, or business execution.

### BC2 data model plan

This planning stage defines future data tables, privacy boundaries, human review workflow, and implementation sequence.

### BC3 read-only data foundation

Future task: prepare a read-only data foundation for card capture records after schema planning is explicitly approved.

Expected scope:

- migration draft only first
- read-only admin resource plan
- demo seed plan
- no upload/OCR
- no customer creation

### BC4 upload safety plan

Future task: design upload rules before any file upload exists.

Must cover:

- allowed file types
- file size limits
- storage bucket privacy
- retention
- deletion/archive policy
- virus/malware scanning expectation
- no public file URLs
- no raw file exposure in Admin UI

### BC5 OCR/vision provider plan

Future task: evaluate OCR/vision providers and privacy implications.

Must cover:

- provider data retention
- whether images leave Supabase/Vercel
- logging redaction
- confidence fields
- manual retry behavior
- no provider key exposure
- no automatic customer creation

### BC6 extraction preview

Future task: show read-only extraction results from stored demo or approved read-only data.

Expected scope:

- extraction fields
- confidence/risk indicators
- missing information
- duplicate warnings
- source reference
- no editable fields first

### BC7 human review queue

Future task: implement a review queue after the data foundation exists.

Expected scope:

- list pending captures
- show extraction result
- show duplicate warnings
- show disabled future actions
- no approve/create/send execution until approval workflow exists

### BC8 approved customer creation with approval

Future task: design and implement controlled customer creation only after approval architecture exists.

Must include:

- explicit approval request
- reviewer identity
- audit record
- duplicate override handling
- rollback/correction plan
- separate approval from follow-up sending

### BC9 follow-up draft workflow

Future task: generate and review follow-up drafts.

Must remain:

- draft-only
- unsent by default
- approval-gated before sending
- safe wording with no price, delivery, payment, quotation, PI, order, production, or shipment commitment

### BC10 audit and privacy hardening

Future task: add audit and privacy hardening around real data.

Must cover:

- extraction logs
- review logs
- approval logs
- retention policy
- field-level access expectations
- customer creation traceability
- provider/privacy review

## Recommended Next Executable Tasks

1. `CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-DATA-READONLY-001`
2. `CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-UPLOAD-SAFETY-001`
3. `CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-OCR-PLAN-001`
4. `CBM-CODEX-SPRINT-CUSTOMER-VERIFICATION-UI-001`
5. `CBM-CODEX-SPRINT-FOLLOWUP-ASSISTANT-PLAN-001`

## Progress Impact

Planning:

- Full product vision +1%.

Read-only data foundation:

- Full product vision +1%.

Real upload/OCR:

- Later, only after safety approval.

This roadmap should not increase Internal MVP beyond 100%. It also should not be used to justify schema, API, upload, OCR, AI provider, customer creation, or sending work without a separate approved implementation task.
