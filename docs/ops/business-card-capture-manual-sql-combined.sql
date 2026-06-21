-- Business Card Capture Manual SQL Editor Pack.
-- Prepared for manual execution by Paul in Supabase Dashboard SQL Editor.
-- Project target: PaulCN2024's Project / zswtekjtkyvfagbudkia.
-- This pack creates new read-only business-card capture tables, inserts fictional DEMO data,
-- enables RLS, and creates authenticated SELECT policies only.
-- Codex must not execute this SQL directly.

-- MIGRATION SQL
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

-- DEMO SEED DATA
-- Business Card Capture DEMO seed data for read-only trial review.
-- Fictional DEMO records only. Do not use real customer data in this seed pack.

insert into public.card_capture_sources (
  id,
  source_type,
  source_label,
  original_filename,
  captured_channel,
  captured_at,
  uploaded_by,
  processing_status
) values
  (
    '11111111-1111-4111-8111-111111111111',
    'trade_show_card',
    'DEMO_TRADE_SHOW_CARD_PERU',
    'demo-peru-business-card.jpg',
    'manual_upload',
    '2026-06-21T09:00:00+08:00',
    'demo_operator',
    'needs_review'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'trade_show_card',
    'DEMO_TRADE_SHOW_CARD_PANAMA',
    'demo-panama-business-card.jpg',
    'manual_upload',
    '2026-06-21T09:10:00+08:00',
    'demo_operator',
    'needs_review'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'whatsapp_contact_image',
    'DEMO_WHATSAPP_CONTACT_INDONESIA',
    'demo-indonesia-contact.png',
    'manual_upload',
    '2026-06-21T09:20:00+08:00',
    'demo_operator',
    'extracted'
  )
on conflict (id) do nothing;

insert into public.card_extraction_results (
  id,
  capture_source_id,
  extracted_name,
  extracted_company,
  extracted_title,
  extracted_email,
  extracted_phone,
  extracted_whatsapp,
  extracted_website,
  extracted_country,
  extracted_address,
  extracted_business_type,
  extracted_product_interest,
  raw_extraction_json,
  confidence_level,
  extraction_provider,
  extraction_language,
  extraction_notes
) values
  (
    '11111111-aaaa-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    'Carlos Ramirez',
    'DEMO Facade Solutions',
    'Project Manager',
    'carlos.ramirez@example.com',
    '+51 900 000 000',
    '+51 900 000 000',
    'www.demo-facade.example',
    'Peru',
    'Lima, Peru',
    'facade contractor',
    'aluminum windows and facade systems',
    '{"demo": true, "source": "manual demo seed"}'::jsonb,
    'medium',
    'manual_demo',
    'en',
    'DEMO extraction. Email, phone, company and product interest require human review.'
  ),
  (
    '22222222-aaaa-4222-8222-222222222222',
    '22222222-2222-4222-8222-222222222222',
    'Maria Gonzalez',
    'DEMO Construction Importers',
    'Purchasing Manager',
    'maria.gonzalez@example.com',
    '+507 6000 0000',
    '+507 6000 0000',
    'www.demo-importers.example',
    'Panama',
    'Panama City, Panama',
    'construction material importer',
    'glass and aluminum accessories',
    '{"demo": true, "source": "manual demo seed"}'::jsonb,
    'medium',
    'manual_demo',
    'es',
    'DEMO extraction. Possible duplicate requires human review.'
  ),
  (
    '33333333-aaaa-4333-8333-333333333333',
    '33333333-3333-4333-8333-333333333333',
    'Daniel Wong',
    'DEMO Building Materials Asia',
    'Distributor',
    null,
    '+62 800 0000 0000',
    '+62 800 0000 0000',
    null,
    'Indonesia',
    'Jakarta, Indonesia',
    'distributor',
    'ceiling system and light steel keel',
    '{"demo": true, "source": "manual demo seed"}'::jsonb,
    'low',
    'manual_demo',
    'en',
    'DEMO extraction. Website and email are missing.'
  )
on conflict (id) do nothing;

insert into public.customer_profile_drafts (
  id,
  capture_source_id,
  extraction_result_id,
  proposed_customer_name,
  proposed_company_name,
  proposed_country,
  proposed_email,
  proposed_phone,
  proposed_whatsapp,
  proposed_website,
  proposed_customer_type,
  proposed_product_interest,
  source_channel,
  confidence_level,
  duplicate_status,
  risk_level,
  review_status,
  reviewer_notes
) values
  (
    '11111111-bbbb-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    '11111111-aaaa-4111-8111-111111111111',
    'Carlos Ramirez',
    'DEMO Facade Solutions',
    'Peru',
    'carlos.ramirez@example.com',
    '+51 900 000 000',
    '+51 900 000 000',
    'www.demo-facade.example',
    'facade contractor',
    'aluminum windows and facade systems',
    'trade_show_card',
    'medium',
    'not_checked',
    'medium',
    'needs_review',
    'DEMO draft only. Do not create customer until Paul reviews contact and project context.'
  ),
  (
    '22222222-bbbb-4222-8222-222222222222',
    '22222222-2222-4222-8222-222222222222',
    '22222222-aaaa-4222-8222-222222222222',
    'Maria Gonzalez',
    'DEMO Construction Importers',
    'Panama',
    'maria.gonzalez@example.com',
    '+507 6000 0000',
    '+507 6000 0000',
    'www.demo-importers.example',
    'construction material importer',
    'glass and aluminum accessories',
    'trade_show_card',
    'medium',
    'possible_duplicate',
    'medium',
    'needs_review',
    'DEMO draft only. Possible duplicate should be reviewed before any customer profile is created.'
  ),
  (
    '33333333-bbbb-4333-8333-333333333333',
    '33333333-3333-4333-8333-333333333333',
    '33333333-aaaa-4333-8333-333333333333',
    'Daniel Wong',
    'DEMO Building Materials Asia',
    'Indonesia',
    null,
    '+62 800 0000 0000',
    '+62 800 0000 0000',
    null,
    'distributor',
    'ceiling system and light steel keel',
    'whatsapp_contact_image',
    'low',
    'not_checked',
    'medium',
    'draft',
    'DEMO draft only. Email and website are missing.'
  )
on conflict (id) do nothing;

insert into public.card_duplicate_checks (
  id,
  customer_profile_draft_id,
  match_type,
  match_entity_type,
  match_entity_id,
  match_label,
  match_confidence,
  match_reason
) values
  (
    '11111111-cccc-4111-8111-111111111111',
    '11111111-bbbb-4111-8111-111111111111',
    'none_detected_demo',
    'customer',
    null,
    'No DEMO duplicate detected',
    'low',
    'DEMO record has not been checked against real customer data.'
  ),
  (
    '22222222-cccc-4222-8222-222222222222',
    '22222222-bbbb-4222-8222-222222222222',
    'possible_company_match',
    'customer',
    null,
    'Possible DEMO company-name similarity',
    'medium',
    'Company name resembles an importer profile and requires human review.'
  ),
  (
    '33333333-cccc-4333-8333-333333333333',
    '33333333-bbbb-4333-8333-333333333333',
    'insufficient_contact_data',
    'customer',
    null,
    'Missing email and website',
    'low',
    'Not enough contact fields to complete duplicate review.'
  )
on conflict (id) do nothing;

insert into public.card_followup_drafts (
  id,
  customer_profile_draft_id,
  language,
  channel,
  subject,
  body,
  tone,
  review_status,
  risk_notes
) values
  (
    '11111111-dddd-4111-8111-111111111111',
    '11111111-bbbb-4111-8111-111111111111',
    'en',
    'email',
    'Nice to meet you at the exhibition',
    'Hi Carlos, nice to meet you at the exhibition. We mainly supply aluminum windows, facade systems, glass and related building materials. May I know what kind of project or product you are currently looking for?',
    'polite_intro',
    'draft',
    'Draft only. Paul must review before sending.'
  ),
  (
    '22222222-dddd-4222-8222-222222222222',
    '22222222-bbbb-4222-8222-222222222222',
    'es',
    'email',
    'Seguimiento de productos de vidrio y aluminio',
    'Hola Maria, fue un gusto conocerle. Podemos revisar productos de vidrio, accesorios de aluminio y materiales para construcción. Antes de continuar, ¿podría confirmar qué tipo de proyecto está evaluando?',
    'polite_intro',
    'needs_review',
    'Spanish draft only. Human review required before use.'
  ),
  (
    '33333333-dddd-4333-8333-333333333333',
    '33333333-bbbb-4333-8333-333333333333',
    'en',
    'whatsapp',
    'Ceiling system inquiry follow-up',
    'Hi Daniel, thanks for sharing your contact. We can review ceiling system and light steel keel requirements. Could you share your target specification, quantity and destination?',
    'polite_intro',
    'draft',
    'Draft only. Email and website are missing.'
  )
on conflict (id) do nothing;

-- VERIFICATION QUERIES
-- Run these after the statements above complete successfully.

select count(*) from card_capture_sources;
select count(*) from card_extraction_results;
select count(*) from customer_profile_drafts;
select count(*) from card_followup_drafts;

select review_status, count(*)
from customer_profile_drafts
group by review_status
order by review_status;

select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'card_capture_sources',
    'card_extraction_results',
    'customer_profile_drafts',
    'card_duplicate_checks',
    'card_followup_drafts'
  )
order by tablename;

select schemaname, tablename, policyname, permissive, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename in (
    'card_capture_sources',
    'card_extraction_results',
    'customer_profile_drafts',
    'card_duplicate_checks',
    'card_followup_drafts'
  )
order by tablename, policyname;
