import test from "node:test";
import assert from "node:assert/strict";

import { approvalSummary, requiresManualApproval } from "../lib/command-center/approval-rules.js";

test("quotation command requires approval", () => {
  assert.equal(
    requiresManualApproval({
      intent: "create_quotation_draft",
      raw_command: "生成报价草稿",
    }),
    true,
  );
});

test("PI document command requires approval", () => {
  assert.equal(
    requiresManualApproval({
      intent: "create_document_draft",
      raw_command: "Create PI draft",
    }),
    true,
  );
});

test("payment terms and bank account commands require approval", () => {
  assert.equal(requiresManualApproval("Please confirm payment terms and bank account to customer."), true);
});

test("customer message sending command requires approval", () => {
  assert.equal(requiresManualApproval("发送消息给客户确认交期"), true);
});

test("compensation and responsibility judgment commands require approval", () => {
  assert.equal(requiresManualApproval("判断责任并承诺赔偿"), true);
});

test("safe follow-up list preview does not require high-risk approval", () => {
  assert.equal(
    requiresManualApproval({
      intent: "daily_followup_list",
      raw_command: "今天有哪些客户要跟进？",
    }),
    false,
  );
});

test("approval summary returns Manual Review Required for high-risk actions", () => {
  const summary = approvalSummary({ intent: "create_quotation_draft" });

  assert.equal(summary.approval_required, true);
  assert.equal(summary.risk_level, "high");
  assert.equal(summary.label, "Manual Review Required");
  assert.ok(summary.reasons.length > 0);
  assert.ok(summary.safety_notes.some((note) => note.includes("No automatic official quotation")));
});

test("safe approval summary returns low risk with no reasons", () => {
  const summary = approvalSummary({ intent: "daily_followup_list", raw_command: "今天有哪些客户要跟进？" });

  assert.equal(summary.approval_required, false);
  assert.equal(summary.risk_level, "low");
  assert.deepEqual(summary.reasons, []);
});
