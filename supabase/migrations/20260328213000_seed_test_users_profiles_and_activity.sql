-- Seed profile/task data for known test emails if those users already exist in auth.users.
-- Create these users through app sign-up first:
--   admin@ecotracker.app / Admin123!Eco
--   user@ecotracker.app  / User1234!Eco

do $$
declare
  v_now timestamptz := timezone('utc', now());
  v_admin_id uuid;
  v_user_id uuid;
begin
  select id into v_admin_id
  from auth.users
  where lower(email) = 'admin@ecotracker.app'
  limit 1;

  select id into v_user_id
  from auth.users
  where lower(email) = 'user@ecotracker.app'
  limit 1;

  if v_admin_id is not null then
    insert into public.profiles (
      id,
      email,
      full_name,
      role,
      city,
      preferred_mode,
      primary_goal,
      points,
      created_at,
      updated_at
    )
    values
      (
        v_admin_id,
        'admin@ecotracker.app',
        'EcoTracker Admin',
        'admin',
        'Casablanca, Morocco',
        'Bike + Transit',
        'Scale team impact',
        5200,
        v_now - interval '30 day',
        v_now
      )
    on conflict (id) do update set
      email = excluded.email,
      full_name = excluded.full_name,
      role = excluded.role,
      city = excluded.city,
      preferred_mode = excluded.preferred_mode,
      primary_goal = excluded.primary_goal,
      points = excluded.points,
      updated_at = timezone('utc', now());

    insert into public.user_tasks (user_id, page, task_id, completed, created_at, updated_at)
    values
      (v_admin_id, 'dashboard', 'dash-transit', true,  v_now - interval '7 day', v_now - interval '1 day'),
      (v_admin_id, 'dashboard', 'dash-ewaste', true,   v_now - interval '7 day', v_now - interval '2 day'),
      (v_admin_id, 'goals',     'goal-compost', true,  v_now - interval '6 day', v_now - interval '1 day')
    on conflict (user_id, page, task_id) do update set
      completed = excluded.completed,
      updated_at = excluded.updated_at;
  end if;

  if v_user_id is not null then
    insert into public.profiles (
      id,
      email,
      full_name,
      role,
      city,
      preferred_mode,
      primary_goal,
      points,
      created_at,
      updated_at
    )
    values
      (
        v_user_id,
        'user@ecotracker.app',
        'EcoTracker User',
        'user',
        'Rabat, Morocco',
        'Walking',
        'Reduce plastic waste',
        2950,
        v_now - interval '10 day',
        v_now
      )
    on conflict (id) do update set
      email = excluded.email,
      full_name = excluded.full_name,
      role = excluded.role,
      city = excluded.city,
      preferred_mode = excluded.preferred_mode,
      primary_goal = excluded.primary_goal,
      points = excluded.points,
      updated_at = timezone('utc', now());

    insert into public.user_tasks (user_id, page, task_id, completed, created_at, updated_at)
    values
      (v_user_id,  'dashboard', 'dash-transit', true,  v_now - interval '4 day', v_now - interval '1 day'),
      (v_user_id,  'dashboard', 'dash-scan', false,    v_now - interval '4 day', v_now - interval '1 day'),
      (v_user_id,  'goals',     'goal-refill', true,   v_now - interval '3 day', v_now - interval '12 hour')
    on conflict (user_id, page, task_id) do update set
      completed = excluded.completed,
      updated_at = excluded.updated_at;
  end if;
end $$;
