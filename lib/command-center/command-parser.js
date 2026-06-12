import { approvalSummary } from "./approval-rules.js";

const IntentLabels = {
  customer_lookup: "Customer lookup",
  latest_inquiry_analysis: "Latest inquiry analysis",
  daily_followup_list: "Daily follow-up list",
  lead_to_customer: "Convert lead to customer",
  create_project_from_inquiry: "Create project from inquiry",
  create_quotation_draft: "Create quotation draft",
  create_document_draft: "Create document draft",
  build_archive_path: "Build archive path",
  create_followup_task: "Create follow-up task",
  unknown: "Unknown command",
};

export function parseCommand(rawCommand = "") {
  const command = String(rawCommand || "").trim();
  const normalized = command.toLowerCase();
  const entities = extractEntities(command);
  let intent = "unknown";
  let plannedActions = ["Review command and ask for more information."];
  let missingInfo = [];

  if (matchesAny(normalized, ["跟进", "follow up", "follow-up", "today", "今天"])) {
    intent = "daily_followup_list";
    plannedActions = ["Read pending follow-up tasks.", "Group overdue and due-today tasks.", "Show customer and inquiry context."];
  }

  if (matchesAny(normalized, ["最新网站询盘", "最新询盘", "latest inquiry", "website inquiry", "分析最新"])) {
    intent = "latest_inquiry_analysis";
    plannedActions = ["Find latest website inquiry.", "Run rule-based inquiry summary.", "List missing information and next action."];
  }

  if (matchesAny(normalized, ["查一下", "查找", "lookup", "find customer", "最近的项目"])) {
    intent = "customer_lookup";
    plannedActions = ["Find matching customer by name or alias.", "Show related inquiries, projects and follow-up tasks."];
    if (!entities.customer_alias) missingInfo.push("customer_alias");
  }

  if (matchesAny(normalized, ["lead 转", "lead转", "convert lead", "转成 customer", "转成customer"])) {
    intent = "lead_to_customer";
    plannedActions = ["Find target lead.", "Preview customer record.", "Convert lead to customer after admin approval."];
    if (!entities.lead_id && !entities.customer_alias) missingInfo.push("lead_id_or_alias");
  }

  if (matchesAny(normalized, ["创建项目", "create project", "根据这个询盘创建项目", "inquiry 创建 project"])) {
    intent = "create_project_from_inquiry";
    plannedActions = ["Find target inquiry.", "Create mock project from inquiry.", "Keep project in manual review stage."];
    if (!entities.inquiry_id && !entities.project) missingInfo.push("inquiry_id_or_project_reference");
  }

  if (matchesAny(normalized, ["报价草稿", "quotation draft", "create quotation", "生成报价"])) {
    intent = "create_quotation_draft";
    plannedActions = ["Find target inquiry or project.", "Create quotation draft only.", "Mark manual review required before official quotation."];
    if (!entities.inquiry_id && !entities.project && !entities.customer_alias) missingInfo.push("inquiry_or_project_reference");
  }

  if (matchesAny(normalized, ["pi 草稿", "pi draft", "proforma invoice", "生产单", "document draft", "单据草稿", "生成 pi", "生成中文生产单"])) {
    intent = "create_document_draft";
    plannedActions = ["Find target document or project.", "Create document draft only.", "Require manual review before export or sending."];
    if (!entities.project && !entities.customer_alias) missingInfo.push("project_or_customer_reference");
  }

  if (matchesAny(normalized, ["归档路径", "archive path", "archive folder", "生成归档"])) {
    intent = "build_archive_path";
    plannedActions = ["Parse customer alias, year and order number.", "Build archive path preview.", "Build ZIP fallback path preview."];
    if (!entities.customer_alias) missingInfo.push("customer_alias");
    if (!entities.archive_year) missingInfo.push("archive_year");
    if (!entities.archive_order_no) missingInfo.push("archive_order_no");
  }

  if (matchesAny(normalized, ["创建跟进", "新建跟进", "create follow", "create follow-up task", "create followup task"])) {
    intent = "create_followup_task";
    plannedActions = ["Find related inquiry or customer.", "Create manual follow-up task in mock CRM.", "Keep task pending for admin review."];
    if (!entities.customer_alias && !entities.inquiry_id) missingInfo.push("customer_or_inquiry_reference");
  }

  const approval = approvalSummary({ intent, raw_command: command, planned_actions: plannedActions });
  const requiredMissingInfo = [...new Set(missingInfo)];
  return {
    raw_command: command,
    intent,
    intent_label: IntentLabels[intent],
    confidence: intent === "unknown" ? 0.2 : 0.78,
    entities,
    planned_actions: plannedActions,
    required_missing_info: requiredMissingInfo,
    missing_info: requiredMissingInfo,
    approval_required: approval.approval_required,
    risk_level: approval.risk_level,
    approval_reasons: approval.reasons,
    approval_label: approval.label,
    reason: buildReason(intent, command, approval),
    safety_notes: approval.safety_notes,
  };
}

function matchesAny(value, terms) {
  return terms.some((term) => value.includes(term.toLowerCase()));
}

function extractEntities(command) {
  const yearOrder = command.match(/\b(20\d{2})[-\s年]+(\d{1,3})\b/);
  const projectMatch = command.match(/\b(CL5437|O CLUB HANDRAILS|OCLUB(?:-HANDRAILS)?|Celeste4)\b/i);
  const leadMatch = command.match(/\b(lead_[a-z0-9_-]+)\b/i);
  const inquiryMatch = command.match(/\b(inq_[a-z0-9_-]+)\b/i);
  const customerAlias = extractCustomerAlias(command);

  return {
    customer_alias: customerAlias,
    project: projectMatch?.[1] || "",
    lead_id: leadMatch?.[1] || "",
    inquiry_id: inquiryMatch?.[1] || "",
    archive_year: yearOrder?.[1] || "",
    archive_order_no: yearOrder?.[2] || "",
    document_hint: extractDocumentHint(command),
  };
}

function extractCustomerAlias(command) {
  if (/kevin/i.test(command) || /巴拿马/.test(command)) return "Kevin";
  const match = command.match(/(?:客户|customer|for|给)\s*([A-Za-z0-9\u4e00-\u9fa5_-]{2,40})/i);
  return match?.[1] || "";
}

function extractDocumentHint(command) {
  if (/生产单|production order/i.test(command)) return "production_order";
  if (/\bpi\b|proforma invoice/i.test(command)) return "proforma_invoice";
  if (/quotation|报价/i.test(command)) return "quotation";
  return "";
}

function buildReason(intent, command, approval) {
  if (intent === "unknown") return "No supported rule matched this command. The system will not take action.";
  if (approval.approval_required) return `Rule-based parser matched ${intent}. Manual Review Required because this command may affect commercial commitments.`;
  return `Rule-based parser matched ${intent} from command: ${command}`;
}
