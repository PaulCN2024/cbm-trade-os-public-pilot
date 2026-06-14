# CBM Trade OS Mainline Status

Date: 2026-06-14

## Project Positioning

CBM Trade OS is an AI-driven Foreign Trade Business Operating System, not a simple CRM.

The long-term system is intended to support:

- lead capture
- customer management
- inquiry analysis
- document and drawing processing
- supplier communication
- supplier quotation comparison
- customer quotation
- PI and order confirmation
- production order
- production tracking
- packaging and quality check
- shipping and export documents
- after-sales service
- customer follow-up
- repeat demand discovery

## Current Technical Context

- Frontend: static HTML/CSS/JS multi-page structure
- Backend: Vercel Serverless Functions in `api/*.js`
- Database: Supabase pilot exists
- Auth: Supabase Auth plus existing admin protection logic
- Deployment: Vercel with `vercel.json`

Do not convert the project to React, Next.js, Vue, or a new framework unless explicitly approved.
Do not rebuild the whole system from scratch.

## Mainline Baseline

MVP Step 1 is completed and accepted as the current mainline baseline.

Accepted Step 1 files:

- `supabase/migrations/202606140001_crm_mvp_step1_schema.sql`
- `lib/crm-constants.js`
- `lib/crm-constants.ts`
- `lib/ai-inquiry-router.js`
- `tests/ai-inquiry-router.test.js`
- `package.json` Step 1 build checks for `lib/crm-constants.js` and `lib/ai-inquiry-router.js`
- `docs/CODEX_STATUS.md`

## Step 1 Completed

Step 1 delivered:

- CRM MVP database schema
- `business_line` constants
- rule-based inquiry router
- routing tests
- AI safety boundary tests

Business line values:

- `A_ARCHITECTURAL`
- `B_INDUSTRIAL`
- `UNKNOWN`

Legacy compatibility:

- `B_PRECISION` is treated as a legacy value and normalized to `B_INDUSTRIAL` where needed.

## Step 1 Migration Summary

Migration file:

- `supabase/migrations/202606140001_crm_mvp_step1_schema.sql`

New MVP tables:

- `companies`
- `architectural_inquiries`
- `deep_processing_inquiries`
- `products`
- `quotations`
- `quotation_items`
- `documents`
- `manufacturing_capabilities`
- `ai_inquiry_analyses`

Backward-compatible extensions:

- `customers`: `company_id`, `language`, `rating`, `stage`, `notes`, `last_contact_at`, `next_follow_up_at`
- `inquiries`: `company_id`, `inquiry_type`, `product_category`, `original_message`

Database safety:

- No existing tables were deleted.
- No existing tables were renamed.
- No destructive migration was added.
- RLS is enabled on new tables.
- Pilot authenticated-user policies are included for the new tables.

## Step 1 Router Summary

File:

- `lib/ai-inquiry-router.js`

The router is rule-based only. It does not call OpenAI or any external AI provider.

It returns:

- detected business line
- customer intent
- extracted requirements
- missing information
- risk flags
- suggested reply draft
- `approval_required: true`
- safety boundaries

Routing behavior:

- Architectural terms such as windows, doors, curtain wall, facade, louvers, railings, glass, project, building, villa, hotel and apartment route to `A_ARCHITECTURAL`.
- Industrial terms such as CNC, machining, brackets, housings, connectors, drawings, tolerance, prototype, sample and aluminum parts route to `B_INDUSTRIAL`.
- Profile, extrusion and aluminum profile stay `UNKNOWN` unless the application is clear.

## Verification

Last verified after Phase 0 cleanup:

```bash
npm test
npm run build
```

Actual result:

- `npm test`: passed, 170 tests passed.
- `npm run build`: passed.

## Step 2A Status

Step 2A API-only foundation is completed locally.

Step 1 baseline commit:

- `e3015e0 chore: accept crm mvp step 1 baseline`

## Step 2A Changed Files

- `api/companies.js`
- `api/products.js`
- `api/manufacturing-capabilities.js`
- `api/ai-inquiry-analyses.js`
- `lib/api-validation.js`
- `tests/step2a-api.test.js`
- `package.json`
- `docs/CODEX_STATUS.md`

## Step 2A API Routes Added

API-only foundation routes:

- `api/companies.js`
- `api/products.js`
- `api/manufacturing-capabilities.js`
- `api/ai-inquiry-analyses.js`

Supported safe methods:

- `GET` list
- `GET ?id=...` by id
- `POST` create
- `PATCH` / `PUT` update

Not included:

- no soft delete
- no archive action
- no `archived_at`, `deleted_at`, `is_archived`, or `is_deleted` schema changes
- no UI pages

## Step 2A Validation Summary

API input validation helper:

- `lib/api-validation.js`

Allowed `business_line` values at the API layer:

- `A_ARCHITECTURAL`
- `B_INDUSTRIAL`
- `UNKNOWN`

Invalid `business_line` values return validation errors.

Default behavior:

- `products.business_line` defaults to `UNKNOWN` on create if missing.
- `manufacturing_capabilities.capability_line` defaults to `UNKNOWN` on create if missing.
- `ai_inquiry_analyses.detected_business_line` defaults to `UNKNOWN` on create if missing.
- Partial updates do not overwrite existing business line values when omitted.

## Step 2A AI Draft Safety Summary

`ai_inquiry_analyses` remains draft-only.

On create and update:

- `approval_required` is forced to `true`.
- API clients cannot set `approval_required` to `false`.
- `suggested_reply` is stored only as draft text.
- No send action exists.
- Automatic sending or business commitments are not implemented.

## Explicitly Not Implemented Yet

The following are intentionally not implemented in the mainline baseline:

- UI pages for Step 2A
- CRUD admin pages for Step 2A
- quotations workflow
- orders workflow
- production workflow
- shipping workflow
- OpenAI integration
- email sending
- WhatsApp sending
- PI generation
- formal quotation sending
- automatic business commitments
- soft delete/archive for Step 2A foundation objects

## AI Safety Boundaries

AI may:

- analyze
- summarize
- classify
- extract
- draft
- compare
- remind
- flag risks

AI must not automatically:

- confirm price
- confirm delivery time
- confirm payment terms
- confirm production feasibility
- send official quotations
- send PI
- send contracts
- promise quality standards
- promise supplier capability
- place supplier orders
- arrange shipment
- send formal business commitments

All important business actions require human approval.

## Workstreams Preserved Outside Step 2A

Phase 0 cleanup moved unrelated workstreams out of the current mainline and preserved them in a local backup outside the project workspace.

These workstreams are not part of the current mainline baseline:

- UI Lab visual prototype work
- Command Center UI work
- agent prompt library docs
- UI Lab review ZIP artifact

## Latest Verification

Commands:

```bash
npm test
npm run build
```

Results:

- `npm test`: passed, 178 tests passed.
- `npm run build`: passed.

## Recommended Next Step

Step 2B Admin UI Design Foundation is completed locally.

## Step 2B Purpose

Step 2B establishes a clean, professional, static B2B SaaS-style admin UI foundation for the AI Foreign Trade Business OS.

This step is UI design foundation only.

It does not connect Step 2A APIs.
It does not implement real CRUD.
It does not add business automation.

## Step 2B Changed Files

- `admin/ui-foundation/index.html`
- `admin/ui-foundation/styles.css`
- `admin/ui-foundation/app.js`
- `package.json`
- `docs/CODEX_STATUS.md`

## Step 2B UI Patterns Added

Static UI foundation route:

- `/admin/ui-foundation/index.html`

Sample screens:

- Admin dashboard layout sample
- Companies management sample
- Products management sample
- Manufacturing capabilities sample
- AI inquiry analysis draft review sample

Reusable UI patterns:

- left sidebar navigation
- top header
- main content area
- page title and short description
- summary metric cards
- clean data table pattern
- card-based form pattern
- detail/review panel
- AI draft review area
- empty state
- loading state
- error state
- business_line badges
- draft / approval required badges
- risk badges
- coming soon module links

## Step 2B Boundaries

Confirmed not connected or implemented:

- no Step 2A API connection
- no real CRUD workflow
- no database schema change
- no public website change
- no Command Center change
- no Document Center change
- no UI Lab backup file change
- no quotation workflow
- no order workflow
- no production workflow
- no shipping workflow
- no OpenAI integration
- no email sending
- no WhatsApp sending
- no PI generation
- no formal quotation sending
- no automatic business commitments

## Step 2B Verification

Commands:

```bash
npm test
npm run build
```

Results:

- `npm test`: passed, 178 tests passed.
- `npm run build`: passed.

## Recommended Step 2C

After visual review and approval, connect the approved UI foundation to Step 2A APIs for:

1. companies
2. products
3. manufacturing capabilities
4. AI inquiry analysis drafts

Step 2C should still keep AI draft safety boundaries and avoid quotation/order/production/shipping automation.

## Step 2C-1 Purpose

Step 2C-1 connects only the Companies section of the approved Admin UI foundation to the existing Step 2A Companies API as a read-only list.

This is a narrow integration step.

## Step 2C-1 Changed Files

- `admin/ui-foundation/index.html`
- `admin/ui-foundation/styles.css`
- `admin/ui-foundation/app.js`
- `docs/CODEX_STATUS.md`

## Step 2C-1 API Integration

Connected route:

- `GET /api/companies`

Behavior:

- Companies page shows loading state while requesting data.
- Companies page renders API records when available.
- Empty API response shows an empty state.
- API failure or missing admin token shows an error state and local preview fallback for visual review only.
- No create, update or delete action is connected.

Other sections remain static/mock:

- Dashboard
- Products
- Manufacturing capabilities
- AI inquiry analysis draft review
- Future module placeholders

## Step 2C-1 Boundaries

Confirmed not implemented:

- no new API routes
- no API writes from Admin UI foundation
- no full CRUD
- no database schema change
- no public website change
- no Command Center change
- no Document Center change
- no UI Lab change
- no quotations, orders, production or shipping workflow
- no OpenAI integration
- no email or WhatsApp sending
- no PI generation
- no formal quotation sending
- no automatic business commitments

## Step 2C-1 Verification

Commands:

```bash
npm test
npm run build
```

Results:

- `npm test`: passed, 178 tests passed.
- `npm run build`: passed.

## Recommended Step 2C-2

After Step 2C-1 review, connect Products as a read-only list using the same API adapter pattern.
