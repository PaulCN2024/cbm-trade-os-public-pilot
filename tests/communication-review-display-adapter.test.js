const test = require("node:test");
const assert = require("node:assert/strict");

const {
  communicationReviewDisplayAdapter,
} = require("../lib/services/display-adapters/communication-review-display-adapter");

function buildReviewSummary(overrides = {}) {
  return {
    normalized_communication: {
      direction: "inbound",
      channel: "email",
      visibility: "normal",
      status: "active",
      body: "Please confirm final price.",
    },
    classification: {
      normalized_input: {
        direction: "inbound",
        channel: "email",
      },
    },
    attachment_summary: {
      attachment_type: "supplier_quote",
      confidence: "high",
      warnings: ["supplier quote attachment requires review"],
      needs_human_review: true,
      requires_review: true,
    },
    sensitivity_flags: {
      price_related: true,
      quotation_related: true,
    },
    direction: "inbound",
    channel: "email",
    visibility: "normal",
    status: "active",
    warnings: ["sensitive communication requires review"],
    needs_human_review: true,
    review_required: true,
    recommended_operator_action: "Review required before any customer or supplier response.",
    communication_only: true,
    can_send: false,
    can_auto_reply: false,
    can_create_task: false,
    audit_note_candidate: {
      communication_only: true,
      can_send: false,
      can_auto_reply: false,
      can_create_task: false,
    },
    ...overrides,
  };
}

test("exports communicationReviewDisplayAdapter", () => {
  assert.equal(typeof communicationReviewDisplayAdapter, "function");
});

test("maps normal review summary into view model", () => {
  const viewModel = communicationReviewDisplayAdapter(buildReviewSummary());

  assert.equal(viewModel.title, "沟通复核");
  assert.equal(viewModel.subtitle, "只读沟通复核摘要，不代表可发送、自动回复或创建任务。");
  assert.ok(Array.isArray(viewModel.badges));
  assert.ok(Array.isArray(viewModel.summaryRows));
  assert.ok(Array.isArray(viewModel.warningRows));
  assert.ok(Array.isArray(viewModel.safetyRows));
  assert.ok(Array.isArray(viewModel.attachmentRows));
  assert.ok(Array.isArray(viewModel.disabledCapabilities));
});

test("title is 沟通复核", () => {
  const viewModel = communicationReviewDisplayAdapter(buildReviewSummary());

  assert.equal(viewModel.title, "沟通复核");
});

test("uses Chinese labels for direction and channel when available", () => {
  const viewModel = communicationReviewDisplayAdapter(buildReviewSummary());
  const directionRow = viewModel.summaryRows.find((row) => row.label === "方向");
  const channelRow = viewModel.summaryRows.find((row) => row.label === "渠道");

  assert.equal(directionRow.value, "收到");
  assert.equal(directionRow.key, "inbound");
  assert.equal(channelRow.value, "邮件");
  assert.equal(channelRow.key, "email");
});

test("maps attachment_summary into attachmentRows", () => {
  const viewModel = communicationReviewDisplayAdapter(buildReviewSummary());
  const keys = viewModel.attachmentRows.map((row) => row.key);

  assert.ok(keys.includes("attachment_type"));
  assert.ok(keys.includes("confidence"));
  assert.ok(keys.includes("needs_human_review"));
  assert.ok(keys.includes("requires_review"));
  assert.ok(keys.includes("warning"));
});

test("uses Chinese attachment labels when available", () => {
  const viewModel = communicationReviewDisplayAdapter(buildReviewSummary());
  const attachmentTypeRow = viewModel.attachmentRows.find((row) => row.key === "attachment_type");

  assert.equal(attachmentTypeRow.value, "供应商报价");
  assert.equal(attachmentTypeRow.technicalValue, "supplier_quote");
});

test("preserves technical values in technicalDetails", () => {
  const viewModel = communicationReviewDisplayAdapter(buildReviewSummary());

  assert.equal(viewModel.technicalDetails.direction, "inbound");
  assert.equal(viewModel.technicalDetails.channel, "email");
  assert.equal(viewModel.technicalDetails.visibility, "normal");
  assert.equal(viewModel.technicalDetails.status, "active");
  assert.equal(viewModel.technicalDetails.review_required, true);
  assert.equal(viewModel.technicalDetails.needs_human_review, true);
  assert.equal(viewModel.technicalDetails.communication_only, true);
  assert.equal(viewModel.technicalDetails.can_send, false);
  assert.equal(viewModel.technicalDetails.can_auto_reply, false);
  assert.equal(viewModel.technicalDetails.can_create_task, false);
});

test("displays warnings as warningRows", () => {
  const viewModel = communicationReviewDisplayAdapter(buildReviewSummary());

  assert.deepEqual(viewModel.warningRows, [
    { label: "警告", value: "sensitive communication requires review" },
  ]);
});

test("displays sensitivity_flags in technicalDetails", () => {
  const viewModel = communicationReviewDisplayAdapter(buildReviewSummary());

  assert.deepEqual(viewModel.technicalDetails.sensitivity_flags, {
    price_related: true,
    quotation_related: true,
  });
});

test("displays disabledCapabilities for can_send can_auto_reply and can_create_task false", () => {
  const viewModel = communicationReviewDisplayAdapter(buildReviewSummary());
  const disabledKeys = viewModel.disabledCapabilities.map((capability) => capability.key);

  assert.ok(disabledKeys.includes("can_send"));
  assert.ok(disabledKeys.includes("can_auto_reply"));
  assert.ok(disabledKeys.includes("can_create_task"));
});

test("missing or invalid summary returns safe fallback", () => {
  const missingViewModel = communicationReviewDisplayAdapter();
  const invalidViewModel = communicationReviewDisplayAdapter("invalid");

  assert.equal(missingViewModel.title, "沟通复核");
  assert.equal(missingViewModel.subtitle, "未找到可用的沟通复核摘要。");
  assert.deepEqual(invalidViewModel.warningRows, [
    { label: "提示", value: "请检查 reviewSummary 输入。" },
  ]);
  assert.equal(missingViewModel.rawReference, null);
});

test("does not mutate input summary", () => {
  const summary = buildReviewSummary();
  const snapshot = {
    normalized_communication: { ...summary.normalized_communication },
    attachment_summary: {
      ...summary.attachment_summary,
      warnings: [...summary.attachment_summary.warnings],
    },
    sensitivity_flags: { ...summary.sensitivity_flags },
    warnings: [...summary.warnings],
  };

  const viewModel = communicationReviewDisplayAdapter(summary);
  viewModel.rawReference.normalized_communication.direction = "changed";
  viewModel.rawReference.attachment_summary.warnings.push("changed");
  viewModel.technicalDetails.sensitivity_flags.price_related = false;

  assert.deepEqual(summary.normalized_communication, snapshot.normalized_communication);
  assert.deepEqual(summary.attachment_summary, snapshot.attachment_summary);
  assert.deepEqual(summary.sensitivity_flags, snapshot.sensitivity_flags);
  assert.deepEqual(summary.warnings, snapshot.warnings);
});

test("does not call prepareCommunicationReviewSummary", () => {
  const summary = buildReviewSummary({
    prepareCommunicationReviewSummary: () => {
      throw new Error("must not be called");
    },
  });

  const viewModel = communicationReviewDisplayAdapter(summary);

  assert.equal(viewModel.title, "沟通复核");
});

test("output contains no executable action fields", () => {
  const viewModel = communicationReviewDisplayAdapter(buildReviewSummary());

  assert.equal(Object.prototype.hasOwnProperty.call(viewModel, "send"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(viewModel, "reply"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(viewModel, "autoReply"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(viewModel, "createTask"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(viewModel, "uiAction"), false);
});

test("attachment rows do not expose upload archive promotion payment or quote actions", () => {
  const viewModel = communicationReviewDisplayAdapter(buildReviewSummary());
  const serializedRows = JSON.stringify(viewModel.attachmentRows);

  assert.equal(serializedRows.includes("upload"), false);
  assert.equal(serializedRows.includes("archive"), false);
  assert.equal(serializedRows.includes("promotion"), false);
  assert.equal(serializedRows.includes("payment_confirmation"), false);
  assert.equal(serializedRows.includes("quote_action"), false);
});

test("recommendedOperatorAction fallback is safe", () => {
  const viewModel = communicationReviewDisplayAdapter(buildReviewSummary({
    recommended_operator_action: "",
  }));

  assert.equal(viewModel.recommendedOperatorAction, "请人工复核后再决定下一步沟通处理。");
});

test("no API schema or UI behavior exists", () => {
  const viewModel = communicationReviewDisplayAdapter(buildReviewSummary());

  assert.equal(Object.prototype.hasOwnProperty.call(viewModel, "apiRoute"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(viewModel, "schema"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(viewModel, "adminUi"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(viewModel, "databaseWrite"), false);
});
