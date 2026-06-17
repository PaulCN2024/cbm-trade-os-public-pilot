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
