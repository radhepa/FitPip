-- FitPip / profile: a display name and which strength standards lifts are ranked against.
-- Paste into the Supabase SQL Editor and run. Safe to re-run.
--
-- * compare_sex: 'male' or 'female', the strength standards (men's or women's) used to turn a
--   best lift into a percentile and a rank. Null until chosen on the profile.
-- * display_name: the name shown on the profile, up to 40 characters.
--
-- Ranks, badges and XP themselves are not stored: the app works them out from sets, workouts and
-- weigh-ins every time, so they stay right when history is edited.

alter table public.user_settings
  add column if not exists compare_sex text,
  add column if not exists display_name text;

alter table public.user_settings drop constraint if exists user_settings_compare_sex_check;
alter table public.user_settings
  add constraint user_settings_compare_sex_check
  check (compare_sex is null or compare_sex in ('male', 'female'));

alter table public.user_settings drop constraint if exists user_settings_display_name_check;
alter table public.user_settings
  add constraint user_settings_display_name_check
  check (display_name is null or char_length(display_name) between 1 and 40);
