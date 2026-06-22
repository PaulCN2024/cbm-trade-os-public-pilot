# Follow-up Assistant Read-only Production Checkpoint

## Purpose

Record the production deployment and smoke verification for the AI Follow-up Assistant read-only data foundation.

## Deployment summary

- Production alias: `https://project-7vo99.vercel.app`
- Deployment URL: `https://project-7vo99-cweqflskf-paul-s-projects2026.vercel.app`
- Deployment ID: `dpl_6rwwX5KzsfmSP6a1PhRpyTg9ymzd`
- Status: Ready
- Target: production
- Created: Mon Jun 22 2026 11:03:36 GMT+0800

## Implementation summary

- Migration SQL file created
- DEMO seed SQL created
- Combined SQL pack created
- SQL executed after Paul approval
- SQL execution report created
- Admin-read follow-up routes added
- AI 跟进助手 UI data binding added
- Fallback DEMO data preserved
- No AI provider, task creation, scheduled reminder, sending, customer mutation, inquiry mutation, quotation, PI, order, payment, production, shipment, or business execution was introduced

## SQL execution status

- Target project: PaulCN2024's Project / `zswtekjtkyvfagbudkia`
- Approval status: Paul replied `APPROVED`
- Execution channel: Supabase Dashboard SQL Editor through approved logged-in browser session
- SQL file executed: `docs/ops/followup-assistant-manual-sql-combined.sql`
- Result: success

## Row counts

| Table | Verified count |
| --- | ---: |
| `followup_candidates` | 3 |
| `followup_missing_information` | 9 |
| `followup_recommendations` | 3 |
| `followup_message_drafts` | 3 |
| `followup_reviews` | 3 |

## RLS and policy status

- RLS verified enabled for all 5 `followup_*` tables
- Policies verified as authenticated SELECT-only
- No write policies were created
- No anonymous/public policies were created

## API routes

| Route | Production smoke result |
| --- | --- |
| `/api/admin-read/followup-summary` | JSON 401 auth gate, not 404 |
| `/api/admin-read/followup-candidates` | JSON 401 auth gate, not 404 |
| `/api/admin-read/followup-missing-information` | JSON 401 auth gate, not 404 |
| `/api/admin-read/followup-recommendations` | JSON 401 auth gate, not 404 |
| `/api/admin-read/followup-message-drafts` | JSON 401 auth gate, not 404 |
| `/api/admin-read/followup-review-queue` | JSON 401 auth gate, not 404 |
| `/api/admin-read/followup-reviews` | JSON 401 auth gate, not 404 |
| `/api/admin-read/unknown` | stable JSON 404 |
| `POST /api/admin-read/followup-summary` | 405 `Allow: GET` |

## UI smoke

- `AI 跟进助手` renders on production Admin UI trial page
- Summary cards render: 6
- Candidate cards render: 3
- Records/fallback render safely
- Active controls inside the module: 0
- No `undefined` / `null` visible
- No horizontal overflow observed
- No fatal console errors observed

## Safety boundary

- Read-only only
- No AI provider call
- No real task creation
- No scheduled reminders
- No message sending
- No customer mutation
- No inquiry mutation
- No quote, PI, order, payment, production, or shipment action
- Human approval remains required before any external communication or business-risk action

## Known limitations

- No real AI drafting provider
- No approved task creation
- No scheduled reminders
- No approved send integration
- Authenticated 200 JSON smoke remains deferred without a safe admin token

## Recommended next tasks

1. `CBM-CODEX-SPRINT-INQUIRY-INTELLIGENCE-UI-001`
2. `CBM-CODEX-SPRINT-FOLLOWUP-ASSISTANT-MESSAGE-TEMPLATE-001`
3. `CBM-CODEX-SPRINT-FOLLOWUP-ASSISTANT-HUMAN-REVIEW-QUEUE-001`
4. `CBM-CODEX-SPRINT-FOLLOWUP-ASSISTANT-AI-PROVIDER-PLAN-001`

## Progress

- Full product vision: 59% -> 60%
- Internal MVP / foundation: 100% -> 100%
