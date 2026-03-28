create or replace function public.is_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = check_user_id
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.user_tasks enable row level security;
alter table public.market_products enable row level security;
alter table public.market_orders enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles
for select
to authenticated
using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles
for update
to authenticated
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

drop policy if exists "user_tasks_select_own_or_admin" on public.user_tasks;
create policy "user_tasks_select_own_or_admin"
on public.user_tasks
for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "user_tasks_insert_own" on public.user_tasks;
create policy "user_tasks_insert_own"
on public.user_tasks
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user_tasks_update_own_or_admin" on public.user_tasks;
create policy "user_tasks_update_own_or_admin"
on public.user_tasks
for update
to authenticated
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "user_tasks_delete_own_or_admin" on public.user_tasks;
create policy "user_tasks_delete_own_or_admin"
on public.user_tasks
for delete
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "market_products_select_authenticated" on public.market_products;
create policy "market_products_select_authenticated"
on public.market_products
for select
to authenticated
using (is_active = true or public.is_admin());

drop policy if exists "market_products_manage_admin" on public.market_products;
create policy "market_products_manage_admin"
on public.market_products
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "market_orders_select_own_or_admin" on public.market_orders;
create policy "market_orders_select_own_or_admin"
on public.market_orders
for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "market_orders_insert_own" on public.market_orders;
create policy "market_orders_insert_own"
on public.market_orders
for insert
to authenticated
with check (auth.uid() = user_id);
