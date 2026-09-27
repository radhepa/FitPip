-- FitPip / favorite workouts.
-- Paste into the Supabase SQL Editor and run. Safe to re-run.
--
-- A starred workout shows up under Favorites (History and Today) so it can be repeated in one tap.
-- The existing row policies on sessions already cover the new column.

alter table public.sessions
  add column if not exists favorite boolean not null default false;
