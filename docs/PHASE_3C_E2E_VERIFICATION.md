# CBM Trade OS Phase 3C: Real Supabase E2E Verification

Phase 3C verifies the real public website inquiry, Supabase, Vercel deployment, admin login and admin read flow.

## Scope

Real pilot scope:

- public inquiry submission
- Supabase tables: `leads`, `customers`, `inquiries`, `follow_up_tasks`, `attachments`
- Supabase Auth admin login
- admin inquiry/customer/follow-up read APIs
- `/admin/system-check`

Still mock:

- projects
- quotations
- orders
- shipments
- after-sales
- document center
- product library
- OpenAI
- Gmail / WhatsApp / Alibaba real integrations
- complex role-based permissions

## 1. Run Supabase Migrations

Run the SQL files in order:

1. `supabase/migrations/202606100001_phase_3a_crm_pilot.sql`
2. `supabase/migrations/202606100002_phase_3b_public_gateway_auth.sql`

Confirm these tables exist:

- `leads`
- `customers`
- `inquiries`
- `follow_up_tasks`
- `attachments`

Confirm RLS is enabled on all five tables.

## 2. Create Supabase Auth Admin User

In Supabase:

1. Open Authentication.
2. Create an admin user with email/password.
3. Keep this user private.

Phase 3C uses simple authenticated admin access only. TODO before production team use: add full role-based permissions.

## 3. Set Vercel Environment Variables

Set production variables:

```text
NEXT_PUBLIC_DATA_MODE=supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SECRET_KEY=server_only_secret_key
```

Alternative server secret variable:

```text
SUPABASE_SERVICE_ROLE_KEY=server_only_service_role_key
```

Never expose `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` in browser code, HTML, screenshots, public logs, or GitHub.

## 4. Redeploy Production

Redeploy the Vercel production project after setting environment variables.

After deployment, check:

```bash
curl -L https://project-7vo99.vercel.app/api/health
```

Expected safe response:

```json
{
  "ok": true,
  "service": "CBM Trade OS",
  "mode": "supabase"
}
```

No secrets should appear.

## 5. Submit Public Inquiry

Open:

```text
https://project-7vo99.vercel.app/trade-website
```

Submit the inquiry form with:

- name
- company
- valid email
- business line
- country
- project type
- drawing status
- quotation basis
- project details
- optional attachment names

Expected:

- website shows safe success message
- no login required
- no internal IDs returned to the browser
- no official quotation, PI, price, delivery time or payment terms confirmed

In Supabase, confirm records were created:

- one lead
- one inquiry
- one follow-up task
- attachment metadata if file names were submitted

## 6. Log In As Admin

Open:

```text
https://project-7vo99.vercel.app/admin/login
```

Sign in with the Supabase Auth admin user.

Expected:

- login succeeds
- browser stores a Supabase auth session
- no service key is stored in browser

## 7. Open Trade OS Admin

Open:

```text
https://project-7vo99.vercel.app/trade-os-prototype
```

Expected:

- unauthenticated user redirects to `/admin/login`
- authenticated admin can open the admin UI
- inquiry/customer/follow-up pilot data can be read from API in Supabase mode

## 8. Open System Check

Open:

```text
https://project-7vo99.vercel.app/admin/system-check
```

Expected:

- protected behind admin auth
- shows current mode: `supabase`
- Supabase URL configured: yes
- publishable key configured: yes
- server secret key configured: yes/not shown
- admin user email visible
- can read inquiries: yes
- can read customers: yes
- can read follow-ups: yes
- no secret values displayed

## 9. Admin API 401 Check

Without login or without Bearer token:

```bash
curl -i https://project-7vo99.vercel.app/api/inquiries
curl -i https://project-7vo99.vercel.app/api/customers
curl -i https://project-7vo99.vercel.app/api/follow-ups
curl -i https://project-7vo99.vercel.app/api/admin-health
```

Expected:

```text
401
```

## 10. Public API Validation Check

Try a bad public submission:

```bash
curl -i -X POST https://project-7vo99.vercel.app/api/public-inquiries \
  -H "Content-Type: application/json" \
  -d '{"website":"bot","email":"bad"}'
```

Expected:

```text
400
```

The response must not expose internal database errors or secrets.

## Safety Boundaries

The verified flow must not:

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
