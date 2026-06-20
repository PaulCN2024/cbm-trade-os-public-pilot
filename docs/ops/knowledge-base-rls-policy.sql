-- CBM Trade OS Knowledge Base RLS read policy pack
-- Scope: protect public.knowledge_* tables for authenticated read-only access.
-- Safety: no write policy and no business execution.

alter table public.knowledge_categories enable row level security;
alter table public.knowledge_items enable row level security;
alter table public.knowledge_sources enable row level security;
alter table public.knowledge_links enable row level security;
alter table public.knowledge_reviews enable row level security;
alter table public.knowledge_versions enable row level security;
alter table public.knowledge_usage_logs enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'knowledge_categories'
      and policyname = 'knowledge_categories_authenticated_read'
  ) then
    create policy knowledge_categories_authenticated_read
    on public.knowledge_categories
    for select
    to authenticated
    using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'knowledge_items'
      and policyname = 'knowledge_items_authenticated_read'
  ) then
    create policy knowledge_items_authenticated_read
    on public.knowledge_items
    for select
    to authenticated
    using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'knowledge_sources'
      and policyname = 'knowledge_sources_authenticated_read'
  ) then
    create policy knowledge_sources_authenticated_read
    on public.knowledge_sources
    for select
    to authenticated
    using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'knowledge_links'
      and policyname = 'knowledge_links_authenticated_read'
  ) then
    create policy knowledge_links_authenticated_read
    on public.knowledge_links
    for select
    to authenticated
    using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'knowledge_reviews'
      and policyname = 'knowledge_reviews_authenticated_read'
  ) then
    create policy knowledge_reviews_authenticated_read
    on public.knowledge_reviews
    for select
    to authenticated
    using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'knowledge_versions'
      and policyname = 'knowledge_versions_authenticated_read'
  ) then
    create policy knowledge_versions_authenticated_read
    on public.knowledge_versions
    for select
    to authenticated
    using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'knowledge_usage_logs'
      and policyname = 'knowledge_usage_logs_authenticated_read'
  ) then
    create policy knowledge_usage_logs_authenticated_read
    on public.knowledge_usage_logs
    for select
    to authenticated
    using (true);
  end if;
end $$;

