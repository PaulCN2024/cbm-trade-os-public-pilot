const AI_DRAFT_TYPES = Object.freeze({
  customer_reply_draft: "Customer Reply Draft",
  supplier_rfq_draft: "Supplier RFQ Draft",
  quotation_draft: "Quotation Draft",
  pi_draft: "PI Draft",
  whatsapp_draft: "WhatsApp Draft",
  email_draft: "Email Draft",
  knowledge_article_draft: "Knowledge Article Draft",
  document_summary_draft: "Document Summary Draft",
  follow_up_task_draft: "Follow-up Task Draft",
  internal_note_draft: "Internal Note Draft",
});

const AI_TASK_TYPES = Object.freeze({
  inquiry_analysis: "Inquiry Analysis",
  customer_summary: "Customer Summary",
  supplier_matching: "Supplier Matching",
  supplier_rfq_generation: "Supplier RFQ Generation",
  quotation_check: "Quotation Check",
  quotation_generation: "Quotation Generation",
  document_summary: "Document Summary",
  communication_summary: "Communication Summary",
  knowledge_update_suggestion: "Knowledge Update Suggestion",
  follow_up_suggestion: "Follow-up Suggestion",
});

const APPROVAL_STATUSES = Object.freeze({
  draft: "Draft",
  needs_review: "Needs Review",
  approved_internal: "Approved Internal",
  rejected: "Rejected",
  sent_manual: "Sent Manual",
  archived: "Archived",
});

const AI_RISK_LEVELS = Object.freeze({
  low: "Low",
  medium: "Medium",
  high: "High",
  blocked: "Blocked",
});

const AI_DECISION_STATUSES = Object.freeze({
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  edited: "Edited",
  escalated: "Escalated",
});

const AI_ACTION_BOUNDARY_TYPES = Object.freeze({
  auto_allowed: "Auto Allowed",
  review_required: "Review Required",
  blocked: "Blocked",
});

const DEFAULT_AI_DRAFT_VALUES = Object.freeze({
  DEFAULT_APPROVAL_STATUS: "draft",
  DEFAULT_RISK_LEVEL: "medium",
  DEFAULT_DECISION_STATUS: "pending",
  DEFAULT_ACTION_BOUNDARY: "review_required",
});

const AI_DRAFT_TYPE_VALUES = Object.freeze(Object.keys(AI_DRAFT_TYPES));
const AI_TASK_TYPE_VALUES = Object.freeze(Object.keys(AI_TASK_TYPES));
const APPROVAL_STATUS_VALUES = Object.freeze(Object.keys(APPROVAL_STATUSES));
const AI_RISK_LEVEL_VALUES = Object.freeze(Object.keys(AI_RISK_LEVELS));
const AI_DECISION_STATUS_VALUES = Object.freeze(Object.keys(AI_DECISION_STATUSES));
const AI_ACTION_BOUNDARY_TYPE_VALUES = Object.freeze(Object.keys(AI_ACTION_BOUNDARY_TYPES));

module.exports = {
  AI_DRAFT_TYPES,
  AI_TASK_TYPES,
  APPROVAL_STATUSES,
  AI_RISK_LEVELS,
  AI_DECISION_STATUSES,
  AI_ACTION_BOUNDARY_TYPES,
  DEFAULT_AI_DRAFT_VALUES,
  AI_DRAFT_TYPE_VALUES,
  AI_TASK_TYPE_VALUES,
  APPROVAL_STATUS_VALUES,
  AI_RISK_LEVEL_VALUES,
  AI_DECISION_STATUS_VALUES,
  AI_ACTION_BOUNDARY_TYPE_VALUES,
};
