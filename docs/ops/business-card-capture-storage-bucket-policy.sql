-- Business Card Capture Storage Bucket And Policy SQL Pack
-- Manual review/execution pack only.
-- Target Supabase project: PaulCN2024's Project / zswtekjtkyvfagbudkia.
--
-- This SQL prepares the future private bucket for business card image sources.
-- Codex must not execute this SQL without Paul's explicit approval.
--
-- Safety scope:
-- - private bucket only
-- - authenticated read/upload only
-- - no public access
-- - no browser privileged backend credential
-- - no real upload API or UI behavior
-- - no OCR, image parsing, customer creation, sending, or business execution

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'business-card-captures',
  'business-card-captures',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']::text[];

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'business_card_captures_authenticated_read'
  ) then
    create policy business_card_captures_authenticated_read
    on storage.objects
    for select
    to authenticated
    using (bucket_id = 'business-card-captures');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'business_card_captures_authenticated_upload'
  ) then
    create policy business_card_captures_authenticated_upload
    on storage.objects
    for insert
    to authenticated
    with check (bucket_id = 'business-card-captures');
  end if;
end
$$;
