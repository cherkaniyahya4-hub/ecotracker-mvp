import { ensureSupabaseReady } from "../lib/supabase.js";

export const getTaskState = async ({ userId, page }) => {
  if (!userId || !page) return {};
  const client = ensureSupabaseReady();

  const { data, error } = await client
    .from("user_tasks")
    .select("task_id, completed")
    .eq("user_id", userId)
    .eq("page", page);

  if (error) {
    throw error;
  }

  if (!Array.isArray(data)) {
    return {};
  }

  return data.reduce((acc, row) => {
    acc[row.task_id] = Boolean(row.completed);
    return acc;
  }, {});
};

export const setTaskState = async ({ userId, page, taskId, completed }) => {
  if (!userId || !page || !taskId) return;
  const client = ensureSupabaseReady();

  const { error } = await client.from("user_tasks").upsert(
    {
      user_id: userId,
      page,
      task_id: taskId,
      completed: Boolean(completed),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,page,task_id" },
  );

  if (error) {
    throw error;
  }
};
