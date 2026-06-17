const test = require("node:test");
const assert = require("node:assert/strict");

const { aiDraftReviewDisplayAdapter } = require("../lib/services/display-adapters/ai-draft-review-display-adapter");

function buildReviewSummary(overrides = {}) {
  return {
    normalized_draft: {
      draft_type: "customer_reply_draft",
      task_type: "communication_summary",
      risk_level: "high",
      action_boundary: "review_required",
    },
    safety_classification: {
      risk_level: "high",
      action_boundary: "review_required",
      approval_required: true,
    },
    sensitivity_flags: {
      price_related: true,
      external_message_related: true,
    },
    risk_level: "high",
    action_boundary: "review_required",
    approval_required: true,
    needs_human_review: true,
    warnings: ["price-related content requires review"],
    recommended_operator_action: "Review internally before any external use.",
    draft_only: true,
    can_send: false,
    can_auto_approve: false,
    audit_note_candidate: {
      draft_only: true,
      can_send: false,
      can_auto_approve: false,
    },
    ...overrides,
  };
}

test("exports aiDraftReviewDisplayAdapter", () => {
  assert.equal(typeof aiDraftReviewDisplayAdapter, "function");
});

test("maps normal review summary into view model", () => {
  const viewModel = aiDraftReviewDisplayAdapter(buildReviewSummary());

  assert.equal(viewModel.title, "AI 草稿复核");
  assert.equal(viewModel.subtitle, "只读复核摘要，不代表可发送或可自动审批。");
  assert.ok(Array.isArray(viewModel.badges));
  assert.ok(Array.isArray(viewModel.summaryRows));
  assert.ok(Array.isArray(viewModel.warningRows));
  assert.ok(Array.isArray(viewModel.safetyRows));
  assert.ok(Array.isArray(viewModel.disabledCapabilities));
});

test("title is AI 草稿复核", () => {
  const viewModel = aiDraftReviewDisplayAdapter(buildReviewSummary());

  assert.equal(viewModel.title, "AI 草稿复核");
});

test("uses Chinese labels for risk_level and action_boundary when available", () => {
  const viewModel = aiDraftReviewDisplayAdapter(buildReviewSummary());
  const riskRow = viewModel.summaryRows.find((row) => row.label === "风险等级");
  const boundaryRow = viewModel.summaryRows.find((row) => row.label === "动作边界");

  assert.equal(riskRow.value, "高");
  assert.equal(riskRow.key, "high");
  assert.equal(boundaryRow.value, "需要人工审核");
  assert.equal(boundaryRow.key, "review_required");
});

test("preserves technical values in technicalDetails", () => {
  const viewModel = aiDraftReviewDisplayAdapter(buildReviewSummary());

  assert.equal(viewModel.technicalDetails.risk_level, "high");
  assert.equal(viewModel.technicalDetails.action_boundary, "review_required");
  assert.equal(viewModel.technicalDetails.approval_required, true);
  assert.equal(viewModel.technicalDetails.needs_human_review, true);
  assert.equal(viewModel.technicalDetails.draft_only, true);
  assert.equal(viewModel.technicalDetails.can_send, false);
  assert.equal(viewModel.technicalDetails.can_auto_approve, false);
});

test("displays warnings as warningRows", () => {
  const viewModel = aiDraftReviewDisplayAdapter(buildReviewSummary());

  assert.deepEqual(viewModel.warningRows, [
    { label: "警告", value: "price-related content requires review" },
  ]);
});

test("displays sensitivity_flags in technicalDetails", () => {
  const viewModel = aiDraftReviewDisplayAdapter(buildReviewSummary());

  assert.deepEqual(viewModel.technicalDetails.sensitivity_flags, {
    price_related: true,
    external_message_related: true,
  });
});

test("displays disabledCapabilities for can_send false and can_auto_approve false", () => {
  const viewModel = aiDraftReviewDisplayAdapter(buildReviewSummary());
  const disabledKeys = viewModel.disabledCapabilities.map((capability) => capability.key);

  assert.ok(disabledKeys.includes("can_send"));
  assert.ok(disabledKeys.includes("can_auto_approve"));
});

test("missing or invalid summary returns safe fallback", () => {
  const missingViewModel = aiDraftReviewDisplayAdapter();
  const invalidViewModel = aiDraftReviewDisplayAdapter("invalid");

  assert.equal(missingViewModel.title, "AI 草稿复核");
  assert.equal(missingViewModel.subtitle, "未找到可用的 AI 草稿复核摘要。");
  assert.deepEqual(invalidViewModel.warningRows, [
    { label: "提示", value: "请检查 reviewSummary 输入。" },
  ]);
  assert.equal(missingViewModel.rawReference, null);
});

test("does not mutate input summary", () => {
  const summary = buildReviewSummary();
  const snapshot = {
    normalized_draft: { ...summary.normalized_draft },
    sensitivity_flags: { ...summary.sensitivity_flags },
    warnings: [...summary.warnings],
  };

  const viewModel = aiDraftReviewDisplayAdapter(summary);
  viewModel.rawReference.normalized_draft.draft_type = "changed";
  viewModel.technicalDetails.sensitivity_flags.price_related = false;

  assert.deepEqual(summary.normalized_draft, snapshot.normalized_draft);
  assert.deepEqual(summary.sensitivity_flags, snapshot.sensitivity_flags);
  assert.deepEqual(summary.warnings, snapshot.warnings);
});

test("does not call prepareAiDraftReviewSummary", () => {
  const summary = buildReviewSummary({
    prepareAiDraftReviewSummary: () => {
      throw new Error("must not be called");
    },
  });

  const viewModel = aiDraftReviewDisplayAdapter(summary);

  assert.equal(viewModel.title, "AI 草稿复核");
});

test("output contains no executable action fields", () => {
  const viewModel = aiDraftReviewDisplayAdapter(buildReviewSummary());

  assert.equal(Object.prototype.hasOwnProperty.call(viewModel, "send"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(viewModel, "approve"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(viewModel, "reject"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(viewModel, "createTask"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(viewModel, "uiAction"), false);
});

test("auto_allowed is not represented as send or approve permission", () => {
  const viewModel = aiDraftReviewDisplayAdapter(buildReviewSummary({
    risk_level: "low",
    action_boundary: "auto_allowed",
    approval_required: false,
    needs_human_review: false,
    warnings: [],
  }));

  assert.equal(viewModel.technicalDetails.action_boundary, "auto_allowed");
  assert.equal(viewModel.technicalDetails.can_send, false);
  assert.equal(viewModel.technicalDetails.can_auto_approve, false);
  assert.ok(viewModel.warningRows.some((row) => row.value.includes("不代表允许发送或自动审批")));
});

test("recommendedOperatorAction fallback is safe", () => {
  const viewModel = aiDraftReviewDisplayAdapter(buildReviewSummary({
    recommended_operator_action: "",
  }));

  assert.equal(viewModel.recommendedOperatorAction, "请人工复核后再决定下一步操作。");
});

test("no API schema or UI behavior exists", () => {
  const viewModel = aiDraftReviewDisplayAdapter(buildReviewSummary());

  assert.equal(Object.prototype.hasOwnProperty.call(viewModel, "apiRoute"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(viewModel, "schema"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(viewModel, "adminUi"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(viewModel, "databaseWrite"), false);
});
