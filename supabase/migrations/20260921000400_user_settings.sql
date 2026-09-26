-- FitPip / per-user settings (one row per user).
-- Paste into the Supabase SQL Editor and run. Safe to re-run.

create table if not exists public.user_settings (
  user_id     uuid primary key default auth.uid()
                references auth.users (id) on delete cascade,
  weight_unit text not null default 'lb' check (weight_unit in ('kg', 'lb')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists user_settings_set_updated_at on public.user_settings;
create trigger user_settings_set_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();

alter table public.user_settings enable row level security;

revoke all on public.user_settings from anon;
grant select, insert, update, delete on public.user_settings to authenticated;

drop policy if exists "user_settings_owner_all" on public.user_settings;
create policy "user_settings_owner_all" on public.user_settings
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
