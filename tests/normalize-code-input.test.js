const test = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizeCodeInput,
  normalizeCountryCode,
  normalizeCustomerType,
  normalizeObjectType,
  normalizeSequence,
  normalizeSourceCode,
  normalizeSupplierCategory,
  normalizeYear,
} = require("../lib/services/numbering/normalize-code-input");

test("lowercase country type source and category are normalized to uppercase", () => {
  const result = normalizeCodeInput({
    object_type: "customer_company",
    country_code: " pe ",
    customer_type: "dist",
    source_code: "ali",
    supplier_category: "alu",
    year: 2026,
    sequence: 1,
  });

  assert.equal(result.normalized_input.country_code, "PE");
  assert.equal(result.normalized_input.customer_type, "DIST");
  assert.equal(result.normalized_input.source_code, "ALI");
  assert.equal(result.normalized_input.supplier_category, "ALU");
});

test("missing country returns XX with warning", () => {
  const result = normalizeCountryCode("");

  assert.equal(result.value, "XX");
  assert.match(result.warnings.join(" "), /Missing country_code/);
});

test("missing customer type returns UNK with warning", () => {
  const result = normalizeCustomerType("");

  assert.equal(result.value, "UNK");
  assert.match(result.warnings.join(" "), /Missing customer_type/);
});

test("unknown customer type returns UNK with warning", () => {
  const result = normalizeCustomerType("bad");

  assert.equal(result.value, "UNK");
  assert.match(result.warnings.join(" "), /Unknown customer_type/);
});

test("missing source returns MAN with warning", () => {
  const result = normalizeSourceCode("");

  assert.equal(result.value, "MAN");
  assert.match(result.warnings.join(" "), /Missing source_code/);
});

test("unknown source returns MAN with warning", () => {
  const result = normalizeSourceCode("bad");

  assert.equal(result.value, "MAN");
  assert.match(result.warnings.join(" "), /Unknown source_code/);
});

test("missing supplier category returns OTH with warning", () => {
  const result = normalizeSupplierCategory("");

  assert.equal(result.value, "OTH");
  assert.match(result.warnings.join(" "), /Missing supplier_category/);
});

test("unknown supplier category returns OTH with warning", () => {
  const result = normalizeSupplierCategory("bad");

  assert.equal(result.value, "OTH");
  assert.match(result.warnings.join(" "), /Unknown supplier_category/);
});

test("known object type passes", () => {
  const result = normalizeObjectType("customer_company");

  assert.equal(result.value, "customer_company");
  assert.equal(result.needs_human_review, false);
  assert.deepEqual(result.warnings, []);
});

test("unknown object type requires human review", () => {
  const result = normalizeObjectType("bad_object");

  assert.equal(result.value, "bad_object");
  assert.equal(result.needs_human_review, true);
  assert.match(result.warnings.join(" "), /Unknown object_type/);
});

test("numeric string year and sequence are accepted", () => {
  assert.equal(normalizeYear("2026").value, 2026);
  assert.equal(normalizeSequence("12").value, 12);
});

test("invalid year requires human review", () => {
  const result = normalizeYear("26");

  assert.equal(result.value, null);
  assert.equal(result.needs_human_review, true);
  assert.match(result.warnings.join(" "), /Invalid or missing year/);
});

test("invalid sequence requires human review", () => {
  const result = normalizeSequence("0");

  assert.equal(result.value, null);
  assert.equal(result.needs_human_review, true);
  assert.match(result.warnings.join(" "), /Invalid or missing sequence/);
});

test("normalizeCodeInput does not mutate original input", () => {
  const input = {
    object_type: "customer_company",
    country_code: " pe ",
    customer_type: "dist",
    source_code: "ali",
    supplier_category: "alu",
    year: "2026",
    sequence: "1",
  };
  const snapshot = { ...input };
  const result = normalizeCodeInput(input);

  assert.deepEqual(input, snapshot);
  assert.equal(result.normalized_input.country_code, "PE");
});
