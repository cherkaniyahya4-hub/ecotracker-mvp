# Architecture Notes

## Frontend layering

1. `src/pages/*`: page entry points and page-level orchestration.
2. `src/services/*`: domain logic and data access abstraction.
3. `src/lib/*`: low-level clients (Supabase bootstrap).
4. `src/data/*`: default local datasets and seed-like frontend constants.

## Current data domains

- Auth: `auth.service.js`
- Admin analytics: `admin.service.js`
- Profiles: `profile.service.js`
- Tasks: `tasks.service.js`
- Market + points: `market.service.js`

## Supabase integration strategy

- Auth handled via Supabase Auth (`signInWithPassword`, `signOut`).
- User profile data in `profiles` table.
- Task checkbox state in `user_tasks` table.
- Market products in `market_products` table.
- Redemptions in `market_orders` table through RPC (`redeem_product`) for atomic points updates.
- Admin role via `profiles.role` with protected admin dashboard access.

## Security model

- Row Level Security is enabled on user-bound tables.
- Users can read/update their own rows.
- Admins can read global platform data and manage product catalog.
- Purchase operation is controlled by a SQL function.
- SQL is versioned in `supabase/migrations/*`.
