const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getReviewSummaryHelper,
} = require("../lib/services/orchestration");
const {
  registryMetadataDisplayAdapter,
  listRegistryMetadataDisplayModels,
} = require("../lib/services/display-adapters/registry-metadata-display-adapter");

test("exports registryMetadataDisplayAdapter", () => {
  assert.equal(typeof registryMetadataDisplayAdapter, "function");
});

test("exports listRegistryMetadataDisplayModels", () => {
  assert.equal(typeof listRegistryMetadataDisplayModels, "function");
});

test("known domain ai_draft returns Chinese title", () => {
  const viewModel = registryMetadataDisplayAdapter({ domain: "ai_draft" });

  assert.equal(viewModel.title, "AI 草稿复核");
});

test("known domain communication returns Chinese title", () => {
  const viewModel = registryMetadataDisplayAdapter({ domain: "communication" });

  assert.equal(viewModel.title, "沟通复核");
});

test("known domain inquiry returns Chinese title", () => {
  const viewModel = registryMetadataDisplayAdapter({ domain: "inquiry" });

  assert.equal(viewModel.title, "询盘复核");
});

test("unknown domain returns safe fallback view model", () => {
  const viewModel = registryMetadataDisplayAdapter({ domain: "unknown" });

  assert.equal(viewModel.title, "未知复核助手");
  assert.equal(viewModel.subtitle, "未找到可用的复核助手元数据。");
  assert.equal(viewModel.technicalDetails.domain, "unknown");
  assert.equal(viewModel.technicalDetails.helperReference, "none");
  assert.equal(viewModel.rawReference, null);
});

test("summaryRows include domain module and functionName", () => {
  const viewModel = registryMetadataDisplayAdapter({ domain: "inquiry" });
  const labels = viewModel.summaryRows.map((row) => row.label);
  const values = viewModel.summaryRows.map((row) => row.value);

  assert.ok(labels.includes("领域"));
  assert.ok(labels.includes("模块"));
  assert.ok(labels.includes("函数"));
  assert.ok(values.includes("inquiry"));
  assert.ok(values.includes("lib/services/inquiries"));
  assert.ok(values.includes("prepareInquiryReviewSummary"));
});

test("warningRows include forbiddenUse values", () => {
  const viewModel = registryMetadataDisplayAdapter({ domain: "ai_draft" });
  const values = viewModel.warningRows.map((row) => row.value);

  assert.ok(values.includes("send"));
  assert.ok(values.includes("approve"));
  assert.ok(values.includes("create_quote"));
  assert.ok(values.includes("create_pi"));
  assert.ok(values.includes("create_order"));
});

test("safetyRows include safetyFlags", () => {
  const viewModel = registryMetadataDisplayAdapter({ domain: "communication" });
  const keys = viewModel.safetyRows.map((row) => row.key);

  assert.ok(keys.includes("pure_local"));
  assert.ok(keys.includes("metadata_only"));
  assert.ok(keys.includes("no_api"));
  assert.ok(keys.includes("no_db"));
  assert.ok(keys.includes("no_write_actions"));
});

test("disabledCapabilities include risky false capabilities", () => {
  const viewModel = registryMetadataDisplayAdapter({ domain: "inquiry" });
  const keys = viewModel.disabledCapabilities.map((row) => row.key);

  assert.ok(keys.includes("can_send"));
  assert.ok(keys.includes("can_auto_reply"));
  assert.ok(keys.includes("can_auto_approve"));
  assert.ok(keys.includes("can_create_task"));
  assert.ok(keys.includes("can_create_quote"));
  assert.ok(keys.includes("can_create_pi"));
  assert.ok(keys.includes("can_create_order"));
  assert.ok(keys.includes("can_confirm_payment"));
  assert.ok(keys.includes("can_trigger_production"));
  assert.ok(keys.includes("can_trigger_shipment"));
  assert.ok(keys.includes("can_reserve_numbering_code"));
});

test("technicalDetails preserves internal domain and functionName", () => {
  const viewModel = registryMetadataDisplayAdapter({ domain: "ai_draft" });

  assert.equal(viewModel.technicalDetails.domain, "ai_draft");
  assert.equal(viewModel.technicalDetails.functionName, "prepareAiDraftReviewSummary");
});

test("technicalDetails does not expose executable helper function", () => {
  const viewModel = registryMetadataDisplayAdapter({ domain: "communication" });

  assert.equal(viewModel.technicalDetails.helperReference, "not displayed / not executable");
  assert.equal(typeof viewModel.technicalDetails.helperReference, "string");
  assert.equal(Object.prototype.hasOwnProperty.call(viewModel.technicalDetails, "helper"), false);
});

test("rawReference does not allow source metadata mutation", () => {
  const metadata = getReviewSummaryHelper("inquiry");
  const viewModel = registryMetadataDisplayAdapter({ metadata });

  viewModel.rawReference.label = "Changed";
  viewModel.rawReference.domain = "changed";

  assert.equal(metadata.label, "询盘复核");
  assert.equal(metadata.domain, "inquiry");
});

test("adapter does not execute helper function", () => {
  const metadata = {
    key: "fake",
    domain: "fake",
    label: "测试复核",
    description: "Metadata-only test.",
    module: "fake/module",
    functionName: "fakeHelper",
    helper: () => {
      throw new Error("helper should not execute");
    },
    forbiddenUse: ["send"],
    safetyFlags: { pure_local: true, metadata_only: true, no_api: true },
    outputCapabilities: { can_send: false },
    allowedUse: ["display_review_summary"],
    requiresHumanReviewFor: ["price"],
  };

  const viewModel = registryMetadataDisplayAdapter({ metadata });

  assert.equal(viewModel.title, "测试复核");
  assert.equal(Object.prototype.hasOwnProperty.call(viewModel, "draft_only"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(viewModel, "communication_only"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(viewModel, "inquiry_only"), false);
});

test("listRegistryMetadataDisplayModels returns exactly three view models", () => {
  const viewModels = listRegistryMetadataDisplayModels();

  assert.equal(viewModels.length, 3);
  assert.deepEqual(viewModels.map((viewModel) => viewModel.technicalDetails.domain), [
    "ai_draft",
    "communication",
    "inquiry",
  ]);
});

test("does not mutate input object", () => {
  const input = { domain: "ai_draft", options: { mode: "display" } };
  const snapshot = { domain: input.domain, options: { ...input.options } };

  registryMetadataDisplayAdapter(input);

  assert.deepEqual(input, snapshot);
});

test("does not mutate provided metadata", () => {
  const metadata = getReviewSummaryHelper("communication");
  const snapshot = {
    label: metadata.label,
    forbiddenUse: [...metadata.forbiddenUse],
    safetyFlags: { ...metadata.safetyFlags },
    outputCapabilities: { ...metadata.outputCapabilities },
  };

  registryMetadataDisplayAdapter({ metadata });

  assert.equal(metadata.label, snapshot.label);
  assert.deepEqual(metadata.forbiddenUse, snapshot.forbiddenUse);
  assert.deepEqual(metadata.safetyFlags, snapshot.safetyFlags);
  assert.deepEqual(metadata.outputCapabilities, snapshot.outputCapabilities);
});

test("missing fields fallback safely", () => {
  const viewModel = registryMetadataDisplayAdapter({
    metadata: {
      domain: "partial",
      forbiddenUse: [],
      safetyFlags: {},
      outputCapabilities: {},
    },
  });

  assert.equal(viewModel.title, "未知复核助手");
  assert.equal(viewModel.subtitle, "未找到可用的复核助手元数据。");
  assert.ok(viewModel.summaryRows.some((row) => row.value === "partial"));
});

test("no API schema or UI behavior exists", () => {
  const viewModel = registryMetadataDisplayAdapter({ domain: "inquiry" });

  assert.equal(Object.prototype.hasOwnProperty.call(viewModel, "apiRoute"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(viewModel, "schema"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(viewModel, "uiAction"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(viewModel, "send"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(viewModel, "approve"), false);
});
