-- FitPip / rest timer length.
-- Paste into the Supabase SQL Editor and run. Safe to re-run.
--
-- How long the rest countdown runs after a lifting set. 0 turns the timer off.

alter table public.user_settings
  add column if not exists rest_seconds integer not null default 90;

alter table public.user_settings drop constraint if exists user_settings_rest_seconds_check;
alter table public.user_settings
  add constraint user_settings_rest_seconds_check
  check (rest_seconds = 0 or rest_seconds between 15 and 600);
