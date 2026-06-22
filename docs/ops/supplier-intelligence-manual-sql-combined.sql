-- AI Supplier Intelligence read-only foundation.
-- Approval-gated SQL execution. Review before running.
-- No destructive SQL expected.
-- This pack creates new supplier intelligence tables, inserts fictional DEMO data,
-- enables RLS, and creates authenticated SELECT-only policies.

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

-- DEMO SEED DATA

-- AI Supplier Intelligence DEMO seed data.
-- Fictional internal review examples only.
-- This seed does not contact suppliers, create RFQs, create quotations,
-- call AI providers, mutate existing business records, or execute business actions.

insert into supplier_intelligence_requests (
  id,
  source_type,
  source_entity_id,
  inquiry_intelligence_request_id,
  inquiry_id,
  customer_id,
  inquiry_title,
  product_category,
  product_family,
  material,
  required_supplier_type,
  country_or_region_preference,
  priority_level,
  risk_level,
  confidence_level,
  request_status,
  requested_by,
  requested_at,
  created_at,
  updated_at
) values
(
  '31000000-0000-4000-8000-000000000001',
  'inquiry_intelligence',
  null,
  null,
  null,
  null,
  'Peru Light Steel Keel Inquiry',
  'Light Steel Keel',
  'Drywall galvanized steel profiles',
  'galvanized steel',
  'galvanized steel profile roll-forming factory',
  'China / export-ready supplier',
  'high',
  'medium',
  'medium',
  'supplier_confirm_needed',
  'demo_operator',
  '2026-06-22 10:00:00+00',
  '2026-06-22 10:00:00+00',
  '2026-06-22 10:00:00+00'
),
(
  '31000000-0000-4000-8000-000000000002',
  'inquiry_intelligence',
  null,
  null,
  null,
  null,
  'Indonesia Ceiling System Inquiry',
  'Ceiling System',
  'Aluminum ceiling / light steel keel',
  'aluminum / galvanized steel',
  'aluminum ceiling / light steel keel system supplier',
  'China / Southeast Asia export experience',
  'medium',
  'medium',
  'medium',
  'supplier_confirm_needed',
  'demo_operator',
  '2026-06-22 10:15:00+00',
  '2026-06-22 10:15:00+00',
  '2026-06-22 10:15:00+00'
),
(
  '31000000-0000-4000-8000-000000000003',
  'inquiry_intelligence',
  null,
  null,
  null,
  null,
  'Ecuador Window Measurement Issue',
  'Aluminum Window/Door',
  'project window/door measurement and installation',
  'aluminum + glass',
  'aluminum window factory / installation consultant',
  'China / technical review partner',
  'medium',
  'medium',
  'low',
  'risk_hold',
  'demo_operator',
  '2026-06-22 10:30:00+00',
  '2026-06-22 10:30:00+00',
  '2026-06-22 10:30:00+00'
)
on conflict (id) do nothing;

insert into supplier_capability_matches (
  id,
  supplier_intelligence_request_id,
  supplier_id,
  supplier_name,
  capability_type,
  product_category,
  material,
  process,
  match_level,
  match_reason,
  confidence_level,
  risk_level,
  created_at
) values
(
  '32000000-0000-4000-8000-000000000001',
  '31000000-0000-4000-8000-000000000001',
  null,
  'DEMO Steel Profile Factory',
  'roll forming',
  'Light Steel Keel',
  'galvanized steel',
  'roll forming / cutting / packing',
  'possible_match',
  'Product and process appear aligned, but thickness, unit weight and loading quantity need supplier confirmation.',
  'medium',
  'medium',
  '2026-06-22 10:00:00+00'
),
(
  '32000000-0000-4000-8000-000000000002',
  '31000000-0000-4000-8000-000000000002',
  null,
  'DEMO Ceiling System Supplier',
  'ceiling system production',
  'Ceiling System',
  'aluminum / galvanized steel',
  'extrusion / roll forming / surface treatment',
  'needs_confirm',
  'Broad ceiling system capability appears relevant, but drawing, material option, thickness and packing require confirmation.',
  'medium',
  'medium',
  '2026-06-22 10:15:00+00'
),
(
  '32000000-0000-4000-8000-000000000003',
  '31000000-0000-4000-8000-000000000003',
  null,
  'DEMO Window Fabrication Partner',
  'aluminum window fabrication',
  'Aluminum Window/Door',
  'aluminum + glass',
  'profile cutting / assembly / glazing',
  'not_ready',
  'Window project requires drawing review and site measurement responsibility clarification before supplier RFQ.',
  'low',
  'medium',
  '2026-06-22 10:30:00+00'
)
on conflict (id) do nothing;

insert into supplier_questions (
  id,
  supplier_intelligence_request_id,
  question_type,
  question_text,
  required_level,
  status,
  reason,
  created_at
) values
(
  '33000000-0000-4000-8000-000000000001',
  '31000000-0000-4000-8000-000000000001',
  'thickness',
  'What thickness options are available for this drywall profile?',
  'required',
  'missing',
  'Thickness affects weight, cost and production feasibility.',
  '2026-06-22 10:00:00+00'
),
(
  '33000000-0000-4000-8000-000000000002',
  '31000000-0000-4000-8000-000000000001',
  'unit_weight',
  'What is the unit weight per meter for each thickness option?',
  'required',
  'missing',
  'Unit weight is required before safe quote review.',
  '2026-06-22 10:01:00+00'
),
(
  '33000000-0000-4000-8000-000000000003',
  '31000000-0000-4000-8000-000000000001',
  'MOQ',
  'What is the MOQ for each profile type?',
  'recommended',
  'missing',
  'MOQ may affect supplier fit and quote readiness.',
  '2026-06-22 10:02:00+00'
),
(
  '33000000-0000-4000-8000-000000000004',
  '31000000-0000-4000-8000-000000000001',
  'packing',
  'What packing method is recommended for export loading?',
  'recommended',
  'missing',
  'Packing affects loading quantity and risk.',
  '2026-06-22 10:03:00+00'
),
(
  '33000000-0000-4000-8000-000000000005',
  '31000000-0000-4000-8000-000000000001',
  'loading_quantity',
  'How many meters can fit in one 20GP container?',
  'recommended',
  'missing',
  'Loading quantity is needed for supplier confirmation and freight assumptions.',
  '2026-06-22 10:04:00+00'
),
(
  '33000000-0000-4000-8000-000000000006',
  '31000000-0000-4000-8000-000000000001',
  'FOB_cost',
  'Please provide preliminary FOB cost for internal review only.',
  'recommended',
  'missing',
  'Cost is for Paul review and must not be treated as customer quotation.',
  '2026-06-22 10:05:00+00'
),
(
  '33000000-0000-4000-8000-000000000007',
  '31000000-0000-4000-8000-000000000001',
  'lead_time',
  'What is the estimated production lead time after final specification confirmation?',
  'recommended',
  'missing',
  'Lead time must not be promised before supplier confirmation and Paul review.',
  '2026-06-22 10:06:00+00'
),
(
  '33000000-0000-4000-8000-000000000008',
  '31000000-0000-4000-8000-000000000002',
  'drawing_confirmation',
  'Can you review the ceiling system drawing or option selection?',
  'required',
  'needs_review',
  'System option must be confirmed before supplier fit improves.',
  '2026-06-22 10:15:00+00'
),
(
  '33000000-0000-4000-8000-000000000009',
  '31000000-0000-4000-8000-000000000002',
  'material',
  'Which material option is suitable for this ceiling system?',
  'required',
  'missing',
  'Aluminum and galvanized steel options may require different suppliers.',
  '2026-06-22 10:16:00+00'
),
(
  '33000000-0000-4000-8000-000000000010',
  '31000000-0000-4000-8000-000000000002',
  'thickness',
  'What panel or profile thickness is available?',
  'required',
  'missing',
  'Thickness affects cost basis and supplier fit.',
  '2026-06-22 10:17:00+00'
),
(
  '33000000-0000-4000-8000-000000000011',
  '31000000-0000-4000-8000-000000000002',
  'packing',
  'What packing method is suitable for export shipment?',
  'recommended',
  'missing',
  'Packing and loading are not yet known.',
  '2026-06-22 10:18:00+00'
),
(
  '33000000-0000-4000-8000-000000000012',
  '31000000-0000-4000-8000-000000000002',
  'lead_time',
  'What is the estimated lead time after final option confirmation?',
  'recommended',
  'missing',
  'Lead time is needed for Paul review only.',
  '2026-06-22 10:19:00+00'
),
(
  '33000000-0000-4000-8000-000000000013',
  '31000000-0000-4000-8000-000000000003',
  'drawing_confirmation',
  'What drawings or measurements are required before supplier review?',
  'required',
  'missing',
  'Window and door dimensions cannot be reviewed safely without drawings.',
  '2026-06-22 10:30:00+00'
),
(
  '33000000-0000-4000-8000-000000000014',
  '31000000-0000-4000-8000-000000000003',
  'capability',
  'Can you review this as supply-only, or would installation advice be required?',
  'required',
  'needs_review',
  'Responsibility boundary must be clarified before supplier matching.',
  '2026-06-22 10:31:00+00'
),
(
  '33000000-0000-4000-8000-000000000015',
  '31000000-0000-4000-8000-000000000003',
  'other',
  'Who is responsible for site measurement and final size confirmation?',
  'required',
  'missing',
  'Site measurement responsibility can create business and quality risk.',
  '2026-06-22 10:32:00+00'
)
on conflict (id) do nothing;

insert into supplier_rfq_readiness (
  id,
  supplier_intelligence_request_id,
  readiness_status,
  can_prepare_rfq_draft,
  can_send_rfq,
  blockers,
  assumptions_needed,
  risk_if_sent_now,
  confidence_level,
  created_at
) values
(
  '34000000-0000-4000-8000-000000000001',
  '31000000-0000-4000-8000-000000000001',
  'rfq_draft_possible',
  true,
  false,
  'Thickness, unit weight, packing and loading quantity are not confirmed.',
  'Draft may ask for supplier confirmation only. It must not include customer commitment.',
  'Wrong spec, wrong supplier, wrong cost basis, or unsafe customer quotation.',
  'medium',
  '2026-06-22 10:00:00+00'
),
(
  '34000000-0000-4000-8000-000000000002',
  '31000000-0000-4000-8000-000000000002',
  'blocked_by_missing_info',
  true,
  false,
  'Drawing, material option and thickness are not confirmed.',
  'Draft should ask for option clarification and supplier capability only.',
  'Wrong ceiling system option, unsuitable material or unclear packing/loading.',
  'medium',
  '2026-06-22 10:15:00+00'
),
(
  '34000000-0000-4000-8000-000000000003',
  '31000000-0000-4000-8000-000000000003',
  'not_ready',
  false,
  false,
  'Drawing, measurements and installation responsibility are unclear.',
  'Ask customer or Paul to clarify responsibility boundary before supplier RFQ draft.',
  'Wrong size, unclear site responsibility, or unsafe production/installation expectation.',
  'low',
  '2026-06-22 10:30:00+00'
)
on conflict (id) do nothing;

insert into supplier_rfq_drafts (
  id,
  supplier_intelligence_request_id,
  language,
  channel,
  draft_subject,
  draft_body,
  draft_status,
  safety_notes,
  requires_approval,
  created_at,
  updated_at
) values
(
  '35000000-0000-4000-8000-000000000001',
  '31000000-0000-4000-8000-000000000001',
  'en',
  'email',
  'RFQ for galvanized drywall steel profiles - preliminary review',
  'Dear Supplier,\n\nPlease help confirm whether you can produce galvanized drywall steel profiles for preliminary review. Kindly advise available thickness, unit weight per meter, MOQ, packing method, 20GP loading quantity, preliminary FOB cost, and estimated production lead time.\n\nThis is for preliminary evaluation only. Final specification and any order decision will be confirmed later.\n\nBest regards,\nPaul',
  'draft',
  'Draft only. Not sent. Human approval required before supplier contact.',
  true,
  '2026-06-22 10:00:00+00',
  '2026-06-22 10:00:00+00'
),
(
  '35000000-0000-4000-8000-000000000002',
  '31000000-0000-4000-8000-000000000002',
  'en',
  'email',
  'Ceiling system capability clarification - preliminary review',
  'Dear Supplier,\n\nPlease help review whether you can support an aluminum ceiling / light steel keel system inquiry. We need to confirm suitable system option, material, thickness, packing method, MOQ and estimated lead time before any quotation discussion.\n\nThis is a preliminary capability check only. Final specification and any order decision will be confirmed later.\n\nBest regards,\nPaul',
  'draft',
  'Draft only. Not sent. Human approval required before supplier contact.',
  true,
  '2026-06-22 10:15:00+00',
  '2026-06-22 10:15:00+00'
),
(
  '35000000-0000-4000-8000-000000000003',
  '31000000-0000-4000-8000-000000000003',
  'mixed',
  'email',
  'Window project clarification - not ready for RFQ',
  'Dear Supplier,\n\nThis draft is only a placeholder for later review. The window project needs drawing, measurement and responsibility clarification before any supplier RFQ can be sent.\n\nPreliminary questions may include required drawings, profile system options, supply-only boundary, and whether installation advice is involved.\n\nThis has not been approved for sending.\n\nBest regards,\nPaul',
  'needs_review',
  'Draft only. Not sent. RFQ is not ready until Paul confirms responsibility boundary.',
  true,
  '2026-06-22 10:30:00+00',
  '2026-06-22 10:30:00+00'
)
on conflict (id) do nothing;

insert into supplier_intelligence_reviews (
  id,
  supplier_intelligence_request_id,
  reviewer,
  review_status,
  decision,
  reviewer_notes,
  approved_next_action,
  reviewed_at,
  created_at
) values
(
  '36000000-0000-4000-8000-000000000001',
  '31000000-0000-4000-8000-000000000001',
  'Paul',
  'pending',
  null,
  'Demo review pending. Supplier contact is not approved.',
  null,
  null,
  '2026-06-22 10:00:00+00'
),
(
  '36000000-0000-4000-8000-000000000002',
  '31000000-0000-4000-8000-000000000002',
  'Paul',
  'pending',
  null,
  'Demo review pending. Customer option and supplier questions need review.',
  null,
  null,
  '2026-06-22 10:15:00+00'
),
(
  '36000000-0000-4000-8000-000000000003',
  '31000000-0000-4000-8000-000000000003',
  'Paul',
  'pending',
  null,
  'Demo review pending. Responsibility boundary blocks supplier RFQ.',
  null,
  null,
  '2026-06-22 10:30:00+00'
)
on conflict (id) do nothing;


-- VERIFICATION QUERIES

select count(*) as supplier_intelligence_requests_count
from supplier_intelligence_requests;

select count(*) as supplier_capability_matches_count
from supplier_capability_matches;

select count(*) as supplier_questions_count
from supplier_questions;

select count(*) as supplier_rfq_readiness_count
from supplier_rfq_readiness;

select count(*) as supplier_rfq_drafts_count
from supplier_rfq_drafts;

select count(*) as supplier_intelligence_reviews_count
from supplier_intelligence_reviews;

select request_status, count(*)
from supplier_intelligence_requests
group by request_status
order by request_status;

select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'supplier_intelligence_requests',
    'supplier_capability_matches',
    'supplier_questions',
    'supplier_rfq_readiness',
    'supplier_rfq_drafts',
    'supplier_intelligence_reviews'
  )
order by tablename;

select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename in (
    'supplier_intelligence_requests',
    'supplier_capability_matches',
    'supplier_questions',
    'supplier_rfq_readiness',
    'supplier_rfq_drafts',
    'supplier_intelligence_reviews'
  )
order by tablename, policyname;
