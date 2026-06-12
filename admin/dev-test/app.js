import {
  CRM_DB_KEY,
  LEGACY_WEBSITE_LEADS_KEY,
  TaskType,
  WEBSITE_INQUIRIES_KEY,
  createAfterSalesCaseFromShipment,
  createCustomerFromInquiry,
  createEmptyDb,
  createFollowUpTask,
  createOrderFromQuotation,
  createProjectFromInquiry,
  createQuotationDraft,
  createRepeatBusinessReminder,
  createShipmentFromOrder,
  importWebsiteInquiries,
  normalizeWebsiteForm,
  readWebsiteInquiries,
  saveWebsiteInquiry,
} from "../../lib/mock-crm.js";
import { requireAdminAuth } from "../../lib/admin-auth.js";

const TRADE_OS_STORAGE_KEY = "cbm-trade-os-v2";

if (!requireAdminAuth()) {
  throw new Error("Admin login required");
}
const actionResults = {
  sampleWebsiteInquiry: "NOT RUN",
  importWebsiteInquiries: "NOT RUN",
  convertLatestInquiryToCustomer: "NOT RUN",
  convertLatestInquiryToProject: "NOT RUN",
  createQuotationDraft: "NOT RUN",
  createOrder: "NOT RUN",
  createShipment: "NOT RUN",
  createAfterSales: "NOT RUN",
  createRepeatReminder: "NOT RUN",
  createFollowUpTask: "NOT RUN",
  exportMockData: "NOT RUN",
  clearAllMockData: "NOT RUN",
};

const actions = [
  ["sampleWebsiteInquiry", "Create sample website inquiry", createSampleWebsiteInquiry],
  ["importWebsiteInquiries", "Import website inquiries into CRM", importWebsiteInquiriesIntoCrm],
  ["convertLatestInquiryToCustomer", "Convert latest inquiry to customer", convertLatestInquiryToCustomer],
  ["convertLatestInquiryToProject", "Convert latest inquiry to project", convertLatestInquiryToProject],
  ["createQuotationDraft", "Create quotation draft from latest inquiry/project", createQuotationDraftFromLatest],
  ["createOrder", "Create order from latest quotation", createOrderFromLatestQuotation],
  ["createShipment", "Create shipment from latest order", createShipmentFromLatestOrder],
  ["createAfterSales", "Create after-sales from latest shipment", createAfterSalesFromLatestShipment],
  ["createRepeatReminder", "Create repeat business reminder", createRepeatReminderFromLatestAfterSales],
  ["createFollowUpTask", "Create follow-up task", createManualFollowUpTask],
  ["exportMockData", "Export all mock CRM data as JSON", exportAllMockData],
  ["clearAllMockData", "Clear all mock data", clearAllMockData],
];

const actionsEl = document.querySelector("#actions");
const countsEl = document.querySelector("#counts");
const recordsEl = document.querySelector("#records");
const resultsEl = document.querySelector("#results");
const devModeEnabled = new URLSearchParams(window.location.search).get("dev") === "1";

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function loadDb() {
  return createEmptyDb(readJson(TRADE_OS_STORAGE_KEY, {}));
}

function saveDb(db) {
  const existing = readJson(TRADE_OS_STORAGE_KEY, {});
  localStorage.setItem(
    TRADE_OS_STORAGE_KEY,
    JSON.stringify({
      ...existing,
      customers: db.customers,
      leads: db.leads,
      inquiries: db.inquiries,
      architectural_requirements: db.architectural_requirements,
      precision_requirements: db.precision_requirements,
      projects: db.projects,
      quotations: db.quotations,
      orders: db.orders,
      shipments: db.shipments,
      document_drafts: db.document_drafts,
      documents: db.documents,
      sellers: db.sellers,
      products: db.products,
      after_sales_cases: db.after_sales_cases,
      follow_up_tasks: db.follow_up_tasks,
      communication_logs: db.communication_logs,
      attachments: db.attachments,
    }),
  );
}

function latest(list) {
  return Array.isArray(list) && list.length ? list[0] : null;
}

function setResult(actionId, ok) {
  actionResults[actionId] = ok ? "SUCCESS" : "FAILED";
}

function runAction(actionId, action) {
  try {
    const ok = action();
    setResult(actionId, Boolean(ok));
  } catch (error) {
    console.error(error);
    setResult(actionId, false);
  }
  render();
}

function createSampleWebsiteInquiry() {
  const inquiry = normalizeWebsiteForm({
    createdAt: new Date().toISOString(),
    name: "Dev Test Buyer",
    company: "CBM Dev Test Facade Co.",
    email: "dev-test@example.com",
    whatsapp: "+1 555 0100",
    country: "Mexico",
    projectType: "Curtain wall / facade system",
    drawingStatus: "DWG drawings ready",
    quoteBasis: "Full project package",
    finish: "6063-T5 RAL 7016 powder coating",
    destination: "Manzanillo",
    support: "Glass / hardware; Shipping documents",
    details:
      "Development test inquiry for curtain wall profiles, cap, pressure plate, gasket, hardware, glass specification review, quantity around 800 m2, RAL color and destination port Manzanillo.",
    files: "dev-test-curtain-wall.dwg; schedule.xlsx",
  });
  saveWebsiteInquiry(inquiry);
  return true;
}

function importWebsiteInquiriesIntoCrm() {
  const db = loadDb();
  const imported = importWebsiteInquiries(db);
  saveDb(db);
  return imported.length > 0;
}

function convertLatestInquiryToCustomer() {
  const db = loadDb();
  const inquiry = latest(db.inquiries);
  if (!inquiry) return false;
  const customer = createCustomerFromInquiry(db, inquiry.id);
  saveDb(db);
  return Boolean(customer);
}

function convertLatestInquiryToProject() {
  const db = loadDb();
  const inquiry = latest(db.inquiries);
  if (!inquiry) return false;
  const project = createProjectFromInquiry(db, inquiry.id);
  saveDb(db);
  return Boolean(project);
}

function createQuotationDraftFromLatest() {
  const db = loadDb();
  const inquiry = latest(db.inquiries);
  if (!inquiry) return false;
  const quote = createQuotationDraft(db, inquiry.id, "inquiry");
  saveDb(db);
  return Boolean(quote);
}

function createOrderFromLatestQuotation() {
  const db = loadDb();
  const quotation = latest(db.quotations);
  if (!quotation) return false;
  const order = createOrderFromQuotation(db, quotation.id);
  saveDb(db);
  return Boolean(order);
}

function createShipmentFromLatestOrder() {
  const db = loadDb();
  const order = latest(db.orders);
  if (!order) return false;
  const shipment = createShipmentFromOrder(db, order.id);
  saveDb(db);
  return Boolean(shipment);
}

function createAfterSalesFromLatestShipment() {
  const db = loadDb();
  const shipment = latest(db.shipments);
  if (!shipment) return false;
  const afterSalesCase = createAfterSalesCaseFromShipment(db, shipment.id);
  saveDb(db);
  return Boolean(afterSalesCase);
}

function createRepeatReminderFromLatestAfterSales() {
  const db = loadDb();
  const afterSalesCase = latest(db.after_sales_cases);
  if (!afterSalesCase) return false;
  const task = createRepeatBusinessReminder(db, afterSalesCase.id);
  saveDb(db);
  return Boolean(task);
}

function createManualFollowUpTask() {
  const db = loadDb();
  const inquiry = latest(db.inquiries);
  if (!inquiry) return false;
  const task = createFollowUpTask(db, inquiry, TaskType.REQUEST_MISSING_INFO);
  saveDb(db);
  return Boolean(task);
}

function exportAllMockData() {
  const payload = {
    exported_at: new Date().toISOString(),
    storage_keys: {
      trade_os: TRADE_OS_STORAGE_KEY,
      crm_db: CRM_DB_KEY,
      website_inquiries: WEBSITE_INQUIRIES_KEY,
      legacy_website_leads: LEGACY_WEBSITE_LEADS_KEY,
    },
    trade_os: readJson(TRADE_OS_STORAGE_KEY, {}),
    website_inquiries: readJson(WEBSITE_INQUIRIES_KEY, []),
    legacy_website_leads: readJson(LEGACY_WEBSITE_LEADS_KEY, []),
    safety_boundary: [
      "No automatic customer messages",
      "No automatic official quotations",
      "No automatic PI",
      "No automatic price, delivery time, payment terms, bank account, compensation, or responsibility judgment",
    ],
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `cbm-trade-os-mock-data-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  return true;
}

function clearAllMockData() {
  localStorage.removeItem(WEBSITE_INQUIRIES_KEY);
  localStorage.removeItem(LEGACY_WEBSITE_LEADS_KEY);
  localStorage.removeItem(CRM_DB_KEY);
  localStorage.removeItem(TRADE_OS_STORAGE_KEY);
  Object.keys(actionResults).forEach((key) => {
    actionResults[key] = key === "clearAllMockData" ? "SUCCESS" : "NOT RUN";
  });
  return true;
}

function countCard(label, value) {
  return `<div class="count-card"><span>${label}</span><strong>${value}</strong></div>`;
}

function resultRow([id, label]) {
  const status = actionResults[id];
  return `<div class="result-row ${status.toLowerCase().replaceAll(" ", "-")}"><span>${label}</span><strong>${status}</strong></div>`;
}

function summarizeRecord(record) {
  if (!record) return "No record";
  const summary = {
    id: record.id,
    title: record.title || record.name || record.company || record.quote_no || record.order_no || record.shipment_no,
    status: record.status || record.stage,
    customer: record.customer || record.lead_info?.company,
    source: record.source,
    score: record.score,
    manual_review_required: record.manual_review_required,
  };
  return JSON.stringify(summary, null, 2);
}

function recordBlock(label, record) {
  return `
    <article class="record">
      <h3>${label}</h3>
      <pre>${summarizeRecord(record)}</pre>
    </article>
  `;
}

function render() {
  if (!devModeEnabled) {
    actionsEl.innerHTML = `<div class="locked">Dev test actions are hidden for public demo safety. Open this page with <code>?dev=1</code> only in a local development session.</div>`;
    countsEl.innerHTML = countCard("dev test mode", "locked");
    resultsEl.innerHTML = actions.map(([id, label]) => `<div class="result-row"><span>${label}</span><strong>LOCKED</strong></div>`).join("");
    recordsEl.innerHTML = recordBlock("development test page", {
      status: "LOCKED",
      title: "Remove or protect before production",
      manual_review_required: true,
    });
    return;
  }

  const websiteInquiries = readWebsiteInquiries();
  const db = loadDb();

  actionsEl.innerHTML = actions
    .map(([id, label]) => `<button type="button" data-action-id="${id}">${label}</button>`)
    .join("");

  countsEl.innerHTML = [
    countCard("website inquiries", websiteInquiries.length),
    countCard("leads", db.leads.length),
    countCard("customers", db.customers.length),
    countCard("inquiries", db.inquiries.length),
    countCard("projects", db.projects.length),
    countCard("quotations", db.quotations.length),
    countCard("orders", db.orders.length),
    countCard("shipments", db.shipments.length),
    countCard("after-sales", db.after_sales_cases.length),
    countCard("follow-up tasks", db.follow_up_tasks.length),
  ].join("");

  resultsEl.innerHTML = actions.map(resultRow).join("");

  recordsEl.innerHTML = [
    recordBlock("latest website inquiry", latest(websiteInquiries)),
    recordBlock("latest lead", latest(db.leads)),
    recordBlock("latest customer", latest(db.customers)),
    recordBlock("latest inquiry", latest(db.inquiries)),
    recordBlock("latest project", latest(db.projects)),
    recordBlock("latest quotation", latest(db.quotations)),
    recordBlock("latest order", latest(db.orders)),
    recordBlock("latest shipment", latest(db.shipments)),
    recordBlock("latest after-sales", latest(db.after_sales_cases)),
    recordBlock("latest follow-up task", latest(db.follow_up_tasks)),
  ].join("");

  document.querySelectorAll("[data-action-id]").forEach((button) => {
    const action = actions.find(([id]) => id === button.dataset.actionId);
    button.addEventListener("click", () => runAction(action[0], action[2]));
  });
}

render();
