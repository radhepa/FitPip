-- FitPip / weekly plan with several activities per day.
-- Paste into the Supabase SQL Editor and run. Safe to re-run.
--
-- A weekday can now hold any number of items, in order. Each item is EITHER a routine (a template,
-- e.g. "Push day") OR a single activity (an exercise, e.g. "Freestyle Swim" or "Heavy Bag").
-- A weekday with no items is a rest day.
--
-- This replaces schedule_days (one template per weekday). Its rows are copied over below; the old
-- table is left in place, unused, so nothing is lost.

create table if not exists public.week_plan_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid()
                references auth.users (id) on delete cascade,
  weekday     smallint not null check (weekday between 0 and 6),  -- 0 = Sunday ... 6 = Saturday
  position    integer not null default 0 check (position >= 0),   -- order within the day
  -- Deleting a routine or an activity takes it off the plan.
  template_id uuid references public.templates (id) on delete cascade,
  exercise_id uuid references public.exercises (id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint week_plan_items_one_target check (num_nonnulls(template_id, exercise_id) = 1)
);

create index if not exists week_plan_items_user_day_idx
  on public.week_plan_items (user_id, weekday, position);
-- The same routine or activity only once per day.
create unique index if not exists week_plan_items_day_template_key
  on public.week_plan_items (user_id, weekday, template_id) where template_id is not null;
create unique index if not exists week_plan_items_day_exercise_key
  on public.week_plan_items (user_id, weekday, exercise_id) where exercise_id is not null;

drop trigger if exists week_plan_items_set_updated_at on public.week_plan_items;
create trigger week_plan_items_set_updated_at
  before update on public.week_plan_items
  for each row execute function public.set_updated_at();

alter table public.week_plan_items enable row level security;

revoke all on public.week_plan_items from anon;
grant select, insert, update, delete on public.week_plan_items to authenticated;

-- The referenced routine or activity must also be mine (the sub-selects run under those tables'
-- own RLS, so they only see my rows).
drop policy if exists "week_plan_items_owner_all" on public.week_plan_items;
create policy "week_plan_items_owner_all" on public.week_plan_items
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (template_id is null or exists (select 1 from public.templates t where t.id = template_id))
    and (exercise_id is null or exists (select 1 from public.exercises e where e.id = exercise_id))
  );

-- Carry the old one-template-per-day schedule over.
do $$
begin
  if to_regclass('public.schedule_days') is not null then
    insert into public.week_plan_items (user_id, weekday, position, template_id, created_at, updated_at)
    select d.user_id, d.weekday, 0, d.template_id, d.created_at, d.updated_at
      from public.schedule_days d
     where d.template_id is not null
       and not exists (
         select 1 from public.week_plan_items w
          where w.user_id = d.user_id and w.weekday = d.weekday and w.template_id = d.template_id
       );
  end if;
end $$;
