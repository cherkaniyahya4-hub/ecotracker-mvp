const root = document.documentElement;
const THEME_KEY = "ecotracker-theme";
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

const storedTheme = localStorage.getItem(THEME_KEY);
const initialTheme = storedTheme || (prefersDark.matches ? "dark" : "light");
root.dataset.theme = initialTheme;

const applyTheme = (theme) => {
  root.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    const label = theme === "dark" ? "☀️ Light mode" : "🌙 Dark mode";
    button.textContent = label;
  });
};

const initTheme = () => {
  applyTheme(root.dataset.theme);

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-theme-toggle]");
    if (!trigger) return;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
  });
};

prefersDark.addEventListener("change", (event) => {
  if (localStorage.getItem(THEME_KEY)) return;
  applyTheme(event.matches ? "dark" : "light");
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTheme);
} else {
  initTheme();
}
