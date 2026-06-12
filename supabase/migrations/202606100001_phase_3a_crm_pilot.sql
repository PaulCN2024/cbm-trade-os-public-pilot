-- CBM Trade OS Phase 3A: Supabase Pilot / Real Data Layer Trial
-- Scope: leads, customers, inquiries, follow_up_tasks, attachments metadata.
-- Non-scope: projects, quotations, orders, shipments, after-sales.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid default auth.uid(),
  name text not null,
  contact_name text,
  email text,
  whatsapp text,
  country text,
  type text,
  status text not null default 'active',
  importance text,
  aliases text,
  summary text,
  source text,
  business_line text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid default auth.uid(),
  customer_id uuid references public.customers(id) on delete set null,
  source text not null default 'manual',
  status text not null default 'NEW',
  business_line text,
  title text,
  name text,
  company text,
  email text,
  whatsapp text,
  country text,
  score integer not null default 0,
  summary text,
  missing_info jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid default auth.uid(),
  lead_id uuid references public.leads(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  source text not null default 'website',
  status text not null default 'NEW',
  business_line text not null,
  title text not null,
  project_type text,
  drawing_status text,
  quote_method text,
  material_finish text,
  destination_port text,
  project_description text,
  support_needed text,
  score integer not null default 0,
  ai_summary text,
  missing_info jsonb not null default '[]'::jsonb,
  recommended_next_action text,
  reply_draft_en text,
  reply_draft_zh text,
  reply_draft_es text,
  original_submission jsonb not null default '{}'::jsonb,
  next_follow_up_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.follow_up_tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid default auth.uid(),
  lead_id uuid references public.leads(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  inquiry_id uuid references public.inquiries(id) on delete cascade,
  type text not null,
  status text not null default 'PENDING',
  title text not null,
  due_date date,
  next_follow_up_at timestamptz,
  priority text not null default 'normal',
  manual_review_required boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid default auth.uid(),
  lead_id uuid references public.leads(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  inquiry_id uuid references public.inquiries(id) on delete cascade,
  file_name text not null,
  file_type text,
  file_size bigint,
  storage_path text,
  source text not null default 'website',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_customers_updated_at on public.customers;
create trigger set_customers_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

drop trigger if exists set_leads_updated_at on public.leads;
create trigger set_leads_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

drop trigger if exists set_inquiries_updated_at on public.inquiries;
create trigger set_inquiries_updated_at
before update on public.inquiries
for each row execute function public.set_updated_at();

drop trigger if exists set_follow_up_tasks_updated_at on public.follow_up_tasks;
create trigger set_follow_up_tasks_updated_at
before update on public.follow_up_tasks
for each row execute function public.set_updated_at();

drop trigger if exists set_attachments_updated_at on public.attachments;
create trigger set_attachments_updated_at
before update on public.attachments
for each row execute function public.set_updated_at();

create index if not exists idx_leads_customer_id on public.leads(customer_id);
create index if not exists idx_leads_business_line on public.leads(business_line);
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_source on public.leads(source);
create index if not exists idx_leads_created_at on public.leads(created_at desc);

create index if not exists idx_customers_business_line on public.customers(business_line);
create index if not exists idx_customers_status on public.customers(status);
create index if not exists idx_customers_source on public.customers(source);
create index if not exists idx_customers_created_at on public.customers(created_at desc);

create index if not exists idx_inquiries_customer_id on public.inquiries(customer_id);
create index if not exists idx_inquiries_lead_id on public.inquiries(lead_id);
create index if not exists idx_inquiries_business_line on public.inquiries(business_line);
create index if not exists idx_inquiries_status on public.inquiries(status);
create index if not exists idx_inquiries_source on public.inquiries(source);
create index if not exists idx_inquiries_created_at on public.inquiries(created_at desc);
create index if not exists idx_inquiries_next_follow_up_at on public.inquiries(next_follow_up_at);

create index if not exists idx_follow_up_tasks_customer_id on public.follow_up_tasks(customer_id);
create index if not exists idx_follow_up_tasks_inquiry_id on public.follow_up_tasks(inquiry_id);
create index if not exists idx_follow_up_tasks_status on public.follow_up_tasks(status);
create index if not exists idx_follow_up_tasks_created_at on public.follow_up_tasks(created_at desc);
create index if not exists idx_follow_up_tasks_next_follow_up_at on public.follow_up_tasks(next_follow_up_at);

create index if not exists idx_attachments_customer_id on public.attachments(customer_id);
create index if not exists idx_attachments_inquiry_id on public.attachments(inquiry_id);
create index if not exists idx_attachments_source on public.attachments(source);
create index if not exists idx_attachments_created_at on public.attachments(created_at desc);

alter table public.customers enable row level security;
alter table public.leads enable row level security;
alter table public.inquiries enable row level security;
alter table public.follow_up_tasks enable row level security;
alter table public.attachments enable row level security;

drop policy if exists "authenticated users can read customers" on public.customers;
create policy "authenticated users can read customers"
on public.customers for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists "authenticated users can write customers" on public.customers;
create policy "authenticated users can write customers"
on public.customers for all
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "authenticated users can read leads" on public.leads;
create policy "authenticated users can read leads"
on public.leads for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists "authenticated users can write leads" on public.leads;
create policy "authenticated users can write leads"
on public.leads for all
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "authenticated users can read inquiries" on public.inquiries;
create policy "authenticated users can read inquiries"
on public.inquiries for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists "authenticated users can write inquiries" on public.inquiries;
create policy "authenticated users can write inquiries"
on public.inquiries for all
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "authenticated users can read follow_up_tasks" on public.follow_up_tasks;
create policy "authenticated users can read follow_up_tasks"
on public.follow_up_tasks for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists "authenticated users can write follow_up_tasks" on public.follow_up_tasks;
create policy "authenticated users can write follow_up_tasks"
on public.follow_up_tasks for all
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "authenticated users can read attachments" on public.attachments;
create policy "authenticated users can read attachments"
on public.attachments for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists "authenticated users can write attachments" on public.attachments;
create policy "authenticated users can write attachments"
on public.attachments for all
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());
