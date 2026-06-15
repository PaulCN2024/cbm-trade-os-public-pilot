const { normalizeAiDraftInput } = require("./normalize-ai-draft-input");

const SENSITIVE_TOPIC_RULES = Object.freeze([
  ["price_related", /\b(price|quotation amount|discount|offer|unit price|total amount|fob|cif)\b/],
  ["delivery_related", /\b(delivery|lead time|shipment date|eta|delay)\b/],
  ["payment_related", /\b(payment|deposit|balance|t\/t|tt|lc|l\/c|bank transfer)\b/],
  ["compensation_related", /\b(compensation|refund|claim|penalty)\b/],
  ["quality_related", /\b(quality|defect|complaint|responsibility|warranty)\b/],
  ["order_related", /\b(order confirmation|confirm order|purchase order|po\b)\b/],
  ["quotation_related", /\b(quotation|quote|offer sheet)\b/],
  ["pi_related", /\b(pi|proforma invoice)\b/],
  ["external_message_related", /\b(send|email|whatsapp|customer reply|supplier message)\b/],
  ["permission_related", /\b(permission|role|user access|admin)\b/],
  ["finance_related", /\b(profit|margin|commission|salary|payroll|payment status)\b/],
]);

const BLOCKED_FLAGS = Object.freeze(["permission_related", "finance_related"]);
const HIGH_REVIEW_FLAGS = Object.freeze([
  "price_related",
  "delivery_related",
  "payment_related",
  "compensation_related",
  "quality_related",
  "order_related",
  "quotation_related",
  "pi_related",
  "external_message_related",
]);

function toSearchText(value) {
  return typeof value === "string" ? value.trim().toLowerCase().replace(/[_-]+/g, " ") : "";
}

function collectSearchText(input = {}) {
  const source = input && typeof input === "object" ? input : {};
  return [
    source.title,
    source.subject,
    source.body,
    source.content,
    source.text,
    source.action_type,
    source.target_channel,
  ]
    .map(toSearchText)
    .filter(Boolean)
    .join(" ");
}

function detectAiDraftSensitiveTopics(input = {}) {
  const combinedText = collectSearchText(input);
  const sensitivityFlags = {};
  const warnings = [];

  for (const [flagName, pattern] of SENSITIVE_TOPIC_RULES) {
    sensitivityFlags[flagName] = pattern.test(combinedText);
  }

  const needsHumanReview = Object.values(sensitivityFlags).some(Boolean);
  if (needsHumanReview) {
    warnings.push("sensitive AI draft topics detected; human review required");
  }

  return {
    sensitivity_flags: sensitivityFlags,
    warnings,
    needs_human_review: needsHumanReview,
  };
}

function classifyAiDraftActionBoundary(input = {}) {
  const sensitivity = input.sensitivity_flags
    ? { sensitivity_flags: input.sensitivity_flags }
    : detectAiDraftSensitiveTopics(input);
  const flags = sensitivity.sensitivity_flags || {};
  const blockedReasons = [];
  const warnings = [];

  for (const flagName of BLOCKED_FLAGS) {
    if (flags[flagName]) {
      blockedReasons.push(flagName);
    }
  }

  if (blockedReasons.length > 0) {
    warnings.push("blocked AI draft topic detected");
    return {
      risk_level: "blocked",
      action_boundary: "blocked",
      approval_required: true,
      blocked_reasons: blockedReasons,
      warnings,
    };
  }

  const hasHighReviewFlag = HIGH_REVIEW_FLAGS.some((flagName) => flags[flagName]);
  if (hasHighReviewFlag) {
    warnings.push("high-risk AI draft topic detected; review required");
    return {
      risk_level: "high",
      action_boundary: "review_required",
      approval_required: true,
      blocked_reasons: blockedReasons,
      warnings,
    };
  }

  return {
    risk_level: "low",
    action_boundary: "auto_allowed",
    approval_required: false,
    blocked_reasons: blockedReasons,
    warnings,
  };
}

function classifyAiDraftSafety(input = {}) {
  const source = input && typeof input === "object" ? input : {};
  const normalized = normalizeAiDraftInput(source);
  const sensitivity = detectAiDraftSensitiveTopics(source);
  const safetyClassification = classifyAiDraftActionBoundary({
    ...source,
    sensitivity_flags: sensitivity.sensitivity_flags,
  });

  const warnings = [
    ...normalized.warnings,
    ...sensitivity.warnings,
    ...safetyClassification.warnings,
  ];

  const needsHumanReview =
    normalized.needs_human_review ||
    sensitivity.needs_human_review ||
    safetyClassification.action_boundary === "blocked";

  const approvalRequired =
    normalized.approval_required ||
    sensitivity.needs_human_review ||
    safetyClassification.approval_required;

  return {
    normalized_input: normalized.normalized_input,
    sensitivity,
    safety_classification: safetyClassification,
    warnings,
    needs_human_review: needsHumanReview,
    approval_required: approvalRequired,
  };
}

module.exports = {
  detectAiDraftSensitiveTopics,
  classifyAiDraftActionBoundary,
  classifyAiDraftSafety,
};
