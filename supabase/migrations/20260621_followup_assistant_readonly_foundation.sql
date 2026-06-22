-- AI Follow-up Assistant read-only foundation.
-- Creates new followup_* tables only.
-- This foundation does not create tasks, call AI providers, send messages,
-- mutate customer/inquiry records, or trigger quotation/PI/order/payment/
-- production/shipment actions.
-- RLS is enabled with authenticated SELECT-only policies.

create table if not exists public.followup_candidates (
  id uuid primary key default gen_random_uuid(),
  source_type text not null default 'manual_note',
  source_entity_id uuid,
  customer_id uuid,
  inquiry_id uuid,
  verification_request_id uuid,
  customer_name text,
  company_name text,
  contact_name text,
  country text,
  language text not null default 'en',
  followup_reason text,
  current_stage text not null default 'first_contact',
  priority_level text not null default 'medium',
  risk_level text not null default 'medium',
  confidence_level text not null default 'medium',
  status text not null default 'needs_review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint followup_candidates_source_type_check
    check (source_type in ('customer', 'inquiry', 'customer_verification', 'business_card', 'quotation', 'manual_note')),
  constraint followup_candidates_language_check
    check (language in ('zh', 'en', 'es', 'mixed')),
  constraint followup_candidates_current_stage_check
    check (current_stage in ('first_contact', 'information_request', 'quotation_pending', 'quotation_sent', 'sample_discussion', 'negotiation', 'waiting_response', 'dormant', 'risk_hold', 'closed')),
  constraint followup_candidates_priority_level_check
    check (priority_level in ('low', 'medium', 'high')),
  constraint followup_candidates_risk_level_check
    check (risk_level in ('low', 'medium', 'high')),
  constraint followup_candidates_confidence_level_check
    check (confidence_level in ('low', 'medium', 'high')),
  constraint followup_candidates_status_check
    check (status in ('draft', 'needs_review', 'approved_task', 'waiting', 'completed', 'skipped', 'archived'))
);

create table if not exists public.followup_missing_information (
  id uuid primary key default gen_random_uuid(),
  followup_candidate_id uuid not null references public.followup_candidates(id),
  info_type text not null,
  info_label text,
  required_level text not null default 'recommended',
  status text not null default 'missing',
  notes text,
  created_at timestamptz not null default now(),
  constraint followup_missing_information_info_type_check
    check (info_type in ('company_website', 'project_location', 'product_specification', 'quantity', 'target_price', 'buyer_role', 'installation_responsibility', 'drawings_or_photos', 'delivery_port', 'payment_terms', 'timeline', 'other')),
  constraint followup_missing_information_required_level_check
    check (required_level in ('required', 'recommended', 'optional')),
  constraint followup_missing_information_status_check
    check (status in ('missing', 'needs_review', 'confirmed', 'not_required'))
);

create table if not exists public.followup_recommendations (
  id uuid primary key default gen_random_uuid(),
  followup_candidate_id uuid not null references public.followup_candidates(id),
  recommended_action text not null,
  recommendation_reason text,
  suggested_timing text,
  priority_level text not null default 'medium',
  risk_level text not null default 'medium',
  confidence_level text not null default 'medium',
  created_at timestamptz not null default now(),
  constraint followup_recommendations_recommended_action_check
    check (recommended_action in ('request_more_information', 'send_product_intro', 'prepare_quote_after_missing_info', 'follow_up_quotation', 'ask_project_detail', 'hold_due_to_risk', 'mark_low_priority', 'wait')),
  constraint followup_recommendations_priority_level_check
    check (priority_level in ('low', 'medium', 'high')),
  constraint followup_recommendations_risk_level_check
    check (risk_level in ('low', 'medium', 'high')),
  constraint followup_recommendations_confidence_level_check
    check (confidence_level in ('low', 'medium', 'high'))
);

create table if not exists public.followup_message_drafts (
  id uuid primary key default gen_random_uuid(),
  followup_candidate_id uuid not null references public.followup_candidates(id),
  language text not null default 'en',
  channel text not null default 'email',
  tone text not null default 'professional',
  draft_subject text,
  draft_body text,
  draft_status text not null default 'draft',
  safety_notes text,
  requires_approval boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint followup_message_drafts_language_check
    check (language in ('zh', 'en', 'es', 'mixed')),
  constraint followup_message_drafts_channel_check
    check (channel in ('email', 'whatsapp', 'linkedin', 'phone_script', 'other')),
  constraint followup_message_drafts_draft_status_check
    check (draft_status in ('draft', 'needs_review', 'approved', 'rejected', 'archived'))
);

create table if not exists public.followup_reviews (
  id uuid primary key default gen_random_uuid(),
  followup_candidate_id uuid not null references public.followup_candidates(id),
  reviewer text,
  review_status text not null default 'pending',
  decision text,
  reviewer_notes text,
  approved_next_action text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint followup_reviews_review_status_check
    check (review_status in ('pending', 'in_review', 'completed', 'rejected', 'archived')),
  constraint followup_reviews_decision_check
    check (decision is null or decision in ('approve_task', 'revise_message', 'request_more_context', 'skip', 'hold', 'archive'))
);

create index if not exists followup_candidates_source_type_idx
  on public.followup_candidates(source_type);
create index if not exists followup_candidates_status_idx
  on public.followup_candidates(status);
create index if not exists followup_candidates_priority_level_idx
  on public.followup_candidates(priority_level);
create index if not exists followup_candidates_risk_level_idx
  on public.followup_candidates(risk_level);
create index if not exists followup_candidates_current_stage_idx
  on public.followup_candidates(current_stage);
create index if not exists followup_candidates_customer_id_idx
  on public.followup_candidates(customer_id);
create index if not exists followup_candidates_inquiry_id_idx
  on public.followup_candidates(inquiry_id);
create index if not exists followup_candidates_verification_request_id_idx
  on public.followup_candidates(verification_request_id);

create index if not exists followup_missing_information_candidate_id_idx
  on public.followup_missing_information(followup_candidate_id);
create index if not exists followup_missing_information_info_type_idx
  on public.followup_missing_information(info_type);
create index if not exists followup_missing_information_status_idx
  on public.followup_missing_information(status);

create index if not exists followup_recommendations_candidate_id_idx
  on public.followup_recommendations(followup_candidate_id);
create index if not exists followup_recommendations_recommended_action_idx
  on public.followup_recommendations(recommended_action);

create index if not exists followup_message_drafts_candidate_id_idx
  on public.followup_message_drafts(followup_candidate_id);
create index if not exists followup_message_drafts_draft_status_idx
  on public.followup_message_drafts(draft_status);
create index if not exists followup_message_drafts_channel_idx
  on public.followup_message_drafts(channel);

create index if not exists followup_reviews_candidate_id_idx
  on public.followup_reviews(followup_candidate_id);
create index if not exists followup_reviews_review_status_idx
  on public.followup_reviews(review_status);
create index if not exists followup_reviews_decision_idx
  on public.followup_reviews(decision);

alter table public.followup_candidates enable row level security;
alter table public.followup_missing_information enable row level security;
alter table public.followup_recommendations enable row level security;
alter table public.followup_message_drafts enable row level security;
alter table public.followup_reviews enable row level security;

create policy followup_candidates_authenticated_read
  on public.followup_candidates
  for select
  to authenticated
  using (true);

create policy followup_missing_information_authenticated_read
  on public.followup_missing_information
  for select
  to authenticated
  using (true);

create policy followup_recommendations_authenticated_read
  on public.followup_recommendations
  for select
  to authenticated
  using (true);

create policy followup_message_drafts_authenticated_read
  on public.followup_message_drafts
  for select
  to authenticated
  using (true);

create policy followup_reviews_authenticated_read
  on public.followup_reviews
  for select
  to authenticated
  using (true);
