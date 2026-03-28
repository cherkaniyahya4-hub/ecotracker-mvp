-- Ensure marketplace data is admin-managed only.
-- Remove previously seeded catalog/order rows so market starts empty.

delete from public.market_orders;
delete from public.market_products;

alter sequence if exists public.market_products_id_seq restart with 1;
