# EcoTracker MVP (Team Structure + Supabase)

This project is now organized for team development with page entry modules, shared services, and Supabase backend integration.

## Project structure

```text
ecotracker-mvp/
  assets/
    images/
    styles/
  pages/
    index.html
    login.html
    dashboard.html
    admin.html
    goals.html
    profile.html
    scan.html
    market.html
    premieum.html
  docs/
    architecture.md
  src/
    config/
      runtime-config.js
      runtime-config.example.js
    data/
      default-products.js
    lib/
      supabase.js
    pages/
      common.js
      home.page.js
      login.page.js
      dashboard.page.js
      admin.page.js
      goals.page.js
      profile.page.js
      scan.page.js
      market.page.js
      task-list.js
    services/
      auth.service.js
      admin.service.js
      profile.service.js
      tasks.service.js
      market.service.js
  supabase/
    README.md
    migrations/
    schema.sql
  index.html (redirect shim to pages/index.html)
```

## Quick start

1. Configure Supabase keys in `src/config/runtime-config.js`.
2. Apply migrations from `supabase/migrations`.
3. Serve the folder with a local server (do not use `file://`).

Example:

```bash
cd ecotracker-mvp
python3 -m http.server 5500
```

Open: `http://localhost:5500/index.html`

Migrations:

```bash
supabase db push
```

Admin dashboard route: `./pages/admin.html`  
Access is limited to users with `profiles.role = 'admin'`.

## Runtime modes

- Supabase mode: enabled when `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set.
- Demo mode: automatic fallback to localStorage if Supabase is not configured yet.

## Team workflow

- Add UI behavior in `src/pages/*.page.js`.
- Add reusable business logic in `src/services/*.service.js`.
- Keep user-facing HTML in `pages/` and static assets in `assets/`.
- Keep Supabase database changes in `supabase/migrations/*.sql`.
