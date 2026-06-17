const {
  ATTACHMENT_TYPE_LABELS_ZH,
  COMMUNICATION_CHANNEL_LABELS_ZH,
  COMMUNICATION_DIRECTION_LABELS_ZH,
} = require("../ui-labels");

const TITLE = "沟通复核";
const SUBTITLE = "只读沟通复核摘要，不代表可发送、自动回复或创建任务。";
const FALLBACK_SUBTITLE = "未找到可用的沟通复核摘要。";
const FALLBACK_OPERATOR_ACTION = "请人工复核后再决定下一步沟通处理。";
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
    summary.normalized_communication ||
      summary.classification ||
      summary.attachment_summary ||
      summary.direction ||
      summary.channel ||
      summary.communication_only === true
  );
}

function buildFallbackViewModel() {
  return {
    title: TITLE,
    subtitle: FALLBACK_SUBTITLE,
    badges: [
      { label: "不可用", tone: "warning" },
      { label: "不可发送", tone: "warning" },
      { label: "不可自动回复", tone: "warning" },
      { label: "不可创建任务", tone: "warning" },
    ],
    summaryRows: [],
    warningRows: [
      { label: "提示", value: "请检查 reviewSummary 输入。" },
    ],
    safetyRows: [],
    attachmentRows: [],
    disabledCapabilities: [
      { label: "已禁用能力", key: "can_send", value: "否" },
      { label: "已禁用能力", key: "can_auto_reply", value: "否" },
      { label: "已禁用能力", key: "can_create_task", value: "否" },
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
    { label: summary.communication_only === true ? "仅沟通复核" : "沟通状态未确认", tone: "neutral" },
    { label: "不可发送", tone: "warning" },
    { label: "不可自动回复", tone: "warning" },
    { label: "不可创建任务", tone: "warning" },
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
  return [
    {
      label: "方向",
      value: labelFrom(COMMUNICATION_DIRECTION_LABELS_ZH, summary.direction),
      key: summary.direction || null,
    },
    {
      label: "渠道",
      value: labelFrom(COMMUNICATION_CHANNEL_LABELS_ZH, summary.channel),
      key: summary.channel || null,
    },
    { label: "可见性", value: summary.visibility || "unknown", key: summary.visibility || null },
    { label: "状态", value: summary.status || "unknown", key: summary.status || null },
    { label: "是否需要复核", value: booleanText(Boolean(summary.review_required)) },
    { label: "是否需要人工复核", value: booleanText(Boolean(summary.needs_human_review)) },
  ];
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
      label: "仅沟通复核",
      key: "communication_only",
      value: booleanText(summary.communication_only === true),
    },
    { label: "可发送", key: "can_send", value: booleanText(summary.can_send === true) },
    {
      label: "可自动回复",
      key: "can_auto_reply",
      value: booleanText(summary.can_auto_reply === true),
    },
    {
      label: "可创建任务",
      key: "can_create_task",
      value: booleanText(summary.can_create_task === true),
    },
    { label: "需要复核", key: "review_required", value: booleanText(Boolean(summary.review_required)) },
    {
      label: "需要人工复核",
      key: "needs_human_review",
      value: booleanText(Boolean(summary.needs_human_review)),
    },
  ];
}

function buildAttachmentRows(summary) {
  const attachmentSummary = safeObject(summary.attachment_summary);

  if (Object.keys(attachmentSummary).length === 0) {
    return [];
  }

  const rows = [
    {
      label: "附件类型",
      key: "attachment_type",
      value: labelFrom(ATTACHMENT_TYPE_LABELS_ZH, attachmentSummary.attachment_type),
      technicalValue: attachmentSummary.attachment_type || null,
    },
    {
      label: "置信度",
      key: "confidence",
      value: attachmentSummary.confidence !== undefined ? String(attachmentSummary.confidence) : "unknown",
    },
    {
      label: "需要人工复核",
      key: "needs_human_review",
      value: booleanText(Boolean(attachmentSummary.needs_human_review)),
    },
    {
      label: "需要复核",
      key: "requires_review",
      value: booleanText(Boolean(attachmentSummary.requires_review)),
    },
  ];

  safeArray(attachmentSummary.warnings).forEach((warning) => {
    rows.push({
      label: "附件警告",
      key: "warning",
      value: String(warning),
    });
  });

  return rows;
}

function buildDisabledCapabilities(summary) {
  return [
    ["can_send", summary.can_send],
    ["can_auto_reply", summary.can_auto_reply],
    ["can_create_task", summary.can_create_task],
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
    direction: summary.direction || null,
    channel: summary.channel || null,
    visibility: summary.visibility || null,
    status: summary.status || null,
    sensitivity_flags: { ...safeObject(summary.sensitivity_flags) },
    review_required: Boolean(summary.review_required),
    needs_human_review: Boolean(summary.needs_human_review),
    communication_only: summary.communication_only === true,
    can_send: summary.can_send === true,
    can_auto_reply: summary.can_auto_reply === true,
    can_create_task: summary.can_create_task === true,
    helperReference: HELPER_REFERENCE_TEXT,
  };
}

function buildRawReference(summary) {
  return {
    normalized_communication: { ...safeObject(summary.normalized_communication) },
    attachment_summary: {
      ...safeObject(summary.attachment_summary),
      warnings: safeArray(safeObject(summary.attachment_summary).warnings),
    },
    direction: summary.direction || null,
    channel: summary.channel || null,
    visibility: summary.visibility || null,
    status: summary.status || null,
    review_required: Boolean(summary.review_required),
    needs_human_review: Boolean(summary.needs_human_review),
    communication_only: summary.communication_only === true,
    can_send: summary.can_send === true,
    can_auto_reply: summary.can_auto_reply === true,
    can_create_task: summary.can_create_task === true,
    helperReference: HELPER_REFERENCE_TEXT,
  };
}

function communicationReviewDisplayAdapter(reviewSummary = {}) {
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
    attachmentRows: buildAttachmentRows(summary),
    disabledCapabilities: buildDisabledCapabilities(summary),
    recommendedOperatorAction: summary.recommended_operator_action || FALLBACK_OPERATOR_ACTION,
    technicalDetails: buildTechnicalDetails(summary),
    rawReference: buildRawReference(summary),
  };
}

module.exports = {
  communicationReviewDisplayAdapter,
};
