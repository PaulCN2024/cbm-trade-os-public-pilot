import test from "node:test";
import assert from "node:assert/strict";

import { createEmptyDb } from "../lib/mock-crm.js";
import { parseCommand } from "../lib/command-center/command-parser.js";
import { createCommandPlan } from "../lib/command-center/command-planner.js";
import { SafeExecutionModes, executeCommandPlan } from "../lib/command-center/command-executor.js";

test("safe archive command can preview and execute internally", () => {
  const db = createEmptyDb();
  const parsed = parseCommand("生成 Kevin 2026-4 的归档路径。");
  const plan = createCommandPlan({ parsedCommand: parsed });

  const preview = executeCommandPlan(db, plan, parsed, { mode: SafeExecutionModes.PREVIEW });
  plan.status = preview.status;
  const executed = executeCommandPlan(db, { ...plan, status: "confirmed" }, parsed, { mode: SafeExecutionModes.EXECUTE });

  assert.equal(preview.ok, true);
  assert.equal(preview.status, "previewed");
  assert.equal(executed.ok, true);
  assert.equal(executed.status, "executed");
});

test("high-risk actions return blocked_requires_manual_review for execute mode", () => {
  const db = createEmptyDb();
  const parsed = parseCommand("给 Kevin 的 Celeste4 项目生成 PI 草稿。");
  const plan = createCommandPlan({ parsedCommand: parsed });
  const result = executeCommandPlan(db, plan, parsed, { mode: SafeExecutionModes.EXECUTE });

  assert.equal(result.ok, false);
  assert.equal(result.status, "blocked_requires_manual_review");
  assert.equal(result.approval_required, true);
});

test("executor never sends customer messages", () => {
  const db = createEmptyDb();
  const parsed = parseCommand("发送消息给客户确认交期");
  const plan = createCommandPlan({ parsedCommand: parsed });
  const result = executeCommandPlan(db, plan, parsed, { mode: SafeExecutionModes.EXECUTE });
  const text = JSON.stringify(result).toLowerCase();

  assert.equal(result.status, "blocked_requires_manual_review");
  assert.equal(text.includes("message sent"), false);
});

test("executor never confirms bank payment or delivery terms", () => {
  const db = createEmptyDb();
  const parsed = parseCommand("请确认 bank account payment terms delivery time");
  const plan = createCommandPlan({ parsedCommand: parsed });
  const result = executeCommandPlan(db, plan, parsed, { mode: SafeExecutionModes.EXECUTE });
  const text = JSON.stringify(result).toLowerCase();

  assert.equal(result.status, "blocked_requires_manual_review");
  assert.equal(text.includes("confirmed"), false);
});

test("unknown intent creates safe unknown result", () => {
  const db = createEmptyDb();
  const parsed = parseCommand("随便帮我搞一下这个事情");
  const plan = createCommandPlan({ parsedCommand: parsed });
  const result = executeCommandPlan(db, plan, parsed, { mode: SafeExecutionModes.PREVIEW });

  assert.equal(result.ok, false);
  assert.equal(result.status, "unknown");
  assert.equal(result.cards[0].card_type, "unknown_command_card");
});

test("high-risk draft preview can create preview but not final execute", () => {
  const db = createEmptyDb();
  const parsed = parseCommand("给 O CLUB HANDRAILS 生成中文生产单草稿。");
  const plan = createCommandPlan({ parsedCommand: parsed });
  const preview = executeCommandPlan(db, plan, parsed, { mode: SafeExecutionModes.DRAFT_PREVIEW });
  const execute = executeCommandPlan(db, plan, parsed, { mode: SafeExecutionModes.EXECUTE });

  assert.equal(preview.status, "previewed");
  assert.equal(preview.approval_required, true);
  assert.equal(execute.status, "blocked_requires_manual_review");
});

test("draft reference is stored as draft_only for document draft preview", () => {
  const db = createEmptyDb();
  const parsed = parseCommand("给 O CLUB HANDRAILS 生成中文生产单草稿。");
  const plan = createCommandPlan({ parsedCommand: parsed });
  const preview = executeCommandPlan(db, plan, parsed, { mode: SafeExecutionModes.DRAFT_PREVIEW });

  assert.equal(preview.draft_reference.status, "draft_only");
  assert.equal(preview.draft_reference.manual_review_required, true);
  assert.equal(preview.command_log.draft_reference.status, "draft_only");
  assert.ok(preview.command_log.workflow_progress.some((step) => step.status === "blocked"));
});

test("high-risk PI draft starts draft_only and is not sent", () => {
  const db = createEmptyDb();
  const parsed = parseCommand("给 Kevin 的 Celeste4 项目生成 PI 草稿。");
  const plan = createCommandPlan({ parsedCommand: parsed });
  const preview = executeCommandPlan(db, plan, parsed, { mode: SafeExecutionModes.DRAFT_PREVIEW });

  assert.equal(preview.draft_reference.review_status, "draft_only");
  assert.equal(preview.draft_reference.official_sent, false);
  assert.equal(preview.draft_reference.customer_message_sent, false);
  assert.equal(preview.command_log.draft_reference.review_status, "draft_only");
});

test("blocked actions are never executable", () => {
  const db = createEmptyDb();
  const parsed = parseCommand("给 Kevin 的 Celeste4 项目生成 PI 草稿。");
  const plan = createCommandPlan({ parsedCommand: parsed });
  const execute = executeCommandPlan(db, plan, parsed, { mode: SafeExecutionModes.EXECUTE });

  assert.equal(execute.ok, false);
  assert.equal(execute.status, "blocked_requires_manual_review");
  assert.ok(execute.warnings.includes("send official PI"));
});
