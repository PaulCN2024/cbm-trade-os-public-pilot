const test = require("node:test");
const assert = require("node:assert/strict");

const {
  AI_ACTION_BOUNDARY_TYPES,
  AI_ACTION_BOUNDARY_TYPE_VALUES,
  AI_DECISION_STATUSES,
  AI_DECISION_STATUS_VALUES,
  AI_DRAFT_TYPES,
  AI_DRAFT_TYPE_VALUES,
  AI_RISK_LEVELS,
  AI_RISK_LEVEL_VALUES,
  AI_TASK_TYPES,
  AI_TASK_TYPE_VALUES,
  APPROVAL_STATUSES,
  APPROVAL_STATUS_VALUES,
  DEFAULT_AI_DRAFT_VALUES,
} = require("../lib/services/ai-drafts/ai-draft-constants");

function assertNoDuplicateValues(dictionary) {
  const values = Object.values(dictionary);
  assert.equal(new Set(values).size, values.length);
}

test("ai draft dictionaries export successfully", () => {
  assert.ok(AI_DRAFT_TYPES);
  assert.ok(AI_TASK_TYPES);
  assert.ok(APPROVAL_STATUSES);
  assert.ok(AI_RISK_LEVELS);
  assert.ok(AI_DECISION_STATUSES);
  assert.ok(AI_ACTION_BOUNDARY_TYPES);
  assert.ok(DEFAULT_AI_DRAFT_VALUES);
});

test("required AI draft types exist", () => {
  for (const value of [
    "customer_reply_draft",
    "supplier_rfq_draft",
    "quotation_draft",
    "pi_draft",
    "whatsapp_draft",
    "email_draft",
    "knowledge_article_draft",
    "document_summary_draft",
    "follow_up_task_draft",
    "internal_note_draft",
  ]) {
    assert.ok(AI_DRAFT_TYPE_VALUES.includes(value));
  }
});

test("required AI task types exist", () => {
  for (const value of [
    "inquiry_analysis",
    "customer_summary",
    "supplier_matching",
    "supplier_rfq_generation",
    "quotation_check",
    "quotation_generation",
    "document_summary",
    "communication_summary",
    "knowledge_update_suggestion",
    "follow_up_suggestion",
  ]) {
    assert.ok(AI_TASK_TYPE_VALUES.includes(value));
  }
});

test("required approval statuses exist", () => {
  for (const value of ["draft", "needs_review", "approved_internal", "rejected", "sent_manual", "archived"]) {
    assert.ok(APPROVAL_STATUS_VALUES.includes(value));
  }
});

test("required risk levels exist", () => {
  for (const value of ["low", "medium", "high", "blocked"]) {
    assert.ok(AI_RISK_LEVEL_VALUES.includes(value));
  }
});

test("required decision statuses exist", () => {
  for (const value of ["pending", "accepted", "rejected", "edited", "escalated"]) {
    assert.ok(AI_DECISION_STATUS_VALUES.includes(value));
  }
});

test("required action boundary types exist", () => {
  for (const value of ["auto_allowed", "review_required", "blocked"]) {
    assert.ok(AI_ACTION_BOUNDARY_TYPE_VALUES.includes(value));
  }
});

test("default values exist and are valid dictionary members", () => {
  assert.ok(APPROVAL_STATUS_VALUES.includes(DEFAULT_AI_DRAFT_VALUES.DEFAULT_APPROVAL_STATUS));
  assert.ok(AI_RISK_LEVEL_VALUES.includes(DEFAULT_AI_DRAFT_VALUES.DEFAULT_RISK_LEVEL));
  assert.ok(AI_DECISION_STATUS_VALUES.includes(DEFAULT_AI_DRAFT_VALUES.DEFAULT_DECISION_STATUS));
  assert.ok(AI_ACTION_BOUNDARY_TYPE_VALUES.includes(DEFAULT_AI_DRAFT_VALUES.DEFAULT_ACTION_BOUNDARY));
});

test("ai draft dictionaries do not contain duplicate labels", () => {
  assertNoDuplicateValues(AI_DRAFT_TYPES);
  assertNoDuplicateValues(AI_TASK_TYPES);
  assertNoDuplicateValues(APPROVAL_STATUSES);
  assertNoDuplicateValues(AI_RISK_LEVELS);
  assertNoDuplicateValues(AI_DECISION_STATUSES);
  assertNoDuplicateValues(AI_ACTION_BOUNDARY_TYPES);
});
