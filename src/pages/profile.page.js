import { requireAuthenticatedUser } from "../services/auth.service.js";
import { getProfileContent } from "../services/page-content.service.js";
import { getOrCreateProfile, updateProfile } from "../services/profile.service.js";
import { initTheme, initLogoutLinks } from "./common.js";

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const profileFieldMap = {
  full_name: "name",
  city: "city",
  preferred_mode: "mode",
  primary_goal: "goal",
};

const setText = (selector, value) => {
  const element = document.querySelector(selector);
  if (!element) return;
  element.textContent = String(value ?? "");
};

const applyProfileToForm = (form, profile) => {
  Object.entries(profileFieldMap).forEach(([profileKey, inputName]) => {
    const input = form.elements[inputName];
    if (!input) return;

    if (input.tagName === "SELECT") {
      const optionExists = Array.from(input.options).some(
        (option) => option.value === profile[profileKey] || option.text === profile[profileKey],
      );

      if (!optionExists && profile[profileKey]) {
        const customOption = new Option(profile[profileKey], profile[profileKey], true, true);
        input.add(customOption);
      }
    }

    input.value = profile[profileKey] || "";
  });
};

const showProfileAlert = (element, message, isError = false) => {
  if (!element) return;
  element.hidden = false;
  element.textContent = message;
  element.classList.toggle("error", isError);
  window.setTimeout(() => {
    element.hidden = true;
  }, 2800);
};

const renderQuickActions = (items) => {
  const container = document.querySelector("#profile-quick-actions");
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

const renderList = (selector, values) => {
  const container = document.querySelector(selector);
  if (!container) return;
  container.innerHTML = values.map((value) => `<li>${escapeHtml(value)}</li>`).join("");
};

document.addEventListener("DOMContentLoaded", async () => {
  await (window.__runtimeConfigReady || Promise.resolve());
  initTheme();
  initLogoutLinks();

  const form = document.querySelector(".profile-form");
  const alertElement = document.querySelector("#profile-alert");
  const message = document.querySelector("#profile-message");

  if (!form) return;

  try {
    const user = await requireAuthenticatedUser();
    if (!user) return;

    const [profile, profileContent] = await Promise.all([
      getOrCreateProfile(user),
      getProfileContent(user.id),
    ]);

    setText("#profile-title", profileContent.title);
    setText("#profile-subtitle", profileContent.subtitle);
    renderQuickActions(profileContent.quick_actions);
    renderList("#profile-personal-items", profileContent.personal_profile_items);
    setText("#profile-connected-accounts", profileContent.connected_accounts);
    setText("#profile-community-rank", profileContent.community_rank);
    setText("#profile-support-text", profileContent.support_text);
    renderList("#profile-account-controls", profileContent.account_controls);
    setText("#profile-persona-text", profileContent.persona_text);
    setText("#profile-support-status", profileContent.support_status);

    applyProfileToForm(form, profile);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const payload = {
        full_name: String(formData.get("name") || "").trim(),
        city: String(formData.get("city") || "").trim(),
        preferred_mode: String(formData.get("mode") || "").trim(),
        primary_goal: String(formData.get("goal") || "").trim(),
      };

      try {
        await updateProfile(user.id, payload);
        showProfileAlert(alertElement, "Profile updated successfully.");
      } catch (error) {
        console.error("Failed to update profile:", error);
        showProfileAlert(alertElement, "Profile update failed.", true);
      }
    });
  } catch (error) {
    console.error("Profile initialization failed:", error);
    if (message) {
      message.hidden = false;
      message.textContent = error?.message || "Unable to load profile data.";
    }
  }
});
