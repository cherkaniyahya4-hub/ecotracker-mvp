// Fetch config from API endpoint (which loads from env variables)
async function loadRuntimeConfig() {
  try {
    const response = await fetch('/api/config.js');
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Config API returned ${response.status}`);
    }
    const configScript = await response.text();
    // Execute the config script to set window.ECOTRACKER_CONFIG
    const scriptEl = document.createElement('script');
    scriptEl.textContent = configScript;
    document.head.appendChild(scriptEl);
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
