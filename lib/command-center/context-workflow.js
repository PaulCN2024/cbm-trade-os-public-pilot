import { findCommandHistoryRecord, workflowProgressSummary } from "./command-history.js";

const COMMAND_CENTER_URL = "/admin/command-center";
const TRADE_OS_URL = "/trade-os-prototype";

function link(label, href) {
  return { label, href };
}

function commandCenterUrl(context = {}) {
  const params = new URLSearchParams();
  if (context.command_id) params.set("command_id", context.command_id);
  return params.toString() ? `${COMMAND_CENTER_URL}?${params.toString()}` : COMMAND_CENTER_URL;
}

function tradeOsLink(view, params = {}) {
  const search = new URLSearchParams();
  search.set("view", view);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  });
  return `${TRADE_OS_URL}?${search.toString()}`;
}

function baseWorkflow(context, overrides = {}) {
  const historyRecord = context.command_history_record || findCommandHistoryRecord(context.command_history || [], context.command_id);
  const historyWarning = context.command_id && !historyRecord ? [`Command history record not found for command_id=${context.command_id}.`] : [];
  const returnUrl = commandCenterUrl(context);
  return {
    title: overrides.title || "Command Center workflow",
    command_history_record: historyRecord || null,
    command_summary: historyRecord?.raw_command || context.command_summary || context.command_id || "Opened from Command Center deep link.",
    command_status: historyRecord?.status || "",
    parsed_intent: historyRecord?.parsed_intent || "",
    workflow_progress: historyRecord?.workflow_progress || [],
    workflow_progress_summary: historyRecord ? workflowProgressSummary(historyRecord) : "",
    draft_references: historyRecord?.draft_references || (historyRecord?.draft_reference ? [historyRecord.draft_reference] : []),
    target_summary: overrides.target_summary || "Review the target object before taking action.",
    suggested_steps: overrides.suggested_steps || ["Review context.", "Choose the next safe manual action."],
    safe_actions: uniqueStrings(overrides.safe_actions || ["Copy context summary", "Return to Command Center"]),
    blocked_actions: uniqueStrings(overrides.blocked_actions || [
      "Send customer message automatically",
      "Send official quotation automatically",
      "Send official PI automatically",
    ]),
    related_links: uniqueLinks(overrides.related_links || [link("Return to Command Center", returnUrl)]),
    warnings: uniqueStrings([...(context.warnings || []), ...historyWarning, ...(overrides.warnings || [])]),
    return_to_command_center_url: returnUrl,
  };
}

function documentWorkflow(context) {
  return baseWorkflow(context, {
    title: "Document Center workflow",
    target_summary: [
      context.draft_id ? `draft_id=${context.draft_id}` : "",
      context.document_id ? `document_id=${context.document_id}` : "",
      context.document_type ? `document_type=${context.document_type}` : "",
      context.customer_id ? `customer_id=${context.customer_id}` : "",
      context.project_id ? `project_id=${context.project_id}` : "",
    ]
      .filter(Boolean)
      .join(" · ") || "Document draft context.",
    suggested_steps: [
      "Review customer/seller information.",
      "Check item calculation and totals.",
      "Verify forbidden fields are hidden.",
      "Review payment/bank terms manually.",
      "Create draft export only.",
    ],
    safe_actions: [
      "Copy context summary",
      "Open related customer",
      "Create follow-up task draft",
      "Generate document draft checklist",
      "Mark draft as review_pending",
      "Add internal review note",
      "Return to Command Center",
    ],
    blocked_actions: [
      "Send official PI",
      "Confirm bank account",
      "Confirm payment terms",
      "Confirm price",
    ],
    related_links: [
      context.customer_id ? link("Open related customer", tradeOsLink("customer-360", { customer_id: context.customer_id })) : null,
      context.project_id ? link("Open related project", tradeOsLink("projects", { project_id: context.project_id })) : null,
      link("Return to Command Center", commandCenterUrl(context)),
    ].filter(Boolean),
  });
}

function customerWorkflow(context) {
  return baseWorkflow(context, {
    title: "Customer 360 workflow",
    target_summary: context.customer_id ? `customer_id=${context.customer_id}` : "Customer context.",
    suggested_steps: [
      "Review customer basic information.",
      "Review related inquiries.",
      "Review pending follow-ups.",
      "Decide next manual action.",
    ],
    safe_actions: [
      "Copy customer context",
      "Open related inquiries",
      "Create follow-up task draft",
      "Add internal review note",
      "Return to Command Center",
    ],
    blocked_actions: ["Send customer message automatically", "Confirm deal terms"],
    related_links: [
      context.customer_id ? link("Open related inquiries", tradeOsLink("inquiries", { customer_id: context.customer_id })) : null,
      link("Return to Command Center", commandCenterUrl(context)),
    ].filter(Boolean),
  });
}

function inquiryWorkflow(context) {
  return baseWorkflow(context, {
    title: "Inquiry workflow",
    target_summary: context.inquiry_id ? `inquiry_id=${context.inquiry_id}` : "Inquiry context.",
    suggested_steps: [
      "Review inquiry summary.",
      "Check missing information.",
      "Confirm business line.",
      "Decide whether to convert to project/customer.",
    ],
    safe_actions: [
      "Copy inquiry summary",
      "Open lead review",
      "Create follow-up task draft",
      "Add internal review note",
      "Return to Command Center",
    ],
    blocked_actions: ["Send quotation automatically", "Confirm price or delivery time"],
    related_links: [
      context.lead_id ? link("Open lead review", tradeOsLink("lead-review", { lead_id: context.lead_id })) : null,
      link("Return to Command Center", commandCenterUrl(context)),
    ].filter(Boolean),
  });
}

function leadWorkflow(context) {
  return baseWorkflow(context, {
    title: "Lead Review workflow",
    target_summary: context.lead_id ? `lead_id=${context.lead_id}` : "Lead review context.",
    suggested_steps: [
      "Review lead source.",
      "Check contact information.",
      "Check duplicate warning.",
      "Qualify or disqualify manually.",
      "Convert to customer only after manual review.",
    ],
    safe_actions: [
      "Copy lead summary",
      "Open related inquiry",
      "Create follow-up task draft",
      "Add internal review note",
      "Return to Command Center",
    ],
    blocked_actions: ["Auto-convert without review", "Send messages automatically"],
    related_links: [
      context.inquiry_id ? link("Open related inquiry", tradeOsLink("inquiries", { inquiry_id: context.inquiry_id })) : null,
      link("Return to Command Center", commandCenterUrl(context)),
    ].filter(Boolean),
  });
}

function followUpWorkflow(context) {
  return baseWorkflow(context, {
    title: "Follow-up Workbench workflow",
    target_summary: [
      context.task_id ? `task_id=${context.task_id}` : "",
      context.filter ? `filter=${context.filter}` : "",
    ]
      .filter(Boolean)
      .join(" · ") || "Follow-up context.",
    suggested_steps: [
      "Review task due date.",
      "Review related customer/inquiry.",
      "Prepare reply draft manually.",
      "Mark done only after actual follow-up.",
    ],
    safe_actions: [
      "Copy follow-up summary",
      "Open related customer",
      "Open related inquiry",
      "Return to Command Center",
    ],
    blocked_actions: ["Send message automatically", "Mark done without user action"],
    related_links: [
      context.customer_id ? link("Open related customer", tradeOsLink("customer-360", { customer_id: context.customer_id })) : null,
      context.inquiry_id ? link("Open related inquiry", tradeOsLink("inquiries", { inquiry_id: context.inquiry_id })) : null,
      link("Return to Command Center", commandCenterUrl(context)),
    ].filter(Boolean),
  });
}

export function buildContextWorkflow(context = {}) {
  const view = context.view || "";
  if (view === "documents") return documentWorkflow(context);
  if (view === "customers" || view === "customer-360") return customerWorkflow(context);
  if (view === "leads" || view === "inquiries") return inquiryWorkflow(context);
  if (view === "leadPool" || view === "lead-review") return leadWorkflow(context);
  if (view === "actionCenter" || view === "follow-ups") return followUpWorkflow(context);
  return baseWorkflow(context, {
    title: "Safe fallback workflow",
    target_summary: view ? `Unknown or unsupported view=${view}` : "No target view provided.",
    suggested_steps: [
      "Review the opened module overview.",
      "Return to Command Center if the target is unclear.",
      "Do not execute high-risk commercial actions automatically.",
    ],
    safe_actions: ["Copy context summary", "Return to Command Center"],
    blocked_actions: [
      "Send customer message automatically",
      "Send official quotation automatically",
      "Send official PI automatically",
      "Confirm price, delivery time, payment terms or bank account",
    ],
    related_links: [link("Return to Command Center", commandCenterUrl(context))],
  });
}

function uniqueStrings(items = []) {
  return [...new Set(items.filter(Boolean).map((item) => String(item)))];
}

function uniqueLinks(links = []) {
  const seen = new Set();
  return links.filter((item) => {
    if (!item?.href) return false;
    const key = `${item.label}:${item.href}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
