export const BusinessLine = {
  ARCHITECTURAL: "A_ARCHITECTURAL",
  INDUSTRIAL: "B_INDUSTRIAL",
  UNKNOWN: "UNKNOWN",
  // Legacy value kept for existing mock CRM data and tests.
  PRECISION: "B_PRECISION",
} as const;

export const LeadStatus = {
  NEW: "NEW",
  QUALIFYING: "QUALIFYING",
  CONVERTED: "CONVERTED",
  LOST: "LOST",
} as const;

export const InquiryStatus = {
  NEW: "NEW",
  NEED_MORE_INFO: "NEED_MORE_INFO",
  READY_TO_QUOTE: "READY_TO_QUOTE",
  QUOTATION_DRAFTED: "QUOTATION_DRAFTED",
  CONVERTED_TO_PROJECT: "CONVERTED_TO_PROJECT",
  CLOSED: "CLOSED",
} as const;

export const ProjectStage = {
  REQUIREMENT_REVIEW: "REQUIREMENT_REVIEW",
  QUOTATION: "QUOTATION",
  NEGOTIATION: "NEGOTIATION",
  ORDER_PENDING: "ORDER_PENDING",
  ORDERED: "ORDERED",
  LOST: "LOST",
} as const;

export const QuotationStatus = {
  DRAFT: "DRAFT",
  NEED_REVIEW: "NEED_REVIEW",
  ACCEPTED_MOCK: "ACCEPTED_MOCK",
} as const;

export const OrderStatus = {
  DRAFT: "DRAFT",
  PI_REVIEW: "PI_REVIEW",
  PAYMENT_PENDING: "PAYMENT_PENDING",
  PRODUCTION_PENDING: "PRODUCTION_PENDING",
  IN_PRODUCTION: "IN_PRODUCTION",
  READY_TO_SHIP: "READY_TO_SHIP",
  SHIPPED: "SHIPPED",
  CLOSED: "CLOSED",
} as const;

export const ShipmentStatus = {
  DRAFT: "DRAFT",
  BOOKING_PENDING: "BOOKING_PENDING",
  BOOKED_MOCK: "BOOKED_MOCK",
  LOADING_PENDING: "LOADING_PENDING",
  SHIPPED_MOCK: "SHIPPED_MOCK",
  ARRIVED_MOCK: "ARRIVED_MOCK",
  CLOSED: "CLOSED",
} as const;

export const AfterSalesStatus = {
  OPEN: "OPEN",
  FOLLOW_UP_PENDING: "FOLLOW_UP_PENDING",
  WAITING_CUSTOMER_FEEDBACK: "WAITING_CUSTOMER_FEEDBACK",
  REPEAT_BUSINESS_OPPORTUNITY: "REPEAT_BUSINESS_OPPORTUNITY",
  CLOSED: "CLOSED",
} as const;

export const TaskType = {
  INITIAL_REPLY: "INITIAL_REPLY",
  REQUEST_MISSING_INFO: "REQUEST_MISSING_INFO",
  QUOTE_FOLLOW_UP: "QUOTE_FOLLOW_UP",
  AFTER_SALES_FOLLOW_UP: "AFTER_SALES_FOLLOW_UP",
  REPEAT_BUSINESS: "REPEAT_BUSINESS",
} as const;

export const TaskStatus = {
  PENDING: "PENDING",
  DONE: "DONE",
  CANCELLED: "CANCELLED",
} as const;

export const Source = {
  WEBSITE: "website",
  ALIBABA: "alibaba",
  GMAIL: "gmail",
  WHATSAPP: "whatsapp",
  MANUAL: "manual",
} as const;

export const SafetyBoundary = [
  "No automatic customer messages",
  "No automatic official quotations",
  "No automatic PI",
  "No automatic price confirmation",
  "No automatic delivery time confirmation",
  "No automatic payment terms confirmation",
  "No automatic bank account confirmation",
  "No automatic compensation or responsibility judgment",
] as const;

export type BusinessLine = (typeof BusinessLine)[keyof typeof BusinessLine];
export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus];
export type InquiryStatus = (typeof InquiryStatus)[keyof typeof InquiryStatus];
export type ProjectStage = (typeof ProjectStage)[keyof typeof ProjectStage];
export type QuotationStatus = (typeof QuotationStatus)[keyof typeof QuotationStatus];
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
export type ShipmentStatus = (typeof ShipmentStatus)[keyof typeof ShipmentStatus];
export type AfterSalesStatus = (typeof AfterSalesStatus)[keyof typeof AfterSalesStatus];
export type TaskType = (typeof TaskType)[keyof typeof TaskType];
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];
export type Source = (typeof Source)[keyof typeof Source];
