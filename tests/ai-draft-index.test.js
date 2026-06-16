const test = require("node:test");
const assert = require("node:assert/strict");

const aiDrafts = require("../lib/services/ai-drafts");

test("ai draft index exports dictionaries", () => {
  assert.ok(aiDrafts.AI_DRAFT_TYPES);
  assert.ok(aiDrafts.AI_TASK_TYPES);
  assert.ok(aiDrafts.APPROVAL_STATUSES);
  assert.ok(aiDrafts.AI_RISK_LEVELS);
  assert.ok(aiDrafts.AI_DECISION_STATUSES);
  assert.ok(aiDrafts.AI_ACTION_BOUNDARY_TYPES);
  assert.ok(aiDrafts.DEFAULT_AI_DRAFT_VALUES);
});

test("ai draft index exports helper arrays", () => {
  assert.ok(Array.isArray(aiDrafts.AI_DRAFT_TYPE_VALUES));
  assert.ok(Array.isArray(aiDrafts.AI_TASK_TYPE_VALUES));
  assert.ok(Array.isArray(aiDrafts.APPROVAL_STATUS_VALUES));
  assert.ok(Array.isArray(aiDrafts.AI_RISK_LEVEL_VALUES));
  assert.ok(Array.isArray(aiDrafts.AI_DECISION_STATUS_VALUES));
  assert.ok(Array.isArray(aiDrafts.AI_ACTION_BOUNDARY_TYPE_VALUES));
});

test("ai draft index exports normalization helpers", () => {
  assert.equal(typeof aiDrafts.normalizeAiDraftInput, "function");
  assert.equal(typeof aiDrafts.normalizeAiDraftType, "function");
  assert.equal(typeof aiDrafts.normalizeAiTaskType, "function");
  assert.equal(typeof aiDrafts.normalizeApprovalStatus, "function");
  assert.equal(typeof aiDrafts.normalizeAiRiskLevel, "function");
  assert.equal(typeof aiDrafts.normalizeAiDecisionStatus, "function");
  assert.equal(typeof aiDrafts.normalizeAiActionBoundary, "function");
});

test("ai draft index exports safety classifier helpers", () => {
  assert.equal(typeof aiDrafts.detectAiDraftSensitiveTopics, "function");
  assert.equal(typeof aiDrafts.classifyAiDraftActionBoundary, "function");
  assert.equal(typeof aiDrafts.classifyAiDraftSafety, "function");
});
