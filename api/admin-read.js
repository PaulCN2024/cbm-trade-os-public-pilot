const { getSupabaseClient, handleApiError, sendJson } = require("./_supabase");

const SOURCE_LIMIT = 80;
const QUEUE_LIMIT = 5;

const DISABLED_ACTIONS = Object.freeze([
  "create",
  "update",
  "delete",
  "send",
  "approve",
  "reject",
  "create_task",
  "send_rfq",
  "create_quote",
  "generate_pi",
  "confirm_order",
  "confirm_payment",
  "confirm_production",
  "confirm_shipment",
]);

const DOCUMENT_DISABLED_ACTIONS = Object.freeze([
  "upload_file",
  "download_file",
  "delete_file",
  "parse_file",
  "run_ocr",
  "generate_quote",
  "generate_pi",
  "send_to_customer",
]);

const PRE_QUOTATION_DISABLED_ACTIONS = Object.freeze([
  "calculate_price",
  "generate_quote",
  "send_quote",
  "generate_pi",
  "generate_contract",
  "confirm_order",
  "request_payment",
  "start_production",
  "arrange_shipment",
]);

const QUOTATION_DISABLED_ACTIONS = Object.freeze([
  "calculate_price",
  "generate_quote",
  "send_quote",
  "generate_pi",
  "confirm_order",
  "request_payment",
  "start_production",
  "arrange_shipment",
]);

const KNOWLEDGE_DISABLED_ACTIONS = Object.freeze([
  "create_knowledge",
  "edit_knowledge",
  "delete_knowledge",
  "approve_knowledge",
  "reject_knowledge",
  "upload_file",
  "parse_file",
  "run_ocr",
  "run_rag",
  "generate_ai_answer",
  "send_to_customer",
  "create_quote",
  "generate_pi",
  "confirm_order",
]);

const BUSINESS_CARD_DISABLED_ACTIONS = Object.freeze([
  "upload_file",
  "parse_image",
  "run_ocr",
  "call_ai_provider",
  "create_customer",
  "import_customer",
  "create_task",
  "send_email",
  "send_whatsapp",
  "send_followup",
  "create_quote",
  "generate_pi",
  "confirm_order",
  "confirm_payment",
  "trigger_production",
  "trigger_shipment",
]);

const CUSTOMER_VERIFICATION_DISABLED_ACTIONS = Object.freeze([
  "external_lookup",
  "web_search",
  "scrape_website",
  "call_ai_provider",
  "create_customer",
  "update_customer",
  "merge_customer",
  "send_email",
  "send_whatsapp",
  "create_quote",
  "generate_pi",
  "confirm_order",
  "confirm_payment",
  "trigger_production",
  "trigger_shipment",
]);

const FOLLOWUP_ASSISTANT_DISABLED_ACTIONS = Object.freeze([
  "create_task",
  "schedule_reminder",
  "send_email",
  "send_whatsapp",
  "send_linkedin",
  "call_ai_provider",
  "update_customer",
  "update_inquiry",
  "create_quote",
  "generate_pi",
  "confirm_order",
  "confirm_payment",
  "trigger_production",
  "trigger_shipment",
]);

const DASHBOARD_HIGH_RISK_TERMS = Object.freeze([
  "price",
  "payment",
  "delivery",
  "quality",
  "claim",
  "refund",
  "quotation",
  "pi",
  "contract",
  "order",
  "价格",
  "付款",
  "交期",
  "质量",
  "赔付",
  "报价",
  "合同",
  "订单",
]);

function queryValue(request, key) {
  const value = request.query?.[key];
  if (Array.isArray(value)) return value[0] || "";
  if (value) return value;
  try {
    return new URL(request.url || "/", "http://localhost").searchParams.get(key) || "";
  } catch {
    return "";
  }
}

function adminReadResource(request) {
  const explicitResource = queryValue(request, "resource");
  if (explicitResource) return String(explicitResource).replace(/^\/+|\/+$/g, "");

  try {
    const pathname = new URL(request.url || "/", "http://localhost").pathname;
    return pathname.replace(/^\/api\/admin-read\/?/, "").replace(/^\/+|\/+$/g, "");
  } catch {
    return "";
  }
}

function arrayValue(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === null || value === undefined || value === "") return [];
  return [value];
}

function safeText(value, fallback) {
  const text = String(value || "").trim();
  return text || fallback;
}

function truncateText(value, fallback, maxLength = 180) {
  const text = safeText(value, fallback);
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text;
}

function isToday(value, now = new Date()) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return (
    date.getUTCFullYear() === now.getUTCFullYear() &&
    date.getUTCMonth() === now.getUTCMonth() &&
    date.getUTCDate() === now.getUTCDate()
  );
}

function isDue(value, now = new Date()) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() <= now.getTime();
}

function hasMissingInfo(record, key = "missing_info") {
  return arrayValue(record?.[key]).length > 0;
}

function hasHighRiskText(...values) {
  const text = values
    .flatMap((value) => arrayValue(value))
    .map((value) => String(value || "").toLowerCase())
    .join(" ");
  return DASHBOARD_HIGH_RISK_TERMS.some((term) => text.includes(term.toLowerCase()));
}

function statusNeedsReview(status) {
  const value = String(status || "").toUpperCase();
  return !value || value.includes("NEW") || value.includes("NEED") || value.includes("REVIEW") || value.includes("PENDING");
}

function riskLabel(record, riskFields = []) {
  return hasHighRiskText(...riskFields.map((field) => record?.[field])) ? "高风险" : "待复核";
}

function queueItem({ title, status, risk, summary, nextStep, disabledActions }) {
  return {
    title: truncateText(title, "未命名记录", 120),
    status: safeText(status, "待复核"),
    risk: safeText(risk, "暂无风险等级"),
    summary: truncateText(summary, "需要人工确认", 180),
    next_step: truncateText(nextStep, "需要人工确认", 180),
    disabled_actions: disabledActions || [...DISABLED_ACTIONS],
  };
}

function safetyPayload(disabledActions = DISABLED_ACTIONS) {
  return {
    human_review_required: true,
    disabled_actions: [...disabledActions],
  };
}

function isSupportedResource(resource) {
  return (
    resource === "dashboard-summary" ||
    resource === "customers" ||
    resource === "inquiries" ||
    resource === "ai-review" ||
    resource === "supplier-capabilities" ||
    resource === "documents" ||
    resource === "pre-quotation-review" ||
    resource === "quotations" ||
    resource === "knowledge-summary" ||
    resource === "knowledge-categories" ||
    resource === "knowledge-items" ||
    resource === "knowledge-review-queue" ||
    resource === "knowledge-linked-context" ||
    resource === "business-card-summary" ||
    resource === "business-card-capture-sources" ||
    resource === "business-card-extraction-results" ||
    resource === "customer-profile-drafts" ||
    resource === "business-card-review-queue" ||
    resource === "business-card-duplicate-checks" ||
    resource === "business-card-followup-drafts" ||
    resource === "customer-verification-summary" ||
    resource === "customer-verification-requests" ||
    resource === "customer-verification-evidence" ||
    resource === "customer-verification-scores" ||
    resource === "customer-verification-duplicate-matches" ||
    resource === "customer-verification-review-queue" ||
    resource === "customer-verification-reviews" ||
    resource === "followup-summary" ||
    resource === "followup-candidates" ||
    resource === "followup-missing-information" ||
    resource === "followup-recommendations" ||
    resource === "followup-message-drafts" ||
    resource === "followup-review-queue" ||
    resource === "followup-reviews"
  );
}

function standardPayload({ resource, records = [], summary = {}, warnings = [] }) {
  return {
    meta: {
      generated_at: new Date().toISOString(),
      source: "admin_read",
      resource,
      is_fallback: warnings.length > 0,
    },
    records,
    summary,
    safety: safetyPayload(),
    warnings,
  };
}

async function readSource({ supabase, table, select = "*", order = "created_at", orderOptions, limit = SOURCE_LIMIT, warning, warnings }) {
  try {
    let query = supabase.from(table).select(select).limit(limit);
    if (order) query = query.order(order, orderOptions || { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch {
    warnings.push(warning);
    return [];
  }
}

function customerRecord(row) {
  return {
    id: row.id,
    name: row.name || "",
    contact_name: row.contact_name || "",
    company_name: row.company_name || "",
    company: row.company || "",
    aliases: row.aliases || "",
    company_id: row.company_id || "",
    country: row.country || "",
    language: row.language || "",
    email: row.email || "",
    whatsapp: row.whatsapp || "",
    phone: row.phone || "",
    source: row.source || row.metadata?.source || "",
    metadata: row.metadata || {},
    stage: row.stage || "",
    status: row.status || "",
    business_line: row.business_line || "",
    last_contact_at: row.last_contact_at || "",
    next_follow_up_at: row.next_follow_up_at || "",
    notes: row.notes || "",
    summary: row.summary || "",
    created_at: row.created_at || "",
    updated_at: row.updated_at || "",
  };
}

function inquiryRecord(row) {
  return {
    id: row.id,
    lead_id: row.lead_id || "",
    customer_id: row.customer_id || "",
    source: row.source || "",
    status: row.status || "",
    business_line: row.business_line || "",
    title: row.title || "",
    lead_info: row.metadata?.lead_info || {},
    project_type: row.project_type || "",
    drawing_status: row.drawing_status || "",
    quote_method: row.quote_method || "",
    material_finish: row.material_finish || "",
    destination_port: row.destination_port || "",
    project_description: row.project_description || "",
    support_needed: row.support_needed || "",
    attachment_names: row.metadata?.attachment_names || [],
    ai_summary: row.ai_summary || "",
    missing_info: row.missing_info || [],
    score: row.score || 0,
    recommended_next_action: row.recommended_next_action || "",
    reply_draft_en: row.reply_draft_en || "",
    reply_draft_zh: row.reply_draft_zh || "",
    reply_draft_es: row.reply_draft_es || "",
    next_follow_up_at: row.next_follow_up_at || "",
    created_at: row.created_at || "",
    updated_at: row.updated_at || "",
  };
}

function aiReviewRecord(row) {
  return {
    id: row.id,
    title: safeText(row.title || row.inquiry_title || row.analysis_title, "AI 分析记录"),
    type: safeText(row.draft_type || row.analysis_type || row.type, "AI 分析记录"),
    category: safeText(row.category || row.task_type || row.source_type, "AI 分析记录"),
    risk: safeText(row.risk_level || arrayValue(row.risk_flags).join("、"), "暂无风险等级"),
    status: safeText(row.approval_status || row.status || (row.approval_required === false ? "仅展示" : "待人工复核"), "待人工复核"),
    summary: truncateText(row.ai_summary || row.summary || row.analysis_summary, "需要人工确认", 240),
    suggestion: truncateText(row.suggestion || row.recommended_next_action || row.suggested_reply || row.reply_draft_zh || row.reply_draft_en, "需要人工确认", 240),
    created_at: row.created_at || "",
    updated_at: row.updated_at || "",
  };
}

function supplierCapabilityRecord(row) {
  const title = safeText(row.title || row.name || row.capability_name || row.equipment, "能力资料");
  return {
    id: row.id,
    title,
    name: title,
    supplier: row.supplier || row.supplier_name || row.supplier_company || "",
    company: row.company || row.company_name || row.supplier_company || "",
    capability_category: safeText(row.capability_category || row.category || row.capability_line, "能力资料"),
    process: safeText(row.process || row.manufacturing_method || row.equipment || row.capability_line, "需要供应商确认"),
    status: safeText(row.supplier_status || row.status || row.capability_status, "待人工核实"),
    risk: safeText(row.risk_level || row.risk, "暂无风险等级"),
    summary: truncateText(row.summary || row.public_description || row.monthly_capacity, "需要供应商确认", 240),
    created_at: row.created_at || "",
    updated_at: row.updated_at || "",
  };
}

function linkedBusinessType(row) {
  if (row.related_type) return safeText(row.related_type, "未关联");
  if (row.inquiry_id) return "inquiry";
  if (row.customer_id) return "customer";
  if (row.lead_id) return "lead";
  return "未关联";
}

function linkedBusinessId(row) {
  return row.related_id || row.inquiry_id || row.customer_id || row.lead_id || "";
}

function documentRisk(row) {
  return hasHighRiskText(row.doc_type, row.file_name, row.file_type) ? "高风险" : "暂无风险等级";
}

function documentMetadataRecord(row, source) {
  const title = safeText(row.file_name || row.title || row.name || row.doc_type || row.file_type, "文件资料");
  const fileType = safeText(row.doc_type || row.file_type || row.document_type, "文件资料");

  return {
    id: row.id || "",
    title,
    file_type: fileType,
    document_type: fileType,
    linked_business_type: linkedBusinessType(row),
    linked_business_id: linkedBusinessId(row),
    status: safeText(row.status, "待人工复核"),
    risk: documentRisk(row),
    source: safeText(source || row.source, "documents"),
    file_size: row.file_size === null || row.file_size === undefined ? "" : row.file_size,
    manual_review_required: true,
    created_at: row.created_at || "",
    updated_at: row.updated_at || "",
  };
}

function metadataObject(row) {
  return row?.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata) ? row.metadata : {};
}

function leadInfoObject(row) {
  const leadInfo = metadataObject(row).lead_info;
  return leadInfo && typeof leadInfo === "object" && !Array.isArray(leadInfo) ? leadInfo : {};
}

function uniqueSafeList(values, limit = 8) {
  const seen = new Set();
  const result = [];
  values.forEach((value) => {
    const text = safeText(value, "");
    if (!text || seen.has(text)) return;
    seen.add(text);
    result.push(text);
  });
  return result.slice(0, limit);
}

function customerDisplayName(row) {
  return safeText(row?.company_name || row?.company || row?.name || row?.contact_name, "需要人工确认");
}

function preQuotationMissingInformation(row) {
  const missing = arrayValue(row?.missing_info);
  if (!safeText(row?.product_category || row?.project_type, "")) missing.push("产品分类待确认");
  if (!safeText(row?.project_description || row?.original_message || row?.ai_summary, "")) missing.push("需求描述待补充");
  return uniqueSafeList(missing);
}

function preQuotationDocumentStatus(row) {
  const attachmentNames = arrayValue(metadataObject(row).attachment_names);
  const drawingStatus = String(row?.drawing_status || "").toLowerCase();
  if (attachmentNames.length > 0 || drawingStatus.includes("received") || drawingStatus.includes("已收到")) {
    return "文件需人工复核";
  }
  return "文件待确认";
}

function preQuotationReadinessStatus(row, missingInformation, documentStatus) {
  if (documentStatus === "文件待确认") return "missing_documents";
  if (missingInformation.length > 0) return "needs_customer_clarification";
  if (!row?.customer_id && !safeText(leadInfoObject(row).name || leadInfoObject(row).company, "")) return "needs_customer_clarification";
  return "ready_for_manual_review";
}

function preQuotationRisk(row, missingInformation) {
  if (hasHighRiskText(row?.status, row?.title, row?.ai_summary, row?.recommended_next_action, row?.original_message)) return "高风险";
  if (missingInformation.length > 0) return "信息待补充";
  return "暂无风险等级";
}

function preQuotationProductSummary(row) {
  return truncateText(row?.product_category || row?.project_type || row?.title || row?.project_description, "需要人工确认", 160);
}

function preQuotationReviewRecord(row, customerMap) {
  const customer = customerMap.get(row.customer_id);
  const leadInfo = leadInfoObject(row);
  const missingInformation = preQuotationMissingInformation(row);
  const documentStatus = preQuotationDocumentStatus(row);
  const readinessStatus = preQuotationReadinessStatus(row, missingInformation, documentStatus);

  return {
    id: row.id || "",
    inquiry_id: row.id || "",
    inquiry_title: truncateText(row.title, "报价前复核", 140),
    customer_name: safeText(leadInfo.company || leadInfo.name || customerDisplayName(customer), "需要人工确认"),
    product_summary: preQuotationProductSummary(row),
    readiness_status: readinessStatus,
    missing_information: missingInformation,
    supplier_status: "供应商待确认",
    document_status: documentStatus,
    risk: preQuotationRisk(row, missingInformation),
    human_next_step: truncateText(
      row.recommended_next_action,
      "先补齐关键信息，再由人工决定是否进入供应商询价或报价准备",
      220
    ),
    ai_suggestion_summary: row.ai_summary ? truncateText(row.ai_summary, "", 220) : "",
    created_at: row.created_at || "",
    updated_at: row.updated_at || "",
  };
}

function preQuotationSummary(records) {
  return {
    total_reviews: records.length,
    needs_customer_clarification: records.filter((record) => record.readiness_status === "needs_customer_clarification").length,
    needs_supplier_confirmation: records.filter((record) => record.readiness_status === "needs_supplier_confirmation").length,
    missing_documents: records.filter((record) => record.readiness_status === "missing_documents").length,
    draft_only: records.filter((record) => record.readiness_status === "draft_only").length,
    high_risk: records.filter((record) => record.risk === "高风险").length,
  };
}

function quotationCustomerName(row, customerMap) {
  const customer = customerMap.get(row.customer_id);
  return safeText(customerDisplayName(customer), "需要人工确认");
}

function quotationSafetyStatus(row) {
  if (row.approval_required !== false) return "human_review_required";
  return "metadata_only";
}

function quotationStatus(row) {
  const status = String(row.status || "").toUpperCase();
  if (!status || status.includes("DRAFT") || status.includes("NEW") || status.includes("PENDING") || status.includes("REVIEW")) {
    return "待人工复核";
  }
  return "仅供内部查看";
}

function quotationRecord(row, customerMap) {
  return {
    id: row.id || "",
    quote_no: row.quote_no || "",
    inquiry_id: row.inquiry_id || "",
    customer_name: quotationCustomerName(row, customerMap),
    quote_status: quotationStatus(row),
    currency: row.currency || "",
    total_amount: row.total_amount === null || row.total_amount === undefined ? "" : row.total_amount,
    human_review_required: true,
    safety_status: quotationSafetyStatus(row),
    created_at: row.created_at || "",
    updated_at: row.updated_at || "",
  };
}

function quotationSummary(records) {
  return {
    total_quotations: records.length,
    draft_only: records.filter((record) => record.quote_status === "待人工复核").length,
    needs_review: records.filter((record) => record.human_review_required).length,
    missing_review: records.filter((record) => !record.quote_no || record.customer_name === "需要人工确认").length,
    high_risk: records.filter((record) => record.safety_status === "human_review_required").length,
  };
}

const KNOWLEDGE_FALLBACK_CATEGORIES = Object.freeze([
  {
    id: "DEMO_PRODUCT_KNOWLEDGE",
    slug: "DEMO_PRODUCT_KNOWLEDGE",
    name_zh: "产品知识",
    name_en: "Product Knowledge",
    description: "DEMO product and specification knowledge for read-only trial display.",
    sort_order: 10,
  },
  {
    id: "DEMO_SUPPLIER_KNOWLEDGE",
    slug: "DEMO_SUPPLIER_KNOWLEDGE",
    name_zh: "供应商知识",
    name_en: "Supplier Knowledge",
    description: "DEMO supplier capability notes for internal review only.",
    sort_order: 20,
  },
  {
    id: "DEMO_QUOTATION_RULES",
    slug: "DEMO_QUOTATION_RULES",
    name_zh: "报价规则",
    name_en: "Quotation Rules",
    description: "DEMO quotation readiness and manual confirmation rules.",
    sort_order: 30,
  },
  {
    id: "DEMO_FILE_KNOWLEDGE",
    slug: "DEMO_FILE_KNOWLEDGE",
    name_zh: "文件知识",
    name_en: "File Knowledge",
    description: "DEMO file and document source tracking rules.",
    sort_order: 40,
  },
  {
    id: "DEMO_COMMUNICATION_TEMPLATES",
    slug: "DEMO_COMMUNICATION_TEMPLATES",
    name_zh: "沟通模板",
    name_en: "Communication Templates",
    description: "DEMO customer and supplier communication principles.",
    sort_order: 50,
  },
  {
    id: "DEMO_TRADE_SOP",
    slug: "DEMO_TRADE_SOP",
    name_zh: "贸易 SOP",
    name_en: "Trade SOP",
    description: "DEMO operating procedures for internal workflow review.",
    sort_order: 60,
  },
  {
    id: "DEMO_COMPLIANCE_SAFETY",
    slug: "DEMO_COMPLIANCE_SAFETY",
    name_zh: "合规与安全",
    name_en: "Compliance And Safety",
    description: "DEMO safety boundaries for AI-assisted workflows.",
    sort_order: 70,
  },
]);

const KNOWLEDGE_FALLBACK_ITEMS = Object.freeze([
  {
    id: "DEMO_WINDOW_CHECKLIST",
    title: "Aluminum window inquiry checklist",
    category_slug: "DEMO_PRODUCT_KNOWLEDGE",
    category: "产品知识",
    language: "en",
    summary: "Check drawings, opening size, profile system, glass, hardware, color, quantity, and destination before quote readiness.",
    source_type: "manual_sop",
    source_reference: "DEMO_SOP_WINDOW_CHECKLIST",
    confidence_level: "high",
    human_verified: true,
    verification_status: "verified",
    risk_level: "medium",
    visibility_scope: "ai_reference_only",
    tags: ["DEMO", "window", "inquiry"],
    updated_at: "",
  },
  {
    id: "DEMO_CURTAIN_WALL_READINESS",
    title: "Curtain wall quotation readiness checklist",
    category_slug: "DEMO_PRODUCT_KNOWLEDGE",
    category: "产品知识",
    language: "en",
    summary: "Curtain wall inquiries require elevation drawings, system type, glass specification, aluminum finish, quantity area, and installation responsibility confirmation.",
    source_type: "manual_sop",
    source_reference: "DEMO_SOP_CURTAIN_WALL_READINESS",
    confidence_level: "medium",
    human_verified: false,
    verification_status: "needs_review",
    risk_level: "high",
    visibility_scope: "internal_only",
    tags: ["DEMO", "curtain_wall", "quote_readiness"],
    updated_at: "",
  },
  {
    id: "DEMO_SUPPLIER_MATCHING",
    title: "Supplier capability matching rule",
    category_slug: "DEMO_SUPPLIER_KNOWLEDGE",
    category: "供应商知识",
    language: "en",
    summary: "Supplier matching should consider product category, process, MOQ, surface treatment, packaging, quality risk, and recent manual confirmation.",
    source_type: "supplier_record",
    source_reference: "DEMO_SUPPLIER_MATCHING_RULE",
    confidence_level: "medium",
    human_verified: false,
    verification_status: "needs_review",
    risk_level: "high",
    visibility_scope: "internal_only",
    tags: ["DEMO", "supplier", "manual_confirmation"],
    updated_at: "",
  },
  {
    id: "DEMO_QUOTE_FOB_QINGDAO",
    title: "FOB Qingdao quotation cost reminder",
    category_slug: "DEMO_QUOTATION_RULES",
    category: "报价规则",
    language: "en",
    summary: "FOB Qingdao quote preparation should confirm local port cost assumptions, export handling, packing, loading, and validity before customer use.",
    source_type: "quotation_note",
    source_reference: "DEMO_QUOTE_FOB_QINGDAO_REMINDER",
    confidence_level: "medium",
    human_verified: false,
    verification_status: "needs_review",
    risk_level: "high",
    visibility_scope: "confidential",
    tags: ["DEMO", "FOB", "quotation_rule"],
    updated_at: "",
  },
  {
    id: "DEMO_COMPLAINT_HANDLING",
    title: "Customer complaint handling principle",
    category_slug: "DEMO_COMMUNICATION_TEMPLATES",
    category: "沟通模板",
    language: "en",
    summary: "Complaint responses should acknowledge receipt, request evidence, avoid responsibility judgment, and route to human review.",
    source_type: "email_template",
    source_reference: "DEMO_TEMPLATE_COMPLAINT_HANDLING",
    confidence_level: "high",
    human_verified: true,
    verification_status: "verified",
    risk_level: "high",
    visibility_scope: "customer_safe_after_review",
    tags: ["DEMO", "complaint", "human_review"],
    updated_at: "",
  },
  {
    id: "DEMO_NO_AUTO_SEND",
    title: "No auto-send / no price commitment rule",
    category_slug: "DEMO_COMPLIANCE_SAFETY",
    category: "合规与安全",
    language: "en",
    summary: "AI may draft and summarize, but it must not send messages, confirm prices, confirm payment terms, or commit delivery without human approval.",
    source_type: "manual_sop",
    source_reference: "DEMO_COMPLIANCE_NO_AUTO_SEND_PRICE_COMMITMENT",
    confidence_level: "high",
    human_verified: true,
    verification_status: "verified",
    risk_level: "high",
    visibility_scope: "internal_only",
    tags: ["DEMO", "safety", "no_auto_send"],
    updated_at: "",
  },
]);

function knowledgeSafetyPayload() {
  return {
    mode: "read_only_preview",
    human_review_required: true,
    disabled_actions: [...KNOWLEDGE_DISABLED_ACTIONS],
  };
}

function knowledgeFallbackWarnings(warnings) {
  return warnings.length ? warnings : ["knowledge_source_unavailable"];
}

function knowledgeMeta(resource, warnings, source = "admin_read") {
  return {
    generated_at: new Date().toISOString(),
    source,
    resource,
    is_fallback: source === "fallback_demo",
    safety: source === "fallback_demo" ? "read_only_preview" : "auth_gated_read_only",
    warnings,
  };
}

function knowledgeCategoryRecord(row, itemCounts = new Map()) {
  const counts = itemCounts.get(row.id) || { item_count: 0, verified_count: 0, needs_review_count: 0 };
  return {
    id: row.id || "",
    slug: row.slug || "",
    name_zh: row.name_zh || "",
    name_en: row.name_en || "",
    description: row.description || "",
    sort_order: row.sort_order === null || row.sort_order === undefined ? 0 : row.sort_order,
    item_count: counts.item_count,
    verified_count: counts.verified_count,
    needs_review_count: counts.needs_review_count,
  };
}

function knowledgeItemRecord(row, categoryMap = new Map()) {
  const category = categoryMap.get(row.category_id);
  return {
    id: row.id || "",
    title: row.title || "",
    category_slug: category?.slug || "",
    category: category?.name_zh || category?.name_en || "",
    language: row.language || "",
    summary: row.summary || "",
    source_type: row.source_type || "",
    source_reference: row.source_reference || "",
    confidence_level: row.confidence_level || "",
    human_verified: row.human_verified === true,
    verification_status: row.verification_status || "",
    risk_level: row.risk_level || "",
    visibility_scope: row.visibility_scope || "",
    tags: Array.isArray(row.tags) ? row.tags : [],
    updated_at: row.updated_at || "",
  };
}

function knowledgeReviewQueueRecord(row) {
  return {
    id: row.id || "",
    title: row.title || "",
    reason: row.verification_status === "outdated" ? "知识可能过期，需要人工更新" : "知识尚未完成人工验证",
    verification_status: row.verification_status || "",
    risk_level: row.risk_level || "",
    source_type: row.source_type || "",
    source_reference: row.source_reference || "",
    updated_at: row.updated_at || "",
  };
}

function knowledgeLinkedContextRecord(row) {
  return {
    knowledge_item_id: row.knowledge_item_id || "",
    linked_entity_type: row.linked_entity_type || "",
    linked_entity_label: row.linked_entity_label || "",
    relationship_type: row.relationship_type || "",
  };
}

function knowledgeSummaryFromItems(items, categories) {
  return {
    total_items: items.length,
    verified_items: items.filter((item) => item.human_verified === true || item.verification_status === "verified").length,
    needs_review_items: items.filter((item) => item.human_verified !== true || item.verification_status === "needs_review" || item.verification_status === "draft").length,
    outdated_items: items.filter((item) => item.verification_status === "outdated").length,
    high_risk_items: items.filter((item) => item.risk_level === "high").length,
    categories_count: categories.length,
  };
}

function knowledgeCategoryCounts(items) {
  return items.reduce((map, item) => {
    const key = item.category_id;
    if (!key) return map;
    const counts = map.get(key) || { item_count: 0, verified_count: 0, needs_review_count: 0 };
    counts.item_count += 1;
    if (item.human_verified === true || item.verification_status === "verified") counts.verified_count += 1;
    if (item.human_verified !== true || item.verification_status === "needs_review" || item.verification_status === "draft") counts.needs_review_count += 1;
    map.set(key, counts);
    return map;
  }, new Map());
}

function fallbackKnowledgeCategories() {
  const categoryCounts = KNOWLEDGE_FALLBACK_ITEMS.reduce((map, item) => {
    const counts = map.get(item.category_slug) || { item_count: 0, verified_count: 0, needs_review_count: 0 };
    counts.item_count += 1;
    if (item.human_verified || item.verification_status === "verified") counts.verified_count += 1;
    if (!item.human_verified || item.verification_status === "needs_review" || item.verification_status === "draft") counts.needs_review_count += 1;
    map.set(item.category_slug, counts);
    return map;
  }, new Map());
  return KNOWLEDGE_FALLBACK_CATEGORIES.map((category) => ({
    ...category,
    ...(categoryCounts.get(category.slug) || { item_count: 0, verified_count: 0, needs_review_count: 0 }),
  }));
}

function fallbackKnowledgeReviewQueue() {
  return KNOWLEDGE_FALLBACK_ITEMS.filter(
    (item) => !item.human_verified || item.verification_status === "draft" || item.verification_status === "needs_review" || item.verification_status === "outdated"
  ).map(knowledgeReviewQueueRecord);
}

function fallbackKnowledgeLinkedContext() {
  return [
    {
      knowledge_item_id: "DEMO_WINDOW_CHECKLIST",
      linked_entity_type: "product",
      linked_entity_label: "Aluminum windows / doors",
      relationship_type: "quote_readiness_reference",
    },
    {
      knowledge_item_id: "DEMO_SUPPLIER_MATCHING",
      linked_entity_type: "capability",
      linked_entity_label: "Supplier capability review",
      relationship_type: "manual_confirmation_required",
    },
    {
      knowledge_item_id: "DEMO_NO_AUTO_SEND",
      linked_entity_type: "trade_term",
      linked_entity_label: "AI safety boundary",
      relationship_type: "global_safety_rule",
    },
  ];
}

const BUSINESS_CARD_FALLBACK_CAPTURE_SOURCES = Object.freeze([
  {
    id: "DEMO_CARD_SOURCE_PERU",
    source_type: "trade_show_card",
    source_label: "DEMO_TRADE_SHOW_CARD_PERU",
    captured_channel: "manual_upload",
    processing_status: "needs_review",
    captured_at: "2026-06-21T09:00:00+08:00",
    created_at: "2026-06-21T09:00:00+08:00",
  },
  {
    id: "DEMO_CARD_SOURCE_PANAMA",
    source_type: "trade_show_card",
    source_label: "DEMO_TRADE_SHOW_CARD_PANAMA",
    captured_channel: "manual_upload",
    processing_status: "needs_review",
    captured_at: "2026-06-21T09:10:00+08:00",
    created_at: "2026-06-21T09:10:00+08:00",
  },
  {
    id: "DEMO_CARD_SOURCE_INDONESIA",
    source_type: "whatsapp_contact_image",
    source_label: "DEMO_WHATSAPP_CONTACT_INDONESIA",
    captured_channel: "manual_upload",
    processing_status: "extracted",
    captured_at: "2026-06-21T09:20:00+08:00",
    created_at: "2026-06-21T09:20:00+08:00",
  },
]);

const BUSINESS_CARD_FALLBACK_EXTRACTIONS = Object.freeze([
  {
    id: "DEMO_CARD_EXTRACTION_PERU",
    capture_source_id: "DEMO_CARD_SOURCE_PERU",
    extracted_name: "Carlos Ramirez",
    extracted_company: "DEMO Facade Solutions",
    extracted_title: "Project Manager",
    extracted_email: "carlos.ramirez@example.com",
    extracted_phone: "+51 900 000 000",
    extracted_whatsapp: "+51 900 000 000",
    extracted_website: "www.demo-facade.example",
    extracted_country: "Peru",
    extracted_address: "Lima, Peru",
    extracted_business_type: "facade contractor",
    extracted_product_interest: "aluminum windows and facade systems",
    confidence_level: "medium",
    extraction_language: "en",
    extraction_notes: "DEMO extraction. Email, phone, company and product interest require human review.",
    created_at: "2026-06-21T09:00:00+08:00",
  },
  {
    id: "DEMO_CARD_EXTRACTION_PANAMA",
    capture_source_id: "DEMO_CARD_SOURCE_PANAMA",
    extracted_name: "Maria Gonzalez",
    extracted_company: "DEMO Construction Importers",
    extracted_title: "Purchasing Manager",
    extracted_email: "maria.gonzalez@example.com",
    extracted_phone: "+507 6000 0000",
    extracted_whatsapp: "+507 6000 0000",
    extracted_website: "www.demo-importers.example",
    extracted_country: "Panama",
    extracted_address: "Panama City, Panama",
    extracted_business_type: "construction material importer",
    extracted_product_interest: "glass and aluminum accessories",
    confidence_level: "medium",
    extraction_language: "es",
    extraction_notes: "DEMO extraction. Possible duplicate requires human review.",
    created_at: "2026-06-21T09:10:00+08:00",
  },
  {
    id: "DEMO_CARD_EXTRACTION_INDONESIA",
    capture_source_id: "DEMO_CARD_SOURCE_INDONESIA",
    extracted_name: "Daniel Wong",
    extracted_company: "DEMO Building Materials Asia",
    extracted_title: "Distributor",
    extracted_email: "",
    extracted_phone: "+62 800 0000 0000",
    extracted_whatsapp: "+62 800 0000 0000",
    extracted_website: "",
    extracted_country: "Indonesia",
    extracted_address: "Jakarta, Indonesia",
    extracted_business_type: "distributor",
    extracted_product_interest: "ceiling system and light steel keel",
    confidence_level: "low",
    extraction_language: "en",
    extraction_notes: "DEMO extraction. Website and email are missing.",
    created_at: "2026-06-21T09:20:00+08:00",
  },
]);

const BUSINESS_CARD_FALLBACK_PROFILE_DRAFTS = Object.freeze([
  {
    id: "DEMO_PROFILE_DRAFT_PERU",
    capture_source_id: "DEMO_CARD_SOURCE_PERU",
    extraction_result_id: "DEMO_CARD_EXTRACTION_PERU",
    proposed_customer_name: "Carlos Ramirez",
    proposed_company_name: "DEMO Facade Solutions",
    proposed_country: "Peru",
    proposed_email: "carlos.ramirez@example.com",
    proposed_phone: "+51 900 000 000",
    proposed_whatsapp: "+51 900 000 000",
    proposed_website: "www.demo-facade.example",
    proposed_customer_type: "facade contractor",
    proposed_product_interest: "aluminum windows and facade systems",
    source_channel: "trade_show_card",
    confidence_level: "medium",
    duplicate_status: "not_checked",
    risk_level: "medium",
    review_status: "needs_review",
    reviewer_notes: "DEMO draft only. Do not create customer until Paul reviews contact and project context.",
    created_at: "2026-06-21T09:00:00+08:00",
  },
  {
    id: "DEMO_PROFILE_DRAFT_PANAMA",
    capture_source_id: "DEMO_CARD_SOURCE_PANAMA",
    extraction_result_id: "DEMO_CARD_EXTRACTION_PANAMA",
    proposed_customer_name: "Maria Gonzalez",
    proposed_company_name: "DEMO Construction Importers",
    proposed_country: "Panama",
    proposed_email: "maria.gonzalez@example.com",
    proposed_phone: "+507 6000 0000",
    proposed_whatsapp: "+507 6000 0000",
    proposed_website: "www.demo-importers.example",
    proposed_customer_type: "construction material importer",
    proposed_product_interest: "glass and aluminum accessories",
    source_channel: "trade_show_card",
    confidence_level: "medium",
    duplicate_status: "possible_duplicate",
    risk_level: "medium",
    review_status: "needs_review",
    reviewer_notes: "DEMO draft only. Possible duplicate should be reviewed before any customer profile is created.",
    created_at: "2026-06-21T09:10:00+08:00",
  },
  {
    id: "DEMO_PROFILE_DRAFT_INDONESIA",
    capture_source_id: "DEMO_CARD_SOURCE_INDONESIA",
    extraction_result_id: "DEMO_CARD_EXTRACTION_INDONESIA",
    proposed_customer_name: "Daniel Wong",
    proposed_company_name: "DEMO Building Materials Asia",
    proposed_country: "Indonesia",
    proposed_email: "",
    proposed_phone: "+62 800 0000 0000",
    proposed_whatsapp: "+62 800 0000 0000",
    proposed_website: "",
    proposed_customer_type: "distributor",
    proposed_product_interest: "ceiling system and light steel keel",
    source_channel: "whatsapp_contact_image",
    confidence_level: "low",
    duplicate_status: "not_checked",
    risk_level: "medium",
    review_status: "draft",
    reviewer_notes: "DEMO draft only. Email and website are missing.",
    created_at: "2026-06-21T09:20:00+08:00",
  },
]);

const BUSINESS_CARD_FALLBACK_DUPLICATE_CHECKS = Object.freeze([
  {
    id: "DEMO_DUPLICATE_PERU",
    customer_profile_draft_id: "DEMO_PROFILE_DRAFT_PERU",
    match_type: "none_detected_demo",
    match_entity_type: "customer",
    match_label: "No DEMO duplicate detected",
    match_confidence: "low",
    match_reason: "DEMO record has not been checked against real customer data.",
    created_at: "2026-06-21T09:00:00+08:00",
  },
  {
    id: "DEMO_DUPLICATE_PANAMA",
    customer_profile_draft_id: "DEMO_PROFILE_DRAFT_PANAMA",
    match_type: "possible_company_match",
    match_entity_type: "customer",
    match_label: "Possible DEMO company-name similarity",
    match_confidence: "medium",
    match_reason: "Company name resembles an importer profile and requires human review.",
    created_at: "2026-06-21T09:10:00+08:00",
  },
  {
    id: "DEMO_DUPLICATE_INDONESIA",
    customer_profile_draft_id: "DEMO_PROFILE_DRAFT_INDONESIA",
    match_type: "insufficient_contact_data",
    match_entity_type: "customer",
    match_label: "Missing email and website",
    match_confidence: "low",
    match_reason: "Not enough contact fields to complete duplicate review.",
    created_at: "2026-06-21T09:20:00+08:00",
  },
]);

const BUSINESS_CARD_FALLBACK_FOLLOWUP_DRAFTS = Object.freeze([
  {
    id: "DEMO_FOLLOWUP_PERU",
    customer_profile_draft_id: "DEMO_PROFILE_DRAFT_PERU",
    language: "en",
    channel: "email",
    subject: "Nice to meet you at the exhibition",
    body: "Hi Carlos, nice to meet you at the exhibition. We mainly supply aluminum windows, facade systems, glass and related building materials. May I know what kind of project or product you are currently looking for?",
    tone: "polite_intro",
    review_status: "draft",
    risk_notes: "Draft only. Paul must review before sending.",
    created_at: "2026-06-21T09:00:00+08:00",
  },
  {
    id: "DEMO_FOLLOWUP_PANAMA",
    customer_profile_draft_id: "DEMO_PROFILE_DRAFT_PANAMA",
    language: "es",
    channel: "email",
    subject: "Seguimiento de productos de vidrio y aluminio",
    body: "Hola Maria, fue un gusto conocerle. Podemos revisar productos de vidrio, accesorios de aluminio y materiales para construcción. Antes de continuar, ¿podría confirmar qué tipo de proyecto está evaluando?",
    tone: "polite_intro",
    review_status: "needs_review",
    risk_notes: "Spanish draft only. Human review required before use.",
    created_at: "2026-06-21T09:10:00+08:00",
  },
  {
    id: "DEMO_FOLLOWUP_INDONESIA",
    customer_profile_draft_id: "DEMO_PROFILE_DRAFT_INDONESIA",
    language: "en",
    channel: "whatsapp",
    subject: "Ceiling system inquiry follow-up",
    body: "Hi Daniel, thanks for sharing your contact. We can review ceiling system and light steel keel requirements. Could you share your target specification, quantity and destination?",
    tone: "polite_intro",
    review_status: "draft",
    risk_notes: "Draft only. Email and website are missing.",
    created_at: "2026-06-21T09:20:00+08:00",
  },
]);

function businessCardSafetyPayload() {
  return {
    mode: "read_only_preview",
    human_review_required: true,
    disabled_actions: [...BUSINESS_CARD_DISABLED_ACTIONS],
  };
}

function businessCardFallbackWarnings(warnings) {
  return warnings.length ? warnings : ["business_card_source_unavailable"];
}

function businessCardMeta(resource, warnings, source = "admin_read") {
  return {
    generated_at: new Date().toISOString(),
    source,
    resource,
    is_fallback: source === "fallback_demo",
    safety: source === "fallback_demo" ? "read_only_preview" : "auth_gated_read_only",
    warnings,
  };
}

function businessCardCaptureSourceRecord(row) {
  return {
    id: row.id || "",
    source_type: row.source_type || "",
    source_label: row.source_label || "",
    captured_channel: row.captured_channel || "",
    processing_status: row.processing_status || "",
    captured_at: row.captured_at || "",
    created_at: row.created_at || "",
  };
}

function businessCardExtractionRecord(row) {
  return {
    id: row.id || "",
    capture_source_id: row.capture_source_id || "",
    extracted_name: row.extracted_name || "",
    extracted_company: row.extracted_company || "",
    extracted_title: row.extracted_title || "",
    extracted_email: row.extracted_email || "",
    extracted_phone: row.extracted_phone || "",
    extracted_whatsapp: row.extracted_whatsapp || "",
    extracted_website: row.extracted_website || "",
    extracted_country: row.extracted_country || "",
    extracted_address: row.extracted_address || "",
    extracted_business_type: row.extracted_business_type || "",
    extracted_product_interest: row.extracted_product_interest || "",
    confidence_level: row.confidence_level || "",
    extraction_language: row.extraction_language || "",
    extraction_notes: row.extraction_notes || "",
    created_at: row.created_at || "",
  };
}

function customerProfileDraftRecord(row) {
  return {
    id: row.id || "",
    capture_source_id: row.capture_source_id || "",
    extraction_result_id: row.extraction_result_id || "",
    proposed_customer_name: row.proposed_customer_name || "",
    proposed_company_name: row.proposed_company_name || "",
    proposed_country: row.proposed_country || "",
    proposed_email: row.proposed_email || "",
    proposed_phone: row.proposed_phone || "",
    proposed_whatsapp: row.proposed_whatsapp || "",
    proposed_website: row.proposed_website || "",
    proposed_customer_type: row.proposed_customer_type || "",
    proposed_product_interest: row.proposed_product_interest || "",
    source_channel: row.source_channel || "",
    confidence_level: row.confidence_level || "",
    duplicate_status: row.duplicate_status || "",
    risk_level: row.risk_level || "",
    review_status: row.review_status || "",
    reviewer_notes: row.reviewer_notes || "",
    created_at: row.created_at || "",
    updated_at: row.updated_at || "",
  };
}

function businessCardDuplicateCheckRecord(row) {
  return {
    id: row.id || "",
    customer_profile_draft_id: row.customer_profile_draft_id || "",
    match_type: row.match_type || "",
    match_entity_type: row.match_entity_type || "",
    match_entity_id: row.match_entity_id || "",
    match_label: row.match_label || "",
    match_confidence: row.match_confidence || "",
    match_reason: row.match_reason || "",
    created_at: row.created_at || "",
  };
}

function businessCardFollowupDraftRecord(row) {
  return {
    id: row.id || "",
    customer_profile_draft_id: row.customer_profile_draft_id || "",
    language: row.language || "",
    channel: row.channel || "",
    subject: row.subject || "",
    body: row.body || "",
    tone: row.tone || "",
    review_status: row.review_status || "",
    risk_notes: row.risk_notes || "",
    created_at: row.created_at || "",
    updated_at: row.updated_at || "",
  };
}

function businessCardReviewQueueRecord(row) {
  return {
    id: row.id || "",
    proposed_customer_name: row.proposed_customer_name || "",
    proposed_company_name: row.proposed_company_name || "",
    review_status: row.review_status || "",
    duplicate_status: row.duplicate_status || "",
    risk_level: row.risk_level || "",
    confidence_level: row.confidence_level || "",
    reason: row.reviewer_notes || "Customer profile draft requires human review.",
    created_at: row.created_at || "",
  };
}

function businessCardSummary({ captureSources, profileDrafts, duplicateChecks, followupDrafts }) {
  return {
    total_captures: captureSources.length,
    needs_review_drafts: profileDrafts.filter((record) => ["draft", "needs_review"].includes(record.review_status)).length,
    possible_duplicates:
      profileDrafts.filter((record) => record.duplicate_status === "possible_duplicate").length +
      duplicateChecks.filter((record) => record.match_confidence === "medium" || record.match_confidence === "high").length,
    approved_drafts: profileDrafts.filter((record) => record.review_status === "approved").length,
    followup_drafts: followupDrafts.filter((record) => ["draft", "needs_review"].includes(record.review_status)).length,
    high_risk_drafts: profileDrafts.filter((record) => record.risk_level === "high").length,
  };
}

function fallbackBusinessCardData() {
  return {
    captureSources: BUSINESS_CARD_FALLBACK_CAPTURE_SOURCES.map(businessCardCaptureSourceRecord),
    extractionResults: BUSINESS_CARD_FALLBACK_EXTRACTIONS.map(businessCardExtractionRecord),
    profileDrafts: BUSINESS_CARD_FALLBACK_PROFILE_DRAFTS.map(customerProfileDraftRecord),
    duplicateChecks: BUSINESS_CARD_FALLBACK_DUPLICATE_CHECKS.map(businessCardDuplicateCheckRecord),
    followupDrafts: BUSINESS_CARD_FALLBACK_FOLLOWUP_DRAFTS.map(businessCardFollowupDraftRecord),
  };
}

function businessCardReviewQueueFromDrafts(profileDrafts) {
  return profileDrafts
    .filter(
      (record) =>
        ["draft", "needs_review"].includes(record.review_status) ||
        record.duplicate_status === "possible_duplicate" ||
        record.risk_level === "high"
    )
    .slice(0, 50)
    .map(businessCardReviewQueueRecord);
}

async function readBusinessCardSources(supabase, warnings) {
  const [captureSources, extractionResults, profileDrafts, duplicateChecks, followupDrafts] = await Promise.all([
    readSource({
      supabase,
      table: "card_capture_sources",
      select: "id,source_type,source_label,captured_channel,processing_status,captured_at,created_at",
      warning: "card_capture_sources_unavailable",
      warnings,
    }),
    readSource({
      supabase,
      table: "card_extraction_results",
      select:
        "id,capture_source_id,extracted_name,extracted_company,extracted_title,extracted_email,extracted_phone,extracted_whatsapp,extracted_website,extracted_country,extracted_address,extracted_business_type,extracted_product_interest,confidence_level,extraction_language,extraction_notes,created_at",
      warning: "card_extraction_results_unavailable",
      warnings,
    }),
    readSource({
      supabase,
      table: "customer_profile_drafts",
      select:
        "id,capture_source_id,extraction_result_id,proposed_customer_name,proposed_company_name,proposed_country,proposed_email,proposed_phone,proposed_whatsapp,proposed_website,proposed_customer_type,proposed_product_interest,source_channel,confidence_level,duplicate_status,risk_level,review_status,reviewer_notes,created_at,updated_at",
      warning: "customer_profile_drafts_unavailable",
      warnings,
    }),
    readSource({
      supabase,
      table: "card_duplicate_checks",
      select: "id,customer_profile_draft_id,match_type,match_entity_type,match_entity_id,match_label,match_confidence,match_reason,created_at",
      warning: "card_duplicate_checks_unavailable",
      warnings,
    }),
    readSource({
      supabase,
      table: "card_followup_drafts",
      select: "id,customer_profile_draft_id,language,channel,subject,body,tone,review_status,risk_notes,created_at,updated_at",
      warning: "card_followup_drafts_unavailable",
      warnings,
    }),
  ]);

  return {
    captureSources: captureSources.map(businessCardCaptureSourceRecord),
    extractionResults: extractionResults.map(businessCardExtractionRecord),
    profileDrafts: profileDrafts.map(customerProfileDraftRecord),
    duplicateChecks: duplicateChecks.map(businessCardDuplicateCheckRecord),
    followupDrafts: followupDrafts.map(businessCardFollowupDraftRecord),
  };
}

const CUSTOMER_VERIFICATION_FALLBACK_REQUESTS = Object.freeze([
  {
    id: "DEMO_CUSTOMER_VERIFY_PERU",
    source_type: "inquiry",
    customer_name: "Carlos Ramirez",
    company_name: "DEMO Facade Solutions",
    contact_name: "Carlos Ramirez",
    email: "carlos.ramirez@example.com",
    phone: "+51 000 000 001",
    whatsapp: "+51 000 000 001",
    website: "https://example.com/demo-facade",
    country: "Peru",
    requested_by: "demo_operator",
    requested_at: "2026-06-21T09:00:00+08:00",
    verification_status: "needs_more_info",
    created_at: "2026-06-21T09:00:00+08:00",
    updated_at: "2026-06-21T09:00:00+08:00",
  },
  {
    id: "DEMO_CUSTOMER_VERIFY_PANAMA",
    source_type: "whatsapp_contact",
    customer_name: "Maria Gonzalez",
    company_name: "DEMO Construction Importers",
    contact_name: "Maria Gonzalez",
    email: "maria.gonzalez@example.com",
    phone: "+507 000 000 002",
    whatsapp: "+507 000 000 002",
    website: "https://example.com/demo-construction",
    country: "Panama",
    requested_by: "demo_operator",
    requested_at: "2026-06-21T09:15:00+08:00",
    verification_status: "possible_duplicate",
    created_at: "2026-06-21T09:15:00+08:00",
    updated_at: "2026-06-21T09:15:00+08:00",
  },
  {
    id: "DEMO_CUSTOMER_VERIFY_INDONESIA",
    source_type: "prospecting_lead",
    customer_name: "Daniel Wong",
    company_name: "DEMO Building Materials Asia",
    contact_name: "Daniel Wong",
    email: "daniel.wong@example.com",
    phone: "+62 000 000 003",
    whatsapp: "+62 000 000 003",
    website: "https://example.com/demo-building-materials",
    country: "Indonesia",
    requested_by: "demo_operator",
    requested_at: "2026-06-21T09:30:00+08:00",
    verification_status: "pending",
    created_at: "2026-06-21T09:30:00+08:00",
    updated_at: "2026-06-21T09:30:00+08:00",
  },
]);

const CUSTOMER_VERIFICATION_FALLBACK_EVIDENCE = Object.freeze([
  {
    id: "DEMO_CUSTOMER_VERIFY_EVIDENCE_PERU_PRODUCT",
    verification_request_id: "DEMO_CUSTOMER_VERIFY_PERU",
    evidence_type: "inquiry_content",
    evidence_label: "Product interest",
    evidence_value: "Aluminum windows / facade systems",
    evidence_source: "demo_seed",
    evidence_status: "needs_review",
    confidence_level: "medium",
    risk_level: "medium",
    notes: "Needs drawings, specifications, and target quantity before commercial judgment.",
    created_at: "2026-06-21T09:00:00+08:00",
  },
  {
    id: "DEMO_CUSTOMER_VERIFY_EVIDENCE_PERU_WEBSITE",
    verification_request_id: "DEMO_CUSTOMER_VERIFY_PERU",
    evidence_type: "company_website",
    evidence_label: "Website",
    evidence_value: "example.com/demo-facade",
    evidence_source: "demo_seed",
    evidence_status: "likely",
    confidence_level: "medium",
    risk_level: "medium",
    notes: "Website looks plausible but is demo-only and must be checked manually.",
    created_at: "2026-06-21T09:01:00+08:00",
  },
  {
    id: "DEMO_CUSTOMER_VERIFY_EVIDENCE_PANAMA_DUPLICATE",
    verification_request_id: "DEMO_CUSTOMER_VERIFY_PANAMA",
    evidence_type: "duplicate_match",
    evidence_label: "Similar company name",
    evidence_value: "DEMO Construction Importer",
    evidence_source: "demo_seed",
    evidence_status: "needs_review",
    confidence_level: "medium",
    risk_level: "medium",
    notes: "Possible duplicate should be reviewed before creating or merging customer records.",
    created_at: "2026-06-21T09:15:00+08:00",
  },
  {
    id: "DEMO_CUSTOMER_VERIFY_EVIDENCE_PANAMA_PRODUCT",
    verification_request_id: "DEMO_CUSTOMER_VERIFY_PANAMA",
    evidence_type: "product_interest",
    evidence_label: "Product interest",
    evidence_value: "Glass / aluminum accessories",
    evidence_source: "demo_seed",
    evidence_status: "likely",
    confidence_level: "medium",
    risk_level: "medium",
    notes: "Interest is useful for follow-up but not enough for customer identity confirmation.",
    created_at: "2026-06-21T09:16:00+08:00",
  },
  {
    id: "DEMO_CUSTOMER_VERIFY_EVIDENCE_INDONESIA_PRODUCT",
    verification_request_id: "DEMO_CUSTOMER_VERIFY_INDONESIA",
    evidence_type: "product_interest",
    evidence_label: "Product interest",
    evidence_value: "Ceiling system / light steel keel",
    evidence_source: "demo_seed",
    evidence_status: "likely",
    confidence_level: "medium",
    risk_level: "low",
    notes: "Prospecting lead needs more source evidence before commercial follow-up.",
    created_at: "2026-06-21T09:30:00+08:00",
  },
  {
    id: "DEMO_CUSTOMER_VERIFY_EVIDENCE_INDONESIA_EMAIL",
    verification_request_id: "DEMO_CUSTOMER_VERIFY_INDONESIA",
    evidence_type: "email_domain",
    evidence_label: "Email domain",
    evidence_value: "example.com",
    evidence_source: "demo_seed",
    evidence_status: "not_checked",
    confidence_level: "low",
    risk_level: "medium",
    notes: "Demo domain is not a real verification signal.",
    created_at: "2026-06-21T09:31:00+08:00",
  },
]);

const CUSTOMER_VERIFICATION_FALLBACK_SCORES = Object.freeze([
  {
    id: "DEMO_CUSTOMER_VERIFY_SCORE_PERU",
    verification_request_id: "DEMO_CUSTOMER_VERIFY_PERU",
    credibility_score: 65,
    relevance_score: 80,
    risk_score: 45,
    duplicate_score: 20,
    followup_priority_score: 75,
    confidence_level: "medium",
    risk_level: "medium",
    score_explanation: "Inquiry is relevant but missing drawings, specifications, and target quantity.",
    created_at: "2026-06-21T09:02:00+08:00",
  },
  {
    id: "DEMO_CUSTOMER_VERIFY_SCORE_PANAMA",
    verification_request_id: "DEMO_CUSTOMER_VERIFY_PANAMA",
    credibility_score: 55,
    relevance_score: 70,
    risk_score: 55,
    duplicate_score: 72,
    followup_priority_score: 50,
    confidence_level: "medium",
    risk_level: "medium",
    score_explanation: "Possible duplicate risk should be reviewed before follow-up.",
    created_at: "2026-06-21T09:17:00+08:00",
  },
  {
    id: "DEMO_CUSTOMER_VERIFY_SCORE_INDONESIA",
    verification_request_id: "DEMO_CUSTOMER_VERIFY_INDONESIA",
    credibility_score: 45,
    relevance_score: 68,
    risk_score: 60,
    duplicate_score: 30,
    followup_priority_score: 55,
    confidence_level: "low",
    risk_level: "medium",
    score_explanation: "Lead is early-stage and should remain read-only until identity evidence improves.",
    created_at: "2026-06-21T09:32:00+08:00",
  },
]);

const CUSTOMER_VERIFICATION_FALLBACK_DUPLICATES = Object.freeze([
  {
    id: "DEMO_CUSTOMER_VERIFY_DUPLICATE_PANAMA",
    verification_request_id: "DEMO_CUSTOMER_VERIFY_PANAMA",
    matched_entity_type: "customer",
    matched_entity_id: "",
    match_type: "similar_company_name",
    matched_label: "DEMO Construction Importer",
    match_confidence: "medium",
    match_reason: "Similar company name and Panama country signal.",
    created_at: "2026-06-21T09:18:00+08:00",
  },
]);

const CUSTOMER_VERIFICATION_FALLBACK_REVIEWS = Object.freeze([
  {
    id: "DEMO_CUSTOMER_VERIFY_REVIEW_PERU",
    verification_request_id: "DEMO_CUSTOMER_VERIFY_PERU",
    review_status: "pending",
    reviewer: "",
    reviewer_notes: "",
    decision: "request_more_info",
    decision_reason: "Drawings, specifications, and target quantity are still missing.",
    next_action: "Ask for drawings, product specifications, and target quantity before quotation review.",
    reviewed_at: "",
    created_at: "2026-06-21T09:03:00+08:00",
  },
  {
    id: "DEMO_CUSTOMER_VERIFY_REVIEW_PANAMA",
    verification_request_id: "DEMO_CUSTOMER_VERIFY_PANAMA",
    review_status: "pending",
    reviewer: "",
    reviewer_notes: "",
    decision: "hold",
    decision_reason: "Possible duplicate needs manual review.",
    next_action: "Compare existing customer records before creating or merging any customer profile.",
    reviewed_at: "",
    created_at: "2026-06-21T09:19:00+08:00",
  },
  {
    id: "DEMO_CUSTOMER_VERIFY_REVIEW_INDONESIA",
    verification_request_id: "DEMO_CUSTOMER_VERIFY_INDONESIA",
    review_status: "pending",
    reviewer: "",
    reviewer_notes: "",
    decision: "request_more_info",
    decision_reason: "Prospecting lead has limited identity evidence.",
    next_action: "Collect more source evidence before sales follow-up.",
    reviewed_at: "",
    created_at: "2026-06-21T09:33:00+08:00",
  },
]);

function customerVerificationSafetyPayload() {
  return {
    mode: "read_only_preview",
    human_review_required: true,
    disabled_actions: [...CUSTOMER_VERIFICATION_DISABLED_ACTIONS],
  };
}

function customerVerificationFallbackWarnings(warnings) {
  return warnings.length ? warnings : ["customer_verification_source_unavailable"];
}

function customerVerificationMeta(resource, warnings, source = "admin_read") {
  return {
    generated_at: new Date().toISOString(),
    source,
    resource,
    is_fallback: source === "fallback_demo",
    safety: source === "fallback_demo" ? "read_only_preview" : "auth_gated_read_only",
    warnings,
  };
}

function customerVerificationRequestRecord(row) {
  return {
    id: row.id || "",
    source_type: row.source_type || "",
    source_entity_id: row.source_entity_id || "",
    customer_name: row.customer_name || "",
    company_name: row.company_name || "",
    contact_name: row.contact_name || "",
    email: row.email || "",
    phone: row.phone || "",
    whatsapp: row.whatsapp || "",
    website: row.website || "",
    country: row.country || "",
    inquiry_id: row.inquiry_id || "",
    requested_by: row.requested_by || "",
    requested_at: row.requested_at || "",
    verification_status: row.verification_status || "",
    created_at: row.created_at || "",
    updated_at: row.updated_at || "",
  };
}

function customerVerificationEvidenceRecord(row) {
  return {
    id: row.id || "",
    verification_request_id: row.verification_request_id || "",
    evidence_type: row.evidence_type || "",
    evidence_label: row.evidence_label || "",
    evidence_value: row.evidence_value || "",
    evidence_source: row.evidence_source || "",
    evidence_status: row.evidence_status || "",
    confidence_level: row.confidence_level || "",
    risk_level: row.risk_level || "",
    notes: row.notes || "",
    created_at: row.created_at || "",
  };
}

function customerVerificationScoreRecord(row) {
  return {
    id: row.id || "",
    verification_request_id: row.verification_request_id || "",
    credibility_score: row.credibility_score ?? 50,
    relevance_score: row.relevance_score ?? 50,
    risk_score: row.risk_score ?? 50,
    duplicate_score: row.duplicate_score ?? 50,
    followup_priority_score: row.followup_priority_score ?? 50,
    confidence_level: row.confidence_level || "",
    risk_level: row.risk_level || "",
    score_explanation: row.score_explanation || "",
    created_at: row.created_at || "",
  };
}

function customerVerificationDuplicateRecord(row) {
  return {
    id: row.id || "",
    verification_request_id: row.verification_request_id || "",
    matched_entity_type: row.matched_entity_type || "",
    matched_entity_id: row.matched_entity_id || "",
    match_type: row.match_type || "",
    matched_label: row.matched_label || "",
    match_confidence: row.match_confidence || "",
    match_reason: row.match_reason || "",
    created_at: row.created_at || "",
  };
}

function customerVerificationReviewRecord(row) {
  return {
    id: row.id || "",
    verification_request_id: row.verification_request_id || "",
    review_status: row.review_status || "",
    reviewer: row.reviewer || "",
    reviewer_notes: row.reviewer_notes || "",
    decision: row.decision || "",
    decision_reason: row.decision_reason || "",
    next_action: row.next_action || "",
    reviewed_at: row.reviewed_at || "",
    created_at: row.created_at || "",
  };
}

function fallbackCustomerVerificationData() {
  return {
    requests: CUSTOMER_VERIFICATION_FALLBACK_REQUESTS.map(customerVerificationRequestRecord),
    evidence: CUSTOMER_VERIFICATION_FALLBACK_EVIDENCE.map(customerVerificationEvidenceRecord),
    scores: CUSTOMER_VERIFICATION_FALLBACK_SCORES.map(customerVerificationScoreRecord),
    duplicateMatches: CUSTOMER_VERIFICATION_FALLBACK_DUPLICATES.map(customerVerificationDuplicateRecord),
    reviews: CUSTOMER_VERIFICATION_FALLBACK_REVIEWS.map(customerVerificationReviewRecord),
  };
}

function customerVerificationSummary(data) {
  const requests = data.requests || [];
  const scores = data.scores || [];
  const duplicates = data.duplicateMatches || [];
  return {
    total_requests: requests.length,
    pending_requests: requests.filter((record) => ["draft", "pending", "in_review", "needs_more_info"].includes(record.verification_status)).length,
    verified_requests: requests.filter((record) => record.verification_status === "verified").length,
    needs_more_info: requests.filter((record) => record.verification_status === "needs_more_info").length,
    possible_duplicates:
      requests.filter((record) => record.verification_status === "possible_duplicate").length +
      duplicates.filter((record) => ["medium", "high"].includes(record.match_confidence)).length,
    risky_requests:
      requests.filter((record) => record.verification_status === "risky").length +
      scores.filter((record) => record.risk_level === "high" || Number(record.risk_score) >= 70).length,
    high_priority_followups: scores.filter((record) => Number(record.followup_priority_score) >= 70).length,
  };
}

function customerVerificationReviewQueueFromRequests({ requests, scores, reviews }) {
  const scoreMap = new Map((scores || []).map((record) => [record.verification_request_id, record]));
  const reviewMap = new Map((reviews || []).map((record) => [record.verification_request_id, record]));
  return (requests || [])
    .filter((record) => record.verification_status !== "verified" && record.verification_status !== "archived")
    .map((record) => {
      const score = scoreMap.get(record.id) || {};
      const review = reviewMap.get(record.id) || {};
      return {
        id: record.id,
        customer_name: record.customer_name,
        company_name: record.company_name,
        country: record.country,
        verification_status: record.verification_status,
        confidence_level: score.confidence_level || "medium",
        risk_level: score.risk_level || "medium",
        followup_priority_score: score.followup_priority_score ?? 50,
        reason: review.decision_reason || score.score_explanation || "Customer verification requires human review.",
        next_action: review.next_action || "Review customer identity evidence before any commercial action.",
        created_at: record.created_at,
      };
    })
    .slice(0, 50);
}

async function readCustomerVerificationSources(supabase, warnings) {
  const [requests, evidence, scores, duplicateMatches, reviews] = await Promise.all([
    readSource({
      supabase,
      table: "customer_verification_requests",
      select:
        "id,source_type,source_entity_id,customer_name,company_name,contact_name,email,phone,whatsapp,website,country,inquiry_id,requested_by,requested_at,verification_status,created_at,updated_at",
      warning: "customer_verification_requests_unavailable",
      warnings,
      order: "requested_at",
    }),
    readSource({
      supabase,
      table: "customer_verification_evidence",
      select:
        "id,verification_request_id,evidence_type,evidence_label,evidence_value,evidence_source,evidence_status,confidence_level,risk_level,notes,created_at",
      warning: "customer_verification_evidence_unavailable",
      warnings,
    }),
    readSource({
      supabase,
      table: "customer_verification_scores",
      select:
        "id,verification_request_id,credibility_score,relevance_score,risk_score,duplicate_score,followup_priority_score,confidence_level,risk_level,score_explanation,created_at",
      warning: "customer_verification_scores_unavailable",
      warnings,
    }),
    readSource({
      supabase,
      table: "customer_verification_duplicate_matches",
      select: "id,verification_request_id,matched_entity_type,matched_entity_id,match_type,matched_label,match_confidence,match_reason,created_at",
      warning: "customer_verification_duplicate_matches_unavailable",
      warnings,
    }),
    readSource({
      supabase,
      table: "customer_verification_reviews",
      select:
        "id,verification_request_id,review_status,reviewer,reviewer_notes,decision,decision_reason,next_action,reviewed_at,created_at",
      warning: "customer_verification_reviews_unavailable",
      warnings,
    }),
  ]);

  return {
    requests: requests.map(customerVerificationRequestRecord),
    evidence: evidence.map(customerVerificationEvidenceRecord),
    scores: scores.map(customerVerificationScoreRecord),
    duplicateMatches: duplicateMatches.map(customerVerificationDuplicateRecord),
    reviews: reviews.map(customerVerificationReviewRecord),
  };
}

function sendCustomerVerificationPayload(response, resource, records, summary, warnings, source = "admin_read") {
  sendJson(response, 200, {
    meta: customerVerificationMeta(resource, warnings, source),
    records,
    summary,
    safety: customerVerificationSafetyPayload(),
    warnings,
  });
}

function sendCustomerVerificationFallback(response, resource, records, summary, warnings) {
  const fallbackWarnings = customerVerificationFallbackWarnings(warnings);
  sendCustomerVerificationPayload(response, resource, records, summary, fallbackWarnings, "fallback_demo");
}

async function readCustomerVerificationSummary(response, supabase) {
  const warnings = [];
  const data = await readCustomerVerificationSources(supabase, warnings);
  if (warnings.length > 0) {
    const fallback = fallbackCustomerVerificationData();
    sendCustomerVerificationFallback(response, "customer-verification-summary", [], customerVerificationSummary(fallback), warnings);
    return;
  }

  sendCustomerVerificationPayload(response, "customer-verification-summary", [], customerVerificationSummary(data), warnings);
}

async function readCustomerVerificationRequests(response, supabase) {
  const warnings = [];
  const data = await readCustomerVerificationSources(supabase, warnings);
  if (warnings.length > 0) {
    const fallback = fallbackCustomerVerificationData();
    sendCustomerVerificationFallback(
      response,
      "customer-verification-requests",
      fallback.requests,
      customerVerificationSummary(fallback),
      warnings
    );
    return;
  }

  sendCustomerVerificationPayload(response, "customer-verification-requests", data.requests, customerVerificationSummary(data), warnings);
}

async function readCustomerVerificationEvidence(response, supabase) {
  const warnings = [];
  const data = await readCustomerVerificationSources(supabase, warnings);
  if (warnings.length > 0) {
    const fallback = fallbackCustomerVerificationData();
    sendCustomerVerificationFallback(
      response,
      "customer-verification-evidence",
      fallback.evidence,
      { total_records: fallback.evidence.length },
      warnings
    );
    return;
  }

  sendCustomerVerificationPayload(response, "customer-verification-evidence", data.evidence, { total_records: data.evidence.length }, warnings);
}

async function readCustomerVerificationScores(response, supabase) {
  const warnings = [];
  const data = await readCustomerVerificationSources(supabase, warnings);
  if (warnings.length > 0) {
    const fallback = fallbackCustomerVerificationData();
    sendCustomerVerificationFallback(
      response,
      "customer-verification-scores",
      fallback.scores,
      { total_records: fallback.scores.length },
      warnings
    );
    return;
  }

  sendCustomerVerificationPayload(response, "customer-verification-scores", data.scores, { total_records: data.scores.length }, warnings);
}

async function readCustomerVerificationDuplicateMatches(response, supabase) {
  const warnings = [];
  const data = await readCustomerVerificationSources(supabase, warnings);
  if (warnings.length > 0) {
    const fallback = fallbackCustomerVerificationData();
    sendCustomerVerificationFallback(
      response,
      "customer-verification-duplicate-matches",
      fallback.duplicateMatches,
      { total_records: fallback.duplicateMatches.length },
      warnings
    );
    return;
  }

  sendCustomerVerificationPayload(
    response,
    "customer-verification-duplicate-matches",
    data.duplicateMatches,
    { total_records: data.duplicateMatches.length },
    warnings
  );
}

async function readCustomerVerificationReviewQueue(response, supabase) {
  const warnings = [];
  const data = await readCustomerVerificationSources(supabase, warnings);
  if (warnings.length > 0) {
    const fallback = fallbackCustomerVerificationData();
    const records = customerVerificationReviewQueueFromRequests(fallback);
    sendCustomerVerificationFallback(response, "customer-verification-review-queue", records, { total_records: records.length }, warnings);
    return;
  }

  const records = customerVerificationReviewQueueFromRequests(data);
  sendCustomerVerificationPayload(response, "customer-verification-review-queue", records, { total_records: records.length }, warnings);
}

async function readCustomerVerificationReviews(response, supabase) {
  const warnings = [];
  const data = await readCustomerVerificationSources(supabase, warnings);
  if (warnings.length > 0) {
    const fallback = fallbackCustomerVerificationData();
    sendCustomerVerificationFallback(
      response,
      "customer-verification-reviews",
      fallback.reviews,
      { total_records: fallback.reviews.length },
      warnings
    );
    return;
  }

  sendCustomerVerificationPayload(response, "customer-verification-reviews", data.reviews, { total_records: data.reviews.length }, warnings);
}

const FOLLOWUP_FALLBACK_CANDIDATES = Object.freeze([
  {
    id: "DEMO_FOLLOWUP_CARLOS",
    source_type: "inquiry",
    source_entity_id: "",
    customer_id: "",
    inquiry_id: "",
    verification_request_id: "",
    customer_name: "Carlos Ramirez",
    company_name: "DEMO Facade Solutions",
    contact_name: "Carlos Ramirez",
    country: "Peru",
    language: "en",
    followup_reason: "Missing project location and product specifications before quotation judgment.",
    current_stage: "information_request",
    priority_level: "high",
    risk_level: "medium",
    confidence_level: "medium",
    status: "needs_review",
    created_at: "2026-06-22T00:00:00.000Z",
    updated_at: "2026-06-22T00:00:00.000Z",
  },
  {
    id: "DEMO_FOLLOWUP_MARIA",
    source_type: "customer_verification",
    source_entity_id: "",
    customer_id: "",
    inquiry_id: "",
    verification_request_id: "",
    customer_name: "Maria Gonzalez",
    company_name: "DEMO Construction Importers",
    contact_name: "Maria Gonzalez",
    country: "Panama",
    language: "es",
    followup_reason: "Possible duplicate customer; review before using prior context.",
    current_stage: "risk_hold",
    priority_level: "medium",
    risk_level: "medium",
    confidence_level: "medium",
    status: "needs_review",
    created_at: "2026-06-22T00:00:00.000Z",
    updated_at: "2026-06-22T00:00:00.000Z",
  },
  {
    id: "DEMO_FOLLOWUP_DANIEL",
    source_type: "business_card",
    source_entity_id: "",
    customer_id: "",
    inquiry_id: "",
    verification_request_id: "",
    customer_name: "Daniel Wong",
    company_name: "DEMO Building Materials Asia",
    contact_name: "Daniel Wong",
    country: "Indonesia",
    language: "en",
    followup_reason: "Need company website and buyer role before deeper follow-up.",
    current_stage: "dormant",
    priority_level: "low",
    risk_level: "medium",
    confidence_level: "low",
    status: "draft",
    created_at: "2026-06-22T00:00:00.000Z",
    updated_at: "2026-06-22T00:00:00.000Z",
  },
]);

const FOLLOWUP_FALLBACK_MISSING_INFORMATION = Object.freeze([
  {
    id: "DEMO_FOLLOWUP_INFO_1",
    followup_candidate_id: "DEMO_FOLLOWUP_CARLOS",
    info_type: "project_location",
    info_label: "Project location",
    required_level: "required",
    status: "missing",
    notes: "Ask before quotation judgment.",
    created_at: "2026-06-22T00:00:00.000Z",
  },
  {
    id: "DEMO_FOLLOWUP_INFO_2",
    followup_candidate_id: "DEMO_FOLLOWUP_CARLOS",
    info_type: "product_specification",
    info_label: "Product specification",
    required_level: "required",
    status: "missing",
    notes: "Profile/window system details are not confirmed.",
    created_at: "2026-06-22T00:00:00.000Z",
  },
  {
    id: "DEMO_FOLLOWUP_INFO_3",
    followup_candidate_id: "DEMO_FOLLOWUP_CARLOS",
    info_type: "quantity",
    info_label: "Target quantity",
    required_level: "recommended",
    status: "missing",
    notes: "Quantity affects quotation preparation.",
    created_at: "2026-06-22T00:00:00.000Z",
  },
  {
    id: "DEMO_FOLLOWUP_INFO_4",
    followup_candidate_id: "DEMO_FOLLOWUP_CARLOS",
    info_type: "buyer_role",
    info_label: "Buyer role",
    required_level: "recommended",
    status: "needs_review",
    notes: "Confirm whether contact is buyer, contractor, or consultant.",
    created_at: "2026-06-22T00:00:00.000Z",
  },
  {
    id: "DEMO_FOLLOWUP_INFO_5",
    followup_candidate_id: "DEMO_FOLLOWUP_MARIA",
    info_type: "company_website",
    info_label: "Company website",
    required_level: "recommended",
    status: "missing",
    notes: "Useful for duplicate and credibility review.",
    created_at: "2026-06-22T00:00:00.000Z",
  },
  {
    id: "DEMO_FOLLOWUP_INFO_6",
    followup_candidate_id: "DEMO_FOLLOWUP_MARIA",
    info_type: "buyer_role",
    info_label: "Buyer role",
    required_level: "recommended",
    status: "needs_review",
    notes: "Clarify role before commercial follow-up.",
    created_at: "2026-06-22T00:00:00.000Z",
  },
  {
    id: "DEMO_FOLLOWUP_INFO_7",
    followup_candidate_id: "DEMO_FOLLOWUP_DANIEL",
    info_type: "company_website",
    info_label: "Company website",
    required_level: "required",
    status: "missing",
    notes: "Needed before deeper lead qualification.",
    created_at: "2026-06-22T00:00:00.000Z",
  },
  {
    id: "DEMO_FOLLOWUP_INFO_8",
    followup_candidate_id: "DEMO_FOLLOWUP_DANIEL",
    info_type: "buyer_role",
    info_label: "Buyer role",
    required_level: "required",
    status: "missing",
    notes: "Needed before adding to active follow-up queue.",
    created_at: "2026-06-22T00:00:00.000Z",
  },
  {
    id: "DEMO_FOLLOWUP_INFO_9",
    followup_candidate_id: "DEMO_FOLLOWUP_DANIEL",
    info_type: "project_location",
    info_label: "Project location",
    required_level: "optional",
    status: "not_required",
    notes: "Optional at this early prospecting stage.",
    created_at: "2026-06-22T00:00:00.000Z",
  },
]);

const FOLLOWUP_FALLBACK_RECOMMENDATIONS = Object.freeze([
  {
    id: "DEMO_FOLLOWUP_REC_1",
    followup_candidate_id: "DEMO_FOLLOWUP_CARLOS",
    recommended_action: "request_more_information",
    recommendation_reason: "Project details are not complete enough for quotation judgment.",
    suggested_timing: "within 24 hours",
    priority_level: "high",
    risk_level: "medium",
    confidence_level: "medium",
    created_at: "2026-06-22T00:00:00.000Z",
  },
  {
    id: "DEMO_FOLLOWUP_REC_2",
    followup_candidate_id: "DEMO_FOLLOWUP_MARIA",
    recommended_action: "hold_due_to_risk",
    recommendation_reason: "Possible duplicate customer should be reviewed before follow-up.",
    suggested_timing: "after duplicate review",
    priority_level: "medium",
    risk_level: "medium",
    confidence_level: "medium",
    created_at: "2026-06-22T00:00:00.000Z",
  },
  {
    id: "DEMO_FOLLOWUP_REC_3",
    followup_candidate_id: "DEMO_FOLLOWUP_DANIEL",
    recommended_action: "mark_low_priority",
    recommendation_reason: "Lead needs more source evidence before active sales follow-up.",
    suggested_timing: "30-60 days / after clarification",
    priority_level: "low",
    risk_level: "medium",
    confidence_level: "low",
    created_at: "2026-06-22T00:00:00.000Z",
  },
]);

const FOLLOWUP_FALLBACK_MESSAGE_DRAFTS = Object.freeze([
  {
    id: "DEMO_FOLLOWUP_DRAFT_1",
    followup_candidate_id: "DEMO_FOLLOWUP_CARLOS",
    language: "en",
    channel: "email",
    tone: "professional",
    draft_subject: "Project details for your aluminum window inquiry",
    draft_body:
      "Dear Carlos, thank you for your inquiry. To help our team review the project correctly, could you share the project location, product specifications, drawings or photos, and target quantity?",
    draft_status: "draft",
    safety_notes: "Draft only. Must be reviewed by a human before any use.",
    requires_approval: true,
    created_at: "2026-06-22T00:00:00.000Z",
    updated_at: "2026-06-22T00:00:00.000Z",
  },
  {
    id: "DEMO_FOLLOWUP_DRAFT_2",
    followup_candidate_id: "DEMO_FOLLOWUP_MARIA",
    language: "es",
    channel: "email",
    tone: "professional",
    draft_subject: "Confirmacion de empresa y proyecto",
    draft_body:
      "Hola Maria, gracias por su mensaje. Antes de continuar, podriamos confirmar el nombre de la empresa, su sitio web y algunos detalles basicos del proyecto?",
    draft_status: "needs_review",
    safety_notes: "Draft only. Duplicate context must be reviewed first.",
    requires_approval: true,
    created_at: "2026-06-22T00:00:00.000Z",
    updated_at: "2026-06-22T00:00:00.000Z",
  },
  {
    id: "DEMO_FOLLOWUP_DRAFT_3",
    followup_candidate_id: "DEMO_FOLLOWUP_DANIEL",
    language: "en",
    channel: "email",
    tone: "concise",
    draft_subject: "Quick check on your building materials interest",
    draft_body:
      "Hi Daniel, thank you for connecting. Could you share your company website and your role in the buying process so our team can review whether our aluminum and building-material products are relevant?",
    draft_status: "draft",
    safety_notes: "Draft only. Low-priority lead, no automatic sending.",
    requires_approval: true,
    created_at: "2026-06-22T00:00:00.000Z",
    updated_at: "2026-06-22T00:00:00.000Z",
  },
]);

const FOLLOWUP_FALLBACK_REVIEWS = Object.freeze([
  {
    id: "DEMO_FOLLOWUP_REVIEW_1",
    followup_candidate_id: "DEMO_FOLLOWUP_CARLOS",
    reviewer: "Paul",
    review_status: "pending",
    decision: "",
    reviewer_notes: "",
    approved_next_action: "",
    reviewed_at: "",
    created_at: "2026-06-22T00:00:00.000Z",
  },
  {
    id: "DEMO_FOLLOWUP_REVIEW_2",
    followup_candidate_id: "DEMO_FOLLOWUP_MARIA",
    reviewer: "Paul",
    review_status: "pending",
    decision: "",
    reviewer_notes: "",
    approved_next_action: "",
    reviewed_at: "",
    created_at: "2026-06-22T00:00:00.000Z",
  },
  {
    id: "DEMO_FOLLOWUP_REVIEW_3",
    followup_candidate_id: "DEMO_FOLLOWUP_DANIEL",
    reviewer: "Paul",
    review_status: "pending",
    decision: "",
    reviewer_notes: "",
    approved_next_action: "",
    reviewed_at: "",
    created_at: "2026-06-22T00:00:00.000Z",
  },
]);

function followupSafetyPayload() {
  return {
    human_review_required: true,
    safety: "read_only_preview",
    disabled_actions: [...FOLLOWUP_ASSISTANT_DISABLED_ACTIONS],
  };
}

function followupFallbackWarnings(warnings) {
  return warnings.length ? warnings : ["followup_source_unavailable"];
}

function followupMeta(resource, warnings, source = "admin_read") {
  return {
    generated_at: new Date().toISOString(),
    source,
    resource,
    is_fallback: source === "fallback_demo" || warnings.length > 0,
  };
}

function followupCandidateRecord(row) {
  return {
    id: row.id || "",
    source_type: row.source_type || "",
    source_entity_id: row.source_entity_id || "",
    customer_id: row.customer_id || "",
    inquiry_id: row.inquiry_id || "",
    verification_request_id: row.verification_request_id || "",
    customer_name: row.customer_name || "",
    company_name: row.company_name || "",
    contact_name: row.contact_name || "",
    country: row.country || "",
    language: row.language || "",
    followup_reason: row.followup_reason || "",
    current_stage: row.current_stage || "",
    priority_level: row.priority_level || "",
    risk_level: row.risk_level || "",
    confidence_level: row.confidence_level || "",
    status: row.status || "",
    created_at: row.created_at || "",
    updated_at: row.updated_at || "",
  };
}

function followupMissingInformationRecord(row) {
  return {
    id: row.id || "",
    followup_candidate_id: row.followup_candidate_id || "",
    info_type: row.info_type || "",
    info_label: row.info_label || "",
    required_level: row.required_level || "",
    status: row.status || "",
    notes: row.notes || "",
    created_at: row.created_at || "",
  };
}

function followupRecommendationRecord(row) {
  return {
    id: row.id || "",
    followup_candidate_id: row.followup_candidate_id || "",
    recommended_action: row.recommended_action || "",
    recommendation_reason: row.recommendation_reason || "",
    suggested_timing: row.suggested_timing || "",
    priority_level: row.priority_level || "",
    risk_level: row.risk_level || "",
    confidence_level: row.confidence_level || "",
    created_at: row.created_at || "",
  };
}

function followupMessageDraftRecord(row) {
  return {
    id: row.id || "",
    followup_candidate_id: row.followup_candidate_id || "",
    language: row.language || "",
    channel: row.channel || "",
    tone: row.tone || "",
    draft_subject: row.draft_subject || "",
    draft_body: row.draft_body || "",
    draft_status: row.draft_status || "",
    safety_notes: row.safety_notes || "",
    requires_approval: row.requires_approval !== false,
    created_at: row.created_at || "",
    updated_at: row.updated_at || "",
  };
}

function followupReviewRecord(row) {
  return {
    id: row.id || "",
    followup_candidate_id: row.followup_candidate_id || "",
    reviewer: row.reviewer || "",
    review_status: row.review_status || "",
    decision: row.decision || "",
    reviewer_notes: row.reviewer_notes || "",
    approved_next_action: row.approved_next_action || "",
    reviewed_at: row.reviewed_at || "",
    created_at: row.created_at || "",
  };
}

function fallbackFollowupData() {
  return {
    candidates: FOLLOWUP_FALLBACK_CANDIDATES.map(followupCandidateRecord),
    missingInformation: FOLLOWUP_FALLBACK_MISSING_INFORMATION.map(followupMissingInformationRecord),
    recommendations: FOLLOWUP_FALLBACK_RECOMMENDATIONS.map(followupRecommendationRecord),
    messageDrafts: FOLLOWUP_FALLBACK_MESSAGE_DRAFTS.map(followupMessageDraftRecord),
    reviews: FOLLOWUP_FALLBACK_REVIEWS.map(followupReviewRecord),
  };
}

function followupSummary(data) {
  const candidates = data.candidates || [];
  const missingInformation = data.missingInformation || [];
  const messageDrafts = data.messageDrafts || [];
  return {
    total_candidates: candidates.length,
    needs_review: candidates.filter((record) => record.status === "needs_review").length,
    high_priority: candidates.filter((record) => record.priority_level === "high").length,
    missing_information: missingInformation.filter((record) => ["missing", "needs_review"].includes(record.status)).length,
    draft_messages: messageDrafts.filter((record) => ["draft", "needs_review"].includes(record.draft_status)).length,
    risk_hold: candidates.filter((record) => record.current_stage === "risk_hold").length,
    waiting_response: candidates.filter((record) => record.current_stage === "waiting_response").length,
  };
}

function followupReviewQueueFromData(data) {
  const recommendationMap = new Map((data.recommendations || []).map((record) => [record.followup_candidate_id, record]));
  return (data.candidates || [])
    .filter((record) => !["completed", "skipped", "archived"].includes(record.status))
    .map((record) => {
      const recommendation = recommendationMap.get(record.id) || {};
      return {
        id: record.id,
        customer_name: record.customer_name,
        company_name: record.company_name,
        country: record.country,
        current_stage: record.current_stage,
        priority_level: record.priority_level,
        risk_level: record.risk_level,
        confidence_level: record.confidence_level,
        followup_reason: record.followup_reason,
        recommended_action: recommendation.recommended_action || "",
        suggested_timing: recommendation.suggested_timing || "",
        status: record.status,
        created_at: record.created_at,
      };
    })
    .slice(0, 50);
}

async function readFollowupSources(supabase, warnings) {
  const [candidates, missingInformation, recommendations, messageDrafts, reviews] = await Promise.all([
    readSource({
      supabase,
      table: "followup_candidates",
      select:
        "id,source_type,source_entity_id,customer_id,inquiry_id,verification_request_id,customer_name,company_name,contact_name,country,language,followup_reason,current_stage,priority_level,risk_level,confidence_level,status,created_at,updated_at",
      warning: "followup_candidates_unavailable",
      warnings,
      limit: 50,
    }),
    readSource({
      supabase,
      table: "followup_missing_information",
      select: "id,followup_candidate_id,info_type,info_label,required_level,status,notes,created_at",
      warning: "followup_missing_information_unavailable",
      warnings,
      limit: 100,
    }),
    readSource({
      supabase,
      table: "followup_recommendations",
      select:
        "id,followup_candidate_id,recommended_action,recommendation_reason,suggested_timing,priority_level,risk_level,confidence_level,created_at",
      warning: "followup_recommendations_unavailable",
      warnings,
      limit: 50,
    }),
    readSource({
      supabase,
      table: "followup_message_drafts",
      select:
        "id,followup_candidate_id,language,channel,tone,draft_subject,draft_body,draft_status,safety_notes,requires_approval,created_at,updated_at",
      warning: "followup_message_drafts_unavailable",
      warnings,
      limit: 50,
    }),
    readSource({
      supabase,
      table: "followup_reviews",
      select: "id,followup_candidate_id,reviewer,review_status,decision,reviewer_notes,approved_next_action,reviewed_at,created_at",
      warning: "followup_reviews_unavailable",
      warnings,
      limit: 50,
    }),
  ]);

  return {
    candidates: candidates.map(followupCandidateRecord),
    missingInformation: missingInformation.map(followupMissingInformationRecord),
    recommendations: recommendations.map(followupRecommendationRecord),
    messageDrafts: messageDrafts.map(followupMessageDraftRecord),
    reviews: reviews.map(followupReviewRecord),
  };
}

function sendFollowupPayload(response, resource, records, summary, warnings, source = "admin_read") {
  sendJson(response, 200, {
    meta: followupMeta(resource, warnings, source),
    records,
    summary,
    safety: followupSafetyPayload(),
    warnings,
  });
}

function sendFollowupFallback(response, resource, records, summary, warnings) {
  const fallbackWarnings = followupFallbackWarnings(warnings);
  sendFollowupPayload(response, resource, records, summary, fallbackWarnings, "fallback_demo");
}

async function readFollowupDataOrFallback(response, supabase, resource, pickRecords, pickSummary) {
  const warnings = [];
  const data = await readFollowupSources(supabase, warnings);
  if (warnings.length > 0) {
    const fallback = fallbackFollowupData();
    sendFollowupFallback(response, resource, pickRecords(fallback), pickSummary(fallback), warnings);
    return;
  }

  sendFollowupPayload(response, resource, pickRecords(data), pickSummary(data), warnings);
}

async function readFollowupSummary(response, supabase) {
  await readFollowupDataOrFallback(response, supabase, "followup-summary", () => [], followupSummary);
}

async function readFollowupCandidates(response, supabase) {
  await readFollowupDataOrFallback(
    response,
    supabase,
    "followup-candidates",
    (data) => data.candidates,
    (data) => followupSummary(data)
  );
}

async function readFollowupMissingInformation(response, supabase) {
  await readFollowupDataOrFallback(
    response,
    supabase,
    "followup-missing-information",
    (data) => data.missingInformation,
    (data) => ({ total_records: data.missingInformation.length })
  );
}

async function readFollowupRecommendations(response, supabase) {
  await readFollowupDataOrFallback(
    response,
    supabase,
    "followup-recommendations",
    (data) => data.recommendations,
    (data) => ({ total_records: data.recommendations.length })
  );
}

async function readFollowupMessageDrafts(response, supabase) {
  await readFollowupDataOrFallback(
    response,
    supabase,
    "followup-message-drafts",
    (data) => data.messageDrafts,
    (data) => ({ total_records: data.messageDrafts.length })
  );
}

async function readFollowupReviewQueue(response, supabase) {
  await readFollowupDataOrFallback(
    response,
    supabase,
    "followup-review-queue",
    followupReviewQueueFromData,
    (data) => ({ total_records: followupReviewQueueFromData(data).length })
  );
}

async function readFollowupReviews(response, supabase) {
  await readFollowupDataOrFallback(
    response,
    supabase,
    "followup-reviews",
    (data) => data.reviews,
    (data) => ({ total_records: data.reviews.length })
  );
}

function dashboardSummaryCards({ inquiries, customers, aiAnalyses, followUps }, now = new Date()) {
  const newInquiries = inquiries.filter((record) => isToday(record.created_at, now)).length;
  const missingInquiryCount = inquiries.filter((record) => hasMissingInfo(record, "missing_info")).length;
  const missingAiCount = aiAnalyses.filter((record) => hasMissingInfo(record, "missing_information")).length;
  const highRiskInquiryCount = inquiries.filter((record) =>
    hasHighRiskText(record.status, record.title, record.ai_summary, record.recommended_next_action)
  ).length;
  const highRiskAiCount = aiAnalyses.filter((record) => hasHighRiskText(record.risk_flags)).length;
  const aiPending = aiAnalyses.filter((record) => record.approval_required !== false).length;
  const dueFollowUps = followUps.filter((record) =>
    statusNeedsReview(record.status) && (isDue(record.next_follow_up_at, now) || isDue(record.due_date, now))
  ).length;
  const customersNeedingReview = customers.filter((record) => statusNeedsReview(record.stage || record.status)).length;

  return {
    new_inquiries: {
      label: "新询盘",
      value: newInquiries,
      note: "今日新增待查看询盘",
    },
    needs_review: {
      label: "需要人工复核",
      value: inquiries.filter((record) => statusNeedsReview(record.status)).length + customersNeedingReview + aiPending,
      note: "询盘、客户、AI 草稿或沟通需要复核",
    },
    missing_information: {
      label: "缺失信息",
      value: missingInquiryCount + missingAiCount,
      note: "图纸、规格、数量或交期信息缺失",
    },
    followups_due: {
      label: "今日跟进",
      value: dueFollowUps,
      note: "需要联系客户或供应商",
    },
    high_risk: {
      label: "高风险提醒",
      value: highRiskInquiryCount + highRiskAiCount,
      note: "涉及价格、付款、交期或质量责任",
    },
    ai_drafts_pending: {
      label: "AI 草稿待审",
      value: aiPending,
      note: "仅草稿，发送前必须人工确认",
    },
  };
}

function dashboardWorkflowQueues({ inquiries, customers, aiAnalyses, capabilities }) {
  return {
    inquiry_queue: inquiries
      .filter((record) => statusNeedsReview(record.status) || hasMissingInfo(record, "missing_info"))
      .slice(0, QUEUE_LIMIT)
      .map((record) =>
        queueItem({
          title: record.title,
          status: record.status,
          risk: riskLabel(record, ["status", "title", "ai_summary", "recommended_next_action"]),
          summary: record.ai_summary || record.project_description || record.title,
          nextStep: record.recommended_next_action || "先补齐关键信息，再由人工决定下一步",
          disabledActions: ["send", "create_quote", "generate_pi", "confirm_order"],
        })
      ),
    customer_queue: customers
      .filter((record) => statusNeedsReview(record.stage || record.status) || isDue(record.next_follow_up_at))
      .slice(0, QUEUE_LIMIT)
      .map((record) =>
        queueItem({
          title: record.name || record.contact_name || "未命名客户",
          status: record.stage || record.status || "待复核",
          risk: "待复核",
          summary: record.summary || record.notes || "客户状态需要人工确认",
          nextStep: isDue(record.next_follow_up_at) ? "人工确认是否需要跟进客户" : "人工查看客户阶段和最近需求",
          disabledActions: ["send", "create_task", "approve"],
        })
      ),
    ai_review_queue: aiAnalyses
      .filter((record) => record.approval_required !== false || hasMissingInfo(record, "missing_information") || hasHighRiskText(record.risk_flags))
      .slice(0, QUEUE_LIMIT)
      .map((record) =>
        queueItem({
          title: `AI 询盘分析 ${safeText(record.detected_business_line, "UNKNOWN")}`,
          status: record.approval_required === false ? "仅展示" : "需要人工复核",
          risk: riskLabel(record, ["risk_flags"]),
          summary: arrayValue(record.missing_information).length
            ? `缺失信息：${arrayValue(record.missing_information).slice(0, 4).join("、")}`
            : "AI 分析记录需要人工确认后才能使用",
          nextStep: "人工复核 AI 建议，不自动发送、不自动审批",
          disabledActions: ["send", "approve", "reject", "create_quote", "generate_pi"],
        })
      ),
    supplier_capability_queue: capabilities.slice(0, QUEUE_LIMIT).map((record) =>
      queueItem({
        title: record.equipment || record.capability_line || "制造能力记录",
        status: "只读能力参考",
        risk: "需人工确认",
        summary: record.public_description || record.monthly_capacity || "制造能力仅供人工参考",
        nextStep: "人工核实产能、设备、规格和供应商反馈",
        disabledActions: ["create_quote", "confirm_order", "confirm_production", "confirm_shipment"],
      })
    ),
    pre_quotation_queue: inquiries
      .filter((record) => hasMissingInfo(record, "missing_info") || hasHighRiskText(record.ai_summary, record.recommended_next_action, record.status))
      .slice(0, QUEUE_LIMIT)
      .map((record) =>
        queueItem({
          title: record.title,
          status: "报价前复核",
          risk: riskLabel(record, ["status", "ai_summary", "recommended_next_action"]),
          summary: record.ai_summary || record.project_description || "报价前需要人工复核资料",
          nextStep: record.recommended_next_action || "人工确认图纸、规格、数量、交期和供应商信息后再报价",
          disabledActions: ["create_quote", "generate_pi", "confirm_order", "confirm_payment"],
        })
      ),
  };
}

async function readDashboardSummary(response, supabase) {
  const warnings = [];
  const [inquiries, customers, aiAnalyses, capabilities, followUps] = await Promise.all([
    readSource({
      supabase,
      table: "inquiries",
      select: "id,title,status,business_line,project_description,ai_summary,missing_info,recommended_next_action,next_follow_up_at,created_at,updated_at",
      warning: "inquiries_unavailable",
      warnings,
    }),
    readSource({
      supabase,
      table: "customers",
      select: "id,name,contact_name,status,stage,summary,notes,business_line,last_contact_at,next_follow_up_at,created_at,updated_at",
      warning: "customers_unavailable",
      warnings,
    }),
    readSource({
      supabase,
      table: "ai_inquiry_analyses",
      select: "id,inquiry_id,detected_business_line,missing_information,risk_flags,approval_required,created_at",
      warning: "ai_inquiry_analyses_unavailable",
      warnings,
    }),
    readSource({
      supabase,
      table: "manufacturing_capabilities",
      select: "id,capability_line,equipment,quantity,max_length,monthly_capacity,public_description,created_at,updated_at",
      warning: "manufacturing_capabilities_unavailable",
      warnings,
    }),
    readSource({
      supabase,
      table: "follow_up_tasks",
      select: "id,title,status,priority,due_date,next_follow_up_at,manual_review_required,created_at,updated_at",
      warning: "follow_up_tasks_unavailable",
      warnings,
      orderOptions: { ascending: true, nullsFirst: false },
    }),
  ]);

  sendJson(response, 200, {
    meta: {
      generated_at: new Date().toISOString(),
      source: "admin_read",
      resource: "dashboard-summary",
      is_fallback: warnings.length > 0,
    },
    summary_cards: dashboardSummaryCards({ inquiries, customers, aiAnalyses, followUps }),
    workflow_queues: dashboardWorkflowQueues({ inquiries, customers, aiAnalyses, capabilities }),
    safety: safetyPayload(),
    warnings,
  });
}

async function readCustomers(response, supabase) {
  const warnings = [];
  const customers = await readSource({
    supabase,
    table: "customers",
    warning: "customers_unavailable",
    warnings,
  });

  sendJson(
    response,
    200,
    standardPayload({
      resource: "customers",
      records: customers.map(customerRecord),
      summary: {
        total_records: customers.length,
      },
      warnings,
    })
  );
}

async function readInquiries(response, supabase) {
  const warnings = [];
  const inquiries = await readSource({
    supabase,
    table: "inquiries",
    warning: "inquiries_unavailable",
    warnings,
  });

  sendJson(
    response,
    200,
    standardPayload({
      resource: "inquiries",
      records: inquiries.map(inquiryRecord),
      summary: {
        total_records: inquiries.length,
        missing_information_records: inquiries.filter((record) => hasMissingInfo(record, "missing_info")).length,
        review_required_records: inquiries.filter((record) => statusNeedsReview(record.status)).length,
      },
      warnings,
    })
  );
}

async function readAiReview(response, supabase) {
  const warnings = [];
  const aiReviews = await readSource({
    supabase,
    table: "ai_inquiry_analyses",
    warning: "ai_review_source_unavailable",
    warnings,
  });

  sendJson(
    response,
    200,
    standardPayload({
      resource: "ai-review",
      records: aiReviews.map(aiReviewRecord),
      summary: {
        total_records: aiReviews.length,
        review_required_records: aiReviews.filter((record) => record.approval_required !== false || statusNeedsReview(record.approval_status || record.status)).length,
        risk_flag_records: aiReviews.filter((record) => arrayValue(record.risk_flags).length > 0).length,
      },
      warnings,
    })
  );
}

async function readSupplierCapabilities(response, supabase) {
  const warnings = [];
  const capabilities = await readSource({
    supabase,
    table: "manufacturing_capabilities",
    warning: "supplier_capabilities_source_unavailable",
    warnings,
  });

  sendJson(
    response,
    200,
    standardPayload({
      resource: "supplier-capabilities",
      records: capabilities.map(supplierCapabilityRecord),
      summary: {
        total_records: capabilities.length,
        review_required_records: capabilities.filter((record) => statusNeedsReview(record.supplier_status || record.status || record.capability_status)).length,
      },
      warnings,
    })
  );
}

async function readDocuments(response, supabase) {
  const warnings = [];
  const documents = await readSource({
    supabase,
    table: "documents",
    select: "id,related_type,related_id,doc_type,file_name,created_at,updated_at",
    warning: "documents_source_unavailable",
    warnings,
  });

  let attachments = [];
  if (documents.length === 0) {
    attachments = await readSource({
      supabase,
      table: "attachments",
      select: "id,lead_id,customer_id,inquiry_id,file_name,file_type,file_size,source,created_at,updated_at",
      warning: "attachments_source_unavailable",
      warnings,
    });
  }

  const records = [
    ...documents.map((record) => documentMetadataRecord(record, "documents")),
    ...attachments.map((record) => documentMetadataRecord(record, "attachments")),
  ];

  sendJson(response, 200, {
    meta: {
      generated_at: new Date().toISOString(),
      source: "admin_read",
      resource: "documents",
      is_fallback: warnings.length > 0 || documents.length === 0,
    },
    records,
    summary: {
      total_documents: records.length,
      needs_review: records.filter((record) => record.manual_review_required || statusNeedsReview(record.status)).length,
      high_risk: records.filter((record) => record.risk === "高风险").length,
      missing_metadata: records.filter((record) => !record.linked_business_id || record.title === "文件资料" || record.file_type === "文件资料").length,
    },
    safety: safetyPayload(DOCUMENT_DISABLED_ACTIONS),
    warnings,
  });
}

async function readPreQuotationReview(response, supabase) {
  const warnings = [];
  const [inquiries, customers] = await Promise.all([
    readSource({
      supabase,
      table: "inquiries",
      select:
        "id,customer_id,company_id,source,status,business_line,title,inquiry_type,project_type,product_category,drawing_status,quote_method,project_description,original_message,ai_summary,missing_info,recommended_next_action,metadata,created_at,updated_at",
      warning: "pre_quotation_source_unavailable",
      warnings,
    }),
    readSource({
      supabase,
      table: "customers",
      select: "id,name,contact_name,company_name,company,created_at,updated_at",
      warning: "pre_quotation_customers_unavailable",
      warnings,
    }),
  ]);

  const customerMap = new Map(customers.map((record) => [record.id, record]));
  const records = inquiries.map((record) => preQuotationReviewRecord(record, customerMap));

  sendJson(response, 200, {
    meta: {
      generated_at: new Date().toISOString(),
      source: "admin_read",
      resource: "pre-quotation-review",
      is_fallback: warnings.length > 0,
    },
    records,
    summary: preQuotationSummary(records),
    safety: safetyPayload(PRE_QUOTATION_DISABLED_ACTIONS),
    warnings,
  });
}

async function readQuotations(response, supabase) {
  const warnings = ["quotation_projection_limited", "quotation_items_hidden_for_safety", "unsafe_cost_fields_not_exposed"];
  const quotations = await readSource({
    supabase,
    table: "quotations",
    select: "id,quote_no,inquiry_id,customer_id,status,currency,total_amount,approval_required,created_at,updated_at",
    warning: "quotations_source_unavailable",
    warnings,
  });

  const customers = quotations.length
    ? await readSource({
        supabase,
        table: "customers",
        select: "id,name,contact_name,company_name,company,created_at,updated_at",
        warning: "quotation_customers_unavailable",
        warnings,
      })
    : [];
  const customerMap = new Map(customers.map((record) => [record.id, record]));
  const records = quotations.map((record) => quotationRecord(record, customerMap));

  sendJson(response, 200, {
    meta: {
      generated_at: new Date().toISOString(),
      source: "admin_read",
      resource: "quotations",
      is_fallback: warnings.includes("quotations_source_unavailable"),
    },
    records,
    summary: quotationSummary(records),
    safety: safetyPayload(QUOTATION_DISABLED_ACTIONS),
    warnings,
  });
}

async function readKnowledgeSources(supabase, warnings) {
  const [categories, items] = await Promise.all([
    readSource({
      supabase,
      table: "knowledge_categories",
      select: "id,slug,name_zh,name_en,description,sort_order,is_active,created_at,updated_at",
      warning: "knowledge_categories_unavailable",
      warnings,
      order: "sort_order",
      orderOptions: { ascending: true },
    }),
    readSource({
      supabase,
      table: "knowledge_items",
      select:
        "id,title,category_id,language,summary,source_type,source_reference,confidence_level,human_verified,verification_status,risk_level,visibility_scope,tags,updated_at",
      warning: "knowledge_items_unavailable",
      warnings,
      order: "updated_at",
    }),
  ]);

  return { categories, items };
}

function sendKnowledgeFallback(response, resource, records, summary, warnings) {
  sendJson(response, 200, {
    meta: knowledgeMeta(resource, knowledgeFallbackWarnings(warnings), "fallback_demo"),
    records,
    summary,
    safety: knowledgeSafetyPayload(),
    warnings: knowledgeFallbackWarnings(warnings),
  });
}

async function readKnowledgeSummary(response, supabase) {
  const warnings = [];
  const { categories, items } = await readKnowledgeSources(supabase, warnings);
  if (warnings.length > 0) {
    sendKnowledgeFallback(
      response,
      "knowledge-summary",
      [],
      knowledgeSummaryFromItems(KNOWLEDGE_FALLBACK_ITEMS, KNOWLEDGE_FALLBACK_CATEGORIES),
      warnings
    );
    return;
  }

  sendJson(response, 200, {
    meta: knowledgeMeta("knowledge-summary", warnings),
    summary: knowledgeSummaryFromItems(items, categories),
    safety: knowledgeSafetyPayload(),
    warnings,
  });
}

async function readKnowledgeCategories(response, supabase) {
  const warnings = [];
  const { categories, items } = await readKnowledgeSources(supabase, warnings);
  if (warnings.length > 0) {
    const records = fallbackKnowledgeCategories();
    sendKnowledgeFallback(response, "knowledge-categories", records, { total_records: records.length }, warnings);
    return;
  }

  const records = categories.map((category) => knowledgeCategoryRecord(category, knowledgeCategoryCounts(items)));
  sendJson(response, 200, {
    meta: knowledgeMeta("knowledge-categories", warnings),
    records,
    summary: {
      total_records: records.length,
      active_categories: categories.filter((category) => category.is_active !== false).length,
    },
    safety: knowledgeSafetyPayload(),
    warnings,
  });
}

async function readKnowledgeItems(response, supabase) {
  const warnings = [];
  const { categories, items } = await readKnowledgeSources(supabase, warnings);
  if (warnings.length > 0) {
    sendKnowledgeFallback(
      response,
      "knowledge-items",
      [...KNOWLEDGE_FALLBACK_ITEMS],
      knowledgeSummaryFromItems(KNOWLEDGE_FALLBACK_ITEMS, KNOWLEDGE_FALLBACK_CATEGORIES),
      warnings
    );
    return;
  }

  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const records = items.slice(0, 50).map((item) => knowledgeItemRecord(item, categoryMap));
  sendJson(response, 200, {
    meta: knowledgeMeta("knowledge-items", warnings),
    records,
    summary: knowledgeSummaryFromItems(items, categories),
    safety: knowledgeSafetyPayload(),
    warnings,
  });
}

async function readKnowledgeReviewQueue(response, supabase) {
  const warnings = [];
  const knowledgeItems = await readSource({
    supabase,
    table: "knowledge_items",
    select: "id,title,source_type,source_reference,human_verified,verification_status,risk_level,updated_at",
    warning: "knowledge_review_queue_unavailable",
    warnings,
    order: "updated_at",
  });
  if (warnings.length > 0) {
    const records = fallbackKnowledgeReviewQueue();
    sendKnowledgeFallback(response, "knowledge-review-queue", records, { total_records: records.length }, warnings);
    return;
  }

  const records = knowledgeItems
    .filter((item) => item.human_verified !== true || ["draft", "needs_review", "outdated"].includes(item.verification_status))
    .slice(0, 50)
    .map(knowledgeReviewQueueRecord);
  sendJson(response, 200, {
    meta: knowledgeMeta("knowledge-review-queue", warnings),
    records,
    summary: {
      total_records: records.length,
      high_risk_records: records.filter((record) => record.risk_level === "high").length,
    },
    safety: knowledgeSafetyPayload(),
    warnings,
  });
}

async function readKnowledgeLinkedContext(response, supabase) {
  const warnings = [];
  const linkedContext = await readSource({
    supabase,
    table: "knowledge_links",
    select: "knowledge_item_id,linked_entity_type,linked_entity_label,relationship_type,created_at",
    warning: "knowledge_linked_context_unavailable",
    warnings,
    order: "created_at",
  });
  if (warnings.length > 0) {
    const records = fallbackKnowledgeLinkedContext();
    sendKnowledgeFallback(response, "knowledge-linked-context", records, { total_records: records.length }, warnings);
    return;
  }

  const records = linkedContext.slice(0, 50).map(knowledgeLinkedContextRecord);
  sendJson(response, 200, {
    meta: knowledgeMeta("knowledge-linked-context", warnings),
    records,
    summary: {
      total_records: records.length,
    },
    safety: knowledgeSafetyPayload(),
    warnings,
  });
}

function sendBusinessCardPayload(response, resource, records, summary, warnings, source = "admin_read") {
  sendJson(response, 200, {
    meta: businessCardMeta(resource, warnings, source),
    records,
    summary,
    safety: businessCardSafetyPayload(),
    warnings,
  });
}

function sendBusinessCardFallback(response, resource, records, summary, warnings) {
  sendBusinessCardPayload(response, resource, records, summary, businessCardFallbackWarnings(warnings), "fallback_demo");
}

async function readBusinessCardSummary(response, supabase) {
  const warnings = [];
  const data = await readBusinessCardSources(supabase, warnings);
  if (warnings.length > 0) {
    const fallback = fallbackBusinessCardData();
    sendBusinessCardFallback(response, "business-card-summary", [], businessCardSummary(fallback), warnings);
    return;
  }

  sendBusinessCardPayload(response, "business-card-summary", [], businessCardSummary(data), warnings);
}

async function readBusinessCardCaptureSources(response, supabase) {
  const warnings = [];
  const data = await readBusinessCardSources(supabase, warnings);
  if (warnings.length > 0) {
    const fallback = fallbackBusinessCardData();
    sendBusinessCardFallback(response, "business-card-capture-sources", fallback.captureSources, { total_records: fallback.captureSources.length }, warnings);
    return;
  }

  sendBusinessCardPayload(response, "business-card-capture-sources", data.captureSources, { total_records: data.captureSources.length }, warnings);
}

async function readBusinessCardExtractionResults(response, supabase) {
  const warnings = [];
  const data = await readBusinessCardSources(supabase, warnings);
  if (warnings.length > 0) {
    const fallback = fallbackBusinessCardData();
    sendBusinessCardFallback(
      response,
      "business-card-extraction-results",
      fallback.extractionResults.slice(0, 50),
      { total_records: fallback.extractionResults.length },
      warnings
    );
    return;
  }

  sendBusinessCardPayload(
    response,
    "business-card-extraction-results",
    data.extractionResults.slice(0, 50),
    { total_records: data.extractionResults.length },
    warnings
  );
}

async function readCustomerProfileDrafts(response, supabase) {
  const warnings = [];
  const data = await readBusinessCardSources(supabase, warnings);
  if (warnings.length > 0) {
    const fallback = fallbackBusinessCardData();
    sendBusinessCardFallback(
      response,
      "customer-profile-drafts",
      fallback.profileDrafts.slice(0, 50),
      businessCardSummary(fallback),
      warnings
    );
    return;
  }

  sendBusinessCardPayload(response, "customer-profile-drafts", data.profileDrafts.slice(0, 50), businessCardSummary(data), warnings);
}

async function readBusinessCardReviewQueue(response, supabase) {
  const warnings = [];
  const data = await readBusinessCardSources(supabase, warnings);
  if (warnings.length > 0) {
    const fallback = fallbackBusinessCardData();
    const records = businessCardReviewQueueFromDrafts(fallback.profileDrafts);
    sendBusinessCardFallback(response, "business-card-review-queue", records, { total_records: records.length }, warnings);
    return;
  }

  const records = businessCardReviewQueueFromDrafts(data.profileDrafts);
  sendBusinessCardPayload(response, "business-card-review-queue", records, { total_records: records.length }, warnings);
}

async function readBusinessCardDuplicateChecks(response, supabase) {
  const warnings = [];
  const data = await readBusinessCardSources(supabase, warnings);
  if (warnings.length > 0) {
    const fallback = fallbackBusinessCardData();
    sendBusinessCardFallback(
      response,
      "business-card-duplicate-checks",
      fallback.duplicateChecks.slice(0, 50),
      { total_records: fallback.duplicateChecks.length },
      warnings
    );
    return;
  }

  sendBusinessCardPayload(
    response,
    "business-card-duplicate-checks",
    data.duplicateChecks.slice(0, 50),
    { total_records: data.duplicateChecks.length },
    warnings
  );
}

async function readBusinessCardFollowupDrafts(response, supabase) {
  const warnings = [];
  const data = await readBusinessCardSources(supabase, warnings);
  if (warnings.length > 0) {
    const fallback = fallbackBusinessCardData();
    sendBusinessCardFallback(
      response,
      "business-card-followup-drafts",
      fallback.followupDrafts.slice(0, 50),
      { total_records: fallback.followupDrafts.length },
      warnings
    );
    return;
  }

  sendBusinessCardPayload(
    response,
    "business-card-followup-drafts",
    data.followupDrafts.slice(0, 50),
    { total_records: data.followupDrafts.length },
    warnings
  );
}

module.exports = async function handler(request, response) {
  try {
    if (request.method !== "GET") {
      response.setHeader("Allow", "GET");
      sendJson(response, 405, { error: "Method not allowed" });
      return;
    }

    const resource = adminReadResource(request);
    if (!isSupportedResource(resource)) {
      sendJson(response, 404, {
        error: "not_found",
        message: "Unknown admin-read resource",
        safety: safetyPayload(),
      });
      return;
    }

    if (resource === "dashboard-summary") {
      const supabase = getSupabaseClient(request);
      await readDashboardSummary(response, supabase);
      return;
    }

    if (resource === "customers") {
      const supabase = getSupabaseClient(request);
      await readCustomers(response, supabase);
      return;
    }

    if (resource === "inquiries") {
      const supabase = getSupabaseClient(request);
      await readInquiries(response, supabase);
      return;
    }

    if (resource === "ai-review") {
      const supabase = getSupabaseClient(request);
      await readAiReview(response, supabase);
      return;
    }

    if (resource === "supplier-capabilities") {
      const supabase = getSupabaseClient(request);
      await readSupplierCapabilities(response, supabase);
      return;
    }

    if (resource === "documents") {
      const supabase = getSupabaseClient(request);
      await readDocuments(response, supabase);
      return;
    }

    if (resource === "pre-quotation-review") {
      const supabase = getSupabaseClient(request);
      await readPreQuotationReview(response, supabase);
      return;
    }

    if (resource === "quotations") {
      const supabase = getSupabaseClient(request);
      await readQuotations(response, supabase);
      return;
    }

    if (resource === "knowledge-summary") {
      const supabase = getSupabaseClient(request);
      await readKnowledgeSummary(response, supabase);
      return;
    }

    if (resource === "knowledge-categories") {
      const supabase = getSupabaseClient(request);
      await readKnowledgeCategories(response, supabase);
      return;
    }

    if (resource === "knowledge-items") {
      const supabase = getSupabaseClient(request);
      await readKnowledgeItems(response, supabase);
      return;
    }

    if (resource === "knowledge-review-queue") {
      const supabase = getSupabaseClient(request);
      await readKnowledgeReviewQueue(response, supabase);
      return;
    }

    if (resource === "knowledge-linked-context") {
      const supabase = getSupabaseClient(request);
      await readKnowledgeLinkedContext(response, supabase);
      return;
    }

    if (resource === "business-card-summary") {
      const supabase = getSupabaseClient(request);
      await readBusinessCardSummary(response, supabase);
      return;
    }

    if (resource === "business-card-capture-sources") {
      const supabase = getSupabaseClient(request);
      await readBusinessCardCaptureSources(response, supabase);
      return;
    }

    if (resource === "business-card-extraction-results") {
      const supabase = getSupabaseClient(request);
      await readBusinessCardExtractionResults(response, supabase);
      return;
    }

    if (resource === "customer-profile-drafts") {
      const supabase = getSupabaseClient(request);
      await readCustomerProfileDrafts(response, supabase);
      return;
    }

    if (resource === "business-card-review-queue") {
      const supabase = getSupabaseClient(request);
      await readBusinessCardReviewQueue(response, supabase);
      return;
    }

    if (resource === "business-card-duplicate-checks") {
      const supabase = getSupabaseClient(request);
      await readBusinessCardDuplicateChecks(response, supabase);
      return;
    }

    if (resource === "business-card-followup-drafts") {
      const supabase = getSupabaseClient(request);
      await readBusinessCardFollowupDrafts(response, supabase);
      return;
    }

    if (resource === "customer-verification-summary") {
      const supabase = getSupabaseClient(request);
      await readCustomerVerificationSummary(response, supabase);
      return;
    }

    if (resource === "customer-verification-requests") {
      const supabase = getSupabaseClient(request);
      await readCustomerVerificationRequests(response, supabase);
      return;
    }

    if (resource === "customer-verification-evidence") {
      const supabase = getSupabaseClient(request);
      await readCustomerVerificationEvidence(response, supabase);
      return;
    }

    if (resource === "customer-verification-scores") {
      const supabase = getSupabaseClient(request);
      await readCustomerVerificationScores(response, supabase);
      return;
    }

    if (resource === "customer-verification-duplicate-matches") {
      const supabase = getSupabaseClient(request);
      await readCustomerVerificationDuplicateMatches(response, supabase);
      return;
    }

    if (resource === "customer-verification-review-queue") {
      const supabase = getSupabaseClient(request);
      await readCustomerVerificationReviewQueue(response, supabase);
      return;
    }

    if (resource === "customer-verification-reviews") {
      const supabase = getSupabaseClient(request);
      await readCustomerVerificationReviews(response, supabase);
      return;
    }

    if (resource === "followup-summary") {
      const supabase = getSupabaseClient(request);
      await readFollowupSummary(response, supabase);
      return;
    }

    if (resource === "followup-candidates") {
      const supabase = getSupabaseClient(request);
      await readFollowupCandidates(response, supabase);
      return;
    }

    if (resource === "followup-missing-information") {
      const supabase = getSupabaseClient(request);
      await readFollowupMissingInformation(response, supabase);
      return;
    }

    if (resource === "followup-recommendations") {
      const supabase = getSupabaseClient(request);
      await readFollowupRecommendations(response, supabase);
      return;
    }

    if (resource === "followup-message-drafts") {
      const supabase = getSupabaseClient(request);
      await readFollowupMessageDrafts(response, supabase);
      return;
    }

    if (resource === "followup-review-queue") {
      const supabase = getSupabaseClient(request);
      await readFollowupReviewQueue(response, supabase);
      return;
    }

    if (resource === "followup-reviews") {
      const supabase = getSupabaseClient(request);
      await readFollowupReviews(response, supabase);
      return;
    }
  } catch (error) {
    handleApiError(response, error);
  }
};
