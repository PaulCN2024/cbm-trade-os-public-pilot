import {
  calculateDocumentItem as calculateDocumentServiceItem,
  calculateDocumentTotals,
  roundMoney as documentRoundMoney,
  roundWeight as documentRoundWeight,
} from "./document-calculations.js";
import {
  buildArchivePath,
  buildExportFileName,
  buildZipPath,
  getNextVersion,
} from "./document-archive.js";

export const CRM_DB_KEY = "cbm-mock-crm-db-v1";
export const WEBSITE_INQUIRIES_KEY = "cbm-website-inquiries";
export const LEGACY_WEBSITE_LEADS_KEY = "cbm-website-leads";

export const BusinessLine = Object.freeze({
  ARCHITECTURAL: "A_ARCHITECTURAL",
  PRECISION: "B_PRECISION",
});

export const InquiryStatus = Object.freeze({
  NEW: "NEW",
  NEED_MORE_INFO: "NEED_MORE_INFO",
  READY_TO_QUOTE: "READY_TO_QUOTE",
  QUOTATION_DRAFTED: "QUOTATION_DRAFTED",
  CONVERTED_TO_PROJECT: "CONVERTED_TO_PROJECT",
  CLOSED: "CLOSED",
});

export const LeadStatus = Object.freeze({
  NEW: "NEW",
  QUALIFYING: "QUALIFYING",
  CONVERTED: "CONVERTED",
  LOST: "LOST",
});

export const ProjectStage = Object.freeze({
  REQUIREMENT_REVIEW: "REQUIREMENT_REVIEW",
  QUOTATION: "QUOTATION",
  NEGOTIATION: "NEGOTIATION",
  ORDER_PENDING: "ORDER_PENDING",
  ORDERED: "ORDERED",
  LOST: "LOST",
});

export const QuotationStatus = Object.freeze({
  DRAFT: "DRAFT",
  NEED_REVIEW: "NEED_REVIEW",
  ACCEPTED_MOCK: "ACCEPTED_MOCK",
});

export const OrderStatus = Object.freeze({
  DRAFT: "DRAFT",
  PI_REVIEW: "PI_REVIEW",
  PAYMENT_PENDING: "PAYMENT_PENDING",
  PRODUCTION_PENDING: "PRODUCTION_PENDING",
  IN_PRODUCTION: "IN_PRODUCTION",
  READY_TO_SHIP: "READY_TO_SHIP",
  SHIPPED: "SHIPPED",
  CLOSED: "CLOSED",
});

export const PaymentStatus = Object.freeze({
  NOT_CONFIRMED: "NOT_CONFIRMED",
  DEPOSIT_PENDING: "DEPOSIT_PENDING",
  DEPOSIT_RECEIVED_MOCK: "DEPOSIT_RECEIVED_MOCK",
  BALANCE_PENDING: "BALANCE_PENDING",
  PAID_MOCK: "PAID_MOCK",
});

export const ProductionStatus = Object.freeze({
  NOT_STARTED: "NOT_STARTED",
  DRAWING_CONFIRMATION: "DRAWING_CONFIRMATION",
  MATERIAL_PREPARING: "MATERIAL_PREPARING",
  IN_PRODUCTION: "IN_PRODUCTION",
  QC_PENDING: "QC_PENDING",
  PACKING_PENDING: "PACKING_PENDING",
  READY_TO_SHIP: "READY_TO_SHIP",
});

export const ShipmentStatus = Object.freeze({
  DRAFT: "DRAFT",
  BOOKING_PENDING: "BOOKING_PENDING",
  BOOKED_MOCK: "BOOKED_MOCK",
  LOADING_PENDING: "LOADING_PENDING",
  SHIPPED_MOCK: "SHIPPED_MOCK",
  ARRIVED_MOCK: "ARRIVED_MOCK",
  CLOSED: "CLOSED",
});

export const AfterSalesStatus = Object.freeze({
  OPEN: "OPEN",
  FOLLOW_UP_PENDING: "FOLLOW_UP_PENDING",
  WAITING_CUSTOMER_FEEDBACK: "WAITING_CUSTOMER_FEEDBACK",
  REPEAT_BUSINESS_OPPORTUNITY: "REPEAT_BUSINESS_OPPORTUNITY",
  CLOSED: "CLOSED",
});

export const TaskType = Object.freeze({
  INITIAL_REPLY: "INITIAL_REPLY",
  REQUEST_MISSING_INFO: "REQUEST_MISSING_INFO",
  QUOTE_FOLLOW_UP: "QUOTE_FOLLOW_UP",
  AFTER_SALES_FOLLOW_UP: "AFTER_SALES_FOLLOW_UP",
  REPEAT_BUSINESS: "REPEAT_BUSINESS",
});

export const TaskStatus = Object.freeze({
  PENDING: "PENDING",
  DONE: "DONE",
  CANCELLED: "CANCELLED",
});

export const Source = Object.freeze({
  WEBSITE: "website",
  ALIBABA: "alibaba",
  GMAIL: "gmail",
  WHATSAPP: "whatsapp",
  MANUAL: "manual",
});

export const DocumentType = Object.freeze({
  QUOTATION: "quotation",
  PROFORMA_INVOICE: "proforma_invoice",
  PRODUCTION_ORDER: "production_order",
  CUTTING_LIST: "cutting_list",
  PACKING_LIST: "packing_list",
});

export const DocumentStatus = Object.freeze({
  DRAFT: "DRAFT",
  NEED_REVIEW: "NEED_REVIEW",
  READY_FOR_EXPORT: "READY_FOR_EXPORT",
  ARCHIVED_MOCK: "ARCHIVED_MOCK",
});

export const DocumentItemType = Object.freeze({
  ALUMINUM_PROFILE: "aluminum_profile",
  CUT_ALUMINUM_PROFILE: "cut_aluminum_profile",
  ACCESSORY: "accessory",
  CHARGE: "charge",
});

export const ProductStatus = Object.freeze({
  ACTIVE: "ACTIVE",
  NEED_REVIEW: "NEED_REVIEW",
  ARCHIVED: "ARCHIVED",
});

export const DEFAULT_INTERNAL_WEIGHT_FACTOR = 1.1;

export const defaultSellers = [
  {
    id: "seller-cbm-global",
    company_name: "CBM GLOBAL LIMITED",
    address: "",
    bank_info: {
      account_name: "CBM GLOBAL LIMITED",
      account_number: "CONFIGURED_IN_SECURE_SETTINGS",
      bank_name: "CONFIGURED_IN_SECURE_SETTINGS",
      swift_bic_code: "CONFIGURED_IN_SECURE_SETTINGS",
      sort_code: "CONFIGURED_IN_SECURE_SETTINGS",
      branch_code: "CONFIGURED_IN_SECURE_SETTINGS",
      bank_address: "CONFIGURED_IN_SECURE_SETTINGS",
      country_region: "CONFIGURED_IN_SECURE_SETTINGS",
      type_of_account: "Business Account",
    },
  },
];

export function newId(prefix = "id") {
  const id = crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${id}`;
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function createEmptyDb(seed = {}) {
  return {
    customers: seed.customers || [],
    leads: seed.leads || [],
    inquiries: seed.inquiries || [],
    architectural_requirements: seed.architectural_requirements || [],
    precision_requirements: seed.precision_requirements || [],
    projects: seed.projects || [],
    quotations: seed.quotations || seed.quotes || [],
    orders: seed.orders || [],
    shipments: seed.shipments || [],
    document_drafts: seed.document_drafts || [],
    documents: seed.documents || [],
    sellers: seed.sellers || defaultSellers.map((seller) => structuredClone(seller)),
    products: seed.products || [],
    after_sales_cases: seed.after_sales_cases || [],
    follow_up_tasks: seed.follow_up_tasks || seed.tasks || [],
    communication_logs: seed.communication_logs || [],
    attachments: seed.attachments || [],
  };
}

export function readJson(key, fallback = []) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function readWebsiteInquiries() {
  const normalized = readJson(WEBSITE_INQUIRIES_KEY, []);
  const legacy = readJson(LEGACY_WEBSITE_LEADS_KEY, []);
  const convertedLegacy = legacy.map((lead) => normalizeWebsiteForm(lead, { preserveId: true }));
  const seen = new Set();
  return [...normalized, ...convertedLegacy].filter((item) => {
    const key = item.website_submission_key || item.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function saveWebsiteInquiry(inquiry) {
  const inquiries = readJson(WEBSITE_INQUIRIES_KEY, []);
  inquiries.unshift(inquiry);
  writeJson(WEBSITE_INQUIRIES_KEY, inquiries);
}

export function saveLegacyWebsiteLead(lead) {
  const leads = readJson(LEGACY_WEBSITE_LEADS_KEY, []);
  leads.unshift(lead);
  writeJson(LEGACY_WEBSITE_LEADS_KEY, leads);
}

export function markWebsiteInquiryImported(inquiryId) {
  const inquiries = readJson(WEBSITE_INQUIRIES_KEY, []);
  writeJson(
    WEBSITE_INQUIRIES_KEY,
    inquiries.map((item) => (item.id === inquiryId ? { ...item, imported: true, imported_at: new Date().toISOString() } : item)),
  );
}

export function inferBusinessLine(projectType = "") {
  const text = projectType.toLowerCase();
  if (/(cnc|precision|machin|bracket|housing|connector|industrial|solar|custom)/.test(text)) {
    return BusinessLine.PRECISION;
  }
  return BusinessLine.ARCHITECTURAL;
}

export function normalizeBusinessLine(value = "", projectType = "") {
  if (value === BusinessLine.ARCHITECTURAL || value === BusinessLine.PRECISION) return value;
  const text = String(value).toLowerCase();
  if (/precision|cnc|machin|bracket|housing|connector/.test(text)) return BusinessLine.PRECISION;
  if (/architectural|project|facade|curtain|window|door/.test(text)) return BusinessLine.ARCHITECTURAL;
  return inferBusinessLine(projectType);
}

export function normalizeWebsiteForm(form, options = {}) {
  const createdAt = form.created_at || form.createdAt || new Date().toISOString();
  const projectType = form.project_type || form.projectType || "";
  const businessLine = normalizeBusinessLine(form.business_line || form.businessLine, projectType);
  const support = Array.isArray(form.support) ? form.support.join("; ") : form.support || "";
  const attachmentNames = Array.isArray(form.attachment_names)
    ? form.attachment_names
    : String(form.files || form.attachment_names || "")
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean);
  const company = form.company || form.lead_info?.company || "Unknown company";
  const name = form.name || form.contact_name || form.lead_info?.name || "";
  const email = form.email || form.lead_info?.email || "";
  const id = options.preserveId && form.id ? form.id : newId("inq");
  const websiteKey = form.website_submission_key || `${createdAt}-${email || company}-${projectType}`;

  return {
    id,
    website_submission_key: websiteKey,
    source: Source.WEBSITE,
    business_line: businessLine,
    status: form.status || InquiryStatus.NEW,
    title: form.title || `${projectType || "Project inquiry"} - ${company || name}`,
    lead_info: {
      name,
      company,
      email,
      whatsapp: form.whatsapp || form.lead_info?.whatsapp || "",
      country: form.country || form.lead_info?.country || "",
    },
    customer_id: form.customer_id || "",
    lead_id: form.lead_id || "",
    project_type: projectType,
    drawing_status: form.drawing_status || form.drawingStatus || "",
    quote_method: form.quote_method || form.quoteBasis || "",
    material_finish: form.material_finish || form.finish || "",
    destination_port: form.destination_port || form.destination || "",
    project_description: form.project_description || form.details || "",
    support_needed: support,
    attachment_names: attachmentNames,
    original_submission: {
      ...form,
      support,
      files: attachmentNames.join("; "),
    },
    imported: Boolean(form.imported),
    created_at: createdAt,
    updated_at: form.updated_at || createdAt,
    ai_summary: form.ai_summary || "",
    missing_info: form.missing_info || [],
    score: Number(form.score || 0),
    recommended_next_action: form.recommended_next_action || "",
    reply_draft_en: form.reply_draft_en || "",
    reply_draft_zh: form.reply_draft_zh || "",
    reply_draft_es: form.reply_draft_es || "",
  };
}

export function parseAlibabaInquiryText(text = "") {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const readField = (labels) => {
    const match = lines.find((line) => labels.some((label) => line.toLowerCase().startsWith(`${label.toLowerCase()}:`)));
    return match ? match.slice(match.indexOf(":") + 1).trim() : "";
  };
  const body = String(text || "").trim();
  const product = readField(["Product", "Product title", "产品", "产品名称"]);
  const company = readField(["Company", "Buyer company", "公司", "买家公司"]);
  const name = readField(["Name", "Contact", "Buyer", "联系人", "买家"]);
  const country = readField(["Country", "Market", "国家", "市场"]);
  const email = readField(["Email", "邮箱"]);
  const whatsapp = readField(["WhatsApp", "Whatsapp", "Phone", "电话"]);
  const quantity = readField(["Quantity", "Qty", "数量"]);
  const destination = readField(["Destination", "Destination port", "Port", "目的港"]);
  const targetPrice = readField(["Target price", "Target Price", "目标价"]);
  const attachments = readField(["Attachments", "Attachment", "附件"]);
  const threadUrl = readField(["Thread URL", "Alibaba URL", "Inquiry URL", "链接"]);
  const businessLine = normalizeBusinessLine(readField(["Business line", "业务线"]), `${product} ${body}`);
  const drawingStatus = includesAny(body, ["drawing", "dwg", "step", "stp", "iges", "pdf", "dxf", "图纸"])
    ? "Drawing or technical file mentioned in Alibaba inquiry"
    : "Drawing status not confirmed";
  const projectType =
    product ||
    (businessLine === BusinessLine.PRECISION
      ? "Alibaba precision aluminum manufacturing inquiry"
      : "Alibaba architectural aluminum project inquiry");
  const materialFinish = readField(["Material", "Finish", "Surface", "材料", "表面处理"]);

  return {
    source: Source.ALIBABA,
    acquisition_channel: "ALIBABA_INTERNATIONAL",
    alibaba_thread_url: threadUrl,
    business_line: businessLine,
    title: `Alibaba RFQ - ${projectType}`,
    lead_info: {
      name: name || "Alibaba buyer",
      company: company || "Alibaba buyer company",
      email,
      whatsapp,
      country,
    },
    project_type: projectType,
    drawing_status: drawingStatus,
    quote_method: targetPrice ? `Target price mentioned: ${targetPrice}` : "Manual quote review required",
    material_finish: materialFinish,
    destination_port: destination,
    project_description: [
      body,
      quantity ? `Quantity: ${quantity}` : "",
      targetPrice ? `Target price: ${targetPrice}` : "",
      threadUrl ? `Alibaba thread URL: ${threadUrl}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    support_needed: "Alibaba inquiry整理；只生成内部跟进任务，不自动回复客户。",
    attachment_names: attachments
      .split(/[;,，]/)
      .map((item) => item.trim())
      .filter(Boolean),
    original_submission: {
      raw_text: text,
      product,
      quantity,
      target_price: targetPrice,
      alibaba_thread_url: threadUrl,
      acquisition_channel: "ALIBABA_INTERNATIONAL",
    },
  };
}

function parseDelimitedRows(text = "") {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const delimiter = lines[0].includes("\t") ? "\t" : lines[0].includes(",") ? "," : "";
  if (!delimiter) return [];
  const headers = lines[0].split(delimiter).map((item) => item.trim());
  if (!headers.some((item) => /product|message|company|buyer|country|quantity|inquiry/i.test(item))) return [];
  return lines.slice(1).map((line) => {
    const values = line.split(delimiter).map((item) => item.trim());
    return headers.map((header, index) => `${header}: ${values[index] || ""}`).join("\n");
  });
}

export function parseAlibabaInquiryBatch(text = "") {
  const delimitedRows = parseDelimitedRows(text);
  if (delimitedRows.length) return delimitedRows.map((row) => parseAlibabaInquiryText(row));
  const blocks = String(text || "")
    .split(/\n\s*(?:---+|===+|\*\*\*+)\s*\n|\n{2,}(?=(?:Product|Buyer|Company|Message|产品|买家|公司)\s*:)/i)
    .map((block) => block.trim())
    .filter(Boolean);
  return (blocks.length ? blocks : [text]).map((block) => parseAlibabaInquiryText(block));
}

function alibabaDuplicateKey(inquiry) {
  const submission = inquiry.original_submission || {};
  return [
    submission.alibaba_thread_url || "",
    inquiry.lead_info?.email || "",
    inquiry.lead_info?.company || "",
    inquiry.lead_info?.country || "",
    inquiry.project_type || "",
    String(inquiry.project_description || "").slice(0, 120),
  ]
    .join("|")
    .toLowerCase();
}

function findAlibabaDuplicate(db, parsed) {
  const candidate = {
    lead_info: parsed.lead_info || {},
    project_type: parsed.project_type || "",
    project_description: parsed.project_description || "",
    original_submission: parsed.original_submission || {},
  };
  const key = alibabaDuplicateKey(candidate);
  return (db.inquiries || []).find((item) => item.source === Source.ALIBABA && alibabaDuplicateKey(item) === key);
}

export function createAlibabaInquiries(db, text = "") {
  const parsedRecords = parseAlibabaInquiryBatch(text);
  const imported = [];
  const skipped = [];
  parsedRecords.forEach((parsed) => {
    const duplicate = findAlibabaDuplicate(db, parsed);
    if (duplicate) {
      skipped.push(duplicate);
      return;
    }
    imported.push(createAlibabaInquiry(db, parsed));
  });
  return { imported, skipped, total: parsedRecords.length };
}

export function createAlibabaInquiry(db, input = {}) {
  const parsed = typeof input === "string" ? parseAlibabaInquiryText(input) : input;
  const createdAt = new Date().toISOString();
  const inquiry = {
    id: newId("inq"),
    website_submission_key: parsed.alibaba_thread_url || `alibaba-${createdAt}-${parsed.lead_info?.company || parsed.title}`,
    source: Source.ALIBABA,
    acquisition_channel: parsed.acquisition_channel || "ALIBABA_INTERNATIONAL",
    business_line: parsed.business_line || BusinessLine.ARCHITECTURAL,
    status: InquiryStatus.NEW,
    title: parsed.title || "Alibaba inquiry",
    lead_info: {
      name: parsed.lead_info?.name || "",
      company: parsed.lead_info?.company || "",
      email: parsed.lead_info?.email || "",
      whatsapp: parsed.lead_info?.whatsapp || "",
      country: parsed.lead_info?.country || "",
    },
    customer_id: "",
    lead_id: "",
    project_type: parsed.project_type || "",
    drawing_status: parsed.drawing_status || "",
    quote_method: parsed.quote_method || "",
    material_finish: parsed.material_finish || "",
    destination_port: parsed.destination_port || "",
    project_description: parsed.project_description || "",
    support_needed: parsed.support_needed || "",
    attachment_names: parsed.attachment_names || [],
    original_submission: parsed.original_submission || { ...parsed },
    imported: true,
    created_at: createdAt,
    updated_at: createdAt,
    ai_summary: "",
    missing_info: [],
    score: 0,
    recommended_next_action: "",
    reply_draft_en: "",
    reply_draft_zh: "",
    reply_draft_es: "",
  };
  Object.assign(inquiry, analyzeInquiry(inquiry), {
    status: InquiryStatus.NEED_MORE_INFO,
    recommended_next_action:
      "Open Alibaba inquiry thread manually, verify buyer profile and missing technical details, then prepare a reviewed reply draft. Do not auto-send.",
  });

  let lead = findLead(db, inquiry);
  if (!lead) {
    lead = {
      id: newId("lead"),
      source: Source.ALIBABA,
      acquisition_channel: "ALIBABA_INTERNATIONAL",
      status: LeadStatus.QUALIFYING,
      title: inquiry.title,
      name: inquiry.lead_info.name,
      company: inquiry.lead_info.company,
      email: inquiry.lead_info.email,
      whatsapp: inquiry.lead_info.whatsapp,
      country: inquiry.lead_info.country,
      business_line: inquiry.business_line,
      score: inquiry.score,
      summary: inquiry.ai_summary,
      created_at: inquiry.created_at,
      updated_at: inquiry.updated_at,
    };
    db.leads.unshift(lead);
  } else {
    lead.source = lead.source || Source.ALIBABA;
    lead.acquisition_channel = lead.acquisition_channel || "ALIBABA_INTERNATIONAL";
    lead.score = Math.max(Number(lead.score || 0), inquiry.score);
    lead.updated_at = new Date().toISOString();
  }

  inquiry.lead_id = lead.id;
  db.inquiries.unshift(inquiry);
  createRequirement(db, inquiry);
  createAttachments(db, inquiry);
  createFollowUpTask(db, inquiry, TaskType.INITIAL_REPLY);
  createFollowUpTask(db, inquiry, TaskType.REQUEST_MISSING_INFO);
  db.communication_logs.unshift({
    id: newId("log"),
    customer_id: "",
    inquiry_id: inquiry.id,
    channel: Source.ALIBABA,
    direction: "inbound",
    summary: "Alibaba inquiry imported for internal review only. No customer message was sent.",
    content: parsed.original_submission?.raw_text || inquiry.project_description,
    created_at: createdAt,
  });
  return inquiry;
}

function hasText(value) {
  return String(value || "").trim().length > 0;
}

function includesAny(value, words) {
  const text = String(value || "").toLowerCase();
  return words.some((word) => text.includes(word));
}

export function analyzeInquiry(inquiry) {
  const missing = [];
  let score = 45;
  const text = `${inquiry.project_type} ${inquiry.drawing_status} ${inquiry.quote_method} ${inquiry.material_finish} ${inquiry.destination_port} ${inquiry.project_description} ${inquiry.support_needed}`.toLowerCase();

  if (hasText(inquiry.lead_info?.company)) score += 6;
  if (hasText(inquiry.lead_info?.email) && inquiry.lead_info.email.includes("@")) score += 8;
  if (hasText(inquiry.lead_info?.whatsapp)) score += 4;
  if (hasText(inquiry.lead_info?.country)) score += 5;
  if (inquiry.attachment_names?.length) score += 12;
  if (hasText(inquiry.destination_port)) score += 6;
  if (String(inquiry.project_description || "").length > 80) score += 6;

  if (inquiry.business_line === BusinessLine.ARCHITECTURAL) {
    if (!hasText(inquiry.lead_info?.country) && !includesAny(text, ["location", "site", "project country"])) missing.push("project location");
    if (!inquiry.attachment_names?.length && !includesAny(text, ["dwg", "pdf", "drawing", "boq"])) missing.push("drawings");
    if (!includesAny(text, ["schedule", "boq", "quantity", "area", "m2", "sqm"])) missing.push("window/door schedule or quantity/area");
    if (!includesAny(text, ["glass", "tempered", "laminated", "low-e"])) missing.push("glass specification");
    if (!includesAny(text, ["ral", "color", "colour", "anodized", "powder", "pvdf"])) missing.push("aluminum color / finish");
    if (!includesAny(text, ["hardware", "handle", "hinge", "lock", "accessory", "gasket"])) missing.push("hardware requirement");
    if (!hasText(inquiry.destination_port)) missing.push("destination port");
  } else {
    if (!inquiry.attachment_names?.length && !includesAny(text, ["drawing", "dwg", "step", "stp", "iges", "pdf"])) missing.push("drawing");
    if (!includesAny(text, ["step", "stp", "iges", "dwg", "pdf", "dxf"])) missing.push("drawing format");
    if (!includesAny(text, ["6061", "6063", "6082", "7075", "material", "grade", "t5", "t6"])) missing.push("material grade");
    if (!includesAny(text, ["anodized", "powder", "sandblast", "finish", "surface", "color"])) missing.push("surface finish");
    if (!includesAny(text, ["tolerance", "+/-", "precision"])) missing.push("tolerance");
    if (!includesAny(text, ["qty", "quantity", "pcs", "sets", "annual"])) missing.push("quantity");
    if (!includesAny(text, ["annual", "yearly", "monthly", "repeat"])) missing.push("annual demand");
    if (!includesAny(text, ["inspection", "qc", "report", "cmm"])) missing.push("inspection requirement");
    if (!hasText(inquiry.destination_port) && !hasText(inquiry.lead_info?.country)) missing.push("destination");
  }

  score += Math.max(0, 28 - missing.length * 4);
  score = Math.max(20, Math.min(98, score));

  const productLine =
    inquiry.business_line === BusinessLine.ARCHITECTURAL
      ? "architectural aluminum project"
      : "precision aluminum manufacturing inquiry";
  const company = inquiry.lead_info?.company || inquiry.lead_info?.name || "the customer";
  const missingText = missing.length ? missing.join(", ") : "no major missing item in the current checklist";
  const recommended =
    missing.length > 0
      ? `Ask customer to confirm: ${missing.slice(0, 4).join(", ")}. Manual review required before official quotation.`
      : "Requirement is ready for manual quotation review. Do not send official price before sales review.";

  return {
    ai_summary: `${company} submitted a ${productLine} from ${inquiry.lead_info?.country || "unknown country"}. Project type: ${inquiry.project_type || "not specified"}. Destination: ${inquiry.destination_port || "not specified"}. Missing information: ${missingText}.`,
    missing_info: missing,
    score,
    recommended_next_action: recommended,
    reply_draft_en: `Dear ${inquiry.lead_info?.name || "Customer"},\n\nThank you for your inquiry. We have received your project information and will review it manually before any official quotation.\n\nTo prepare a more accurate quotation, please help confirm: ${missingText}.\n\nBest regards,\nCBM Team`,
    reply_draft_zh: `${inquiry.lead_info?.name || "您好"}，感谢您的询盘。我们已收到项目信息，正式报价前需要人工审核。为了更准确报价，请补充确认：${missingText}。`,
    reply_draft_es: `Estimado/a ${inquiry.lead_info?.name || "cliente"}, gracias por su consulta. Revisaremos manualmente la información antes de cualquier cotización oficial. Para cotizar mejor, confirme por favor: ${missingText}.`,
  };
}

export function importWebsiteInquiries(db) {
  const websiteInquiries = readWebsiteInquiries().filter((item) => !item.imported);
  const existingKeys = new Set((db.inquiries || []).map((item) => item.website_submission_key).filter(Boolean));
  const imported = [];

  websiteInquiries.forEach((raw) => {
    const inquiry = normalizeWebsiteForm(raw, { preserveId: true });
    if (existingKeys.has(inquiry.website_submission_key)) {
      markWebsiteInquiryImported(raw.id);
      return;
    }

    const analysis = analyzeInquiry(inquiry);
    Object.assign(inquiry, analysis, {
      status: analysis.missing_info.length ? InquiryStatus.NEED_MORE_INFO : InquiryStatus.READY_TO_QUOTE,
      updated_at: new Date().toISOString(),
    });

    let lead = findLead(db, inquiry);
    if (!lead) {
      lead = {
        id: newId("lead"),
        source: Source.WEBSITE,
        status: LeadStatus.QUALIFYING,
        name: inquiry.lead_info.name,
        company: inquiry.lead_info.company,
        email: inquiry.lead_info.email,
        whatsapp: inquiry.lead_info.whatsapp,
        country: inquiry.lead_info.country,
        business_line: inquiry.business_line,
        score: inquiry.score,
        created_at: inquiry.created_at,
        updated_at: new Date().toISOString(),
      };
      db.leads.unshift(lead);
    } else {
      lead.score = Math.max(Number(lead.score || 0), inquiry.score);
      lead.updated_at = new Date().toISOString();
    }

    inquiry.lead_id = lead.id;
    db.inquiries.unshift(inquiry);
    createRequirement(db, inquiry);
    createAttachments(db, inquiry);
    createFollowUpTask(db, inquiry, TaskType.INITIAL_REPLY);
    if (analysis.missing_info.length) createFollowUpTask(db, inquiry, TaskType.REQUEST_MISSING_INFO);
    markWebsiteInquiryImported(raw.id);
    imported.push(inquiry);
  });

  return imported;
}

function findLead(db, inquiry) {
  const email = inquiry.lead_info?.email;
  const company = inquiry.lead_info?.company;
  return (db.leads || []).find((lead) => (email && lead.email === email) || (company && lead.company === company));
}

function createRequirement(db, inquiry) {
  const base = {
    id: newId(inquiry.business_line === BusinessLine.ARCHITECTURAL ? "arch_req" : "prec_req"),
    inquiry_id: inquiry.id,
    business_line: inquiry.business_line,
    project_type: inquiry.project_type,
    drawing_status: inquiry.drawing_status,
    quote_method: inquiry.quote_method,
    material_finish: inquiry.material_finish,
    destination_port: inquiry.destination_port,
    project_description: inquiry.project_description,
    created_at: new Date().toISOString(),
  };
  if (inquiry.business_line === BusinessLine.ARCHITECTURAL) {
    db.architectural_requirements.unshift({
      ...base,
      project_location: inquiry.lead_info?.country || "",
      glass_specification: extractLine(inquiry.project_description, ["glass", "tempered", "laminated", "low-e"]),
      aluminum_color: extractLine(inquiry.material_finish || inquiry.project_description, ["ral", "color", "colour", "anodized", "powder", "pvdf"]),
      hardware_requirement: extractLine(inquiry.project_description, ["hardware", "handle", "hinge", "lock", "gasket"]),
    });
  } else {
    db.precision_requirements.unshift({
      ...base,
      drawing_format: extractLine(inquiry.project_description, ["step", "stp", "iges", "dwg", "pdf", "dxf"]),
      material_grade: extractLine(inquiry.material_finish || inquiry.project_description, ["6061", "6063", "6082", "7075", "t5", "t6"]),
      tolerance: extractLine(inquiry.project_description, ["tolerance", "+/-", "precision"]),
      annual_demand: extractLine(inquiry.project_description, ["annual", "yearly", "monthly"]),
      inspection_requirement: extractLine(inquiry.project_description, ["inspection", "qc", "report", "cmm"]),
    });
  }
}

function extractLine(value, words) {
  const text = String(value || "");
  return includesAny(text, words) ? text.slice(0, 180) : "";
}

function createAttachments(db, inquiry) {
  (inquiry.attachment_names || []).forEach((name) => {
    db.attachments.unshift({
      id: newId("att"),
      inquiry_id: inquiry.id,
      customer_id: inquiry.customer_id || "",
      file_name: name,
      file_type: name.split(".").pop() || "unknown",
      source: Source.WEBSITE,
      created_at: new Date().toISOString(),
    });
  });
}

export function createFollowUpTask(db, inquiry, type) {
  const taskText = {
    [TaskType.INITIAL_REPLY]: "Send initial reply draft after manual review",
    [TaskType.REQUEST_MISSING_INFO]: `Request missing information: ${(inquiry.missing_info || []).slice(0, 4).join(", ")}`,
    [TaskType.QUOTE_FOLLOW_UP]: "Follow up quotation draft after manual price review",
    [TaskType.AFTER_SALES_FOLLOW_UP]: "Follow up shipment delivery and collect customer feedback",
    [TaskType.REPEAT_BUSINESS]: "Review repeat business opportunity and prepare manual outreach draft",
  }[type];
  const dueDays = type === TaskType.REPEAT_BUSINESS ? 30 : type === TaskType.QUOTE_FOLLOW_UP ? 3 : 1;
  const task = {
    id: newId("task"),
    type,
    status: TaskStatus.PENDING,
    title: taskText,
    inquiry_id: inquiry.id,
    customer_id: inquiry.customer_id || "",
    project_id: inquiry.project_id || "",
    quotation_id: inquiry.quotation_id || "",
    due_date: daysFromNow(dueDays),
    priority: inquiry.score >= 85 ? "high" : "normal",
    created_at: new Date().toISOString(),
  };
  db.follow_up_tasks.unshift(task);
  return task;
}

export function createAfterSalesCaseFromShipment(db, shipmentId) {
  const shipment = db.shipments.find((item) => item.id === shipmentId);
  if (!shipment) return null;
  let afterSalesCase = (db.after_sales_cases || []).find((item) => item.shipment_id === shipmentId);
  if (afterSalesCase) return afterSalesCase;

  const order = shipment.order_id ? db.orders.find((item) => item.id === shipment.order_id) : null;
  const project = db.projects.find((item) => item.id === (shipment.project_id || shipment.projectId || order?.project_id));
  const customerId = shipment.customer_id || order?.customer_id || project?.customer_id || project?.customerId || "";
  const customer = db.customers.find((item) => item.id === customerId);
  const caseNo = `CBM-AS-${todayIso().replaceAll("-", "")}-${String((db.after_sales_cases || []).length + 1).padStart(3, "0")}`;

  afterSalesCase = {
    id: newId("as"),
    case_no: caseNo,
    shipment_id: shipment.id,
    order_id: shipment.order_id || "",
    project_id: shipment.project_id || shipment.projectId || order?.project_id || "",
    customer_id: customerId,
    customer: customer?.name || order?.customer || "",
    status: AfterSalesStatus.FOLLOW_UP_PENDING,
    issue_type: "Post-shipment follow-up",
    quality_issue: "",
    complaint_summary: "",
    replacement_required: false,
    compensation_required: false,
    customer_feedback: "",
    repeat_business_opportunity: "Review customer satisfaction and ask whether there are next projects or repeat orders.",
    manual_review_required: true,
    next_action: "Confirm goods arrival, collect installation/quality feedback, and create repeat business reminder after manual review.",
    created_at: new Date().toISOString(),
  };

  db.after_sales_cases.unshift(afterSalesCase);
  const task = {
    id: newId("task"),
    type: TaskType.AFTER_SALES_FOLLOW_UP,
    status: TaskStatus.PENDING,
    title: `After-sales follow-up for ${shipment.shipment_no || shipment.route}`,
    inquiry_id: "",
    customer_id: customerId,
    project_id: afterSalesCase.project_id,
    quotation_id: "",
    order_id: afterSalesCase.order_id,
    shipment_id: shipment.id,
    after_sales_case_id: afterSalesCase.id,
    due_date: daysFromNow(7),
    priority: "normal",
    created_at: new Date().toISOString(),
  };
  db.follow_up_tasks.unshift(task);
  return afterSalesCase;
}

export function updateAfterSalesFeedback(db, caseId, feedback = "Mock customer feedback collected. Manual review required.") {
  const afterSalesCase = db.after_sales_cases.find((item) => item.id === caseId);
  if (!afterSalesCase) return null;
  afterSalesCase.customer_feedback = feedback;
  afterSalesCase.status = AfterSalesStatus.WAITING_CUSTOMER_FEEDBACK;
  afterSalesCase.updated_at = new Date().toISOString();
  return afterSalesCase;
}

export function createRepeatBusinessReminder(db, caseId) {
  const afterSalesCase = db.after_sales_cases.find((item) => item.id === caseId);
  if (!afterSalesCase) return null;
  const existing = db.follow_up_tasks.find(
    (item) => item.after_sales_case_id === caseId && item.type === TaskType.REPEAT_BUSINESS,
  );
  if (existing) return existing;

  afterSalesCase.status = AfterSalesStatus.REPEAT_BUSINESS_OPPORTUNITY;
  afterSalesCase.updated_at = new Date().toISOString();
  const task = {
    id: newId("task"),
    type: TaskType.REPEAT_BUSINESS,
    status: TaskStatus.PENDING,
    title: `Repeat business reminder for ${afterSalesCase.customer || "customer"}`,
    inquiry_id: "",
    customer_id: afterSalesCase.customer_id || "",
    project_id: afterSalesCase.project_id || "",
    quotation_id: "",
    order_id: afterSalesCase.order_id || "",
    shipment_id: afterSalesCase.shipment_id || "",
    after_sales_case_id: afterSalesCase.id,
    due_date: daysFromNow(30),
    priority: "normal",
    created_at: new Date().toISOString(),
  };
  db.follow_up_tasks.unshift(task);
  return task;
}

export function createCustomerFromInquiry(db, inquiryId) {
  const inquiry = db.inquiries.find((item) => item.id === inquiryId);
  if (!inquiry) return null;
  let customer = (db.customers || []).find(
    (item) => item.email === inquiry.lead_info.email || item.name === inquiry.lead_info.company,
  );
  if (!customer) {
    customer = {
      id: newId("cus"),
      name: inquiry.lead_info.company || inquiry.lead_info.name || "New customer",
      contact_name: inquiry.lead_info.name || "",
      email: inquiry.lead_info.email || "",
      whatsapp: inquiry.lead_info.whatsapp || "",
      country: inquiry.lead_info.country || "",
      type: inquiry.business_line === BusinessLine.ARCHITECTURAL ? "Architectural aluminum buyer" : "Precision aluminum buyer",
      status: "active",
      importance: inquiry.score >= 85 ? "A" : "B",
      aliases: inquiry.lead_info.company || "",
      summary: inquiry.ai_summary,
      lastContact: todayIso(),
      created_at: new Date().toISOString(),
    };
    db.customers.unshift(customer);
  }
  inquiry.customer_id = customer.id;
  inquiry.updated_at = new Date().toISOString();
  const lead = db.leads.find((item) => item.id === inquiry.lead_id);
  if (lead) lead.status = LeadStatus.CONVERTED;
  return customer;
}

export function createCustomerFromLead(db, leadId) {
  const lead = db.leads.find((item) => item.id === leadId);
  if (!lead) return null;
  let customer = (db.customers || []).find((item) => item.email === lead.email || item.name === lead.company);
  if (!customer) {
    customer = {
      id: newId("cus"),
      name: lead.company || lead.name || "New customer",
      contact_name: lead.name || "",
      email: lead.email || "",
      whatsapp: lead.whatsapp || "",
      country: lead.country || "",
      type: lead.business_line === BusinessLine.ARCHITECTURAL ? "Architectural aluminum buyer" : "Precision aluminum buyer",
      status: "active",
      importance: Number(lead.score || 0) >= 85 ? "A" : "B",
      aliases: lead.company || "",
      summary: `Converted from ${lead.source || "lead pool"} lead. Manual review required before any official quotation.`,
      lastContact: todayIso(),
      created_at: new Date().toISOString(),
    };
    db.customers.unshift(customer);
  }
  lead.customer_id = customer.id;
  lead.customerId = customer.id;
  lead.status = LeadStatus.CONVERTED;
  lead.updated_at = new Date().toISOString();
  return customer;
}

export function createInquiryFromLead(db, leadId) {
  const lead = db.leads.find((item) => item.id === leadId);
  if (!lead) return null;
  const existing = db.inquiries.find((item) => item.lead_id === leadId);
  if (existing) return existing;
  const inquiry = {
    id: newId("inq"),
    website_submission_key: "",
    source: lead.source || Source.MANUAL,
    business_line: lead.business_line || BusinessLine.ARCHITECTURAL,
    status: InquiryStatus.NEW,
    title: lead.title || `${lead.company || lead.name || "Manual lead"} inquiry`,
    lead_id: lead.id,
    customer_id: lead.customer_id || lead.customerId || "",
    lead_info: {
      name: lead.name || "",
      company: lead.company || "",
      email: lead.email || "",
      whatsapp: lead.whatsapp || "",
      country: lead.country || "",
    },
    project_type: lead.project_type || lead.title || "",
    drawing_status: "",
    quote_method: "",
    material_finish: "",
    destination_port: "",
    project_description: lead.summary || lead.need || "",
    support_needed: "",
    attachment_names: [],
    original_submission: { ...lead },
    imported: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ai_summary: "",
    missing_info: [],
    score: Number(lead.score || 50),
    recommended_next_action: "Qualify this lead and collect missing information before quotation.",
    reply_draft_en: "",
    reply_draft_zh: "",
    reply_draft_es: "",
  };
  Object.assign(inquiry, analyzeInquiry(inquiry));
  inquiry.status = inquiry.missing_info.length ? InquiryStatus.NEED_MORE_INFO : InquiryStatus.READY_TO_QUOTE;
  db.inquiries.unshift(inquiry);
  lead.status = LeadStatus.QUALIFYING;
  lead.updated_at = new Date().toISOString();
  createFollowUpTask(db, inquiry, TaskType.INITIAL_REPLY);
  if (inquiry.missing_info.length) createFollowUpTask(db, inquiry, TaskType.REQUEST_MISSING_INFO);
  return inquiry;
}

export function updateLeadStatus(db, leadId, status) {
  const lead = db.leads.find((item) => item.id === leadId);
  if (!lead) return null;
  lead.status = status;
  lead.updated_at = new Date().toISOString();
  return lead;
}

export function createProjectFromInquiry(db, inquiryId) {
  const inquiry = db.inquiries.find((item) => item.id === inquiryId);
  if (!inquiry) return null;
  const customer = inquiry.customer_id ? db.customers.find((item) => item.id === inquiry.customer_id) : createCustomerFromInquiry(db, inquiryId);
  let project = db.projects.find((item) => item.inquiry_id === inquiryId);
  if (!project) {
    project = {
      id: newId("prj"),
      inquiry_id: inquiry.id,
      customerId: customer?.id || inquiry.customer_id || "",
      customer_id: customer?.id || inquiry.customer_id || "",
      name: inquiry.title,
      title: inquiry.title,
      country: inquiry.lead_info?.country || "",
      business_line: inquiry.business_line,
      type: inquiry.project_type,
      stage: ProjectStage.REQUIREMENT_REVIEW,
      priority: inquiry.score >= 85 ? "high" : "normal",
      next_action: inquiry.recommended_next_action,
      products: inquiry.project_type,
      status: "Requirement review",
      risk: inquiry.missing_info?.length ? `Missing: ${inquiry.missing_info.join(", ")}` : "Ready for manual quote review",
      created_at: new Date().toISOString(),
    };
    db.projects.unshift(project);
  }
  inquiry.project_id = project.id;
  inquiry.status = InquiryStatus.CONVERTED_TO_PROJECT;
  inquiry.updated_at = new Date().toISOString();
  return project;
}

export function createQuotationDraft(db, sourceId, sourceType = "inquiry") {
  const inquiry =
    sourceType === "project"
      ? db.inquiries.find((item) => item.project_id === sourceId)
      : db.inquiries.find((item) => item.id === sourceId);
  if (!inquiry) return null;
  const project = inquiry.project_id ? db.projects.find((item) => item.id === inquiry.project_id) : null;
  const customer = inquiry.customer_id ? db.customers.find((item) => item.id === inquiry.customer_id) : createCustomerFromInquiry(db, inquiry.id);
  const quoteNo = `CBM-Q-${todayIso().replaceAll("-", "")}-${String((db.quotations || []).length + 1).padStart(3, "0")}`;
  const quotation = {
    id: newId("quo"),
    quote_no: quoteNo,
    no: quoteNo,
    customer_id: customer?.id || inquiry.customer_id || "",
    customer: customer?.name || inquiry.lead_info?.company || "",
    inquiry_id: inquiry.id,
    project_id: project?.id || inquiry.project_id || "",
    business_line: inquiry.business_line,
    currency: "USD",
    incoterm: "FOB / CIF to be confirmed",
    destination_port: inquiry.destination_port,
    items: [
      {
        description: inquiry.project_type || "Aluminum product placeholder",
        quantity: "To be confirmed",
        unit_price: "Manual input required",
        notes: "No automatic final price. Manual review required.",
      },
    ],
    missing_price_fields: ["unit price", "mold cost if any", "packing cost", "freight/incoterm", "lead time"],
    manual_review_required: true,
    status: inquiry.missing_info?.length ? QuotationStatus.NEED_REVIEW : QuotationStatus.DRAFT,
    created_at: new Date().toISOString(),
  };
  db.quotations.unshift(quotation);
  inquiry.quotation_id = quotation.id;
  inquiry.status = InquiryStatus.QUOTATION_DRAFTED;
  inquiry.updated_at = new Date().toISOString();
  if (project) project.stage = ProjectStage.QUOTATION;
  createFollowUpTask(db, inquiry, TaskType.QUOTE_FOLLOW_UP);
  return quotation;
}

export function createOrderFromQuotation(db, quotationId) {
  const quotation = db.quotations.find((item) => item.id === quotationId);
  if (!quotation) return null;
  let order = (db.orders || []).find((item) => item.quotation_id === quotationId);
  if (order) return order;

  const customer = db.customers.find((item) => item.id === quotation.customer_id);
  const project = db.projects.find((item) => item.id === quotation.project_id);
  const orderNo = `CBM-O-${todayIso().replaceAll("-", "")}-${String((db.orders || []).length + 1).padStart(3, "0")}`;

  quotation.status = QuotationStatus.ACCEPTED_MOCK;
  quotation.accepted_at = new Date().toISOString();
  quotation.manual_review_required = true;

  order = {
    id: newId("ord"),
    order_no: orderNo,
    quotation_id: quotation.id,
    inquiry_id: quotation.inquiry_id || "",
    project_id: quotation.project_id || "",
    customer_id: quotation.customer_id || "",
    customer: customer?.name || quotation.customer || "",
    business_line: quotation.business_line,
    status: OrderStatus.PI_REVIEW,
    payment_status: PaymentStatus.NOT_CONFIRMED,
    production_status: ProductionStatus.DRAWING_CONFIRMATION,
    destination_port: quotation.destination_port || "",
    incoterm: quotation.incoterm || "To be confirmed",
    currency: quotation.currency || "USD",
    items: quotation.items || [],
    manual_review_required: true,
    risk_flags: [
      "PI draft requires manual review",
      "Final price must be confirmed manually",
      "Lead time must be confirmed manually",
      "Payment terms and bank account must be confirmed manually",
    ],
    next_action: "Review PI draft fields, confirm drawings/specifications, then update payment and production status manually.",
    created_at: new Date().toISOString(),
  };

  if (project) {
    project.stage = ProjectStage.ORDER_PENDING;
    project.next_action = "Review order draft and PI placeholders before any official confirmation.";
  }

  db.orders.unshift(order);
  createOrderDocumentDrafts(db, order);
  return order;
}

function createOrderDocumentDrafts(db, order) {
  const docs = [
    ["PI_DRAFT", "Proforma invoice draft placeholder"],
    ["COMMERCIAL_INVOICE_DRAFT", "Commercial invoice draft placeholder"],
    ["PACKING_LIST_DRAFT", "Packing list draft placeholder"],
    ["BL_INSTRUCTION_DRAFT", "Bill of lading instruction placeholder"],
  ];
  docs.forEach(([type, title]) => {
    db.document_drafts.unshift({
      id: newId("doc"),
      order_id: order.id,
      shipment_id: "",
      type,
      title,
      status: "NEED_MANUAL_REVIEW",
      manual_review_required: true,
      notes: "Placeholder only. Do not send official document before manual review.",
      created_at: new Date().toISOString(),
    });
  });
}

export function updateOrderMockStatus(db, orderId, field, value) {
  const order = db.orders.find((item) => item.id === orderId);
  if (!order) return null;
  if (["status", "payment_status", "production_status"].includes(field)) {
    order[field] = value;
    order.updated_at = new Date().toISOString();
  }
  return order;
}

export function createShipmentFromOrder(db, orderId) {
  const order = db.orders.find((item) => item.id === orderId);
  if (!order) return null;
  let shipment = (db.shipments || []).find((item) => item.order_id === orderId);
  if (shipment) return shipment;

  const shipmentNo = `CBM-S-${todayIso().replaceAll("-", "")}-${String((db.shipments || []).length + 1).padStart(3, "0")}`;
  shipment = {
    id: newId("shp"),
    shipment_no: shipmentNo,
    order_id: order.id,
    projectId: order.project_id || "",
    project_id: order.project_id || "",
    customer_id: order.customer_id || "",
    route: `China -> ${order.destination_port || "Destination port TBD"}`,
    container: "To be confirmed",
    goods: order.items?.map((item) => item.description).filter(Boolean).join("; ") || "Order goods placeholder",
    status: ShipmentStatus.BOOKING_PENDING,
    eta: "TBD",
    destination_port: order.destination_port || "",
    document_status: "DRAFT_PLACEHOLDERS",
    manual_review_required: true,
    notes: "Shipment draft only. Booking, BL, CI, PL and release documents require manual review.",
    created_at: new Date().toISOString(),
  };

  order.status = OrderStatus.READY_TO_SHIP;
  order.production_status = ProductionStatus.READY_TO_SHIP;
  order.updated_at = new Date().toISOString();
  db.shipments.unshift(shipment);

  ["BOOKING_NOTE_DRAFT", "BL_DRAFT_REVIEW", "FINAL_CI_PL_REVIEW"].forEach((type) => {
    db.document_drafts.unshift({
      id: newId("doc"),
      order_id: order.id,
      shipment_id: shipment.id,
      type,
      title: `${type.replaceAll("_", " ")} placeholder`,
      status: "NEED_MANUAL_REVIEW",
      manual_review_required: true,
      notes: "Shipment document placeholder only. Manual review required before release.",
      created_at: new Date().toISOString(),
    });
  });

  return shipment;
}

export function ensureDocumentSeeds(db) {
  if (!Array.isArray(db.sellers) || !db.sellers.length) db.sellers = defaultSellers.map((seller) => structuredClone(seller));
  if (!Array.isArray(db.documents)) db.documents = [];
  if (!db.documents.some((doc) => doc.sample_key === "CL5437")) {
    db.documents.unshift(calculateDocument(createCl5437Document(db)));
  }
  if (!db.documents.some((doc) => doc.sample_key === "O_CLUB_HANDRAILS")) {
    db.documents.unshift(calculateDocument(createOClubHandrailsDocument(db)));
  }
  return db.documents;
}

export function calculateDocument(document) {
  const next = structuredClone(document);
  next.items = (next.items || []).map(calculateDocumentItem);
  const totals = calculateDocumentTotals(next.items);
  next.document_totals = totals;
  next.total_weight_kg = totals.total_weight_kg;
  next.subtotal_usd = roundMoney(totals.total_amount);
  next.total_usd = next.currency === "USD" ? next.subtotal_usd : next.subtotal_usd;
  next.updated_at = new Date().toISOString();
  return next;
}

export function calculateDocumentItem(item) {
  let next;
  try {
    next = calculateDocumentServiceItem(item);
  } catch {
    return { ...item };
  }
  if (next.item_type === DocumentItemType.CHARGE) {
    next.show_internal_breakdown_to_customer = Boolean(next.show_internal_breakdown_to_customer);
  }
  return next;
}

export function upsertCalculatedDocument(db, document) {
  const calculated = calculateDocument(document);
  const index = db.documents.findIndex((item) => item.id === calculated.id);
  if (index >= 0) db.documents[index] = calculated;
  else db.documents.unshift(calculated);
  return calculated;
}

export function duplicateDocument(db, documentId) {
  const source = db.documents.find((item) => item.id === documentId);
  if (!source) return null;
  const copy = calculateDocument({
    ...structuredClone(source),
    id: newId("doc"),
    document_no: `${source.document_no}-COPY`,
    status: DocumentStatus.DRAFT,
    sample_key: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  db.documents.unshift(copy);
  return copy;
}

export function createProductionOrderFromDocument(db, documentId) {
  const source = db.documents.find((item) => item.id === documentId);
  if (!source) return null;
  const existing = db.documents.find((item) => item.source_document_id === documentId && item.document_type === DocumentType.PRODUCTION_ORDER);
  if (existing) return existing;
  const production = calculateDocument({
    ...structuredClone(source),
    id: newId("doc"),
    document_type: DocumentType.PRODUCTION_ORDER,
    document_no: `PO-${source.project_code || source.document_no}`,
    source_document_id: source.id,
    status: DocumentStatus.NEED_REVIEW,
    remarks: source.production_remarks || "工厂生产单。仅保留工厂生产所需字段。",
    internal_notes: "Production order generated from customer document. Manual review required before sending to factory.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  db.documents.unshift(production);
  return production;
}

export function documentArchiveInfo(document) {
  const date = compactDate(document.date || todayIso());
  const alias = sanitizeFileName(document.customer?.folder_alias || document.customer?.name || "Customer");
  const code = sanitizeFileName(document.project_code || document.document_no || "DOC");
  const type = document.document_type === DocumentType.PROFORMA_INVOICE ? "PI" : document.document_type === DocumentType.PRODUCTION_ORDER ? "ProductionOrder" : "Quotation";
  const archiveYear = String(document.date || todayIso()).slice(0, 4);
  const archiveOrderNo = document.archive_order_no || code;
  const recommendedVersion = getNextVersion(document.exported_files || []);
  const recommendedXlsxFileName = buildExportFileName({
    customer_alias: alias,
    archive_year: archiveYear,
    archive_order_no: archiveOrderNo,
    project: code,
    document_type: type,
    date,
    version: recommendedVersion,
    ext: "xlsx",
  });
  const recommendedPdfFileName = buildExportFileName({
    customer_alias: alias,
    archive_year: archiveYear,
    archive_order_no: archiveOrderNo,
    project: code,
    document_type: type,
    date,
    version: recommendedVersion,
    ext: "pdf",
  });
  return {
    archive_year: archiveYear,
    archive_order_no: archiveOrderNo,
    archive_folder: `询盘管理 / ${alias} / ${archiveYear}`,
    pdf_file_name: `CBM_${type}_${alias}_${code}_${date}.pdf`,
    excel_file_name: `CBM_${type}_${alias}_${code}_${date}.xlsx`,
    recommended_archive_path: buildArchivePath({
      base_path: document.archive_base_path || "桌面 / MacBook Air / OneNote",
      customer_folder_alias: alias,
      archive_year: archiveYear,
      archive_order_no: archiveOrderNo,
    }),
    recommended_pdf_file_name: recommendedPdfFileName,
    recommended_excel_file_name: recommendedXlsxFileName,
    recommended_zip_pdf_path: buildZipPath({
      base_path: document.archive_base_path || "桌面 / MacBook Air / OneNote",
      customer_alias: alias,
      archive_year: archiveYear,
      archive_order_no: archiveOrderNo,
      file_name: recommendedPdfFileName,
    }),
  };
}

function createBaseDocument(db, overrides = {}) {
  const seller = db.sellers?.[0] || defaultSellers[0];
  const base = {
    id: newId("doc"),
    document_type: DocumentType.QUOTATION,
    document_no: `CBM-DOC-${compactDate(todayIso())}-${String((db.documents || []).length + 1).padStart(3, "0")}`,
    date: todayIso(),
    seller_id: seller.id,
    seller: structuredClone(seller),
    customer_id: "",
    customer: {
      name: "",
      address: "",
      attn: "",
      email: "",
      phone: "",
      folder_alias: "",
    },
    project_name: "",
    project_code: "",
    project_address: "",
    loading_port: "China",
    discharge_port: "",
    trade_term: "EXW",
    payment_term: "To be confirmed by manual review",
    currency: "USD",
    exchange_rate: "",
    remarks: "",
    internal_notes: "",
    status: DocumentStatus.DRAFT,
    archive_year: String(todayIso()).slice(0, 4),
    archive_order_no: "",
    archive_folder: "",
    manual_review_required: true,
    items: [],
    created_at: new Date().toISOString(),
  };
  return { ...base, ...overrides };
}

export function createCl5437Document(db) {
  return createBaseDocument(db, {
    sample_key: "CL5437",
    document_type: DocumentType.PROFORMA_INVOICE,
    document_no: "CBM-PI-CL5437",
    project_code: "CL5437",
    customer: {
      name: "Caribbean Green Construction INC by Global First Industries LLC",
      address: "",
      attn: "",
      email: "",
      phone: "",
      folder_alias: "PanamaKevin",
    },
    project_name: "Georgetown, Guyana",
    project_address: "Georgetown, Guyana",
    trade_term: "EXW",
    payment_term: "Manual review required before official payment terms",
    remarks: "First 1,000 pcs will be shipped by air freight. The remaining 5,500 pcs will be shipped by sea freight.",
    internal_notes: "Air freight internal note must stay hidden from customer preview.",
    archive_order_no: "CL5437",
    items: [
      {
        id: newId("item"),
        item_type: DocumentItemType.CUT_ALUMINUM_PROFILE,
        image: "",
        item_code: "CL5437",
        description: "Cut Aluminum U-Profile",
        finish: "Mill finish",
        cut_length_mm: 114,
        quantity_pcs: 6500,
        unit_price_usd_per_pc: 0.52,
      },
      {
        id: newId("item"),
        item_type: DocumentItemType.CHARGE,
        display_name: "Air Freight Charge for First 1,000 pcs",
        quantity: 1,
        unit_price: 2000,
        amount: 2000,
        internal_cost_note: "150kg × RMB85/kg + RMB600 customs declaration, converted and rounded to USD2000",
        show_internal_breakdown_to_customer: false,
      },
    ],
  });
}

export function createOClubHandrailsDocument(db) {
  return createBaseDocument(db, {
    sample_key: "O_CLUB_HANDRAILS",
    document_type: DocumentType.PROFORMA_INVOICE,
    document_no: "CBM-PI-OCLUB-HANDRAILS",
    project_code: "OCLUB-HANDRAILS",
    customer: {
      name: "PANAGLASS INVESTMENT CORPORATION SA",
      address: "",
      attn: "",
      email: "",
      phone: "",
      folder_alias: "Panaglass",
    },
    project_name: "O CLUB HANDRAILS",
    project_address: "O CLUB HANDRAILS",
    trade_term: "EXW",
    payment_term: "Manual review required before official payment terms",
    remarks: "Color: RAL 7016. Manual review required before official PI or quotation.",
    archive_order_no: "OCLUB_HANDRAILS",
    items: [
      aluminumProfileItem("GJQ0001", "Aluminum handrail profile", "6063-T5", "Powder coated", "RAL 7016", 5.85, 4.454, 115, 4.45),
      aluminumProfileItem("YW-003", "Aluminum handrail profile", "6063-T5", "Powder coated", "RAL 7016", 5.85, 0.842, 115, 4.45),
      aluminumProfileItem("T6604", "Aluminum handrail profile", "6063-T5", "Powder coated", "RAL 7016", 5.85, 0.065, 115, 4.45),
      accessoryItem("Wall End Caps", 45, 2.34),
      accessoryItem("Visible End Caps", 15, 2.34),
      accessoryItem("90° Elbows", 15, 2.89),
      accessoryItem("Adjustable Elbows", 20, 2.89),
      accessoryItem("Handrail Connectors / Tube Joints", 125, 3.07),
    ],
  });
}

function aluminumProfileItem(code, description, material, finish, color, length, weight, qty, price) {
  return {
    id: newId("item"),
    item_type: DocumentItemType.ALUMINUM_PROFILE,
    image: "",
    item_code: code,
    description,
    material,
    finish,
    color,
    length_m: length,
    weight_kg_per_m: weight,
    quantity_pcs: qty,
    unit_price_usd_per_kg: price,
    internal_weight_factor: DEFAULT_INTERNAL_WEIGHT_FACTOR,
  };
}

function accessoryItem(name, qty, price) {
  return {
    id: newId("item"),
    item_type: DocumentItemType.ACCESSORY,
    image: "",
    item_name: name,
    quantity_pcs: qty,
    unit_price_usd_per_pc: price,
  };
}

export function createBlankDocument(db, documentType = DocumentType.QUOTATION) {
  const customer = db.customers?.[0];
  return upsertCalculatedDocument(
    db,
    createBaseDocument(db, {
      document_type: documentType,
      document_no: `CBM-${documentType === DocumentType.PROFORMA_INVOICE ? "PI" : "QT"}-${compactDate(todayIso())}-${String((db.documents || []).length + 1).padStart(3, "0")}`,
      customer_id: customer?.id || "",
      customer: {
        name: customer?.name || "New Customer",
        address: "",
        attn: "",
        email: customer?.email || "",
        phone: "",
        folder_alias: customer?.folder_alias || sanitizeFileName(customer?.name || "Customer"),
      },
      project_name: "Manual review project",
      project_code: "MANUAL",
      items: [
        aluminumProfileItem("PROFILE-CODE", "Aluminum profile placeholder", "6063-T5", "Powder coated", "To be confirmed", 5.8, 1.2, 100, 4.5),
      ],
    }),
  );
}

export function ensureProductSeeds(db) {
  if (!Array.isArray(db.products)) db.products = [];
  const seeds = [
    {
      id: "prod-gjq0001",
      product_type: DocumentItemType.ALUMINUM_PROFILE,
      category: "Handrail profile",
      item_code: "GJQ0001",
      item_name: "Aluminum handrail profile",
      description: "Powder coated aluminum handrail profile for O CLUB HANDRAILS.",
      material: "6063-T5",
      finish: "Powder coated",
      color: "RAL 7016",
      length_m: 5.85,
      weight_kg_per_m: 4.454,
      default_unit_price_usd_per_kg: 4.45,
      status: ProductStatus.ACTIVE,
      source: "O CLUB sample",
    },
    {
      id: "prod-yw003",
      product_type: DocumentItemType.ALUMINUM_PROFILE,
      category: "Handrail profile",
      item_code: "YW-003",
      item_name: "Aluminum handrail profile",
      description: "Secondary handrail aluminum profile.",
      material: "6063-T5",
      finish: "Powder coated",
      color: "RAL 7016",
      length_m: 5.85,
      weight_kg_per_m: 0.842,
      default_unit_price_usd_per_kg: 4.45,
      status: ProductStatus.ACTIVE,
      source: "O CLUB sample",
    },
    {
      id: "prod-t6604",
      product_type: DocumentItemType.ALUMINUM_PROFILE,
      category: "Handrail profile",
      item_code: "T6604",
      item_name: "Small aluminum profile",
      description: "Small handrail system aluminum profile.",
      material: "6063-T5",
      finish: "Powder coated",
      color: "RAL 7016",
      length_m: 5.85,
      weight_kg_per_m: 0.065,
      default_unit_price_usd_per_kg: 4.45,
      status: ProductStatus.ACTIVE,
      source: "O CLUB sample",
    },
    {
      id: "prod-cl5437",
      product_type: DocumentItemType.CUT_ALUMINUM_PROFILE,
      category: "Cut aluminum profile",
      item_code: "CL5437",
      item_name: "Cut Aluminum U-Profile",
      description: "Cut Aluminum U-Profile, 114mm length.",
      finish: "Mill finish",
      cut_length_mm: 114,
      default_unit_price_usd_per_pc: 0.52,
      status: ProductStatus.ACTIVE,
      source: "CL5437 sample",
    },
    {
      id: "prod-wall-end-caps",
      product_type: DocumentItemType.ACCESSORY,
      category: "Handrail accessories",
      item_code: "ACC-ENDCAP-WALL",
      item_name: "Wall End Caps",
      description: "Handrail wall end caps.",
      default_unit_price_usd_per_pc: 2.34,
      status: ProductStatus.ACTIVE,
      source: "O CLUB sample",
    },
    {
      id: "prod-airfreight",
      product_type: DocumentItemType.CHARGE,
      category: "Charge template",
      item_code: "CHG-AIR-FREIGHT",
      item_name: "Air Freight Charge",
      description: "Charge template. Internal freight breakdown remains hidden from customer documents by default.",
      default_unit_price_usd_per_pc: 2000,
      show_internal_breakdown_to_customer: false,
      internal_notes: "Internal freight and customs cost should stay hidden unless manually approved.",
      status: ProductStatus.NEED_REVIEW,
      source: "CL5437 sample",
    },
  ];
  seeds.forEach((seed) => {
    if (!db.products.some((item) => item.id === seed.id || item.item_code === seed.item_code)) {
      db.products.push({ ...seed, created_at: new Date().toISOString() });
    }
  });
  return db.products;
}

export function productToDocumentItem(product, quantity = 100) {
  if (!product) return null;
  if (product.product_type === DocumentItemType.ALUMINUM_PROFILE) {
    return calculateDocumentItem({
      id: newId("item"),
      item_type: DocumentItemType.ALUMINUM_PROFILE,
      image: product.image || "",
      item_code: product.item_code,
      description: product.description || product.item_name,
      material: product.material || "",
      finish: product.finish || "",
      color: product.color || "",
      length_m: Number(product.length_m || 0),
      weight_kg_per_m: Number(product.weight_kg_per_m || 0),
      quantity_pcs: quantity,
      unit_price_usd_per_kg: Number(product.default_unit_price_usd_per_kg || 0),
      internal_weight_factor: DEFAULT_INTERNAL_WEIGHT_FACTOR,
    });
  }
  if (product.product_type === DocumentItemType.CUT_ALUMINUM_PROFILE) {
    return calculateDocumentItem({
      id: newId("item"),
      item_type: DocumentItemType.CUT_ALUMINUM_PROFILE,
      image: product.image || "",
      item_code: product.item_code,
      description: product.description || product.item_name,
      finish: product.finish || "",
      cut_length_mm: Number(product.cut_length_mm || 0),
      quantity_pcs: quantity,
      unit_price_usd_per_pc: Number(product.default_unit_price_usd_per_pc || 0),
    });
  }
  if (product.product_type === DocumentItemType.ACCESSORY) {
    return calculateDocumentItem({
      id: newId("item"),
      item_type: DocumentItemType.ACCESSORY,
      image: product.image || "",
      item_name: product.item_name || product.item_code,
      quantity_pcs: quantity,
      unit_price_usd_per_pc: Number(product.default_unit_price_usd_per_pc || 0),
    });
  }
  return calculateDocumentItem({
    id: newId("item"),
    item_type: DocumentItemType.CHARGE,
    display_name: product.item_name || product.description || "Charge",
    quantity: 1,
    unit_price: Number(product.default_unit_price_usd_per_pc || 0),
    amount: Number(product.default_unit_price_usd_per_pc || 0),
    internal_cost_note: product.internal_notes || "",
    show_internal_breakdown_to_customer: false,
  });
}

function compactDate(value) {
  return String(value || todayIso()).replaceAll("-", "").slice(0, 8);
}

function sanitizeFileName(value) {
  return String(value || "Customer")
    .replace(/[^a-z0-9\u4e00-\u9fa5_-]+/gi, "")
    .slice(0, 60) || "Customer";
}

function roundMoney(value) {
  return documentRoundMoney(value);
}

function roundWeight(value) {
  return documentRoundWeight(value);
}

export function updateInquiryStatus(db, inquiryId, status) {
  const inquiry = db.inquiries.find((item) => item.id === inquiryId);
  if (!inquiry) return null;
  inquiry.status = status;
  inquiry.updated_at = new Date().toISOString();
  return inquiry;
}

export function buildBusinessFlowRows(db) {
  const rows = [];
  (db.inquiries || []).forEach((inquiry) => {
    const project = (db.projects || []).find((item) => item.id === inquiry.project_id || item.inquiry_id === inquiry.id);
    const quotation = (db.quotations || []).find((item) => item.inquiry_id === inquiry.id || (project && item.project_id === project.id));
    const order = quotation ? (db.orders || []).find((item) => item.quotation_id === quotation.id) : null;
    const shipment = order ? (db.shipments || []).find((item) => item.order_id === order.id) : null;
    const task = (db.follow_up_tasks || [])
      .filter((item) => item.inquiry_id === inquiry.id && item.status === TaskStatus.PENDING)
      .sort((a, b) => String(a.due_date || "").localeCompare(String(b.due_date || "")))[0];
    rows.push({
      id: inquiry.id,
      source: inquiry.source,
      customer: inquiry.lead_info?.company || inquiry.lead_info?.name || "Unknown customer",
      country: inquiry.lead_info?.country || "",
      business_line: inquiry.business_line,
      inquiry_title: inquiry.title,
      inquiry_status: inquiry.status,
      project_title: project?.title || project?.name || "",
      project_stage: project?.stage || "",
      quotation_no: quotation?.quote_no || quotation?.no || "",
      quotation_status: quotation?.status || "",
      order_no: order?.order_no || "",
      order_status: order?.status || "",
      shipment_no: shipment?.shipment_no || "",
      shipment_status: shipment?.status || "",
      score: inquiry.score || 0,
      next_action: task?.title || inquiry.recommended_next_action || project?.next_action || "Review manually",
      risk: flowRisk(inquiry, quotation, order, shipment),
      current_stage: flowStage(project, quotation, order, shipment),
      next_follow_up_at: task?.due_date || "",
    });
  });
  return rows;
}

function flowStage(project, quotation, order, shipment) {
  if (shipment) return "Shipment";
  if (order) return "Order";
  if (quotation) return "Quotation";
  if (project) return "Project";
  return "Inquiry";
}

function flowRisk(inquiry, quotation, order, shipment) {
  if (shipment?.manual_review_required) return "Shipment documents need manual review";
  if (order?.manual_review_required) return "Order / PI needs manual review";
  if (quotation?.manual_review_required) return "Quotation draft needs manual review";
  if ((inquiry.missing_info || []).length) return `Missing info: ${inquiry.missing_info.length}`;
  return "No blocking risk in mock checklist";
}
