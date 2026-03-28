const runtimeConfig = window.ECOTRACKER_CONFIG || {};

const SUPABASE_URL = (runtimeConfig.SUPABASE_URL || "").trim();
const SUPABASE_ANON_KEY = (runtimeConfig.SUPABASE_ANON_KEY || "").trim();
const createClient =
  typeof window !== "undefined" &&
  window.supabase &&
  typeof window.supabase.createClient === "function"
    ? window.supabase.createClient
    : null;

export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 &&
  SUPABASE_ANON_KEY.length > 0 &&
  typeof createClient === "function";

if (SUPABASE_URL && SUPABASE_ANON_KEY && !createClient) {
  console.warn(
    "Supabase credentials found, but SDK is missing.",
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const ensureSupabaseReady = () => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      "SUPABASE_NOT_CONFIGURED: Check SUPABASE_URL and SUPABASE_ANON_KEY.",
    );
  }
  return supabase;
};
