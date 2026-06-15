const test = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizeAiActionBoundary,
  normalizeAiDecisionStatus,
  normalizeAiDraftInput,
  normalizeAiDraftType,
  normalizeAiRiskLevel,
  normalizeAiTaskType,
  normalizeApprovalStatus,
} = require("../lib/services/ai-drafts/normalize-ai-draft-input");

function assertFallback(result, expectedValue, warningText, needsHumanReview) {
  assert.equal(result.value, expectedValue);
  assert.equal(result.needs_human_review, needsHumanReview);
  assert.ok(result.warnings.some((warning) => warning.includes(warningText)));
}

test("known draft type normalizes correctly", () => {
  assert.equal(normalizeAiDraftType(" Quotation_Draft ").value, "quotation_draft");
});

test("missing draft type falls back with warning", () => {
  assertFallback(normalizeAiDraftType(), "customer_reply_draft", "draft_type missing", false);
});

test("unknown draft type falls back and requires human review", () => {
  assertFallback(normalizeAiDraftType("final_document"), "customer_reply_draft", "draft_type unknown", true);
});

test("known task type normalizes correctly", () => {
  assert.equal(normalizeAiTaskType(" Communication_Summary ").value, "communication_summary");
});

test("missing task type falls back with warning", () => {
  assertFallback(normalizeAiTaskType(""), "communication_summary", "task_type missing", false);
});

test("known approval status normalizes correctly", () => {
  assert.equal(normalizeApprovalStatus(" Needs_Review ").value, "needs_review");
});

test("missing approval status falls back to draft", () => {
  assertFallback(normalizeApprovalStatus(null), "draft", "approval_status missing", false);
});

test("approval status never defaults to sent_manual", () => {
  assert.notEqual(normalizeApprovalStatus().value, "sent_manual");
  assert.equal(normalizeApprovalStatus().value, "draft");
});

test("known risk level normalizes correctly", () => {
  assert.equal(normalizeAiRiskLevel(" HIGH ").value, "high");
});

test("missing risk level falls back to medium", () => {
  assertFallback(normalizeAiRiskLevel(undefined), "medium", "risk_level missing", false);
});

test("known decision status normalizes correctly", () => {
  assert.equal(normalizeAiDecisionStatus(" Edited ").value, "edited");
});

test("missing decision status falls back to pending", () => {
  assertFallback(normalizeAiDecisionStatus(" "), "pending", "decision_status missing", false);
});

test("known action boundary normalizes correctly", () => {
  assert.equal(normalizeAiActionBoundary(" Blocked ").value, "blocked");
});

test("missing action boundary falls back to review_required", () => {
  assertFallback(normalizeAiActionBoundary(), "review_required", "action_boundary missing", false);
});

test("action boundary never defaults to auto_allowed", () => {
  assert.notEqual(normalizeAiActionBoundary().value, "auto_allowed");
  assert.equal(normalizeAiActionBoundary().value, "review_required");
});

test("approval_required is true by default", () => {
  assert.equal(normalizeAiDraftInput({}).approval_required, true);
});

test("approval_required is true for medium high and blocked risk", () => {
  for (const riskLevel of ["medium", "high", "blocked"]) {
    assert.equal(normalizeAiDraftInput({ risk_level: riskLevel, action_boundary: "auto_allowed" }).approval_required, true);
  }
});

test("approval_required is true for review_required or blocked boundary", () => {
  assert.equal(normalizeAiDraftInput({ risk_level: "low", action_boundary: "review_required" }).approval_required, true);
  assert.equal(normalizeAiDraftInput({ risk_level: "low", action_boundary: "blocked" }).approval_required, true);
});

test("normalizeAiDraftInput preserves unrelated fields", () => {
  const result = normalizeAiDraftInput({
    draft_type: "email_draft",
    task_type: "communication_summary",
    draft_title: "Reply draft",
    source_business_object_id: "inquiry_001",
  });

  assert.equal(result.normalized_input.draft_title, "Reply draft");
  assert.equal(result.normalized_input.source_business_object_id, "inquiry_001");
});

test("normalizeAiDraftInput does not mutate original input", () => {
  const input = {
    draft_type: "EMAIL_DRAFT",
    task_type: "COMMUNICATION_SUMMARY",
    approval_status: "DRAFT",
    risk_level: "MEDIUM",
    decision_status: "PENDING",
    action_boundary: "REVIEW_REQUIRED",
  };
  const snapshot = { ...input };

  normalizeAiDraftInput(input);

  assert.deepEqual(input, snapshot);
});

test("normalizeAiDraftInput aggregates warnings", () => {
  const result = normalizeAiDraftInput({
    draft_type: "final_document",
    task_type: "unknown_task",
    approval_status: "sent",
    risk_level: "critical",
    decision_status: "done",
    action_boundary: "send_now",
  });

  assert.equal(result.warnings.length, 6);
  assert.ok(result.warnings.some((warning) => warning.includes("draft_type unknown")));
  assert.ok(result.warnings.some((warning) => warning.includes("task_type unknown")));
  assert.ok(result.warnings.some((warning) => warning.includes("approval_status unknown")));
  assert.ok(result.warnings.some((warning) => warning.includes("risk_level unknown")));
  assert.ok(result.warnings.some((warning) => warning.includes("decision_status unknown")));
  assert.ok(result.warnings.some((warning) => warning.includes("action_boundary unknown")));
  assert.equal(result.needs_human_review, true);
  assert.equal(result.approval_required, true);
});
