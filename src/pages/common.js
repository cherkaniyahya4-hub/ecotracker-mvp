import { isSupabaseConfigured } from "../lib/supabase.js";
import { signOutCurrentUser } from "../services/auth.service.js";

const THEME_KEY = "ecotracker-theme";
const root = document.documentElement;
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

const setThemeToggleLabel = (theme) => {
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.textContent = theme === "dark" ? "Light mode" : "Dark mode";
  });
};

const applyTheme = (theme) => {
  root.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  setThemeToggleLabel(theme);
};

export const initTheme = () => {
  const storedTheme = localStorage.getItem(THEME_KEY);
  const initialTheme = storedTheme || (prefersDark.matches ? "dark" : "light");
  root.dataset.theme = initialTheme;
  setThemeToggleLabel(initialTheme);

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-theme-toggle]");
    if (!trigger) return;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
  });

  prefersDark.addEventListener("change", (event) => {
    if (localStorage.getItem(THEME_KEY)) return;
    applyTheme(event.matches ? "dark" : "light");
  });
};

export const initLogoutLinks = () => {
  document.querySelectorAll(".logout-link").forEach((link) => {
    link.addEventListener("click", async (event) => {
      event.preventDefault();
      try {
        await signOutCurrentUser();
      } finally {
        window.location.href = "./login.html";
      }
    });
  });
};

export const setMessage = (element, text, type = "info") => {
  if (!element) return;
  element.hidden = false;
  element.textContent = text;
  element.dataset.type = type;
};

export const clearMessage = (element) => {
  if (!element) return;
  element.hidden = true;
  element.textContent = "";
  element.dataset.type = "";
};

export const maybeShowRuntimeInfo = (element) => {
  if (!element || isSupabaseConfigured) return;
  setMessage(
    element,
    "Supabase is not configured. Add runtime credentials to use authentication and data.",
    "error",
  );
};
