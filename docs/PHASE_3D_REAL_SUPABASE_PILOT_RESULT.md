# Phase 3D Real Supabase Pilot Result

Date: 2026-06-11
Last updated: 2026-06-11 15:20 CST

## Execution Status

Phase 3D real Supabase pilot is verified end to end for the pilot scope.

Verified:

- Supabase migrations executed successfully.
- Pilot tables exist.
- RLS is enabled.
- Authenticated-user pilot policies exist.
- Required indexes exist.
- Vercel Production environment variables are configured.
- Production deployment completed and the production alias is updated.
- `/api/health` returns `mode: "supabase"`.
- Unauthenticated `/api/admin-health` returns `401`.
- Public inquiry gateway writes real Supabase pilot records.
- Supabase Auth admin user exists.
- Admin login works with Supabase Auth.
- Authenticated admin APIs can read pilot data.
- `/trade-os-prototype` is deployed with `NEXT_PUBLIC_DATA_MODE=supabase`.

## Environment Status

Vercel project:

- Project name: `project-7vo99`
- Production alias: `https://project-7vo99.vercel.app`
- Latest production deployment: `https://project-7vo99-o7wk60waw-paul-s-projects2026.vercel.app`
- Deployment id: `dpl_4C2gP6ftMzjRVuuckKJ5BwJYfqVG`
- Local Vercel link: configured

Supabase project:

- Project ref: `zswtekjtkyvfagbudkia`
- Supabase URL: `https://zswtekjtkyvfagbudkia.supabase.co`

Vercel Production environment variables:

- `NEXT_PUBLIC_DATA_MODE`: configured as `supabase`
- `NEXT_PUBLIC_SUPABASE_URL`: configured
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: configured
- `SUPABASE_SECRET_KEY`: configured as encrypted server-only variable

Secrets were not committed to code. The server secret key remains server-only.

## Migration Status

Migration files:

- `supabase/migrations/202606100001_phase_3a_crm_pilot.sql`
- `supabase/migrations/202606100002_phase_3b_public_gateway_auth.sql`

Execution result:

- Supabase SQL Editor returned success.

Verified tables and RLS:

```text
attachments      rowsecurity=true
customers        rowsecurity=true
follow_up_tasks  rowsecurity=true
inquiries        rowsecurity=true
leads            rowsecurity=true
```

Verified policies:

```text
attachments      authenticated users can read attachments      SELECT
attachments      authenticated users can write attachments     ALL
customers        authenticated users can read customers        SELECT
customers        authenticated users can write customers       ALL
follow_up_tasks  authenticated users can read follow_up_tasks  SELECT
follow_up_tasks  authenticated users can write follow_up_tasks ALL
inquiries        authenticated users can read inquiries        SELECT
inquiries        authenticated users can write inquiries       ALL
leads            authenticated users can read leads            SELECT
leads            authenticated users can write leads           ALL
```

Verified indexes:

- 30 rows returned from `pg_indexes` for the five pilot tables.
- Covered primary keys and required pilot indexes including `customer_id`, `inquiry_id`, `business_line`, `status`, `source`, `created_at`, and `next_follow_up_at` where applicable.

## Build And Deployment

Local build:

```text
npm run build
Result: passed
```

Deployment fixes completed:

- Root `vercel.json` uses `"outputDirectory": "."` so the static/API project deploys correctly.
- `/admin/login`, `/admin/system-check`, and `/admin/dev-test` now use absolute asset paths so no-trailing-slash admin routes load CSS and JS correctly.
- `/admin/login` now prevents default browser form submission when JavaScript is unavailable, so passwords are not placed in the URL query string.

Production deployment:

```text
Status: READY
Alias: https://project-7vo99.vercel.app
Deployment: https://project-7vo99-o7wk60waw-paul-s-projects2026.vercel.app
Deployment id: dpl_4C2gP6ftMzjRVuuckKJ5BwJYfqVG
```

## Public Health Verification

Request:

```bash
curl -sS -i https://project-7vo99.vercel.app/api/health
```

Result:

```text
HTTP 200
{"ok":true,"service":"CBM Trade OS","mode":"supabase"}
```

## Admin Protection Verification

Request:

```bash
curl -sS -i https://project-7vo99.vercel.app/api/admin-health
```

Result:

```text
HTTP 401
{"error":"Supabase admin API requires an authenticated Bearer token.","safety_boundary":"No automatic customer messages, official quotations, PI, prices, delivery time, payment terms or bank account confirmation."}
```

## Public Inquiry Verification

Request:

```bash
curl -sS -i -X POST https://project-7vo99.vercel.app/api/public-inquiries \
  -H 'Content-Type: application/json' \
  -H 'User-Agent: CBM-Phase3D-Test/1.0' \
  --data-binary @phase3d-public-inquiry.json
```

Result:

```text
HTTP 201
{"ok":true,"message":"Inquiry received for manual review.","safety_boundary":"Manual review required. No automatic customer message, official quotation, PI, price, delivery time, payment terms, bank account, compensation or responsibility judgment."}
```

Supabase record verification for `phase3d-test@example.com`:

```text
leads            1
inquiries        1
follow_up_tasks  1
attachments      1
```

## Admin Auth Verification

Admin user:

- Email: `paul.chen.china@gmail.com`
- Temporary password: generated during setup and must be reset by the owner. Do not record temporary passwords in docs, logs or README files.
- Supabase identity rows: `1`

Authenticated API checks:

```text
login_status=200
login_user=paul.chen.china@gmail.com
/api/health={"status":200,"ok":true,"mode":"supabase"}
/api/admin-health={"status":200,"authenticated":true,"email":"paul.chen.china@gmail.com","counts":{"leads":1,"customers":0,"inquiries":1,"follow_up_tasks":1},"connected":true}
/api/inquiries={"inquiries":1,"leads":1,"attachments":1}
/api/customers={"customers":0}
/api/follow-ups={"follow_up_tasks":1}
```

System check route:

- `/admin/login` loads fixed CSS/JS from absolute paths.
- `/admin/login` redirects authenticated admin users to `/admin/system-check`.
- `/admin/system-check` is protected by admin auth and now loads fixed CSS/JS from absolute paths.

## Trade OS Verification

Request:

```bash
curl -L -s https://project-7vo99.vercel.app/trade-os-prototype?phase3d=1
```

Confirmed public HTML includes:

```text
window.__CBM_ENV__={"NEXT_PUBLIC_DATA_MODE":"supabase", ...}
```

This confirms the deployed Trade OS route is running in Supabase pilot mode.

## Remaining Risks

- RLS policies are broad authenticated-user pilot policies, not production role-based permissions.
- The temporary admin password should be rotated by the owner.
- Browser history may contain one earlier failed login URL from before the form fix; clear local browser history if needed.
- No durable public API rate limiting yet.
- File handling is attachment metadata only; no Supabase Storage upload flow yet.
- Projects, quotations, orders, shipments and after-sales remain mock.
- Admin user lifecycle still needs a production policy: who creates users, how passwords are rotated, and when MFA/roles are added.

## Safety Boundaries

The system must not:

- automatically send customer messages
- automatically send official quotation
- automatically send PI
- confirm price
- confirm delivery time
- confirm payment terms
- confirm bank account
- promise compensation
- judge responsibility automatically

All high-risk commercial actions require manual review.

## Next Recommended Phase

Phase 3E: Admin Pilot Usability Fixes for the verified Supabase pilot objects only.

Recommended focus:

- Better inquiry list display from Supabase data.
- Clear customer conversion behavior for pilot mode.
- Better follow-up task visibility.
- Better admin login/session UX.
- Password rotation and basic admin lifecycle checklist.
- Keep projects, quotations, orders, shipments and after-sales in mock mode until the front CRM pilot is stable.
