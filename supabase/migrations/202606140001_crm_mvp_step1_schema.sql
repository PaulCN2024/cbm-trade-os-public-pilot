-- CBM Trade OS CRM MVP Step 1
-- Scope: backward-compatible schema additions for MVP CRM objects.
-- Safety: no destructive changes, no table deletes/renames, no OpenAI or sending logic.

create extension if not exists pgcrypto;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid default auth.uid(),
  company_name text not null,
  country text,
  address text,
  website text,
  business_type text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customers add column if not exists company_id uuid references public.companies(id) on delete set null;
alter table public.customers add column if not exists language text;
alter table public.customers add column if not exists rating text;
alter table public.customers add column if not exists stage text;
alter table public.customers add column if not exists notes text;
alter table public.customers add column if not exists last_contact_at timestamptz;
alter table public.customers add column if not exists next_follow_up_at timestamptz;

alter table public.inquiries add column if not exists company_id uuid references public.companies(id) on delete set null;
alter table public.inquiries add column if not exists inquiry_type text;
alter table public.inquiries add column if not exists product_category text;
alter table public.inquiries add column if not exists original_message text;

create table if not exists public.architectural_inquiries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid default auth.uid(),
  inquiry_id uuid not null references public.inquiries(id) on delete cascade,
  project_name text,
  building_type text,
  drawing_received boolean,
  window_schedule_received boolean,
  glass_spec text,
  area numeric,
  hardware text,
  color text,
  destination_port text,
  incoterm text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.deep_processing_inquiries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid default auth.uid(),
  inquiry_id uuid not null references public.inquiries(id) on delete cascade,
  part_name text,
  drawing_format text,
  material_grade text,
  process text,
  tolerance text,
  surface_finish text,
  quantity numeric,
  inspection_requirement text,
  sample_required boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid default auth.uid(),
  business_line text not null default 'UNKNOWN',
  category text,
  product_family text,
  code text,
  name_cn text,
  name_en text,
  name_es text,
  material text,
  standard text,
  surface text,
  process_tags jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid default auth.uid(),
  quote_no text not null,
  customer_id uuid references public.customers(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  inquiry_id uuid references public.inquiries(id) on delete set null,
  business_line text not null default 'UNKNOWN',
  quote_model text,
  incoterm text,
  payment_terms text,
  total_amount numeric,
  currency text not null default 'USD',
  status text not null default 'DRAFT',
  approval_required boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid default auth.uid(),
  quotation_id uuid not null references public.quotations(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text,
  quantity numeric,
  unit text,
  unit_price numeric,
  total_amount numeric,
  width numeric,
  height numeric,
  area numeric,
  kg_per_meter numeric,
  material_cost numeric,
  machining_cost numeric,
  finish_cost numeric,
  tolerance text,
  drawing_ref text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid default auth.uid(),
  business_line text not null default 'UNKNOWN',
  related_type text,
  related_id uuid,
  doc_type text,
  file_name text,
  file_url text,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.manufacturing_capabilities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid default auth.uid(),
  capability_line text not null default 'UNKNOWN',
  equipment text,
  quantity integer,
  max_length text,
  monthly_capacity text,
  public_description text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_inquiry_analyses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid default auth.uid(),
  inquiry_id uuid references public.inquiries(id) on delete cascade,
  detected_business_line text not null default 'UNKNOWN',
  extracted_requirements jsonb not null default '{}'::jsonb,
  missing_information jsonb not null default '[]'::jsonb,
  risk_flags jsonb not null default '[]'::jsonb,
  suggested_reply text,
  approval_required boolean not null default true,
  created_at timestamptz not null default now()
);

drop trigger if exists set_companies_updated_at on public.companies;
create trigger set_companies_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

drop trigger if exists set_architectural_inquiries_updated_at on public.architectural_inquiries;
create trigger set_architectural_inquiries_updated_at
before update on public.architectural_inquiries
for each row execute function public.set_updated_at();

drop trigger if exists set_deep_processing_inquiries_updated_at on public.deep_processing_inquiries;
create trigger set_deep_processing_inquiries_updated_at
before update on public.deep_processing_inquiries
for each row execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists set_quotations_updated_at on public.quotations;
create trigger set_quotations_updated_at
before update on public.quotations
for each row execute function public.set_updated_at();

drop trigger if exists set_quotation_items_updated_at on public.quotation_items;
create trigger set_quotation_items_updated_at
before update on public.quotation_items
for each row execute function public.set_updated_at();

drop trigger if exists set_documents_updated_at on public.documents;
create trigger set_documents_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

drop trigger if exists set_manufacturing_capabilities_updated_at on public.manufacturing_capabilities;
create trigger set_manufacturing_capabilities_updated_at
before update on public.manufacturing_capabilities
for each row execute function public.set_updated_at();

create index if not exists idx_customers_company_id on public.customers(company_id);
create index if not exists idx_customers_next_follow_up_at on public.customers(next_follow_up_at);
create index if not exists idx_inquiries_company_id on public.inquiries(company_id);
create index if not exists idx_inquiries_product_category on public.inquiries(product_category);

create index if not exists idx_companies_country on public.companies(country);
create index if not exists idx_companies_created_at on public.companies(created_at desc);
create index if not exists idx_architectural_inquiries_inquiry_id on public.architectural_inquiries(inquiry_id);
create index if not exists idx_deep_processing_inquiries_inquiry_id on public.deep_processing_inquiries(inquiry_id);
create index if not exists idx_products_business_line on public.products(business_line);
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_code on public.products(code);
create index if not exists idx_quotations_customer_id on public.quotations(customer_id);
create index if not exists idx_quotations_company_id on public.quotations(company_id);
create index if not exists idx_quotations_inquiry_id on public.quotations(inquiry_id);
create index if not exists idx_quotations_business_line on public.quotations(business_line);
create index if not exists idx_quotations_status on public.quotations(status);
create index if not exists idx_quotation_items_quotation_id on public.quotation_items(quotation_id);
create index if not exists idx_documents_related on public.documents(related_type, related_id);
create index if not exists idx_documents_doc_type on public.documents(doc_type);
create index if not exists idx_manufacturing_capabilities_line on public.manufacturing_capabilities(capability_line);
create index if not exists idx_ai_inquiry_analyses_inquiry_id on public.ai_inquiry_analyses(inquiry_id);
create index if not exists idx_ai_inquiry_analyses_detected_line on public.ai_inquiry_analyses(detected_business_line);

alter table public.companies enable row level security;
alter table public.architectural_inquiries enable row level security;
alter table public.deep_processing_inquiries enable row level security;
alter table public.products enable row level security;
alter table public.quotations enable row level security;
alter table public.quotation_items enable row level security;
alter table public.documents enable row level security;
alter table public.manufacturing_capabilities enable row level security;
alter table public.ai_inquiry_analyses enable row level security;

drop policy if exists "authenticated users can read companies" on public.companies;
create policy "authenticated users can read companies" on public.companies for select to authenticated using (true);
drop policy if exists "authenticated users can write companies" on public.companies;
create policy "authenticated users can write companies" on public.companies for all to authenticated using (true) with check (coalesce(owner_id, auth.uid()) = auth.uid());

drop policy if exists "authenticated users can read architectural_inquiries" on public.architectural_inquiries;
create policy "authenticated users can read architectural_inquiries" on public.architectural_inquiries for select to authenticated using (true);
drop policy if exists "authenticated users can write architectural_inquiries" on public.architectural_inquiries;
create policy "authenticated users can write architectural_inquiries" on public.architectural_inquiries for all to authenticated using (true) with check (coalesce(owner_id, auth.uid()) = auth.uid());

drop policy if exists "authenticated users can read deep_processing_inquiries" on public.deep_processing_inquiries;
create policy "authenticated users can read deep_processing_inquiries" on public.deep_processing_inquiries for select to authenticated using (true);
drop policy if exists "authenticated users can write deep_processing_inquiries" on public.deep_processing_inquiries;
create policy "authenticated users can write deep_processing_inquiries" on public.deep_processing_inquiries for all to authenticated using (true) with check (coalesce(owner_id, auth.uid()) = auth.uid());

drop policy if exists "authenticated users can read products" on public.products;
create policy "authenticated users can read products" on public.products for select to authenticated using (true);
drop policy if exists "authenticated users can write products" on public.products;
create policy "authenticated users can write products" on public.products for all to authenticated using (true) with check (coalesce(owner_id, auth.uid()) = auth.uid());

drop policy if exists "authenticated users can read quotations" on public.quotations;
create policy "authenticated users can read quotations" on public.quotations for select to authenticated using (true);
drop policy if exists "authenticated users can write quotations" on public.quotations;
create policy "authenticated users can write quotations" on public.quotations for all to authenticated using (true) with check (coalesce(owner_id, auth.uid()) = auth.uid());

drop policy if exists "authenticated users can read quotation_items" on public.quotation_items;
create policy "authenticated users can read quotation_items" on public.quotation_items for select to authenticated using (true);
drop policy if exists "authenticated users can write quotation_items" on public.quotation_items;
create policy "authenticated users can write quotation_items" on public.quotation_items for all to authenticated using (true) with check (coalesce(owner_id, auth.uid()) = auth.uid());

drop policy if exists "authenticated users can read documents" on public.documents;
create policy "authenticated users can read documents" on public.documents for select to authenticated using (true);
drop policy if exists "authenticated users can write documents" on public.documents;
create policy "authenticated users can write documents" on public.documents for all to authenticated using (true) with check (coalesce(owner_id, auth.uid()) = auth.uid());

drop policy if exists "authenticated users can read manufacturing_capabilities" on public.manufacturing_capabilities;
create policy "authenticated users can read manufacturing_capabilities" on public.manufacturing_capabilities for select to authenticated using (true);
drop policy if exists "authenticated users can write manufacturing_capabilities" on public.manufacturing_capabilities;
create policy "authenticated users can write manufacturing_capabilities" on public.manufacturing_capabilities for all to authenticated using (true) with check (coalesce(owner_id, auth.uid()) = auth.uid());

drop policy if exists "authenticated users can read ai_inquiry_analyses" on public.ai_inquiry_analyses;
create policy "authenticated users can read ai_inquiry_analyses" on public.ai_inquiry_analyses for select to authenticated using (true);
drop policy if exists "authenticated users can write ai_inquiry_analyses" on public.ai_inquiry_analyses;
create policy "authenticated users can write ai_inquiry_analyses" on public.ai_inquiry_analyses for all to authenticated using (true) with check (coalesce(owner_id, auth.uid()) = auth.uid());
