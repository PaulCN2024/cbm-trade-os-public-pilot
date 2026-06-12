# CBM Trade OS Supabase Migration Plan

Phase: 2F planning only.

Do not implement Supabase yet. This document maps current mock localStorage objects to future Supabase tables.

## Migration Principles

- Keep the current mock object names close to future table names.
- Use UUID primary keys.
- Use explicit foreign keys for every relationship.
- Use enum-like text fields first, then migrate to PostgreSQL enums after the model stabilizes.
- Keep high-risk business actions manual-review only.
- Do not store bank-account confirmations, official PI sends, official quotation sends, or customer messages without explicit human action logs.

## Table Mapping

| Mock object | Future Supabase table | Primary key | Notes |
|---|---|---:|---|
| `leads` | `leads` | `id uuid` | Acquisition records from website, Alibaba, Gmail, WhatsApp, manual, social, SEO, ads, trade shows. |
| `customers` | `customers` | `id uuid` | Customer 360 root entity. |
| `inquiries` | `inquiries` | `id uuid` | Buyer requirement, score, missing info, summary, next action. |
| `architectural_requirements` | `architectural_requirements` | `id uuid` | Business-line-specific fields for architectural aluminum projects. |
| `precision_requirements` | `precision_requirements` | `id uuid` | Business-line-specific fields for precision aluminum manufacturing. |
| `projects` | `projects` | `id uuid` | Project stage and relationship map. |
| `quotations` | `quotations` | `id uuid` | Internal quotation drafts only. |
| `orders` | `orders` | `id uuid` | Mock order draft, PI/payment/production tracking. |
| `shipments` | `shipments` | `id uuid` | Booking, shipment and document status. |
| `after_sales_cases` | `after_sales_cases` | `id uuid` | Feedback, quality issues, replacement/compensation placeholders, repeat opportunities. |
| `follow_up_tasks` | `follow_up_tasks` | `id uuid` | Includes repeat business tasks via `type = REPEAT_BUSINESS`. |
| `communication_logs` | `communication_logs` | `id uuid` | Read-only history from Gmail, WhatsApp, Alibaba, website and internal notes. |
| `attachments` | `attachments` | `id uuid` | File metadata; binary files should go to Supabase Storage or another object store. |
| `document_drafts` | `document_drafts` | `id uuid` | Placeholder docs linked to order/shipment. |
| `documents` | `documents` | `id uuid` | Document Center records: quotation, PI, production order, cutting list, packing list. |
| `products` | `products` | `id uuid` | Product Library master data. |
| `sellers` | `sellers` | `id uuid` | Seller and bank configuration. Protect with permissions. |

## Foreign Key Plan

```text
leads.customer_id -> customers.id
inquiries.lead_id -> leads.id
inquiries.customer_id -> customers.id
inquiries.project_id -> projects.id
inquiries.quotation_id -> quotations.id

projects.inquiry_id -> inquiries.id
projects.customer_id -> customers.id

quotations.inquiry_id -> inquiries.id
quotations.project_id -> projects.id
quotations.customer_id -> customers.id

orders.quotation_id -> quotations.id
orders.inquiry_id -> inquiries.id
orders.project_id -> projects.id
orders.customer_id -> customers.id

shipments.order_id -> orders.id
shipments.project_id -> projects.id
shipments.customer_id -> customers.id

after_sales_cases.shipment_id -> shipments.id
after_sales_cases.order_id -> orders.id
after_sales_cases.project_id -> projects.id
after_sales_cases.customer_id -> customers.id

follow_up_tasks.customer_id -> customers.id
follow_up_tasks.inquiry_id -> inquiries.id
follow_up_tasks.project_id -> projects.id
follow_up_tasks.quotation_id -> quotations.id
follow_up_tasks.order_id -> orders.id
follow_up_tasks.shipment_id -> shipments.id
follow_up_tasks.after_sales_case_id -> after_sales_cases.id
```

## Suggested Columns By Table

### `customers`

- `id uuid primary key`
- `name text not null`
- `contact_name text`
- `email text`
- `whatsapp text`
- `country text`
- `folder_alias text`
- `status text`
- `importance text`
- `summary text`
- `created_at timestamptz`
- `updated_at timestamptz`

### `inquiries`

- `id uuid primary key`
- `source text`
- `business_line text`
- `status text`
- `title text`
- `lead_id uuid`
- `customer_id uuid`
- `project_id uuid`
- `quotation_id uuid`
- `lead_info jsonb`
- `project_type text`
- `destination_port text`
- `ai_summary text`
- `missing_info text[]`
- `score integer`
- `recommended_next_action text`
- `created_at timestamptz`
- `updated_at timestamptz`

### `quotations`

- `id uuid primary key`
- `quote_no text unique`
- `inquiry_id uuid`
- `project_id uuid`
- `customer_id uuid`
- `business_line text`
- `status text`
- `currency text`
- `incoterm text`
- `destination_port text`
- `items jsonb`
- `missing_price_fields text[]`
- `manual_review_required boolean default true`
- `created_at timestamptz`
- `updated_at timestamptz`

### `orders`

- `id uuid primary key`
- `order_no text unique`
- `quotation_id uuid`
- `inquiry_id uuid`
- `project_id uuid`
- `customer_id uuid`
- `status text`
- `payment_status text`
- `production_status text`
- `destination_port text`
- `incoterm text`
- `currency text`
- `items jsonb`
- `risk_flags text[]`
- `manual_review_required boolean default true`
- `created_at timestamptz`
- `updated_at timestamptz`

### `follow_up_tasks`

- `id uuid primary key`
- `type text`
- `status text`
- `title text`
- `customer_id uuid`
- `inquiry_id uuid`
- `project_id uuid`
- `quotation_id uuid`
- `order_id uuid`
- `shipment_id uuid`
- `after_sales_case_id uuid`
- `due_date date`
- `priority text`
- `created_at timestamptz`
- `updated_at timestamptz`

## Storage Plan

Use object storage for uploaded files:

```text
customer-assets/{customer_id}/inquiries/{inquiry_id}/...
customer-assets/{customer_id}/projects/{project_id}/...
customer-assets/{customer_id}/orders/{order_id}/...
customer-assets/{customer_id}/shipments/{shipment_id}/...
customer-assets/{customer_id}/after-sales/{after_sales_case_id}/...
```

Store metadata in `attachments`, not raw files in relational tables.

## Phase 3A And 3B Pilot Status

Phase 3A starts a limited Supabase pilot for:

- `leads`
- `customers`
- `inquiries`
- `follow_up_tasks`
- `attachments` metadata

Phase 3B adds:

- public website inquiry gateway: `POST /api/public-inquiries`
- server-side Supabase insert using `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`
- basic Supabase Auth login at `/admin/login`
- authenticated admin API reads for `/api/inquiries`, `/api/customers`, `/api/follow-ups`

Still mock/localStorage in Phase 3B:

- projects
- quotations
- orders
- shipments
- after-sales
- document center
- product library
- AI assistant output
- Gmail / WhatsApp / Alibaba real integrations

## Security And RLS Notes

Future RLS must protect:

- seller bank information
- customer contact data
- quotation and PI drafts
- order/payment status
- shipment documents
- WhatsApp/Gmail communication logs

Recommended early roles:

- `owner`
- `sales_manager`
- `sales_user`
- `operations_user`
- `readonly_reviewer`

Phase 3B pilot RLS expectation:

- Public visitors never access CRM tables directly.
- Public visitors submit through `POST /api/public-inquiries`.
- Server API inserts public inquiry records with a server-only key.
- Admin APIs require an authenticated Supabase user and return `401` without a Bearer token.
- Current Phase 3B policies are intentionally broad for authenticated users only.
- TODO before production team use: replace broad authenticated policies with full role-based permissions.

## Migration Steps Later

1. Freeze mock data model.
2. Create Supabase project.
3. Create tables and indexes.
4. Add RLS policies.
5. Add storage buckets.
6. Create import script from mock JSON export.
7. Replace localStorage service with Supabase service behind the same business functions.
8. Keep UI components calling service functions, not direct Supabase queries.

## Explicit Non-Goals For Phase 3B

- No OpenAI API implementation.
- No Gmail or WhatsApp integration.
- No complex role-based permissions.
- No migration of projects, quotations, orders, shipments or after-sales to Supabase.
- No real customer messages.
- No official automatic quotation or PI.
- No automatic price, delivery time, payment terms, bank account, compensation, or responsibility judgment.
