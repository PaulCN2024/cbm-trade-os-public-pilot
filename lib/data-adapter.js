import {
  CRM_DB_KEY,
  LEGACY_WEBSITE_LEADS_KEY,
  WEBSITE_INQUIRIES_KEY,
  createEmptyDb,
  importWebsiteInquiries,
  normalizeWebsiteForm,
  readJson,
  readWebsiteInquiries,
  saveLegacyWebsiteLead,
  saveWebsiteInquiry,
  writeJson,
} from "./mock-crm.js";
import { getAdminAccessToken } from "./admin-auth.js";

const TRADE_OS_STORAGE_KEY = "cbm-trade-os-v2";

const configuredMode =
  window.__CBM_DATA_MODE__ ||
  window.__CBM_ENV__?.NEXT_PUBLIC_DATA_MODE ||
  document.documentElement.dataset.dataMode ||
  localStorage.getItem("cbm-data-mode") ||
  "mock";

export const DATA_MODE = configuredMode === "supabase" ? "supabase" : "mock";

function isSupabaseMode() {
  return DATA_MODE === "supabase";
}

function readTradeOsDb() {
  return createEmptyDb(readJson(TRADE_OS_STORAGE_KEY, {}));
}

function saveTradeOsDb(db) {
  const existing = readJson(TRADE_OS_STORAGE_KEY, {});
  writeJson(TRADE_OS_STORAGE_KEY, {
    ...existing,
    leads: db.leads,
    customers: db.customers,
    inquiries: db.inquiries,
    follow_up_tasks: db.follow_up_tasks,
    attachments: db.attachments,
  });
}

async function requestJson(url, options = {}) {
  const authToken = getAdminAccessToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }
  return payload;
}

export async function createWebsiteInquiry(input, options = {}) {
  const inquiry = normalizeWebsiteForm(input);
  if (!isSupabaseMode()) {
    saveWebsiteInquiry(inquiry);
    if (options.legacyLead) saveLegacyWebsiteLead(options.legacyLead);
    return { mode: "mock", inquiry };
  }
  const result = await requestJson("/api/public-inquiries", {
    method: "POST",
    body: JSON.stringify({ inquiry }),
    headers: {},
  });
  return { mode: "supabase", ...result };
}

export async function importWebsiteInquiriesIntoCrm() {
  if (!isSupabaseMode()) {
    const db = readTradeOsDb();
    const imported = importWebsiteInquiries(db);
    saveTradeOsDb(db);
    return { mode: "mock", imported, db };
  }
  const data = await loadPilotData();
  return { mode: "supabase", imported: [], db: data, message: "Supabase mode reads submitted inquiries directly from API." };
}

export async function listInquiries() {
  if (!isSupabaseMode()) return readTradeOsDb().inquiries;
  const payload = await requestJson("/api/inquiries");
  return payload.inquiries || [];
}

export async function listLeads() {
  if (!isSupabaseMode()) return readTradeOsDb().leads;
  const payload = await requestJson("/api/inquiries");
  return payload.leads || [];
}

export async function listCustomers() {
  if (!isSupabaseMode()) return readTradeOsDb().customers;
  const payload = await requestJson("/api/customers");
  return payload.customers || [];
}

export async function listFollowUps() {
  if (!isSupabaseMode()) return readTradeOsDb().follow_up_tasks;
  const payload = await requestJson("/api/follow-ups");
  return payload.follow_up_tasks || [];
}

export async function updateLeadReviewStatus(leadId, status, note = "") {
  if (!isSupabaseMode()) {
    const db = readTradeOsDb();
    const lead = db.leads.find((item) => item.id === leadId);
    if (!lead) throw new Error("Lead not found");
    lead.status = status;
    lead.updated_at = new Date().toISOString();
    saveTradeOsDb(db);
    return { mode: "mock", lead };
  }
  return requestJson("/api/inquiries", {
    method: "PATCH",
    body: JSON.stringify({ lead_id: leadId, status, note }),
  });
}

export async function convertLeadToCustomer(leadId) {
  if (!isSupabaseMode()) {
    const db = readTradeOsDb();
    const { createCustomerFromLead } = await import("./mock-crm.js");
    const customer = createCustomerFromLead(db, leadId);
    saveTradeOsDb(db);
    return { mode: "mock", customer, lead: db.leads.find((item) => item.id === leadId) };
  }
  return requestJson("/api/inquiries", {
    method: "POST",
    body: JSON.stringify({ action: "convert_lead_to_customer", lead_id: leadId }),
  });
}

export async function loadPilotData() {
  if (!isSupabaseMode()) {
    const db = readTradeOsDb();
    return {
      mode: "mock",
      website_inquiries: readWebsiteInquiries(),
      leads: db.leads,
      customers: db.customers,
      inquiries: db.inquiries,
      follow_up_tasks: db.follow_up_tasks,
      attachments: db.attachments,
    };
  }
  const [inquiriesPayload, customersPayload, followUpsPayload] = await Promise.all([
    requestJson("/api/inquiries"),
    requestJson("/api/customers"),
    requestJson("/api/follow-ups"),
  ]);
  return {
    mode: "supabase",
    website_inquiries: [],
    leads: inquiriesPayload.leads || [],
    customers: customersPayload.customers || [],
    inquiries: inquiriesPayload.inquiries || [],
    follow_up_tasks: followUpsPayload.follow_up_tasks || [],
    attachments: inquiriesPayload.attachments || [],
  };
}

export function dataModeLabel() {
  return isSupabaseMode() ? "Supabase pilot mode" : "Mock localStorage mode";
}

export function storageKeys() {
  return {
    trade_os: TRADE_OS_STORAGE_KEY,
    crm_db: CRM_DB_KEY,
    website_inquiries: WEBSITE_INQUIRIES_KEY,
    legacy_website_leads: LEGACY_WEBSITE_LEADS_KEY,
  };
}
