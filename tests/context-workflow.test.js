import test from "node:test";
import assert from "node:assert/strict";

import { buildContextWorkflow } from "../lib/command-center/context-workflow.js";

function safeText(workflow) {
  return workflow.safe_actions.join(" ").toLowerCase();
}

test("document context creates document workflow panel", () => {
  const workflow = buildContextWorkflow({
    source: "command_center",
    view: "documents",
    draft_id: "draft_1",
    document_type: "PI",
    customer_id: "cus_1",
    project_id: "prj_1",
  });

  assert.equal(workflow.title, "Document Center workflow");
  assert.match(workflow.target_summary, /draft_id=draft_1/);
  assert.match(workflow.target_summary, /document_type=PI/);
  assert.ok(workflow.suggested_steps.includes("Verify forbidden fields are hidden."));
});

test("document workflow blocks official PI bank and payment confirmation", () => {
  const workflow = buildContextWorkflow({ view: "documents", document_type: "PI" });
  const blocked = workflow.blocked_actions.join(" ");

  assert.match(blocked, /Send official PI/);
  assert.match(blocked, /Confirm bank account/);
  assert.match(blocked, /Confirm payment terms/);
  assert.match(blocked, /Confirm price/);
});

test("customer context creates customer workflow panel", () => {
  const workflow = buildContextWorkflow({ view: "customers", customer_id: "cus_1" });

  assert.equal(workflow.title, "Customer 360 workflow");
  assert.match(workflow.target_summary, /customer_id=cus_1/);
  assert.ok(workflow.suggested_steps.includes("Review related inquiries."));
});

test("inquiry context creates inquiry workflow panel", () => {
  const workflow = buildContextWorkflow({ view: "leads", inquiry_id: "inq_1" });

  assert.equal(workflow.title, "Inquiry workflow");
  assert.match(workflow.target_summary, /inquiry_id=inq_1/);
  assert.ok(workflow.suggested_steps.includes("Check missing information."));
});

test("lead-review context creates lead workflow panel", () => {
  const workflow = buildContextWorkflow({ view: "leadPool", lead_id: "lead_1" });

  assert.equal(workflow.title, "Lead Review workflow");
  assert.match(workflow.target_summary, /lead_id=lead_1/);
  assert.ok(workflow.suggested_steps.includes("Convert to customer only after manual review."));
});

test("follow-up context creates follow-up workflow panel", () => {
  const workflow = buildContextWorkflow({ view: "actionCenter", task_id: "task_1", filter: "today" });

  assert.equal(workflow.title, "Follow-up Workbench workflow");
  assert.match(workflow.target_summary, /task_id=task_1/);
  assert.match(workflow.target_summary, /filter=today/);
  assert.ok(workflow.suggested_steps.includes("Mark done only after actual follow-up."));
});

test("unknown view returns safe fallback workflow", () => {
  const workflow = buildContextWorkflow({ view: "unknown", warnings: ["Unknown view"] });

  assert.equal(workflow.title, "Safe fallback workflow");
  assert.match(workflow.target_summary, /unknown/);
  assert.ok(workflow.warnings.includes("Unknown view"));
});

test("context workflow can load command history by command_id", () => {
  const workflow = buildContextWorkflow({
    view: "documents",
    command_id: "cmd_1",
    command_history: [
      {
        command_id: "cmd_1",
        raw_command: "给 Kevin 的 Celeste4 项目生成 PI 草稿",
        parsed_intent: "create_document_draft",
        status: "previewed",
        planned_actions: ["Find customer/project reference"],
        blocked_actions: ["Send official PI"],
        draft_reference: { draft_id: "doc_1", draft_type: "PI", status: "draft_only" },
      },
    ],
  });

  assert.equal(workflow.command_summary, "给 Kevin 的 Celeste4 项目生成 PI 草稿");
  assert.equal(workflow.parsed_intent, "create_document_draft");
  assert.equal(workflow.command_status, "previewed");
  assert.equal(workflow.draft_references[0].draft_id, "doc_1");
  assert.match(workflow.workflow_progress_summary, /blocked/);
});

test("missing command_id is handled safely", () => {
  const workflow = buildContextWorkflow({
    view: "documents",
    command_id: "missing",
    command_history: [],
  });

  assert.match(workflow.warnings.join(" "), /Command history record not found/);
  assert.equal(workflow.title, "Document Center workflow");
});

test("PI workflow has blocked high-risk steps", () => {
  const workflow = buildContextWorkflow({
    view: "documents",
    document_type: "PI",
    command_id: "cmd_1",
    command_history: [
      {
        command_id: "cmd_1",
        planned_actions: ["Prepare PI draft data"],
        blocked_actions: ["Send official PI", "Confirm bank account"],
      },
    ],
  });

  assert.ok(workflow.workflow_progress.some((step) => step.status === "blocked" && step.label === "Send official PI"));
  assert.ok(workflow.workflow_progress.some((step) => step.status === "blocked" && step.label === "Confirm bank account"));
});

test("workflow panel never includes send message as safe action", () => {
  const workflows = [
    buildContextWorkflow({ view: "documents" }),
    buildContextWorkflow({ view: "customers" }),
    buildContextWorkflow({ view: "leads" }),
    buildContextWorkflow({ view: "leadPool" }),
    buildContextWorkflow({ view: "actionCenter" }),
  ];

  workflows.forEach((workflow) => {
    assert.equal(safeText(workflow).includes("send message"), false);
    assert.equal(safeText(workflow).includes("send customer message"), false);
  });
});

test("workflow panel never includes official quotation or PI send as safe action", () => {
  const workflows = [
    buildContextWorkflow({ view: "documents", document_type: "PI" }),
    buildContextWorkflow({ view: "leads" }),
    buildContextWorkflow({ view: "unknown" }),
  ];

  workflows.forEach((workflow) => {
    assert.equal(safeText(workflow).includes("official quotation"), false);
    assert.equal(safeText(workflow).includes("official pi"), false);
    assert.equal(safeText(workflow).includes("send official"), false);
  });
});

test("Return to Command Center link preserves command_id", () => {
  const workflow = buildContextWorkflow({ view: "documents", command_id: "cmd_123" });

  assert.equal(workflow.return_to_command_center_url, "/admin/command-center?command_id=cmd_123");
  assert.ok(workflow.related_links.some((link) => link.href === "/admin/command-center?command_id=cmd_123"));
});

test("duplicate blocked actions are deduplicated", () => {
  const workflow = buildContextWorkflow({
    view: "documents",
    command_history_record: {
      command_id: "cmd_1",
      raw_command: "PI",
      blocked_actions: ["Send official PI", "Send official PI"],
    },
  });

  const piCount = workflow.blocked_actions.filter((item) => item === "Send official PI").length;
  assert.equal(piCount, 1);
});

test("high-risk command still shows Manual Review Required signal through blocked actions", () => {
  const workflow = buildContextWorkflow({
    view: "documents",
    command_id: "cmd_pi",
    command_history: [
      {
        command_id: "cmd_pi",
        approval_required: true,
        blocked_actions: ["Send official PI", "Confirm bank account"],
      },
    ],
  });

  assert.ok(workflow.blocked_actions.includes("Send official PI"));
  assert.ok(workflow.command_history_record.approval_required);
});
