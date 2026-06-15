const test = require("node:test");
const assert = require("node:assert/strict");

const { generateCodeSuggestion } = require("../lib/services/numbering/generate-code-suggestion");

test("generates customer company suggestion", () => {
  const result = generateCodeSuggestion({
    object_type: "customer_company",
    country_code: "PE",
    customer_type: "DIST",
    source_code: "ALI",
    year: 2026,
    sequence: 1,
  });

  assert.equal(result.code, "CUST-PE-DIST-ALI-2026-0001");
  assert.equal(result.needs_human_review, false);
});

test("generates customer contact suggestion from parent code", () => {
  const result = generateCodeSuggestion({
    object_type: "customer_contact",
    parent_code: "CUST-PE-DIST-ALI-2026-0001",
    year: 2026,
    sequence: 1,
  });

  assert.equal(result.code, "CUST-PE-DIST-ALI-2026-0001-C01");
  assert.equal(result.needs_human_review, false);
});

test("generates supplier company suggestion", () => {
  const result = generateCodeSuggestion({
    object_type: "supplier_company",
    country_code: "CN",
    supplier_category: "ALU",
    source_code: "MAN",
    year: 2026,
    sequence: 1,
  });

  assert.equal(result.code, "SUP-CN-ALU-MAN-2026-0001");
  assert.equal(result.needs_human_review, false);
});

test("generates inquiry suggestion", () => {
  const result = generateCodeSuggestion({
    object_type: "inquiry",
    country_code: "PE",
    year: 2026,
    sequence: 1,
  });

  assert.equal(result.code, "INQ-PE-2026-0001");
});

test("generates customer quotation suggestion", () => {
  const result = generateCodeSuggestion({
    object_type: "customer_quotation",
    country_code: "PE",
    year: 2026,
    sequence: 1,
  });

  assert.equal(result.code, "QUO-PE-2026-0001");
});

test("generates document suggestion", () => {
  const result = generateCodeSuggestion({
    object_type: "document",
    year: 2026,
    sequence: 1,
  });

  assert.equal(result.code, "DOC-2026-0001");
});

test("generates knowledge article suggestion", () => {
  const result = generateCodeSuggestion({
    object_type: "knowledge_article",
    year: 2026,
    sequence: 1,
  });

  assert.equal(result.code, "KB-2026-0001");
});

test("generates approval review suggestion", () => {
  const result = generateCodeSuggestion({
    object_type: "approval_review",
    year: 2026,
    sequence: 1,
  });

  assert.equal(result.code, "APR-2026-0001");
});

test("uses fallback country source type and category values", () => {
  const customer = generateCodeSuggestion({
    object_type: "customer_company",
    year: 2026,
    sequence: 1,
  });
  const supplier = generateCodeSuggestion({
    object_type: "supplier_company",
    year: 2026,
    sequence: 1,
  });

  assert.equal(customer.code, "CUST-XX-UNK-MAN-2026-0001");
  assert.equal(supplier.code, "SUP-XX-OTH-MAN-2026-0001");
});

test("unknown object_type requires human review", () => {
  const result = generateCodeSuggestion({
    object_type: "unknown_object",
    year: 2026,
    sequence: 1,
  });

  assert.equal(result.code, "");
  assert.equal(result.needs_human_review, true);
  assert.match(result.warnings.join(" "), /Unknown object_type/);
});

test("missing parent_code for contact requires human review", () => {
  const result = generateCodeSuggestion({
    object_type: "supplier_contact",
    year: 2026,
    sequence: 1,
  });

  assert.equal(result.code, "");
  assert.equal(result.needs_human_review, true);
  assert.match(result.warnings.join(" "), /Missing parent_code/);
});

test("invalid year or sequence requires human review", () => {
  const invalidYear = generateCodeSuggestion({
    object_type: "document",
    year: "26",
    sequence: 1,
  });
  const invalidSequence = generateCodeSuggestion({
    object_type: "document",
    year: 2026,
    sequence: 0,
  });

  assert.equal(invalidYear.needs_human_review, true);
  assert.match(invalidYear.warnings.join(" "), /Invalid or missing year/);
  assert.equal(invalidSequence.needs_human_review, true);
  assert.match(invalidSequence.warnings.join(" "), /Invalid or missing sequence/);
});
