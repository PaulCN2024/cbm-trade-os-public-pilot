const test = require("node:test");
const assert = require("node:assert/strict");

const {
  prepareAiDraftReviewSummary,
} = require("../lib/services/ai-drafts/prepare-ai-draft-review-summary");
const {
  prepareCommunicationReviewSummary,
} = require("../lib/services/communication/prepare-communication-review-summary");
const {
  prepareInquiryReviewSummary,
} = require("../lib/services/inquiries/prepare-inquiry-review-summary");
const {
  REVIEW_SUMMARY_HELPER_DOMAINS,
  REVIEW_SUMMARY_HELPERS,
  getReviewSummaryHelper,
  listReviewSummaryHelpers,
} = require("../lib/services/orchestration/review-summary-registry");

const REQUIRED_FORBIDDEN_USE = [
  "send",
  "approve",
  "create_quote",
  "create_pi",
  "create_order",
  "reserve_numbering_code",
];

const RISKY_OUTPUT_CAPABILITIES = [
  "can_send",
  "can_auto_reply",
  "can_auto_approve",
  "can_create_task",
  "can_create_quote",
  "can_create_pi",
  "can_create_order",
  "can_confirm_payment",
  "can_trigger_production",
  "can_trigger_shipment",
  "can_reserve_numbering_code",
];

test("exports review summary registry pieces", () => {
  assert.ok(REVIEW_SUMMARY_HELPER_DOMAINS);
  assert.ok(REVIEW_SUMMARY_HELPERS);
  assert.equal(typeof getReviewSummaryHelper, "function");
  assert.equal(typeof listReviewSummaryHelpers, "function");
});

test("domains include exactly ai_draft communication and inquiry", () => {
  assert.deepEqual(Object.keys(REVIEW_SUMMARY_HELPER_DOMAINS), [
    "ai_draft",
    "communication",
    "inquiry",
  ]);
  assert.deepEqual(Object.values(REVIEW_SUMMARY_HELPER_DOMAINS), [
    "ai_draft",
    "communication",
    "inquiry",
  ]);
});

test("listReviewSummaryHelpers returns exactly three helpers", () => {
  const helpers = listReviewSummaryHelpers();

  assert.equal(helpers.length, 3);
  assert.deepEqual(helpers.map((helper) => helper.key), [
    "ai_draft",
    "communication",
    "inquiry",
  ]);
});

test("getReviewSummaryHelper returns ai draft metadata", () => {
  const helper = getReviewSummaryHelper("ai_draft");

  assert.equal(helper.functionName, "prepareAiDraftReviewSummary");
  assert.equal(helper.helper, prepareAiDraftReviewSummary);
});

test("getReviewSummaryHelper returns communication metadata", () => {
  const helper = getReviewSummaryHelper("communication");

  assert.equal(helper.functionName, "prepareCommunicationReviewSummary");
  assert.equal(helper.helper, prepareCommunicationReviewSummary);
});

test("getReviewSummaryHelper returns inquiry metadata", () => {
  const helper = getReviewSummaryHelper("inquiry");

  assert.equal(helper.functionName, "prepareInquiryReviewSummary");
  assert.equal(helper.helper, prepareInquiryReviewSummary);
});

test("unknown missing or non-string domain returns null", () => {
  assert.equal(getReviewSummaryHelper("unknown"), null);
  assert.equal(getReviewSummaryHelper(), null);
  assert.equal(getReviewSummaryHelper(null), null);
  assert.equal(getReviewSummaryHelper({ domain: "inquiry" }), null);
});

test("metadata includes helper reference but lookup and list do not execute helpers", () => {
  const helper = getReviewSummaryHelper("ai_draft");
  const helpers = listReviewSummaryHelpers();

  assert.equal(typeof helper.helper, "function");
  assert.equal(typeof helpers[0].helper, "function");
  assert.equal(Object.prototype.hasOwnProperty.call(helper, "draft_only"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(helpers[0], "draft_only"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(helpers[1], "communication_only"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(helpers[2], "inquiry_only"), false);
});

test("all metadata forbiddenUse arrays include required blocked actions", () => {
  for (const helper of listReviewSummaryHelpers()) {
    for (const forbiddenUse of REQUIRED_FORBIDDEN_USE) {
      assert.ok(helper.forbiddenUse.includes(forbiddenUse));
    }
  }
});

test("all outputCapabilities risky actions are false", () => {
  for (const helper of listReviewSummaryHelpers()) {
    for (const capability of RISKY_OUTPUT_CAPABILITIES) {
      assert.equal(helper.outputCapabilities[capability], false);
    }
  }
});

test("all safetyFlags include pure local no api no db no external send and no write actions", () => {
  for (const helper of listReviewSummaryHelpers()) {
    assert.equal(helper.safetyFlags.pure_local, true);
    assert.equal(helper.safetyFlags.no_api, true);
    assert.equal(helper.safetyFlags.no_db, true);
    assert.equal(helper.safetyFlags.no_external_send, true);
    assert.equal(helper.safetyFlags.no_write_actions, true);
  }
});

test("mutating returned metadata does not mutate registry source", () => {
  const helper = getReviewSummaryHelper("inquiry");

  helper.label = "Changed";
  helper.forbiddenUse.push("changed_action");
  helper.safetyFlags.no_api = false;
  helper.outputCapabilities.can_send = true;

  const freshHelper = getReviewSummaryHelper("inquiry");

  assert.equal(freshHelper.label, "询盘复核");
  assert.equal(freshHelper.forbiddenUse.includes("changed_action"), false);
  assert.equal(freshHelper.safetyFlags.no_api, true);
  assert.equal(freshHelper.outputCapabilities.can_send, false);
});

test("registry metadata has no api schema or ui behavior", () => {
  for (const helper of listReviewSummaryHelpers()) {
    assert.equal(helper.safetyFlags.metadata_only, true);
    assert.equal(helper.safetyFlags.no_api, true);
    assert.equal(helper.safetyFlags.no_db, true);
    assert.equal(helper.safetyFlags.no_write_actions, true);
    assert.equal(helper.outputCapabilities.can_create_task, false);
    assert.equal(helper.outputCapabilities.can_create_quote, false);
    assert.equal(helper.outputCapabilities.can_create_pi, false);
    assert.equal(helper.outputCapabilities.can_create_order, false);
  }
});
