const test = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizeAttachmentType,
  normalizeCommunicationChannel,
  normalizeCommunicationDirection,
  normalizeCommunicationInput,
  normalizeCommunicationStatus,
  normalizeCommunicationVisibility,
} = require("../lib/services/communication/normalize-communication-input");

function assertFallback(result, expectedValue, warningText, needsHumanReview) {
  assert.equal(result.value, expectedValue);
  assert.equal(result.needs_human_review, needsHumanReview);
  assert.ok(result.warnings.some((warning) => warning.includes(warningText)));
}

test("lowercase uppercase and mixed values normalize correctly", () => {
  assert.equal(normalizeCommunicationDirection(" InBound ").value, "inbound");
  assert.equal(normalizeCommunicationChannel(" WhatsApp ").value, "whatsapp");
  assert.equal(normalizeAttachmentType(" Supplier_Quote ").value, "supplier_quote");
  assert.equal(normalizeCommunicationVisibility(" Finance_Only ").value, "finance_only");
  assert.equal(normalizeCommunicationStatus(" Need_Follow_Up ").value, "need_follow_up");
});

test("missing direction falls back to default with warning", () => {
  assertFallback(normalizeCommunicationDirection(), "internal", "direction missing", false);
});

test("unknown direction falls back and requires human review", () => {
  assertFallback(normalizeCommunicationDirection("customer"), "internal", "direction unknown", true);
});

test("missing channel falls back to default with warning", () => {
  assertFallback(normalizeCommunicationChannel(" "), "manual_note", "channel missing", false);
});

test("unknown channel falls back and requires human review", () => {
  assertFallback(normalizeCommunicationChannel("telegram"), "manual_note", "channel unknown", true);
});

test("missing attachment type falls back to default with warning", () => {
  assertFallback(normalizeAttachmentType(null), "other", "attachment_type missing", false);
});

test("unknown attachment type falls back and requires human review", () => {
  assertFallback(normalizeAttachmentType("contract"), "other", "attachment_type unknown", true);
});

test("missing visibility falls back to default with warning", () => {
  assertFallback(normalizeCommunicationVisibility(undefined), "normal", "visibility missing", false);
});

test("unknown visibility falls back and requires human review", () => {
  assertFallback(normalizeCommunicationVisibility("team_only"), "normal", "visibility unknown", true);
});

test("missing status falls back to default with warning", () => {
  assertFallback(normalizeCommunicationStatus(""), "active", "status missing", false);
});

test("unknown status falls back and requires human review", () => {
  assertFallback(normalizeCommunicationStatus("sent"), "active", "status unknown", true);
});

test("normalizeCommunicationInput preserves unrelated fields", () => {
  const result = normalizeCommunicationInput({
    direction: "outbound",
    channel: "email",
    subject: "RFQ draft",
    related_customer_id: "customer_001",
  });

  assert.equal(result.normalized_input.subject, "RFQ draft");
  assert.equal(result.normalized_input.related_customer_id, "customer_001");
});

test("normalizeCommunicationInput does not mutate original input", () => {
  const input = {
    direction: "OUTBOUND",
    channel: "EMAIL",
    attachment_type: "DRAWING",
    visibility: "NORMAL",
    status: "ACTIVE",
  };
  const snapshot = { ...input };

  normalizeCommunicationInput(input);

  assert.deepEqual(input, snapshot);
});

test("normalizeCommunicationInput aggregates warnings", () => {
  const result = normalizeCommunicationInput({
    direction: "sms",
    channel: "telegram",
    attachment_type: "contract",
    visibility: "team_only",
    status: "sent",
  });

  assert.equal(result.warnings.length, 5);
  assert.ok(result.warnings.some((warning) => warning.includes("direction unknown")));
  assert.ok(result.warnings.some((warning) => warning.includes("channel unknown")));
  assert.ok(result.warnings.some((warning) => warning.includes("attachment_type unknown")));
  assert.ok(result.warnings.some((warning) => warning.includes("visibility unknown")));
  assert.ok(result.warnings.some((warning) => warning.includes("status unknown")));
});

test("normalizeCommunicationInput sets needs_human_review when any field needs review", () => {
  const result = normalizeCommunicationInput({
    direction: "internal",
    channel: "email",
    attachment_type: "drawing",
    visibility: "confidential",
    status: "waiting_customer_reply",
  });

  assert.equal(result.needs_human_review, false);

  const reviewResult = normalizeCommunicationInput({
    direction: "internal",
    channel: "unknown_channel",
    attachment_type: "drawing",
    visibility: "confidential",
    status: "waiting_customer_reply",
  });

  assert.equal(reviewResult.needs_human_review, true);
});
