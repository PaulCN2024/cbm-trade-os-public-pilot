const test = require("node:test");
const assert = require("node:assert/strict");

const {
  CUSTOMER_TYPE_CODES,
  SOURCE_CODES,
  SUPPLIER_CATEGORY_CODES,
  OBJECT_TYPE_CODES,
  DEFAULT_CODES,
  CUSTOMER_TYPE_CODE_VALUES,
  SOURCE_CODE_VALUES,
  SUPPLIER_CATEGORY_CODE_VALUES,
  OBJECT_TYPE_CODE_VALUES,
} = require("../lib/services/numbering/code-dictionaries");

function assertNoDuplicateValues(dictionary) {
  const values = Object.values(dictionary);
  assert.equal(new Set(values).size, values.length);
}

test("numbering dictionaries export required objects and helper arrays", () => {
  assert.ok(CUSTOMER_TYPE_CODES);
  assert.ok(SOURCE_CODES);
  assert.ok(SUPPLIER_CATEGORY_CODES);
  assert.ok(OBJECT_TYPE_CODES);
  assert.ok(DEFAULT_CODES);
  assert.ok(Array.isArray(CUSTOMER_TYPE_CODE_VALUES));
  assert.ok(Array.isArray(SOURCE_CODE_VALUES));
  assert.ok(Array.isArray(SUPPLIER_CATEGORY_CODE_VALUES));
  assert.ok(Array.isArray(OBJECT_TYPE_CODE_VALUES));
});

test("fallback codes exist", () => {
  assert.equal(CUSTOMER_TYPE_CODES.UNK, "Unknown");
  assert.equal(SUPPLIER_CATEGORY_CODES.OTH, "Other");
  assert.equal(SOURCE_CODES.MAN, "Manual Entry");
  assert.equal(DEFAULT_CODES.UNKNOWN_COUNTRY, "XX");
  assert.equal(DEFAULT_CODES.UNKNOWN_CUSTOMER_TYPE, "UNK");
  assert.equal(DEFAULT_CODES.UNKNOWN_SOURCE, "MAN");
  assert.equal(DEFAULT_CODES.OTHER_SUPPLIER_CATEGORY, "OTH");
});

test("object type codes include core business objects", () => {
  for (const code of ["CUST", "SUP", "INQ", "RFQ", "QUO", "PI", "DOC", "ATT", "KB", "APR"]) {
    assert.ok(OBJECT_TYPE_CODE_VALUES.includes(code));
  }
});

test("dictionary values do not contain duplicates", () => {
  assertNoDuplicateValues(CUSTOMER_TYPE_CODES);
  assertNoDuplicateValues(SOURCE_CODES);
  assertNoDuplicateValues(SUPPLIER_CATEGORY_CODES);
  assertNoDuplicateValues(OBJECT_TYPE_CODES);
});

test("customer example code can be represented by available codes", () => {
  const parts = {
    object: OBJECT_TYPE_CODES.customer_company,
    country: "PE",
    type: "DIST",
    source: "ALI",
    year: "2026",
    sequence: "0001",
  };

  assert.equal(parts.object, "CUST");
  assert.ok(CUSTOMER_TYPE_CODE_VALUES.includes(parts.type));
  assert.ok(SOURCE_CODE_VALUES.includes(parts.source));
  assert.equal(`${parts.object}-${parts.country}-${parts.type}-${parts.source}-${parts.year}-${parts.sequence}`, "CUST-PE-DIST-ALI-2026-0001");
});

test("supplier example code can be represented by available codes", () => {
  const parts = {
    object: OBJECT_TYPE_CODES.supplier_company,
    country: "CN",
    category: "ALU",
    source: "MAN",
    year: "2026",
    sequence: "0001",
  };

  assert.equal(parts.object, "SUP");
  assert.ok(SUPPLIER_CATEGORY_CODE_VALUES.includes(parts.category));
  assert.ok(SOURCE_CODE_VALUES.includes(parts.source));
  assert.equal(`${parts.object}-${parts.country}-${parts.category}-${parts.source}-${parts.year}-${parts.sequence}`, "SUP-CN-ALU-MAN-2026-0001");
});
