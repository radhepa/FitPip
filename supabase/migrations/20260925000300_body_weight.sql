-- FitPip / weigh-ins (the scale) and a goal weight.
-- Paste into the Supabase SQL Editor and run. Safe to re-run.
--
-- One weigh-in per day (weighing again the same day replaces it). Each row keeps the unit it was
-- typed in, so switching lb/kg later never changes history; the app converts for display.

create table if not exists public.body_weights (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid()
                references auth.users (id) on delete cascade,
  measured_on date not null,
  weight      numeric(6, 2) not null check (weight > 0 and weight < 2000),
  unit        text not null check (unit in ('kg', 'lb')),
  note        text check (note is null or char_length(note) <= 200),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create unique index if not exists body_weights_user_day_key
  on public.body_weights (user_id, measured_on);

drop trigger if exists body_weights_set_updated_at on public.body_weights;
create trigger body_weights_set_updated_at
  before update on public.body_weights
  for each row execute function public.set_updated_at();

alter table public.body_weights enable row level security;

revoke all on public.body_weights from anon;
grant select, insert, update, delete on public.body_weights to authenticated;

drop policy if exists "body_weights_owner_all" on public.body_weights;
create policy "body_weights_owner_all" on public.body_weights
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Goal weight, stored with its own unit for the same reason.

alter table public.user_settings
  add column if not exists goal_weight numeric(6, 2),
  add column if not exists goal_weight_unit text;

alter table public.user_settings drop constraint if exists user_settings_goal_weight_check;
alter table public.user_settings
  add constraint user_settings_goal_weight_check
  check (
    (goal_weight is null and goal_weight_unit is null)
    or (
      goal_weight is not null and goal_weight > 0 and goal_weight < 2000
      and goal_weight_unit is not null and goal_weight_unit in ('kg', 'lb')
    )
  );
