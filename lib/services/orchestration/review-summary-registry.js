const { prepareAiDraftReviewSummary } = require("../ai-drafts");
const { prepareCommunicationReviewSummary } = require("../communication");
const { prepareInquiryReviewSummary } = require("../inquiries");

const REVIEW_SUMMARY_HELPER_DOMAINS = Object.freeze({
  ai_draft: "ai_draft",
  communication: "communication",
  inquiry: "inquiry",
});

const SAFE_ALLOWED_USE = Object.freeze([
  "display_review_summary",
  "operator_review_preparation",
  "internal_risk_review",
  "draft_only_preparation",
]);

const FORBIDDEN_USE = Object.freeze([
  "send",
  "auto_reply",
  "approve",
  "reject",
  "create_task",
  "create_quote",
  "create_pi",
  "create_order",
  "confirm_payment",
  "trigger_production",
  "trigger_shipment",
  "reserve_numbering_code",
  "database_write",
  "api_write",
  "external_ai_call",
  "external_channel_send",
]);

const SAFETY_FLAGS = Object.freeze({
  pure_local: true,
  metadata_only: true,
  no_api: true,
  no_db: true,
  no_external_ai: true,
  no_external_send: true,
  no_write_actions: true,
  no_approval_execution: true,
});

const OUTPUT_CAPABILITIES = Object.freeze({
  can_send: false,
  can_auto_reply: false,
  can_auto_approve: false,
  can_create_task: false,
  can_create_quote: false,
  can_create_pi: false,
  can_create_order: false,
  can_confirm_payment: false,
  can_trigger_production: false,
  can_trigger_shipment: false,
  can_reserve_numbering_code: false,
});

const HUMAN_REVIEW_TRIGGERS = Object.freeze([
  "customer_facing_message",
  "supplier_facing_message",
  "price",
  "delivery",
  "payment",
  "bank_details",
  "compensation",
  "quality_responsibility",
  "quotation",
  "pi",
  "order",
  "production",
  "shipment",
  "supplier_commitment",
]);

function freezeMetadata(metadata) {
  return Object.freeze({
    ...metadata,
    allowedUse: Object.freeze([...SAFE_ALLOWED_USE]),
    forbiddenUse: Object.freeze([...FORBIDDEN_USE]),
    safetyFlags: Object.freeze({ ...SAFETY_FLAGS }),
    outputCapabilities: Object.freeze({ ...OUTPUT_CAPABILITIES }),
    requiresHumanReviewFor: Object.freeze([...HUMAN_REVIEW_TRIGGERS]),
  });
}

function copyMetadata(metadata) {
  return {
    ...metadata,
    allowedUse: [...metadata.allowedUse],
    forbiddenUse: [...metadata.forbiddenUse],
    safetyFlags: { ...metadata.safetyFlags },
    outputCapabilities: { ...metadata.outputCapabilities },
    requiresHumanReviewFor: [...metadata.requiresHumanReviewFor],
  };
}

const REVIEW_SUMMARY_HELPERS = Object.freeze({
  ai_draft: freezeMetadata({
    key: "ai_draft",
    domain: REVIEW_SUMMARY_HELPER_DOMAINS.ai_draft,
    label: "AI 草稿复核",
    description: "Prepares a draft-only AI draft review summary for operator review.",
    module: "lib/services/ai-drafts",
    functionName: "prepareAiDraftReviewSummary",
    helper: prepareAiDraftReviewSummary,
  }),
  communication: freezeMetadata({
    key: "communication",
    domain: REVIEW_SUMMARY_HELPER_DOMAINS.communication,
    label: "沟通复核",
    description: "Prepares a communication and attachment review summary for operator review.",
    module: "lib/services/communication",
    functionName: "prepareCommunicationReviewSummary",
    helper: prepareCommunicationReviewSummary,
  }),
  inquiry: freezeMetadata({
    key: "inquiry",
    domain: REVIEW_SUMMARY_HELPER_DOMAINS.inquiry,
    label: "询盘复核",
    description: "Prepares an inquiry review summary by combining communication and AI draft review summaries.",
    module: "lib/services/inquiries",
    functionName: "prepareInquiryReviewSummary",
    helper: prepareInquiryReviewSummary,
  }),
});

function getReviewSummaryHelper(domain) {
  if (typeof domain !== "string") {
    return null;
  }

  const helperMetadata = REVIEW_SUMMARY_HELPERS[domain];
  return helperMetadata ? copyMetadata(helperMetadata) : null;
}

function listReviewSummaryHelpers() {
  return Object.values(REVIEW_SUMMARY_HELPERS).map(copyMetadata);
}

module.exports = {
  REVIEW_SUMMARY_HELPER_DOMAINS,
  REVIEW_SUMMARY_HELPERS,
  getReviewSummaryHelper,
  listReviewSummaryHelpers,
};
