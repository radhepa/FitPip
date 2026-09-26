-- FitPip / workout templates, weekly schedule, sessions.template_id.
-- Paste into the Supabase SQL Editor and run. Safe to re-run.

-- ---------------------------------------------------------------------------
-- templates: a named workout plan
-- ---------------------------------------------------------------------------
create table if not exists public.templates (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid()
               references auth.users (id) on delete cascade,
  name       text not null check (char_length(btrim(name)) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists templates_user_name_key
  on public.templates (user_id, lower(name));

drop trigger if exists templates_set_updated_at on public.templates;
create trigger templates_set_updated_at
  before update on public.templates
  for each row execute function public.set_updated_at();

alter table public.templates enable row level security;

revoke all on public.templates from anon;
grant select, insert, update, delete on public.templates to authenticated;

drop policy if exists "templates_owner_all" on public.templates;
create policy "templates_owner_all" on public.templates
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- template_exercises: the ordered exercises in a template, with targets
-- ---------------------------------------------------------------------------
create table if not exists public.template_exercises (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid()
                references auth.users (id) on delete cascade,
  template_id uuid not null references public.templates (id) on delete cascade,
  -- Deleting an exercise removes it from any template that used it.
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  position    integer not null check (position >= 0),   -- order within the template
  target_sets integer not null default 3 check (target_sets between 1 and 20),
  target_reps integer not null default 8 check (target_reps between 1 and 100),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- One row per exercise per template, so a workout never has two plans for one exercise.
create unique index if not exists template_exercises_template_exercise_key
  on public.template_exercises (template_id, exercise_id);
create index if not exists template_exercises_template_position_idx
  on public.template_exercises (template_id, position);

drop trigger if exists template_exercises_set_updated_at on public.template_exercises;
create trigger template_exercises_set_updated_at
  before update on public.template_exercises
  for each row execute function public.set_updated_at();

alter table public.template_exercises enable row level security;

revoke all on public.template_exercises from anon;
grant select, insert, update, delete on public.template_exercises to authenticated;

-- The referenced template and exercise must also be mine (the sub-selects run under
-- those tables' own RLS, so they only see my rows).
drop policy if exists "template_exercises_owner_all" on public.template_exercises;
create policy "template_exercises_owner_all" on public.template_exercises
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.templates t where t.id = template_id)
    and exists (select 1 from public.exercises e where e.id = exercise_id)
  );

-- ---------------------------------------------------------------------------
-- schedule_days: which template runs on which weekday (null template = rest)
-- ---------------------------------------------------------------------------
create table if not exists public.schedule_days (
  user_id     uuid not null default auth.uid()
                references auth.users (id) on delete cascade,
  weekday     smallint not null check (weekday between 0 and 6),  -- 0 = Sunday ... 6 = Saturday
  -- Deleting a template turns its days back into rest days.
  template_id uuid references public.templates (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (user_id, weekday)
);

drop trigger if exists schedule_days_set_updated_at on public.schedule_days;
create trigger schedule_days_set_updated_at
  before update on public.schedule_days
  for each row execute function public.set_updated_at();

alter table public.schedule_days enable row level security;

revoke all on public.schedule_days from anon;
grant select, insert, update, delete on public.schedule_days to authenticated;

drop policy if exists "schedule_days_owner_all" on public.schedule_days;
create policy "schedule_days_owner_all" on public.schedule_days
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (template_id is null or exists (select 1 from public.templates t where t.id = template_id))
  );

-- ---------------------------------------------------------------------------
-- sessions.template_id: which template a workout was started from
-- ---------------------------------------------------------------------------
alter table public.sessions
  add column if not exists template_id uuid references public.templates (id) on delete set null;

drop policy if exists "sessions_owner_all" on public.sessions;
create policy "sessions_owner_all" on public.sessions
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (template_id is null or exists (select 1 from public.templates t where t.id = template_id))
  );
