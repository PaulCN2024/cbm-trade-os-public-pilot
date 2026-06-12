# CBM Trade OS Phase 3B: Public Inquiry Gateway + Basic Admin Auth

Phase 3B makes the public inquiry path safer while keeping the system small. It does not add OpenAI, Gmail, WhatsApp, complex permissions, or downstream Supabase migration.

## Public Inquiry Submission Path

```text
Public website visitor
-> trade-website inquiry form
-> POST /api/public-inquiries
-> server-side validation
-> server-side Supabase insert
-> lead + inquiry + follow_up_task + attachment metadata
-> safe success response
```

The public endpoint returns only a safe success message. It does not return internal CRM records, lead IDs, inquiry IDs, customer data, scores, summaries, tasks, or attachment table rows.

## Public API Security

`POST /api/public-inquiries` includes lightweight protections:

- POST only
- honeypot field: `website`
- required fields validation
- email format validation
- maximum message length: 5000 characters
- maximum attachment metadata count: 10
- records created timestamp through database defaults and payload metadata
- stores optional `source_ip` and `user_agent` in inquiry metadata
- TODO: add durable IP/email rate limiting before production

Attachment handling is metadata-only in this phase. Files are not uploaded to Supabase Storage yet.

## Supabase Server-Side Insert

The public route uses a server-only key:

- `SUPABASE_SECRET_KEY`, or
- `SUPABASE_SERVICE_ROLE_KEY`

This key must only exist in server environment variables. It must never be placed in browser JavaScript, public HTML, GitHub, screenshots, docs with real values, or client-side localStorage.

## Admin Login Path

```text
Admin user
-> /admin/login
-> Supabase Auth email/password
-> session stored in browser localStorage
-> admin API calls include Bearer token
-> /api/inquiries, /api/customers, /api/follow-ups return CRM pilot data
```

Protected admin surfaces in Supabase mode:

- `/trade-os-prototype`
- `/admin/dev-test`
- inquiry list API
- customer list API
- follow-up list API
- mock data export surfaces reachable from admin UI

Mock mode remains open for local demo work.

## RLS Expectations

RLS is enabled on:

- `leads`
- `customers`
- `inquiries`
- `follow_up_tasks`
- `attachments`

Phase 3B uses simple authenticated-user policies. This means public visitors cannot read CRM data directly, and admin APIs return `401` without an authenticated Bearer token.

TODO before production team use: replace broad authenticated access with full role-based permissions such as owner, sales manager, sales user, operations user and readonly reviewer.

## Environment Variables

```text
NEXT_PUBLIC_DATA_MODE=mock | supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SECRET_KEY=server_only_secret_key
SUPABASE_SERVICE_ROLE_KEY=server_only_service_role_key_alternative
```

Use either `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` for server-side public inquiry insertion.

## What Remains Mock

- projects
- quotations
- orders
- shipments
- after-sales
- document center
- product library
- Gmail learning
- WhatsApp learning
- Alibaba real account/API connection
- AI assistant and OpenAI API

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

All official quotations, PI, prices, delivery time, payment terms, bank account information, compensation decisions and responsibility judgments require manual review.
