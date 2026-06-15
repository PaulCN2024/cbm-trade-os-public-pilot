const test = require("node:test");
const assert = require("node:assert/strict");

const numbering = require("../lib/services/numbering");

test("numbering index exports dictionaries", () => {
  assert.ok(numbering.CUSTOMER_TYPE_CODES);
  assert.ok(numbering.SOURCE_CODES);
  assert.ok(numbering.SUPPLIER_CATEGORY_CODES);
  assert.ok(numbering.OBJECT_TYPE_CODES);
  assert.ok(numbering.DEFAULT_CODES);
});

test("numbering index exports generateCodeSuggestion", () => {
  assert.equal(typeof numbering.generateCodeSuggestion, "function");
});

test("numbering index exports normalization helpers", () => {
  assert.equal(typeof numbering.normalizeCodeInput, "function");
  assert.equal(typeof numbering.normalizeCountryCode, "function");
  assert.equal(typeof numbering.normalizeCustomerType, "function");
  assert.equal(typeof numbering.normalizeSourceCode, "function");
  assert.equal(typeof numbering.normalizeSupplierCategory, "function");
  assert.equal(typeof numbering.normalizeObjectType, "function");
  assert.equal(typeof numbering.normalizeYear, "function");
  assert.equal(typeof numbering.normalizeSequence, "function");
});

test("numbering index exports duplicate check helpers", () => {
  assert.equal(typeof numbering.checkDuplicateCodeCandidate, "function");
  assert.equal(typeof numbering.normalizeExistingRecords, "function");
});
