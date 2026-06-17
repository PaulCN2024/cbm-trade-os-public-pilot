const test = require("node:test");
const assert = require("node:assert/strict");

const { prepareAiDraftReviewSummary } = require("../lib/services/ai-drafts/prepare-ai-draft-review-summary");

test("exports prepareAiDraftReviewSummary", () => {
  assert.equal(typeof prepareAiDraftReviewSummary, "function");
});

test("returns normalized draft and safety classification", () => {
  const result = prepareAiDraftReviewSummary({
    draft_type: "EMAIL_DRAFT",
    task_type: "COMMUNICATION_SUMMARY",
    content: "Internal summary only.",
  });

  assert.equal(result.normalized_draft.draft_type, "email_draft");
  assert.equal(result.normalized_draft.task_type, "communication_summary");
  assert.ok(result.safety_classification);
  assert.ok(result.sensitivity_flags);
});

test("draft_only is always true", () => {
  assert.equal(prepareAiDraftReviewSummary({}).draft_only, true);
  assert.equal(prepareAiDraftReviewSummary({ content: "Summarize internal notes." }).draft_only, true);
});

test("can_send is always false", () => {
  assert.equal(prepareAiDraftReviewSummary({}).can_send, false);
  assert.equal(prepareAiDraftReviewSummary({ content: "Send WhatsApp customer reply." }).can_send, false);
});

test("can_auto_approve is always false", () => {
  assert.equal(prepareAiDraftReviewSummary({}).can_auto_approve, false);
  assert.equal(prepareAiDraftReviewSummary({ risk_level: "low", action_boundary: "auto_allowed" }).can_auto_approve, false);
});

test("does not mutate input object", () => {
  const input = {
    draft_type: "EMAIL_DRAFT",
    task_type: "COMMUNICATION_SUMMARY",
    content: "Internal summary only.",
  };
  const context = { source_business_object_type: "inquiry", source_business_object_id: "inq_001" };
  const options = { review_note: "Use only for internal review." };
  const inputSnapshot = { ...input };
  const contextSnapshot = { ...context };
  const optionsSnapshot = { ...options };

  prepareAiDraftReviewSummary(input, context, options);

  assert.deepEqual(input, inputSnapshot);
  assert.deepEqual(context, contextSnapshot);
  assert.deepEqual(options, optionsSnapshot);
});

test("low-risk internal note remains non-sendable and non-auto-approvable", () => {
  const result = prepareAiDraftReviewSummary({
    draft_type: "internal_note_draft",
    task_type: "document_summary",
    risk_level: "low",
    action_boundary: "auto_allowed",
    content: "Summarize internal project notes.",
  });

  assert.equal(result.risk_level, "low");
  assert.equal(result.action_boundary, "auto_allowed");
  assert.equal(result.draft_only, true);
  assert.equal(result.can_send, false);
  assert.equal(result.can_auto_approve, false);
  assert.match(result.recommended_operator_action, /Draft only/);
});

test("price delivery and payment content requires human review", () => {
  const result = prepareAiDraftReviewSummary({
    draft_type: "customer_reply_draft",
    task_type: "communication_summary",
    content: "Please draft reply about unit price, delivery lead time and payment deposit.",
  });

  assert.equal(result.sensitivity_flags.price_related, true);
  assert.equal(result.sensitivity_flags.delivery_related, true);
  assert.equal(result.sensitivity_flags.payment_related, true);
  assert.equal(result.risk_level, "high");
  assert.equal(result.action_boundary, "review_required");
  assert.equal(result.approval_required, true);
  assert.equal(result.needs_human_review, true);
});

test("quotation and PI content requires human review", () => {
  const result = prepareAiDraftReviewSummary({
    draft_type: "quotation_draft",
    task_type: "quotation_generation",
    content: "Prepare quotation and PI proforma invoice draft.",
  });

  assert.equal(result.sensitivity_flags.quotation_related, true);
  assert.equal(result.sensitivity_flags.pi_related, true);
  assert.equal(result.risk_level, "high");
  assert.equal(result.action_boundary, "review_required");
  assert.equal(result.approval_required, true);
});

test("permission and finance content becomes blocked and needs human review", () => {
  const result = prepareAiDraftReviewSummary({
    draft_type: "internal_note_draft",
    task_type: "customer_summary",
    content: "Summarize admin role permission and profit margin.",
  });

  assert.equal(result.sensitivity_flags.permission_related, true);
  assert.equal(result.sensitivity_flags.finance_related, true);
  assert.equal(result.risk_level, "blocked");
  assert.equal(result.action_boundary, "blocked");
  assert.equal(result.approval_required, true);
  assert.equal(result.needs_human_review, true);
  assert.match(result.recommended_operator_action, /Blocked/);
});

test("warnings is always an array", () => {
  assert.ok(Array.isArray(prepareAiDraftReviewSummary({}).warnings));
  assert.ok(Array.isArray(prepareAiDraftReviewSummary({ draft_type: "unknown" }).warnings));
});

test("recommended operator action is present", () => {
  const result = prepareAiDraftReviewSummary({});
  assert.equal(typeof result.recommended_operator_action, "string");
  assert.ok(result.recommended_operator_action.length > 0);
});

test("audit note candidate is present and safe", () => {
  const result = prepareAiDraftReviewSummary({ content: "Prepare PI draft." });

  assert.ok(result.audit_note_candidate);
  assert.equal(result.audit_note_candidate.draft_only, true);
  assert.equal(result.audit_note_candidate.can_send, false);
  assert.equal(result.audit_note_candidate.can_auto_approve, false);
});

test("context is preserved as a safe copy", () => {
  const context = { source_business_object_type: "inquiry", source_business_object_id: "inq_001" };
  const result = prepareAiDraftReviewSummary({ content: "Internal summary only." }, context);

  assert.deepEqual(result.context, context);
  assert.notEqual(result.context, context);
});

test("missing or non-object input is handled safely", () => {
  const missingResult = prepareAiDraftReviewSummary();
  const stringResult = prepareAiDraftReviewSummary("send quote");

  assert.equal(missingResult.draft_only, true);
  assert.equal(stringResult.draft_only, true);
  assert.equal(missingResult.can_send, false);
  assert.equal(stringResult.can_send, false);
});
