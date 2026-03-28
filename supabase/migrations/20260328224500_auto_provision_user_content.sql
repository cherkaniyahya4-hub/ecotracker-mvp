create or replace function public.provision_user_content(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_dashboard_stats (
    user_id,
    date_label,
    title,
    subtitle,
    impact_cards,
    current_score,
    score_delta_text,
    map_status,
    map_search_placeholder,
    map_highlight,
    next_dropoff_label,
    next_dropoff_value,
    weekly_score_series,
    weekly_score_note,
    emission_series,
    emission_note,
    donut_metrics,
    league_name,
    next_rank_text,
    quick_actions_title,
    quick_actions,
    ai_tiles,
    focus_tasks,
    weekly_breakdown,
    carbon_snapshot,
    ecocoach_message
  )
  values
    (
      p_user_id,
      'Thursday, 9 January',
      'Your EcoScore is balanced this week',
      'Keep focusing on low-carbon commuting and recycling drops.',
      '[
        {"icon":"🌍","value":"2.4 kg","label":"CO2 saved","detail":"Approx. 12 km car trip avoided"},
        {"icon":"♻️","value":"7","label":"Items recycled","detail":"Plastic and e-waste sorted"},
        {"icon":"🚲","value":"3","label":"Low-carbon trips","detail":"Bike and walking sessions"}
      ]'::jsonb,
      82,
      'Excellent progress - +6 vs. last week.',
      'Satellite Active',
      'Search eco-points...',
      'Plastic Recycling Center',
      'Next drop-off',
      'Boulevard Mohamed V, 0.4km',
      '[
        {"label":"Mon","value":60},
        {"label":"Tue","value":72},
        {"label":"Wed","value":80},
        {"label":"Thu","value":90},
        {"label":"Fri","value":86},
        {"label":"Sat","value":92},
        {"label":"Sun","value":88}
      ]'::jsonb,
      'Streak goal: stay above 80 for 5+ days.',
      '[
        {"label":"Mob.","value":55},
        {"label":"Energy","value":40},
        {"label":"Food","value":65},
        {"label":"Goods","value":35}
      ]'::jsonb,
      'Mobility is the largest share this week - shift 2 trips to transit to rebalance.',
      '[
        {"value":"75%","title":"Goal completion","description":"Energy + transport missions almost done."},
        {"value":"62%","title":"Carbon reduction","description":"Vs. baseline month. Aim for 70% by Sunday."},
        {"value":"48%","title":"Community streak","description":"Neighborhood sprint halfway complete."}
      ]'::jsonb,
      'Gold League',
      'Next Rank: Emerald League at 3,500 pts',
      'Eco Market & AI',
      '[
        {"label":"Log eco action","href":"#focus"},
        {"label":"Plan route","href":"#map"},
        {"label":"Open scanners","href":"./scan.html"}
      ]'::jsonb,
      '[
        {"title":"AI habit tracking","description":"7 eco-positive actions logged today."},
        {"title":"Waste recognition","description":"3 items scanned - 100% correctly sorted."},
        {"title":"Weekly goals","description":"2 / 3 missions complete - Energy goal left."},
        {"title":"Gamified streak","description":"14-day streak - +240 bonus points."}
      ]'::jsonb,
      '[
        {"id":"dash-bike-40","text":"Bike or walk for at least 40 minutes."},
        {"id":"dash-ewaste","text":"Drop e-waste using the GPS recycling finder."},
        {"id":"dash-scan","text":"Scan two pantry products to get swap advice."}
      ]'::jsonb,
      '[
        "Mobility - 46% low-carbon trips - target 50%.",
        "Energy - Evening peak trimmed by 9% vs. last week.",
        "Waste - 8 scans sorted - 1 contamination flagged.",
        "Consumption - 5 barcodes logged - 2 greener swaps adopted."
      ]'::jsonb,
      'Footprint intensity 8.4 kg CO2e/day (city avg: 12.2).',
      '"Plan a zero-waste pantry scan tonight to unlock the Waste Warrior badge boost."'
    )
  on conflict (user_id) do nothing;

  insert into public.user_goals_content (
    user_id,
    title,
    subtitle,
    quick_actions,
    focus_areas,
    current_streak,
    badges_unlocked,
    upcoming_challenge,
    nudges,
    goal_health,
    rewards_queue
  )
  values
    (
      p_user_id,
      'Keep eco-goals achievable and gamified.',
      'EcoTracker adapts tasks to your habits so progress feels natural.',
      '[
        {"label":"Log eco action","href":"#focus-areas"},
        {"label":"Browse challenges","href":"#goal-highlights"},
        {"label":"Invite friends","href":"#nudges"}
      ]'::jsonb,
      '[
        {"category":"transport","title":"Transportation","description":"Replace 2 short trips with walking."},
        {"category":"energy","title":"Energy","description":"Reduce standby devices during peak hours."},
        {"category":"consumption","title":"Consumption","description":"Cook 3 plant-focused meals."}
      ]'::jsonb,
      '4 consecutive goal weeks completed.',
      'Solar Saver - Waste Warrior - Transit Hero.',
      'Neighborhood recycling sprint starts Monday.',
      '[
        {"id":"goal-compost","text":"Invite 2 friends to co-own a community compost goal."},
        {"id":"goal-refill","text":"Schedule a Sunday refill run reminder via GPS map."},
        {"id":"goal-share","text":"Share your streak recap to the team sustainability channel."}
      ]'::jsonb,
      '84% success probability this week.',
      '300 pts away from planting 3 trees via partner NGO.'
    )
  on conflict (user_id) do nothing;

  insert into public.user_scan_content (
    user_id,
    title,
    subtitle,
    instant_guidance_title,
    instant_guidance_subtitle,
    action_buttons,
    camera_title,
    camera_subtitle,
    camera_status,
    ai_waste_items,
    barcode_items,
    recent_scans_summary,
    ecocoach_tip,
    rewards_text
  )
  values
    (
      p_user_id,
      'Instant guidance',
      'Choose AI waste or barcode product scanning. Get accurate sorting help and product impact data anywhere.',
      'Instant guidance',
      'Choose AI waste or barcode product scanning.',
      '[
        {"label":"Start AI waste scan","href":"#ai-waste"},
        {"label":"Scan barcode","href":"#barcode"},
        {"label":"View history","href":"#history"}
      ]'::jsonb,
      'Live camera scan',
      'Point your camera at waste or products to let EcoTracker analyze them in real time.',
      'Camera ready',
      '[
        "Plastic tray - rinse and recycle bin",
        "Aluminum can - quick scan to log bonus points",
        "Organic waste - compost pickup reminder"
      ]'::jsonb,
      '[
        "Energy bar - 0.75 kg CO2e - local oats alternative available",
        "Multi-purpose cleaner - check refill station nearby to reduce plastics",
        "Beverage - compare plant-based vs. dairy footprint"
      ]'::jsonb,
      '14 items logged this week - 100% correctly sorted.',
      'Scan receipts to auto-calculate basket carbon and unlock plant-based swap ideas.',
      '2 more scans unlocks Sorting Pro badge + bonus EcoScore.'
    )
  on conflict (user_id) do nothing;

  insert into public.user_profile_content (
    user_id,
    title,
    subtitle,
    quick_actions,
    personal_profile_items,
    connected_accounts,
    community_rank,
    support_text,
    account_controls,
    persona_text,
    support_status
  )
  values
    (
      p_user_id,
      'Eco profile & community impact',
      'Review habits, connected devices, and local leaderboards.',
      '[
        {"label":"Share EcoScore","href":"#personal-profile"},
        {"label":"Manage devices","href":"#edit-profile"},
        {"label":"View rewards","href":"#account-controls"}
      ]'::jsonb,
      '[
        "Primary mode: Bike + public transit",
        "Favorite eco-goal: Low-waste kitchen",
        "Region: Lyon - local recycling rules enabled"
      ]'::jsonb,
      'Energy dashboard - Smart thermostat - City bike share.',
      '#4 of 68 neighbors this month.',
      'Need help? Email support@ecotracker.app anytime.',
      '[
        "Carbon offsets - auto-purchase every 500 pts.",
        "Data sharing - exporting weekly via email + API.",
        "Notifications - quiet hours 22:00-07:00."
      ]'::jsonb,
      '"Urban Explorer" - strong mobility habits.',
      'Next coaching session scheduled Feb 2 - 15:30.'
    )
  on conflict (user_id) do nothing;

  if not exists (select 1 from public.scan_events where user_id = p_user_id) then
    insert into public.scan_events (user_id, event_label, title, details)
    values
      (p_user_id, 'Yesterday', 'Plastic tray', 'Rinse and recycle bin.'),
      (p_user_id, 'Yesterday', 'Coffee grounds', 'Compost pickup scheduled.'),
      (p_user_id, '2 days ago', 'Aluminum cans', 'Logged for bonus streak.'),
      (p_user_id, '2 days ago', 'Cleaner barcode', 'Refill station recommended.');
  end if;
end;
$$;

create or replace function public.trg_provision_user_content()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.provision_user_content(new.id);
  return new;
end;
$$;

drop trigger if exists trg_profiles_provision_user_content on public.profiles;
create trigger trg_profiles_provision_user_content
after insert on public.profiles
for each row
execute function public.trg_provision_user_content();

do $$
declare
  v_user_id uuid;
begin
  for v_user_id in select id from public.profiles loop
    perform public.provision_user_content(v_user_id);
  end loop;
end $$;

insert into public.dashboard_leaderboard (rank, display_name, role_label, score, avatar_url, is_featured)
values
  (1, 'Yahya Cherkani', 'Eco King', 3120, '../assets/images/yahyatof.jpeg', true),
  (2, 'Amine Naji', 'Master Recycler', 2150, '../assets/images/aminenaji.jpeg', false),
  (3, 'Sofia Mansouri', 'Pro Biker', 1980, null, false),
  (4, 'Karim Benali', '', 2610, null, false),
  (5, 'Ines Dridi', '', 2400, null, false),
  (6, 'Omar Alami', '', 2150, null, false),
  (7, 'Lea Tazi', '', 1980, null, false),
  (8, 'Mehdi H.', '', 1750, null, false),
  (9, 'Sami Yassine', '', 1520, null, false)
on conflict (rank) do update set
  display_name = excluded.display_name,
  role_label = excluded.role_label,
  score = excluded.score,
  avatar_url = excluded.avatar_url,
  is_featured = excluded.is_featured;
