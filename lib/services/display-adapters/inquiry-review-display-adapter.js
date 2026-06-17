const {
  aiDraftReviewDisplayAdapter,
} = require("./ai-draft-review-display-adapter");
const {
  communicationReviewDisplayAdapter,
} = require("./communication-review-display-adapter");

const TITLE = "询盘复核";
const SUBTITLE = "只读询盘复核摘要，不代表可发送、报价、生成 PI、下单、生产或发货。";
const FALLBACK_SUBTITLE = "未找到可用的询盘复核摘要。";
const FALLBACK_OPERATOR_ACTION = "请人工复核后再决定下一步询盘处理。";
const HELPER_REFERENCE_TEXT = "not executed by display adapter";

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function safeArray(value) {
  return Array.isArray(value) ? [...value] : [];
}

function booleanText(value) {
  return value ? "是" : "否";
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== "";
}

function copyValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => copyValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, copyValue(nestedValue)])
    );
  }

  return value;
}

function isValidReviewSummary(value) {
  const summary = safeObject(value);

  return Boolean(
    summary.normalized_inquiry ||
      summary.communication_review_summary ||
      summary.ai_draft_review_summary ||
      summary.missing_information ||
      summary.risk_flags ||
      summary.review_required !== undefined ||
      summary.inquiry_only === true
  );
}

function buildFallbackViewModel() {
  return {
    title: TITLE,
    subtitle: FALLBACK_SUBTITLE,
    badges: [
      { label: "不可用", tone: "warning" },
      { label: "不可发送", tone: "warning" },
      { label: "不可报价", tone: "warning" },
      { label: "不可生成 PI", tone: "warning" },
      { label: "不可下单", tone: "warning" },
      { label: "不可生产", tone: "warning" },
      { label: "不可发货", tone: "warning" },
    ],
    summaryRows: [],
    warningRows: [
      { label: "提示", value: "请检查 reviewSummary 输入。" },
    ],
    safetyRows: [],
    missingInfoRows: [],
    riskFlagRows: [],
    nestedReviewModels: [],
    disabledCapabilities: [
      { label: "已禁用能力", key: "can_send", value: "否" },
      { label: "已禁用能力", key: "can_create_quote", value: "否" },
      { label: "已禁用能力", key: "can_create_pi", value: "否" },
      { label: "已禁用能力", key: "can_create_order", value: "否" },
      { label: "已禁用能力", key: "can_trigger_production", value: "否" },
      { label: "已禁用能力", key: "can_trigger_shipment", value: "否" },
    ],
    recommendedOperatorAction: FALLBACK_OPERATOR_ACTION,
    technicalDetails: {
      helperReference: HELPER_REFERENCE_TEXT,
    },
    rawReference: null,
  };
}

function buildBadges(summary) {
  const badges = [
    { label: summary.inquiry_only === true ? "仅询盘复核" : "询盘状态未确认", tone: "neutral" },
    { label: "不可发送", tone: "warning" },
    { label: "不可报价", tone: "warning" },
    { label: "不可生成 PI", tone: "warning" },
    { label: "不可下单", tone: "warning" },
    { label: "不可生产", tone: "warning" },
    { label: "不可发货", tone: "warning" },
  ];

  if (summary.review_required) {
    badges.push({ label: "需要复核", tone: "warning" });
  }

  if (summary.needs_human_review) {
    badges.push({ label: "需要人工复核", tone: "warning" });
  }

  return badges;
}

function buildSummaryRows(summary) {
  const normalizedInquiry = safeObject(summary.normalized_inquiry);
  const rowConfig = [
    ["inquiry_type", "询盘类型"],
    ["project_type", "项目类型"],
    ["customer_name", "客户"],
    ["company_name", "公司"],
    ["business_line", "业务线"],
    ["product_category", "产品分类"],
    ["status", "状态"],
  ];

  return rowConfig
    .filter(([key]) => hasValue(normalizedInquiry[key]))
    .map(([key, label]) => ({
      label,
      key,
      value: String(normalizedInquiry[key]),
    }));
}

function buildWarningRows(summary) {
  return safeArray(summary.warnings).map((warning) => ({
    label: "警告",
    value: String(warning),
  }));
}

function buildSafetyRows(summary) {
  return [
    {
      label: "仅询盘复核",
      key: "inquiry_only",
      value: booleanText(summary.inquiry_only === true),
    },
    { label: "可发送", key: "can_send", value: booleanText(summary.can_send === true) },
    {
      label: "可创建报价",
      key: "can_create_quote",
      value: booleanText(summary.can_create_quote === true),
    },
    {
      label: "可生成 PI",
      key: "can_create_pi",
      value: booleanText(summary.can_create_pi === true),
    },
    {
      label: "可创建订单",
      key: "can_create_order",
      value: booleanText(summary.can_create_order === true),
    },
    {
      label: "可触发生产",
      key: "can_trigger_production",
      value: booleanText(summary.can_trigger_production === true),
    },
    {
      label: "可触发发货",
      key: "can_trigger_shipment",
      value: booleanText(summary.can_trigger_shipment === true),
    },
    { label: "需要复核", key: "review_required", value: booleanText(Boolean(summary.review_required)) },
    {
      label: "需要人工复核",
      key: "needs_human_review",
      value: booleanText(Boolean(summary.needs_human_review)),
    },
  ];
}

function buildDetailRows(value, label) {
  if (Array.isArray(value)) {
    return value.map((item, index) => ({
      label,
      key: String(index),
      value: String(item),
    }));
  }

  if (value && typeof value === "object") {
    return Object.entries(value).map(([key, item]) => ({
      label,
      key,
      value: String(item),
    }));
  }

  if (hasValue(value)) {
    return [{ label, key: null, value: String(value) }];
  }

  return [];
}

function buildNestedReviewModels(summary) {
  const nestedModels = [];
  const communicationSummary = safeObject(summary.communication_review_summary);
  const aiDraftSummary = safeObject(summary.ai_draft_review_summary);

  if (Object.keys(communicationSummary).length > 0) {
    nestedModels.push({
      source: "communication_review_summary",
      ...communicationReviewDisplayAdapter(communicationSummary),
    });
  }

  if (Object.keys(aiDraftSummary).length > 0) {
    nestedModels.push({
      source: "ai_draft_review_summary",
      ...aiDraftReviewDisplayAdapter(aiDraftSummary),
    });
  }

  return nestedModels;
}

function buildDisabledCapabilities(summary) {
  return [
    ["can_send", summary.can_send],
    ["can_create_quote", summary.can_create_quote],
    ["can_create_pi", summary.can_create_pi],
    ["can_create_order", summary.can_create_order],
    ["can_trigger_production", summary.can_trigger_production],
    ["can_trigger_shipment", summary.can_trigger_shipment],
  ]
    .filter(([, value]) => value === false)
    .map(([key]) => ({
      label: "已禁用能力",
      key,
      value: "否",
    }));
}

function buildTechnicalDetails(summary) {
  return {
    inquiry_only: summary.inquiry_only === true,
    review_required: Boolean(summary.review_required),
    needs_human_review: Boolean(summary.needs_human_review),
    can_send: summary.can_send === true,
    can_create_quote: summary.can_create_quote === true,
    can_create_pi: summary.can_create_pi === true,
    can_create_order: summary.can_create_order === true,
    can_trigger_production: summary.can_trigger_production === true,
    can_trigger_shipment: summary.can_trigger_shipment === true,
    has_communication_review_summary: Object.keys(safeObject(summary.communication_review_summary)).length > 0,
    has_ai_draft_review_summary: Object.keys(safeObject(summary.ai_draft_review_summary)).length > 0,
    helperReference: HELPER_REFERENCE_TEXT,
  };
}

function buildRawReference(summary) {
  return {
    normalized_inquiry: { ...safeObject(summary.normalized_inquiry) },
    missing_information: copyValue(summary.missing_information),
    risk_flags: copyValue(summary.risk_flags),
    review_required: Boolean(summary.review_required),
    needs_human_review: Boolean(summary.needs_human_review),
    inquiry_only: summary.inquiry_only === true,
    can_send: summary.can_send === true,
    can_create_quote: summary.can_create_quote === true,
    can_create_pi: summary.can_create_pi === true,
    can_create_order: summary.can_create_order === true,
    can_trigger_production: summary.can_trigger_production === true,
    can_trigger_shipment: summary.can_trigger_shipment === true,
    has_communication_review_summary: Object.keys(safeObject(summary.communication_review_summary)).length > 0,
    has_ai_draft_review_summary: Object.keys(safeObject(summary.ai_draft_review_summary)).length > 0,
    helperReference: HELPER_REFERENCE_TEXT,
  };
}

function inquiryReviewDisplayAdapter(reviewSummary = {}) {
  if (!isValidReviewSummary(reviewSummary)) {
    return buildFallbackViewModel();
  }

  const summary = safeObject(reviewSummary);

  return {
    title: TITLE,
    subtitle: SUBTITLE,
    badges: buildBadges(summary),
    summaryRows: buildSummaryRows(summary),
    warningRows: buildWarningRows(summary),
    safetyRows: buildSafetyRows(summary),
    missingInfoRows: buildDetailRows(summary.missing_information, "缺失信息"),
    riskFlagRows: buildDetailRows(summary.risk_flags, "风险标记"),
    nestedReviewModels: buildNestedReviewModels(summary),
    disabledCapabilities: buildDisabledCapabilities(summary),
    recommendedOperatorAction: summary.recommended_operator_action || FALLBACK_OPERATOR_ACTION,
    technicalDetails: buildTechnicalDetails(summary),
    rawReference: buildRawReference(summary),
  };
}

module.exports = {
  inquiryReviewDisplayAdapter,
};
