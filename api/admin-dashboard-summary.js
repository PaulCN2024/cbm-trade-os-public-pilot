const { getSupabaseClient, handleApiError, sendJson } = require("./_supabase");

const DISABLED_ACTIONS = Object.freeze([
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

const HIGH_RISK_TERMS = Object.freeze([
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

const SOURCE_LIMIT = 80;
const QUEUE_LIMIT = 5;

function asArray(value) {
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
  return asArray(record?.[key]).length > 0;
}

function hasHighRiskText(...values) {
  const text = values
    .flatMap((value) => asArray(value))
    .map((value) => String(value || "").toLowerCase())
    .join(" ");
  return HIGH_RISK_TERMS.some((term) => text.includes(term.toLowerCase()));
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
    disabled_actions: disabledActions || DISABLED_ACTIONS,
  };
}

async function readSource({ supabase, table, select, order = "created_at", warning, warnings }) {
  try {
    let query = supabase.from(table).select(select).limit(SOURCE_LIMIT);
    if (order) query = query.order(order, { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch {
    warnings.push(warning);
    return [];
  }
}

function buildSummaryCards({ inquiries, customers, aiAnalyses, capabilities, followUps }, now = new Date()) {
  const newInquiries = inquiries.filter((record) => isToday(record.created_at, now)).length;
  const missingInquiryCount = inquiries.filter((record) => hasMissingInfo(record, "missing_info")).length;
  const missingAiCount = aiAnalyses.filter((record) => hasMissingInfo(record, "missing_information")).length;
  const highRiskInquiryCount = inquiries.filter((record) =>
    hasHighRiskText(record.status, record.title, record.ai_summary, record.recommended_next_action)
  ).length;
  const highRiskAiCount = aiAnalyses.filter((record) => hasHighRiskText(record.risk_flags)).length;
  const aiPending = aiAnalyses.filter((record) => record.approval_required !== false).length;
  const dueFollowUps = followUps.filter((record) => statusNeedsReview(record.status) && (isDue(record.next_follow_up_at, now) || isDue(record.due_date, now))).length;
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

function buildInquiryQueue(inquiries) {
  return inquiries
    .filter((record) => statusNeedsReview(record.status) || hasMissingInfo(record, "missing_info"))
    .slice(0, QUEUE_LIMIT)
    .map((record) =>
      queueItem({
        title: record.title,
        status: record.status,
        risk: riskLabel(record, ["status", "title", "ai_summary", "recommended_next_action"]),
        summary: record.ai_summary || record.project_description || record.title,
        nextStep: record.recommended_next_action || "先补齐关键信息，再由人工决定下一步",
        disabledActions: ["send", "quote", "generate_pi", "confirm_order"],
      })
    );
}

function buildCustomerQueue(customers) {
  return customers
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
    );
}

function buildAiReviewQueue(aiAnalyses) {
  return aiAnalyses
    .filter((record) => record.approval_required !== false || hasMissingInfo(record, "missing_information") || hasHighRiskText(record.risk_flags))
    .slice(0, QUEUE_LIMIT)
    .map((record) =>
      queueItem({
        title: `AI 询盘分析 ${safeText(record.detected_business_line, "UNKNOWN")}`,
        status: record.approval_required === false ? "仅展示" : "需要人工复核",
        risk: riskLabel(record, ["risk_flags"]),
        summary: asArray(record.missing_information).length
          ? `缺失信息：${asArray(record.missing_information).slice(0, 4).join("、")}`
          : "AI 分析记录需要人工确认后才能使用",
        nextStep: "人工复核 AI 建议，不自动发送、不自动审批",
        disabledActions: ["send", "approve", "reject", "quote", "generate_pi"],
      })
    );
}

function buildCapabilityQueue(capabilities) {
  return capabilities.slice(0, QUEUE_LIMIT).map((record) =>
    queueItem({
      title: record.equipment || record.capability_line || "制造能力记录",
      status: "只读能力参考",
      risk: "需人工确认",
      summary: record.public_description || record.monthly_capacity || "制造能力仅供人工参考",
      nextStep: "人工核实产能、设备、规格和供应商反馈",
      disabledActions: ["quote", "confirm_order", "confirm_production", "confirm_shipment"],
    })
  );
}

function buildPreQuotationQueue(inquiries) {
  return inquiries
    .filter((record) => hasMissingInfo(record, "missing_info") || hasHighRiskText(record.ai_summary, record.recommended_next_action, record.status))
    .slice(0, QUEUE_LIMIT)
    .map((record) =>
      queueItem({
        title: record.title,
        status: "报价前复核",
        risk: riskLabel(record, ["status", "ai_summary", "recommended_next_action"]),
        summary: record.ai_summary || record.project_description || "报价前需要人工复核资料",
        nextStep: record.recommended_next_action || "人工确认图纸、规格、数量、交期和供应商信息后再报价",
        disabledActions: ["quote", "generate_pi", "confirm_order", "confirm_payment"],
      })
    );
}

function buildWorkflowQueues({ inquiries, customers, aiAnalyses, capabilities }) {
  return {
    inquiry_queue: buildInquiryQueue(inquiries),
    customer_queue: buildCustomerQueue(customers),
    ai_review_queue: buildAiReviewQueue(aiAnalyses),
    supplier_capability_queue: buildCapabilityQueue(capabilities),
    pre_quotation_queue: buildPreQuotationQueue(inquiries),
  };
}

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const supabase = getSupabaseClient(request);
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
      }),
    ]);

    sendJson(response, 200, {
      meta: {
        generated_at: new Date().toISOString(),
        source: "read_only_api",
        is_fallback: false,
      },
      summary_cards: buildSummaryCards({ inquiries, customers, aiAnalyses, capabilities, followUps }),
      workflow_queues: buildWorkflowQueues({ inquiries, customers, aiAnalyses, capabilities }),
      safety: {
        human_review_required: true,
        disabled_actions: [...DISABLED_ACTIONS],
      },
      warnings,
    });
  } catch (error) {
    handleApiError(response, error);
  }
};
