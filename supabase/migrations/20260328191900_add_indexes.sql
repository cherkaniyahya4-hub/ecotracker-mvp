create index if not exists idx_profiles_role
on public.profiles(role);

create index if not exists idx_user_tasks_user_page
on public.user_tasks(user_id, page);

create index if not exists idx_market_orders_user_created_at
on public.market_orders(user_id, created_at desc);

create index if not exists idx_market_orders_product_id
on public.market_orders(product_id);
