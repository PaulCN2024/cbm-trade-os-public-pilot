import test from "node:test";
import assert from "node:assert/strict";

import { parseCommand } from "../lib/command-center/command-parser.js";

test("follow-up command maps to daily_followup_list", () => {
  const parsed = parseCommand("今天有哪些客户要跟进？");

  assert.equal(parsed.intent, "daily_followup_list");
  assert.equal(parsed.approval_required, false);
  assert.ok(parsed.planned_actions.some((action) => action.includes("follow-up")));
});

test("latest inquiry command maps to latest_inquiry_analysis", () => {
  const parsed = parseCommand("分析最新网站询盘。");

  assert.equal(parsed.intent, "latest_inquiry_analysis");
  assert.ok(parsed.planned_actions.some((action) => action.includes("latest website inquiry")));
});

test("customer lookup command extracts Kevin alias", () => {
  const parsed = parseCommand("查一下巴拿马 Kevin 最近的项目和跟进任务。");

  assert.equal(parsed.intent, "customer_lookup");
  assert.equal(parsed.entities.customer_alias, "Kevin");
});

test("lead command maps to lead_to_customer", () => {
  const parsed = parseCommand("把这个 lead 转成 customer。");

  assert.equal(parsed.intent, "lead_to_customer");
  assert.ok(parsed.missing_info.includes("lead_id_or_alias"));
  assert.ok(parsed.required_missing_info.includes("lead_id_or_alias"));
  assert.match(parsed.reason, /Rule-based parser matched/);
});

test("project command maps to create_project_from_inquiry", () => {
  const parsed = parseCommand("根据这个询盘创建项目。");

  assert.equal(parsed.intent, "create_project_from_inquiry");
});

test("PI document command maps to create_document_draft and requires approval", () => {
  const parsed = parseCommand("给 Kevin 的 Celeste4 项目生成 PI 草稿。");

  assert.equal(parsed.intent, "create_document_draft");
  assert.equal(parsed.entities.customer_alias, "Kevin");
  assert.equal(parsed.entities.project, "Celeste4");
  assert.equal(parsed.entities.document_hint, "proforma_invoice");
  assert.equal(parsed.approval_required, true);
});

test("Chinese production order command maps to create_document_draft and requires approval", () => {
  const parsed = parseCommand("给 O CLUB HANDRAILS 生成中文生产单草稿。");

  assert.equal(parsed.intent, "create_document_draft");
  assert.equal(parsed.entities.project, "O CLUB HANDRAILS");
  assert.equal(parsed.entities.document_hint, "production_order");
  assert.equal(parsed.approval_required, true);
});

test("archive path command maps to build_archive_path", () => {
  const parsed = parseCommand("生成 Kevin 2026-4 的归档路径。");

  assert.equal(parsed.intent, "build_archive_path");
  assert.equal(parsed.entities.customer_alias, "Kevin");
  assert.equal(parsed.entities.archive_year, "2026");
  assert.equal(parsed.entities.archive_order_no, "4");
});

test("unknown command returns unknown intent safely", () => {
  const parsed = parseCommand("随便帮我搞一下这个事情");

  assert.equal(parsed.intent, "unknown");
  assert.equal(parsed.confidence, 0.2);
  assert.equal(parsed.approval_required, false);
  assert.deepEqual(parsed.required_missing_info, []);
  assert.match(parsed.reason, /No supported rule matched/);
});
