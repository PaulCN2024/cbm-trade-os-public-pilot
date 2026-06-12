-- CBM Trade OS Phase 3B: Public Inquiry Gateway + Basic Admin Auth
-- Public inquiry inserts are performed by server-side API with a server-only key.
-- Admin reads require Supabase Auth. This is intentionally simple for pilot use.
-- TODO before production team use: replace broad authenticated policies with role-based permissions.

drop policy if exists "authenticated users can read customers" on public.customers;
create policy "authenticated users can read customers"
on public.customers for select
to authenticated
using (true);

drop policy if exists "authenticated users can write customers" on public.customers;
create policy "authenticated users can write customers"
on public.customers for all
to authenticated
using (true)
with check (coalesce(owner_id, auth.uid()) = auth.uid());

drop policy if exists "authenticated users can read leads" on public.leads;
create policy "authenticated users can read leads"
on public.leads for select
to authenticated
using (true);

drop policy if exists "authenticated users can write leads" on public.leads;
create policy "authenticated users can write leads"
on public.leads for all
to authenticated
using (true)
with check (coalesce(owner_id, auth.uid()) = auth.uid());

drop policy if exists "authenticated users can read inquiries" on public.inquiries;
create policy "authenticated users can read inquiries"
on public.inquiries for select
to authenticated
using (true);

drop policy if exists "authenticated users can write inquiries" on public.inquiries;
create policy "authenticated users can write inquiries"
on public.inquiries for all
to authenticated
using (true)
with check (coalesce(owner_id, auth.uid()) = auth.uid());

drop policy if exists "authenticated users can read follow_up_tasks" on public.follow_up_tasks;
create policy "authenticated users can read follow_up_tasks"
on public.follow_up_tasks for select
to authenticated
using (true);

drop policy if exists "authenticated users can write follow_up_tasks" on public.follow_up_tasks;
create policy "authenticated users can write follow_up_tasks"
on public.follow_up_tasks for all
to authenticated
using (true)
with check (coalesce(owner_id, auth.uid()) = auth.uid());

drop policy if exists "authenticated users can read attachments" on public.attachments;
create policy "authenticated users can read attachments"
on public.attachments for select
to authenticated
using (true);

drop policy if exists "authenticated users can write attachments" on public.attachments;
create policy "authenticated users can write attachments"
on public.attachments for all
to authenticated
using (true)
with check (coalesce(owner_id, auth.uid()) = auth.uid());
