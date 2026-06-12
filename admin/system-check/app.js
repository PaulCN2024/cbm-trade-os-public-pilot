import { getAdminAccessToken, getAdminSession, publicEnv, requireAdminAuth, signOutAdmin } from "../../lib/admin-auth.js";

if (!requireAdminAuth()) {
  throw new Error("Admin login required");
}

const envChecks = document.querySelector("#envChecks");
const apiChecks = document.querySelector("#apiChecks");
const identityChecks = document.querySelector("#identityChecks");
const cleanupChecks = document.querySelector("#cleanupChecks");
const cleanupStatus = document.querySelector("#cleanupStatus");
const cleanupConfirmInput = document.querySelector("#cleanupConfirmInput");
const loadCleanupButton = document.querySelector("#loadCleanupButton");
const cleanupButton = document.querySelector("#cleanupButton");
const refreshButton = document.querySelector("#refreshButton");
const logoutButton = document.querySelector("#logoutButton");

function yesNo(value) {
  return value ? "yes" : "no";
}

function checkCard(label, value, ok = null) {
  const normalized = ok === null ? value === "yes" || value === "supabase" || value === "mock" : ok;
  return `<article class="check ${normalized ? "yes" : "no"}"><span>${label}</span><strong>${value}</strong></article>`;
}

async function requestJson(url) {
  const token = getAdminAccessToken();
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const payload = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, payload };
}

async function requestJsonWithMethod(url, method, body = null) {
  const token = getAdminAccessToken();
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : null,
  });
  const payload = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, payload };
}

function renderCleanupCounts(payload = {}) {
  const counts = payload.counts || {};
  cleanupChecks.innerHTML = [
    checkCard("Cleanup API authenticated", payload.ok === false ? "no" : "yes", payload.ok !== false),
    checkCard("leads", String(counts.leads ?? "-"), true),
    checkCard("customers", String(counts.customers ?? "-"), true),
    checkCard("inquiries", String(counts.inquiries ?? "-"), true),
    checkCard("follow_up_tasks", String(counts.follow_up_tasks ?? "-"), true),
    checkCard("attachments", String(counts.attachments ?? "-"), true),
  ].join("");
}

async function render() {
  const env = publicEnv();
  const session = getAdminSession();
  const adminHealth = await requestJson("/api/admin-health");
  const [inquiries, customers, followUps] = await Promise.all([
    requestJson("/api/inquiries"),
    requestJson("/api/customers"),
    requestJson("/api/follow-ups"),
  ]);

  const mode = env.NEXT_PUBLIC_DATA_MODE || localStorage.getItem("cbm-data-mode") || "mock";
  const adminEmail = session?.user?.email || adminHealth.payload?.admin_email || "mock mode / unknown";
  identityChecks.innerHTML = [
    checkCard("Current admin email", adminEmail, true),
    checkCard("Current data mode", mode, mode === "mock" || mode === "supabase"),
    checkCard("Supabase configured", yesNo(Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)), mode === "mock" || Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)),
  ].join("");

  envChecks.innerHTML = [
    checkCard("NEXT_PUBLIC_DATA_MODE", mode, mode === "mock" || mode === "supabase"),
    checkCard("Supabase URL configured", yesNo(Boolean(env.NEXT_PUBLIC_SUPABASE_URL)), mode === "mock" || Boolean(env.NEXT_PUBLIC_SUPABASE_URL)),
    checkCard(
      "Supabase publishable key configured",
      yesNo(Boolean(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)),
      mode === "mock" || Boolean(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
    ),
    checkCard(
      "Server secret key configured",
      adminHealth.payload?.server_secret_key_configured ? "yes" : "no / not readable",
      mode === "mock" || Boolean(adminHealth.payload?.server_secret_key_configured),
    ),
    checkCard("Current admin user email", adminEmail, true),
    checkCard("Current mode", mode, mode === "mock" || mode === "supabase"),
  ].join("");

  apiChecks.innerHTML = [
    checkCard("Admin health authenticated", yesNo(adminHealth.payload?.authenticated || mode === "mock"), adminHealth.ok || mode === "mock"),
    checkCard("Can read inquiries", yesNo(inquiries.ok || mode === "mock"), inquiries.ok || mode === "mock"),
    checkCard("Can read customers", yesNo(customers.ok || mode === "mock"), customers.ok || mode === "mock"),
    checkCard("Can read follow-ups", yesNo(followUps.ok || mode === "mock"), followUps.ok || mode === "mock"),
    checkCard("Lead count", String(adminHealth.payload?.counts?.leads ?? "mock/local"), true),
    checkCard("Inquiry count", String(adminHealth.payload?.counts?.inquiries ?? "mock/local"), true),
  ].join("");
}

refreshButton.addEventListener("click", render);
logoutButton.addEventListener("click", async () => {
  logoutButton.disabled = true;
  await signOutAdmin();
  window.location.assign("/admin/login?signed_out=1");
});
loadCleanupButton.addEventListener("click", async () => {
  cleanupStatus.textContent = "Checking pilot data...";
  const result = await requestJson("/api/admin-pilot-cleanup");
  renderCleanupCounts({ ...result.payload, ok: result.ok });
  cleanupStatus.textContent = result.ok ? "Pilot data counts loaded." : `Cleanup check failed: ${result.payload.error || result.status}`;
});
cleanupButton.addEventListener("click", async () => {
  const confirmPhrase = cleanupConfirmInput.value.trim();
  if (confirmPhrase !== "DELETE PILOT TEST DATA") {
    cleanupStatus.textContent = "Type DELETE PILOT TEST DATA before deleting pilot records.";
    return;
  }
  const confirmed = window.confirm("Development / pilot cleanup only. Delete pilot Supabase CRM rows now?");
  if (!confirmed) return;
  cleanupButton.disabled = true;
  cleanupStatus.textContent = "Deleting pilot test data...";
  const result = await requestJsonWithMethod("/api/admin-pilot-cleanup", "DELETE", { confirm_phrase: confirmPhrase });
  cleanupButton.disabled = false;
  if (result.ok) {
    renderCleanupCounts({ counts: result.payload.after, ok: true });
    cleanupStatus.textContent = "Pilot cleanup completed.";
    await render();
  } else {
    cleanupStatus.textContent = `Pilot cleanup failed: ${result.payload.error || result.status}`;
  }
});
render();
