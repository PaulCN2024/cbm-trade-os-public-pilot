const { prepareAiDraftReviewSummary } = require("../ai-drafts");
const { prepareCommunicationReviewSummary } = require("../communication");

const SAFE_INQUIRY_FIELDS = Object.freeze([
  "original_message",
  "message",
  "summary",
  "ai_summary",
  "title",
  "attachment_name",
  "file_name",
  "suggested_reply",
  "draft_content",
  "missing_information",
  "risk_flags",
  "customer_name",
  "company_name",
  "business_line",
  "product_category",
  "inquiry_type",
  "project_type",
  "status",
]);

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function copyObject(value) {
  return { ...safeObject(value) };
}

function compactArray(values) {
  return values.filter((value) => value !== undefined && value !== null && value !== "");
}

function hasContent(value) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (value && typeof value === "object") {
    return Object.keys(value).length > 0;
  }

  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

function pickFirstText(values) {
  const match = values.find((value) => typeof value === "string" && value.trim());
  return match ? match.trim() : undefined;
}

function buildNormalizedInquiry(source) {
  const normalizedInquiry = {};

  for (const fieldName of SAFE_INQUIRY_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(source, fieldName)) {
      normalizedInquiry[fieldName] = source[fieldName];
    }
  }

  return normalizedInquiry;
}

function buildCommunicationInput(source) {
  const body = pickFirstText([
    source.message,
    source.original_message,
    source.summary,
    source.title,
  ]);
  const communicationInput = {
    direction: source.direction,
    channel: source.channel || source.source,
    status: source.status,
    subject: source.title,
    body,
    attachment_name: source.attachment_name,
    file_name: source.file_name,
  };
  const hasCommunicationFields = compactArray([
    communicationInput.direction,
    communicationInput.channel,
    communicationInput.status,
    communicationInput.subject,
    communicationInput.body,
    communicationInput.attachment_name,
    communicationInput.file_name,
  ]).length > 0;

  return hasCommunicationFields ? communicationInput : null;
}

function buildAiDraftInput(source) {
  const content = pickFirstText([
    source.suggested_reply,
    source.draft_content,
    source.ai_summary,
    source.original_message,
  ]);

  if (!content) {
    return null;
  }

  return {
    draft_type: source.draft_type,
    task_type: source.task_type || "inquiry_analysis",
    title: source.title,
    content,
    text: content,
    risk_level: source.risk_level,
    action_boundary: source.action_boundary,
  };
}

function buildRecommendedOperatorAction(reviewRequired) {
  if (reviewRequired) {
    return "Review required before quotation, PI, order, production, shipment, or customer/supplier reply.";
  }

  return "Draft-only inquiry review: no send or business action is allowed.";
}

function buildAuditNoteCandidate({
  normalizedInquiry,
  communicationReviewSummary,
  aiDraftReviewSummary,
  missingInformation,
  riskFlags,
  reviewRequired,
  warningCount,
}) {
  return {
    inquiry_type: normalizedInquiry.inquiry_type,
    project_type: normalizedInquiry.project_type,
    business_line: normalizedInquiry.business_line,
    product_category: normalizedInquiry.product_category,
    status: normalizedInquiry.status,
    has_communication_review: Boolean(communicationReviewSummary),
    has_ai_draft_review: Boolean(aiDraftReviewSummary),
    missing_information: missingInformation,
    risk_flags: riskFlags,
    review_required: reviewRequired,
    warning_count: warningCount,
    inquiry_only: true,
    can_send: false,
    can_create_quote: false,
    can_create_pi: false,
    can_create_order: false,
    can_trigger_production: false,
    can_trigger_shipment: false,
  };
}

function prepareInquiryReviewSummary(rawInquiryInput, context = {}, options = {}) {
  const inquirySource = copyObject(rawInquiryInput);
  const contextCopy = copyObject(context);
  const optionsCopy = copyObject(options);
  const normalizedInquiry = buildNormalizedInquiry(inquirySource);
  const communicationInput = buildCommunicationInput(inquirySource);
  const aiDraftInput = buildAiDraftInput(inquirySource);
  const communicationReviewSummary = communicationInput
    ? prepareCommunicationReviewSummary(communicationInput, contextCopy, optionsCopy)
    : null;
  const aiDraftReviewSummary = aiDraftInput
    ? prepareAiDraftReviewSummary(aiDraftInput, contextCopy, optionsCopy)
    : null;
  const missingInformation = inquirySource.missing_information;
  const riskFlags = inquirySource.risk_flags;
  const missingInformationPresent = hasContent(missingInformation);
  const riskFlagsPresent = hasContent(riskFlags);
  const reviewRequired = Boolean(
    communicationReviewSummary?.review_required ||
    communicationReviewSummary?.needs_human_review ||
    aiDraftReviewSummary?.approval_required ||
    aiDraftReviewSummary?.needs_human_review ||
    missingInformationPresent ||
    riskFlagsPresent,
  );
  const warnings = [
    ...(communicationReviewSummary?.warnings || []),
    ...(aiDraftReviewSummary?.warnings || []),
  ];

  if (missingInformationPresent) {
    warnings.push("missing_information present; operator review required");
  }

  if (riskFlagsPresent) {
    warnings.push("risk_flags present; operator review required");
  }

  if (optionsCopy.review_note) {
    warnings.push("operator review note provided; keep as internal review context only");
  }

  const recommendedOperatorAction = buildRecommendedOperatorAction(reviewRequired);
  const auditNoteCandidate = buildAuditNoteCandidate({
    normalizedInquiry,
    communicationReviewSummary,
    aiDraftReviewSummary,
    missingInformation,
    riskFlags,
    reviewRequired,
    warningCount: warnings.length,
  });

  return {
    normalized_inquiry: normalizedInquiry,
    communication_review_summary: communicationReviewSummary,
    ai_draft_review_summary: aiDraftReviewSummary,
    missing_information: missingInformation,
    risk_flags: riskFlags,
    warnings,
    review_required: reviewRequired,
    needs_human_review: reviewRequired,
    recommended_operator_action: recommendedOperatorAction,
    inquiry_only: true,
    can_send: false,
    can_create_quote: false,
    can_create_pi: false,
    can_create_order: false,
    can_trigger_production: false,
    can_trigger_shipment: false,
    audit_note_candidate: auditNoteCandidate,
    context: contextCopy,
  };
}

module.exports = {
  prepareInquiryReviewSummary,
};
