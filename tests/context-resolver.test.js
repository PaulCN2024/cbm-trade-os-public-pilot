import test from "node:test";
import assert from "node:assert/strict";

import {
  contextTargetSummary,
  hasCommandContext,
  resolveCommandContext,
} from "../lib/command-center/context-resolver.js";

test("documents link resolves draft_id and document_type", () => {
  const context = resolveCommandContext("?view=documents&draft_id=draft_1&document_type=PI&customer_id=cus_1&project_id=proj_1");

  assert.equal(context.source, "command_center");
  assert.equal(context.view, "documents");
  assert.equal(context.draft_id, "draft_1");
  assert.equal(context.document_type, "PI");
  assert.equal(context.customer_id, "cus_1");
  assert.equal(context.project_id, "proj_1");
});

test("customer-360 link resolves customer_id to customers view", () => {
  const context = resolveCommandContext("?view=customer-360&customer_id=cus_1");

  assert.equal(context.view, "customers");
  assert.equal(context.customer_id, "cus_1");
});

test("inquiries link resolves inquiry_id to inquiry pool view", () => {
  const context = resolveCommandContext("?view=inquiries&inquiry_id=inq_1");

  assert.equal(context.view, "leads");
  assert.equal(context.inquiry_id, "inq_1");
});

test("lead-review link resolves lead_id to lead pool view", () => {
  const context = resolveCommandContext("?view=lead-review&lead_id=lead_1");

  assert.equal(context.view, "leadPool");
  assert.equal(context.lead_id, "lead_1");
});

test("follow-ups link resolves task_id and filter", () => {
  const context = resolveCommandContext("?view=follow-ups&task_id=task_1&filter=overdue");

  assert.equal(context.view, "actionCenter");
  assert.equal(context.task_id, "task_1");
  assert.equal(context.filter, "overdue");
});

test("unknown params are ignored while safe params remain", () => {
  const context = resolveCommandContext("?view=documents&draft_id=draft_1&random=1&debug=true");

  assert.equal(context.view, "documents");
  assert.equal(context.draft_id, "draft_1");
  assert.equal("random" in context, false);
  assert.equal("debug" in context, false);
});

test("unknown view falls back safely with warning", () => {
  const context = resolveCommandContext("?view=send-pi&customer_id=cus_1");

  assert.equal(context.view, "dashboard");
  assert.equal(context.customer_id, "cus_1");
  assert.match(context.warnings.join(" "), /Unknown view/);
});

test("missing IDs are handled safely", () => {
  const context = resolveCommandContext("?view=documents&document_type=ProductionOrder");

  assert.equal(context.view, "documents");
  assert.equal(context.draft_id, "");
  assert.equal(context.customer_id, "");
  assert.equal(hasCommandContext(context), true);
});

test("sensitive params are not included in normalized context", () => {
  const context = resolveCommandContext("?view=customers&customer_id=cus_1&access_token=abc&password=secret&SUPABASE_SERVICE_ROLE_KEY=hidden");
  const serialized = JSON.stringify(context);

  assert.equal(context.view, "customers");
  assert.equal(context.customer_id, "cus_1");
  assert.equal(serialized.includes("abc"), false);
  assert.equal(serialized.includes("secret"), false);
  assert.equal(serialized.includes("hidden"), false);
  assert.match(context.warnings.join(" "), /Sensitive parameter/);
});

test("contextTargetSummary returns only safe populated context fields", () => {
  const context = resolveCommandContext("?view=follow-ups&task_id=task_1&filter=today&password=nope");

  assert.deepEqual(contextTargetSummary(context), [
    ["task_id", "task_1"],
    ["filter", "today"],
  ]);
});
