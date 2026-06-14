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

## Step 2C-2 Purpose

Step 2C-2 connects only the Products section of the approved Admin UI foundation to the existing Step 2A Products API as a read-only list.

This is another narrow read-only integration step.

## Step 2C-2 Changed Files

- `admin/ui-foundation/app.js`
- `docs/CODEX_STATUS.md`

## Step 2C-2 API Integration

Connected route:

- `GET /api/products`

Behavior:

- Products page shows loading state while requesting data.
- Products page renders API records when available.
- Empty API response shows an empty state.
- API failure or missing admin token shows an error state and clearly marked Preview fallback / local preview data.
- No create, update or delete action is connected.

Other sections remain static/mock or unchanged:

- Dashboard remains static.
- Companies remains read-only API list from Step 2C-1.
- Manufacturing capabilities remain static/not connected.
- AI inquiry analysis draft review remains static/mock.
- Future modules remain coming soon.

## Step 2C-2 Boundaries

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

## Step 2C-2 Verification

Commands:

```bash
npm test
npm run build
```

Results:

- `npm test`: passed, 178 tests passed.
- `npm run build`: passed.

## Recommended Step 2C-3

After Step 2C-2 review, connect Manufacturing Capabilities as a read-only list using the same API adapter pattern.

## Step 2C-3 Purpose

Step 2C-3 connects only the Manufacturing Capabilities section of the approved Admin UI foundation to the existing Step 2A Manufacturing Capabilities API as a read-only list.

This is a narrow read-only integration step. AI Drafts remain static/mock and are not connected yet.

## Step 2C-3 Changed Files

- `admin/ui-foundation/index.html`
- `admin/ui-foundation/app.js`
- `docs/CODEX_STATUS.md`

## Step 2C-3 API Integration

Connected route:

- `GET /api/manufacturing-capabilities`

Behavior:

- Manufacturing Capabilities page shows loading state while requesting data.
- Manufacturing Capabilities page renders API records when available.
- Empty API response shows an empty state.
- API failure or missing admin token shows an error state and clearly marked Preview fallback / local preview data.
- No create, update or delete action is connected.

Other sections remain static/mock or unchanged:

- Dashboard remains static.
- Companies remains read-only API list from Step 2C-1.
- Products remains read-only API list from Step 2C-2.
- AI inquiry analysis draft review remains static/mock.
- Future modules remain coming soon.

## Step 2C-3 Boundaries

Confirmed not implemented:

- no AI Drafts API connection
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
- no production feasibility, price or delivery time commitment

## Step 2C-3 Verification

Commands:

```bash
npm test
npm run build
```

Results:

- `npm test`: passed, 178 tests passed.
- `npm run build`: passed.

## Recommended Step 2C-4

After Step 2C-3 review, connect AI Inquiry Analysis Drafts as a read-only draft review list with approval-required safety boundaries.

## Step 2C-4 Purpose

Step 2C-4 connects only the AI Inquiry Analysis Drafts section of the approved Admin UI foundation to the existing Step 2A AI Inquiry Analyses API as a read-only draft review list.

This is a narrow read-only integration step. Suggested replies remain draft-only and are not sent.

## Step 2C-4 Changed Files

- `admin/ui-foundation/index.html`
- `admin/ui-foundation/app.js`
- `docs/CODEX_STATUS.md`

## Step 2C-4 API Integration

Connected route:

- `GET /api/ai-inquiry-analyses`

Behavior:

- AI Drafts page shows loading state while requesting data.
- AI Drafts page renders API records when available.
- Empty API response shows an empty state.
- API failure or missing admin token shows an error state and clearly marked Preview fallback / local preview data.
- All displayed records are treated as `approval_required: true`.
- Suggested replies are displayed as draft text only.
- No create, update, delete, send, quotation or PI action is connected.

Other sections remain static/mock or unchanged:

- Dashboard remains static.
- Companies remains read-only API list from Step 2C-1.
- Products remains read-only API list from Step 2C-2.
- Manufacturing Capabilities remains read-only API list from Step 2C-3.
- Future modules remain coming soon.

## Step 2C-4 Boundaries

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
- no price, delivery time, payment term, bank account or production feasibility confirmation

## Step 2C-4 Verification

Commands:

```bash
npm test
npm run build
```

Results:

- `npm test`: passed, 178 tests passed.
- `npm run build`: passed.

## Recommended Step 2D

After Step 2C-4 review, consider a small admin UI navigation and state consolidation pass before adding any write workflows.

## Step 2D Purpose

Step 2D is a narrow consolidation pass for the Admin UI foundation read-only integrations.

It does not add a new module, connect a new API, or introduce any write workflow.

## Step 2D Changed Files

- `admin/ui-foundation/app.js`
- `docs/CODEX_STATUS.md`

## Step 2D Consolidation Summary

The duplicated read-only API loading pattern was consolidated for:

- Companies
- Products
- Manufacturing Capabilities
- AI Inquiry Analysis Drafts

Behavior preserved:

- existing API endpoint URLs are unchanged
- loading / empty / error states remain
- Preview fallback / local preview data remains clearly marked
- Companies, Products, Manufacturing Capabilities and AI Drafts remain read-only
- AI Drafts continue to force `approval_required: true`
- AI Drafts remain Draft only / Not sent

## Step 2D Boundaries

Confirmed not implemented:

- no new API routes
- no new API connections
- no API writes from Admin UI foundation
- no create, update or delete actions
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
- no price, delivery time, payment term, bank account or production feasibility confirmation

## Step 2D Verification

Commands:

```bash
npm test
npm run build
```

Results:

- `npm test`: passed, 178 tests passed.
- `npm run build`: passed.

## Recommended Next Step

After Step 2D review, create a clean Step 2D commit before planning any Step 2E work.

## Step 2E Purpose

Step 2E is a small read-only Admin UI business usability polish pass.

It improves clarity for internal trial users without adding new APIs, write workflows or business automation.

## Step 2E Changed Files

- `admin/ui-foundation/index.html`
- `admin/ui-foundation/app.js`
- `admin/ui-foundation/styles.css`
- `docs/CODEX_STATUS.md`

## Step 2E Polish Summary

Completed polish:

- fixed raw HTML badge display in Manufacturing Capabilities and AI Drafts tables
- marked top actions as not connected / coming later / mock only
- kept top actions disabled and unwired
- standardized fallback wording as `Preview fallback / local preview data - not live Supabase data`
- replaced business-facing API errors with a friendlier unavailable-data explanation
- kept technical API error details secondary in the status message
- strengthened AI Drafts safety wording with Draft only, Approval Required, Not sent and Human review required
- improved empty state wording to clarify no live data exists, the page is read-only, and write/create support comes later

## Step 2E Boundaries

Confirmed not implemented:

- no new modules
- no new API connections
- no API route changes
- no API writes from Admin UI foundation
- no create, update or delete actions
- no approve, reject or send actions
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
- no price, delivery time, payment term, bank account or production feasibility confirmation

## Step 2E Verification

Commands:

```bash
npm test
npm run build
```

Results:

- `npm test`: passed, 178 tests passed.
- `npm run build`: passed.

Browser review:

- Companies, Products, Manufacturing Capabilities and AI Drafts still load as read-only sections.
- Manufacturing Capabilities and AI Drafts no longer show raw HTML badge text.
- Top action buttons are disabled and labeled as not connected / coming later / mock only.
- Fallback data is labeled as `Preview fallback / local preview data - not live Supabase data`.
- AI Drafts visibly show Draft only, Approval Required, Not sent and Human review required.
- No console errors were observed during local browser verification.

## Step 2E Trial Recommendation

Ready for limited internal read-only trial.

## Step 2F Purpose

Step 2F creates a practical limited internal read-only trial checklist and real Supabase/API verification plan.

This is documentation only. It does not start Step 3 and does not add any write workflow.

## Step 2F Changed Files

- `docs/READ_ONLY_INTERNAL_TRIAL_CHECKLIST.md`
- `docs/CODEX_STATUS.md`

## Step 2F Checklist Summary

Created a dedicated internal trial checklist covering:

- environment readiness
- local and deployed preview expectations
- Supabase/admin access requirements
- expected read-only API routes
- minimal safe test data for Companies, Products, Manufacturing Capabilities and AI Inquiry Analysis Drafts
- read-only verification cases
- permission and auth verification
- AI Drafts safety verification
- limited internal read-only trial acceptance criteria
- issue logging template
- next-step decision framework

## Step 2F Boundaries

Confirmed not implemented:

- no code changes
- no new modules
- no new API connections
- no API route changes
- no API writes from Admin UI foundation
- no create, update or delete actions
- no approve, reject or send actions
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

## Recommended Next Step

Run the limited internal read-only trial using `docs/READ_ONLY_INTERNAL_TRIAL_CHECKLIST.md`.

After the trial, choose:

- Step 2G for small read-only polish fixes
- Step 3A for a broader customer CRM read-only foundation
- Step 3B for the first low-risk manual write flow
- or hold development until real data is cleaner
