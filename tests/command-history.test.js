import test from "node:test";
import assert from "node:assert/strict";

import {
  appendCommandParams,
  addBusinessObjectRef,
  buildAuditDetailSummary,
  buildAuditTimeline,
  buildDocumentDraftReviewChecklist,
  buildDocumentDraftReviewSummary,
  buildResumeHandoffLinks,
  buildAuditRecordSummary,
  buildResumeWorkflowLink,
  cancelWorkflow,
  closeWorkflow,
  createFollowUpTaskDraft,
  createWorkflowProgress,
  DOCUMENT_DRAFT_REVIEW_CHECKLIST,
  filterAuditRecords,
  findCommandHistoryRecord,
  generateDocumentDraftChecklist,
  getAuditRecordsByBusinessObject,
  getAuditDetailModel,
  listDocumentDraftReviewRecords,
  getResumeWorkflowModel,
  getBusinessObjectRefs,
  listAuditRecords,
  markWorkflowStepCompleted,
  ManualReviewStatus,
  normalizeCommandHistoryRecord,
  saveManualReviewNote,
  sanitizeCommandHistoryValue,
  summarizeAuditRecords,
  summarizeBusinessObjectImpact,
  summarizeCommandJourney,
  summarizeWorkflowProgress,
  updateManualReviewStatus,
  upsertCommandHistoryRecord,
  workflowProgressSummary,
} from "../lib/command-center/command-history.js";

test("command history record can store workflow_progress", () => {
  const record = normalizeCommandHistoryRecord({
    command_id: "cmd_1",
    raw_command: "给 Kevin 生成 PI 草稿",
    planned_actions: ["Find customer/project reference", "Prepare PI draft data"],
    blocked_actions: ["Send official PI"],
  });

  assert.equal(record.workflow_progress.length, 3);
  assert.equal(record.workflow_progress[0].status, "completed");
  assert.equal(record.workflow_progress[2].status, "blocked");
  assert.equal(workflowProgressSummary(record), "1 completed · 1 pending · 1 blocked");
});

test("findCommandHistoryRecord loads by command_id", () => {
  const history = [normalizeCommandHistoryRecord({ command_id: "cmd_1", raw_command: "test" })];

  assert.equal(findCommandHistoryRecord(history, "cmd_1").raw_command, "test");
  assert.equal(findCommandHistoryRecord(history, "missing"), null);
});

test("safe steps can be marked completed", () => {
  const record = normalizeCommandHistoryRecord({
    command_id: "cmd_1",
    planned_actions: ["Step one", "Step two"],
  });

  const result = markWorkflowStepCompleted(record, "step_2");

  assert.equal(result.ok, true);
  assert.equal(result.record.workflow_progress.find((step) => step.step_id === "step_2").status, "completed");
});

test("blocked steps cannot be executed", () => {
  const record = normalizeCommandHistoryRecord({
    command_id: "cmd_1",
    planned_actions: ["Safe step"],
    blocked_actions: ["Send official PI"],
  });

  const result = markWorkflowStepCompleted(record, "blocked_1");

  assert.equal(result.ok, false);
  assert.equal(result.record.workflow_progress.find((step) => step.step_id === "blocked_1").status, "blocked");
});

test("upsertCommandHistoryRecord updates existing command id", () => {
  const first = normalizeCommandHistoryRecord({ command_id: "cmd_1", status: "planned" });
  const next = upsertCommandHistoryRecord([first], { command_id: "cmd_1", status: "previewed" });

  assert.equal(next.length, 1);
  assert.equal(next[0].status, "previewed");
});

test("command history never stores secrets passwords or service keys", () => {
  const sanitized = sanitizeCommandHistoryValue({
    command_id: "cmd_1",
    password: "should-not-store",
    SUPABASE_SERVICE_ROLE_KEY: "hidden",
    nested: {
      access_token: "abc",
      safe: "ok",
    },
  });

  const text = JSON.stringify(sanitized);
  assert.equal(text.includes("should-not-store"), false);
  assert.equal(text.includes("hidden"), false);
  assert.equal(text.includes("abc"), false);
  assert.equal(sanitized.nested.safe, "ok");
});

test("Resume workflow link contains safe context params", () => {
  const record = normalizeCommandHistoryRecord({
    command_id: "cmd_1",
    raw_command: "PI draft",
    draft_reference: {
      draft_id: "doc_1",
      draft_type: "PI",
      related_customer_id: "cus_1",
      related_project_id: "prj_1",
      status: "draft_only",
    },
  });

  assert.match(record.resume_link, /command_id=cmd_1/);
  assert.match(record.resume_link, /draft_id=doc_1/);
  assert.match(record.resume_link, /customer_id=cus_1/);
  assert.equal(record.resume_link.includes("password"), false);
});

test("appendCommandParams adds command id without unsafe data", () => {
  const href = appendCommandParams("/trade-os-prototype?view=inquiries&inquiry_id=inq_1", {
    command_id: "cmd_1",
    raw_command: "分析询盘",
  });

  assert.equal(href, "/trade-os-prototype?view=inquiries&inquiry_id=inq_1&command_id=cmd_1&command_summary=%E5%88%86%E6%9E%90%E8%AF%A2%E7%9B%98");
});

test("resume model loads command history by command_id", () => {
  const record = normalizeCommandHistoryRecord({
    command_id: "cmd_resume",
    raw_command: "分析最新网站询盘",
    parsed_intent: "latest_inquiry_analysis",
    status: "previewed",
    preview_cards: [{ title: "Inquiry", related_links: [{ label: "Open Inquiry", href: "/trade-os-prototype?view=inquiries&inquiry_id=inq_1" }] }],
  });

  const model = getResumeWorkflowModel("cmd_resume", [record]);

  assert.equal(model.ok, true);
  assert.equal(model.original_command, "分析最新网站询盘");
  assert.equal(model.target_links[0].href.includes("command_id=cmd_resume"), true);
});

test("workflow progress summary counts completed pending blocked correctly", () => {
  const record = normalizeCommandHistoryRecord({
    workflow_progress: [
      { step_id: "a", label: "A", status: "completed" },
      { step_id: "b", label: "B", status: "pending" },
      { step_id: "c", label: "C", status: "blocked" },
    ],
    draft_references: [{ draft_id: "doc_1" }],
  });

  const summary = summarizeWorkflowProgress(record);

  assert.equal(summary.total, 3);
  assert.equal(summary.completed, 1);
  assert.equal(summary.pending, 1);
  assert.equal(summary.blocked, 1);
  assert.equal(summary.draft_count, 1);
  assert.equal(summary.text, "1 completed / 1 pending / 1 blocked");
});

test("markWorkflowStepCompleted can update by command_id", () => {
  const history = [
    normalizeCommandHistoryRecord({
      command_id: "cmd_1",
      workflow_progress: [
        { step_id: "step_1", label: "Safe", status: "pending" },
      ],
    }),
  ];

  const result = markWorkflowStepCompleted("cmd_1", "step_1", history);

  assert.equal(result.ok, true);
  assert.equal(findCommandHistoryRecord(result.history, "cmd_1").workflow_progress[0].status, "completed");
});

test("cancelled workflow status is stored safely", () => {
  const history = [normalizeCommandHistoryRecord({ command_id: "cmd_1", status: "previewed" })];
  const result = cancelWorkflow("cmd_1", history);

  assert.equal(result.ok, true);
  assert.equal(findCommandHistoryRecord(result.history, "cmd_1").status, "cancelled");
});

test("completed safe workflow can transition to completed", () => {
  const history = [normalizeCommandHistoryRecord({ command_id: "cmd_1", approval_required: false, blocked_actions: [], status: "confirmed" })];
  const result = closeWorkflow("cmd_1", history);

  assert.equal(result.ok, true);
  assert.equal(findCommandHistoryRecord(result.history, "cmd_1").status, "completed");
});

test("high-risk PI workflow cannot transition to executed or completed", () => {
  const history = [
    normalizeCommandHistoryRecord({
      command_id: "cmd_pi",
      approval_required: true,
      blocked_actions: ["Send official PI"],
      status: "previewed",
    }),
  ];

  const result = closeWorkflow("cmd_pi", history);

  assert.equal(result.ok, false);
  assert.equal(findCommandHistoryRecord(result.history, "cmd_pi").status, "blocked_requires_manual_review");
});

test("command history can store business_object_refs", () => {
  const record = normalizeCommandHistoryRecord({
    command_id: "cmd_refs",
    business_object_refs: [
      { type: "customer", id: "cus_1", label: "Kevin", status: "referenced" },
    ],
  });

  assert.equal(record.business_object_refs[0].type, "customer");
  assert.equal(record.business_object_refs[0].href, "/trade-os-prototype?view=customer-360&customer_id=cus_1&command_id=cmd_refs");
});

test("draft_references are exposed as document_draft business objects", () => {
  const record = normalizeCommandHistoryRecord({
    command_id: "cmd_doc",
    draft_reference: {
      draft_id: "doc_1",
      draft_type: "PI",
      status: "draft_only",
      manual_review_required: true,
    },
  });

  const refs = getBusinessObjectRefs(record);

  assert.equal(refs[0].type, "document_draft");
  assert.equal(refs[0].id, "doc_1");
  assert.equal(refs[0].status, "created_draft");
});

test("PI draft object has manual_review_required true", () => {
  const record = normalizeCommandHistoryRecord({
    draft_reference: { draft_id: "pi_1", draft_type: "PI" },
  });

  assert.equal(getBusinessObjectRefs(record)[0].manual_review_required, true);
});

test("customer inquiry and follow-up refs create safe handoff links", () => {
  const record = normalizeCommandHistoryRecord({
    command_id: "cmd_links",
    business_object_refs: [
      { type: "customer", id: "cus_1", label: "Kevin" },
      { type: "inquiry", id: "inq_1", label: "Latest website inquiry" },
      { type: "follow_up_task", id: "task_1", label: "Follow-up draft" },
    ],
  });
  const links = buildResumeHandoffLinks(record).map((item) => item.href).join("\n");

  assert.match(links, /view=customer-360&customer_id=cus_1/);
  assert.match(links, /view=inquiries&inquiry_id=inq_1/);
  assert.match(links, /view=follow-ups&task_id=task_1/);
  assert.equal(/send|execute|confirm/i.test(links), false);
});

test("archive path ref does not execute export", () => {
  const record = normalizeCommandHistoryRecord({
    command_id: "cmd_archive",
    business_object_refs: [
      { type: "archive_path", id: "巴拿马Kevin/2026-4", label: "Archive path preview" },
    ],
  });
  const ref = getBusinessObjectRefs(record)[0];

  assert.equal(ref.href, "/trade-os-prototype?view=documents&command_id=cmd_archive");
  assert.equal(JSON.stringify(ref).toLowerCase().includes("export"), false);
});

test("business object refs never contain token password secret or service key", () => {
  const record = normalizeCommandHistoryRecord({
    business_object_refs: [
      {
        type: "customer",
        id: "cus_1",
        password: "hidden",
        SUPABASE_SERVICE_ROLE_KEY: "secret",
        label: "Kevin",
      },
    ],
  });
  const text = JSON.stringify(record.business_object_refs);

  assert.equal(text.includes("hidden"), false);
  assert.equal(text.includes("secret"), false);
});

test("resume workspace model contains impact summary", () => {
  const record = normalizeCommandHistoryRecord({
    command_id: "cmd_impact",
    business_object_refs: [
      { type: "customer", id: "cus_1", label: "Kevin" },
      { type: "document_draft", id: "doc_1", label: "PI Draft", manual_review_required: true },
    ],
    blocked_actions: ["Send official PI"],
  });
  const model = getResumeWorkflowModel("cmd_impact", [record]);

  assert.equal(model.impact_summary.total, 2);
  assert.equal(model.business_object_refs.length, 2);
  assert.equal(model.blocked_actions.includes("Send official PI"), true);
});

test("addBusinessObjectRef appends safe normalized ref", () => {
  const history = [normalizeCommandHistoryRecord({ command_id: "cmd_add" })];
  const result = addBusinessObjectRef("cmd_add", { type: "lead", id: "lead_1", label: "Lead A" }, history);

  assert.equal(result.ok, true);
  assert.equal(findCommandHistoryRecord(result.history, "cmd_add").business_object_refs[0].type, "lead");
});

test("Command Journey summary counts progress business objects and drafts", () => {
  const record = normalizeCommandHistoryRecord({
    raw_command: "PI draft",
    parsed_intent: "create_document_draft",
    approval_required: true,
    status: "previewed",
    workflow_progress: [
      { step_id: "step_1", label: "Find customer", status: "completed" },
      { step_id: "step_2", label: "Review PI", status: "pending" },
      { step_id: "blocked_1", label: "Send official PI", status: "blocked" },
    ],
    draft_reference: { draft_id: "doc_1", draft_type: "PI" },
    business_object_refs: [{ type: "customer", id: "cus_1", label: "Kevin" }],
    blocked_actions: ["Send official PI", "Send official PI"],
  });

  const journey = summarizeCommandJourney(record);

  assert.equal(journey.progress_summary.completed, 1);
  assert.equal(journey.business_objects_count, 2);
  assert.equal(journey.draft_references_count, 1);
  assert.equal(journey.blocked_high_risk_actions_count, 1);
  assert.equal(journey.approval_required, true);
});

test("missing command_id resume model shows safe warning", () => {
  const model = getResumeWorkflowModel("missing", []);

  assert.equal(model.ok, false);
  assert.match(model.warning, /not found/);
  assert.equal(model.safe_next_actions.includes("Return to Command Center"), true);
});

test("no unsafe action is added as a safe next action", () => {
  const model = getResumeWorkflowModel("cmd_safe", [
    normalizeCommandHistoryRecord({
      command_id: "cmd_safe",
      raw_command: "follow up list",
      approval_required: false,
    }),
  ]);
  const safeText = model.safe_next_actions.join(" ").toLowerCase();

  assert.equal(safeText.includes("send"), false);
  assert.equal(safeText.includes("official pi"), false);
  assert.equal(safeText.includes("confirm bank"), false);
});

test("command history review_status transitions are internal only", () => {
  const history = [
    normalizeCommandHistoryRecord({
      command_id: "cmd_review",
      approval_required: true,
      draft_reference: { draft_id: "doc_1", draft_type: "proforma_invoice", review_status: "draft_only" },
    }),
  ];

  const pending = updateManualReviewStatus("cmd_review", ManualReviewStatus.REVIEW_PENDING, history, { reviewed_by: "paul@example.com" });
  const reviewed = updateManualReviewStatus("cmd_review", ManualReviewStatus.REVIEWED, pending.history, { reviewed_by: "paul@example.com" });

  assert.equal(pending.ok, true);
  assert.equal(findCommandHistoryRecord(pending.history, "cmd_review").review_status, "review_pending");
  assert.equal(reviewed.ok, true);
  assert.equal(findCommandHistoryRecord(reviewed.history, "cmd_review").review_status, "reviewed");
  assert.equal(findCommandHistoryRecord(reviewed.history, "cmd_review").draft_references[0].official_sent, false);
});

test("high-risk draft cannot become sent or official", () => {
  const history = [
    normalizeCommandHistoryRecord({
      command_id: "cmd_sent",
      approval_required: true,
      draft_reference: { draft_id: "pi_1", draft_type: "PI", review_status: "draft_only" },
    }),
  ];

  const result = updateManualReviewStatus("cmd_sent", "sent", history);

  assert.equal(result.ok, true);
  assert.equal(findCommandHistoryRecord(result.history, "cmd_sent").review_status, "draft_only");
  assert.equal(JSON.stringify(result.history).includes('"sent"'), false);
});

test("follow-up task draft does not send message", () => {
  const history = [
    normalizeCommandHistoryRecord({
      command_id: "cmd_follow",
      business_object_refs: [{ type: "customer", id: "cus_1", label: "Kevin" }],
    }),
  ];

  const result = createFollowUpTaskDraft("cmd_follow", history, { inquiry_id: "inq_1" });
  const draft = findCommandHistoryRecord(result.history, "cmd_follow").draft_references.find((item) => item.draft_type === "follow_up_task_draft");

  assert.equal(result.ok, true);
  assert.equal(draft.related_customer_id, "cus_1");
  assert.equal(draft.related_inquiry_id, "inq_1");
  assert.equal(draft.customer_message_sent, false);
});

test("document draft checklist includes internal field leakage checks", () => {
  const history = [normalizeCommandHistoryRecord({ command_id: "cmd_checklist" })];
  const result = generateDocumentDraftChecklist("cmd_checklist", history);
  const labels = result.checklist.map((item) => item.label).join("\n");

  assert.equal(result.ok, true);
  assert.equal(DOCUMENT_DRAFT_REVIEW_CHECKLIST.includes("是否存在 internal_weight_factor / 上浮 / internal cost 泄露风险"), true);
  assert.match(labels, /internal_weight_factor/);
  assert.match(labels, /仅为草稿/);
  assert.equal(findCommandHistoryRecord(result.history, "cmd_checklist").document_draft_checklist.length, DOCUMENT_DRAFT_REVIEW_CHECKLIST.length);
});

test("manual_review_note is stored internally and sanitized", () => {
  const history = [normalizeCommandHistoryRecord({ command_id: "cmd_note" })];
  const result = saveManualReviewNote("cmd_note", "内部备注 password=hidden", history, { reviewed_by: "paul@example.com" });
  const record = findCommandHistoryRecord(result.history, "cmd_note");

  assert.equal(result.ok, true);
  assert.equal(record.manual_review_note.includes("[redacted]"), true);
  assert.equal(record.reviewed_by, "paul@example.com");
});

test("reviewed status does not mean sent", () => {
  const record = normalizeCommandHistoryRecord({
    command_id: "cmd_reviewed",
    review_status: "reviewed",
    draft_reference: { draft_id: "doc_1", draft_type: "PI", review_status: "reviewed" },
  });

  assert.equal(record.review_status, "reviewed");
  assert.equal(record.draft_references[0].official_sent, false);
  assert.equal(record.draft_references[0].customer_message_sent, false);
});

test("draft_only review can be marked reviewed internally without sending", () => {
  const history = [
    normalizeCommandHistoryRecord({
      command_id: "cmd_direct_review",
      review_status: ManualReviewStatus.DRAFT_ONLY,
      draft_reference: { draft_id: "doc_1", draft_type: "PI", review_status: ManualReviewStatus.DRAFT_ONLY },
    }),
  ];
  const result = updateManualReviewStatus("cmd_direct_review", ManualReviewStatus.REVIEWED, history);
  const record = findCommandHistoryRecord(result.history, "cmd_direct_review");

  assert.equal(result.ok, true);
  assert.equal(record.review_status, ManualReviewStatus.REVIEWED);
  assert.equal(record.draft_references[0].review_status, ManualReviewStatus.REVIEWED);
  assert.equal(record.draft_references[0].official_sent, false);
  assert.equal(record.draft_references[0].customer_message_sent, false);
});

test("cancelled manual review status keeps workflow cancelled", () => {
  const history = [normalizeCommandHistoryRecord({ command_id: "cmd_cancel_review", review_status: "review_pending" })];
  const result = updateManualReviewStatus("cmd_cancel_review", ManualReviewStatus.CANCELLED, history);
  const record = findCommandHistoryRecord(result.history, "cmd_cancel_review");

  assert.equal(result.ok, true);
  assert.equal(record.review_status, "cancelled");
  assert.equal(record.status, "cancelled");
});

test("internal audit records list command history with workflow counts", () => {
  const history = [
    normalizeCommandHistoryRecord({
      command_id: "cmd_audit",
      raw_command: "给 Kevin 生成 PI 草稿",
      parsed_intent: "create_document_draft",
      approval_required: true,
      review_status: ManualReviewStatus.REVIEW_PENDING,
      manual_review_note: "内部审核备注",
      draft_reference: { draft_id: "doc_1", draft_type: "PI", review_status: ManualReviewStatus.REVIEW_PENDING },
      business_object_refs: [{ type: "customer", id: "cus_1", label: "Kevin" }],
      workflow_progress: [
        { step_id: "step_1", label: "Find customer", status: "completed" },
        { step_id: "step_2", label: "Review draft", status: "pending" },
      ],
      blocked_actions: ["Send official PI"],
    }),
  ];

  const records = listAuditRecords(history);

  assert.equal(records.length, 1);
  assert.equal(records[0].command_id, "cmd_audit");
  assert.equal(records[0].completed_steps_count, 1);
  assert.equal(records[0].pending_steps_count, 1);
  assert.equal(records[0].blocked_actions_count, 1);
  assert.equal(records[0].manual_review_required, true);
});

test("internal audit summary counts drafts reviews blocked and cancelled workflows", () => {
  const history = [
    normalizeCommandHistoryRecord({
      command_id: "cmd_doc",
      approval_required: true,
      review_status: ManualReviewStatus.REVIEW_PENDING,
      draft_reference: { draft_id: "doc_1", draft_type: "PI" },
      blocked_actions: ["Send official PI"],
    }),
    normalizeCommandHistoryRecord({
      command_id: "cmd_reviewed",
      review_status: ManualReviewStatus.REVIEWED,
      draft_reference: { draft_id: "doc_2", draft_type: "quotation" },
    }),
    normalizeCommandHistoryRecord({
      command_id: "cmd_follow",
      draft_reference: { draft_id: "task_1", draft_type: "follow_up_task_draft" },
    }),
    normalizeCommandHistoryRecord({
      command_id: "cmd_cancelled",
      review_status: ManualReviewStatus.CANCELLED,
      status: "cancelled",
    }),
  ];

  const summary = summarizeAuditRecords(history);

  assert.equal(summary.total_command_records, 4);
  assert.equal(summary.drafts_requiring_review, 1);
  assert.equal(summary.reviewed_internal_drafts, 1);
  assert.equal(summary.blocked_high_risk_workflows, 1);
  assert.equal(summary.follow_up_drafts, 1);
  assert.equal(summary.document_drafts, 2);
  assert.equal(summary.cancelled_workflows, 1);
});

test("internal audit filters support review document follow-up and manual review states", () => {
  const history = [
    normalizeCommandHistoryRecord({
      command_id: "cmd_pending",
      approval_required: true,
      review_status: ManualReviewStatus.REVIEW_PENDING,
      draft_reference: { draft_id: "doc_1", draft_type: "PI" },
    }),
    normalizeCommandHistoryRecord({
      command_id: "cmd_reviewed",
      review_status: ManualReviewStatus.REVIEWED,
      draft_reference: { draft_id: "doc_2", draft_type: "quotation" },
    }),
    normalizeCommandHistoryRecord({
      command_id: "cmd_follow",
      draft_reference: { draft_id: "task_1", draft_type: "follow_up_task_draft" },
    }),
  ];

  assert.deepEqual(filterAuditRecords("review_pending", history).map((item) => item.command_id), ["cmd_pending"]);
  assert.deepEqual(filterAuditRecords("document_drafts", history).map((item) => item.command_id).sort(), ["cmd_pending", "cmd_reviewed"]);
  assert.deepEqual(filterAuditRecords("follow_up_drafts", history).map((item) => item.command_id), ["cmd_follow"]);
  assert.deepEqual(filterAuditRecords("needs_manual_review", history).map((item) => item.command_id), ["cmd_pending"]);
});

test("internal audit records can be queried by business object", () => {
  const history = [
    normalizeCommandHistoryRecord({
      command_id: "cmd_customer",
      business_object_refs: [{ type: "customer", id: "cus_1", label: "Kevin" }],
    }),
    normalizeCommandHistoryRecord({
      command_id: "cmd_other",
      business_object_refs: [{ type: "lead", id: "lead_1", label: "Lead" }],
    }),
  ];

  const records = getAuditRecordsByBusinessObject("customer", "cus_1", history);

  assert.equal(records.length, 1);
  assert.equal(records[0].command_id, "cmd_customer");
});

test("internal audit summary keeps reviewed draft internal and not sent", () => {
  const record = buildAuditRecordSummary({
    command_id: "cmd_reviewed_internal",
    review_status: ManualReviewStatus.REVIEWED,
    draft_reference: { draft_id: "doc_1", draft_type: "PI", review_status: ManualReviewStatus.REVIEWED },
  });

  assert.equal(record.review_status, ManualReviewStatus.REVIEWED);
  assert.equal(record.customer_message_sent, false);
  assert.equal(record.official_sent, false);
  assert.equal(record.draft_references[0].customer_message_sent, false);
  assert.equal(record.draft_references[0].official_sent, false);
});

test("internal audit records sanitize notes and never expose secrets", () => {
  const record = buildAuditRecordSummary({
    command_id: "cmd_secret",
    raw_command: "test",
    manual_review_note: "password=hidden SUPABASE_SERVICE_ROLE_KEY=secret",
    business_object_refs: [{ type: "customer", id: "cus_1", label: "Kevin", access_token: "abc" }],
  });
  const text = JSON.stringify(record);

  assert.equal(text.includes("hidden"), false);
  assert.equal(text.includes("secret"), false);
  assert.equal(text.includes("abc"), false);
});

test("internal audit safe actions do not include unsafe commercial execution", () => {
  const record = buildAuditRecordSummary({
    command_id: "cmd_safe_audit",
    blocked_actions: ["Send official quotation", "Confirm bank account"],
  });
  const actions = record.safe_audit_actions.join(" ").toLowerCase();

  assert.equal(/send|official|bank|payment|delivery|price|compensation|responsibility/.test(actions), false);
  assert.equal(record.blocked_actions_count, 2);
});

test("audit detail model can be built from command history record", () => {
  const history = [
    normalizeCommandHistoryRecord({
      command_id: "cmd_detail",
      raw_command: "给 Kevin 生成 PI 草稿",
      parsed_intent: "create_document_draft",
      status: "previewed",
      approval_required: true,
      manual_review_note: "完整内部审核备注",
      draft_reference: { draft_id: "doc_1", draft_type: "PI", created_at: "2026-06-12T01:00:00.000Z" },
      business_object_refs: [{ type: "customer", id: "cus_1", label: "Kevin" }],
      blocked_actions: ["Send official PI"],
    }),
  ];

  const detail = getAuditDetailModel("cmd_detail", history);

  assert.equal(detail.ok, true);
  assert.equal(detail.command_id, "cmd_detail");
  assert.equal(detail.record.raw_command, "给 Kevin 生成 PI 草稿");
  assert.equal(detail.manual_review_note, "完整内部审核备注");
  assert.equal(detail.draft_references.length, 1);
  assert.equal(detail.business_object_refs.some((ref) => ref.type === "customer"), true);
});

test("audit detail includes full manual_review_note but keeps it internal", () => {
  const longNote = "这是一段较长的内部审核备注，用于记录人工判断、缺失信息和下一步处理建议。".repeat(8);
  const detail = getAuditDetailModel("cmd_note_detail", [
    normalizeCommandHistoryRecord({
      command_id: "cmd_note_detail",
      manual_review_note: longNote,
    }),
  ]);

  assert.equal(detail.manual_review_note, longNote);
  assert.equal(JSON.stringify(detail).includes("internal_only"), true);
  assert.equal(detail.customer_message_sent, false);
});

test("audit detail summary excludes token password secret and service key", () => {
  const summary = buildAuditDetailSummary({
    command_id: "cmd_secret_detail",
    raw_command: "test token=abc",
    manual_review_note: "password=hidden SUPABASE_SERVICE_ROLE_KEY=secret",
    business_object_refs: [{ type: "customer", id: "cus_1", label: "Kevin", api_key: "secret" }],
  });

  assert.equal(summary.includes("abc"), false);
  assert.equal(summary.includes("hidden"), false);
  assert.equal(summary.includes("secret"), false);
});

test("copied audit detail summary does not imply customer message was sent", () => {
  const summary = buildAuditDetailSummary({
    command_id: "cmd_not_sent",
    raw_command: "生成 PI 草稿",
    blocked_actions: ["Send official PI", "Send customer message"],
  }).toLowerCase();

  assert.equal(summary.includes("message was sent"), false);
  assert.equal(summary.includes("customer message sent"), false);
  assert.match(summary, /未执行客户外部动作/);
});

test("reviewed audit detail status does not imply sent", () => {
  const detail = getAuditDetailModel("cmd_reviewed_detail", [
    normalizeCommandHistoryRecord({
      command_id: "cmd_reviewed_detail",
      review_status: ManualReviewStatus.REVIEWED,
      draft_reference: { draft_id: "doc_1", draft_type: "PI", review_status: ManualReviewStatus.REVIEWED },
    }),
  ]);

  assert.equal(detail.review_status, ManualReviewStatus.REVIEWED);
  assert.equal(detail.customer_message_sent, false);
  assert.equal(detail.official_sent, false);
  assert.equal(detail.draft_references[0].customer_message_sent, false);
  assert.equal(detail.draft_references[0].official_sent, false);
});

test("blocked actions remain blocked in audit detail view", () => {
  const detail = getAuditDetailModel("cmd_blocked_detail", [
    normalizeCommandHistoryRecord({
      command_id: "cmd_blocked_detail",
      blocked_actions: ["Send official quotation", "Confirm bank account"],
    }),
  ]);

  assert.deepEqual(detail.blocked_actions, ["Send official quotation", "Confirm bank account"]);
  assert.equal(detail.safe_actions.includes("send_message"), false);
  assert.equal(detail.safe_actions.includes("send_official_pi"), false);
});

test("audit detail timeline handles missing timestamps safely", () => {
  const timeline = buildAuditTimeline({
    command_id: "cmd_timeline",
    planned_actions: ["Find customer", "Prepare draft"],
    workflow_progress: [
      { step_id: "step_1", label: "Find customer", status: "completed", completed_at: "" },
    ],
  });

  assert.equal(timeline.some((event) => event.timestamp === "时间未记录"), true);
  assert.equal(timeline.every((event) => event.internal_only), true);
});

test("audit detail related business object links are safe internal links only", () => {
  const detail = getAuditDetailModel("cmd_links_detail", [
    normalizeCommandHistoryRecord({
      command_id: "cmd_links_detail",
      business_object_refs: [
        { type: "customer", id: "cus_1", label: "Kevin", href: "/trade-os-prototype?view=customer-360&customer_id=cus_1" },
        { type: "lead", id: "lead_1", label: "Unsafe", href: "https://example.com/lead" },
      ],
    }),
  ]);

  assert.equal(detail.related_links.length, 1);
  assert.equal(detail.related_links[0].href.startsWith("/trade-os-prototype"), true);
});

test("document draft references can be listed for Document Center", () => {
  const history = [
    normalizeCommandHistoryRecord({
      command_id: "cmd_doc_review",
      raw_command: "给 Kevin 生成 PI 草稿",
      draft_reference: { draft_id: "doc_1", draft_type: "PI", review_status: "draft_only" },
      business_object_refs: [{ type: "customer", id: "cus_1", label: "Kevin" }],
    }),
    normalizeCommandHistoryRecord({
      command_id: "cmd_followup",
      draft_reference: { draft_id: "follow_1", draft_type: "follow_up_task_draft" },
    }),
  ];

  const drafts = listDocumentDraftReviewRecords(history);

  assert.equal(drafts.length, 1);
  assert.equal(drafts[0].draft_id, "doc_1");
  assert.equal(drafts[0].command_id, "cmd_doc_review");
  assert.equal(drafts[0].related_business_objects[0].type, "customer");
});

test("PI draft remains manual_review_required in Document Center review", () => {
  const drafts = listDocumentDraftReviewRecords([
    normalizeCommandHistoryRecord({
      command_id: "cmd_pi_review",
      approval_required: true,
      draft_reference: { draft_id: "pi_1", draft_type: "proforma_invoice", manual_review_required: true },
      blocked_actions: ["Send official PI"],
    }),
  ]);

  assert.equal(drafts[0].manual_review_required, true);
  assert.equal(drafts[0].official_sent, false);
});

test("document draft reviewed status does not mean sent or issued", () => {
  const drafts = listDocumentDraftReviewRecords([
    normalizeCommandHistoryRecord({
      command_id: "cmd_reviewed_doc",
      review_status: ManualReviewStatus.REVIEWED,
      draft_reference: { draft_id: "doc_1", draft_type: "quotation", review_status: ManualReviewStatus.REVIEWED },
    }),
  ]);

  assert.equal(drafts[0].review_status, ManualReviewStatus.REVIEWED);
  assert.equal(drafts[0].customer_message_sent, false);
  assert.equal(drafts[0].official_sent, false);
  assert.equal(drafts[0].official_document_issued, false);
});

test("draft review checklist includes hidden-field and manual review checks", () => {
  const checklist = buildDocumentDraftReviewChecklist({ manual_review_required: true }, { approval_required: true });
  const labels = checklist.map((item) => item.label).join("\n");

  assert.match(labels, /internal_weight_factor/);
  assert.match(labels, /上浮/);
  assert.match(labels, /internal cost/);
  assert.match(labels, /是否需要人工审核/);
});

test("draft review summary excludes token password secret and service key", () => {
  const summary = buildDocumentDraftReviewSummary(
    normalizeCommandHistoryRecord({
      command_id: "cmd_secret_doc",
      raw_command: "PI token=abc",
      manual_review_note: "password=hidden service_key=secret",
      business_object_refs: [{ type: "customer", id: "cus_1", label: "Kevin", api_key: "secret" }],
    }),
    { draft_id: "doc_1", draft_type: "PI" },
  );

  assert.equal(summary.includes("abc"), false);
  assert.equal(summary.includes("hidden"), false);
  assert.equal(summary.includes("secret"), false);
});

test("document draft review safe actions do not include sending or official export", () => {
  const drafts = listDocumentDraftReviewRecords([
    normalizeCommandHistoryRecord({
      command_id: "cmd_safe_doc",
      draft_reference: { draft_id: "doc_1", draft_type: "PI" },
      blocked_actions: ["Send official PI", "Export official document"],
    }),
  ]);
  const actions = drafts[0].safe_actions.join(" ").toLowerCase();

  assert.equal(/send|official|export|quotation|pi|customer_message/.test(actions), false);
  assert.equal(drafts[0].blocked_actions.includes("Send official PI"), true);
});
