const test = require("node:test");
const assert = require("node:assert/strict");

const {
  AI_ACTION_BOUNDARY_LABELS_ZH,
  AI_DECISION_STATUS_LABELS_ZH,
  AI_DRAFT_TYPE_LABELS_ZH,
  AI_RISK_LEVEL_LABELS_ZH,
  AI_TASK_TYPE_LABELS_ZH,
  APPROVAL_STATUS_LABELS_ZH,
  ATTACHMENT_TYPE_LABELS_ZH,
  CHINESE_UI_LABEL_GROUPS,
  COMMUNICATION_CHANNEL_LABELS_ZH,
  COMMUNICATION_DIRECTION_LABELS_ZH,
  NUMBERING_OBJECT_LABELS_ZH,
  getChineseLabel,
} = require("../lib/services/ui-labels/chinese-labels");

function assertNoDuplicateKeys(dictionary) {
  const keys = Object.keys(dictionary);
  assert.equal(new Set(keys).size, keys.length);
}

test("all Chinese label dictionaries export successfully", () => {
  assert.ok(AI_DRAFT_TYPE_LABELS_ZH);
  assert.ok(AI_TASK_TYPE_LABELS_ZH);
  assert.ok(APPROVAL_STATUS_LABELS_ZH);
  assert.ok(AI_RISK_LEVEL_LABELS_ZH);
  assert.ok(AI_DECISION_STATUS_LABELS_ZH);
  assert.ok(AI_ACTION_BOUNDARY_LABELS_ZH);
  assert.ok(COMMUNICATION_DIRECTION_LABELS_ZH);
  assert.ok(COMMUNICATION_CHANNEL_LABELS_ZH);
  assert.ok(ATTACHMENT_TYPE_LABELS_ZH);
  assert.ok(NUMBERING_OBJECT_LABELS_ZH);
});

test("AI draft labels include customer reply draft", () => {
  assert.equal(AI_DRAFT_TYPE_LABELS_ZH.customer_reply_draft, "客户回复草稿");
});

test("AI task labels include inquiry analysis", () => {
  assert.equal(AI_TASK_TYPE_LABELS_ZH.inquiry_analysis, "询盘分析");
});

test("approval status labels include needs review", () => {
  assert.equal(APPROVAL_STATUS_LABELS_ZH.needs_review, "需要审核");
});

test("risk labels include blocked", () => {
  assert.equal(AI_RISK_LEVEL_LABELS_ZH.blocked, "已阻止");
});

test("communication channel labels include Made-in-China", () => {
  assert.equal(COMMUNICATION_CHANNEL_LABELS_ZH.made_in_china, "中国制造网");
});

test("attachment labels include payment slip", () => {
  assert.equal(ATTACHMENT_TYPE_LABELS_ZH.payment_slip, "付款水单");
});

test("numbering object labels include customer company", () => {
  assert.equal(NUMBERING_OBJECT_LABELS_ZH.customer_company, "客户公司");
});

test("Chinese UI label groups export grouped dictionaries", () => {
  assert.equal(CHINESE_UI_LABEL_GROUPS.ai_draft_types, AI_DRAFT_TYPE_LABELS_ZH);
  assert.equal(CHINESE_UI_LABEL_GROUPS.communication_channels, COMMUNICATION_CHANNEL_LABELS_ZH);
  assert.equal(CHINESE_UI_LABEL_GROUPS.numbering_objects, NUMBERING_OBJECT_LABELS_ZH);
});

test("getChineseLabel returns known label", () => {
  assert.equal(getChineseLabel("ai_task_types", "inquiry_analysis"), "询盘分析");
});

test("getChineseLabel returns fallback when missing and fallback is provided", () => {
  assert.equal(getChineseLabel("ai_task_types", "unknown_key", "未知"), "未知");
});

test("getChineseLabel returns key when missing and no fallback is provided", () => {
  assert.equal(getChineseLabel("ai_task_types", "unknown_key"), "unknown_key");
});

test("Chinese label dictionaries do not contain duplicate keys", () => {
  for (const dictionary of Object.values(CHINESE_UI_LABEL_GROUPS)) {
    assertNoDuplicateKeys(dictionary);
  }
});
