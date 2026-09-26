-- FitPip / workout sessions and logged sets.
-- Paste into the Supabase SQL Editor and run. Safe to re-run.

create table if not exists public.sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid()
               references auth.users (id) on delete cascade,
  name       text check (name is null or char_length(name) <= 80),
  started_at timestamptz not null default now(),
  ended_at   timestamptz,           -- null while the workout is in progress
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ended_at is null or ended_at >= started_at)
);

create index if not exists sessions_user_started_idx
  on public.sessions (user_id, started_at desc);

drop trigger if exists sessions_set_updated_at on public.sessions;
create trigger sessions_set_updated_at
  before update on public.sessions
  for each row execute function public.set_updated_at();

alter table public.sessions enable row level security;

revoke all on public.sessions from anon;
grant select, insert, update, delete on public.sessions to authenticated;

drop policy if exists "sessions_owner_all" on public.sessions;
create policy "sessions_owner_all" on public.sessions
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------

create table if not exists public.sets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid()
                references auth.users (id) on delete cascade,
  session_id  uuid not null references public.sessions (id) on delete cascade,
  -- An exercise with logged sets cannot be deleted (keeps history intact).
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  set_order   integer not null check (set_order >= 0),   -- position within the session
  reps        integer not null check (reps >= 0),
  weight      numeric(7, 2) not null default 0 check (weight >= 0),  -- in the user's unit
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists sets_session_order_idx
  on public.sets (session_id, set_order);
create index if not exists sets_user_exercise_idx
  on public.sets (user_id, exercise_id);

drop trigger if exists sets_set_updated_at on public.sets;
create trigger sets_set_updated_at
  before update on public.sets
  for each row execute function public.set_updated_at();

alter table public.sets enable row level security;

revoke all on public.sets from anon;
grant select, insert, update, delete on public.sets to authenticated;

-- Besides user_id = me, the referenced session and exercise must also be mine.
-- (The sub-selects run under those tables' own RLS, so they only see my rows.)
drop policy if exists "sets_owner_all" on public.sets;
create policy "sets_owner_all" on public.sets
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.sessions s where s.id = session_id)
    and exists (select 1 from public.exercises e where e.id = exercise_id)
  );
