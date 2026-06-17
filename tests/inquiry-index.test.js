const test = require("node:test");
const assert = require("node:assert/strict");

const inquiries = require("../lib/services/inquiries");

test("inquiry index exports review summary helper", () => {
  assert.equal(typeof inquiries.prepareInquiryReviewSummary, "function");
});
