-- Manual Supabase SQL Editor execution pack.
-- AI Customer Verification read-only foundation.
-- Review before running. Paul executes manually.
-- No destructive SQL expected.

-- AI Customer Verification read-only foundation.
-- No external lookup, no AI provider, no customer mutation, no message sending.
-- No business execution and no write policies are created by this pack.

create table if not exists public.customer_verification_requests (
  id uuid primary key default gen_random_uuid(),
  source_type text not null default 'manual_entry',
  source_entity_id uuid,
  customer_name text,
  company_name text,
  contact_name text,
  email text,
  phone text,
  whatsapp text,
  website text,
  country text,
  inquiry_id uuid,
  requested_by text,
  requested_at timestamptz not null default now(),
  verification_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_verification_requests_source_type_check check (
    source_type in ('customer','inquiry','business_card','whatsapp_contact','email_contact','manual_entry','prospecting_lead')
  ),
  constraint customer_verification_requests_status_check check (
    verification_status in ('draft','pending','in_review','verified','needs_more_info','possible_duplicate','risky','rejected','archived')
  )
);

create table if not exists public.customer_verification_evidence (
  id uuid primary key default gen_random_uuid(),
  verification_request_id uuid not null references public.customer_verification_requests(id),
  evidence_type text not null,
  evidence_label text,
  evidence_value text,
  evidence_source text not null default 'manual_note',
  evidence_status text not null default 'not_checked',
  confidence_level text not null default 'medium',
  risk_level text not null default 'medium',
  notes text,
  created_at timestamptz not null default now(),
  constraint customer_verification_evidence_type_check check (
    evidence_type in ('email_domain','company_website','company_name','country_match','phone_country_code','whatsapp_identity','inquiry_content','product_interest','duplicate_match','social_profile','registration_info_later','manual_note')
  ),
  constraint customer_verification_evidence_status_check check (
    evidence_status in ('confirmed','likely','needs_review','missing','conflict','not_checked')
  ),
  constraint customer_verification_evidence_confidence_check check (confidence_level in ('low','medium','high')),
  constraint customer_verification_evidence_risk_check check (risk_level in ('low','medium','high'))
);

create table if not exists public.customer_verification_scores (
  id uuid primary key default gen_random_uuid(),
  verification_request_id uuid not null references public.customer_verification_requests(id),
  credibility_score integer not null default 50,
  relevance_score integer not null default 50,
  risk_score integer not null default 50,
  duplicate_score integer not null default 50,
  followup_priority_score integer not null default 50,
  confidence_level text not null default 'medium',
  risk_level text not null default 'medium',
  score_explanation text,
  created_at timestamptz not null default now(),
  constraint customer_verification_credibility_score_check check (credibility_score between 0 and 100),
  constraint customer_verification_relevance_score_check check (relevance_score between 0 and 100),
  constraint customer_verification_risk_score_check check (risk_score between 0 and 100),
  constraint customer_verification_duplicate_score_check check (duplicate_score between 0 and 100),
  constraint customer_verification_followup_score_check check (followup_priority_score between 0 and 100),
  constraint customer_verification_scores_confidence_check check (confidence_level in ('low','medium','high')),
  constraint customer_verification_scores_risk_check check (risk_level in ('low','medium','high'))
);

create table if not exists public.customer_verification_duplicate_matches (
  id uuid primary key default gen_random_uuid(),
  verification_request_id uuid not null references public.customer_verification_requests(id),
  matched_entity_type text,
  matched_entity_id uuid,
  match_type text not null,
  matched_label text,
  match_confidence text not null default 'medium',
  match_reason text,
  created_at timestamptz not null default now(),
  constraint customer_verification_duplicate_confidence_check check (match_confidence in ('low','medium','high'))
);

create table if not exists public.customer_verification_reviews (
  id uuid primary key default gen_random_uuid(),
  verification_request_id uuid not null references public.customer_verification_requests(id),
  review_status text not null default 'pending',
  reviewer text,
  reviewer_notes text,
  decision text,
  decision_reason text,
  next_action text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint customer_verification_review_status_check check (
    review_status in ('pending','in_review','completed','rejected','archived')
  ),
  constraint customer_verification_review_decision_check check (
    decision is null
    or decision in ('continue_followup','request_more_info','mark_verified','mark_possible_duplicate','mark_risky','hold','reject','archive')
  )
);

create index if not exists idx_customer_verification_requests_status on public.customer_verification_requests (verification_status);
create index if not exists idx_customer_verification_requests_source on public.customer_verification_requests (source_type);
create index if not exists idx_customer_verification_requests_email on public.customer_verification_requests (email);
create index if not exists idx_customer_verification_requests_company_name on public.customer_verification_requests (company_name);
create index if not exists idx_customer_verification_requests_website on public.customer_verification_requests (website);
create index if not exists idx_customer_verification_evidence_request on public.customer_verification_evidence (verification_request_id);
create index if not exists idx_customer_verification_evidence_type on public.customer_verification_evidence (evidence_type);
create index if not exists idx_customer_verification_evidence_status on public.customer_verification_evidence (evidence_status);
create index if not exists idx_customer_verification_scores_request on public.customer_verification_scores (verification_request_id);
create index if not exists idx_customer_verification_scores_risk on public.customer_verification_scores (risk_level);
create index if not exists idx_customer_verification_duplicates_request on public.customer_verification_duplicate_matches (verification_request_id);
create index if not exists idx_customer_verification_duplicates_match_type on public.customer_verification_duplicate_matches (match_type);
create index if not exists idx_customer_verification_reviews_request on public.customer_verification_reviews (verification_request_id);
create index if not exists idx_customer_verification_reviews_status on public.customer_verification_reviews (review_status);
create index if not exists idx_customer_verification_reviews_decision on public.customer_verification_reviews (decision);

alter table public.customer_verification_requests enable row level security;
alter table public.customer_verification_evidence enable row level security;
alter table public.customer_verification_scores enable row level security;
alter table public.customer_verification_duplicate_matches enable row level security;
alter table public.customer_verification_reviews enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'customer_verification_requests' and policyname = 'customer_verification_requests_authenticated_read') then
    create policy customer_verification_requests_authenticated_read on public.customer_verification_requests for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'customer_verification_evidence' and policyname = 'customer_verification_evidence_authenticated_read') then
    create policy customer_verification_evidence_authenticated_read on public.customer_verification_evidence for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'customer_verification_scores' and policyname = 'customer_verification_scores_authenticated_read') then
    create policy customer_verification_scores_authenticated_read on public.customer_verification_scores for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'customer_verification_duplicate_matches' and policyname = 'customer_verification_duplicate_matches_authenticated_read') then
    create policy customer_verification_duplicate_matches_authenticated_read on public.customer_verification_duplicate_matches for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'customer_verification_reviews' and policyname = 'customer_verification_reviews_authenticated_read') then
    create policy customer_verification_reviews_authenticated_read on public.customer_verification_reviews for select to authenticated using (true);
  end if;
end $$;

-- DEMO SEED DATA

insert into public.customer_verification_requests (
  id, source_type, customer_name, company_name, contact_name, email, phone, whatsapp, website, country,
  requested_by, requested_at, verification_status, created_at, updated_at
) values
('10000000-0000-4000-8000-000000000001','inquiry','Carlos Ramirez','DEMO Facade Solutions','Carlos Ramirez','carlos.ramirez@example.com','+51 000 000 001','+51 000 000 001','https://example.com/demo-facade','Peru','demo_operator','2026-06-21 09:00:00+00','needs_more_info','2026-06-21 09:00:00+00','2026-06-21 09:00:00+00'),
('10000000-0000-4000-8000-000000000002','whatsapp_contact','Maria Gonzalez','DEMO Construction Importers','Maria Gonzalez','maria.gonzalez@example.com','+507 000 000 002','+507 000 000 002','https://example.com/demo-construction','Panama','demo_operator','2026-06-21 09:15:00+00','possible_duplicate','2026-06-21 09:15:00+00','2026-06-21 09:15:00+00'),
('10000000-0000-4000-8000-000000000003','prospecting_lead','Daniel Wong','DEMO Building Materials Asia','Daniel Wong','daniel.wong@example.com','+62 000 000 003','+62 000 000 003','https://example.com/demo-building-materials','Indonesia','demo_operator','2026-06-21 09:30:00+00','pending','2026-06-21 09:30:00+00','2026-06-21 09:30:00+00')
on conflict (id) do nothing;

insert into public.customer_verification_evidence (
  id, verification_request_id, evidence_type, evidence_label, evidence_value, evidence_source,
  evidence_status, confidence_level, risk_level, notes, created_at
) values
('11000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','company_name','Company name','DEMO Facade Solutions','demo_seed','likely','medium','medium','Company name is present but still requires manual review.','2026-06-21 09:00:00+00'),
('11000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','email_domain','Email domain','example.com','demo_seed','not_checked','medium','medium','Demo domain is not a real verification signal.','2026-06-21 09:01:00+00'),
('11000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','company_website','Company website','https://example.com/demo-facade','demo_seed','not_checked','medium','medium','Website is provided for demo display only.','2026-06-21 09:02:00+00'),
('11000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000001','product_interest','Product interest','Aluminum windows / facade systems','demo_seed','confirmed','medium','medium','Product interest is clear, but drawings and quantity are still needed.','2026-06-21 09:03:00+00'),
('11000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000001','duplicate_match','Duplicate match','Not checked','demo_seed','not_checked','medium','medium','No live duplicate check is performed by this seed.','2026-06-21 09:04:00+00'),
('11000000-0000-4000-8000-000000000006','10000000-0000-4000-8000-000000000002','duplicate_match','Similar company','DEMO Construction Importer','demo_seed','needs_review','medium','medium','Similar company name requires human review before customer action.','2026-06-21 09:15:00+00'),
('11000000-0000-4000-8000-000000000007','10000000-0000-4000-8000-000000000002','email_domain','Same email','missing','demo_seed','missing','medium','medium','Email evidence is missing for this demo duplicate review.','2026-06-21 09:16:00+00'),
('11000000-0000-4000-8000-000000000008','10000000-0000-4000-8000-000000000002','whatsapp_identity','WhatsApp identity','+507 000 000 002','demo_seed','needs_review','medium','medium','WhatsApp identity must be reviewed by Paul before follow-up.','2026-06-21 09:17:00+00'),
('11000000-0000-4000-8000-000000000009','10000000-0000-4000-8000-000000000002','product_interest','Product interest','Glass / aluminum accessories','demo_seed','likely','medium','medium','Product interest is useful but not enough for identity confirmation.','2026-06-21 09:18:00+00'),
('11000000-0000-4000-8000-000000000010','10000000-0000-4000-8000-000000000003','company_website','Website','missing','demo_seed','missing','low','medium','Website is missing for this prospecting lead.','2026-06-21 09:30:00+00'),
('11000000-0000-4000-8000-000000000011','10000000-0000-4000-8000-000000000003','email_domain','Email domain','example.com','demo_seed','missing','low','medium','Demo domain is not enough for identity verification.','2026-06-21 09:31:00+00'),
('11000000-0000-4000-8000-000000000012','10000000-0000-4000-8000-000000000003','country_match','Country match','Indonesia','demo_seed','needs_review','low','medium','Country and market context should be reviewed manually.','2026-06-21 09:32:00+00'),
('11000000-0000-4000-8000-000000000013','10000000-0000-4000-8000-000000000003','product_interest','Product interest','Ceiling system / light steel keel','demo_seed','likely','low','medium','Lead is early-stage and should remain read-only until identity evidence improves.','2026-06-21 09:33:00+00')
on conflict (id) do nothing;

insert into public.customer_verification_scores (
  id, verification_request_id, credibility_score, relevance_score, risk_score, duplicate_score,
  followup_priority_score, confidence_level, risk_level, score_explanation, created_at
) values
('12000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001',65,80,45,20,75,'medium','medium','Inquiry is relevant but missing drawings, specifications, and target quantity.','2026-06-21 09:05:00+00'),
('12000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002',55,70,55,72,50,'medium','medium','Possible duplicate risk should be reviewed before follow-up.','2026-06-21 09:19:00+00'),
('12000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000003',45,68,60,30,55,'low','medium','Prospecting lead has limited identity evidence and needs more source context.','2026-06-21 09:34:00+00')
on conflict (id) do nothing;

insert into public.customer_verification_duplicate_matches (
  id, verification_request_id, matched_entity_type, matched_entity_id, match_type, matched_label,
  match_confidence, match_reason, created_at
) values
('13000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','customer',null,'similar_company_name','DEMO Construction Importer','medium','Similar company name and Panama country signal.','2026-06-21 09:20:00+00')
on conflict (id) do nothing;

insert into public.customer_verification_reviews (
  id, verification_request_id, review_status, reviewer, reviewer_notes, decision, decision_reason,
  next_action, reviewed_at, created_at
) values
('14000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','pending',null,null,'request_more_info','Drawings, specifications, and target quantity are still missing.','Ask for drawings, product specifications, and target quantity before quotation review.',null,'2026-06-21 09:06:00+00'),
('14000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','pending',null,null,'hold','Possible duplicate needs manual review.','Compare existing customer records before creating or merging any customer profile.',null,'2026-06-21 09:21:00+00'),
('14000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000003','pending',null,null,'request_more_info','Prospecting lead has limited identity evidence.','Collect more source evidence before sales follow-up.',null,'2026-06-21 09:35:00+00')
on conflict (id) do nothing;

select count(*) from public.customer_verification_requests;
select count(*) from public.customer_verification_evidence;
select count(*) from public.customer_verification_scores;
select count(*) from public.customer_verification_duplicate_matches;
select count(*) from public.customer_verification_reviews;

select verification_status, count(*)
from public.customer_verification_requests
group by verification_status
order by verification_status;

select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'customer_verification_requests',
    'customer_verification_evidence',
    'customer_verification_scores',
    'customer_verification_duplicate_matches',
    'customer_verification_reviews'
  )
order by tablename;
