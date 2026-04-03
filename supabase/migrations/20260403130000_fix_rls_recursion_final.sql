-- Final fix for infinite recursion in profiles RLS.
--
-- Root cause: is_admin() queries public.profiles, but profiles policies
-- call is_admin() -> infinite loop. security definer does NOT bypass RLS
-- on Supabase hosted (only superuser/postgres role does).
--
-- Solution: rewrite is_admin() to read from auth.jwt() app_metadata only
-- (no table query at all), and rewrite profiles policies to use the JWT
-- claim directly instead of calling is_admin().

-- Step 1: rewrite is_admin() with zero table access
create or replace function public.is_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

grant execute on function public.is_admin(uuid) to authenticated;

-- Step 2: rewrite profiles policies to avoid any function that touches profiles
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles for select to authenticated
using (
  auth.uid() = id
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles for update to authenticated
using (
  auth.uid() = id
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  auth.uid() = id
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- Step 3: backfill app_metadata.role for all existing users from profiles
-- Uses a DO block running as postgres (migration runner has superuser access)
do $$
declare
  r record;
begin
  for r in select id, role from public.profiles loop
    update auth.users
    set raw_app_meta_data =
      coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', r.role)
    where id = r.id;
  end loop;
end $$;
