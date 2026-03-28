import { requireAuthenticatedUser } from "../services/auth.service.js";
import { getScanContent } from "../services/page-content.service.js";
import { initTheme, initLogoutLinks } from "./common.js";

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

const renderActionButtons = (items) => {
  const container = document.querySelector("#scan-action-buttons");
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

const renderSimpleList = (selector, values) => {
  const container = document.querySelector(selector);
  if (!container) return;
  container.innerHTML = values.map((value) => `<li>${escapeHtml(value)}</li>`).join("");
};

const renderEvents = (events) => {
  const container = document.querySelector("#scan-events-list");
  if (!container) return;

  if (!events.length) {
    container.innerHTML = "<li>No scan events yet.</li>";
    return;
  }

  container.innerHTML = events
    .map(
      (event) => `
        <li class="history-entry">
          <strong>${escapeHtml(event.event_label)}</strong>
          <p>${escapeHtml(event.title)} - ${escapeHtml(event.details)}</p>
        </li>
      `,
    )
    .join("");
};

document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  initLogoutLinks();

  const message = document.querySelector("#scan-message");

  try {
    const user = await requireAuthenticatedUser();
    if (!user) return;

    const data = await getScanContent(user.id);

    setText("#scan-guidance-title", data.instant_guidance_title);
    setText("#scan-title", data.title);
    setText("#scan-subtitle", data.subtitle);
    setText("#scan-guidance-title", data.instant_guidance_title);
    setText("#scan-guidance-subtitle", data.instant_guidance_subtitle);
    renderActionButtons(data.action_buttons);
    setText("#scan-camera-title", data.camera_title);
    setText("#scan-camera-subtitle", data.camera_subtitle);
    setText("#scan-camera-status", data.camera_status);
    renderSimpleList("#scan-ai-waste-list", data.ai_waste_items);
    renderSimpleList("#scan-barcode-list", data.barcode_items);
    renderEvents(data.events);
    setText("#scan-recent-summary", data.recent_scans_summary);
    setText("#scan-ecocoach-tip", data.ecocoach_tip);
    setText("#scan-rewards", data.rewards_text);
  } catch (error) {
    console.error("Scan page initialization failed:", error);
    if (message) {
      message.hidden = false;
      message.textContent = error?.message || "Unable to load scan page data.";
    }
  }
});
