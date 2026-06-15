const test = require("node:test");
const assert = require("node:assert/strict");

const {
  ATTACHMENT_TYPES,
  ATTACHMENT_TYPE_VALUES,
  COMMUNICATION_CHANNELS,
  COMMUNICATION_CHANNEL_VALUES,
  COMMUNICATION_DIRECTIONS,
  COMMUNICATION_DIRECTION_VALUES,
  COMMUNICATION_STATUS,
  COMMUNICATION_STATUS_VALUES,
  COMMUNICATION_VISIBILITY_LEVELS,
  COMMUNICATION_VISIBILITY_VALUES,
  DEFAULT_COMMUNICATION_VALUES,
} = require("../lib/services/communication/communication-constants");

function assertNoDuplicateValues(dictionary) {
  const values = Object.values(dictionary);
  assert.equal(new Set(values).size, values.length);
}

test("communication dictionaries export successfully", () => {
  assert.ok(COMMUNICATION_DIRECTIONS);
  assert.ok(COMMUNICATION_CHANNELS);
  assert.ok(ATTACHMENT_TYPES);
  assert.ok(COMMUNICATION_VISIBILITY_LEVELS);
  assert.ok(COMMUNICATION_STATUS);
  assert.ok(DEFAULT_COMMUNICATION_VALUES);
});

test("required direction values exist", () => {
  for (const value of ["inbound", "outbound", "internal", "system", "ai_draft"]) {
    assert.ok(COMMUNICATION_DIRECTION_VALUES.includes(value));
  }
});

test("required channel values exist", () => {
  for (const value of ["email", "whatsapp", "wechat", "phone", "meeting", "website", "alibaba", "made_in_china", "manual_note", "system_note", "ai_command"]) {
    assert.ok(COMMUNICATION_CHANNEL_VALUES.includes(value));
  }
});

test("required attachment type values exist", () => {
  for (const value of ["drawing", "photo", "quotation", "supplier_quote", "pi", "invoice", "payment_slip", "product_spec", "packing_info", "video", "certificate", "screenshot", "other"]) {
    assert.ok(ATTACHMENT_TYPE_VALUES.includes(value));
  }
});

test("required visibility values exist", () => {
  for (const value of ["normal", "internal", "confidential", "owner_only", "finance_only", "supplier_sensitive", "customer_sensitive"]) {
    assert.ok(COMMUNICATION_VISIBILITY_VALUES.includes(value));
  }
});

test("required status values exist", () => {
  for (const value of ["active", "waiting_customer_reply", "waiting_supplier_reply", "need_follow_up", "closed", "archived"]) {
    assert.ok(COMMUNICATION_STATUS_VALUES.includes(value));
  }
});

test("default values exist and are valid dictionary members", () => {
  assert.ok(COMMUNICATION_DIRECTION_VALUES.includes(DEFAULT_COMMUNICATION_VALUES.DEFAULT_DIRECTION));
  assert.ok(COMMUNICATION_CHANNEL_VALUES.includes(DEFAULT_COMMUNICATION_VALUES.DEFAULT_CHANNEL));
  assert.ok(ATTACHMENT_TYPE_VALUES.includes(DEFAULT_COMMUNICATION_VALUES.DEFAULT_ATTACHMENT_TYPE));
  assert.ok(COMMUNICATION_VISIBILITY_VALUES.includes(DEFAULT_COMMUNICATION_VALUES.DEFAULT_VISIBILITY));
  assert.ok(COMMUNICATION_STATUS_VALUES.includes(DEFAULT_COMMUNICATION_VALUES.DEFAULT_STATUS));
});

test("communication dictionaries do not contain duplicate labels", () => {
  assertNoDuplicateValues(COMMUNICATION_DIRECTIONS);
  assertNoDuplicateValues(COMMUNICATION_CHANNELS);
  assertNoDuplicateValues(ATTACHMENT_TYPES);
  assertNoDuplicateValues(COMMUNICATION_VISIBILITY_LEVELS);
  assertNoDuplicateValues(COMMUNICATION_STATUS);
});
