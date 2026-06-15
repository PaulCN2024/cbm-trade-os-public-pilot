const test = require("node:test");
const assert = require("node:assert/strict");

const {
  checkDuplicateCodeCandidate,
  normalizeExistingRecords,
} = require("../lib/services/numbering/duplicate-check");

test("exact code match detects duplicate", () => {
  const result = checkDuplicateCodeCandidate({
    candidate_code: "CUST-PE-DIST-ALI-2026-0001",
    existing_records: [{ code: "CUST-PE-DIST-ALI-2026-0001" }],
  });

  assert.equal(result.has_possible_duplicate, true);
  assert.deepEqual(result.duplicate_candidates[0].reasons, ["code_match"]);
});

test("exact email match detects duplicate", () => {
  const result = checkDuplicateCodeCandidate({
    candidate_email: "buyer@example.com",
    existing_records: [{ email: "buyer@example.com" }],
  });

  assert.equal(result.has_possible_duplicate, true);
  assert.deepEqual(result.duplicate_candidates[0].reasons, ["email_match"]);
});

test("exact phone match detects duplicate", () => {
  const result = checkDuplicateCodeCandidate({
    candidate_phone: "+50760000000",
    existing_records: [{ phone: "+50760000000" }],
  });

  assert.equal(result.has_possible_duplicate, true);
  assert.deepEqual(result.duplicate_candidates[0].reasons, ["phone_match"]);
});

test("exact website match detects duplicate", () => {
  const result = checkDuplicateCodeCandidate({
    candidate_website: "https://example.com",
    existing_records: [{ website: "https://example.com" }],
  });

  assert.equal(result.has_possible_duplicate, true);
  assert.deepEqual(result.duplicate_candidates[0].reasons, ["website_match"]);
});

test("normalized exact name match detects duplicate", () => {
  const result = checkDuplicateCodeCandidate({
    candidate_name: "  ABC Industries Ltd. ",
    existing_records: [{ company_name: "abc industries ltd." }],
  });

  assert.equal(result.has_possible_duplicate, true);
  assert.deepEqual(result.duplicate_candidates[0].reasons, ["name_match"]);
});

test("missing existing_records returns no duplicates with warning", () => {
  const result = checkDuplicateCodeCandidate({
    candidate_code: "CUST-PE-DIST-ALI-2026-0001",
  });

  assert.equal(result.has_possible_duplicate, false);
  assert.equal(result.needs_human_review, false);
  assert.match(result.warnings.join(" "), /Real database duplicate check is not performed/);
});

test("empty existing_records returns no duplicates with warning", () => {
  const result = checkDuplicateCodeCandidate({
    candidate_code: "CUST-PE-DIST-ALI-2026-0001",
    existing_records: [],
  });

  assert.equal(result.has_possible_duplicate, false);
  assert.equal(result.needs_human_review, false);
  assert.match(result.warnings.join(" "), /No existing_records provided/);
});

test("duplicates set needs_human_review true", () => {
  const result = checkDuplicateCodeCandidate({
    candidate_email: "buyer@example.com",
    existing_records: [{ email: "buyer@example.com" }],
  });

  assert.equal(result.needs_human_review, true);
});

test("no duplicates returns needs_human_review false", () => {
  const result = checkDuplicateCodeCandidate({
    candidate_email: "buyer@example.com",
    existing_records: [{ email: "other@example.com" }],
  });

  assert.equal(result.has_possible_duplicate, false);
  assert.equal(result.needs_human_review, false);
  assert.deepEqual(result.duplicate_candidates, []);
});

test("original input is not mutated", () => {
  const input = {
    candidate_name: " ABC Industries Ltd. ",
    existing_records: [{ company_name: "abc industries ltd." }],
  };
  const snapshot = JSON.parse(JSON.stringify(input));
  const result = checkDuplicateCodeCandidate(input);

  assert.equal(result.has_possible_duplicate, true);
  assert.deepEqual(input, snapshot);
});

test("normalizeExistingRecords supports minimal aliases", () => {
  const records = normalizeExistingRecords([
    {
      business_code: "CUST-PE-DIST-ALI-2026-0001",
      customer_name: "Kevin",
    },
  ]);

  assert.equal(records[0].code, "CUST-PE-DIST-ALI-2026-0001");
  assert.equal(records[0].name, "kevin");
});
