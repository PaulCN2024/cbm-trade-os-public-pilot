const test = require("node:test");
const assert = require("node:assert/strict");

const orchestration = require("../lib/services/orchestration");

test("index exports review summary registry pieces", () => {
  assert.ok(orchestration.REVIEW_SUMMARY_HELPER_DOMAINS);
  assert.ok(orchestration.REVIEW_SUMMARY_HELPERS);
  assert.equal(typeof orchestration.getReviewSummaryHelper, "function");
  assert.equal(typeof orchestration.listReviewSummaryHelpers, "function");
});

test("getReviewSummaryHelper works through index export", () => {
  const helper = orchestration.getReviewSummaryHelper("communication");

  assert.equal(helper.key, "communication");
  assert.equal(helper.functionName, "prepareCommunicationReviewSummary");
});

test("listReviewSummaryHelpers works through index export", () => {
  const helpers = orchestration.listReviewSummaryHelpers();

  assert.equal(helpers.length, 3);
  assert.deepEqual(helpers.map((helper) => helper.domain), [
    "ai_draft",
    "communication",
    "inquiry",
  ]);
});
