const AI_DRAFT_TYPE_LABELS_ZH = Object.freeze({
  customer_reply_draft: "客户回复草稿",
  supplier_rfq_draft: "供应商询价草稿",
  quotation_draft: "报价草稿",
  pi_draft: "PI 草稿",
  whatsapp_draft: "WhatsApp 草稿",
  email_draft: "邮件草稿",
  knowledge_article_draft: "知识库文章草稿",
  document_summary_draft: "文件摘要草稿",
  follow_up_task_draft: "跟进任务草稿",
  internal_note_draft: "内部备注草稿",
});

const AI_TASK_TYPE_LABELS_ZH = Object.freeze({
  inquiry_analysis: "询盘分析",
  customer_summary: "客户摘要",
  supplier_matching: "供应商匹配",
  supplier_rfq_generation: "供应商询价生成",
  quotation_check: "报价检查",
  quotation_generation: "报价生成",
  document_summary: "文件摘要",
  communication_summary: "沟通摘要",
  knowledge_update_suggestion: "知识库更新建议",
  follow_up_suggestion: "跟进建议",
});

const APPROVAL_STATUS_LABELS_ZH = Object.freeze({
  draft: "草稿",
  needs_review: "需要审核",
  approved_internal: "内部已批准",
  rejected: "已拒绝",
  sent_manual: "已人工发送",
  archived: "已归档",
});

const AI_RISK_LEVEL_LABELS_ZH = Object.freeze({
  low: "低",
  medium: "中",
  high: "高",
  blocked: "已阻止",
});

const AI_DECISION_STATUS_LABELS_ZH = Object.freeze({
  pending: "待处理",
  accepted: "已接受",
  rejected: "已拒绝",
  edited: "已编辑",
  escalated: "已升级",
});

const AI_ACTION_BOUNDARY_LABELS_ZH = Object.freeze({
  auto_allowed: "可自动执行",
  review_required: "需要人工审核",
  blocked: "已阻止",
});

const COMMUNICATION_DIRECTION_LABELS_ZH = Object.freeze({
  inbound: "收到",
  outbound: "发出",
  internal: "内部",
  system: "系统",
  ai_draft: "AI 草稿",
});

const COMMUNICATION_CHANNEL_LABELS_ZH = Object.freeze({
  email: "邮件",
  whatsapp: "WhatsApp",
  wechat: "微信",
  phone: "电话",
  meeting: "会议",
  website: "官网",
  alibaba: "阿里巴巴",
  made_in_china: "中国制造网",
  manual_note: "手动备注",
  system_note: "系统备注",
  ai_command: "AI 指令",
});

const ATTACHMENT_TYPE_LABELS_ZH = Object.freeze({
  drawing: "图纸",
  photo: "照片",
  quotation: "报价单",
  supplier_quote: "供应商报价",
  pi: "PI",
  invoice: "发票",
  payment_slip: "付款水单",
  product_spec: "产品规格",
  packing_info: "包装信息",
  video: "视频",
  certificate: "证书",
  screenshot: "截图",
  other: "其他",
});

const NUMBERING_OBJECT_LABELS_ZH = Object.freeze({
  customer_company: "客户公司",
  customer_contact: "客户联系人",
  supplier_company: "供应商公司",
  supplier_contact: "供应商联系人",
  inquiry: "询盘",
  project: "项目",
  supplier_rfq: "供应商询价",
  supplier_quote: "供应商报价",
  customer_quotation: "客户报价",
  pi: "PI",
  order: "订单",
  purchase_order: "采购订单",
  document: "文件",
  attachment: "附件",
  communication_thread: "沟通线程",
  task: "任务",
  knowledge_article: "知识库文章",
  approval_review: "人工审核",
});

const CHINESE_UI_LABEL_GROUPS = Object.freeze({
  ai_draft_types: AI_DRAFT_TYPE_LABELS_ZH,
  ai_task_types: AI_TASK_TYPE_LABELS_ZH,
  approval_statuses: APPROVAL_STATUS_LABELS_ZH,
  ai_risk_levels: AI_RISK_LEVEL_LABELS_ZH,
  ai_decision_statuses: AI_DECISION_STATUS_LABELS_ZH,
  ai_action_boundaries: AI_ACTION_BOUNDARY_LABELS_ZH,
  communication_directions: COMMUNICATION_DIRECTION_LABELS_ZH,
  communication_channels: COMMUNICATION_CHANNEL_LABELS_ZH,
  attachment_types: ATTACHMENT_TYPE_LABELS_ZH,
  numbering_objects: NUMBERING_OBJECT_LABELS_ZH,
});

function getChineseLabel(group, key, fallback) {
  const labels = CHINESE_UI_LABEL_GROUPS[group];
  if (labels && Object.prototype.hasOwnProperty.call(labels, key)) {
    return labels[key];
  }

  return fallback !== undefined ? fallback : key;
}

module.exports = {
  AI_DRAFT_TYPE_LABELS_ZH,
  AI_TASK_TYPE_LABELS_ZH,
  APPROVAL_STATUS_LABELS_ZH,
  AI_RISK_LEVEL_LABELS_ZH,
  AI_DECISION_STATUS_LABELS_ZH,
  AI_ACTION_BOUNDARY_LABELS_ZH,
  COMMUNICATION_DIRECTION_LABELS_ZH,
  COMMUNICATION_CHANNEL_LABELS_ZH,
  ATTACHMENT_TYPE_LABELS_ZH,
  NUMBERING_OBJECT_LABELS_ZH,
  CHINESE_UI_LABEL_GROUPS,
  getChineseLabel,
};
