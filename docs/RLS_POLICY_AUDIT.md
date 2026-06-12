# CBM Trade OS RLS Policy Audit

Pilot tables:

- `leads`
- `customers`
- `inquiries`
- `follow_up_tasks`
- `attachments`

RLS is enabled by the Phase 3A migration. Phase 3B uses simple authenticated-user policies for pilot admin access. Public visitors do not access these tables directly.

## `leads`

- RLS enabled: yes.
- Public insert path: public visitors submit to `POST /api/public-inquiries`; the server validates input and inserts/updates `leads` with a server-only key.
- Admin select path: authenticated admin request to `/api/inquiries` or `/api/admin-health`.
- Update policy expectation: authenticated pilot admins can update during pilot; production must restrict by role and ownership.
- Service key used server-side: yes, only in `api/public-inquiries.js`.
- Must never be exposed to browser: service role key, internal lead IDs in public responses, owner IDs, raw scoring logic as authority, customer contact lists.

## `customers`

- RLS enabled: yes.
- Public insert path: no direct public customer creation in Phase 3C public gateway. Public inquiry creates/updates lead and inquiry first; customer conversion remains admin/manual.
- Admin select path: authenticated admin request to `/api/customers` or `/api/admin-health`.
- Update policy expectation: authenticated pilot admins can update during pilot; production must restrict by role and ownership.
- Service key used server-side: not for public customer creation in Phase 3C.
- Must never be exposed to browser: service role key, complete customer list without login, private contact data, bank or payment details.

## `inquiries`

- RLS enabled: yes.
- Public insert path: public visitors submit to `POST /api/public-inquiries`; the server validates input and inserts `inquiries` with a server-only key.
- Admin select path: authenticated admin request to `/api/inquiries` or `/api/admin-health`.
- Update policy expectation: authenticated pilot admins can update during pilot; production must restrict by role and ownership.
- Service key used server-side: yes, only in `api/public-inquiries.js`.
- Must never be exposed to browser: service role key, internal CRM summaries in public responses, internal missing-info scoring as a customer-facing commitment.

## `follow_up_tasks`

- RLS enabled: yes.
- Public insert path: public inquiry creates an internal follow-up task through server-side API only.
- Admin select path: authenticated admin request to `/api/follow-ups` or `/api/admin-health`.
- Update policy expectation: authenticated pilot admins can update during pilot; production must restrict by role and ownership.
- Service key used server-side: yes, only to create the initial task after public inquiry validation.
- Must never be exposed to browser: service role key, internal task queues without login, private responsibility assignment.

## `attachments`

- RLS enabled: yes.
- Public insert path: public inquiry saves attachment metadata only through server-side API.
- Admin select path: authenticated admin request to `/api/inquiries` where attachment metadata may be returned to logged-in admins.
- Update policy expectation: authenticated pilot admins can update during pilot; production must restrict by role and ownership.
- Service key used server-side: yes, only for metadata inserts in `api/public-inquiries.js`.
- Must never be exposed to browser: service role key, private file storage paths without login, signed upload/download tokens, raw customer documents.

## Browser Exposure Audit

Allowed in browser:

- `NEXT_PUBLIC_DATA_MODE`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- authenticated user access token after admin login

Never allowed in browser:

- `SUPABASE_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- database password
- seller bank account details
- unrestricted customer exports
- private document storage tokens

## Production TODO

Before production team use:

- add full role-based permissions
- add durable rate limiting for public inquiry submission
- add audit logs for admin reads and writes
- add storage bucket RLS for real file uploads
- add admin session refresh/sign-out hardening
- review all public API responses for internal data leakage
