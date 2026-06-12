import { executeCommandTool } from "./tool-registry.js";
import { mapCommandResultToCards } from "./result-card-mapper.js";
import { BlockedHighRiskActions, CommandStatus, transitionCommandStatus } from "./command-planner.js";
import { createWorkflowProgress } from "./command-history.js";

export const SafeExecutionModes = Object.freeze({
  PREVIEW: "preview",
  DRAFT_PREVIEW: "draft_preview",
  EXECUTE: "execute",
});

export function executeCommandPlan(db, plan, parsedCommand, options = {}) {
  const mode = options.mode || SafeExecutionModes.PREVIEW;

  if (!plan || !parsedCommand) {
    return blockedResult("Missing command plan or parsed command.", ["Command plan and parsed command are required."]);
  }

  if (plan.approval_required && mode === SafeExecutionModes.EXECUTE) {
    return blockedResult("Manual Review Required before final execution.", [
      "High-risk command cannot be executed automatically.",
      ...BlockedHighRiskActions,
    ], plan);
  }

  if (parsedCommand.intent === "unknown") {
    return {
      ok: false,
      status: "unknown",
      tool_name: "unknown",
      result_summary: "Unknown command. No action was executed and no data was changed.",
      data: {},
      warnings: ["No tool executed."],
      approval_required: false,
      cards: mapCommandResultToCards(parsedCommand, { tool_name: "unknown", warnings: ["No tool executed."] }, { command_id: plan.command_id, command_summary: plan.raw_command }),
      command_log: createCommandLogRecord(plan, CommandStatus.BLOCKED_REQUIRES_MANUAL_REVIEW, "Unknown command blocked safely.", null, []),
    };
  }

  const transition = transitionForMode(plan.status || CommandStatus.PLANNED, mode, plan);
  if (!transition.ok) return blockedResult("Command status transition blocked.", transition.reason, plan);

  const toolResult = executeCommandTool(db, parsedCommand);
  const cards = mapCommandResultToCards(parsedCommand, toolResult, {
    command_id: plan.command_id,
    command_summary: plan.raw_command,
  });
  const draftReference = createDraftReference(parsedCommand, toolResult);
  return {
    ...toolResult,
    status: transition.status,
    cards,
    draft_reference: draftReference,
    command_log: createCommandLogRecord(plan, transition.status, toolResult.result_summary || toolResult.summary || "Command processed.", draftReference, cards),
  };
}

export function createCommandLogRecord(plan, status, resultSummary, draftReference = null, cards = []) {
  const record = {
    command_id: plan.command_id,
    raw_command: plan.raw_command,
    parsed_intent: plan.intent,
    planned_actions: plan.plan_steps,
    preview_cards: cards.map((card) => ({
      card_type: card.card_type,
      title: card.title,
      status: card.status,
      related_links: card.related_links || [],
    })),
    approval_required: Boolean(plan.approval_required),
    blocked_actions: plan.blocked_actions || [],
    workflow_progress: createWorkflowProgress(plan.plan_steps || [], plan.blocked_actions || []),
    status,
    result_summary: resultSummary,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  if (draftReference) {
    record.draft_reference = draftReference;
    record.draft_references = [draftReference];
  }
  return record;
}

function transitionForMode(currentStatus, mode, plan) {
  if (mode === SafeExecutionModes.PREVIEW || mode === SafeExecutionModes.DRAFT_PREVIEW) {
    return transitionCommandStatus(currentStatus, CommandStatus.PREVIEWED, plan);
  }
  if (mode === SafeExecutionModes.EXECUTE) {
    const confirmed = currentStatus === CommandStatus.CONFIRMED ? currentStatus : CommandStatus.CONFIRMED;
    return transitionCommandStatus(confirmed, CommandStatus.EXECUTED, plan);
  }
  return { ok: false, status: currentStatus, reason: [`Unsupported execution mode: ${mode}`] };
}

function createDraftReference(parsedCommand, toolResult) {
  if (!["create_document_draft", "create_quotation_draft", "create_followup_task"].includes(parsedCommand.intent)) return null;
  const document = toolResult.data?.document || null;
  const quotation = toolResult.data?.quotation || null;
  const task = toolResult.data?.task || null;
  const source = toolResult.data?.source || toolResult.data?.inquiry || null;
  return {
    draft_id: document?.id || quotation?.id || task?.id || `draft_${Date.now()}`,
    draft_type: document?.document_type || (quotation ? "quotation_draft" : task ? "follow_up_task_draft" : parsedCommand.intent),
    related_customer_id: document?.customer_id || quotation?.customer_id || task?.customer_id || source?.customer_id || "",
    related_inquiry_id: quotation?.inquiry_id || task?.inquiry_id || source?.id || "",
    related_project_id: quotation?.project_id || document?.project_id || source?.project_id || "",
    created_at: new Date().toISOString(),
    status: "draft_only",
    review_status: "draft_only",
    manual_review_note: "",
    reviewed_at: null,
    reviewed_by: "",
    manual_review_required: true,
    official_sent: false,
    customer_message_sent: false,
  };
}

function blockedResult(summary, reasons = [], plan = {}) {
  return {
    ok: false,
    status: CommandStatus.BLOCKED_REQUIRES_MANUAL_REVIEW,
    tool_name: "approval_gate",
    result_summary: summary,
    data: {},
    warnings: reasons,
    approval_required: true,
    reason: reasons,
    cards: [
      {
        card_type: "approval_required_card",
        title: "Manual Review Required",
        subtitle: "blocked",
        status: "blocked",
        summary,
        fields: [],
        missing_info: [],
        warnings: reasons,
        approval_required: true,
        next_actions: ["Review manually before any customer-facing or commercial action."],
      },
    ],
    command_log: plan.command_id ? createCommandLogRecord(plan, CommandStatus.BLOCKED_REQUIRES_MANUAL_REVIEW, summary) : null,
  };
}
