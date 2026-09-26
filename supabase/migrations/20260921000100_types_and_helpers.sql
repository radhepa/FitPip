-- FitPip / shared types and helpers.
-- Paste into the Supabase SQL Editor and run. Safe to re-run.

-- Normalized muscle vocabulary. The app maps these to the body-map library's names
-- in one config file (src/config/muscleMap.ts). Extend with:
--   alter type public.muscle add value if not exists 'neck';
do $$ begin
  create type public.muscle as enum (
    'chest',
    'front_delts', 'side_delts', 'rear_delts',
    'biceps', 'triceps', 'forearms',
    'traps', 'lats', 'upper_back', 'lower_back',
    'abs', 'obliques',
    'quads', 'hamstrings', 'glutes', 'adductors', 'abductors', 'calves'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.equipment_type as enum (
    'barbell', 'dumbbell', 'machine', 'cable', 'bodyweight',
    'kettlebell', 'band', 'smith_machine', 'other'
  );
exception when duplicate_object then null; end $$;

-- Bumps updated_at on every UPDATE, unless the writer supplied its own new value
-- (lets an offline client keep the timestamp of when the edit really happened).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.updated_at is not distinct from old.updated_at then
    new.updated_at = now();
  end if;
  return new;
end;
$$;
