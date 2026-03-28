import { ensureSupabaseReady } from "../lib/supabase.js";

const asArray = (value) => (Array.isArray(value) ? value : []);

const requireRow = (row, message) => {
  if (!row) {
    throw new Error(message);
  }
  return row;
};

const ensureUserContent = async (client, userId) => {
  if (!userId) return;
  const { error } = await client.rpc("ensure_user_content", { p_user_id: userId });
  if (error) {
    const message = String(error.message || "").toLowerCase();
    if (message.includes("ensure_user_content") && message.includes("does not exist")) {
      return;
    }
    throw error;
  }
};

export const getDashboardContent = async (userId) => {
  const client = ensureSupabaseReady();

  const loadDashboard = async () =>
    Promise.all([
      client
        .from("user_dashboard_stats")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),
      client
        .from("dashboard_leaderboard")
        .select("rank, display_name, role_label, score, avatar_url, is_featured")
        .order("rank", { ascending: true }),
    ]);

  let [statsResult, leaderboardResult] = await loadDashboard();

  if (statsResult.error) throw statsResult.error;
  if (leaderboardResult.error) throw leaderboardResult.error;

  if (!statsResult.data) {
    await ensureUserContent(client, userId);
    [statsResult, leaderboardResult] = await loadDashboard();
  }

  if (statsResult.error) throw statsResult.error;
  if (leaderboardResult.error) throw leaderboardResult.error;

  const stats = requireRow(statsResult.data, "Dashboard content is missing for this user.");

  return {
    ...stats,
    impact_cards: asArray(stats.impact_cards),
    weekly_score_series: asArray(stats.weekly_score_series),
    emission_series: asArray(stats.emission_series),
    donut_metrics: asArray(stats.donut_metrics),
    quick_actions: asArray(stats.quick_actions),
    ai_tiles: asArray(stats.ai_tiles),
    focus_tasks: asArray(stats.focus_tasks),
    weekly_breakdown: asArray(stats.weekly_breakdown),
    leaderboard: asArray(leaderboardResult.data),
  };
};

export const getGoalsContent = async (userId) => {
  const client = ensureSupabaseReady();
  let { data, error } = await client
    .from("user_goals_content")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    await ensureUserContent(client, userId);
    const retry = await client
      .from("user_goals_content")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    data = retry.data;
    error = retry.error;
  }

  if (error) throw error;
  const row = requireRow(data, "Goals content is missing for this user.");

  return {
    ...row,
    quick_actions: asArray(row.quick_actions),
    focus_areas: asArray(row.focus_areas),
    nudges: asArray(row.nudges),
  };
};

export const getScanContent = async (userId) => {
  const client = ensureSupabaseReady();

  const loadScan = async () =>
    Promise.all([
      client
        .from("user_scan_content")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),
      client
        .from("scan_events")
        .select("id, event_label, title, details, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(12),
    ]);

  let [contentResult, eventsResult] = await loadScan();

  if (contentResult.error) throw contentResult.error;
  if (eventsResult.error) throw eventsResult.error;

  if (!contentResult.data) {
    await ensureUserContent(client, userId);
    [contentResult, eventsResult] = await loadScan();
  }

  if (contentResult.error) throw contentResult.error;
  if (eventsResult.error) throw eventsResult.error;

  const row = requireRow(contentResult.data, "Scan content is missing for this user.");

  return {
    ...row,
    action_buttons: asArray(row.action_buttons),
    ai_waste_items: asArray(row.ai_waste_items),
    barcode_items: asArray(row.barcode_items),
    events: asArray(eventsResult.data),
  };
};

export const getProfileContent = async (userId) => {
  const client = ensureSupabaseReady();
  let { data, error } = await client
    .from("user_profile_content")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    await ensureUserContent(client, userId);
    const retry = await client
      .from("user_profile_content")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    data = retry.data;
    error = retry.error;
  }

  if (error) throw error;
  const row = requireRow(data, "Profile content is missing for this user.");

  return {
    ...row,
    quick_actions: asArray(row.quick_actions),
    personal_profile_items: asArray(row.personal_profile_items),
    account_controls: asArray(row.account_controls),
  };
};
