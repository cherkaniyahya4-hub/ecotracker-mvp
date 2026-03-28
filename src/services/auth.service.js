import { ensureSupabaseReady } from "../lib/supabase.js";

export const getCurrentUser = async () => {
  const client = ensureSupabaseReady();

  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error) {
    if (String(error.message || "").toLowerCase().includes("auth session missing")) {
      return null;
    }
    throw error;
  }

  return user;
};

export const signInWithEmailPassword = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }
  const client = ensureSupabaseReady();

  const {
    data: { user },
    error,
  } = await client.auth.signInWithPassword({ email, password });

  if (error) {
    throw error;
  }

  return user;
};

export const signUpWithEmailPassword = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }
  const client = ensureSupabaseReady();

  const emailRedirectTo = window.location.href.split("#")[0];
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
    },
  });

  if (error) {
    throw error;
  }

  return {
    user: data.user,
    requiresEmailConfirmation: !data.session,
  };
};

export const signOutCurrentUser = async () => {
  const client = ensureSupabaseReady();

  const { error } = await client.auth.signOut();
  if (error) {
    throw error;
  }
};

export const requireAuthenticatedUser = async (redirectTo = "./login.html") => {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = redirectTo;
    return null;
  }
  return user;
};
