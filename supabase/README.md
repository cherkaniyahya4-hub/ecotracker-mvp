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
6. `20260328213000_seed_test_users_profiles_and_activity.sql`
7. `20260328220000_admin_managed_catalog_only.sql`
8. `20260328223000_create_dynamic_page_content_tables.sql`
9. `20260328223100_seed_dynamic_page_content_data.sql`
10. `20260328224500_auto_provision_user_content.sql`
11. `20260328225500_add_ensure_user_content_rpc.sql`
12. `20260328230500_cleanup_broken_seed_auth_rows.sql`
13. `20260328232000_seed_initial_products_and_set_zero_points.sql`
14. `20260328233000_add_dashboard_eco_market_action.sql`
15. `20260328234000_store_images_as_blobs_and_sort_leaderboard.sql`

## Seeded test accounts (development only)

- Admin:
  - Email: `admin@ecotracker.app`
  - Password: `Admin123!Eco`
- User:
  - Email: `user@ecotracker.app`
  - Password: `User1234!Eco`

Create these two accounts once from the app Sign up page, then run `supabase db push`.
Migration `20260328213000_seed_test_users_profiles_and_activity.sql` will attach profile/task seed data (including admin role for `admin@ecotracker.app`) to existing Auth users.

If login for `admin@ecotracker.app` or `user@ecotracker.app` returns `unexpected_failure` with `Database error querying schema`, apply migration `20260328230500_cleanup_broken_seed_auth_rows.sql`, then re-create those accounts from Sign up.

## Marketplace data ownership

Product catalog and orders are **admin-managed only**:
- Admin can create/update/delete products from `/pages/admin.html`.
- Normal users can only read active products and redeem points.
- Migration `20260328220000_admin_managed_catalog_only.sql` clears old seeded catalog rows so market starts empty until admin inserts products.
- Migration `20260328232000_seed_initial_products_and_set_zero_points.sql` inserts the initial product list and keeps full CRUD management in admin.

## New user default points

Newly signed-up users now start with `0` points by default (enforced in DB and frontend profile bootstrap).

## Page content data source

Dashboard, scan, goals, and profile pages read their displayed content from database tables:
- `user_dashboard_stats`
- `dashboard_leaderboard`
- `user_scan_content`
- `scan_events`
- `user_goals_content`
- `user_profile_content`

Missing-content protection:
- Migration `20260328224500_auto_provision_user_content.sql` backfills content for existing profiles and auto-provisions content on future profile inserts.
- Migration `20260328225500_add_ensure_user_content_rpc.sql` adds `public.ensure_user_content(...)`, used by the frontend to self-heal missing rows and then reload real DB content.

## Leaderboard and image storage updates

- Community League is now sorted by `score` (points collected) descending.
- Leaderboard avatars are stored as DB blobs (`dashboard_leaderboard.avatar_blob`) with mime metadata.
- Market item images support DB blobs (`market_products.image_blob`) and admin can upload image files that are stored in DB.

## Promote a user to admin manually

```sql
update public.profiles
set role = 'admin'
where email = 'admin@yourdomain.com';
```
