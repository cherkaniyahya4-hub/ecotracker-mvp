import { requireAuthenticatedUser } from "../services/auth.service.js";
import { getOrCreateProfile } from "../services/profile.service.js";
import { initTheme, initLogoutLinks } from "./common.js";
import { initTaskList } from "./task-list.js";

document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  initLogoutLinks();

  try {
    const user = await requireAuthenticatedUser();
    if (!user) return;

    const profile = await getOrCreateProfile(user);
    const adminLink = document.querySelector("#admin-link");
    if (adminLink) {
      const isAdmin = String(profile?.role || "user").toLowerCase() === "admin";
      adminLink.hidden = !isAdmin;
    }

    await initTaskList({ userId: user.id, page: "dashboard" });
  } catch (error) {
    console.error("Dashboard initialization failed:", error);
  }
});
