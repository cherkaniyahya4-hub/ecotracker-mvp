import {
  getCurrentUser,
  signInWithEmailPassword,
  signUpWithEmailPassword,
} from "../services/auth.service.js";
import {
  clearMessage,
  initTheme,
  maybeShowRuntimeInfo,
  setMessage,
} from "./common.js";

const redirectAfterLogin = () => {
  window.location.href = "./dashboard.html";
};

const toFriendlyAuthError = (error, mode) => {
  const rawMessage = String(error?.message || "").toLowerCase();
  if (rawMessage.includes("invalid login credentials")) {
    return "Invalid email or password. If this is your first time, click Sign up first.";
  }

  if (rawMessage.includes("user already registered")) {
    return "This email is already registered. Please log in.";
  }

  if (rawMessage.includes("email not confirmed")) {
    return "Please confirm your email address, then log in.";
  }

  if (rawMessage.includes("failed to fetch")) {
    return "Network error while contacting Supabase. Please try again.";
  }

  if (
    rawMessage.includes("database error querying schema") ||
    rawMessage.includes("database error finding user")
  ) {
    return "This account record is broken in Supabase Auth. Run the latest auth cleanup migration, then sign up again.";
  }

  if (rawMessage.includes("supabase_not_configured")) {
    return "Supabase credentials are missing. Configure runtime-config before signing in.";
  }

  return mode === "signup"
    ? "Unable to create account. Please try again."
    : "Unable to sign in. Please check your credentials.";
};

const initLoginForm = () => {
  let mode = "login";
  const form = document.querySelector("#login-form");
  const messageEl = document.querySelector("#auth-message");
  const authTitle = document.querySelector("#auth-title");
  const authSubtitle = document.querySelector("#auth-subtitle");
  const rememberLabel = document.querySelector("#auth-actions label");
  const forgotPasswordLink = document.querySelector("#forgot-password-link");
  const authTabs = Array.from(document.querySelectorAll("[data-auth-mode]"));
  const submitButton = form?.querySelector('button[type="submit"]');

  if (!form || !messageEl || !submitButton) return;

  const applyMode = (nextMode) => {
    mode = nextMode;
    const isSignup = mode === "signup";

    if (authTitle) {
      authTitle.textContent = isSignup ? "Create your account" : "Welcome back";
    }

    if (authSubtitle) {
      authSubtitle.textContent = isSignup
        ? "Sign up with email and password. Fast and simple."
        : "Sign in to view your EcoScore, goals, and scanners.";
    }

    if (forgotPasswordLink) {
      forgotPasswordLink.hidden = isSignup;
    }

    if (rememberLabel) {
      rememberLabel.hidden = isSignup;
    }

    submitButton.textContent = isSignup ? "Sign up" : "Log in";

    authTabs.forEach((tab) => {
      const isActive = tab.dataset.authMode === mode;
      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });
  };

  authTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const nextMode = tab.dataset.authMode === "signup" ? "signup" : "login";
      applyMode(nextMode);
      clearMessage(messageEl);
    });
  });

  applyMode(mode);
  maybeShowRuntimeInfo(messageEl);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage(messageEl);

    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();

    if (!email || !password) {
      setMessage(messageEl, "Please provide both email and password.", "error");
      return;
    }

    if (mode === "signup") {
      if (password.length < 8) {
        setMessage(
          messageEl,
          "Password must be at least 8 characters for sign up.",
          "error",
        );
        return;
      }
    }

    submitButton.disabled = true;
    submitButton.textContent = mode === "signup" ? "Creating account..." : "Signing in...";

    try {
      if (mode === "signup") {
        const result = await signUpWithEmailPassword({ email, password });

        if (result.requiresEmailConfirmation) {
          setMessage(
            messageEl,
            "Account created. Check your inbox and spam folder to confirm your email, then log in.",
            "success",
          );
          applyMode("login");
          form.reset();
          return;
        }

        setMessage(messageEl, "Account created successfully. Redirecting...", "success");
        redirectAfterLogin();
        return;
      }

      await signInWithEmailPassword({ email, password });
      redirectAfterLogin();
    } catch (error) {
      const errorMessage = toFriendlyAuthError(error, mode);
      setMessage(messageEl, errorMessage, "error");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = mode === "signup" ? "Sign up" : "Log in";
    }
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  await (window.__runtimeConfigReady || Promise.resolve());
  initTheme();
  initLoginForm();

  try {
    const user = await getCurrentUser();
    if (user) {
      redirectAfterLogin();
    }
  } catch (error) {
    console.error("Auth initialization failed:", error);
  }
});
