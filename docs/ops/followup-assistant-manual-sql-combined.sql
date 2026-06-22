-- AI Follow-up Assistant read-only foundation.
-- Approval-gated SQL execution.
-- Review before running.
-- No destructive SQL expected.

-- MIGRATION SQL

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

-- DEMO SEED DATA

-- AI Follow-up Assistant fictional DEMO seed data.
-- Inserts preview-only follow-up records into followup_* tables.
-- Does not create real tasks, send messages, call AI providers, mutate
-- customers/inquiries, or trigger quotation/PI/order/payment/production/
-- shipment actions.

insert into public.followup_candidates (
  id,
  source_type,
  source_entity_id,
  customer_name,
  company_name,
  contact_name,
  country,
  language,
  followup_reason,
  current_stage,
  priority_level,
  risk_level,
  confidence_level,
  status,
  created_at,
  updated_at
) values
  (
    '11111111-1111-4111-8111-111111111111',
    'manual_note',
    '21111111-1111-4111-8111-111111111111',
    'Carlos Ramirez',
    'DEMO Facade Solutions',
    'Carlos Ramirez',
    'Peru',
    'en',
    'Missing project location and specifications before any quotation judgment.',
    'information_request',
    'high',
    'medium',
    'medium',
    'needs_review',
    now(),
    now()
  ),
  (
    '11111111-1111-4111-8111-111111111112',
    'customer_verification',
    '21111111-1111-4111-8111-111111111112',
    'Maria Gonzalez',
    'DEMO Construction Importers',
    'Maria Gonzalez',
    'Panama',
    'es',
    'Possible duplicate customer; review identity and company details before follow-up.',
    'risk_hold',
    'medium',
    'medium',
    'medium',
    'needs_review',
    now(),
    now()
  ),
  (
    '11111111-1111-4111-8111-111111111113',
    'business_card',
    '21111111-1111-4111-8111-111111111113',
    'Daniel Wong',
    'DEMO Building Materials Asia',
    'Daniel Wong',
    'Indonesia',
    'en',
    'Dormant or prospecting lead needs website and buyer role before deeper follow-up.',
    'dormant',
    'low',
    'medium',
    'low',
    'draft',
    now(),
    now()
  )
on conflict (id) do nothing;

insert into public.followup_missing_information (
  id,
  followup_candidate_id,
  info_type,
  info_label,
  required_level,
  status,
  notes,
  created_at
) values
  (
    '12111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    'project_location',
    'Project location',
    'required',
    'missing',
    'Needed before checking shipping route, local requirements, or quotation readiness.',
    now()
  ),
  (
    '12111111-1111-4111-8111-111111111112',
    '11111111-1111-4111-8111-111111111111',
    'product_specification',
    'Window/profile specification',
    'required',
    'missing',
    'Ask for drawings, photos, profile series, finish/color, and size details.',
    now()
  ),
  (
    '12111111-1111-4111-8111-111111111113',
    '11111111-1111-4111-8111-111111111111',
    'quantity',
    'Target quantity',
    'recommended',
    'missing',
    'Quantity is needed before any supplier or quotation preparation.',
    now()
  ),
  (
    '12111111-1111-4111-8111-111111111114',
    '11111111-1111-4111-8111-111111111111',
    'buyer_role',
    'Buyer role',
    'recommended',
    'needs_review',
    'Clarify whether the contact is owner, contractor, importer, or purchasing agent.',
    now()
  ),
  (
    '12111111-1111-4111-8111-111111111115',
    '11111111-1111-4111-8111-111111111112',
    'company_website',
    'Company website',
    'recommended',
    'missing',
    'Possible duplicate/customer identity context should be reviewed first.',
    now()
  ),
  (
    '12111111-1111-4111-8111-111111111116',
    '11111111-1111-4111-8111-111111111112',
    'buyer_role',
    'Buyer role',
    'recommended',
    'needs_review',
    'Ask for role and project relation before sharing detailed commercial information.',
    now()
  ),
  (
    '12111111-1111-4111-8111-111111111117',
    '11111111-1111-4111-8111-111111111113',
    'company_website',
    'Company website',
    'required',
    'missing',
    'Needed before deeper business follow-up.',
    now()
  ),
  (
    '12111111-1111-4111-8111-111111111118',
    '11111111-1111-4111-8111-111111111113',
    'buyer_role',
    'Buyer role',
    'required',
    'missing',
    'Clarify decision role and project relevance.',
    now()
  ),
  (
    '12111111-1111-4111-8111-111111111119',
    '11111111-1111-4111-8111-111111111113',
    'project_location',
    'Project location',
    'optional',
    'not_required',
    'Optional until the lead becomes active again.',
    now()
  )
on conflict (id) do nothing;

insert into public.followup_recommendations (
  id,
  followup_candidate_id,
  recommended_action,
  recommendation_reason,
  suggested_timing,
  priority_level,
  risk_level,
  confidence_level,
  created_at
) values
  (
    '13111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    'request_more_information',
    'Project location, product specifications, target quantity, and buyer role are still missing.',
    'within 24 hours',
    'high',
    'medium',
    'medium',
    now()
  ),
  (
    '13111111-1111-4111-8111-111111111112',
    '11111111-1111-4111-8111-111111111112',
    'hold_due_to_risk',
    'Possible duplicate and unclear buyer role should be reviewed before follow-up.',
    'after duplicate review',
    'medium',
    'medium',
    'medium',
    now()
  ),
  (
    '13111111-1111-4111-8111-111111111113',
    '11111111-1111-4111-8111-111111111113',
    'mark_low_priority',
    'Dormant/prospecting lead with low confidence; request basic company context only if useful.',
    '30-60 days or after clarification',
    'low',
    'medium',
    'low',
    now()
  )
on conflict (id) do nothing;

insert into public.followup_message_drafts (
  id,
  followup_candidate_id,
  language,
  channel,
  tone,
  draft_subject,
  draft_body,
  draft_status,
  safety_notes,
  requires_approval,
  created_at,
  updated_at
) values
  (
    '14111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    'en',
    'email',
    'professional',
    'Project details for your aluminum window inquiry',
    'Draft only - not sent - human approval required\n\nHello Carlos,\n\nThank you for your aluminum window inquiry. To review the most suitable solution, could you please share the project location, product specifications or drawings/photos, target quantity, and your role in the project?\n\nWith these details, we can review the requirements more accurately before deciding the next step.\n\nBest regards,\nPaul',
    'draft',
    'Draft only. Not sent. Human approval required before any external message.',
    true,
    now(),
    now()
  ),
  (
    '14111111-1111-4111-8111-111111111112',
    '11111111-1111-4111-8111-111111111112',
    'es',
    'email',
    'professional',
    'Confirmacion de empresa y proyecto',
    'Draft only - not sent - human approval required\n\nHola Maria,\n\nMuchas gracias por su consulta. Para entender mejor su proyecto, podria compartir el sitio web de su empresa y su rol en este proyecto?\n\nCon esta informacion podremos revisar mejor el contexto antes de preparar el siguiente paso.\n\nSaludos,\nPaul',
    'draft',
    'Draft only. Do not mention duplicate risk to the customer. Human approval required.',
    true,
    now(),
    now()
  ),
  (
    '14111111-1111-4111-8111-111111111113',
    '11111111-1111-4111-8111-111111111113',
    'en',
    'email',
    'concise',
    'Checking your aluminum building materials interest',
    'Draft only - not sent - human approval required\n\nHello Daniel,\n\nI wanted to check whether you are still reviewing aluminum building materials for upcoming projects. If convenient, could you share your company website and your role in the purchasing process?\n\nBest regards,\nPaul',
    'draft',
    'Draft only. Low-priority follow-up. Human approval required.',
    true,
    now(),
    now()
  )
on conflict (id) do nothing;

insert into public.followup_reviews (
  id,
  followup_candidate_id,
  reviewer,
  review_status,
  decision,
  reviewer_notes,
  approved_next_action,
  reviewed_at,
  created_at
) values
  (
    '15111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    'Paul',
    'pending',
    null,
    'Pending Paul review before any follow-up action.',
    null,
    null,
    now()
  ),
  (
    '15111111-1111-4111-8111-111111111112',
    '11111111-1111-4111-8111-111111111112',
    'Paul',
    'pending',
    null,
    'Possible duplicate context requires manual review.',
    null,
    null,
    now()
  ),
  (
    '15111111-1111-4111-8111-111111111113',
    '11111111-1111-4111-8111-111111111113',
    'Paul',
    'pending',
    null,
    'Low-confidence dormant lead; review before follow-up.',
    null,
    null,
    now()
  )
on conflict (id) do nothing;

-- VERIFICATION SQL

select count(*) as followup_candidates_count
from public.followup_candidates;

select count(*) as followup_missing_information_count
from public.followup_missing_information;

select count(*) as followup_recommendations_count
from public.followup_recommendations;

select count(*) as followup_message_drafts_count
from public.followup_message_drafts;

select count(*) as followup_reviews_count
from public.followup_reviews;

select status, count(*)
from public.followup_candidates
group by status
order by status;

select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'followup_candidates',
    'followup_missing_information',
    'followup_recommendations',
    'followup_message_drafts',
    'followup_reviews'
  )
order by tablename;

select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename in (
    'followup_candidates',
    'followup_missing_information',
    'followup_recommendations',
    'followup_message_drafts',
    'followup_reviews'
  )
order by tablename, policyname;
