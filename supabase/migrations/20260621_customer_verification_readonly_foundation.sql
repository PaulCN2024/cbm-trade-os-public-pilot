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
    source_type in (
      'customer',
      'inquiry',
      'business_card',
      'whatsapp_contact',
      'email_contact',
      'manual_entry',
      'prospecting_lead'
    )
  ),
  constraint customer_verification_requests_status_check check (
    verification_status in (
      'draft',
      'pending',
      'in_review',
      'verified',
      'needs_more_info',
      'possible_duplicate',
      'risky',
      'rejected',
      'archived'
    )
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
    evidence_type in (
      'email_domain',
      'company_website',
      'company_name',
      'country_match',
      'phone_country_code',
      'whatsapp_identity',
      'inquiry_content',
      'product_interest',
      'duplicate_match',
      'social_profile',
      'registration_info_later',
      'manual_note'
    )
  ),
  constraint customer_verification_evidence_status_check check (
    evidence_status in (
      'confirmed',
      'likely',
      'needs_review',
      'missing',
      'conflict',
      'not_checked'
    )
  ),
  constraint customer_verification_evidence_confidence_check check (
    confidence_level in ('low', 'medium', 'high')
  ),
  constraint customer_verification_evidence_risk_check check (
    risk_level in ('low', 'medium', 'high')
  )
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
  constraint customer_verification_credibility_score_check check (
    credibility_score between 0 and 100
  ),
  constraint customer_verification_relevance_score_check check (
    relevance_score between 0 and 100
  ),
  constraint customer_verification_risk_score_check check (
    risk_score between 0 and 100
  ),
  constraint customer_verification_duplicate_score_check check (
    duplicate_score between 0 and 100
  ),
  constraint customer_verification_followup_score_check check (
    followup_priority_score between 0 and 100
  ),
  constraint customer_verification_scores_confidence_check check (
    confidence_level in ('low', 'medium', 'high')
  ),
  constraint customer_verification_scores_risk_check check (
    risk_level in ('low', 'medium', 'high')
  )
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
  constraint customer_verification_duplicate_confidence_check check (
    match_confidence in ('low', 'medium', 'high')
  )
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
    review_status in ('pending', 'in_review', 'completed', 'rejected', 'archived')
  ),
  constraint customer_verification_review_decision_check check (
    decision is null
    or decision in (
      'continue_followup',
      'request_more_info',
      'mark_verified',
      'mark_possible_duplicate',
      'mark_risky',
      'hold',
      'reject',
      'archive'
    )
  )
);

create index if not exists idx_customer_verification_requests_status
  on public.customer_verification_requests (verification_status);

create index if not exists idx_customer_verification_requests_source
  on public.customer_verification_requests (source_type);

create index if not exists idx_customer_verification_requests_email
  on public.customer_verification_requests (email);

create index if not exists idx_customer_verification_requests_company_name
  on public.customer_verification_requests (company_name);

create index if not exists idx_customer_verification_requests_website
  on public.customer_verification_requests (website);

create index if not exists idx_customer_verification_requests_country
  on public.customer_verification_requests (country);

create index if not exists idx_customer_verification_requests_requested_at
  on public.customer_verification_requests (requested_at desc);

create index if not exists idx_customer_verification_evidence_request
  on public.customer_verification_evidence (verification_request_id);

create index if not exists idx_customer_verification_evidence_type
  on public.customer_verification_evidence (evidence_type);

create index if not exists idx_customer_verification_evidence_status
  on public.customer_verification_evidence (evidence_status);

create index if not exists idx_customer_verification_scores_request
  on public.customer_verification_scores (verification_request_id);

create index if not exists idx_customer_verification_scores_risk
  on public.customer_verification_scores (risk_level);

create index if not exists idx_customer_verification_duplicates_request
  on public.customer_verification_duplicate_matches (verification_request_id);

create index if not exists idx_customer_verification_duplicates_match_type
  on public.customer_verification_duplicate_matches (match_type);

create index if not exists idx_customer_verification_reviews_request
  on public.customer_verification_reviews (verification_request_id);

create index if not exists idx_customer_verification_reviews_status
  on public.customer_verification_reviews (review_status);

create index if not exists idx_customer_verification_reviews_decision
  on public.customer_verification_reviews (decision);

alter table public.customer_verification_requests enable row level security;
alter table public.customer_verification_evidence enable row level security;
alter table public.customer_verification_scores enable row level security;
alter table public.customer_verification_duplicate_matches enable row level security;
alter table public.customer_verification_reviews enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'customer_verification_requests'
      and policyname = 'customer_verification_requests_authenticated_read'
  ) then
    create policy customer_verification_requests_authenticated_read
      on public.customer_verification_requests
      for select
      to authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'customer_verification_evidence'
      and policyname = 'customer_verification_evidence_authenticated_read'
  ) then
    create policy customer_verification_evidence_authenticated_read
      on public.customer_verification_evidence
      for select
      to authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'customer_verification_scores'
      and policyname = 'customer_verification_scores_authenticated_read'
  ) then
    create policy customer_verification_scores_authenticated_read
      on public.customer_verification_scores
      for select
      to authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'customer_verification_duplicate_matches'
      and policyname = 'customer_verification_duplicate_matches_authenticated_read'
  ) then
    create policy customer_verification_duplicate_matches_authenticated_read
      on public.customer_verification_duplicate_matches
      for select
      to authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'customer_verification_reviews'
      and policyname = 'customer_verification_reviews_authenticated_read'
  ) then
    create policy customer_verification_reviews_authenticated_read
      on public.customer_verification_reviews
      for select
      to authenticated
      using (true);
  end if;
end $$;
