create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists trg_user_tasks_updated_at on public.user_tasks;
create trigger trg_user_tasks_updated_at
before update on public.user_tasks
for each row
execute function public.set_updated_at();

create or replace function public.redeem_product(p_product_id bigint)
returns table (remaining_points integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_points_cost integer;
  v_remaining integer;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select points
  into v_points_cost
  from public.market_products
  where id = p_product_id
    and is_active = true;

  if v_points_cost is null then
    raise exception 'PRODUCT_NOT_FOUND';
  end if;

  update public.profiles
  set points = points - v_points_cost
  where id = v_user_id
    and points >= v_points_cost
  returning points into v_remaining;

  if v_remaining is null then
    if exists (select 1 from public.profiles where id = v_user_id) then
      raise exception 'NOT_ENOUGH_POINTS';
    end if;

    raise exception 'PROFILE_NOT_FOUND';
  end if;

  insert into public.market_orders (user_id, product_id, points_spent)
  values (v_user_id, p_product_id, v_points_cost);

  return query
  select v_remaining;
end;
$$;

grant execute on function public.redeem_product(bigint) to authenticated;
