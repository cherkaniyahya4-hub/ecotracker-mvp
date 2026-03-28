import { requireAuthenticatedUser } from "../services/auth.service.js";
import { getOrCreateProfile, updateProfile } from "../services/profile.service.js";
import { initTheme, initLogoutLinks } from "./common.js";

const profileFieldMap = {
  full_name: "name",
  city: "city",
  preferred_mode: "mode",
  primary_goal: "goal",
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

document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  initLogoutLinks();

  const form = document.querySelector(".profile-form");
  const alertElement = document.querySelector("#profile-alert");

  if (!form) return;

  try {
    const user = await requireAuthenticatedUser();
    if (!user) return;

    const profile = await getOrCreateProfile(user);
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
  }
});
