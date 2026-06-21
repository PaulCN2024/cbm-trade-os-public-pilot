-- Business Card Capture read-only data foundation.
-- This file is prepared for manual review and execution by the project owner.
-- It creates new business-card capture tables only, enables RLS, and adds authenticated SELECT policies.
-- It does not add upload, OCR, customer creation, message sending, quotation, PI, order, payment, production, or shipment execution.

create table if not exists public.card_capture_sources (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_label text,
  original_file_id uuid,
  original_filename text,
  captured_channel text not null default 'manual_upload',
  captured_at timestamptz,
  uploaded_by text,
  processing_status text not null default 'uploaded',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint card_capture_sources_processing_status_check
    check (processing_status in ('uploaded','extraction_pending','extracted','needs_review','approved','rejected','archived'))
);

create table if not exists public.card_extraction_results (
  id uuid primary key default gen_random_uuid(),
  capture_source_id uuid not null references public.card_capture_sources(id),
  extracted_name text,
  extracted_company text,
  extracted_title text,
  extracted_email text,
  extracted_phone text,
  extracted_whatsapp text,
  extracted_website text,
  extracted_country text,
  extracted_address text,
  extracted_business_type text,
  extracted_product_interest text,
  raw_extraction_json jsonb,
  confidence_level text not null default 'medium',
  extraction_provider text,
  extraction_language text,
  extraction_notes text,
  created_at timestamptz not null default now(),
  constraint card_extraction_results_confidence_level_check
    check (confidence_level in ('low','medium','high'))
);

create table if not exists public.customer_profile_drafts (
  id uuid primary key default gen_random_uuid(),
  capture_source_id uuid references public.card_capture_sources(id),
  extraction_result_id uuid references public.card_extraction_results(id),
  proposed_customer_name text,
  proposed_company_name text,
  proposed_country text,
  proposed_email text,
  proposed_phone text,
  proposed_whatsapp text,
  proposed_website text,
  proposed_customer_type text,
  proposed_product_interest text,
  source_channel text,
  confidence_level text not null default 'medium',
  duplicate_status text not null default 'not_checked',
  risk_level text not null default 'medium',
  review_status text not null default 'needs_review',
  reviewer_notes text,
  approved_customer_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_profile_drafts_confidence_level_check
    check (confidence_level in ('low','medium','high')),
  constraint customer_profile_drafts_duplicate_status_check
    check (duplicate_status in ('not_checked','possible_duplicate','confirmed_duplicate','unique','needs_review')),
  constraint customer_profile_drafts_risk_level_check
    check (risk_level in ('low','medium','high')),
  constraint customer_profile_drafts_review_status_check
    check (review_status in ('draft','needs_review','approved','rejected','archived'))
);

create table if not exists public.card_duplicate_checks (
  id uuid primary key default gen_random_uuid(),
  customer_profile_draft_id uuid not null references public.customer_profile_drafts(id),
  match_type text,
  match_entity_type text,
  match_entity_id uuid,
  match_label text,
  match_confidence text not null default 'medium',
  match_reason text,
  created_at timestamptz not null default now(),
  constraint card_duplicate_checks_match_confidence_check
    check (match_confidence in ('low','medium','high'))
);

create table if not exists public.card_followup_drafts (
  id uuid primary key default gen_random_uuid(),
  customer_profile_draft_id uuid not null references public.customer_profile_drafts(id),
  language text not null default 'en',
  channel text not null default 'email',
  subject text,
  body text,
  tone text,
  review_status text not null default 'draft',
  risk_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint card_followup_drafts_language_check
    check (language in ('zh','en','es','mixed')),
  constraint card_followup_drafts_channel_check
    check (channel in ('email','whatsapp','linkedin','phone','other')),
  constraint card_followup_drafts_review_status_check
    check (review_status in ('draft','needs_review','approved','rejected','archived'))
);

create index if not exists card_capture_sources_source_type_idx
  on public.card_capture_sources(source_type);

create index if not exists card_capture_sources_captured_channel_idx
  on public.card_capture_sources(captured_channel);

create index if not exists card_capture_sources_processing_status_idx
  on public.card_capture_sources(processing_status);

create index if not exists card_extraction_results_capture_source_id_idx
  on public.card_extraction_results(capture_source_id);

create index if not exists customer_profile_drafts_review_status_idx
  on public.customer_profile_drafts(review_status);

create index if not exists customer_profile_drafts_duplicate_status_idx
  on public.customer_profile_drafts(duplicate_status);

create index if not exists customer_profile_drafts_risk_level_idx
  on public.customer_profile_drafts(risk_level);

create index if not exists customer_profile_drafts_proposed_email_idx
  on public.customer_profile_drafts(proposed_email);

create index if not exists customer_profile_drafts_proposed_company_name_idx
  on public.customer_profile_drafts(proposed_company_name);

create index if not exists card_duplicate_checks_customer_profile_draft_id_idx
  on public.card_duplicate_checks(customer_profile_draft_id);

create index if not exists card_followup_drafts_customer_profile_draft_id_idx
  on public.card_followup_drafts(customer_profile_draft_id);

create index if not exists card_followup_drafts_review_status_idx
  on public.card_followup_drafts(review_status);

alter table public.card_capture_sources enable row level security;
alter table public.card_extraction_results enable row level security;
alter table public.customer_profile_drafts enable row level security;
alter table public.card_duplicate_checks enable row level security;
alter table public.card_followup_drafts enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'card_capture_sources'
      and policyname = 'card_capture_sources_authenticated_read'
  ) then
    create policy card_capture_sources_authenticated_read
      on public.card_capture_sources
      for select
      to authenticated
      using (true);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'card_extraction_results'
      and policyname = 'card_extraction_results_authenticated_read'
  ) then
    create policy card_extraction_results_authenticated_read
      on public.card_extraction_results
      for select
      to authenticated
      using (true);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'customer_profile_drafts'
      and policyname = 'customer_profile_drafts_authenticated_read'
  ) then
    create policy customer_profile_drafts_authenticated_read
      on public.customer_profile_drafts
      for select
      to authenticated
      using (true);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'card_duplicate_checks'
      and policyname = 'card_duplicate_checks_authenticated_read'
  ) then
    create policy card_duplicate_checks_authenticated_read
      on public.card_duplicate_checks
      for select
      to authenticated
      using (true);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'card_followup_drafts'
      and policyname = 'card_followup_drafts_authenticated_read'
  ) then
    create policy card_followup_drafts_authenticated_read
      on public.card_followup_drafts
      for select
      to authenticated
      using (true);
  end if;
end
$$;
