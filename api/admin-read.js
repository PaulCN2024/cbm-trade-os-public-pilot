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
    resource === "documents"
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
  } catch (error) {
    handleApiError(response, error);
  }
};
