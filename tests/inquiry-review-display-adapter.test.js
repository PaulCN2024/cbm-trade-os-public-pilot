const test = require("node:test");
const assert = require("node:assert/strict");

const {
  inquiryReviewDisplayAdapter,
} = require("../lib/services/display-adapters/inquiry-review-display-adapter");

function buildCommunicationSummary() {
  return {
    normalized_communication: {
      direction: "inbound",
      channel: "email",
    },
    attachment_summary: {
      attachment_type: "supplier_quote",
      confidence: "high",
      warnings: [],
      needs_human_review: true,
      requires_review: true,
    },
    direction: "inbound",
    channel: "email",
    visibility: "normal",
    status: "active",
    sensitivity_flags: {
      price_related: true,
    },
    warnings: ["communication warning"],
    review_required: true,
    needs_human_review: true,
    communication_only: true,
    can_send: false,
    can_auto_reply: false,
    can_create_task: false,
  };
}

function buildAiDraftSummary() {
  return {
    normalized_draft: {
      draft_type: "customer_reply_draft",
      task_type: "communication_summary",
    },
    risk_level: "high",
    action_boundary: "review_required",
    approval_required: true,
    needs_human_review: true,
    warnings: ["ai draft warning"],
    draft_only: true,
    can_send: false,
    can_auto_approve: false,
  };
}

function buildInquirySummary() {
  return {
    normalized_inquiry: {
      inquiry_type: "website",
      project_type: "project",
      customer_name: "Demo Customer",
      company_name: "Demo Company",
      business_line: "A_ARCHITECTURAL",
      product_category: "curtain wall",
      status: "new",
    },
    communication_review_summary: buildCommunicationSummary(),
    ai_draft_review_summary: buildAiDraftSummary(),
    missing_information: ["drawing", "quantity"],
    risk_flags: ["delivery_related"],
    warnings: ["missing_information present; operator review required"],
    review_required: true,
    needs_human_review: true,
    recommended_operator_action: "Review the inquiry before any business action.",
    inquiry_only: true,
    can_send: false,
    can_create_quote: false,
    can_create_pi: false,
    can_create_order: false,
    can_trigger_production: false,
    can_trigger_shipment: false,
  };
}

test("exports inquiryReviewDisplayAdapter", () => {
  assert.equal(typeof inquiryReviewDisplayAdapter, "function");
});

test("maps inquiry summary into expected display view model", () => {
  const viewModel = inquiryReviewDisplayAdapter(buildInquirySummary());

  assert.equal(viewModel.title, "询盘复核");
  assert.equal(viewModel.subtitle.includes("不代表可发送"), true);
  assert.equal(Array.isArray(viewModel.badges), true);
  assert.equal(Array.isArray(viewModel.summaryRows), true);
  assert.equal(Array.isArray(viewModel.warningRows), true);
  assert.equal(Array.isArray(viewModel.safetyRows), true);
  assert.equal(Array.isArray(viewModel.missingInfoRows), true);
  assert.equal(Array.isArray(viewModel.riskFlagRows), true);
  assert.equal(Array.isArray(viewModel.nestedReviewModels), true);
  assert.equal(Array.isArray(viewModel.disabledCapabilities), true);
  assert.equal(viewModel.recommendedOperatorAction, "Review the inquiry before any business action.");
  assert.equal(typeof viewModel.technicalDetails, "object");
  assert.equal(typeof viewModel.rawReference, "object");
});

test("summaryRows expose operator labels while preserving internal values", () => {
  const viewModel = inquiryReviewDisplayAdapter(buildInquirySummary());

  assert.deepEqual(
    viewModel.summaryRows.map((row) => [row.label, row.key, row.value]),
    [
      ["询盘类型", "inquiry_type", "website"],
      ["项目类型", "project_type", "project"],
      ["客户", "customer_name", "Demo Customer"],
      ["公司", "company_name", "Demo Company"],
      ["业务线", "business_line", "A_ARCHITECTURAL"],
      ["产品分类", "product_category", "curtain wall"],
      ["状态", "status", "new"],
    ]
  );
});

test("missing information and risk flags are display-only rows", () => {
  const viewModel = inquiryReviewDisplayAdapter(buildInquirySummary());

  assert.deepEqual(viewModel.missingInfoRows.map((row) => row.value), ["drawing", "quantity"]);
  assert.deepEqual(viewModel.riskFlagRows.map((row) => row.value), ["delivery_related"]);
});

test("warning rows are mapped safely", () => {
  const viewModel = inquiryReviewDisplayAdapter(buildInquirySummary());

  assert.deepEqual(viewModel.warningRows, [
    {
      label: "警告",
      value: "missing_information present; operator review required",
    },
  ]);
});

test("nested communication review uses communication display adapter only", () => {
  const viewModel = inquiryReviewDisplayAdapter(buildInquirySummary());
  const communicationModel = viewModel.nestedReviewModels.find(
    (model) => model.source === "communication_review_summary"
  );

  assert.equal(communicationModel.title, "沟通复核");
  assert.equal(communicationModel.technicalDetails.communication_only, true);
  assert.equal(communicationModel.technicalDetails.can_send, false);
});

test("nested ai draft review uses ai draft display adapter only", () => {
  const viewModel = inquiryReviewDisplayAdapter(buildInquirySummary());
  const aiDraftModel = viewModel.nestedReviewModels.find(
    (model) => model.source === "ai_draft_review_summary"
  );

  assert.equal(aiDraftModel.title, "AI 草稿复核");
  assert.equal(aiDraftModel.technicalDetails.draft_only, true);
  assert.equal(aiDraftModel.technicalDetails.can_auto_approve, false);
});

test("technical details preserve safety booleans", () => {
  const viewModel = inquiryReviewDisplayAdapter(buildInquirySummary());

  assert.deepEqual(viewModel.technicalDetails, {
    inquiry_only: true,
    review_required: true,
    needs_human_review: true,
    can_send: false,
    can_create_quote: false,
    can_create_pi: false,
    can_create_order: false,
    can_trigger_production: false,
    can_trigger_shipment: false,
    has_communication_review_summary: true,
    has_ai_draft_review_summary: true,
    helperReference: "not executed by display adapter",
  });
});

test("disabled capabilities include all forbidden business actions", () => {
  const viewModel = inquiryReviewDisplayAdapter(buildInquirySummary());

  assert.deepEqual(
    viewModel.disabledCapabilities.map((capability) => capability.key),
    [
      "can_send",
      "can_create_quote",
      "can_create_pi",
      "can_create_order",
      "can_trigger_production",
      "can_trigger_shipment",
    ]
  );
});

test("invalid input returns safe fallback", () => {
  const viewModel = inquiryReviewDisplayAdapter(null);

  assert.equal(viewModel.title, "询盘复核");
  assert.equal(viewModel.rawReference, null);
  assert.equal(viewModel.disabledCapabilities.length, 6);
  assert.equal(viewModel.technicalDetails.helperReference, "not executed by display adapter");
});

test("does not mutate input review summary", () => {
  const reviewSummary = buildInquirySummary();
  const before = JSON.stringify(reviewSummary);

  const viewModel = inquiryReviewDisplayAdapter(reviewSummary);
  viewModel.rawReference.normalized_inquiry.customer_name = "Changed";
  viewModel.rawReference.missing_information.push("changed");
  viewModel.nestedReviewModels[0].rawReference.normalized_communication.direction = "changed";

  assert.equal(JSON.stringify(reviewSummary), before);
});

test("does not execute inquiry helper functions if present on input", () => {
  const reviewSummary = {
    ...buildInquirySummary(),
    prepareInquiryReviewSummary() {
      throw new Error("must not execute helper");
    },
  };

  const viewModel = inquiryReviewDisplayAdapter(reviewSummary);

  assert.equal(viewModel.title, "询盘复核");
});

test("output contains no executable action fields", () => {
  const viewModel = inquiryReviewDisplayAdapter(buildInquirySummary());
  const output = JSON.stringify(viewModel);

  assert.equal(output.includes("\"send\""), false);
  assert.equal(output.includes("\"quote\""), false);
  assert.equal(output.includes("\"createQuote\""), false);
  assert.equal(output.includes("\"createPi\""), false);
  assert.equal(output.includes("\"createOrder\""), false);
  assert.equal(output.includes("\"triggerProduction\""), false);
  assert.equal(output.includes("\"triggerShipment\""), false);
  assert.equal(output.includes("\"uiAction\""), false);
});

test("output contains no numbering or code generation fields", () => {
  const viewModel = inquiryReviewDisplayAdapter(buildInquirySummary());
  const output = JSON.stringify(viewModel);

  assert.equal(output.includes("code_suggestion"), false);
  assert.equal(output.includes("reserve_numbering_code"), false);
  assert.equal(output.includes("numbering"), false);
});

test("output contains no API, schema, or UI wiring fields", () => {
  const viewModel = inquiryReviewDisplayAdapter(buildInquirySummary());
  const output = JSON.stringify(viewModel);

  assert.equal(output.includes("apiRoute"), false);
  assert.equal(output.includes("endpoint"), false);
  assert.equal(output.includes("schema"), false);
  assert.equal(output.includes("component"), false);
});
