const test = require("node:test");
const assert = require("node:assert/strict");

const communication = require("../lib/services/communication");

test("communication index exports dictionaries", () => {
  assert.ok(communication.COMMUNICATION_DIRECTIONS);
  assert.ok(communication.COMMUNICATION_CHANNELS);
  assert.ok(communication.ATTACHMENT_TYPES);
  assert.ok(communication.COMMUNICATION_VISIBILITY_LEVELS);
  assert.ok(communication.COMMUNICATION_STATUS);
  assert.ok(communication.DEFAULT_COMMUNICATION_VALUES);
});

test("communication index exports helper arrays", () => {
  assert.ok(Array.isArray(communication.COMMUNICATION_DIRECTION_VALUES));
  assert.ok(Array.isArray(communication.COMMUNICATION_CHANNEL_VALUES));
  assert.ok(Array.isArray(communication.ATTACHMENT_TYPE_VALUES));
  assert.ok(Array.isArray(communication.COMMUNICATION_VISIBILITY_VALUES));
  assert.ok(Array.isArray(communication.COMMUNICATION_STATUS_VALUES));
});

test("communication index exports normalization helpers", () => {
  assert.equal(typeof communication.normalizeCommunicationInput, "function");
  assert.equal(typeof communication.normalizeCommunicationDirection, "function");
  assert.equal(typeof communication.normalizeCommunicationChannel, "function");
  assert.equal(typeof communication.normalizeAttachmentType, "function");
  assert.equal(typeof communication.normalizeCommunicationVisibility, "function");
  assert.equal(typeof communication.normalizeCommunicationStatus, "function");
});

test("communication index exports classification helpers", () => {
  assert.equal(typeof communication.classifyCommunicationInput, "function");
  assert.equal(typeof communication.classifyAttachmentName, "function");
  assert.equal(typeof communication.detectSensitiveCommunication, "function");
});

test("communication index exports review summary helper", () => {
  assert.equal(typeof communication.prepareCommunicationReviewSummary, "function");
});
