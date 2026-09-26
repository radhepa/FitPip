-- FitPip / exercises table, starter-bank seeding, sign-up trigger.
-- Paste into the Supabase SQL Editor and run. Safe to re-run.
-- The starter data itself lives in the next migration (starter_exercise_catalog),
-- which is generated from ExerciseDB.

create table if not exists public.exercises (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid()
                      references auth.users (id) on delete cascade,
  name              text not null check (char_length(btrim(name)) between 1 and 80),
  primary_muscles   public.muscle[] not null default '{}',
  secondary_muscles public.muscle[] not null default '{}',
  equipment         public.equipment_type not null default 'other',
  -- Set when the exercise came from ExerciseDB (github.com/ExerciseDB/exercisedb-api).
  external_id       text,
  image_url         text check (image_url is null or image_url like 'https://%'),
  instructions      text[] not null default '{}',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create unique index if not exists exercises_user_name_key
  on public.exercises (user_id, lower(name));
create unique index if not exists exercises_user_external_key
  on public.exercises (user_id, external_id) where external_id is not null;

drop trigger if exists exercises_set_updated_at on public.exercises;
create trigger exercises_set_updated_at
  before update on public.exercises
  for each row execute function public.set_updated_at();

-- Row level security: a user can only ever see and change their own rows.
alter table public.exercises enable row level security;

revoke all on public.exercises from anon;
grant select, insert, update, delete on public.exercises to authenticated;

drop policy if exists "exercises_owner_all" on public.exercises;
create policy "exercises_owner_all" on public.exercises
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Copies the starter catalog into one user's own exercises.
-- Idempotent: anything already there (same name or same ExerciseDB id) is skipped.
-- Not callable by clients directly (see load_starter_exercises below).
-- ---------------------------------------------------------------------------
create or replace function public.seed_starter_exercises(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted integer;
begin
  insert into public.exercises
    (user_id, external_id, name, primary_muscles, secondary_muscles, equipment, image_url, instructions)
  select
    p_user_id, c.external_id, c.name, c.primary_muscles, c.secondary_muscles,
    c.equipment, c.image_url, c.instructions
  from public.starter_exercise_catalog() c
  on conflict do nothing;

  get diagnostics inserted = row_count;
  return inserted;
end;
$$;

revoke all on function public.seed_starter_exercises(uuid) from public, anon, authenticated;

-- New accounts get the starter bank automatically. A failure here must never
-- block sign-up, so it is downgraded to a warning (the app has a
-- "Load starter exercises" button as a fallback).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  begin
    perform public.seed_starter_exercises(new.id);
  exception when others then
    raise warning 'seed_starter_exercises failed for %: %', new.id, sqlerrm;
  end;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_seed_exercises on auth.users;
create trigger on_auth_user_created_seed_exercises
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Client-callable: adds any missing starter exercises for the signed-in user only.
create or replace function public.load_starter_exercises()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  return public.seed_starter_exercises(auth.uid());
end;
$$;

revoke all on function public.load_starter_exercises() from public, anon;
grant execute on function public.load_starter_exercises() to authenticated;
