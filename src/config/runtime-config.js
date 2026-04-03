// Fetch config from API endpoint (which loads from env variables).
// Exposes window.__runtimeConfigReady — a Promise that resolves when
// window.ECOTRACKER_CONFIG is populated, so page modules can await it.
window.__runtimeConfigReady = (async function loadRuntimeConfig() {
  try {
    const response = await fetch('/api/config.js');
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Config API returned ${response.status}`);
    }
    const configScript = await response.text();
    const scriptEl = document.createElement('script');
    scriptEl.textContent = configScript;
    document.head.appendChild(scriptEl);
  } catch (error) {
    console.error('Failed to load runtime config:', error);
    window.ECOTRACKER_CONFIG = Object.freeze({
      SUPABASE_URL: "",
      SUPABASE_ANON_KEY: "",
    });
  }
})();
