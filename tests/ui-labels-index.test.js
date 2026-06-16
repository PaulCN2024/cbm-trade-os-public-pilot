const test = require("node:test");
const assert = require("node:assert/strict");

const uiLabels = require("../lib/services/ui-labels");

test("ui labels index exports Chinese label dictionaries", () => {
  assert.ok(uiLabels.AI_DRAFT_TYPE_LABELS_ZH);
  assert.ok(uiLabels.AI_TASK_TYPE_LABELS_ZH);
  assert.ok(uiLabels.APPROVAL_STATUS_LABELS_ZH);
  assert.ok(uiLabels.AI_RISK_LEVEL_LABELS_ZH);
  assert.ok(uiLabels.AI_DECISION_STATUS_LABELS_ZH);
  assert.ok(uiLabels.AI_ACTION_BOUNDARY_LABELS_ZH);
  assert.ok(uiLabels.COMMUNICATION_DIRECTION_LABELS_ZH);
  assert.ok(uiLabels.COMMUNICATION_CHANNEL_LABELS_ZH);
  assert.ok(uiLabels.ATTACHMENT_TYPE_LABELS_ZH);
  assert.ok(uiLabels.NUMBERING_OBJECT_LABELS_ZH);
});

test("ui labels index exports label groups and helper", () => {
  assert.ok(uiLabels.CHINESE_UI_LABEL_GROUPS);
  assert.equal(typeof uiLabels.getChineseLabel, "function");
});

test("getChineseLabel works through the index export", () => {
  assert.equal(uiLabels.getChineseLabel("ai_draft_types", "customer_reply_draft"), "客户回复草稿");
  assert.equal(uiLabels.getChineseLabel("communication_channels", "made_in_china"), "中国制造网");
  assert.equal(uiLabels.getChineseLabel("numbering_objects", "customer_company"), "客户公司");
});
