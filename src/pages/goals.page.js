import { requireAuthenticatedUser } from "../services/auth.service.js";
import { getGoalsContent } from "../services/page-content.service.js";
import { initTheme, initLogoutLinks } from "./common.js";
import { initTaskList } from "./task-list.js";

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const setText = (selector, value) => {
  const element = document.querySelector(selector);
  if (!element) return;
  element.textContent = String(value ?? "");
};

const initGoalFilters = () => {
  const group = document.querySelector("[data-filter-group]");
  const items = document.querySelectorAll("[data-category]");

  if (!group || items.length === 0) return;

  group.addEventListener("click", (event) => {
    const button = event.target.closest(".filter-btn");
    if (!button) return;

    const filter = button.dataset.filter || "all";
    group
      .querySelectorAll(".filter-btn")
      .forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    items.forEach((item) => {
      const category = item.dataset.category;
      item.classList.toggle("hidden", !(filter === "all" || category === filter));
    });
  });
};

const renderQuickActions = (items) => {
  const container = document.querySelector("#goals-quick-actions");
  if (!container) return;

  container.innerHTML = items
    .map(
      (item, index) => `
        <a class="action-button ${index === 0 ? "primary" : ""}" href="${escapeHtml(item.href || "#")}">
          ${escapeHtml(item.label)}
        </a>
      `,
    )
    .join("");
};

const renderFocusAreas = (areas) => {
  const container = document.querySelector("#goals-focus-list");
  if (!container) return;

  container.innerHTML = areas
    .map((area, index) => {
      const progress = Math.max(0, Math.min(100, Number(area.progress || [70, 45, 60][index] || 50)));
      return `
        <li class="progress-item" data-category="${escapeHtml(area.category || "all")}">
          <strong>${escapeHtml(area.title)}</strong>
          <p>${escapeHtml(area.description)}</p>
          <div class="progress-bar"><span style="width: ${progress}%"></span></div>
        </li>
      `;
    })
    .join("");
};

const renderNudges = (nudges) => {
  const container = document.querySelector("#goals-nudges-list");
  if (!container) return;

  container.innerHTML = nudges
    .map(
      (nudge) => `
        <li>
          <label>
            <input type="checkbox" class="task-checkbox" data-task-id="${escapeHtml(nudge.id)}" />
            <span>${escapeHtml(nudge.text)}</span>
          </label>
        </li>
      `,
    )
    .join("");
};

document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  initLogoutLinks();

  const message = document.querySelector("#goals-message");

  try {
    const user = await requireAuthenticatedUser();
    if (!user) return;

    const data = await getGoalsContent(user.id);

    setText("#goals-title", data.title);
    setText("#goals-subtitle", data.subtitle);
    renderQuickActions(data.quick_actions);
    renderFocusAreas(data.focus_areas);
    setText("#goals-current-streak", data.current_streak);
    setText("#goals-badges", data.badges_unlocked);
    setText("#goals-upcoming-challenge", data.upcoming_challenge);
    renderNudges(data.nudges);
    setText("#goals-health", data.goal_health);
    setText("#goals-rewards-queue", data.rewards_queue);

    initGoalFilters();
    await initTaskList({ userId: user.id, page: "goals" });
  } catch (error) {
    console.error("Goals initialization failed:", error);
    if (message) {
      message.hidden = false;
      message.textContent = error?.message || "Unable to load goals data.";
    }
  }
});
