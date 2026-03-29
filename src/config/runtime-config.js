// Fetch config from API endpoint (which loads from env variables)
async function loadRuntimeConfig() {
  try {
    const response = await fetch('/api/config.js');
    const configScript = await response.text();
    eval(configScript);
  } catch (error) {
    console.error('Failed to load runtime config:', error);
    // Fallback to empty config for offline development
    window.ECOTRACKER_CONFIG = Object.freeze({
      SUPABASE_URL: "",
      SUPABASE_ANON_KEY: "",
    });
  }
}

// Load config immediately
loadRuntimeConfig();
