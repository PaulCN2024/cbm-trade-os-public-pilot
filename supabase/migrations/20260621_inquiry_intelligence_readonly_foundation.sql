-- AI Inquiry Intelligence read-only foundation.
-- Creates new inquiry intelligence tables only.
-- No AI provider, file parsing, supplier RFQ, quotation, sending,
-- customer/inquiry mutation, or business execution is introduced.
-- RLS is enabled with authenticated SELECT-only policies.

create table if not exists public.inquiry_intelligence_requests (
  id uuid primary key default gen_random_uuid(),
  source_type text not null default 'manual_note',
  source_entity_id uuid,
  inquiry_id uuid,
  customer_id uuid,
  customer_name text,
  company_name text,
  country text,
  source_channel text,
  inquiry_title text,
  inquiry_text text,
  language text not null default 'en',
  analysis_status text not null default 'pending',
  priority_level text not null default 'medium',
  risk_level text not null default 'medium',
  confidence_level text not null default 'medium',
  requested_by text,
  requested_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inquiry_intelligence_requests_source_type_check check (
    source_type in (
      'inquiry',
      'email',
      'whatsapp',
      'website_form',
      'business_card',
      'manual_note',
      'document',
      'drawing'
    )
  ),
  constraint inquiry_intelligence_requests_language_check check (
    language in ('zh', 'en', 'es', 'mixed')
  ),
  constraint inquiry_intelligence_requests_analysis_status_check check (
    analysis_status in (
      'draft',
      'pending',
      'analyzed',
      'needs_more_info',
      'supplier_confirm_needed',
      'quote_ready',
      'risk_hold',
      'archived'
    )
  ),
  constraint inquiry_intelligence_requests_priority_level_check check (
    priority_level in ('low', 'medium', 'high')
  ),
  constraint inquiry_intelligence_requests_risk_level_check check (
    risk_level in ('low', 'medium', 'high')
  ),
  constraint inquiry_intelligence_requests_confidence_level_check check (
    confidence_level in ('low', 'medium', 'high')
  )
);

create table if not exists public.inquiry_product_classifications (
  id uuid primary key default gen_random_uuid(),
  inquiry_intelligence_request_id uuid not null references public.inquiry_intelligence_requests(id),
  primary_category text,
  secondary_category text,
  product_family text,
  material text,
  likely_process text,
  supplier_type_needed text,
  classification_confidence text not null default 'medium',
  classification_notes text,
  created_at timestamptz not null default now(),
  constraint inquiry_product_classifications_confidence_check check (
    classification_confidence in ('low', 'medium', 'high')
  )
);

create table if not exists public.inquiry_missing_information (
  id uuid primary key default gen_random_uuid(),
  inquiry_intelligence_request_id uuid not null references public.inquiry_intelligence_requests(id),
  info_type text not null,
  info_label text,
  required_level text not null default 'recommended',
  status text not null default 'missing',
  reason text,
  created_at timestamptz not null default now(),
  constraint inquiry_missing_information_info_type_check check (
    info_type in (
      'specification',
      'thickness',
      'dimension',
      'drawing',
      'photo',
      'quantity',
      'quantity_breakdown',
      'surface_treatment',
      'packing',
      'target_port',
      'delivery_time',
      'installation_responsibility',
      'buyer_role',
      'brand_private_label',
      'payment_terms',
      'project_location',
      'standard_or_code',
      'other'
    )
  ),
  constraint inquiry_missing_information_required_level_check check (
    required_level in ('required', 'recommended', 'optional')
  ),
  constraint inquiry_missing_information_status_check check (
    status in ('confirmed', 'missing', 'needs_review', 'supplier_confirm', 'not_required')
  )
);

create table if not exists public.inquiry_quotation_readiness (
  id uuid primary key default gen_random_uuid(),
  inquiry_intelligence_request_id uuid not null references public.inquiry_intelligence_requests(id),
  readiness_status text not null default 'not_ready',
  can_prepare_budget_estimate boolean not null default false,
  can_prepare_formal_quote boolean not null default false,
  quote_blockers text,
  assumption_needed text,
  risk_if_quoted_now text,
  confidence_level text not null default 'medium',
  created_at timestamptz not null default now(),
  constraint inquiry_quotation_readiness_status_check check (
    readiness_status in (
      'not_ready',
      'budget_estimate_possible',
      'formal_quote_possible',
      'supplier_confirm_needed',
      'blocked_by_missing_info',
      'risk_hold'
    )
  ),
  constraint inquiry_quotation_readiness_confidence_check check (
    confidence_level in ('low', 'medium', 'high')
  )
);

create table if not exists public.inquiry_supplier_rfq_requirements (
  id uuid primary key default gen_random_uuid(),
  inquiry_intelligence_request_id uuid not null references public.inquiry_intelligence_requests(id),
  supplier_required boolean not null default false,
  supplier_category text,
  rfq_needed boolean not null default false,
  rfq_reason text,
  supplier_questions text,
  priority_level text not null default 'medium',
  created_at timestamptz not null default now(),
  constraint inquiry_supplier_rfq_requirements_priority_check check (
    priority_level in ('low', 'medium', 'high')
  )
);

create table if not exists public.inquiry_reply_drafts (
  id uuid primary key default gen_random_uuid(),
  inquiry_intelligence_request_id uuid not null references public.inquiry_intelligence_requests(id),
  language text not null default 'en',
  channel text not null default 'email',
  draft_subject text,
  draft_body text,
  draft_status text not null default 'draft',
  safety_notes text,
  requires_approval boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inquiry_reply_drafts_language_check check (
    language in ('zh', 'en', 'es', 'mixed')
  ),
  constraint inquiry_reply_drafts_channel_check check (
    channel in ('email', 'whatsapp', 'linkedin', 'phone_script', 'other')
  ),
  constraint inquiry_reply_drafts_status_check check (
    draft_status in ('draft', 'needs_review', 'approved', 'rejected', 'archived')
  )
);

create table if not exists public.inquiry_intelligence_reviews (
  id uuid primary key default gen_random_uuid(),
  inquiry_intelligence_request_id uuid not null references public.inquiry_intelligence_requests(id),
  reviewer text,
  review_status text not null default 'pending',
  decision text,
  reviewer_notes text,
  approved_next_action text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint inquiry_intelligence_reviews_status_check check (
    review_status in ('pending', 'in_review', 'completed', 'rejected', 'archived')
  ),
  constraint inquiry_intelligence_reviews_decision_check check (
    decision is null
    or decision in (
      'request_more_info',
      'prepare_supplier_rfq',
      'prepare_budget_estimate',
      'prepare_formal_quote_later',
      'hold_due_to_risk',
      'low_priority',
      'archive'
    )
  )
);

create index if not exists inquiry_intelligence_requests_source_type_idx
  on public.inquiry_intelligence_requests(source_type);

create index if not exists inquiry_intelligence_requests_analysis_status_idx
  on public.inquiry_intelligence_requests(analysis_status);

create index if not exists inquiry_intelligence_requests_priority_level_idx
  on public.inquiry_intelligence_requests(priority_level);

create index if not exists inquiry_intelligence_requests_risk_level_idx
  on public.inquiry_intelligence_requests(risk_level);

create index if not exists inquiry_intelligence_requests_customer_id_idx
  on public.inquiry_intelligence_requests(customer_id);

create index if not exists inquiry_intelligence_requests_inquiry_id_idx
  on public.inquiry_intelligence_requests(inquiry_id);

create index if not exists inquiry_product_classifications_request_idx
  on public.inquiry_product_classifications(inquiry_intelligence_request_id);

create index if not exists inquiry_product_classifications_primary_category_idx
  on public.inquiry_product_classifications(primary_category);

create index if not exists inquiry_missing_information_request_idx
  on public.inquiry_missing_information(inquiry_intelligence_request_id);

create index if not exists inquiry_missing_information_info_type_idx
  on public.inquiry_missing_information(info_type);

create index if not exists inquiry_missing_information_status_idx
  on public.inquiry_missing_information(status);

create index if not exists inquiry_quotation_readiness_request_idx
  on public.inquiry_quotation_readiness(inquiry_intelligence_request_id);

create index if not exists inquiry_quotation_readiness_status_idx
  on public.inquiry_quotation_readiness(readiness_status);

create index if not exists inquiry_supplier_rfq_requirements_request_idx
  on public.inquiry_supplier_rfq_requirements(inquiry_intelligence_request_id);

create index if not exists inquiry_supplier_rfq_requirements_rfq_needed_idx
  on public.inquiry_supplier_rfq_requirements(rfq_needed);

create index if not exists inquiry_reply_drafts_request_idx
  on public.inquiry_reply_drafts(inquiry_intelligence_request_id);

create index if not exists inquiry_reply_drafts_status_idx
  on public.inquiry_reply_drafts(draft_status);

create index if not exists inquiry_intelligence_reviews_request_idx
  on public.inquiry_intelligence_reviews(inquiry_intelligence_request_id);

create index if not exists inquiry_intelligence_reviews_status_idx
  on public.inquiry_intelligence_reviews(review_status);

create index if not exists inquiry_intelligence_reviews_decision_idx
  on public.inquiry_intelligence_reviews(decision);

alter table public.inquiry_intelligence_requests enable row level security;
alter table public.inquiry_product_classifications enable row level security;
alter table public.inquiry_missing_information enable row level security;
alter table public.inquiry_quotation_readiness enable row level security;
alter table public.inquiry_supplier_rfq_requirements enable row level security;
alter table public.inquiry_reply_drafts enable row level security;
alter table public.inquiry_intelligence_reviews enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'inquiry_intelligence_requests'
      and policyname = 'inquiry_intelligence_requests_authenticated_read'
  ) then
    create policy inquiry_intelligence_requests_authenticated_read
      on public.inquiry_intelligence_requests
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
      and tablename = 'inquiry_product_classifications'
      and policyname = 'inquiry_product_classifications_authenticated_read'
  ) then
    create policy inquiry_product_classifications_authenticated_read
      on public.inquiry_product_classifications
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
      and tablename = 'inquiry_missing_information'
      and policyname = 'inquiry_missing_information_authenticated_read'
  ) then
    create policy inquiry_missing_information_authenticated_read
      on public.inquiry_missing_information
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
      and tablename = 'inquiry_quotation_readiness'
      and policyname = 'inquiry_quotation_readiness_authenticated_read'
  ) then
    create policy inquiry_quotation_readiness_authenticated_read
      on public.inquiry_quotation_readiness
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
      and tablename = 'inquiry_supplier_rfq_requirements'
      and policyname = 'inquiry_supplier_rfq_requirements_authenticated_read'
  ) then
    create policy inquiry_supplier_rfq_requirements_authenticated_read
      on public.inquiry_supplier_rfq_requirements
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
      and tablename = 'inquiry_reply_drafts'
      and policyname = 'inquiry_reply_drafts_authenticated_read'
  ) then
    create policy inquiry_reply_drafts_authenticated_read
      on public.inquiry_reply_drafts
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
      and tablename = 'inquiry_intelligence_reviews'
      and policyname = 'inquiry_intelligence_reviews_authenticated_read'
  ) then
    create policy inquiry_intelligence_reviews_authenticated_read
      on public.inquiry_intelligence_reviews
      for select
      to authenticated
      using (true);
  end if;
end $$;
