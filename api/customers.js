const { getSupabaseClient, handleApiError, parseBody, sendJson } = require("./_supabase");
const {
  safetyBoundaryPayload,
  sanitizeAiInquiryAnalysisInput,
  sanitizeCompanyInput,
  sanitizeManufacturingCapabilityInput,
  sanitizeProductInput,
} = require("../lib/api-validation.js");

const DASHBOARD_SUMMARY_RESOURCE = "admin-dashboard-summary";
const DASHBOARD_DISABLED_ACTIONS = Object.freeze([
  "send",
  "approve",
  "reject",
  "quote",
  "generate_pi",
  "confirm_order",
  "confirm_payment",
  "confirm_production",
  "confirm_shipment",
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
const DASHBOARD_SOURCE_LIMIT = 80;
const DASHBOARD_QUEUE_LIMIT = 5;

const CRM_RESOURCES = {
  "follow-ups": {
    table: "follow_up_tasks",
    listKey: "follow_up_tasks",
    singleKey: "follow_up_task",
    methods: "GET",
    order: "next_follow_up_at",
    orderOptions: { ascending: true, nullsFirst: false },
    readOnly: true,
  },
  companies: {
    table: "companies",
    listKey: "companies",
    singleKey: "company",
    methods: "GET, POST, PATCH, PUT",
    sanitize: sanitizeCompanyInput,
    requiredOnCreate: "company_name",
    bodyKey: "company",
  },
  products: {
    table: "products",
    listKey: "products",
    singleKey: "product",
    methods: "GET, POST, PATCH, PUT",
    sanitize: sanitizeProductInput,
    bodyKey: "product",
  },
  "manufacturing-capabilities": {
    table: "manufacturing_capabilities",
    listKey: "manufacturing_capabilities",
    singleKey: "manufacturing_capability",
    methods: "GET, POST, PATCH, PUT",
    sanitize: sanitizeManufacturingCapabilityInput,
    bodyKey: "manufacturing_capability",
  },
  "ai-inquiry-analyses": {
    table: "ai_inquiry_analyses",
    listKey: "ai_inquiry_analyses",
    singleKey: "ai_inquiry_analysis",
    methods: "GET, POST, PATCH, PUT",
    sanitize: sanitizeAiInquiryAnalysisInput,
    bodyKey: "ai_inquiry_analysis",
  },
};

function getQueryValue(request, key) {
  if (request.query?.[key]) return request.query[key];
  try {
    return new URL(request.url, "http://localhost").searchParams.get(key);
  } catch {
    return "";
  }
}

function getQueryId(request) {
  return getQueryValue(request, "id");
}

function getCrmResource(request) {
  const explicitResource = getQueryValue(request, "crm_resource");
  if (explicitResource) return explicitResource;
  const pathname = new URL(request.url || "/", "http://localhost").pathname.replace(/^\/api\//, "");
  return (CRM_RESOURCES[pathname] || pathname === DASHBOARD_SUMMARY_RESOURCE) ? pathname : "";
}

function isReadOnlyResource(resourceName) {
  return resourceName === DASHBOARD_SUMMARY_RESOURCE || Boolean(CRM_RESOURCES[resourceName]?.readOnly);
}

async function handleCrmResource(request, response, supabase, resourceName) {
  const resource = CRM_RESOURCES[resourceName];
  if (!resource) return false;

  if (request.method === "GET") {
    const id = getQueryId(request);
    const query = supabase.from(resource.table).select("*");
    const { data, error } = id
      ? await query.eq("id", id).single()
      : await query.order(resource.order || "created_at", resource.orderOptions || { ascending: false });
    if (error) throw error;
    sendJson(response, 200, id ? { [resource.singleKey]: data } : { [resource.listKey]: data || [] });
    return true;
  }

  if (resource.readOnly) {
    response.setHeader("Allow", "GET");
    sendJson(response, 405, { error: "Method not allowed" });
    return true;
  }

  if (request.method === "POST") {
    const body = parseBody(request);
    const input = resource.sanitize(body[resource.bodyKey] || body);
    if (resource.requiredOnCreate && !input[resource.requiredOnCreate]) {
      sendJson(response, 400, { error: `${resource.requiredOnCreate} is required.` });
      return true;
    }
    const { data, error } = await supabase.from(resource.table).insert(input).select("*").single();
    if (error) throw error;
    sendJson(response, 201, { [resource.singleKey]: data, ...safetyBoundaryPayload() });
    return true;
  }

  if (request.method === "PATCH" || request.method === "PUT") {
    const body = parseBody(request);
    const id = body.id || getQueryId(request);
    if (!id) {
      sendJson(response, 400, { error: "id is required." });
      return true;
    }
    const input = resource.sanitize(body[resource.bodyKey] || body, { partial: true });
    const { data, error } = await supabase.from(resource.table).update(input).eq("id", id).select("*").single();
    if (error) throw error;
    sendJson(response, 200, { [resource.singleKey]: data, ...safetyBoundaryPayload() });
    return true;
  }

  response.setHeader("Allow", resource.methods);
  sendJson(response, 405, { error: "Method not allowed" });
  return true;
}

function dashboardAsArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === null || value === undefined || value === "") return [];
  return [value];
}

function dashboardSafeText(value, fallback) {
  const text = String(value || "").trim();
  return text || fallback;
}

function dashboardTruncateText(value, fallback, maxLength = 180) {
  const text = dashboardSafeText(value, fallback);
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text;
}

function dashboardIsToday(value, now = new Date()) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return (
    date.getUTCFullYear() === now.getUTCFullYear() &&
    date.getUTCMonth() === now.getUTCMonth() &&
    date.getUTCDate() === now.getUTCDate()
  );
}

function dashboardIsDue(value, now = new Date()) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() <= now.getTime();
}

function dashboardHasMissingInfo(record, key = "missing_info") {
  return dashboardAsArray(record?.[key]).length > 0;
}

function dashboardHasHighRiskText(...values) {
  const text = values
    .flatMap((value) => dashboardAsArray(value))
    .map((value) => String(value || "").toLowerCase())
    .join(" ");
  return DASHBOARD_HIGH_RISK_TERMS.some((term) => text.includes(term.toLowerCase()));
}

function dashboardStatusNeedsReview(status) {
  const value = String(status || "").toUpperCase();
  return !value || value.includes("NEW") || value.includes("NEED") || value.includes("REVIEW") || value.includes("PENDING");
}

function dashboardRiskLabel(record, riskFields = []) {
  return dashboardHasHighRiskText(...riskFields.map((field) => record?.[field])) ? "高风险" : "待复核";
}

function dashboardQueueItem({ title, status, risk, summary, nextStep, disabledActions }) {
  return {
    title: dashboardTruncateText(title, "未命名记录", 120),
    status: dashboardSafeText(status, "待复核"),
    risk: dashboardSafeText(risk, "暂无风险等级"),
    summary: dashboardTruncateText(summary, "需要人工确认", 180),
    next_step: dashboardTruncateText(nextStep, "需要人工确认", 180),
    disabled_actions: disabledActions || DASHBOARD_DISABLED_ACTIONS,
  };
}

async function dashboardReadSource({ supabase, table, select, order = "created_at", warning, warnings }) {
  try {
    let query = supabase.from(table).select(select).limit(DASHBOARD_SOURCE_LIMIT);
    if (order) query = query.order(order, { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch {
    warnings.push(warning);
    return [];
  }
}

function buildDashboardSummaryCards({ inquiries, customers, aiAnalyses, capabilities, followUps }, now = new Date()) {
  const newInquiries = inquiries.filter((record) => dashboardIsToday(record.created_at, now)).length;
  const missingInquiryCount = inquiries.filter((record) => dashboardHasMissingInfo(record, "missing_info")).length;
  const missingAiCount = aiAnalyses.filter((record) => dashboardHasMissingInfo(record, "missing_information")).length;
  const highRiskInquiryCount = inquiries.filter((record) =>
    dashboardHasHighRiskText(record.status, record.title, record.ai_summary, record.recommended_next_action)
  ).length;
  const highRiskAiCount = aiAnalyses.filter((record) => dashboardHasHighRiskText(record.risk_flags)).length;
  const aiPending = aiAnalyses.filter((record) => record.approval_required !== false).length;
  const dueFollowUps = followUps.filter((record) =>
    dashboardStatusNeedsReview(record.status) &&
    (dashboardIsDue(record.next_follow_up_at, now) || dashboardIsDue(record.due_date, now))
  ).length;
  const customersNeedingReview = customers.filter((record) => dashboardStatusNeedsReview(record.stage || record.status)).length;

  return {
    new_inquiries: {
      label: "新询盘",
      value: newInquiries,
      note: "今日新增待查看询盘",
    },
    needs_review: {
      label: "需要人工复核",
      value: inquiries.filter((record) => dashboardStatusNeedsReview(record.status)).length + customersNeedingReview + aiPending,
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

function buildDashboardInquiryQueue(inquiries) {
  return inquiries
    .filter((record) => dashboardStatusNeedsReview(record.status) || dashboardHasMissingInfo(record, "missing_info"))
    .slice(0, DASHBOARD_QUEUE_LIMIT)
    .map((record) =>
      dashboardQueueItem({
        title: record.title,
        status: record.status,
        risk: dashboardRiskLabel(record, ["status", "title", "ai_summary", "recommended_next_action"]),
        summary: record.ai_summary || record.project_description || record.title,
        nextStep: record.recommended_next_action || "先补齐关键信息，再由人工决定下一步",
        disabledActions: ["send", "quote", "generate_pi", "confirm_order"],
      })
    );
}

function buildDashboardCustomerQueue(customers) {
  return customers
    .filter((record) => dashboardStatusNeedsReview(record.stage || record.status) || dashboardIsDue(record.next_follow_up_at))
    .slice(0, DASHBOARD_QUEUE_LIMIT)
    .map((record) =>
      dashboardQueueItem({
        title: record.name || record.contact_name || "未命名客户",
        status: record.stage || record.status || "待复核",
        risk: "待复核",
        summary: record.summary || record.notes || "客户状态需要人工确认",
        nextStep: dashboardIsDue(record.next_follow_up_at) ? "人工确认是否需要跟进客户" : "人工查看客户阶段和最近需求",
        disabledActions: ["send", "create_task", "approve"],
      })
    );
}

function buildDashboardAiReviewQueue(aiAnalyses) {
  return aiAnalyses
    .filter((record) =>
      record.approval_required !== false ||
      dashboardHasMissingInfo(record, "missing_information") ||
      dashboardHasHighRiskText(record.risk_flags)
    )
    .slice(0, DASHBOARD_QUEUE_LIMIT)
    .map((record) =>
      dashboardQueueItem({
        title: `AI 询盘分析 ${dashboardSafeText(record.detected_business_line, "UNKNOWN")}`,
        status: record.approval_required === false ? "仅展示" : "需要人工复核",
        risk: dashboardRiskLabel(record, ["risk_flags"]),
        summary: dashboardAsArray(record.missing_information).length
          ? `缺失信息：${dashboardAsArray(record.missing_information).slice(0, 4).join("、")}`
          : "AI 分析记录需要人工确认后才能使用",
        nextStep: "人工复核 AI 建议，不自动发送、不自动审批",
        disabledActions: ["send", "approve", "reject", "quote", "generate_pi"],
      })
    );
}

function buildDashboardCapabilityQueue(capabilities) {
  return capabilities.slice(0, DASHBOARD_QUEUE_LIMIT).map((record) =>
    dashboardQueueItem({
      title: record.equipment || record.capability_line || "制造能力记录",
      status: "只读能力参考",
      risk: "需人工确认",
      summary: record.public_description || record.monthly_capacity || "制造能力仅供人工参考",
      nextStep: "人工核实产能、设备、规格和供应商反馈",
      disabledActions: ["quote", "confirm_order", "confirm_production", "confirm_shipment"],
    })
  );
}

function buildDashboardPreQuotationQueue(inquiries) {
  return inquiries
    .filter((record) =>
      dashboardHasMissingInfo(record, "missing_info") ||
      dashboardHasHighRiskText(record.ai_summary, record.recommended_next_action, record.status)
    )
    .slice(0, DASHBOARD_QUEUE_LIMIT)
    .map((record) =>
      dashboardQueueItem({
        title: record.title,
        status: "报价前复核",
        risk: dashboardRiskLabel(record, ["status", "ai_summary", "recommended_next_action"]),
        summary: record.ai_summary || record.project_description || "报价前需要人工复核资料",
        nextStep: record.recommended_next_action || "人工确认图纸、规格、数量、交期和供应商信息后再报价",
        disabledActions: ["quote", "generate_pi", "confirm_order", "confirm_payment"],
      })
    );
}

function buildDashboardWorkflowQueues({ inquiries, customers, aiAnalyses, capabilities }) {
  return {
    inquiry_queue: buildDashboardInquiryQueue(inquiries),
    customer_queue: buildDashboardCustomerQueue(customers),
    ai_review_queue: buildDashboardAiReviewQueue(aiAnalyses),
    supplier_capability_queue: buildDashboardCapabilityQueue(capabilities),
    pre_quotation_queue: buildDashboardPreQuotationQueue(inquiries),
  };
}

async function handleDashboardSummary(request, response, supabase) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    sendJson(response, 405, { error: "Method not allowed" });
    return true;
  }

  const warnings = [];
  const [inquiries, customers, aiAnalyses, capabilities, followUps] = await Promise.all([
    dashboardReadSource({
      supabase,
      table: "inquiries",
      select:
        "id,title,status,business_line,project_description,ai_summary,missing_info,recommended_next_action,next_follow_up_at,created_at,updated_at",
      warning: "inquiries_unavailable",
      warnings,
    }),
    dashboardReadSource({
      supabase,
      table: "customers",
      select: "id,name,contact_name,status,stage,summary,notes,business_line,last_contact_at,next_follow_up_at,created_at,updated_at",
      warning: "customers_unavailable",
      warnings,
    }),
    dashboardReadSource({
      supabase,
      table: "ai_inquiry_analyses",
      select: "id,inquiry_id,detected_business_line,missing_information,risk_flags,approval_required,created_at",
      warning: "ai_inquiry_analyses_unavailable",
      warnings,
    }),
    dashboardReadSource({
      supabase,
      table: "manufacturing_capabilities",
      select: "id,capability_line,equipment,quantity,max_length,monthly_capacity,public_description,created_at,updated_at",
      warning: "manufacturing_capabilities_unavailable",
      warnings,
    }),
    dashboardReadSource({
      supabase,
      table: "follow_up_tasks",
      select: "id,title,status,priority,due_date,next_follow_up_at,manual_review_required,created_at,updated_at",
      warning: "follow_up_tasks_unavailable",
      warnings,
    }),
  ]);

  sendJson(response, 200, {
    meta: {
      generated_at: new Date().toISOString(),
      source: "read_only_api",
      is_fallback: false,
    },
    summary_cards: buildDashboardSummaryCards({ inquiries, customers, aiAnalyses, capabilities, followUps }),
    workflow_queues: buildDashboardWorkflowQueues({ inquiries, customers, aiAnalyses, capabilities }),
    safety: {
      human_review_required: true,
      disabled_actions: [...DASHBOARD_DISABLED_ACTIONS],
    },
    warnings,
  });
  return true;
}

module.exports = async function handler(request, response) {
  try {
    const crmResource = getCrmResource(request);
    if (isReadOnlyResource(crmResource) && request.method !== "GET") {
      response.setHeader("Allow", "GET");
      sendJson(response, 405, { error: "Method not allowed" });
      return;
    }

    const supabase = getSupabaseClient(request);
    if (crmResource === DASHBOARD_SUMMARY_RESOURCE) {
      await handleDashboardSummary(request, response, supabase);
      return;
    }

    if (crmResource && (await handleCrmResource(request, response, supabase, crmResource))) {
      return;
    }

    if (request.method !== "GET") {
      response.setHeader("Allow", "GET");
      sendJson(response, 405, { error: "Method not allowed" });
      return;
    }

    const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    sendJson(response, 200, { customers: data || [] });
  } catch (error) {
    handleApiError(response, error);
  }
};
