export const COMMAND_HISTORY_STORAGE_KEY = "cbm-command-center-history-v1";

const SENSITIVE_KEY_PATTERN = /(password|secret|service_role|token|access_token|refresh_token|supabase.*key|api_key|cookie|session)/i;
const BLOCKED_ACTION_PATTERN = /(send|official|pi|quotation|bank|payment|delivery|price|compensation|responsibility|message)/i;
export const ManualReviewStatus = Object.freeze({
  DRAFT_ONLY: "draft_only",
  REVIEW_PENDING: "review_pending",
  REVIEWED: "reviewed",
  BLOCKED_REQUIRES_MANUAL_REVIEW: "blocked_requires_manual_review",
  CANCELLED: "cancelled",
});

export const DOCUMENT_DRAFT_REVIEW_CHECKLIST = Object.freeze([
  "客户信息是否完整",
  "卖方信息是否为 CBM GLOBAL LIMITED",
  "银行信息是否需要人工确认",
  "金额是否需要人工确认",
  "付款条款是否需要人工确认",
  "交期是否需要人工确认",
  "内部字段是否已隐藏",
  "是否存在 internal_weight_factor / 上浮 / internal cost 泄露风险",
  "是否仅为草稿，不是正式文件",
]);

export const DOCUMENT_DRAFT_REVIEW_PANEL_CHECKLIST = Object.freeze([
  ...DOCUMENT_DRAFT_REVIEW_CHECKLIST,
  "是否需要人工审核",
]);

export function sanitizeCommandHistoryValue(value) {
  if (Array.isArray(value)) return value.map((item) => sanitizeCommandHistoryValue(item)).filter((item) => item !== undefined);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !SENSITIVE_KEY_PATTERN.test(key))
        .map(([key, item]) => [key, sanitizeCommandHistoryValue(item)])
        .filter(([, item]) => item !== undefined),
    );
  }
  if (typeof value === "string" && SENSITIVE_KEY_PATTERN.test(value)) return "[redacted]";
  return value;
}

export function createWorkflowProgress(plannedActions = [], blockedActions = []) {
  const safeSteps = plannedActions.map((label, index) => ({
    step_id: `step_${index + 1}`,
    label,
    status: index === 0 ? "completed" : "pending",
    related_action: label,
    completed_at: index === 0 ? new Date().toISOString() : "",
  }));
  const blockedSteps = blockedActions.map((label, index) => ({
    step_id: `blocked_${index + 1}`,
    label,
    status: "blocked",
    related_action: label,
    completed_at: "",
  }));
  return [...safeSteps, ...blockedSteps];
}

export function normalizeCommandHistoryRecord(record = {}) {
  const createdAt = record.created_at || new Date().toISOString();
  const draftReferences = (record.draft_references || (record.draft_reference ? [record.draft_reference] : [])).map(normalizeDraftReference);
  const blockedActions = uniqueStrings(record.blocked_actions || []);
  const workflowProgress =
    record.workflow_progress?.length
      ? record.workflow_progress
      : createWorkflowProgress(record.planned_actions || [], blockedActions);
  const businessObjectRefs = normalizeBusinessObjectRefs([
    ...(record.business_object_refs || []),
    ...businessObjectRefsFromDrafts(draftReferences),
    ...businessObjectRefsFromPreviewCards(record.preview_cards || []),
  ], record);
  return sanitizeCommandHistoryValue({
    command_id: record.command_id || `cmd_${Date.now()}`,
    raw_command: record.raw_command || "",
    parsed_intent: record.parsed_intent || "",
    planned_actions: record.planned_actions || [],
    preview_cards: record.preview_cards || [],
    draft_references: draftReferences,
    draft_reference: record.draft_reference || draftReferences[0] || null,
    business_object_refs: businessObjectRefs,
    workflow_progress: workflowProgress,
    review_status: normalizeReviewStatus(record.review_status || draftReferences[0]?.review_status || record.status),
    manual_review_note: record.manual_review_note || "",
    reviewed_at: record.reviewed_at || null,
    reviewed_by: record.reviewed_by || "",
    safe_action_results: record.safe_action_results || [],
    document_draft_checklist: record.document_draft_checklist || [],
    approval_required: Boolean(record.approval_required),
    blocked_actions: blockedActions,
    status: record.status || "planned",
    result_summary: record.result_summary || "No result",
    card_titles: record.card_titles || [],
    resume_link: record.resume_link || buildResumeWorkflowLink(record),
    created_at: createdAt,
    updated_at: record.updated_at || createdAt,
  });
}

export function upsertCommandHistoryRecord(history = [], record = {}) {
  const normalized = normalizeCommandHistoryRecord({ ...record, updated_at: new Date().toISOString() });
  const withoutCurrent = history.filter((item) => item.command_id !== normalized.command_id);
  return [normalized, ...withoutCurrent].slice(0, 30);
}

export function findCommandHistoryRecord(history = [], commandId = "") {
  if (!commandId) return null;
  const found = history.find((item) => item.command_id === commandId);
  return found ? normalizeCommandHistoryRecord(found) : null;
}

export function markWorkflowStepCompleted(record = {}, stepId = "") {
  if (typeof record === "string") {
    const commandId = record;
    const history = Array.isArray(arguments[2]) ? arguments[2] : [];
    const found = findCommandHistoryRecord(history, commandId);
    if (!found) return { ok: false, history, record: null, reason: "Command history record not found." };
    const result = markWorkflowStepCompleted(found, stepId);
    return result.ok
      ? { ...result, history: upsertCommandHistoryRecord(history, result.record) }
      : { ...result, history };
  }
  const normalized = normalizeCommandHistoryRecord(record);
  const step = normalized.workflow_progress.find((item) => item.step_id === stepId);
  if (!step || step.status === "blocked") {
    return { ok: false, record: normalized, reason: "Blocked or missing workflow step cannot be completed." };
  }
  const updated = {
    ...normalized,
    workflow_progress: normalized.workflow_progress.map((item) =>
      item.step_id === stepId
        ? { ...item, status: "completed", completed_at: new Date().toISOString() }
        : item,
    ),
    updated_at: new Date().toISOString(),
  };
  return { ok: true, record: updated };
}

export function summarizeWorkflowProgress(record = {}) {
  const normalized = normalizeCommandHistoryRecord(record);
  const progress = normalized.workflow_progress || [];
  const completed = progress.filter((item) => item.status === "completed").length;
  const pending = progress.filter((item) => item.status === "pending").length;
  const blocked = progress.filter((item) => item.status === "blocked").length;
  const skipped = progress.filter((item) => item.status === "skipped").length;
  return {
    total: progress.length,
    completed,
    pending,
    blocked,
    skipped,
    draft_count: (normalized.draft_references || []).length,
    approval_required: Boolean(normalized.approval_required),
    updated_at: normalized.updated_at,
    text: `${completed} completed / ${pending} pending / ${blocked} blocked`,
  };
}

export function summarizeCommandJourney(record = {}) {
  const normalized = normalizeCommandHistoryRecord(record);
  const progress = summarizeWorkflowProgress(normalized);
  const impact = summarizeBusinessObjectImpact(normalized);
  const pendingStep = normalized.workflow_progress.find((step) => step.status === "pending");
  const safeNextAction = normalized.approval_required
    ? "Manual review required before any customer-facing or commercial action."
    : pendingStep?.label || "Review workflow and archive as closed when complete.";
  return {
    original_command: normalized.raw_command,
    parsed_intent: normalized.parsed_intent,
    approval_required: Boolean(normalized.approval_required),
    current_status: normalized.status,
    progress_summary: progress,
    business_objects_count: impact.total,
    draft_references_count: (normalized.draft_references || []).length,
    safe_next_action: safeNextAction,
    blocked_high_risk_actions_count: uniqueStrings(normalized.blocked_actions || []).length,
    blocked_high_risk_actions: uniqueStrings(normalized.blocked_actions || []),
  };
}

export function workflowProgressSummary(record = {}) {
  return summarizeWorkflowProgress(record).text.replaceAll(" / ", " · ");
}

export function getResumeWorkflowModel(commandId = "", history = []) {
  const record = findCommandHistoryRecord(history, commandId);
  if (!record) {
    return {
      ok: false,
      command_id: commandId,
      warning: "Command history record not found.",
      record: null,
      progress_summary: null,
      preview_cards: [],
      draft_references: [],
      target_links: [],
      safe_next_actions: ["Return to Command Center", "Choose another command history record"],
      blocked_actions: [],
    };
  }
  const progressSummary = summarizeWorkflowProgress(record);
  const targetLinks = collectTargetLinks(record);
  return {
    ok: true,
    command_id: commandId,
    record,
    original_command: record.raw_command,
    parsed_intent: record.parsed_intent,
    command_status: record.status,
    progress_summary: progressSummary,
    preview_cards: record.preview_cards || [],
    draft_references: record.draft_references || [],
    target_links: targetLinks,
    business_object_refs: record.business_object_refs || [],
    impact_summary: summarizeBusinessObjectImpact(record),
    journey_summary: summarizeCommandJourney(record),
    handoff_links: buildResumeHandoffLinks(record),
    safe_next_actions: [
      "Mark safe pending step as completed",
      "Copy workflow summary",
      "Open target module",
      "Create follow-up task draft",
      "Generate document draft checklist",
      "Mark manual review status",
      "Add internal review note",
      "Cancel workflow",
      ...(record.approval_required ? [] : ["Archive command history record as closed"]),
    ],
    blocked_actions: record.blocked_actions || [],
    resume_link: record.resume_link || buildResumeWorkflowLink(record),
  };
}

export function createFollowUpTaskDraft(commandId = "", history = [], context = {}) {
  const record = findCommandHistoryRecord(history, commandId);
  if (!record) return { ok: false, history, reason: "Command history record not found." };
  const draft = normalizeDraftReference({
    draft_id: `followup_draft_${Date.now()}`,
    draft_type: "follow_up_task_draft",
    related_customer_id: context.customer_id || firstRefId(record, "customer") || "",
    related_lead_id: context.lead_id || firstRefId(record, "lead") || "",
    related_inquiry_id: context.inquiry_id || firstRefId(record, "inquiry") || "",
    related_project_id: context.project_id || firstRefId(record, "project") || "",
    created_at: new Date().toISOString(),
    status: "draft_only",
    review_status: ManualReviewStatus.DRAFT_ONLY,
    manual_review_required: false,
    internal_only: true,
    customer_message_sent: false,
    result_summary: "跟进任务草稿已创建，仍需人工确认。",
  });
  const updated = {
    ...record,
    draft_references: [...(record.draft_references || []), draft],
    safe_action_results: appendSafeActionResult(record, {
      action: "create_followup_task_draft",
      result_summary: "跟进任务草稿已创建，仍需人工确认。",
      draft_id: draft.draft_id,
      created_at: draft.created_at,
    }),
    result_summary: "跟进任务草稿已创建，仍需人工确认。",
    updated_at: new Date().toISOString(),
  };
  return { ok: true, record: updated, draft, history: upsertCommandHistoryRecord(history, updated) };
}

export function generateDocumentDraftChecklist(commandId = "", history = []) {
  const record = findCommandHistoryRecord(history, commandId);
  if (!record) return { ok: false, history, reason: "Command history record not found." };
  const checklist = DOCUMENT_DRAFT_REVIEW_CHECKLIST.map((label, index) => ({
    item_id: `doc_check_${index + 1}`,
    label,
    status: "pending",
    internal_only: true,
  }));
  const updated = {
    ...record,
    document_draft_checklist: checklist,
    safe_action_results: appendSafeActionResult(record, {
      action: "generate_document_draft_checklist",
      result_summary: "单据草稿检查清单已生成，不会导出或发送。",
      created_at: new Date().toISOString(),
    }),
    result_summary: "单据草稿检查清单已生成，不会导出或发送。",
    updated_at: new Date().toISOString(),
  };
  return { ok: true, record: updated, checklist, history: upsertCommandHistoryRecord(history, updated) };
}

export function updateManualReviewStatus(commandId = "", nextStatus = "", history = [], options = {}) {
  const record = findCommandHistoryRecord(history, commandId);
  if (!record) return { ok: false, history, reason: "Command history record not found." };
  const normalizedNext = normalizeReviewStatus(nextStatus);
  const current = normalizeReviewStatus(record.review_status || ManualReviewStatus.DRAFT_ONLY);
  if (!isAllowedReviewTransition(current, normalizedNext)) {
    return { ok: false, record, history, reason: "Manual review status transition is not allowed." };
  }
  const now = new Date().toISOString();
  const reviewedBy = options.reviewed_by || "local_admin";
  const updatedDrafts = (record.draft_references || []).map((draft) => ({
    ...draft,
    review_status: normalizedNext,
    status: normalizedNext,
    reviewed_at: normalizedNext === ManualReviewStatus.REVIEWED ? now : draft.reviewed_at || null,
    reviewed_by: normalizedNext === ManualReviewStatus.REVIEWED ? reviewedBy : draft.reviewed_by || "",
  }));
  const updated = {
    ...record,
    review_status: normalizedNext,
    draft_references: updatedDrafts,
    draft_reference: updatedDrafts[0] || record.draft_reference || null,
    reviewed_at: normalizedNext === ManualReviewStatus.REVIEWED ? now : record.reviewed_at || null,
    reviewed_by: normalizedNext === ManualReviewStatus.REVIEWED ? reviewedBy : record.reviewed_by || "",
    status: normalizedNext === ManualReviewStatus.CANCELLED ? "cancelled" : record.status,
    safe_action_results: appendSafeActionResult(record, {
      action: "update_manual_review_status",
      review_status: normalizedNext,
      result_summary: "人工审核状态已更新。该状态仅表示内部审核，不代表已发送客户。",
      created_at: now,
    }),
    result_summary: "人工审核状态已更新。该状态仅表示内部审核，不代表已发送客户。",
    updated_at: now,
  };
  return { ok: true, record: updated, history: upsertCommandHistoryRecord(history, updated) };
}

export function saveManualReviewNote(commandId = "", note = "", history = [], options = {}) {
  const record = findCommandHistoryRecord(history, commandId);
  if (!record) return { ok: false, history, reason: "Command history record not found." };
  const updated = {
    ...record,
    manual_review_note: String(note || "").slice(0, 2000),
    reviewed_by: options.reviewed_by || record.reviewed_by || "local_admin",
    safe_action_results: appendSafeActionResult(record, {
      action: "save_manual_review_note",
      result_summary: "审核备注已保存，仅内部使用，不会发送给客户。",
      created_at: new Date().toISOString(),
    }),
    result_summary: "审核备注已保存，仅内部使用，不会发送给客户。",
    updated_at: new Date().toISOString(),
  };
  return { ok: true, record: updated, history: upsertCommandHistoryRecord(history, updated) };
}

export function listAuditRecords(history = readCommandHistoryFromLocalStorage()) {
  return (history || [])
    .map((record) => buildAuditRecordSummary(record))
    .sort((a, b) => String(b.updated_at || b.created_at).localeCompare(String(a.updated_at || a.created_at)));
}

export function summarizeAuditRecords(history = readCommandHistoryFromLocalStorage()) {
  const records = listAuditRecords(history);
  return sanitizeCommandHistoryValue({
    total_command_records: records.length,
    drafts_requiring_review: records.filter((record) => record.manual_review_required && ["draft_only", "review_pending", "blocked_requires_manual_review"].includes(record.review_status)).length,
    reviewed_internal_drafts: records.filter((record) => record.review_status === ManualReviewStatus.REVIEWED).length,
    blocked_high_risk_workflows: records.filter((record) => record.blocked_actions_count > 0 || record.status === ManualReviewStatus.BLOCKED_REQUIRES_MANUAL_REVIEW).length,
    follow_up_drafts: records.filter((record) => record.draft_references.some((draft) => draft.draft_type === "follow_up_task_draft")).length,
    document_drafts: records.filter((record) => record.draft_references.some((draft) => draft.draft_type !== "follow_up_task_draft")).length,
    cancelled_workflows: records.filter((record) => record.status === ManualReviewStatus.CANCELLED || record.review_status === ManualReviewStatus.CANCELLED).length,
  });
}

export function filterAuditRecords(filter = "all", history = readCommandHistoryFromLocalStorage()) {
  const records = listAuditRecords(history);
  if (!filter || filter === "all") return records;
  if (Object.values(ManualReviewStatus).includes(filter)) return records.filter((record) => record.review_status === filter || record.status === filter);
  if (filter === "document_drafts") return records.filter((record) => record.draft_references.some((draft) => draft.draft_type !== "follow_up_task_draft"));
  if (filter === "follow_up_drafts") return records.filter((record) => record.draft_references.some((draft) => draft.draft_type === "follow_up_task_draft"));
  if (filter === "needs_manual_review") return records.filter((record) => record.manual_review_required || record.blocked_actions_count > 0 || record.review_status === ManualReviewStatus.REVIEW_PENDING);
  return records;
}

export function buildAuditRecordSummary(record = {}) {
  const normalized = normalizeCommandHistoryRecord(record);
  const progress = summarizeWorkflowProgress(normalized);
  const refs = getBusinessObjectRefs(normalized);
  const draftReferences = (normalized.draft_references || []).map(normalizeDraftReference);
  const manualReviewRequired = Boolean(normalized.approval_required || draftReferences.some((draft) => draft.manual_review_required) || normalized.blocked_actions?.length);
  return sanitizeCommandHistoryValue({
    command_id: normalized.command_id,
    original_command: normalized.raw_command,
    parsed_intent: normalized.parsed_intent,
    review_status: normalized.review_status,
    status: normalized.status,
    manual_review_required: manualReviewRequired,
    manual_review_note_summary: summarizeNote(normalized.manual_review_note),
    related_business_objects: refs,
    related_business_object_label: refs.length ? refs.map((ref) => `${ref.type}:${ref.label || ref.id || "object"}`).join(" · ") : "未关联业务对象",
    draft_references: draftReferences,
    blocked_actions_count: (normalized.blocked_actions || []).length,
    blocked_actions: normalized.blocked_actions || [],
    completed_steps_count: progress.completed,
    pending_steps_count: progress.pending,
    updated_at: normalized.updated_at,
    created_at: normalized.created_at,
    resume_link: normalized.resume_link || buildResumeWorkflowLink(normalized),
    safe_audit_actions: [
      "open_resume_workflow",
      "copy_audit_summary",
      "open_related_business_object",
      "mark_review_pending",
      "mark_reviewed",
      "cancel_workflow",
    ],
    customer_message_sent: false,
    official_sent: false,
  });
}

export function getAuditRecordsByBusinessObject(type = "", id = "", history = readCommandHistoryFromLocalStorage()) {
  return listAuditRecords(history).filter((record) =>
    (record.related_business_objects || []).some((ref) => ref.type === type && (!id || ref.id === id)),
  );
}

export function listDocumentDraftReviewRecords(history = readCommandHistoryFromLocalStorage()) {
  return (history || [])
    .map(normalizeCommandHistoryRecord)
    .flatMap((record) =>
      (record.draft_references || [])
        .filter(isDocumentDraftReference)
        .map((draft) => buildDocumentDraftReviewRecord(record, draft)),
    )
    .sort((a, b) => String(b.updated_at || b.created_at).localeCompare(String(a.updated_at || a.created_at)));
}

export function buildDocumentDraftReviewChecklist(draft = {}, record = {}) {
  return DOCUMENT_DRAFT_REVIEW_PANEL_CHECKLIST.map((label, index) => ({
    item_id: `draft_review_${index + 1}`,
    label,
    status: label === "是否需要人工审核"
      ? (draft.manual_review_required || record.approval_required ? "required" : "not_required")
      : "pending",
    internal_only: true,
  }));
}

export function buildDocumentDraftReviewSummary(record = {}, draft = {}) {
  const normalized = normalizeCommandHistoryRecord(record);
  const normalizedDraft = normalizeDraftReference(draft);
  const refs = getBusinessObjectRefs(normalized);
  return sanitizeCommandHistoryValue([
    `原始指令: ${normalized.raw_command || "-"}`,
    `单据草稿: ${normalizedDraft.draft_type || "draft"} ${normalizedDraft.draft_id || "-"}`,
    `审核状态: ${normalizedDraft.review_status || normalized.review_status}`,
    `关联业务对象: ${refs.length ? refs.map((ref) => `${ref.type}:${ref.label || ref.id || "object"}`).join(" · ") : "未关联业务对象"}`,
    `禁止动作: ${(normalized.blocked_actions || []).length ? normalized.blocked_actions.join(" · ") : "无"}`,
    "已内部审核不代表已发送客户，也不代表正式单据已出具。",
  ].join("\n"));
}

export function getAuditDetailModel(commandId = "", history = readCommandHistoryFromLocalStorage()) {
  const record = findCommandHistoryRecord(history, commandId);
  if (!record) {
    return {
      ok: false,
      command_id: commandId,
      warning: "Audit record not found.",
      record: null,
      timeline: [],
      detail_summary: "",
      safe_actions: ["Return to Command Center", "Choose another audit record"],
      blocked_actions: [],
      related_links: [],
    };
  }
  const auditSummary = buildAuditRecordSummary(record);
  const relatedLinks = buildResumeHandoffLinks(record).filter((link) => isSafeInternalHref(link.href));
  return sanitizeCommandHistoryValue({
    ok: true,
    command_id: record.command_id,
    record,
    audit_summary: auditSummary,
    command_status: record.status,
    review_status: record.review_status,
    manual_review_required: auditSummary.manual_review_required,
    manual_review_note: record.manual_review_note || "",
    workflow_progress: record.workflow_progress || [],
    draft_references: record.draft_references || [],
    business_object_refs: record.business_object_refs || [],
    blocked_actions: record.blocked_actions || [],
    safe_actions: [
      "mark_review_pending",
      "mark_reviewed",
      "cancel_workflow",
      "copy_audit_detail_summary",
      "open_resume_workflow",
      "open_related_business_object",
    ],
    related_links: relatedLinks,
    resume_link: record.resume_link || buildResumeWorkflowLink(record),
    timeline: buildAuditTimeline(record),
    detail_summary: buildAuditDetailSummary(record),
    customer_message_sent: false,
    official_sent: false,
  });
}

export function buildAuditTimeline(record = {}) {
  const normalized = normalizeCommandHistoryRecord(record);
  const events = [
    auditTimelineEvent("command_created", "指令创建", normalized.created_at, normalized.status),
  ];
  if ((normalized.preview_cards || []).length) {
    events.push(auditTimelineEvent("preview_generated", "预览已生成", normalized.updated_at, "previewed"));
  } else {
    events.push(auditTimelineEvent("preview_generated", "预览生成时间未记录", "", "missing"));
  }
  for (const draft of normalized.draft_references || []) {
    events.push(auditTimelineEvent(`draft_${draft.draft_id || "unknown"}`, `草稿引用已创建：${draft.draft_type || "draft"}`, draft.created_at || normalized.updated_at, draft.review_status || draft.status));
  }
  if (normalized.review_status) {
    events.push(auditTimelineEvent("review_status_changed", `审核状态：${normalized.review_status}`, normalized.reviewed_at || normalized.updated_at, normalized.review_status));
  }
  if (normalized.manual_review_note) {
    events.push(auditTimelineEvent("manual_review_note_updated", "审核备注已更新", normalized.updated_at, "internal_note"));
  }
  for (const step of normalized.workflow_progress || []) {
    if (step.status === "completed") {
      events.push(auditTimelineEvent(`step_${step.step_id}`, `步骤完成：${step.label}`, step.completed_at, "completed"));
    }
  }
  for (const result of normalized.safe_action_results || []) {
    events.push(auditTimelineEvent(`safe_${result.action || "action"}_${result.created_at || ""}`, result.result_summary || result.action || "安全动作已记录", result.created_at || normalized.updated_at, "safe_action"));
  }
  if (normalized.status === "cancelled") {
    events.push(auditTimelineEvent("workflow_cancelled", "流程已取消", normalized.updated_at, "cancelled"));
  }
  if (normalized.status === "completed") {
    events.push(auditTimelineEvent("workflow_closed", "流程已关闭", normalized.updated_at, "completed"));
  }
  return sanitizeCommandHistoryValue(events);
}

export function buildAuditDetailSummary(record = {}) {
  const normalized = normalizeCommandHistoryRecord(record);
  const refs = getBusinessObjectRefs(normalized);
  const pendingStep = normalized.workflow_progress.find((step) => step.status === "pending");
  return sanitizeCommandHistoryValue([
    `原始指令: ${normalized.raw_command || "-"}`,
    `识别意图: ${normalized.parsed_intent || "-"}`,
    `审核状态: ${normalizeReviewStatus(normalized.review_status)}`,
    `关联业务对象: ${refs.length ? refs.map((ref) => `${ref.type}:${ref.label || ref.id || "object"}`).join(" · ") : "未关联业务对象"}`,
    `草稿引用: ${(normalized.draft_references || []).length ? normalized.draft_references.map((draft) => `${draft.draft_type || "draft"}:${draft.draft_id || "-"}`).join(" · ") : "无"}`,
    `禁止动作: ${(normalized.blocked_actions || []).length ? normalized.blocked_actions.join(" · ") : "无"}`,
    `当前下一步: ${pendingStep?.label || "检查审核状态并继续安全内部处理"}`,
    "仅内部审核用途，未执行客户外部动作。",
  ].join("\n"));
}

export function getBusinessObjectRefs(record = {}) {
  return normalizeCommandHistoryRecord(record).business_object_refs || [];
}

export function summarizeBusinessObjectImpact(record = {}) {
  const normalized = normalizeCommandHistoryRecord(record);
  const refs = normalized.business_object_refs || [];
  const countByType = refs.reduce((acc, ref) => {
    acc[ref.type] = (acc[ref.type] || 0) + 1;
    return acc;
  }, {});
  return {
    total: refs.length,
    related_customer: refs.find((ref) => ref.type === "customer") || null,
    related_lead: refs.find((ref) => ref.type === "lead") || null,
    related_inquiry: refs.find((ref) => ref.type === "inquiry") || null,
    related_document_draft: refs.find((ref) => ref.type === "document_draft") || null,
    related_follow_up_task: refs.find((ref) => ref.type === "follow_up_task") || null,
    related_archive_path: refs.find((ref) => ref.type === "archive_path") || null,
    blocked_high_risk_actions: normalized.blocked_actions || [],
    count_by_type: countByType,
    text: `${refs.length} business object reference${refs.length === 1 ? "" : "s"} · ${Object.entries(countByType).map(([type, count]) => `${type}:${count}`).join(" · ") || "none"}`,
  };
}

export function addBusinessObjectRef(commandId = "", ref = {}, history = []) {
  const record = findCommandHistoryRecord(history, commandId);
  if (!record) return { ok: false, history, reason: "Command history record not found." };
  const refs = normalizeBusinessObjectRefs([...(record.business_object_refs || []), ref], record);
  const updated = {
    ...record,
    business_object_refs: refs,
    updated_at: new Date().toISOString(),
  };
  return { ok: true, record: updated, history: upsertCommandHistoryRecord(history, updated) };
}

export function buildResumeHandoffLinks(record = {}) {
  return getBusinessObjectRefs(record)
    .map((ref) => ({ label: ref.label || `${ref.type} ${ref.id || ""}`.trim(), href: appendCommandParams(ref.href || hrefForBusinessObjectRef(ref), record), type: ref.type }))
    .filter((link) => link.href)
    .filter((link, index, links) => links.findIndex((item) => item.href === link.href && item.label === link.label) === index);
}

export function cancelWorkflow(commandId = "", history = []) {
  const record = findCommandHistoryRecord(history, commandId);
  if (!record) return { ok: false, history, reason: "Command history record not found." };
  const updated = {
    ...record,
    status: "cancelled",
    updated_at: new Date().toISOString(),
  };
  return { ok: true, record: updated, history: upsertCommandHistoryRecord(history, updated) };
}

export function closeWorkflow(commandId = "", history = []) {
  const record = findCommandHistoryRecord(history, commandId);
  if (!record) return { ok: false, history, reason: "Command history record not found." };
  if (record.approval_required || (record.blocked_actions || []).length) {
    const updated = {
      ...record,
      status: "blocked_requires_manual_review",
      updated_at: new Date().toISOString(),
    };
    return {
      ok: false,
      record: updated,
      history: upsertCommandHistoryRecord(history, updated),
      reason: "High-risk workflow cannot be closed as completed without a future explicit manual approval system.",
    };
  }
  const updated = {
    ...record,
    status: "completed",
    workflow_progress: (record.workflow_progress || []).map((step) =>
      step.status === "pending" ? { ...step, status: "completed", completed_at: new Date().toISOString() } : step,
    ),
    updated_at: new Date().toISOString(),
  };
  return { ok: true, record: updated, history: upsertCommandHistoryRecord(history, updated) };
}

export function buildResumeWorkflowLink(record = {}) {
  const draft = record.draft_reference || record.draft_references?.[0] || {};
  const cardLink = record.preview_cards?.flatMap((card) => card.related_links || [])?.[0]?.href;
  if (cardLink) return appendCommandParams(cardLink, record);
  if (draft.draft_id) {
    return appendCommandParams("/trade-os-prototype?view=documents", {
      ...record,
      draft_id: draft.draft_id,
      document_type: draft.draft_type,
      customer_id: draft.related_customer_id,
      inquiry_id: draft.related_inquiry_id,
      project_id: draft.related_project_id,
    });
  }
  return appendCommandParams("/trade-os-prototype?view=dashboard", record);
}

export function appendCommandParams(href = "", record = {}) {
  const [path, query = ""] = href.split("?");
  const params = new URLSearchParams(query);
  if (record.command_id) params.set("command_id", record.command_id);
  if (record.raw_command || record.command_summary) params.set("command_summary", record.raw_command || record.command_summary);
  ["draft_id", "document_type", "customer_id", "inquiry_id", "project_id", "lead_id", "task_id"].forEach((key) => {
    if (record[key] && !params.get(key)) params.set(key, record[key]);
  });
  return `${path}?${params.toString()}`;
}

export function isBlockedWorkflowAction(label = "") {
  return BLOCKED_ACTION_PATTERN.test(label);
}

function collectTargetLinks(record = {}) {
  const links = [];
  buildResumeHandoffLinks(record).forEach((link) => links.push(link));
  (record.preview_cards || []).forEach((card) => {
    (card.related_links || []).forEach((link) => {
      if (link?.href) links.push({ label: link.label || "Open target module", href: appendCommandParams(link.href, record) });
    });
  });
  if (record.resume_link) links.push({ label: "Resume target module", href: record.resume_link });
  return uniqueLinks(links);
}

function normalizeBusinessObjectRefs(refs = [], record = {}) {
  const seen = new Set();
  return refs
    .filter((ref) => ref && ref.type)
    .map((ref) => {
      const normalized = {
        type: String(ref.type || ""),
        id: ref.id ? String(ref.id) : "",
        label: ref.label ? String(ref.label) : defaultRefLabel(ref),
        href: ref.href || hrefForBusinessObjectRef(ref),
        status: ref.status || (ref.type === "document_draft" ? "created_draft" : "referenced"),
        manual_review_required: Boolean(ref.manual_review_required || ref.type === "document_draft" || /pi|quotation|official/i.test(String(ref.label || ref.document_type || ref.id || ""))),
      };
      if (record.command_id && normalized.href) normalized.href = appendCommandParams(normalized.href, record);
      return normalized;
    })
    .filter((ref) => {
      const key = `${ref.type}:${ref.id}:${ref.href}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function businessObjectRefsFromDrafts(drafts = []) {
  return drafts
    .filter((draft) => draft?.draft_id)
    .map((draft) => ({
      type: draft.draft_type === "follow_up_task_draft" ? "follow_up_task" : "document_draft",
      id: draft.draft_id,
      label: `${draft.draft_type || "Draft"} ${draft.draft_id}`,
      status: "created_draft",
      manual_review_required: draft.manual_review_required !== false,
      href: draft.draft_type === "follow_up_task_draft"
        ? `/trade-os-prototype?view=follow-ups&task_id=${encodeURIComponent(draft.draft_id)}`
        : `/trade-os-prototype?view=documents&draft_id=${encodeURIComponent(draft.draft_id)}${draft.draft_type ? `&document_type=${encodeURIComponent(draft.draft_type)}` : ""}`,
    }));
}

function normalizeDraftReference(draft = {}) {
  const reviewStatus = normalizeReviewStatus(draft.review_status || draft.status || ManualReviewStatus.DRAFT_ONLY);
  return sanitizeCommandHistoryValue({
    ...draft,
    status: reviewStatus,
    review_status: reviewStatus,
    manual_review_note: draft.manual_review_note || "",
    reviewed_at: draft.reviewed_at || null,
    reviewed_by: draft.reviewed_by || "",
    official_sent: false,
    customer_message_sent: false,
  });
}

function normalizeReviewStatus(status = "") {
  const value = String(status || "").toLowerCase();
  if (Object.values(ManualReviewStatus).includes(value)) return value;
  if (value === "pending_review") return ManualReviewStatus.REVIEW_PENDING;
  if (value === "created_draft" || value === "draft" || !value) return ManualReviewStatus.DRAFT_ONLY;
  return ManualReviewStatus.DRAFT_ONLY;
}

function isDocumentDraftReference(draft = {}) {
  const type = String(draft.draft_type || draft.type || "").toLowerCase();
  if (!type) return false;
  if (type === "follow_up_task_draft") return false;
  return /document|draft|pi|quotation|invoice|commercial|production|order|proforma/.test(type);
}

function buildDocumentDraftReviewRecord(record = {}, draft = {}) {
  const normalized = normalizeCommandHistoryRecord(record);
  const normalizedDraft = normalizeDraftReference(draft);
  const refs = getBusinessObjectRefs(normalized);
  const customerRef = refs.find((ref) => ref.type === "customer" || ref.type === "lead") || null;
  const projectRef = refs.find((ref) => ref.type === "project" || ref.type === "inquiry") || null;
  const manualReviewRequired = Boolean(normalized.approval_required || normalizedDraft.manual_review_required || normalized.blocked_actions?.length);
  return sanitizeCommandHistoryValue({
    draft_id: normalizedDraft.draft_id,
    draft_type: normalizedDraft.draft_type || "document_draft",
    command_id: normalized.command_id,
    original_command_summary: summarizeNote(normalized.raw_command),
    customer_reference: customerRef,
    project_reference: projectRef,
    related_business_objects: refs,
    review_status: normalizedDraft.review_status || normalized.review_status,
    manual_review_required: manualReviewRequired,
    manual_review_note_summary: summarizeNote(normalized.manual_review_note),
    checklist: buildDocumentDraftReviewChecklist(normalizedDraft, normalized),
    blocked_actions: normalized.blocked_actions || [],
    created_at: normalizedDraft.created_at || normalized.created_at,
    updated_at: normalized.updated_at,
    audit_detail_link: `/admin/command-center?command_id=${encodeURIComponent(normalized.command_id)}#internal-audit`,
    resume_workflow_link: `/admin/command-center?command_id=${encodeURIComponent(normalized.command_id)}`,
    safe_actions: [
      "mark_review_pending",
      "mark_reviewed",
      "add_internal_manual_review_note",
      "copy_draft_review_summary",
      "open_related_audit_detail",
      "return_to_command_center",
      "open_related_business_object",
    ],
    official_sent: false,
    customer_message_sent: false,
    official_document_issued: false,
  });
}

function isAllowedReviewTransition(current, next) {
  if (next === ManualReviewStatus.CANCELLED) return true;
  if (current === ManualReviewStatus.CANCELLED) return false;
  if (current === ManualReviewStatus.DRAFT_ONLY && next === ManualReviewStatus.REVIEW_PENDING) return true;
  if (current === ManualReviewStatus.DRAFT_ONLY && next === ManualReviewStatus.REVIEWED) return true;
  if (current === ManualReviewStatus.REVIEW_PENDING && next === ManualReviewStatus.REVIEWED) return true;
  if (current === next) return true;
  return false;
}

function appendSafeActionResult(record = {}, result = {}) {
  return [...(record.safe_action_results || []), result].slice(-20);
}

function firstRefId(record = {}, type = "") {
  return (record.business_object_refs || []).find((ref) => ref.type === type)?.id || "";
}

function businessObjectRefsFromPreviewCards(cards = []) {
  return cards.flatMap((card) =>
    (card.related_links || []).map((link) => refFromHref(link.href, link.label || card.title || card.card_type)).filter(Boolean),
  );
}

function refFromHref(href = "", label = "") {
  if (!href || !href.includes("/trade-os-prototype")) return null;
  const params = new URLSearchParams(href.split("?")[1] || "");
  if (params.get("customer_id")) return { type: "customer", id: params.get("customer_id"), label, href, status: "referenced", manual_review_required: false };
  if (params.get("lead_id")) return { type: "lead", id: params.get("lead_id"), label, href, status: "referenced", manual_review_required: false };
  if (params.get("inquiry_id")) return { type: "inquiry", id: params.get("inquiry_id"), label, href, status: "referenced", manual_review_required: false };
  if (params.get("project_id")) return { type: "project", id: params.get("project_id"), label, href, status: "referenced", manual_review_required: false };
  if (params.get("draft_id") || params.get("document_id")) {
    return { type: "document_draft", id: params.get("draft_id") || params.get("document_id"), label, href, status: "created_draft", manual_review_required: true };
  }
  if (params.get("task_id")) return { type: "follow_up_task", id: params.get("task_id"), label, href, status: "pending_review", manual_review_required: false };
  if (params.get("view") === "documents") return { type: "archive_path", id: params.get("document_type") || "documents", label: label || "Document Center", href, status: "referenced", manual_review_required: false };
  return null;
}

function hrefForBusinessObjectRef(ref = {}) {
  const id = encodeURIComponent(ref.id || "");
  if (ref.href) return ref.href;
  if (ref.type === "customer") return `/trade-os-prototype?view=customer-360${id ? `&customer_id=${id}` : ""}`;
  if (ref.type === "lead") return `/trade-os-prototype?view=lead-review${id ? `&lead_id=${id}` : ""}`;
  if (ref.type === "inquiry") return `/trade-os-prototype?view=inquiries${id ? `&inquiry_id=${id}` : ""}`;
  if (ref.type === "project") return `/trade-os-prototype?view=projects${id ? `&project_id=${id}` : ""}`;
  if (ref.type === "quotation") return `/trade-os-prototype?view=quotes${id ? `&quotation_id=${id}` : ""}`;
  if (ref.type === "document_draft") return `/trade-os-prototype?view=documents${id ? `&draft_id=${id}` : ""}`;
  if (ref.type === "follow_up_task") return `/trade-os-prototype?view=follow-ups${id ? `&task_id=${id}` : ""}`;
  if (ref.type === "archive_path") return `/trade-os-prototype?view=documents`;
  return "";
}

function defaultRefLabel(ref = {}) {
  const type = String(ref.type || "object").replaceAll("_", " ");
  return `${type}${ref.id ? ` ${ref.id}` : ""}`;
}

function uniqueLinks(links = []) {
  const seen = new Set();
  return links.filter((link) => {
    const key = `${link.label}:${link.href}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function uniqueStrings(items = []) {
  return [...new Set(items.filter(Boolean).map((item) => String(item)))];
}

function auditTimelineEvent(eventId = "", label = "", timestamp = "", status = "") {
  return {
    event_id: eventId || `event_${Date.now()}`,
    label: label || "内部事件",
    timestamp: timestamp || "时间未记录",
    status: status || "recorded",
    missing_timestamp: !timestamp,
    internal_only: true,
  };
}

function isSafeInternalHref(href = "") {
  const text = String(href || "");
  return text.startsWith("/trade-os-prototype") || text.startsWith("/admin/command-center");
}

function readCommandHistoryFromLocalStorage() {
  try {
    return globalThis?.localStorage ? JSON.parse(globalThis.localStorage.getItem(COMMAND_HISTORY_STORAGE_KEY) || "[]") : [];
  } catch {
    return [];
  }
}

function summarizeNote(note = "") {
  const value = String(note || "").trim();
  if (!value) return "";
  return value.length > 96 ? `${value.slice(0, 96)}...` : value;
}
