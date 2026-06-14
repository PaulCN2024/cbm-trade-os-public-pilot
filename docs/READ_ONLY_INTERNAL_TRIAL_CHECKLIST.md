# CBM Trade OS Read-only Internal Trial Checklist

## Purpose

Step 2F verifies whether the current Admin UI foundation is ready for a limited internal read-only trial before any write features are added.

This checklist covers only:

- Companies
- Products
- Manufacturing Capabilities
- AI Inquiry Analysis Drafts

This trial must not create, update, delete, send, approve, reject, quote, issue PI, place orders, arrange shipment, or make business commitments.

## Environment Readiness

Use this section before testing.

| Item | Expected |
| --- | --- |
| Local preview URL | `/admin/ui-foundation/index.html` |
| Deployed preview URL | To be filled with the current deployed preview URL when available |
| Data source | Existing Step 2A API routes |
| Supabase environment | Pilot Supabase project with read policies and admin access configured |
| Admin access | Logged-in admin session or valid admin token required for live API data |
| Browser checks | Open browser console, network panel, and responsive preview if needed |

Expected API routes:

- `GET /api/companies`
- `GET /api/products`
- `GET /api/manufacturing-capabilities`
- `GET /api/ai-inquiry-analyses`

Required browser checks:

- page loads without console errors
- API requests return expected status
- fallback state is clearly labeled when live data is unavailable
- no active write buttons are available
- table layout remains readable on desktop and narrow screens

## Test Data Requirements

### Companies

Prepare safe non-confidential test records:

- at least 2 normal companies
- 1 company with missing optional fields
- 1 company from a different country or source if possible

Recommended visible fields to verify:

- company name
- country
- business type
- notes
- source / fallback indicator

### Products

Prepare:

- 1 `A_ARCHITECTURAL` product
- 1 `B_INDUSTRIAL` product
- 1 `UNKNOWN` product
- 1 product with missing material or surface if possible

Recommended visible fields to verify:

- product name
- business line
- category
- product family
- material
- surface
- notes

### Manufacturing Capabilities

Prepare:

- 1 architectural-related capability if applicable
- 1 industrial / CNC capability
- 1 record with missing `monthly_capacity` or `max_length` if possible

Recommended visible fields to verify:

- capability line
- equipment
- quantity
- max length
- monthly capacity
- public description
- admin notes

### AI Inquiry Analysis Drafts

Prepare:

- 1 `A_ARCHITECTURAL` draft
- 1 `B_INDUSTRIAL` draft
- 1 `UNKNOWN` draft
- 1 draft with `missing_information`
- 1 draft with `risk_flags`

Required safety state:

- every draft must show `approval_required = true`
- every draft must remain Draft only
- every draft must remain Not sent
- every draft must show Human review required
- suggested reply must remain draft text only

## Read-only Verification Cases

Run these checks for each connected section.

| Case | Expected |
| --- | --- |
| Live data loads | Admin can view live records when API access is available |
| Loading state | Loading state appears briefly and does not break layout |
| Empty state | Empty state explains no live data exists, page is read-only, and write/create support comes later |
| Error state | API failure or missing token shows friendly message |
| Fallback state | Preview fallback / local preview data - not live Supabase data is clearly visible |
| Table readability | Columns are readable and do not look like raw database dumps |
| Mobile/narrow width | No horizontal page overflow beyond table scroll area |
| Console errors | No console errors during navigation |
| Write controls | No create, update, delete, approve, reject, send, quote, PI, order or shipment action is active |
| Business commitments | UI does not confirm price, delivery time, payment terms, bank account, production feasibility, compensation or responsibility |

## Permission And Auth Verification

Verify:

- logged-in admin can read live data
- missing token shows a friendly error
- unavailable API shows fallback data only when clearly labeled
- unauthenticated users cannot mistake fallback data for live Supabase data
- no write operation is available from the UI
- no service role key or secret is exposed in browser UI, source text, network response, or console logs

## AI Drafts Safety Verification

Every AI draft row and review panel must show:

- Draft only
- Approval Required
- Not sent
- Human review required
- Suggested reply is draft text only

Confirm there are no actions for:

- send
- approve
- reject
- quote
- PI
- order
- shipment
- payment terms
- delivery confirmation
- production feasibility confirmation
- bank account confirmation
- compensation promise
- responsibility judgment

## Trial Acceptance Criteria

The limited internal read-only trial can be accepted when:

- all four connected sections load live data under admin login
- fallback is clearly marked when live data is unavailable
- no active write controls exist
- AI Drafts safety labels are visible
- suggested replies remain draft-only and not sent
- tests pass
- build passes
- no console errors appear during normal navigation
- business users can understand the read-only status without developer explanation

## Issue Log Template

Use this template for every trial issue.

```text
Section:
Environment:
Issue type:
Screenshot/reference:
Severity: Low / Medium / High / Blocking
Expected behavior:
Actual behavior:
Suggested fix:
Decision:
Owner:
Date:
```

Suggested issue types:

- data loading
- permission / auth
- empty state
- error state
- fallback clarity
- table layout
- field naming
- safety wording
- read-only boundary
- browser console

## Next-step Decision Framework

After the trial, choose one path:

### Option A: Step 2G - Small Read-only Polish Fixes

Choose this if the UI is mostly usable but has minor wording, field naming, layout or fallback clarity issues.

### Option B: Step 3A - Customer CRM Read-only Foundation

Choose this if read-only behavior is stable and the next priority is to expand a customer-facing CRM overview without write actions.

### Option C: Step 3B - First Low-risk Manual Write Flow

Choose this only if read-only trials are stable and the team agrees on a narrow write action such as manually creating a safe draft record.

Any write flow must remain manual and must not send messages, official quotations, PI, orders, shipment instructions or business commitments.

### Option D: Hold Development Until Real Data Is Cleaner

Choose this if the main blockers are incomplete test data, unclear business fields, permission setup problems, or data quality issues.

## Not Implemented In This Trial

This trial intentionally does not implement:

- create / update / delete
- approve / reject / send
- quotation workflow
- quotation items
- orders
- production
- shipping
- OpenAI integration
- email sending
- WhatsApp sending
- PI generation
- formal quotation sending
- automatic customer messages
- automatic business commitments

All high-risk commercial actions require manual review in future phases.
