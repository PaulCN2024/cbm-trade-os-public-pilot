-- AI Supplier Intelligence read-only foundation.
-- Approval-gated SQL. Review before running.
-- Creates new supplier intelligence tables only.
-- No supplier contact, no RFQ creation/sending, no AI provider,
-- no quotation, no supplier/customer/inquiry mutation, no business execution.
-- No write policies are created.

create table if not exists supplier_intelligence_requests (
  id uuid primary key default gen_random_uuid(),
  source_type text not null default 'manual_note',
  source_entity_id uuid,
  inquiry_intelligence_request_id uuid,
  inquiry_id uuid,
  customer_id uuid,
  inquiry_title text,
  product_category text,
  product_family text,
  material text,
  required_supplier_type text,
  country_or_region_preference text,
  priority_level text not null default 'medium',
  risk_level text not null default 'medium',
  confidence_level text not null default 'medium',
  request_status text not null default 'pending',
  requested_by text,
  requested_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint supplier_intelligence_requests_source_type_check
    check (source_type in ('inquiry_intelligence', 'inquiry', 'quotation_review', 'manual_note', 'supplier_search', 'product_requirement')),
  constraint supplier_intelligence_requests_priority_level_check
    check (priority_level in ('low', 'medium', 'high')),
  constraint supplier_intelligence_requests_risk_level_check
    check (risk_level in ('low', 'medium', 'high')),
  constraint supplier_intelligence_requests_confidence_level_check
    check (confidence_level in ('low', 'medium', 'high')),
  constraint supplier_intelligence_requests_request_status_check
    check (request_status in ('draft', 'pending', 'matched', 'supplier_confirm_needed', 'rfq_draft_ready', 'risk_hold', 'archived'))
);

create table if not exists supplier_capability_matches (
  id uuid primary key default gen_random_uuid(),
  supplier_intelligence_request_id uuid not null references supplier_intelligence_requests(id),
  supplier_id uuid,
  supplier_name text,
  capability_type text,
  product_category text,
  material text,
  process text,
  match_level text not null default 'possible_match',
  match_reason text,
  confidence_level text not null default 'medium',
  risk_level text not null default 'medium',
  created_at timestamptz not null default now(),
  constraint supplier_capability_matches_match_level_check
    check (match_level in ('strong_match', 'possible_match', 'needs_confirm', 'not_ready', 'risk_hold')),
  constraint supplier_capability_matches_confidence_level_check
    check (confidence_level in ('low', 'medium', 'high')),
  constraint supplier_capability_matches_risk_level_check
    check (risk_level in ('low', 'medium', 'high'))
);

create table if not exists supplier_questions (
  id uuid primary key default gen_random_uuid(),
  supplier_intelligence_request_id uuid not null references supplier_intelligence_requests(id),
  question_type text not null,
  question_text text not null,
  required_level text not null default 'recommended',
  status text not null default 'missing',
  reason text,
  created_at timestamptz not null default now(),
  constraint supplier_questions_question_type_check
    check (question_type in ('capability', 'material', 'thickness', 'unit_weight', 'MOQ', 'price_basis', 'packing', 'loading_quantity', 'FOB_cost', 'lead_time', 'sample', 'surface_treatment', 'drawing_confirmation', 'quality_standard', 'other')),
  constraint supplier_questions_required_level_check
    check (required_level in ('required', 'recommended', 'optional')),
  constraint supplier_questions_status_check
    check (status in ('missing', 'needs_review', 'confirmed', 'not_required'))
);

create table if not exists supplier_rfq_readiness (
  id uuid primary key default gen_random_uuid(),
  supplier_intelligence_request_id uuid not null references supplier_intelligence_requests(id),
  readiness_status text not null default 'not_ready',
  can_prepare_rfq_draft boolean not null default false,
  can_send_rfq boolean not null default false,
  blockers text,
  assumptions_needed text,
  risk_if_sent_now text,
  confidence_level text not null default 'medium',
  created_at timestamptz not null default now(),
  constraint supplier_rfq_readiness_readiness_status_check
    check (readiness_status in ('not_ready', 'rfq_draft_possible', 'ready_for_paul_review', 'blocked_by_missing_info', 'risk_hold')),
  constraint supplier_rfq_readiness_confidence_level_check
    check (confidence_level in ('low', 'medium', 'high')),
  constraint supplier_rfq_readiness_no_send_check
    check (can_send_rfq = false)
);

create table if not exists supplier_rfq_drafts (
  id uuid primary key default gen_random_uuid(),
  supplier_intelligence_request_id uuid not null references supplier_intelligence_requests(id),
  language text not null default 'en',
  channel text not null default 'email',
  draft_subject text,
  draft_body text,
  draft_status text not null default 'draft',
  safety_notes text,
  requires_approval boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint supplier_rfq_drafts_language_check
    check (language in ('zh', 'en', 'es', 'mixed')),
  constraint supplier_rfq_drafts_channel_check
    check (channel in ('email', 'whatsapp', 'wechat', 'phone_script', 'other')),
  constraint supplier_rfq_drafts_draft_status_check
    check (draft_status in ('draft', 'needs_review', 'approved', 'rejected', 'archived')),
  constraint supplier_rfq_drafts_requires_approval_check
    check (requires_approval = true)
);

create table if not exists supplier_intelligence_reviews (
  id uuid primary key default gen_random_uuid(),
  supplier_intelligence_request_id uuid not null references supplier_intelligence_requests(id),
  reviewer text,
  review_status text not null default 'pending',
  decision text,
  reviewer_notes text,
  approved_next_action text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint supplier_intelligence_reviews_review_status_check
    check (review_status in ('pending', 'in_review', 'completed', 'rejected', 'archived')),
  constraint supplier_intelligence_reviews_decision_check
    check (
      decision is null
      or decision in ('request_more_customer_info', 'prepare_rfq_draft', 'approve_rfq_send_later', 'hold_due_to_risk', 'mark_not_ready', 'archive')
    )
);

create index if not exists supplier_intelligence_requests_source_type_idx
  on supplier_intelligence_requests(source_type);
create index if not exists supplier_intelligence_requests_request_status_idx
  on supplier_intelligence_requests(request_status);
create index if not exists supplier_intelligence_requests_priority_level_idx
  on supplier_intelligence_requests(priority_level);
create index if not exists supplier_intelligence_requests_risk_level_idx
  on supplier_intelligence_requests(risk_level);
create index if not exists supplier_intelligence_requests_inquiry_id_idx
  on supplier_intelligence_requests(inquiry_id);
create index if not exists supplier_intelligence_requests_customer_id_idx
  on supplier_intelligence_requests(customer_id);
create index if not exists supplier_intelligence_requests_inquiry_intelligence_request_id_idx
  on supplier_intelligence_requests(inquiry_intelligence_request_id);

create index if not exists supplier_capability_matches_request_idx
  on supplier_capability_matches(supplier_intelligence_request_id);
create index if not exists supplier_capability_matches_supplier_id_idx
  on supplier_capability_matches(supplier_id);
create index if not exists supplier_capability_matches_match_level_idx
  on supplier_capability_matches(match_level);
create index if not exists supplier_capability_matches_product_category_idx
  on supplier_capability_matches(product_category);

create index if not exists supplier_questions_request_idx
  on supplier_questions(supplier_intelligence_request_id);
create index if not exists supplier_questions_question_type_idx
  on supplier_questions(question_type);
create index if not exists supplier_questions_status_idx
  on supplier_questions(status);

create index if not exists supplier_rfq_readiness_request_idx
  on supplier_rfq_readiness(supplier_intelligence_request_id);
create index if not exists supplier_rfq_readiness_status_idx
  on supplier_rfq_readiness(readiness_status);

create index if not exists supplier_rfq_drafts_request_idx
  on supplier_rfq_drafts(supplier_intelligence_request_id);
create index if not exists supplier_rfq_drafts_status_idx
  on supplier_rfq_drafts(draft_status);

create index if not exists supplier_intelligence_reviews_request_idx
  on supplier_intelligence_reviews(supplier_intelligence_request_id);
create index if not exists supplier_intelligence_reviews_status_idx
  on supplier_intelligence_reviews(review_status);
create index if not exists supplier_intelligence_reviews_decision_idx
  on supplier_intelligence_reviews(decision);

alter table supplier_intelligence_requests enable row level security;
alter table supplier_capability_matches enable row level security;
alter table supplier_questions enable row level security;
alter table supplier_rfq_readiness enable row level security;
alter table supplier_rfq_drafts enable row level security;
alter table supplier_intelligence_reviews enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'supplier_intelligence_requests'
      and policyname = 'supplier_intelligence_requests_authenticated_read'
  ) then
    create policy supplier_intelligence_requests_authenticated_read
      on supplier_intelligence_requests
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
      and tablename = 'supplier_capability_matches'
      and policyname = 'supplier_capability_matches_authenticated_read'
  ) then
    create policy supplier_capability_matches_authenticated_read
      on supplier_capability_matches
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
      and tablename = 'supplier_questions'
      and policyname = 'supplier_questions_authenticated_read'
  ) then
    create policy supplier_questions_authenticated_read
      on supplier_questions
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
      and tablename = 'supplier_rfq_readiness'
      and policyname = 'supplier_rfq_readiness_authenticated_read'
  ) then
    create policy supplier_rfq_readiness_authenticated_read
      on supplier_rfq_readiness
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
      and tablename = 'supplier_rfq_drafts'
      and policyname = 'supplier_rfq_drafts_authenticated_read'
  ) then
    create policy supplier_rfq_drafts_authenticated_read
      on supplier_rfq_drafts
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
      and tablename = 'supplier_intelligence_reviews'
      and policyname = 'supplier_intelligence_reviews_authenticated_read'
  ) then
    create policy supplier_intelligence_reviews_authenticated_read
      on supplier_intelligence_reviews
      for select
      to authenticated
      using (true);
  end if;
end $$;
