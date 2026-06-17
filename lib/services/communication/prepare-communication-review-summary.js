const { classifyCommunicationInput } = require("./classify-communication");
const { normalizeCommunicationInput } = require("./normalize-communication-input");

const REVIEW_ATTACHMENT_TYPES = Object.freeze([
  "drawing",
  "quotation",
  "supplier_quote",
  "pi",
  "invoice",
  "payment_slip",
  "product_spec",
  "certificate",
  "other",
]);

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function copyObject(value) {
  return { ...safeObject(value) };
}

function hasAttachmentReference(source) {
  return Boolean(source.attachment_name || source.file_name || source.attachment_type);
}

function isReviewAttachment(attachmentSummary, source) {
  if (!hasAttachmentReference(source)) {
    return false;
  }

  return (
    attachmentSummary.needs_human_review ||
    REVIEW_ATTACHMENT_TYPES.includes(attachmentSummary.attachment_type)
  );
}

function buildRecommendedOperatorAction(reviewRequired, sensitivityFlags, attachmentSummary) {
  const hasSensitiveTopic = Object.values(sensitivityFlags).some(Boolean);
  const hasReviewAttachment = Boolean(attachmentSummary && attachmentSummary.requires_review);

  if (reviewRequired && (hasSensitiveTopic || hasReviewAttachment)) {
    return "Review required before any customer or supplier response.";
  }

  if (reviewRequired) {
    return "Review communication internally before any external use.";
  }

  return "Communication only: safe for internal review, not for sending.";
}

function buildAuditNoteCandidate({
  normalizedCommunication,
  attachmentSummary,
  sensitivityFlags,
  reviewRequired,
  warningCount,
}) {
  return {
    direction: normalizedCommunication.direction,
    channel: normalizedCommunication.channel,
    visibility: normalizedCommunication.visibility,
    status: normalizedCommunication.status,
    attachment_type: attachmentSummary.attachment_type,
    sensitivity_flags: { ...sensitivityFlags },
    review_required: reviewRequired,
    warning_count: warningCount,
    communication_only: true,
    can_send: false,
    can_auto_reply: false,
    can_create_task: false,
  };
}

function prepareCommunicationReviewSummary(rawCommunicationInput, context = {}, options = {}) {
  const communicationSource = copyObject(rawCommunicationInput);
  const contextCopy = copyObject(context);
  const optionsCopy = copyObject(options);

  const normalized = normalizeCommunicationInput(communicationSource);
  const normalizedCommunication = { ...normalized.normalized_input };
  const classification = classifyCommunicationInput(normalizedCommunication);
  const attachmentClassification = classification.attachment_classification || {};
  const sensitivity = classification.sensitivity || {};
  const sensitivityFlags = { ...(sensitivity.sensitivity_flags || {}) };
  const attachmentRequiresReview = isReviewAttachment(attachmentClassification, communicationSource);
  const attachmentSummary = {
    attachment_type: attachmentClassification.attachment_type,
    confidence: attachmentClassification.confidence,
    warnings: [...(attachmentClassification.warnings || [])],
    needs_human_review: Boolean(attachmentClassification.needs_human_review),
    requires_review: attachmentRequiresReview,
  };
  const sensitiveCommunication = Object.values(sensitivityFlags).some(Boolean);
  const reviewRequired = Boolean(
    normalized.needs_human_review ||
    sensitiveCommunication ||
    attachmentRequiresReview,
  );
  const warnings = [
    ...(normalized.warnings || []),
    ...(classification.warnings || []),
  ];

  if (optionsCopy.review_note) {
    warnings.push("operator review note provided; keep as internal review context only");
  }

  const recommendedOperatorAction = buildRecommendedOperatorAction(
    reviewRequired,
    sensitivityFlags,
    attachmentSummary,
  );
  const auditNoteCandidate = buildAuditNoteCandidate({
    normalizedCommunication,
    attachmentSummary,
    sensitivityFlags,
    reviewRequired,
    warningCount: warnings.length,
  });

  return {
    normalized_communication: normalizedCommunication,
    classification,
    attachment_summary: attachmentSummary,
    sensitivity_flags: sensitivityFlags,
    direction: normalizedCommunication.direction,
    channel: normalizedCommunication.channel,
    visibility: normalizedCommunication.visibility,
    status: normalizedCommunication.status,
    warnings,
    needs_human_review: reviewRequired,
    review_required: reviewRequired,
    recommended_operator_action: recommendedOperatorAction,
    communication_only: true,
    can_send: false,
    can_auto_reply: false,
    can_create_task: false,
    audit_note_candidate: auditNoteCandidate,
    context: contextCopy,
  };
}

module.exports = {
  prepareCommunicationReviewSummary,
};
