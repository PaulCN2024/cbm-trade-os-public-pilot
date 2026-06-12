import { isSupabaseMode, signInAdmin } from "../../lib/admin-auth.js";

const form = document.querySelector("#loginForm");
const signInButton = document.querySelector("#signInButton");
const status = document.querySelector("#loginStatus");
const params = new URLSearchParams(window.location.search);
const next = params.get("next") || "/trade-os-prototype";

if (!isSupabaseMode()) {
  status.textContent = "Mock mode is active. Admin login is not required for local demo.";
} else if (params.get("signed_out") === "1") {
  status.textContent = "Signed out successfully.";
}

async function handleSignIn(event) {
  event?.preventDefault();
  const values = Object.fromEntries(new FormData(form).entries());
  status.textContent = "Signing in...";
  signInButton.disabled = true;
  try {
    await signInAdmin(values.email, values.password);
    status.textContent = "Login successful. Redirecting...";
    window.location.assign(next);
  } catch (error) {
    status.textContent = `Login failed: ${error.message}`;
    signInButton.disabled = false;
  }
}

form.addEventListener("submit", handleSignIn);
signInButton.addEventListener("click", handleSignIn);
