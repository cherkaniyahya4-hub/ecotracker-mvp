const taskStorageKey = "ecotracker-task-state";

const loadTaskState = () => {
  try {
    return JSON.parse(localStorage.getItem(taskStorageKey)) || {};
  } catch {
    return {};
  }
};

const saveTaskState = (state) => {
  localStorage.setItem(taskStorageKey, JSON.stringify(state));
};

const initTasks = () => {
  const state = loadTaskState();
  document.querySelectorAll(".task-checkbox").forEach((checkbox) => {
    const taskId = checkbox.dataset.taskId;
    if (!taskId) return;
    checkbox.checked = Boolean(state[taskId]);
    checkbox.closest("li")?.classList.toggle("completed", checkbox.checked);
    checkbox.addEventListener("change", () => {
      state[taskId] = checkbox.checked;
      saveTaskState(state);
      checkbox.closest("li")?.classList.toggle("completed", checkbox.checked);
    });
  });
};

const initProfileForm = () => {
  const form = document.querySelector(".profile-form");
  const alertEl = document.querySelector("#profile-alert");
  if (!form || !alertEl) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    alertEl.hidden = false;
    alertEl.textContent = "Profile updated successfully!";
    setTimeout(() => {
      alertEl.hidden = true;
    }, 2800);
  });
};

const initGoalFilters = () => {
  const group = document.querySelector("[data-filter-group]");
  const items = document.querySelectorAll("[data-category]");
  if (!group || items.length === 0) return;
  group.addEventListener("click", (event) => {
    const btn = event.target.closest(".filter-btn");
    if (!btn) return;
    const filter = btn.dataset.filter || "all";
    group.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    items.forEach((item) => {
      const cat = item.dataset.category;
      const match = filter === "all" || cat === filter;
      item.classList.toggle("hidden", !match);
    });
  });
};

document.addEventListener("DOMContentLoaded", () => {
  initTasks();
  initProfileForm();
  initGoalFilters();
});
