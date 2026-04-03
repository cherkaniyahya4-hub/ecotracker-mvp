-- Sync profiles.role -> auth.users.raw_app_meta_data so auth.jwt() carries
-- the role claim, which is what is_admin() now reads.

create or replace function public.sync_role_to_app_metadata()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update auth.users
  set raw_app_meta_data =
    coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', new.role)
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists trg_profiles_sync_role on public.profiles;
create trigger trg_profiles_sync_role
after insert or update of role on public.profiles
for each row
execute function public.sync_role_to_app_metadata();

-- Backfill existing profiles so current users get the claim immediately.
update auth.users u
set raw_app_meta_data =
  coalesce(u.raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', p.role)
from public.profiles p
where p.id = u.id;
