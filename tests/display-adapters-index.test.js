const test = require("node:test");
const assert = require("node:assert/strict");

const displayAdapters = require("../lib/services/display-adapters");

test("index exports registryMetadataDisplayAdapter", () => {
  assert.equal(typeof displayAdapters.registryMetadataDisplayAdapter, "function");
});

test("index exports listRegistryMetadataDisplayModels", () => {
  assert.equal(typeof displayAdapters.listRegistryMetadataDisplayModels, "function");
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
