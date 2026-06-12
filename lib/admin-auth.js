const SESSION_KEY = "cbm-supabase-auth-session";
const LEGACY_TOKEN_KEY = "cbm-supabase-access-token";

export function publicEnv() {
  return window.__CBM_ENV__ || {};
}

export function dataMode() {
  return (
    window.__CBM_DATA_MODE__ ||
    publicEnv().NEXT_PUBLIC_DATA_MODE ||
    document.documentElement.dataset.dataMode ||
    localStorage.getItem("cbm-data-mode") ||
    "mock"
  );
}

export function isSupabaseMode() {
  return dataMode() === "supabase";
}

export function getAdminSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

export function getAdminAccessToken() {
  const session = getAdminSession();
  if (session?.access_token && session?.expires_at && session.expires_at * 1000 > Date.now() + 30000) {
    return session.access_token;
  }
  return localStorage.getItem(LEGACY_TOKEN_KEY) || "";
}

export function isAdminAuthenticated() {
  if (!isSupabaseMode()) return true;
  return Boolean(getAdminAccessToken());
}

export function requireAdminAuth() {
  if (isAdminAuthenticated()) return true;
  const next = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
  window.location.replace(`/admin/login?next=${next}`);
  return false;
}

export async function signInAdmin(email, password) {
  const env = publicEnv();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publishableKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }
  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error_description || payload.msg || payload.error || "Login failed");
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  return payload;
}

export async function signOutAdmin() {
  const token = getAdminAccessToken();
  const env = publicEnv();
  try {
    if (token && env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
      await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/logout`, {
        method: "POST",
        headers: {
          apikey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.warn("Supabase sign out failed; clearing local session anyway.", error);
  } finally {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  }
}
