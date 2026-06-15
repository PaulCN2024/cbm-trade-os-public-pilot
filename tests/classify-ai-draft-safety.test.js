const test = require("node:test");
const assert = require("node:assert/strict");

const {
  classifyAiDraftActionBoundary,
  classifyAiDraftSafety,
  detectAiDraftSensitiveTopics,
} = require("../lib/services/ai-drafts/classify-ai-draft-safety");

function assertFlagTriggersReview(text, flagName) {
  const result = detectAiDraftSensitiveTopics({ content: text });
  assert.equal(result.sensitivity_flags[flagName], true);
  assert.equal(result.needs_human_review, true);

  const safety = classifyAiDraftActionBoundary({ sensitivity_flags: result.sensitivity_flags });
  assert.equal(safety.approval_required, true);
}

test("price keyword triggers price_related and approval_required", () => {
  assertFlagTriggersReview("Please confirm unit price and FOB total amount.", "price_related");
});

test("delivery keyword triggers delivery_related and approval_required", () => {
  assertFlagTriggersReview("Draft a reply about delivery lead time and ETA.", "delivery_related");
});

test("payment keyword triggers payment_related and approval_required", () => {
  assertFlagTriggersReview("Mention deposit balance and bank transfer.", "payment_related");
});

test("compensation and refund keyword triggers compensation_related and approval_required", () => {
  assertFlagTriggersReview("Offer refund or compensation for this issue.", "compensation_related");
});

test("quality and complaint keyword triggers quality_related and approval_required", () => {
  assertFlagTriggersReview("Reply to quality complaint and responsibility question.", "quality_related");
});

test("order confirmation keyword triggers order_related and approval_required", () => {
  assertFlagTriggersReview("Send order confirmation for the purchase order.", "order_related");
});

test("quotation keyword triggers quotation_related and approval_required", () => {
  assertFlagTriggersReview("Prepare quotation and offer sheet.", "quotation_related");
});

test("PI and proforma invoice keyword triggers pi_related and approval_required", () => {
  assertFlagTriggersReview("Prepare PI and proforma invoice draft.", "pi_related");
});

test("email WhatsApp and send keyword triggers external_message_related and approval_required", () => {
  assertFlagTriggersReview("Send WhatsApp customer reply by email.", "external_message_related");
});

test("permission admin and role keyword triggers blocked", () => {
  const sensitivity = detectAiDraftSensitiveTopics({ content: "Change admin role and user access permission." });
  const safety = classifyAiDraftActionBoundary({ sensitivity_flags: sensitivity.sensitivity_flags });

  assert.equal(sensitivity.sensitivity_flags.permission_related, true);
  assert.equal(safety.risk_level, "blocked");
  assert.equal(safety.action_boundary, "blocked");
  assert.equal(safety.approval_required, true);
  assert.ok(safety.blocked_reasons.includes("permission_related"));
});

test("profit margin commission salary and payroll keyword triggers blocked", () => {
  const sensitivity = detectAiDraftSensitiveTopics({ content: "Summarize profit margin commission salary payroll." });
  const safety = classifyAiDraftActionBoundary({ sensitivity_flags: sensitivity.sensitivity_flags });

  assert.equal(sensitivity.sensitivity_flags.finance_related, true);
  assert.equal(safety.risk_level, "blocked");
  assert.equal(safety.action_boundary, "blocked");
  assert.ok(safety.blocked_reasons.includes("finance_related"));
});

test("low-risk internal note can be auto_allowed", () => {
  const safety = classifyAiDraftActionBoundary({ content: "Summarize internal project notes." });

  assert.equal(safety.risk_level, "low");
  assert.equal(safety.action_boundary, "auto_allowed");
  assert.equal(safety.approval_required, false);
});

test("classifyAiDraftSafety combines normalization and safety classification", () => {
  const result = classifyAiDraftSafety({
    draft_type: "EMAIL_DRAFT",
    task_type: "COMMUNICATION_SUMMARY",
    content: "Please draft email about price and delivery.",
  });

  assert.equal(result.normalized_input.draft_type, "email_draft");
  assert.equal(result.normalized_input.task_type, "communication_summary");
  assert.equal(result.sensitivity.sensitivity_flags.price_related, true);
  assert.equal(result.sensitivity.sensitivity_flags.delivery_related, true);
  assert.equal(result.safety_classification.risk_level, "high");
  assert.equal(result.approval_required, true);
});

test("classifyAiDraftSafety does not mutate original input", () => {
  const input = {
    draft_type: "EMAIL_DRAFT",
    task_type: "COMMUNICATION_SUMMARY",
    content: "Internal summary only.",
  };
  const snapshot = { ...input };

  classifyAiDraftSafety(input);

  assert.deepEqual(input, snapshot);
});

test("normalize approval_required true remains true in final result", () => {
  const result = classifyAiDraftSafety({
    draft_type: "internal_note_draft",
    task_type: "document_summary",
    risk_level: "medium",
    action_boundary: "auto_allowed",
    content: "Internal summary only.",
  });

  assert.equal(result.safety_classification.approval_required, false);
  assert.equal(result.approval_required, true);
});
