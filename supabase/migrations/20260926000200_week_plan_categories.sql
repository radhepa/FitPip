-- FitPip / weekly plan: plan a day by KIND of workout.
-- Paste into the Supabase SQL Editor and run. Safe to re-run.
--
-- Needs 20260925000200_week_plan.sql to have been run first.
--
-- A week plan item can now be a whole category ("Cardio", "Yoga", "Weightlifting"...) as well as a
-- routine or a single activity. It just says what kind of workout the day is for; you pick the
-- actual exercises when you start it. Exactly one of template_id / exercise_id / category is set.

alter table public.week_plan_items
  add column if not exists category text;

alter table public.week_plan_items drop constraint if exists week_plan_items_category_check;
alter table public.week_plan_items
  add constraint week_plan_items_category_check
  check (category is null or category in ('strength', 'cardio', 'swim', 'yoga', 'stretch', 'combat', 'sport'));

alter table public.week_plan_items drop constraint if exists week_plan_items_one_target;
alter table public.week_plan_items
  add constraint week_plan_items_one_target
  check (num_nonnulls(template_id, exercise_id, category) = 1);

-- The same category only once per day.
create unique index if not exists week_plan_items_day_category_key
  on public.week_plan_items (user_id, weekday, category) where category is not null;
