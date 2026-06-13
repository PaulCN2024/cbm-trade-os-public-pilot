const ARCHITECTURAL_CHECKLIST = [
  ["drawings", "图纸"],
  ["project location", "项目地点"],
  ["product category", "产品类别"],
  ["glass specification", "玻璃规格"],
  ["aluminum color", "铝材颜色"],
  ["quantity", "数量 / 面积"],
  ["destination port", "目的港"],
];

const PRECISION_CHECKLIST = [
  ["drawing file", "图纸文件"],
  ["material grade", "材料牌号"],
  ["tolerance", "公差"],
  ["surface finish", "表面处理"],
  ["quantity", "数量"],
  ["destination", "目的地"],
];

const BLOCKED_ACTIONS = [
  "send email",
  "send WhatsApp",
  "send quotation",
  "send PI",
  "confirm price",
  "confirm delivery time",
  "confirm payment terms",
  "confirm bank information",
];

export function todayIso(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function deriveFollowUpPriority(task = {}, related = {}, today = todayIso()) {
  const dueDate = String(task.due_date || task.next_follow_up_at || "").slice(0, 10);
  if (dueDate && dueDate < today) return "high";
  if (String(task.priority || "").toLowerCase() === "high") return "high";
  if (related.inquiry?.status === "READY_TO_QUOTE") return "high";
  if (task.is_test || related.inquiry?.is_test || related.lead?.is_test) return "low";
  if (!related.customer && !related.lead?.email && !related.lead?.whatsapp) return "medium";
  return "medium";
}

export function buildMissingInfoChecklist(inquiry = {}) {
  const businessLine = String(inquiry.business_line || "");
  const source = businessLine.includes("PRECISION") ? PRECISION_CHECKLIST : ARCHITECTURAL_CHECKLIST;
  const missingText = [
    ...(Array.isArray(inquiry.missing_info) ? inquiry.missing_info : []),
    inquiry.project_description,
    inquiry.description,
  ]
    .join(" ")
    .toLowerCase();

  return source.map(([key, label]) => {
    const normalizedKey = key.toLowerCase();
    const directValue = inquiry[normalizedKey.replaceAll(" ", "_")] || inquiry[normalizedKey];
    const missing = !directValue || missingText.includes(normalizedKey) || missingText.includes(label.toLowerCase());
    return { key, label, missing: Boolean(missing) };
  });
}

export function buildFollowUpDetailModel(task = {}, relatedData = {}, today = todayIso()) {
  const inquiry = relatedData.inquiry || null;
  const customer = relatedData.customer || null;
  const lead = relatedData.lead || null;
  const dueDate = String(task.due_date || task.next_follow_up_at || "").slice(0, 10);
  const isOverdue = Boolean(dueDate && dueDate < today);
  const missingInfoChecklist = buildMissingInfoChecklist(inquiry || {});
  const missingCount = missingInfoChecklist.filter((item) => item.missing).length;
  const priority = deriveFollowUpPriority(task, relatedData, today);
  const displayName = customer?.name || lead?.name || inquiry?.lead_info?.name || "未命名客户";

  return {
    id: task.id || "",
    source_type: "follow_up_task",
    can_update: Boolean(task.id),
    customer_id: customer?.id || inquiry?.customer_id || task.customer_id || "",
    inquiry_id: inquiry?.id || task.inquiry_id || "",
    lead_id: lead?.id || inquiry?.lead_id || task.lead_id || "",
    title: task.title || task.task_type || "跟进任务",
    customer_name: displayName,
    company: customer?.company || lead?.company || inquiry?.lead_info?.company || "",
    country: customer?.country || lead?.country || inquiry?.lead_info?.country || "",
    business_line: task.business_line || inquiry?.business_line || lead?.business_line || "",
    inquiry_title: inquiry?.title || "",
    due_date: dueDate,
    status: task.status || "PENDING",
    priority,
    due_bucket: isOverdue ? "overdue" : dueDate === today ? "today" : "upcoming",
    missing_info_checklist: missingInfoChecklist,
    missing_info_count: missingCount,
    is_test: Boolean(task.is_test || inquiry?.is_test || lead?.is_test),
    recommended_next_action:
      task.recommended_next_action ||
      inquiry?.recommended_next_action ||
      (missingCount ? "先补齐缺失信息，再进入人工报价判断。" : "检查客户背景并准备人工审核后的回复草稿。"),
    reply_draft: buildReplyDraft(task, inquiry, missingInfoChecklist),
    draft_only: true,
    manual_review_required: true,
    safe_actions: ["mark_done", "postpone", "create_reply_draft", "copy_reply_draft", "open_customer", "open_inquiry", "open_lead_review", "return_command_center"],
    blocked_actions: BLOCKED_ACTIONS,
  };
}

export function groupFollowUpTasks(tasks = [], relatedData = {}, today = todayIso()) {
  const models = tasks.map((task) => {
    const inquiry = relatedData.inquiries?.find((item) => item.id === task.inquiry_id) || null;
    const customer = relatedData.customers?.find((item) => item.id === task.customer_id || item.id === inquiry?.customer_id) || null;
    const lead = relatedData.leads?.find((item) => item.id === task.lead_id || item.id === inquiry?.lead_id) || null;
    return buildFollowUpDetailModel(task, { inquiry, customer, lead }, today);
  });

  const recentConverted = (relatedData.leads || [])
    .filter((lead) => lead.status === "CONVERTED_TO_CUSTOMER")
    .slice(0, 4)
    .map((lead) => ({
      id: lead.id,
      source_type: "lead",
      can_update: false,
      title: lead.company || lead.name || "最近转客户",
      customer_name: lead.name || "新客户",
      company: lead.company || "",
      country: lead.country || "",
      business_line: lead.business_line || "",
      status: lead.status,
      priority: lead.is_test ? "low" : "medium",
      missing_info_count: 0,
      is_test: Boolean(lead.is_test),
      recommended_next_action: "查看客户 360，安排首次人工跟进。",
    }));

  const groups = {
    today: models.filter((item) => item.due_bucket === "today"),
    overdue: models.filter((item) => item.due_bucket === "overdue"),
    missingInfo: models.filter((item) => item.missing_info_count > 0),
    manualReview: models.filter((item) => item.manual_review_required || item.priority === "high"),
    recentConverted,
  };

  return {
    groups,
    summary: {
      today: groups.today.length,
      overdue: groups.overdue.length,
      missing_info: groups.missingInfo.length,
      manual_review: groups.manualReview.length,
      high_priority: models.filter((item) => item.priority === "high").length,
    },
  };
}

function buildReplyDraft(task = {}, inquiry = {}, checklist = []) {
  const missing = checklist.filter((item) => item.missing).map((item) => item.label);
  if (missing.length) {
    return `您好，我们已收到询盘。为便于人工技术审核，请补充：${missing.slice(0, 5).join("、")}。此内容仅为回复草稿，不会自动发送客户。`;
  }
  return `您好，我们已收到您的资料。我们会进行人工审核后再确认是否可以报价。此内容仅为回复草稿，不会自动发送客户。`;
}
