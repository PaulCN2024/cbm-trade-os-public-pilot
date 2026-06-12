-- CBM Trade OS Phase 3F: Pilot Data Usability & Lead Review Workflow
-- Scope: add test-data marking to the existing front CRM pilot tables only.
-- Non-scope: projects, quotations, orders, shipments, after-sales.

alter table public.leads
  add column if not exists is_test boolean not null default false;

alter table public.customers
  add column if not exists is_test boolean not null default false;

alter table public.inquiries
  add column if not exists is_test boolean not null default false;

alter table public.follow_up_tasks
  add column if not exists is_test boolean not null default false;

alter table public.attachments
  add column if not exists is_test boolean not null default false;

create index if not exists idx_leads_is_test on public.leads(is_test);
create index if not exists idx_customers_is_test on public.customers(is_test);
create index if not exists idx_inquiries_is_test on public.inquiries(is_test);
create index if not exists idx_follow_up_tasks_is_test on public.follow_up_tasks(is_test);
create index if not exists idx_attachments_is_test on public.attachments(is_test);
