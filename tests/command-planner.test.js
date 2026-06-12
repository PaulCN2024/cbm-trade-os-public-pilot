import test from "node:test";
import assert from "node:assert/strict";

import { parseCommand } from "../lib/command-center/command-parser.js";
import { CommandStatus, createCommandPlan, transitionCommandStatus } from "../lib/command-center/command-planner.js";

test("PI command creates a plan with approval_required true", () => {
  const parsed = parseCommand("给 Kevin 的 Celeste4 项目生成 PI 草稿。");
  const plan = createCommandPlan({ parsedCommand: parsed });

  assert.equal(plan.intent, "create_document_draft");
  assert.equal(plan.approval_required, true);
  assert.ok(plan.plan_steps.includes("Mark manual review required"));
  assert.ok(plan.blocked_actions.includes("send official PI"));
  assert.ok(plan.executable_actions.includes("create draft preview"));
});

test("quotation command blocks official send and confirm actions", () => {
  const parsed = parseCommand("生成报价草稿");
  const plan = createCommandPlan({ parsedCommand: parsed });

  assert.equal(plan.approval_required, true);
  assert.ok(plan.blocked_actions.includes("send official quotation"));
  assert.ok(plan.blocked_actions.includes("confirm price"));
});

test("follow-up list command is safe and executable", () => {
  const parsed = parseCommand("今天有哪些客户要跟进？");
  const plan = createCommandPlan({ parsedCommand: parsed });

  assert.equal(plan.approval_required, false);
  assert.ok(plan.executable_actions.includes("list follow-ups"));
});

test("archive path command is safe and executable", () => {
  const parsed = parseCommand("生成 Kevin 2026-4 的归档路径。");
  const plan = createCommandPlan({ parsedCommand: parsed });

  assert.equal(plan.approval_required, false);
  assert.ok(plan.executable_actions.includes("build archive path"));
});

test("safe command history status can move planned to previewed to confirmed to executed", () => {
  const plan = createCommandPlan({ parsedCommand: parseCommand("生成 Kevin 2026-4 的归档路径。") });
  const previewed = transitionCommandStatus(CommandStatus.PLANNED, CommandStatus.PREVIEWED, plan);
  const confirmed = transitionCommandStatus(previewed.status, CommandStatus.CONFIRMED, plan);
  const executed = transitionCommandStatus(confirmed.status, CommandStatus.EXECUTED, plan);

  assert.equal(previewed.ok, true);
  assert.equal(confirmed.ok, true);
  assert.equal(executed.ok, true);
  assert.equal(executed.status, CommandStatus.EXECUTED);
});

test("high-risk command cannot move to executed without manual review", () => {
  const plan = createCommandPlan({ parsedCommand: parseCommand("给 Kevin 的 Celeste4 项目生成 PI 草稿。") });
  const executed = transitionCommandStatus(CommandStatus.CONFIRMED, CommandStatus.EXECUTED, plan);

  assert.equal(executed.ok, false);
  assert.equal(executed.status, CommandStatus.CONFIRMED);
  assert.match(executed.reason[0], /High-risk/);
});
