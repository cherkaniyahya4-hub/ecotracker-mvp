import { ensureSupabaseReady } from "../lib/supabase.js";

const defaultProfile = (user) => ({
  id: user.id,
  email: user.email || "",
  full_name: user.email ? user.email.split("@")[0] : "EcoTracker User",
  role: String(user.email || "")
    .toLowerCase()
    .includes("admin")
    ? "admin"
    : "user",
  city: "Lyon, France",
  preferred_mode: "Bike + Transit",
  primary_goal: "Low-waste kitchen",
  points: 2450,
});

export const getOrCreateProfile = async (user) => {
  if (!user) return null;
  const client = ensureSupabaseReady();

  const { data: existingProfile, error } = await client
    .from("profiles")
    .select(
      "id, email, full_name, role, city, preferred_mode, primary_goal, points",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (existingProfile) {
    return existingProfile;
  }

  const initialProfile = defaultProfile(user);

  const { data: insertedProfile, error: insertError } = await client
    .from("profiles")
    .insert(initialProfile)
    .select(
      "id, email, full_name, role, city, preferred_mode, primary_goal, points",
    )
    .single();

  if (insertError) {
    throw insertError;
  }

  return insertedProfile;
};

export const updateProfile = async (userId, patch) => {
  if (!userId) {
    throw new Error("A valid user id is required to update profile.");
  }
  const client = ensureSupabaseReady();

  const { data, error } = await client
    .from("profiles")
    .update(patch)
    .eq("id", userId)
    .select(
      "id, email, full_name, role, city, preferred_mode, primary_goal, points",
    )
    .single();

  if (error) {
    throw error;
  }

  return data;
};
