# Supabase Migrations

Migrations are stored in `supabase/migrations` and must run in filename order.

## Apply migrations

Using Supabase CLI:

```bash
supabase db push
```

Or run SQL files manually in Supabase SQL editor in this order:

1. `20260328191500_create_core_tables.sql`
2. `20260328191600_enable_rls_and_policies.sql`
3. `20260328191700_triggers_and_rpcs.sql`
4. `20260328191800_seed_market_products.sql`
5. `20260328191900_add_indexes.sql`

## Promote a user to admin

After the user signs up and has a profile row:

```sql
update public.profiles
set role = 'admin'
where email = 'admin@yourdomain.com';
```
