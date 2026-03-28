import { getTaskState, setTaskState } from "../services/tasks.service.js";

export const initTaskList = async ({ userId, page }) => {
  const checkboxes = Array.from(document.querySelectorAll(".task-checkbox"));
  if (!checkboxes.length || !userId) return;

  let state = {};

  try {
    state = await getTaskState({ userId, page });
  } catch (error) {
    console.error("Failed to load task state:", error);
  }

  checkboxes.forEach((checkbox) => {
    const taskId = checkbox.dataset.taskId;
    if (!taskId) return;

    checkbox.checked = Boolean(state[taskId]);
    checkbox.closest("li")?.classList.toggle("completed", checkbox.checked);

    checkbox.addEventListener("change", async () => {
      checkbox.closest("li")?.classList.toggle("completed", checkbox.checked);
      try {
        await setTaskState({
          userId,
          page,
          taskId,
          completed: checkbox.checked,
        });
      } catch (error) {
        console.error("Failed to save task state:", error);
      }
    });
  });
};
