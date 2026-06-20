# Phase UI-3 Admin-read Expansion Backlog

## Purpose

This backlog lists safe future admin-read expansion candidates for CBM Trade OS. It keeps the next API work GET-only, narrowly projected, and separated from write workflows.

This is planning only. It does not add routes, schema, UI wiring, or business execution.

## Current Admin-read Coverage

Current safe read-only coverage includes:

- `GET /api/admin-read/dashboard-summary`
- `GET /api/admin-read/customers`
- `GET /api/admin-read/inquiries`
- `GET /api/admin-read/ai-review`
- `GET /api/admin-read/supplier-capabilities`
- `GET /api/admin-read/documents`
- `GET /api/admin-read/pre-quotation-review`
- `GET /api/admin-read/quotations`

These routes should continue to preserve auth gates, stable JSON errors, no direct writes, no file content exposure, and no external channel execution.

## Expansion Backlog

| Resource | Target Route | Source Readiness | Risk | Safe Projection Notes | Required Plan Before Implementation | Recommended Priority |
| --- | --- | --- | --- | --- | --- | --- |
| Settings summary | `/api/admin-read/settings-summary` | Likely partial/static | Low | Show configuration status only, not secrets or env values | Settings field allowlist | P1 |
| Order metadata | `/api/admin-read/orders` | Needs schema review | Medium | Show order status metadata only; avoid payment, bank, and private cost fields | Order read projection plan | P2 |
| Production status metadata | `/api/admin-read/production-status` | Needs schema review | Medium | Show factory-facing status without customer identity leakage | Production field allowlist | P2 |
| Shipping status metadata | `/api/admin-read/shipping-status` | Needs schema review | Medium | Show logistics status only; avoid private documents and tracking secrets | Shipping field allowlist | P2 |
| After-sales metadata | `/api/admin-read/after-sales` | Needs schema review | Medium | Show issue status and owner; avoid compensation commitment wording | After-sales safety wording plan | P2 |
| Disabled action registry summary | `/api/admin-read/disabled-action-registry` | Plan exists | Low | Show action labels, disabled state, and required approval type | Static registry module plan | P2 |
| Proposed actions | `/api/admin-read/proposed-actions` | Not ready | High | Show staged/draft actions only after proposed-action schema exists | Proposed action schema and approval plan | P3 |
| Action approvals summary | `/api/admin-read/action-approvals-summary` | Not ready | High | Show approval status only after audit model exists | Approval audit migration review | P3 |
| Action audit logs | `/api/admin-read/action-audit-logs` | Not ready | High | Show append-only metadata only; avoid payload secrets | Audit log projection plan | P3 |
| Quotation items safe summary | `/api/admin-read/quotation-items-summary` | Requires careful review | High | Hide internal cost, exchange rate, margin, uplift, and factory-only fields | Customer document field policy review | P4 |
| Supplier RFQ draft metadata | `/api/admin-read/supplier-rfq-drafts` | Not ready | High | Show draft-only review metadata; no send state | Supplier RFQ safety plan | P4 |

## Priority Guidance

- `P1`: use for trial feedback, authenticated smoke support, and safe settings visibility.
- `P2`: use for order, production, shipping, and after-sales metadata only after schema review.
- `P3`: use for proposed actions and audit logs only after approval/audit schema exists.
- `P4`: use for quotation item summaries and supplier RFQ drafts only after field-level safety reviews.

## Risks To Avoid

- exposing sensitive fields such as internal cost, profit, exchange rate, bank details, storage paths, signed URLs, private file names, raw file content, or customer-private documents
- implying business status is confirmed when data is only preview, fallback, draft, or incomplete
- using fallback data in a way that hides missing live data
- expanding Vercel function count without checking current routing constraints
- assuming auth/RLS behavior without authenticated smoke validation
- mixing read-only projection work with write or approval execution work

## Recommended Next 5 Practical Tasks

1. `CBM-CODEX-SPRINT-TRIAL-002 - Paul Manual Trial Feedback Incorporation`
2. `CBM-CODEX-RELEASE-013 - Authenticated Admin API Smoke Test Execution` if a safe token/session exists
3. `CBM-CODEX-SPRINT-API-PLAN-004 - Settings Summary Admin-read Plan`
4. `CBM-CODEX-SPRINT-API-PLAN-005 - Order/Production/Shipping Read Projection Plan`
5. `CBM-CODEX-SPRINT-SAFETY-004 - Proposed Action And Approval Audit Read Model Plan`

## Progress Report

- Full product vision: 36% -> 36%
- Internal MVP / foundation: 95% -> 96% if the full planning pack is completed and pushed
- Admin-read Expansion Backlog: 0% -> 100%
- Overall: `[████░░░░░░]` 36%
- Internal MVP: `[██████████]` 96%
- Current module: `[██████████]` 100%
