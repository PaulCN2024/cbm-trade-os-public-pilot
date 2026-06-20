-- CBM Trade OS Knowledge Base Read-only Foundation
-- Scope: create new knowledge_* tables and indexes for a read-only trial foundation.
-- Safety: no destructive statements, no existing production table changes, no RAG/vector/embedding behavior, no business execution.

create table if not exists public.knowledge_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_zh text not null,
  name_en text not null,
  description text,
  parent_category_id uuid references public.knowledge_categories(id),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.knowledge_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category_id uuid references public.knowledge_categories(id),
  subcategory text,
  language text not null default 'zh',
  summary text not null,
  content text,
  source_type text not null,
  source_reference text,
  confidence_level text not null default 'medium',
  human_verified boolean not null default false,
  verification_status text not null default 'needs_review',
  risk_level text not null default 'medium',
  visibility_scope text not null default 'internal_only',
  effective_from date,
  expires_at date,
  owner_name text,
  tags text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint knowledge_items_language_check check (language in ('zh', 'en', 'es', 'mixed')),
  constraint knowledge_items_confidence_level_check check (confidence_level in ('low', 'medium', 'high')),
  constraint knowledge_items_verification_status_check check (verification_status in ('draft', 'needs_review', 'verified', 'outdated', 'archived')),
  constraint knowledge_items_risk_level_check check (risk_level in ('low', 'medium', 'high')),
  constraint knowledge_items_visibility_scope_check check (visibility_scope in ('internal_only', 'ai_reference_only', 'customer_safe_after_review', 'confidential'))
);

create table if not exists public.knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  knowledge_item_id uuid not null references public.knowledge_items(id),
  source_type text not null,
  source_title text not null,
  source_url text,
  source_file_id uuid,
  source_notes text,
  captured_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.knowledge_links (
  id uuid primary key default gen_random_uuid(),
  knowledge_item_id uuid not null references public.knowledge_items(id),
  linked_entity_type text not null,
  linked_entity_id uuid,
  linked_entity_label text,
  relationship_type text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.knowledge_reviews (
  id uuid primary key default gen_random_uuid(),
  knowledge_item_id uuid not null references public.knowledge_items(id),
  review_status text not null default 'needs_review',
  reviewer_name text,
  review_notes text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint knowledge_reviews_review_status_check check (review_status in ('draft', 'needs_review', 'verified', 'outdated', 'archived'))
);

create table if not exists public.knowledge_versions (
  id uuid primary key default gen_random_uuid(),
  knowledge_item_id uuid not null references public.knowledge_items(id),
  version_number integer not null,
  title text not null,
  summary text not null,
  content text,
  change_reason text,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.knowledge_usage_logs (
  id uuid primary key default gen_random_uuid(),
  knowledge_item_id uuid not null references public.knowledge_items(id),
  used_by_module text not null,
  used_for text not null,
  output_type text,
  user_confirmed boolean,
  created_at timestamptz not null default now()
);

create index if not exists idx_knowledge_items_category_id on public.knowledge_items(category_id);
create index if not exists idx_knowledge_items_language on public.knowledge_items(language);
create index if not exists idx_knowledge_items_verification_status on public.knowledge_items(verification_status);
create index if not exists idx_knowledge_items_risk_level on public.knowledge_items(risk_level);
create index if not exists idx_knowledge_items_human_verified on public.knowledge_items(human_verified);
create index if not exists idx_knowledge_items_source_type on public.knowledge_items(source_type);
create index if not exists idx_knowledge_items_expires_at on public.knowledge_items(expires_at);
create index if not exists idx_knowledge_sources_knowledge_item_id on public.knowledge_sources(knowledge_item_id);
create index if not exists idx_knowledge_links_knowledge_item_id on public.knowledge_links(knowledge_item_id);
create index if not exists idx_knowledge_links_entity on public.knowledge_links(linked_entity_type, linked_entity_id);
create index if not exists idx_knowledge_reviews_knowledge_item_id on public.knowledge_reviews(knowledge_item_id);
create index if not exists idx_knowledge_versions_knowledge_item_id on public.knowledge_versions(knowledge_item_id);
create index if not exists idx_knowledge_usage_logs_knowledge_item_id on public.knowledge_usage_logs(knowledge_item_id);
