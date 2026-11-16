-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- One row per user holding that user's tracker data.
create table if not exists public.trackers (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.trackers enable row level security;

drop policy if exists "read own tracker"   on public.trackers;
drop policy if exists "insert own tracker" on public.trackers;
drop policy if exists "update own tracker" on public.trackers;
drop policy if exists "delete own tracker" on public.trackers;

create policy "read own tracker"   on public.trackers for select using (auth.uid() = user_id);
create policy "insert own tracker" on public.trackers for insert with check (auth.uid() = user_id);
create policy "update own tracker" on public.trackers for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own tracker" on public.trackers for delete using (auth.uid() = user_id);

-- 3D model storage: each signed-in user can only read and write files in their own folder (models/<user id>/...)
insert into storage.buckets (id, name, public, file_size_limit)
values ('models', 'models', false, 52428800)
on conflict (id) do nothing;

create policy "models: read own"   on storage.objects for select to authenticated
  using (bucket_id = 'models' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "models: add own"    on storage.objects for insert to authenticated
  with check (bucket_id = 'models' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "models: change own" on storage.objects for update to authenticated
  using (bucket_id = 'models' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "models: remove own" on storage.objects for delete to authenticated
  using (bucket_id = 'models' and (storage.foldername(name))[1] = auth.uid()::text);
