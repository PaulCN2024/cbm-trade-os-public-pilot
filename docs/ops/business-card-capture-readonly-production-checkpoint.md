# Business Card Capture Read-only Production Checkpoint

## Purpose

Record the production deployment and smoke verification of the Business Card Capture read-only data foundation.

This checkpoint covers the SQL file pack, GET-only Admin Read Dispatcher resources, AI 名片识别 Admin UI data binding, safe fallback behavior, production deployment, and read-only smoke verification.

## Deployment Summary

- Production alias: https://project-7vo99.vercel.app
- Deployment URL: https://project-7vo99-m57uk9i7f-paul-s-projects2026.vercel.app
- Deployment ID: `dpl_5gt4ZoqEGSWtyFvrzbHcnxtcaAf4`
- Ready status: Ready
- Target: production
- Created: Sun Jun 21 2026 17:39:38 GMT+0800

## Functional Summary

- Migration SQL file prepared: `supabase/migrations/20260621_business_card_capture_readonly_foundation.sql`
- DEMO seed SQL prepared: `docs/ops/business-card-capture-demo-seed-readonly.sql`
- Combined manual SQL pack prepared: `docs/ops/business-card-capture-manual-sql-combined.sql`
- Manual execution guide prepared: `docs/ops/business-card-capture-manual-sql-execution-pack.md`
- Admin Read Dispatcher now exposes GET-only/auth-gated Business Card Capture resources.
- AI 名片识别 UI now reads admin-read endpoints when available and falls back to safe DEMO preview data when unauthenticated, unavailable, empty, or invalid.

## Admin-read Routes Verified

| Route | Result | Expected? | Notes |
| --- | --- | --- | --- |
| `/api/admin-read/business-card-summary` | 401 JSON auth gate | Yes | Route exists; not 404. |
| `/api/admin-read/business-card-capture-sources` | 401 JSON auth gate | Yes | Route exists; not 404. |
| `/api/admin-read/business-card-extraction-results` | 401 JSON auth gate | Yes | Route exists; not 404. |
| `/api/admin-read/customer-profile-drafts` | 401 JSON auth gate | Yes | Route exists; not 404. |
| `/api/admin-read/business-card-review-queue` | 401 JSON auth gate | Yes | Route exists; not 404. |
| `/api/admin-read/business-card-duplicate-checks` | 401 JSON auth gate | Yes | Route exists; not 404 after one retry. |
| `/api/admin-read/business-card-followup-drafts` | 401 JSON auth gate | Yes | Route exists; not 404. |
| `/api/admin-read/unknown` | stable JSON 404 | Yes | Unknown resource remains safe. |
| `POST /api/admin-read/customer-profile-drafts` | 405, `Allow: GET` | Yes | Admin-read remains GET-only. |

## Production Smoke Table

| Route | Result | Expected? | Notes |
| --- | --- | --- | --- |
| `/` | 200 | Yes | Production alias responds. |
| `/admin/ui-foundation/index.html?trial=1` | 200 | Yes | Admin UI trial page loads. |
| `/admin/ui-foundation/app.js` | 200 | Yes | Production JS bundle includes new Business Card admin-read endpoints. |
| `/admin/ui-foundation/styles.css` | 200 | Yes | Stylesheet loads. |
| `/api/health` | 200 | Yes | Health endpoint responds. |
| `/api/admin-read/dashboard-summary` | 401 JSON auth gate | Yes | Existing protected admin-read route remains deployed. |

## Browser Smoke

- Production URL checked: https://project-7vo99.vercel.app/admin/ui-foundation/index.html?trial=1
- AI 名片识别 page rendered.
- Summary grid rendered.
- Extracted field cards rendered: 15.
- Review queue rendered.
- Active controls inside `.business-card-capture-preview`: 0.
- Visible `undefined` / `null`: none.
- Desktop horizontal overflow: none.
- Fatal page errors caused by this change: none.
- Console 401 resource messages were expected because production admin-read routes are auth-gated without an admin bearer token.

## Safety Confirmation

- Codex did not execute SQL.
- Codex did not run Supabase CLI, psql, migrations, or seed SQL.
- Codex did not touch the remote database.
- No production data was modified by this task.
- No environment variables were changed.
- No package files were changed.
- No new physical API file was created.
- Admin-read remains GET-only.
- Protected resources remain auth-gated.
- Unknown resources return stable JSON 404.
- Non-GET requests return 405 with `Allow: GET`.
- AI 名片识别 still has no upload, OCR, image parsing, AI provider call, customer creation, customer mutation, message sending, task creation, quotation, PI, order, payment, production, shipment, or business execution.

## Known Limitations

- The SQL has only been prepared as files; Paul still needs to apply it manually in Supabase Dashboard SQL Editor.
- Authenticated 200 JSON smoke is deferred until a safe admin session or bearer token is available.
- The UI currently shows fallback DEMO data when unauthenticated.
- Upload, OCR, AI extraction, customer creation, follow-up sending, and controlled write workflows are not implemented.

## Recommended Next Tasks

1. `CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-POST-SQL-VERIFY-001` - Verify manual SQL execution and RLS after Paul applies the SQL.
2. `CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-UPLOAD-SAFETY-001` - Plan upload storage, privacy, retention, and file safety before upload.
3. `CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-OCR-PLAN-001` - Plan OCR/vision provider privacy, confidence, and review behavior.
4. `CBM-CODEX-SPRINT-CUSTOMER-VERIFICATION-UI-001` - Add customer verification / buyer discovery static UI preview.
5. `CBM-CODEX-SPRINT-FOLLOWUP-ASSISTANT-PLAN-001` - Plan draft-only follow-up assistant workflow.

## Progress Report

- Full product vision: 50% -> 50%
- Internal MVP / foundation: 100% -> 100%
- Business Card Capture Read-only Data Foundation: 0% -> 100%
- Business Card Capture Read-only Production Checkpoint: 0% -> 100%
- Overall: `[█████░░░░░]` 50%
- Internal MVP: `[██████████]` 100%
- Current module: `[██████████]` 100%
