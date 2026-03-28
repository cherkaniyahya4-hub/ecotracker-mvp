create or replace function public.ensure_user_content(p_user_id uuid default auth.uid())
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target_id uuid := coalesce(p_user_id, auth.uid());
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if v_target_id <> auth.uid() and not public.is_admin() then
    raise exception 'FORBIDDEN';
  end if;

  insert into public.profiles (id, email, full_name, role)
  select
    u.id,
    coalesce(u.email, ''),
    coalesce(
      nullif(u.raw_user_meta_data ->> 'full_name', ''),
      nullif(split_part(coalesce(u.email, ''), '@', 1), ''),
      'EcoTracker User'
    ),
    case
      when lower(coalesce(u.email, '')) = 'admin@ecotracker.app' then 'admin'
      else 'user'
    end
  from auth.users u
  where u.id = v_target_id
  on conflict (id) do nothing;

  perform public.provision_user_content(v_target_id);
end;
$$;

grant execute on function public.ensure_user_content(uuid) to authenticated;
