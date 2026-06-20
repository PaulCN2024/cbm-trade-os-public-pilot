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
    resource === "knowledge-linked-context"
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

async function readSource({ supabase, table, select = "*", order = "created_at", orderOptions, warning, warnings }) {
  try {
    let query = supabase.from(table).select(select).limit(SOURCE_LIMIT);
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
  } catch (error) {
    handleApiError(response, error);
  }
};
