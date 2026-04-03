-- Fix infinite recursion: is_admin() was querying public.profiles which
-- is RLS-protected by a policy that calls is_admin() -> infinite loop.
-- Solution: read role from auth.jwt() claims instead of profiles table.
-- The role claim is set in app_metadata so it cannot be spoofed by users.

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
