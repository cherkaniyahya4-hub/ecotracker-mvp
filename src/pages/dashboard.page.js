import { requireAuthenticatedUser } from "../services/auth.service.js";
import { getOrCreateProfile } from "../services/profile.service.js";
import { getDashboardContent } from "../services/page-content.service.js";
import { initTheme, initLogoutLinks } from "./common.js";
import { initTaskList } from "./task-list.js";

const setText = (selector, value) => {
  const element = document.querySelector(selector);
  if (!element) return;
  if ("value" in element && element.tagName === "INPUT") {
    element.value = String(value ?? "");
    return;
  }
  element.textContent = String(value ?? "");
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const renderImpactCards = (cards) => {
  const container = document.querySelector("#impact-cards");
  if (!container) return;

  container.innerHTML = cards
    .map(
      (card) => `
        <article class="impact-card">
          <div class="impact-icon">${escapeHtml(card.icon)}</div>
          <div class="impact-value">${escapeHtml(card.value)}</div>
          <div class="impact-label">${escapeHtml(card.label)}</div>
          <p class="impact-desc">${escapeHtml(card.detail)}</p>
        </article>
      `,
    )
    .join("");
};

const renderBarSeries = (selector, series) => {
  const container = document.querySelector(selector);
  if (!container) return;

  container.innerHTML = series
    .map((item) => {
      const value = Math.max(0, Math.min(100, Number(item.value || 0)));
      return `<span class="chart-bar" data-label="${escapeHtml(item.label)}" style="height: ${value}%"></span>`;
    })
    .join("");
};

const renderDonutCards = (metrics) => {
  const container = document.querySelector("#donut-grid");
  if (!container) return;

  container.innerHTML = metrics
    .map(
      (metric) => `
        <article class="donut-card" style="--donut-value: ${escapeHtml(metric.value)}">
          <div class="donut">${escapeHtml(metric.value)}</div>
          <strong>${escapeHtml(metric.title)}</strong>
          <p>${escapeHtml(metric.description)}</p>
        </article>
      `,
    )
    .join("");
};

const formatPoints = (value) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    Number(value || 0),
  );

const renderLeaderboard = (leagueName, rows, nextRankText) => {
  const league = document.querySelector("#league-name");
  const nextRank = document.querySelector("#next-rank");
  const container = document.querySelector("#leaderboard-list");
  if (!container) return;

  if (league) league.textContent = leagueName || "";
  if (nextRank) nextRank.textContent = nextRankText || "";

  container.innerHTML = rows
    .map(
      (row, index) => `
        <div class="leader-item ${row.is_featured ? "me" : ""}">
          <div class="rank-box">${escapeHtml(index + 1)}</div>
          <div class="avatar-wrapper">
            ${
              row.avatar_src
                ? `<img src="${escapeHtml(row.avatar_src)}" alt="${escapeHtml(row.display_name)}" />`
                : `<div class="avatar-placeholder">${escapeHtml(
                    String(row.display_name || "?")
                      .split(" ")
                      .map((part) => part[0] || "")
                      .join("")
                      .slice(0, 2),
                  )}</div>`
            }
          </div>
          <div class="user-meta">
            <strong>${escapeHtml(row.display_name)}</strong>
            <span class="status-label">${escapeHtml(row.role_label || "")}</span>
          </div>
          <div class="score-box">${formatPoints(row.score)} <span>PTS</span></div>
        </div>
      `,
    )
    .join("");
};

const renderQuickActions = (title, actions) => {
  const titleEl = document.querySelector("#quick-actions-title");
  const container = document.querySelector("#quick-actions");
  if (!container) return;

  if (titleEl) titleEl.textContent = title || "";

  const safeActions = Array.isArray(actions) ? actions : [];
  const hasEcoMarket = safeActions.some(
    (action) =>
      String(action?.label || "").toLowerCase() === "eco market" ||
      String(action?.href || "").toLowerCase().includes("market"),
  );

  const normalizedActions = hasEcoMarket
    ? safeActions
    : [{ label: "Eco Market", href: "./market.html" }, ...safeActions];

  container.innerHTML = normalizedActions
    .map(
      (action, index) => `
        <a class="action-button ${index === 0 ? "primary" : ""}" href="${escapeHtml(action.href || "#")}">
          ${escapeHtml(action.label)}
        </a>
      `,
    )
    .join("");
};

const renderAiTiles = (tiles) => {
  const container = document.querySelector("#ai-tiles");
  if (!container) return;

  container.innerHTML = tiles
    .map(
      (tile) => `
        <article class="tile">
          <h3>${escapeHtml(tile.title)}</h3>
          <p>${escapeHtml(tile.description)}</p>
        </article>
      `,
    )
    .join("");
};

const renderFocusTasks = (tasks) => {
  const container = document.querySelector("#dashboard-focus-tasks");
  if (!container) return;

  container.innerHTML = tasks
    .map(
      (task) => `
        <li>
          <label>
            <input type="checkbox" class="task-checkbox" data-task-id="${escapeHtml(task.id)}" />
            <span>${escapeHtml(task.text)}</span>
          </label>
        </li>
      `,
    )
    .join("");
};

const renderTextList = (selector, values) => {
  const container = document.querySelector(selector);
  if (!container) return;

  container.innerHTML = values.map((value) => `<li>${escapeHtml(value)}</li>`).join("");
};

document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  initLogoutLinks();

  const message = document.querySelector("#dashboard-message");

  try {
    const user = await requireAuthenticatedUser();
    if (!user) return;

    const profile = await getOrCreateProfile(user);
    const adminLink = document.querySelector("#admin-link");
    if (adminLink) {
      const isAdmin = String(profile?.role || "user").toLowerCase() === "admin";
      adminLink.hidden = !isAdmin;
    }

    const data = await getDashboardContent(user.id);

    setText("#dashboard-date", data.date_label);
    setText("#dashboard-title", data.title);
    setText("#dashboard-subtitle", data.subtitle);
    renderImpactCards(data.impact_cards);
    setText("#dashboard-score", data.current_score);
    setText("#dashboard-score-delta", data.score_delta_text);
    setText("#map-status", data.map_status);
    setText("#map-search-placeholder", data.map_search_placeholder);
    setText("#map-highlight", data.map_highlight);
    setText("#map-next-dropoff-label", data.next_dropoff_label);
    setText("#map-next-dropoff-value", data.next_dropoff_value);
    renderBarSeries("#weekly-score-bars", data.weekly_score_series);
    setText("#weekly-score-note", data.weekly_score_note);
    renderBarSeries("#emission-bars", data.emission_series);
    setText("#emission-note", data.emission_note);
    renderDonutCards(data.donut_metrics);
    renderLeaderboard(data.league_name, data.leaderboard, data.next_rank_text);
    renderQuickActions(data.quick_actions_title, data.quick_actions);
    renderAiTiles(data.ai_tiles);
    renderFocusTasks(data.focus_tasks);
    renderTextList("#weekly-breakdown-list", data.weekly_breakdown);
    setText("#carbon-snapshot", data.carbon_snapshot);
    setText("#ecocoach-message", data.ecocoach_message);

    await initTaskList({ userId: user.id, page: "dashboard" });
  } catch (error) {
    console.error("Dashboard initialization failed:", error);
    if (message) {
      message.hidden = false;
      message.textContent = error?.message || "Unable to load dashboard data.";
    }
  }
});
