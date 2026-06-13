import test from "node:test";
import assert from "node:assert/strict";

import {
  buildFollowUpDetailModel,
  buildMissingInfoChecklist,
  deriveFollowUpPriority,
  groupFollowUpTasks,
} from "../lib/follow-up-workbench.js";

const today = "2026-06-13";

test("overdue task goes to overdue group and high priority", () => {
  const result = groupFollowUpTasks(
    [{ id: "task_1", status: "PENDING", due_date: "2026-06-12", inquiry_id: "inq_1" }],
    { inquiries: [{ id: "inq_1", business_line: "A_ARCHITECTURAL" }], customers: [], leads: [] },
    today,
  );

  assert.equal(result.groups.overdue.length, 1);
  assert.equal(result.groups.overdue[0].priority, "high");
  assert.equal(deriveFollowUpPriority({ due_date: "2026-06-12" }, {}, today), "high");
});

test("today task goes to today group", () => {
  const result = groupFollowUpTasks(
    [{ id: "task_1", status: "PENDING", due_date: today, inquiry_id: "inq_1" }],
    { inquiries: [{ id: "inq_1", business_line: "B_PRECISION" }], customers: [], leads: [] },
    today,
  );

  assert.equal(result.groups.today.length, 1);
  assert.equal(result.groups.today[0].due_bucket, "today");
});

test("architectural inquiry missing info checklist works", () => {
  const checklist = buildMissingInfoChecklist({
    business_line: "A_ARCHITECTURAL",
    missing_info: ["drawings", "glass specification", "destination port"],
  });

  assert.ok(checklist.find((item) => item.key === "drawings").missing);
  assert.ok(checklist.find((item) => item.key === "glass specification").missing);
  assert.ok(checklist.find((item) => item.key === "destination port").missing);
});

test("precision inquiry missing info checklist works", () => {
  const checklist = buildMissingInfoChecklist({
    business_line: "B_PRECISION",
    missing_info: ["drawing file", "material grade", "tolerance"],
  });

  assert.ok(checklist.find((item) => item.key === "drawing file").missing);
  assert.ok(checklist.find((item) => item.key === "material grade").missing);
  assert.ok(checklist.find((item) => item.key === "tolerance").missing);
});

test("test data is labeled and priority stays low when not urgent", () => {
  const detail = buildFollowUpDetailModel(
    { id: "task_1", is_test: true, due_date: "2026-06-15" },
    { inquiry: { business_line: "A_ARCHITECTURAL", is_test: true } },
    today,
  );

  assert.equal(detail.is_test, true);
  assert.equal(detail.priority, "low");
});

test("blocked actions do not include safe send capabilities", () => {
  const detail = buildFollowUpDetailModel(
    { id: "task_1", due_date: today },
    { inquiry: { business_line: "B_PRECISION" } },
    today,
  );

  assert.ok(detail.blocked_actions.includes("send email"));
  assert.ok(detail.blocked_actions.includes("send WhatsApp"));
  assert.ok(!detail.safe_actions.includes("send email"));
  assert.ok(!detail.safe_actions.includes("send WhatsApp"));
});

test("reply draft is marked draft only", () => {
  const detail = buildFollowUpDetailModel(
    { id: "task_1", due_date: today },
    { inquiry: { business_line: "B_PRECISION", missing_info: ["drawing file"] } },
    today,
  );

  assert.equal(detail.draft_only, true);
  assert.equal(detail.manual_review_required, true);
  assert.match(detail.reply_draft, /不会自动发送客户/);
});

