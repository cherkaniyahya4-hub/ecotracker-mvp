-- Nuke every policy on profiles and recreate with pure JWT claims.
-- No function calls allowed in profiles policies — any function that
-- touches a table protected by RLS can recurse.

do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
  loop
    execute format('drop policy if exists %I on public.profiles', pol.policyname);
  end loop;
end $$;

-- SELECT: own row or admin via JWT claim
create policy "profiles_select"
on public.profiles for select to authenticated
using (
  auth.uid() = id
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- INSERT: own row only
create policy "profiles_insert"
on public.profiles for insert to authenticated
with check (auth.uid() = id);

-- UPDATE: own row or admin via JWT claim
create policy "profiles_update"
on public.profiles for update to authenticated
using (
  auth.uid() = id
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  auth.uid() = id
  or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- DELETE: admin only via JWT claim
create policy "profiles_delete"
on public.profiles for delete to authenticated
using (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
