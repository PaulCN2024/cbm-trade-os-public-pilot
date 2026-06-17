const { classifyAiDraftSafety } = require("./classify-ai-draft-safety");
const { normalizeAiDraftInput } = require("./normalize-ai-draft-input");

const RISK_RANK = Object.freeze({
  low: 1,
  medium: 2,
  high: 3,
  blocked: 4,
});

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function copyObject(value) {
  return { ...safeObject(value) };
}

function highestRisk(first, second) {
  const firstRank = RISK_RANK[first] || 0;
  const secondRank = RISK_RANK[second] || 0;
  return firstRank >= secondRank ? first : second;
}

function resolveActionBoundary(normalizedDraft, safetyClassification) {
  if (safetyClassification.action_boundary === "blocked" || normalizedDraft.action_boundary === "blocked") {
    return "blocked";
  }

  if (
    safetyClassification.action_boundary === "review_required" ||
    normalizedDraft.action_boundary === "review_required"
  ) {
    return "review_required";
  }

  return safetyClassification.action_boundary || normalizedDraft.action_boundary || "review_required";
}

function buildRecommendedOperatorAction(actionBoundary, approvalRequired) {
  if (actionBoundary === "blocked") {
    return "Blocked: do not use without senior approval.";
  }

  if (actionBoundary === "review_required") {
    return "Review internally before any external use.";
  }

  return "Draft only: safe for internal preparation, not for sending.";
}

function buildAuditNoteCandidate({
  normalizedDraft,
  safetyClassification,
  riskLevel,
  actionBoundary,
  approvalRequired,
  warningCount,
}) {
  return {
    draft_type: normalizedDraft.draft_type,
    task_type: normalizedDraft.task_type,
    risk_level: riskLevel,
    action_boundary: actionBoundary,
    approval_required: approvalRequired,
    blocked_reasons: safetyClassification.blocked_reasons || [],
    warning_count: warningCount,
    draft_only: true,
    can_send: false,
    can_auto_approve: false,
  };
}

function prepareAiDraftReviewSummary(rawDraftInput, context = {}, options = {}) {
  const draftSource = copyObject(rawDraftInput);
  const contextCopy = copyObject(context);
  const optionsCopy = copyObject(options);

  const normalized = normalizeAiDraftInput(draftSource);
  const normalizedDraft = { ...normalized.normalized_input };
  const safety = classifyAiDraftSafety(normalizedDraft);
  const safetyClassification = safety.safety_classification || {};
  const actionBoundary = resolveActionBoundary(normalizedDraft, safetyClassification);
  const riskLevel = highestRisk(normalizedDraft.risk_level, safetyClassification.risk_level);
  const approvalRequired =
    normalized.approval_required ||
    safety.approval_required ||
    actionBoundary === "review_required" ||
    actionBoundary === "blocked" ||
    ["medium", "high", "blocked"].includes(riskLevel);
  const needsHumanReview =
    approvalRequired ||
    safety.needs_human_review ||
    actionBoundary === "review_required" ||
    actionBoundary === "blocked" ||
    ["medium", "high", "blocked"].includes(riskLevel);
  const warnings = [
    ...normalized.warnings,
    ...safety.warnings,
  ];

  if (optionsCopy.review_note) {
    warnings.push("operator review note provided; keep as internal review context only");
  }

  const recommendedOperatorAction = buildRecommendedOperatorAction(actionBoundary, approvalRequired);
  const auditNoteCandidate = buildAuditNoteCandidate({
    normalizedDraft,
    safetyClassification,
    riskLevel,
    actionBoundary,
    approvalRequired,
    warningCount: warnings.length,
  });

  return {
    normalized_draft: normalizedDraft,
    safety_classification: safetyClassification,
    sensitivity_flags: safety.sensitivity?.sensitivity_flags || {},
    risk_level: riskLevel,
    action_boundary: actionBoundary,
    approval_required: approvalRequired,
    needs_human_review: needsHumanReview,
    warnings,
    recommended_operator_action: recommendedOperatorAction,
    draft_only: true,
    can_send: false,
    can_auto_approve: false,
    audit_note_candidate: auditNoteCandidate,
    context: contextCopy,
  };
}

module.exports = {
  prepareAiDraftReviewSummary,
};
