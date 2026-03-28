create or replace function public.normalize_dashboard_quick_actions()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_actions jsonb := coalesce(new.quick_actions, '[]'::jsonb);
  v_without_market jsonb := '[]'::jsonb;
begin
  select coalesce(jsonb_agg(item), '[]'::jsonb)
  into v_without_market
  from jsonb_array_elements(v_actions) as item
  where lower(coalesce(item ->> 'label', '')) <> 'eco market';

  new.quick_actions :=
    jsonb_build_array(jsonb_build_object('label', 'Eco Market', 'href', './market.html'))
    || v_without_market;

  if coalesce(new.quick_actions_title, '') = '' then
    new.quick_actions_title := 'Eco Market & AI';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_user_dashboard_stats_normalize_actions on public.user_dashboard_stats;
create trigger trg_user_dashboard_stats_normalize_actions
before insert or update of quick_actions, quick_actions_title on public.user_dashboard_stats
for each row
execute function public.normalize_dashboard_quick_actions();

-- Backfill existing rows so current users see the Eco Market button immediately.
update public.user_dashboard_stats
set quick_actions = coalesce(quick_actions, '[]'::jsonb);
