import { requireAuthenticatedUser } from "../services/auth.service.js";
import { initTheme, initLogoutLinks } from "./common.js";
import { initTaskList } from "./task-list.js";

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
      const isVisible = filter === "all" || category === filter;
      item.classList.toggle("hidden", !isVisible);
    });
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  initLogoutLinks();
  initGoalFilters();

  try {
    const user = await requireAuthenticatedUser();
    if (!user) return;
    await initTaskList({ userId: user.id, page: "goals" });
  } catch (error) {
    console.error("Goals initialization failed:", error);
  }
});
