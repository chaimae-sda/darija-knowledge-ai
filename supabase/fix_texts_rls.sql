-- Repair policies for "new row violates row-level security policy for table texts".
-- Run this in Supabase SQL Editor if scans/uploads still fail after restarting Vite.

alter table public.texts enable row level security;

alter table public.texts
  alter column owner_id set default auth.uid();

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.texts to authenticated;
grant select, insert, update on public.profiles to authenticated;

drop policy if exists "texts_select_own" on public.texts;
create policy "texts_select_own"
on public.texts
for select
to authenticated
using (auth.uid() = owner_id);

drop policy if exists "texts_insert_own" on public.texts;
create policy "texts_insert_own"
on public.texts
for insert
to authenticated
with check (auth.uid() = owner_id);

drop policy if exists "texts_update_own" on public.texts;
create policy "texts_update_own"
on public.texts
for update
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "texts_delete_own" on public.texts;
create policy "texts_delete_own"
on public.texts
for delete
to authenticated
using (auth.uid() = owner_id);
