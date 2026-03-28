-- Cleanup legacy/broken auth seed rows for fixed test emails.
-- This addresses login failures such as:
--   unexpected_failure: Database error querying schema
-- Recreate these users via Sign up after applying this migration.

do $$
declare
  v_target_emails text[] := array['admin@ecotracker.app', 'user@ecotracker.app'];
  v_has_provider_id boolean := false;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth'
      and table_name = 'identities'
      and column_name = 'provider_id'
  )
  into v_has_provider_id;

  if v_has_provider_id then
    delete from auth.identities
    where lower(provider) = 'email'
      and (
        lower(coalesce(provider_id, '')) = any(v_target_emails)
        or lower(coalesce(identity_data ->> 'email', '')) = any(v_target_emails)
      );
  else
    delete from auth.identities
    where lower(provider) = 'email'
      and (
        lower(coalesce(id::text, '')) = any(v_target_emails)
        or lower(coalesce(identity_data ->> 'email', '')) = any(v_target_emails)
      );
  end if;

  delete from auth.users
  where lower(email) = any(v_target_emails);
end $$;
