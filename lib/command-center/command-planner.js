import { parseCommand } from "./command-parser.js";
import { approvalSummary } from "./approval-rules.js";
import { mapCommandResultToCards } from "./result-card-mapper.js";

export const CommandStatus = Object.freeze({
  PLANNED: "planned",
  PREVIEWED: "previewed",
  CONFIRMED: "confirmed",
  EXECUTED: "executed",
  BLOCKED_REQUIRES_MANUAL_REVIEW: "blocked_requires_manual_review",
  RESUMED: "resumed",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
});

export const BlockedHighRiskActions = Object.freeze([
  "send customer message",
  "send official quotation",
  "send official PI",
  "confirm price",
  "confirm delivery time",
  "confirm payment terms",
  "confirm bank account",
  "promise compensation",
  "judge responsibility",
]);

export function createCommandPlan(input = {}) {
  const parsedCommand = input.parsedCommand || input.parsed_command || parseCommand(input.rawCommand || input.raw_command || "");
  const rawCommand = parsedCommand.raw_command || input.rawCommand || input.raw_command || "";
  const approval = approvalSummary({
    intent: parsedCommand.intent,
    raw_command: rawCommand,
    planned_actions: parsedCommand.planned_actions || [],
  });
  const previewCards = input.preview_cards || (input.toolResult || input.tool_result ? mapCommandResultToCards(parsedCommand, input.toolResult || input.tool_result) : []);
  const approvalRequired = approval.approval_required || Boolean(parsedCommand.approval_required);

  return {
    command_id: input.command_id || makeCommandId(),
    raw_command: rawCommand,
    intent: parsedCommand.intent,
    plan_steps: planStepsForIntent(parsedCommand.intent),
    preview_cards: previewCards,
    approval_required: approvalRequired,
    blocked_actions: approvalRequired ? [...BlockedHighRiskActions] : [],
    executable_actions: executableActionsForIntent(parsedCommand.intent, approvalRequired),
    missing_info: parsedCommand.required_missing_info || parsedCommand.missing_info || [],
    status: CommandStatus.PLANNED,
  };
}

export function transitionCommandStatus(currentStatus, nextStatus, plan = {}) {
  const allowed = {
    [CommandStatus.PLANNED]: [CommandStatus.PREVIEWED, CommandStatus.CANCELLED, CommandStatus.BLOCKED_REQUIRES_MANUAL_REVIEW],
    [CommandStatus.PREVIEWED]: [CommandStatus.CONFIRMED, CommandStatus.RESUMED, CommandStatus.CANCELLED, CommandStatus.BLOCKED_REQUIRES_MANUAL_REVIEW],
    [CommandStatus.RESUMED]: [CommandStatus.CONFIRMED, CommandStatus.COMPLETED, CommandStatus.CANCELLED, CommandStatus.BLOCKED_REQUIRES_MANUAL_REVIEW],
    [CommandStatus.CONFIRMED]: [CommandStatus.EXECUTED, CommandStatus.COMPLETED, CommandStatus.FAILED, CommandStatus.CANCELLED],
    [CommandStatus.EXECUTED]: [],
    [CommandStatus.COMPLETED]: [],
    [CommandStatus.BLOCKED_REQUIRES_MANUAL_REVIEW]: [],
    [CommandStatus.FAILED]: [],
    [CommandStatus.CANCELLED]: [],
  };

  if (nextStatus === CommandStatus.EXECUTED && plan.approval_required) {
    return {
      ok: false,
      status: currentStatus,
      reason: ["High-risk command cannot move to executed without manual review."],
    };
  }

  if (!(allowed[currentStatus] || []).includes(nextStatus)) {
    return {
      ok: false,
      status: currentStatus,
      reason: [`Invalid command status transition: ${currentStatus} -> ${nextStatus}`],
    };
  }

  return { ok: true, status: nextStatus, reason: [] };
}

function executableActionsForIntent(intent, approvalRequired) {
  if (intent === "unknown") return ["create command log"];
  if (approvalRequired) return ["create draft preview", "create command log"];
  return {
    customer_lookup: ["show customer info", "create command log"],
    latest_inquiry_analysis: ["analyze inquiry", "create command log"],
    daily_followup_list: ["list follow-ups", "create command log"],
    lead_to_customer: ["create customer preview", "create command log"],
    create_project_from_inquiry: ["create project draft", "create command log"],
    create_quotation_draft: ["create draft preview", "create command log"],
    create_document_draft: ["build document draft preview", "create command log"],
    build_archive_path: ["build archive path", "create command log"],
    create_followup_task: ["create follow-up task draft", "create command log"],
  }[intent] || ["create command log"];
}

function planStepsForIntent(intent) {
  const common = {
    customer_lookup: ["Parse customer reference", "Find matching customer or lead", "Show related inquiries and follow-ups"],
    latest_inquiry_analysis: ["Find latest inquiry", "Run rule-based inquiry analysis", "Show missing information and recommended next action"],
    daily_followup_list: ["Read follow-up tasks", "Separate overdue, today and upcoming items", "Show recommended next safe action"],
    lead_to_customer: ["Find lead reference", "Prepare customer record preview", "Keep conversion internal and logged"],
    create_project_from_inquiry: ["Find inquiry reference", "Prepare project draft", "Keep project in manual review stage"],
    create_quotation_draft: ["Find inquiry or project reference", "Prepare quotation draft data", "Mark manual review required", "Block official quotation sending"],
    create_document_draft: ["Find customer/project reference", "Prepare document draft data", "Check forbidden customer fields", "Calculate totals", "Build archive file name", "Mark manual review required"],
    build_archive_path: ["Parse customer alias, year and order number", "Build archive path", "Build export file name", "Build ZIP fallback path"],
    create_followup_task: ["Find customer or inquiry reference", "Prepare follow-up task draft", "Keep customer message sending blocked"],
    unknown: ["No supported rule matched", "Do not execute any business action", "Show supported command examples"],
  };
  return common[intent] || common.unknown;
}

function makeCommandId() {
  const id = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `cmd_${id}`;
}
