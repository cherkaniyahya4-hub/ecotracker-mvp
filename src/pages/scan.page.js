import { requireAuthenticatedUser } from "../services/auth.service.js";
import { initTheme, initLogoutLinks } from "./common.js";

document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  initLogoutLinks();

  try {
    await requireAuthenticatedUser();
  } catch (error) {
    console.error("Scan page initialization failed:", error);
  }
});
