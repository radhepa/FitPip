-- FitPip / offline sync support.
-- Paste into the Supabase SQL Editor and run. Safe to re-run.
--
-- The app keeps a full copy of your data on the device and syncs it in the background. Two things
-- on the server make that reliable:
--
--   1. modified_at: the SERVER clock at the moment a row was last written. updated_at cannot be the
--      sync cursor because an offline client keeps the time its edit really happened (see
--      set_updated_at), so a row edited offline yesterday can arrive today with an old updated_at.
--      Devices ask "what changed since modified_at X?".
--   2. deleted_rows: a record of every deleted row, so other devices learn about deletions
--      (including cascades, e.g. deleting a workout removes its sets).

create or replace function public.touch_modified_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.modified_at = clock_timestamp();
  return new;
end;
$$;

revoke all on function public.touch_modified_at() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Tombstones for deleted rows.

create table if not exists public.deleted_rows (
  id         bigint generated always as identity primary key,
  -- No foreign key on purpose: deleting an account cascades through every table, and each of those
  -- deletions writes a row here.
  user_id    uuid not null,
  table_name text not null,
  -- The row's id (user_settings has no id, so its user_id).
  row_key    text not null,
  deleted_at timestamptz not null default now()
);

create index if not exists deleted_rows_user_id_idx on public.deleted_rows (user_id, id);

alter table public.deleted_rows enable row level security;

-- Clients can read their own tombstones and nothing else; only the trigger below writes them.
revoke all on public.deleted_rows from anon, authenticated;
grant select on public.deleted_rows to authenticated;

drop policy if exists "deleted_rows_owner_select" on public.deleted_rows;
create policy "deleted_rows_owner_select" on public.deleted_rows
  for select to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.record_deletion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  old_row jsonb := to_jsonb(old);
begin
  insert into public.deleted_rows (user_id, table_name, row_key)
  values ((old_row ->> 'user_id')::uuid, tg_table_name, coalesce(old_row ->> 'id', old_row ->> 'user_id'));
  return old;
end;
$$;

revoke all on function public.record_deletion() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Attach both to every table the app syncs.

do $$
declare
  t text;
begin
  foreach t in array array[
    'exercises', 'sessions', 'sets', 'user_settings',
    'templates', 'template_exercises', 'week_plan_items', 'body_weights'
  ]
  loop
    execute format('alter table public.%I add column if not exists modified_at timestamptz not null default clock_timestamp()', t);
    execute format('create index if not exists %I on public.%I (user_id, modified_at)', t || '_user_modified_idx', t);

    execute format('drop trigger if exists %I on public.%I', t || '_touch_modified_at', t);
    execute format(
      'create trigger %I before insert or update on public.%I for each row execute function public.touch_modified_at()',
      t || '_touch_modified_at', t
    );

    execute format('drop trigger if exists %I on public.%I', t || '_record_deletion', t);
    execute format(
      'create trigger %I after delete on public.%I for each row execute function public.record_deletion()',
      t || '_record_deletion', t
    );
  end loop;
end $$;
