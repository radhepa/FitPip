-- FitPip / set up a workout before beginning it, plus RPE on sets.
-- Paste into the Supabase SQL Editor and run. Safe to re-run.
--
-- * sessions.started_at is now null until the workout is begun (a workout that is still being
--   set up has no clock). Every workout that already exists keeps its start time.
-- * sessions.plan holds the exercises set up for a workout as a JSON array of
--   {"exercise_id", "target_sets", "target_reps"}. It replaces reading the template live, so a
--   workout can be edited before it begins, and it syncs between devices.
-- * sets.rpe is the rate of perceived exertion (1-10 in half steps), optional.

-- ---------------------------------------------------------------------------
-- RPE

alter table public.sets
  add column if not exists rpe numeric(3, 1);

alter table public.sets drop constraint if exists sets_rpe_check;
alter table public.sets
  add constraint sets_rpe_check
  check (rpe is null or (rpe >= 1 and rpe <= 10 and rpe * 2 = round(rpe * 2)));

-- ---------------------------------------------------------------------------
-- Workouts that are set up first and begun later

alter table public.sessions alter column started_at drop not null;
alter table public.sessions alter column started_at drop default;

alter table public.sessions
  add column if not exists plan jsonb;

alter table public.sessions drop constraint if exists sessions_plan_check;
alter table public.sessions
  add constraint sessions_plan_check
  check (plan is null or jsonb_typeof(plan) = 'array');

-- A workout can only be finished once it has begun.
alter table public.sessions drop constraint if exists sessions_begun_before_ended_check;
alter table public.sessions
  add constraint sessions_begun_before_ended_check
  check (ended_at is null or started_at is not null);

-- Workouts in progress that were started from a template keep that template's exercises
-- as their own plan (they used to read the template live).
update public.sessions s
   set plan = (
     select jsonb_agg(
              jsonb_build_object(
                'exercise_id', te.exercise_id,
                'target_sets', te.target_sets,
                'target_reps', te.target_reps
              )
              order by te.position, te.created_at
            )
       from public.template_exercises te
      where te.template_id = s.template_id
   )
 where s.ended_at is null
   and s.plan is null
   and s.template_id is not null;
