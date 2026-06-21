# Business Card Capture Upload UI Production Checkpoint

## Purpose

Record the production deployment and smoke verification of the static Business Card Capture upload UI preview.

This checkpoint confirms the Admin UI now shows how a future business card image upload flow may look, while real upload, OCR, storage, customer creation, sending, and business execution remain disabled.

## Deployment Summary

| Item | Value |
| --- | --- |
| Production alias | https://project-7vo99.vercel.app |
| Deployment URL | https://project-7vo99-eydogt5mf-paul-s-projects2026.vercel.app |
| Deployment ID | dpl_6Vcn3q212236vq1w857Chz7dHLeQ |
| Target | production |
| Status | Ready |
| Created | Sun Jun 21 2026 21:35:50 GMT+0800 |
| UI preview commit | edfd4c9 feat: add business card capture upload ui preview |

## Preview Summary

- Static upload zone: shows `上传名片图片` and explains that the current UI is a static preview with no real upload.
- File rules panel: shows JPG / PNG / WEBP support direction, PDF as later-stage evaluation, 5 MB recommended size, and rejected unsafe file categories.
- Privacy panel: explains business-card personal data, future private storage, no public access, no automatic customer creation, no automatic sending, and required human confirmation.
- OCR future pipeline: shows `图片上传 -> 私有存储 -> OCR/视觉识别 -> 提取字段 -> 置信度评分 -> 查重 -> 客户草稿 -> Paul 审核`.
- Error state preview: shows unsupported type, oversized file, unclear image, low confidence, possible duplicate customer, and manual review states.
- Retention note: explains archive/delete handling for error, duplicate, or unrelated cards, and avoids saving unrelated private information.

## Safety Boundary

- No real upload is implemented.
- No active file input is present.
- No drag/drop handler is present.
- No upload button or form submit is present.
- No storage bucket call is made.
- No OCR or image parsing is executed.
- No AI provider call is made.
- No customer record is created or mutated.
- No message is sent.
- No business execution is enabled.

## Production Smoke Table

| Check | Result | Expected? | Notes |
| --- | --- | --- | --- |
| `/` | 200 | Yes | Production root responded. |
| `/admin/ui-foundation/index.html?trial=1` | 200 | Yes | Admin UI shell responded. |
| `/admin/ui-foundation/app.js` | 200 | Yes | Updated Admin UI script served. |
| `/admin/ui-foundation/styles.css` | 200 | Yes | Updated Admin UI styles served. |
| `/api/health` | 200 | Yes | Health endpoint responded with JSON. |
| `/api/admin-read/dashboard-summary` | 401 JSON | Yes | Protected read route remains auth-gated, not 404. |
| `/api/admin-read/customers` | 401 JSON | Yes | Protected read route remains auth-gated, not 404. |
| `/api/admin-read/inquiries` | 401 JSON | Yes | Protected read route remains auth-gated, not 404. |
| `/api/admin-read/ai-review` | 401 JSON | Yes | Protected read route remains auth-gated, not 404. |
| `/api/admin-read/supplier-capabilities` | 401 JSON | Yes | Protected read route remains auth-gated, not 404. |
| `/api/admin-read/documents` | 401 JSON | Yes | Protected read route remains auth-gated, not 404. |
| `/api/admin-read/pre-quotation-review` | 401 JSON | Yes | Protected read route remains auth-gated, not 404. |
| `/api/admin-read/quotations` | 401 JSON | Yes | Protected read route remains auth-gated, not 404. |
| `/api/admin-read/business-card-summary` | 401 JSON | Yes | Protected business-card read route remains auth-gated, not 404. |
| `/api/admin-read/business-card-capture-sources` | 401 JSON | Yes | Protected business-card read route remains auth-gated, not 404. |
| `/api/admin-read/business-card-extraction-results` | 401 JSON | Yes | Protected business-card read route remains auth-gated, not 404. |
| `/api/admin-read/customer-profile-drafts` | 401 JSON | Yes | Protected business-card read route remains auth-gated, not 404. |
| `/api/admin-read/business-card-review-queue` | 401 JSON | Yes | Protected business-card read route remains auth-gated, not 404. |
| `/api/admin-read/business-card-duplicate-checks` | 401 JSON | Yes | Protected business-card read route remains auth-gated, not 404. |
| `/api/admin-read/business-card-followup-drafts` | 401 JSON | Yes | Protected business-card read route remains auth-gated, not 404. |
| `/api/admin-read/unknown` | 404 JSON | Yes | Unknown resource still returns stable JSON 404. |
| `POST /api/admin-read/business-card-summary` | 405 Allow: GET | Yes | Admin-read route remains GET-only. |

## Browser Smoke Result

Production browser smoke used Playwright against:

```text
https://project-7vo99.vercel.app/admin/ui-foundation/index.html?trial=1
```

Result:

- `AI 名片识别` rendered.
- Upload UI preview rendered.
- Privacy and retention notes rendered.
- Active controls inside the module: 0.
- File inputs inside the module: 0.
- No horizontal overflow at 1440px viewport.
- No `undefined` / `null` visible in the module.
- No fatal JavaScript page errors.
- No positive misleading markers such as `已上传`, `自动识别完成`, `一键上传`, `一键建档`, or `已保存到客户中心`.

## Known Limitations

- Real upload is not implemented.
- Private storage is not configured for upload execution.
- OCR/vision extraction is not implemented.
- Customer creation approval workflow is not implemented.
- Authenticated JSON smoke for protected admin-read data still requires a safe admin login/token.

## Recommended Next Tasks

1. CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-STORAGE-PLAN-001
2. CBM-CODEX-SPRINT-BUSINESS-CARD-CAPTURE-OCR-PROVIDER-PLAN-001
3. CBM-CODEX-SPRINT-CUSTOMER-VERIFICATION-UI-001
4. CBM-CODEX-SPRINT-FOLLOWUP-ASSISTANT-PLAN-001

## Progress

- Full product vision: 51% -> 52%
- Internal MVP / foundation: 100% -> 100%
