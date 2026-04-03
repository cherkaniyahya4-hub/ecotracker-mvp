import { initLogoutLinks, initTheme } from "./common.js";
import { getCurrentUser } from "../services/auth.service.js";

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const animateValue = (element) => {
  const end = Number(element.dataset.count || 0);
  if (!end || prefersReducedMotion) {
    element.textContent = String(end);
    return;
  }

  const duration = 1200;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    element.textContent = String(Math.round(end * progress));
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
};

const initCounters = () => {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateValue(entry.target);
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.6 },
  );

  counters.forEach((counter) => observer.observe(counter));
};

const initSmoothScroll = () => {
  document.querySelectorAll("[data-scroll]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href");
      if (!id || !id.startsWith("#")) return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  });
};

const syncHeaderAuthState = async () => {
  let isAuthenticated = false;
  try {
    const user = await getCurrentUser();
    isAuthenticated = Boolean(user);
  } catch (error) {
    console.error("Unable to read auth state on home page:", error);
  }

  document.querySelectorAll('[data-auth="in"]').forEach((element) => {
    element.hidden = !isAuthenticated;
  });

  document.querySelectorAll('[data-auth="out"]').forEach((element) => {
    element.hidden = isAuthenticated;
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  await (window.__runtimeConfigReady || Promise.resolve());
  initTheme();
  initLogoutLinks();
  await syncHeaderAuthState();
  initCounters();
  initSmoothScroll();
});
