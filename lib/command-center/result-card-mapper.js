import {
  customer360Link,
  documentCenterLink,
  followUpWorkbenchLink,
  inquiryLink,
  leadReviewLink,
} from "./deep-links.js";

const ForbiddenDocumentTerms = [
  "internal_weight_factor",
  "internal cost",
  "internal_cost_note",
  "rmb cost",
  "profit",
  "margin",
  "uplift",
  "上浮",
  "bank account",
  "payment terms",
  "payment_term",
];

const SupportedExamples = [
  "今天有哪些客户要跟进？",
  "分析最新网站询盘。",
  "查一下巴拿马 Kevin 最近的项目和跟进任务。",
  "给 O CLUB HANDRAILS 生成中文生产单草稿。",
  "生成 Kevin 2026-4 的归档路径。",
];

export function mapCommandResultToCards(parsedCommand = {}, toolResult = {}, options = {}) {
  const cards = [];
  const linkContext = {
    command_id: options.command_id || toolResult.command_id || parsedCommand.command_id,
    command_summary: options.command_summary || toolResult.command_summary || parsedCommand.raw_command,
  };
  if (parsedCommand.approval_required || toolResult.approval_required) {
    cards.push(createApprovalRequiredCard(parsedCommand, toolResult));
  }

  if (parsedCommand.intent === "unknown" || toolResult.tool_name === "unknown") {
    cards.push(createUnknownCommandCard(parsedCommand, toolResult));
    return cards;
  }

  if (toolResult.tool_name === "findCustomer") cards.push(createCustomerCard(toolResult, linkContext));
  if (toolResult.tool_name === "analyzeLatestInquiry") cards.push(createInquiryAnalysisCard(toolResult, linkContext));
  if (toolResult.tool_name === "listTodayFollowUps") cards.push(...createFollowupCards(toolResult, linkContext));
  if (toolResult.tool_name === "createDocumentDraft" || toolResult.tool_name === "createQuotationDraft") cards.push(createDocumentDraftCard(parsedCommand, toolResult, linkContext));
  if (toolResult.tool_name === "buildArchivePath") cards.push(createArchivePathCard(parsedCommand, toolResult, linkContext));

  if (!cards.length) {
    cards.push({
      card_type: "unknown_command_card",
      title: "No business card available yet",
      subtitle: toolResult.tool_name || parsedCommand.intent || "unknown",
      status: toolResult.ok ? "success" : "unknown",
      summary: toolResult.result_summary || "The command ran, but no specific card mapper exists yet.",
      fields: [],
      missing_info: parsedCommand.required_missing_info || [],
      warnings: toolResult.warnings || [],
      approval_required: Boolean(parsedCommand.approval_required || toolResult.approval_required),
      primary_action: null,
      secondary_actions: [],
      related_links: [],
      safe_actions: [],
      blocked_actions: [],
      next_actions: ["Review the raw debug result below."],
    });
  }

  return cards.map(sanitizeCard);
}

export function createCustomerCard(toolResult = {}, linkContext = {}) {
  const customer = toolResult.data?.customer || {};
  const inquiries = toolResult.data?.inquiries || [];
  const followUps = toolResult.data?.follow_up_tasks || [];
  return {
    card_type: "customer_card",
    title: customer.name || customer.company || "Customer found",
    subtitle: customer.country || customer.type || "Customer / lead record",
    status: toolResult.ok ? "success" : "blocked",
    summary: toolResult.result_summary || "Customer lookup result.",
    fields: compactFields([
      ["Company", customer.company || customer.name],
      ["Country", customer.country],
      ["Email", customer.email],
      ["WhatsApp", customer.whatsapp || customer.phone],
      ["Related inquiries", inquiries.length],
      ["Related follow-ups", followUps.length],
    ]),
    missing_info: [],
    warnings: toolResult.warnings || [],
    approval_required: false,
    primary_action: customer.id ? { label: "Open Customer 360", href: customer360Link(customer.id, linkContext), type: "internal" } : null,
    secondary_actions: [],
    related_links: [
      ...(customer.id ? [{ label: "Open Customer 360", href: customer360Link(customer.id, linkContext), type: "internal" }] : [{ label: "Open Customer 360", href: buildFallbackCustomerLink(linkContext), type: "internal" }]),
      ...inquiries.slice(0, 3).map((inquiry) => ({ label: `Open Inquiry ${inquiry.title || inquiry.id}`, href: inquiryLink(inquiry.id, linkContext), type: "internal" })),
      ...followUps.slice(0, 3).map((task) => ({ label: `Open Follow-up ${task.title || task.id}`, href: followUpWorkbenchLink({ task_id: task.id, customer_id: task.customer_id, inquiry_id: task.inquiry_id, ...linkContext }), type: "internal" })),
    ],
    safe_actions: [{ label: "Copy Customer Summary", action: "copy_summary" }],
    blocked_actions: [],
    next_actions: ["Open Customer 360.", "Review related inquiries and pending follow-ups."],
  };
}

export function createInquiryAnalysisCard(toolResult = {}, linkContext = {}) {
  const inquiry = toolResult.data?.inquiry || {};
  const analysis = toolResult.data?.analysis || {};
  const missingInfo = analysis.missing_info || inquiry.missing_info || [];
  return {
    card_type: "inquiry_analysis_card",
    title: inquiry.title || inquiry.inquiry_title || "Latest inquiry",
    subtitle: `${inquiry.business_line || "business line unknown"} · ${inquiry.source || "source unknown"}`,
    status: missingInfo.length ? "needs_review" : "success",
    summary: analysis.ai_summary || toolResult.result_summary || "Rule-based inquiry analysis completed.",
    fields: compactFields([
      ["Business line", inquiry.business_line],
      ["Source", inquiry.source],
      ["Status", inquiry.status],
      ["Lead/customer status", inquiry.customer_id ? "customer linked" : inquiry.lead_id ? "lead linked" : "not linked"],
      ["Score", inquiry.score],
    ]),
    missing_info: missingInfo,
    warnings: toolResult.warnings || [],
    approval_required: false,
    primary_action: inquiry.id ? { label: "Open Inquiry Detail", href: inquiryLink(inquiry.id, linkContext), type: "internal" } : null,
    secondary_actions: [],
    related_links: [
      ...(inquiry.id ? [{ label: "Open Inquiry Detail", href: inquiryLink(inquiry.id, linkContext), type: "internal" }] : [{ label: "Open Inquiry Pool", href: inquiryLink("", linkContext), type: "internal" }]),
      ...(inquiry.lead_id ? [{ label: "Open Lead Review", href: leadReviewLink(inquiry.lead_id, linkContext), type: "internal" }] : []),
    ],
    safe_actions: inquiry.lead_id ? [{ label: "Convert to Customer", action: "convert_lead_to_customer", requires_manual_review: false }] : [],
    blocked_actions: [],
    next_actions: [analysis.recommended_next_action || inquiry.recommended_next_action || "Request missing information before quotation."],
  };
}

export function createFollowupCards(toolResult = {}, linkContext = {}) {
  const tasks = toolResult.data?.tasks || [];
  if (!tasks.length) {
    return [
      {
        card_type: "followup_card",
        title: "No follow-ups due",
        subtitle: "Daily follow-up list",
        status: "success",
        summary: "No pending follow-up tasks were found for today.",
        fields: [],
        missing_info: [],
        warnings: [],
        approval_required: false,
        primary_action: { label: "Open Follow-up Workbench", href: followUpWorkbenchLink({ filter: "today", ...linkContext }), type: "internal" },
        secondary_actions: [],
        related_links: [{ label: "Open Follow-up Workbench", href: followUpWorkbenchLink({ filter: "today", ...linkContext }), type: "internal" }],
        safe_actions: [],
        blocked_actions: ["Send customer message"],
        next_actions: ["Check high-score inquiries or leads needing review."],
      },
    ];
  }

  return tasks.slice(0, 8).map((task) => {
    const dueDate = String(task.due_date || task.next_follow_up_at || "").slice(0, 10);
    return {
      card_type: "followup_card",
      title: task.title || task.task_type || "Follow-up task",
      subtitle: task.customer_name || task.lead_name || task.inquiry_title || task.inquiry_id || "Related business object",
      status: dueStatus(dueDate),
      summary: task.description || task.next_action || "Follow up manually after reviewing customer history.",
      fields: compactFields([
        ["Related customer/lead/inquiry", task.customer_id || task.lead_id || task.inquiry_id],
        ["Due date", dueDate],
        ["Task status", task.status],
        ["Message draft available", task.reply_draft_en || task.reply_draft_zh ? "yes" : "no"],
      ]),
      missing_info: [],
      warnings: ["Manual review required before sending any customer message."],
      approval_required: false,
      primary_action: { label: "Open Follow-up Workbench", href: followUpWorkbenchLink({ task_id: task.id, filter: dueStatus(dueDate) === "blocked" ? "overdue" : "today", ...linkContext }), type: "internal" },
      secondary_actions: [],
      related_links: [
        { label: "Open Follow-up Workbench", href: followUpWorkbenchLink({ task_id: task.id, filter: dueStatus(dueDate) === "blocked" ? "overdue" : "today", ...linkContext }), type: "internal" },
        ...(task.customer_id ? [{ label: "Open Customer 360", href: customer360Link(task.customer_id, linkContext), type: "internal" }] : []),
        ...(task.inquiry_id ? [{ label: "Open Inquiry", href: inquiryLink(task.inquiry_id, linkContext), type: "internal" }] : []),
      ],
      safe_actions: [{ label: "Mark as Done (placeholder)", action: "mark_done_placeholder" }],
      blocked_actions: ["Send customer message"],
      next_actions: ["Review communication history.", "Draft a reply, then approve manually before sending."],
    };
  });
}

export function createDocumentDraftCard(parsedCommand = {}, toolResult = {}, linkContext = {}) {
  const document = toolResult.data?.document || toolResult.data?.quotation || {};
  const archive = toolResult.data?.archive || {};
  const approval = toolResult.data?.approval || {};
  return {
    card_type: "document_draft_card",
    title: document.document_no || document.quote_no || "Document draft",
    subtitle: document.document_type || parsedCommand.entities?.document_hint || toolResult.tool_name,
    status: "needs_review",
    summary: toolResult.result_summary || "Draft created for manual review only.",
    fields: compactFields([
      ["Document type", document.document_type || parsedCommand.entities?.document_hint],
      ["Customer/project", document.customer?.name || document.project_name || document.project_code || toolResult.data?.source?.title],
      ["Seller", document.seller?.company_name],
      ["Draft status", document.status || toolResult.status],
      ["Forbidden field check", "passed for card display"],
      ["Archive file", archive.recommended_pdf_file_name || archive.pdf_file_name],
    ]),
    missing_info: parsedCommand.required_missing_info || [],
    warnings: [...(toolResult.warnings || []), ...(approval.reasons || [])],
    approval_required: true,
    manual_review_required: true,
    primary_action: { label: "Open in Document Center", href: documentCenterLink({ draft_id: document.id, document_id: document.id, document_type: document.document_type || parsedCommand.entities?.document_hint, customer_id: document.customer_id, project_id: document.project_id, ...linkContext }), type: "internal" },
    secondary_actions: [{ label: "Document Center draft area - mock route", href: documentCenterLink({ document_type: document.document_type || parsedCommand.entities?.document_hint, ...linkContext }), type: "internal" }],
    related_links: [
      { label: "Open Document Center", href: documentCenterLink({ draft_id: document.id, document_id: document.id, document_type: document.document_type || parsedCommand.entities?.document_hint, customer_id: document.customer_id, project_id: document.project_id, ...linkContext }), type: "internal" },
      ...(document.customer_id ? [{ label: "Open Customer 360", href: customer360Link(document.customer_id, linkContext), type: "internal" }] : []),
    ],
    safe_actions: [
      { label: "Create Follow-up Task", action: "create_followup_task" },
      { label: "Copy Draft Summary", action: "copy_summary" },
    ],
    blocked_actions: ["Send official PI", "Send official quotation", "Confirm protected commercial terms", "Export official file automatically"],
    next_actions: ["Review all commercial details manually.", "Export or send only after human approval."],
  };
}

export function createArchivePathCard(parsedCommand = {}, toolResult = {}, linkContext = {}) {
  const data = toolResult.data || {};
  const entities = parsedCommand.entities || {};
  return {
    card_type: "archive_path_card",
    title: "Archive path preview",
    subtitle: entities.customer_alias || "Customer archive",
    status: toolResult.ok ? "success" : "blocked",
    summary: toolResult.result_summary || "Archive path generated.",
    fields: compactFields([
      ["Customer alias", entities.customer_alias],
      ["Archive year/order", [entities.archive_year, entities.archive_order_no].filter(Boolean).join("-")],
      ["Project", entities.project || "Project"],
      ["Document type", entities.document_hint || "Document"],
      ["Archive path", data.archive_path],
      ["File name", data.file_name],
      ["Next version", "v1"],
      ["ZIP fallback path", data.zip_path],
    ]),
    missing_info: parsedCommand.required_missing_info || [],
    warnings: toolResult.warnings || [],
    approval_required: false,
    primary_action: { label: "Open Document Center", href: documentCenterLink({ document_type: entities.document_hint || "Document", ...linkContext }), type: "internal" },
    secondary_actions: [],
    related_links: [{ label: "Open Document Center", href: documentCenterLink({ document_type: entities.document_hint || "Document", ...linkContext }), type: "internal" }],
    safe_actions: [{ label: "Copy Archive Path", action: "copy_archive_path" }],
    blocked_actions: [],
    next_actions: ["Use this path when exporting manually.", "Keep original customer files in the same order folder."],
  };
}

export function createApprovalRequiredCard(parsedCommand = {}, toolResult = {}) {
  const reasons = parsedCommand.approval_reasons || toolResult.data?.approval?.reasons || [];
  return {
    card_type: "approval_required_card",
    title: "Manual Review Required",
    subtitle: parsedCommand.risk_level || "high",
    status: "needs_review",
    summary: "This command may affect commercial commitments or customer communication.",
    fields: compactFields([
      ["Intent", parsedCommand.intent],
      ["Tool", toolResult.tool_name],
      ["Risk level", parsedCommand.risk_level || "high"],
    ]),
    missing_info: [],
    warnings: reasons.length ? reasons : ["Official quotation, PI, payment terms, bank account, delivery time, customer messages, compensation and responsibility judgment require manual approval."],
    approval_required: true,
    manual_review_required: true,
    primary_action: null,
    secondary_actions: [],
    related_links: [],
    safe_actions: [{ label: "Create Draft Only", action: "create_draft_only" }],
    blocked_actions: ["Send official quotation", "Send official PI", "Confirm payment terms", "Confirm bank account", "Confirm delivery time", "Send customer message", "Promise compensation", "Judge responsibility"],
    next_actions: ["Review draft data.", "Approve manually only if the commercial information is correct."],
  };
}

export function createUnknownCommandCard(parsedCommand = {}, toolResult = {}) {
  return {
    card_type: "unknown_command_card",
    title: "Command not understood",
    subtitle: parsedCommand.raw_command || "Unknown command",
    status: "unknown",
    summary: "No action was executed and no data was changed.",
    fields: [],
    missing_info: [],
    warnings: toolResult.warnings || ["Try one of the supported examples."],
    approval_required: false,
    primary_action: null,
    secondary_actions: [],
    related_links: [],
    safe_actions: [],
    blocked_actions: [],
    next_actions: SupportedExamples,
  };
}

function dueStatus(dueDate) {
  if (!dueDate) return "needs_review";
  const today = new Date().toISOString().slice(0, 10);
  if (dueDate < today) return "blocked";
  if (dueDate === today) return "needs_review";
  return "draft";
}

function compactFields(entries) {
  return entries
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([label, value]) => ({ label, value: String(value) }));
}

function buildFallbackCustomerLink(linkContext = {}) {
  return customer360Link("", linkContext);
}

function sanitizeCard(card) {
  const sanitized = JSON.parse(JSON.stringify(card));
  const text = JSON.stringify(sanitized).toLowerCase();
  const forbidden = ForbiddenDocumentTerms.find((term) => text.includes(term.toLowerCase()));
  if (forbidden && sanitized.card_type === "document_draft_card") {
    throw new Error(`Forbidden document draft card field leaked: ${forbidden}`);
  }
  return sanitized;
}
