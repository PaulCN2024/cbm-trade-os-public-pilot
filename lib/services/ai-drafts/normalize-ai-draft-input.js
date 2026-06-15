const {
  AI_ACTION_BOUNDARY_TYPES,
  AI_DECISION_STATUSES,
  AI_DRAFT_TYPES,
  AI_RISK_LEVELS,
  AI_TASK_TYPES,
  APPROVAL_STATUSES,
  DEFAULT_AI_DRAFT_VALUES,
} = require("./ai-draft-constants");

const FALLBACK_AI_DRAFT_TYPE = "customer_reply_draft";
const FALLBACK_AI_TASK_TYPE = "communication_summary";

function normalizeDictionaryValue(value, dictionary, fallbackValue, fieldName) {
  const warnings = [];
  const normalizedValue = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (normalizedValue && Object.prototype.hasOwnProperty.call(dictionary, normalizedValue)) {
    return {
      value: normalizedValue,
      warnings,
      needs_human_review: false,
    };
  }

  const reason = normalizedValue ? "unknown" : "missing";
  warnings.push(`${fieldName} ${reason}; fallback used: ${fallbackValue}`);

  return {
    value: fallbackValue,
    warnings,
    needs_human_review: Boolean(normalizedValue),
  };
}

function normalizeAiDraftType(value) {
  return normalizeDictionaryValue(value, AI_DRAFT_TYPES, FALLBACK_AI_DRAFT_TYPE, "draft_type");
}

function normalizeAiTaskType(value) {
  return normalizeDictionaryValue(value, AI_TASK_TYPES, FALLBACK_AI_TASK_TYPE, "task_type");
}

function normalizeApprovalStatus(value) {
  return normalizeDictionaryValue(
    value,
    APPROVAL_STATUSES,
    DEFAULT_AI_DRAFT_VALUES.DEFAULT_APPROVAL_STATUS,
    "approval_status",
  );
}

function normalizeAiRiskLevel(value) {
  return normalizeDictionaryValue(
    value,
    AI_RISK_LEVELS,
    DEFAULT_AI_DRAFT_VALUES.DEFAULT_RISK_LEVEL,
    "risk_level",
  );
}

function normalizeAiDecisionStatus(value) {
  return normalizeDictionaryValue(
    value,
    AI_DECISION_STATUSES,
    DEFAULT_AI_DRAFT_VALUES.DEFAULT_DECISION_STATUS,
    "decision_status",
  );
}

function normalizeAiActionBoundary(value) {
  return normalizeDictionaryValue(
    value,
    AI_ACTION_BOUNDARY_TYPES,
    DEFAULT_AI_DRAFT_VALUES.DEFAULT_ACTION_BOUNDARY,
    "action_boundary",
  );
}

function isApprovalRequired(normalizedInput, helperNeedsHumanReview) {
  if (helperNeedsHumanReview) {
    return true;
  }

  if (["review_required", "blocked"].includes(normalizedInput.action_boundary)) {
    return true;
  }

  if (["medium", "high", "blocked"].includes(normalizedInput.risk_level)) {
    return true;
  }

  return true;
}

function normalizeAiDraftInput(input = {}) {
  const source = input && typeof input === "object" ? input : {};
  const normalizedInput = { ...source };

  const fields = [
    ["draft_type", normalizeAiDraftType(source.draft_type)],
    ["task_type", normalizeAiTaskType(source.task_type)],
    ["approval_status", normalizeApprovalStatus(source.approval_status)],
    ["risk_level", normalizeAiRiskLevel(source.risk_level)],
    ["decision_status", normalizeAiDecisionStatus(source.decision_status)],
    ["action_boundary", normalizeAiActionBoundary(source.action_boundary)],
  ];

  const warnings = [];
  let helperNeedsHumanReview = false;

  for (const [fieldName, result] of fields) {
    normalizedInput[fieldName] = result.value;
    warnings.push(...result.warnings);
    helperNeedsHumanReview = helperNeedsHumanReview || result.needs_human_review;
  }

  return {
    normalized_input: normalizedInput,
    warnings,
    needs_human_review: helperNeedsHumanReview,
    approval_required: isApprovalRequired(normalizedInput, helperNeedsHumanReview),
  };
}

module.exports = {
  normalizeAiDraftType,
  normalizeAiTaskType,
  normalizeApprovalStatus,
  normalizeAiRiskLevel,
  normalizeAiDecisionStatus,
  normalizeAiActionBoundary,
  normalizeAiDraftInput,
};
