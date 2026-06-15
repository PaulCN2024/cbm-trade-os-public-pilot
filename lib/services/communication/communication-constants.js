const COMMUNICATION_DIRECTIONS = Object.freeze({
  inbound: "Inbound",
  outbound: "Outbound",
  internal: "Internal",
  system: "System",
  ai_draft: "AI Draft",
});

const COMMUNICATION_CHANNELS = Object.freeze({
  email: "Email",
  whatsapp: "WhatsApp",
  wechat: "WeChat",
  phone: "Phone",
  meeting: "Meeting",
  website: "Website",
  alibaba: "Alibaba",
  made_in_china: "Made-in-China",
  manual_note: "Manual Note",
  system_note: "System Note",
  ai_command: "AI Command",
});

const ATTACHMENT_TYPES = Object.freeze({
  drawing: "Drawing",
  photo: "Photo",
  quotation: "Quotation",
  supplier_quote: "Supplier Quote",
  pi: "PI",
  invoice: "Invoice",
  payment_slip: "Payment Slip",
  product_spec: "Product Specification",
  packing_info: "Packing Information",
  video: "Video",
  certificate: "Certificate",
  screenshot: "Screenshot",
  other: "Other",
});

const COMMUNICATION_VISIBILITY_LEVELS = Object.freeze({
  normal: "Normal",
  internal: "Internal",
  confidential: "Confidential",
  owner_only: "Owner Only",
  finance_only: "Finance Only",
  supplier_sensitive: "Supplier Sensitive",
  customer_sensitive: "Customer Sensitive",
});

const COMMUNICATION_STATUS = Object.freeze({
  active: "Active",
  waiting_customer_reply: "Waiting Customer Reply",
  waiting_supplier_reply: "Waiting Supplier Reply",
  need_follow_up: "Need Follow-up",
  closed: "Closed",
  archived: "Archived",
});

const DEFAULT_COMMUNICATION_VALUES = Object.freeze({
  DEFAULT_DIRECTION: "internal",
  DEFAULT_CHANNEL: "manual_note",
  DEFAULT_ATTACHMENT_TYPE: "other",
  DEFAULT_VISIBILITY: "normal",
  DEFAULT_STATUS: "active",
});

const COMMUNICATION_DIRECTION_VALUES = Object.freeze(Object.keys(COMMUNICATION_DIRECTIONS));
const COMMUNICATION_CHANNEL_VALUES = Object.freeze(Object.keys(COMMUNICATION_CHANNELS));
const ATTACHMENT_TYPE_VALUES = Object.freeze(Object.keys(ATTACHMENT_TYPES));
const COMMUNICATION_VISIBILITY_VALUES = Object.freeze(Object.keys(COMMUNICATION_VISIBILITY_LEVELS));
const COMMUNICATION_STATUS_VALUES = Object.freeze(Object.keys(COMMUNICATION_STATUS));

module.exports = {
  COMMUNICATION_DIRECTIONS,
  COMMUNICATION_CHANNELS,
  ATTACHMENT_TYPES,
  COMMUNICATION_VISIBILITY_LEVELS,
  COMMUNICATION_STATUS,
  DEFAULT_COMMUNICATION_VALUES,
  COMMUNICATION_DIRECTION_VALUES,
  COMMUNICATION_CHANNEL_VALUES,
  ATTACHMENT_TYPE_VALUES,
  COMMUNICATION_VISIBILITY_VALUES,
  COMMUNICATION_STATUS_VALUES,
};
