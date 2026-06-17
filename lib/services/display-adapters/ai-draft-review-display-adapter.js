const {
  AI_DRAFT_TYPE_LABELS_ZH,
  AI_TASK_TYPE_LABELS_ZH,
  AI_RISK_LEVEL_LABELS_ZH,
  AI_ACTION_BOUNDARY_LABELS_ZH,
} = require("../ui-labels");

const TITLE = "AI 草稿复核";
const SUBTITLE = "只读复核摘要，不代表可发送或可自动审批。";
const FALLBACK_SUBTITLE = "未找到可用的 AI 草稿复核摘要。";
const FALLBACK_OPERATOR_ACTION = "请人工复核后再决定下一步操作。";
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

function labelFrom(dictionary, key) {
  return key && dictionary[key] ? dictionary[key] : key || "unknown";
}

function isValidReviewSummary(value) {
  const summary = safeObject(value);

  return Boolean(
    summary.normalized_draft ||
      summary.safety_classification ||
      summary.risk_level ||
      summary.action_boundary ||
      summary.draft_only === true
  );
}

function buildFallbackViewModel() {
  return {
    title: TITLE,
    subtitle: FALLBACK_SUBTITLE,
    badges: [
      { label: "不可用", tone: "warning" },
      { label: "不可发送", tone: "warning" },
      { label: "不可自动审批", tone: "warning" },
    ],
    summaryRows: [],
    warningRows: [
      { label: "提示", value: "请检查 reviewSummary 输入。" },
    ],
    safetyRows: [],
    disabledCapabilities: [
      { label: "已禁用能力", key: "can_send", value: "否" },
      { label: "已禁用能力", key: "can_auto_approve", value: "否" },
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
    { label: summary.draft_only === true ? "仅草稿" : "草稿状态未确认", tone: "neutral" },
    { label: "不可发送", tone: "warning" },
    { label: "不可自动审批", tone: "warning" },
  ];

  if (summary.approval_required) {
    badges.push({ label: "需要人工审核", tone: "warning" });
  }

  if (summary.needs_human_review) {
    badges.push({ label: "需要人工复核", tone: "warning" });
  }

  if (summary.risk_level) {
    badges.push({
      label: labelFrom(AI_RISK_LEVEL_LABELS_ZH, summary.risk_level),
      tone: summary.risk_level === "low" ? "safe" : "warning",
    });
  }

  if (summary.action_boundary === "auto_allowed") {
    badges.push({ label: "仅限内部准备", tone: "neutral" });
  }

  if (summary.action_boundary === "blocked") {
    badges.push({ label: "已阻止", tone: "warning" });
  }

  return badges;
}

function buildSummaryRows(summary) {
  const normalizedDraft = safeObject(summary.normalized_draft);

  return [
    {
      label: "草稿类型",
      value: labelFrom(AI_DRAFT_TYPE_LABELS_ZH, normalizedDraft.draft_type),
      key: normalizedDraft.draft_type || null,
    },
    {
      label: "任务类型",
      value: labelFrom(AI_TASK_TYPE_LABELS_ZH, normalizedDraft.task_type),
      key: normalizedDraft.task_type || null,
    },
    {
      label: "风险等级",
      value: labelFrom(AI_RISK_LEVEL_LABELS_ZH, summary.risk_level),
      key: summary.risk_level || null,
    },
    {
      label: "动作边界",
      value: labelFrom(AI_ACTION_BOUNDARY_LABELS_ZH, summary.action_boundary),
      key: summary.action_boundary || null,
    },
    { label: "是否需要审核", value: booleanText(Boolean(summary.approval_required)) },
    { label: "是否需要人工复核", value: booleanText(Boolean(summary.needs_human_review)) },
  ];
}

function buildWarningRows(summary) {
  const warningRows = safeArray(summary.warnings).map((warning) => ({
    label: "警告",
    value: String(warning),
  }));

  if (summary.action_boundary === "auto_allowed") {
    warningRows.push({
      label: "提示",
      value: "auto_allowed 仅表示内部准备，不代表允许发送或自动审批。",
    });
  }

  return warningRows;
}

function buildSafetyRows(summary) {
  return [
    { label: "仅草稿", key: "draft_only", value: booleanText(summary.draft_only === true) },
    { label: "可发送", key: "can_send", value: booleanText(summary.can_send === true) },
    {
      label: "可自动审批",
      key: "can_auto_approve",
      value: booleanText(summary.can_auto_approve === true),
    },
    {
      label: "需要审核",
      key: "approval_required",
      value: booleanText(Boolean(summary.approval_required)),
    },
    {
      label: "需要人工复核",
      key: "needs_human_review",
      value: booleanText(Boolean(summary.needs_human_review)),
    },
  ];
}

function buildDisabledCapabilities(summary) {
  return [
    ["can_send", summary.can_send],
    ["can_auto_approve", summary.can_auto_approve],
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
    risk_level: summary.risk_level || null,
    action_boundary: summary.action_boundary || null,
    approval_required: Boolean(summary.approval_required),
    needs_human_review: Boolean(summary.needs_human_review),
    draft_only: summary.draft_only === true,
    can_send: summary.can_send === true,
    can_auto_approve: summary.can_auto_approve === true,
    sensitivity_flags: { ...safeObject(summary.sensitivity_flags) },
    helperReference: HELPER_REFERENCE_TEXT,
  };
}

function buildRawReference(summary) {
  return {
    normalized_draft: { ...safeObject(summary.normalized_draft) },
    risk_level: summary.risk_level || null,
    action_boundary: summary.action_boundary || null,
    approval_required: Boolean(summary.approval_required),
    needs_human_review: Boolean(summary.needs_human_review),
    draft_only: summary.draft_only === true,
    can_send: summary.can_send === true,
    can_auto_approve: summary.can_auto_approve === true,
    helperReference: HELPER_REFERENCE_TEXT,
  };
}

function aiDraftReviewDisplayAdapter(reviewSummary = {}) {
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
    disabledCapabilities: buildDisabledCapabilities(summary),
    recommendedOperatorAction: summary.recommended_operator_action || FALLBACK_OPERATOR_ACTION,
    technicalDetails: buildTechnicalDetails(summary),
    rawReference: buildRawReference(summary),
  };
}

module.exports = {
  aiDraftReviewDisplayAdapter,
};
