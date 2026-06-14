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

Step 2A has not started yet.

Next planned scope:

- API-only foundation for:
  - `companies`
  - `products`
  - `manufacturing_capabilities`
  - `ai_inquiry_analyses`

Step 2A should not add UI pages unless explicitly approved.

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

## Recommended Next Step

After confirming this cleaned baseline, proceed to Phase 2A API-only foundation.

Recommended Phase 2A order:

1. Add business-line validation helper for API input.
2. Add `api/companies.js`.
3. Add `api/products.js`.
4. Add `api/manufacturing-capabilities.js`.
5. Add `api/ai-inquiry-analyses.js` with draft-only `approval_required = true`.
6. Add tests for API validation, draft-only analysis saving, and no automatic sending behavior.
