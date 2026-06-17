const test = require("node:test");
const assert = require("node:assert/strict");

const displayAdapters = require("../lib/services/display-adapters");

test("index exports registryMetadataDisplayAdapter", () => {
  assert.equal(typeof displayAdapters.registryMetadataDisplayAdapter, "function");
});

test("index exports aiDraftReviewDisplayAdapter", () => {
  assert.equal(typeof displayAdapters.aiDraftReviewDisplayAdapter, "function");
});

test("index exports communicationReviewDisplayAdapter", () => {
  assert.equal(typeof displayAdapters.communicationReviewDisplayAdapter, "function");
});

test("index exports inquiryReviewDisplayAdapter", () => {
  assert.equal(typeof displayAdapters.inquiryReviewDisplayAdapter, "function");
});

test("index exports listRegistryMetadataDisplayModels", () => {
  assert.equal(typeof displayAdapters.listRegistryMetadataDisplayModels, "function");
});

test("aiDraftReviewDisplayAdapter works through index export", () => {
  const viewModel = displayAdapters.aiDraftReviewDisplayAdapter({
    normalized_draft: {
      draft_type: "customer_reply_draft",
      task_type: "communication_summary",
    },
    risk_level: "high",
    action_boundary: "review_required",
    approval_required: true,
    needs_human_review: true,
    warnings: [],
    draft_only: true,
    can_send: false,
    can_auto_approve: false,
  });

  assert.equal(viewModel.title, "AI 草稿复核");
  assert.equal(viewModel.technicalDetails.risk_level, "high");
});

test("communicationReviewDisplayAdapter works through index export", () => {
  const viewModel = displayAdapters.communicationReviewDisplayAdapter({
    normalized_communication: {
      direction: "inbound",
      channel: "email",
    },
    direction: "inbound",
    channel: "email",
    visibility: "normal",
    status: "active",
    warnings: [],
    review_required: true,
    needs_human_review: true,
    communication_only: true,
    can_send: false,
    can_auto_reply: false,
    can_create_task: false,
  });

  assert.equal(viewModel.title, "沟通复核");
  assert.equal(viewModel.technicalDetails.channel, "email");
});

test("inquiryReviewDisplayAdapter works through index export", () => {
  const viewModel = displayAdapters.inquiryReviewDisplayAdapter({
    normalized_inquiry: {
      inquiry_type: "website",
      customer_name: "Demo Customer",
      business_line: "A_ARCHITECTURAL",
      status: "new",
    },
    missing_information: ["drawing"],
    risk_flags: ["delivery_related"],
    warnings: [],
    review_required: true,
    needs_human_review: true,
    inquiry_only: true,
    can_send: false,
    can_create_quote: false,
    can_create_pi: false,
    can_create_order: false,
    can_trigger_production: false,
    can_trigger_shipment: false,
  });

  assert.equal(viewModel.title, "询盘复核");
  assert.equal(viewModel.technicalDetails.can_create_quote, false);
});

test("registryMetadataDisplayAdapter works through index export", () => {
  const viewModel = displayAdapters.registryMetadataDisplayAdapter({ domain: "ai_draft" });

  assert.equal(viewModel.title, "AI 草稿复核");
  assert.equal(viewModel.technicalDetails.domain, "ai_draft");
});

test("listRegistryMetadataDisplayModels works through index export", () => {
  const viewModels = displayAdapters.listRegistryMetadataDisplayModels();

  assert.equal(viewModels.length, 3);
  assert.deepEqual(viewModels.map((viewModel) => viewModel.title), [
    "AI 草稿复核",
    "沟通复核",
    "询盘复核",
  ]);
});
