import type {
  AfterSalesStatus,
  BusinessLine,
  InquiryStatus,
  LeadStatus,
  OrderStatus,
  ProjectStage,
  QuotationStatus,
  ShipmentStatus,
  Source,
  TaskStatus,
  TaskType,
} from "../lib/crm-constants";

export type ID = string;
export type ISODate = string;
export type ISODateTime = string;

export interface Lead {
  id: ID;
  source: Source;
  business_line: BusinessLine;
  status: LeadStatus | string;
  title?: string;
  company?: string;
  name?: string;
  email?: string;
  whatsapp?: string;
  country?: string;
  score?: number;
  customer_id?: ID;
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
}

export interface Customer {
  id: ID;
  name: string;
  contact_name?: string;
  email?: string;
  whatsapp?: string;
  country?: string;
  folder_alias?: string;
  status?: string;
  importance?: string;
  summary?: string;
  created_at?: ISODateTime;
}

export interface Inquiry {
  id: ID;
  source: Source;
  business_line: BusinessLine;
  status: InquiryStatus;
  title: string;
  lead_id?: ID;
  customer_id?: ID;
  project_id?: ID;
  quotation_id?: ID;
  lead_info: {
    name?: string;
    company?: string;
    email?: string;
    whatsapp?: string;
    country?: string;
  };
  project_type?: string;
  destination_port?: string;
  ai_summary?: string;
  missing_info?: string[];
  score?: number;
  recommended_next_action?: string;
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
}

export interface Project {
  id: ID;
  inquiry_id?: ID;
  customer_id?: ID;
  title?: string;
  name?: string;
  business_line?: BusinessLine;
  stage: ProjectStage | string;
  priority?: string;
  next_action?: string;
  created_at?: ISODateTime;
}

export interface Quotation {
  id: ID;
  quote_no: string;
  inquiry_id?: ID;
  project_id?: ID;
  customer_id?: ID;
  customer?: string;
  business_line?: BusinessLine;
  status: QuotationStatus | string;
  currency?: string;
  incoterm?: string;
  destination_port?: string;
  manual_review_required: boolean;
  created_at?: ISODateTime;
}

export interface Order {
  id: ID;
  order_no: string;
  quotation_id: ID;
  inquiry_id?: ID;
  project_id?: ID;
  customer_id?: ID;
  status: OrderStatus;
  payment_status?: string;
  production_status?: string;
  manual_review_required: boolean;
  created_at?: ISODateTime;
}

export interface Shipment {
  id: ID;
  shipment_no: string;
  order_id?: ID;
  project_id?: ID;
  customer_id?: ID;
  status: ShipmentStatus;
  destination_port?: string;
  document_status?: string;
  manual_review_required: boolean;
  created_at?: ISODateTime;
}

export interface AfterSalesCase {
  id: ID;
  case_no: string;
  shipment_id?: ID;
  order_id?: ID;
  project_id?: ID;
  customer_id?: ID;
  status: AfterSalesStatus;
  issue_type?: string;
  customer_feedback?: string;
  repeat_business_opportunity?: string;
  manual_review_required: boolean;
  created_at?: ISODateTime;
}

export interface FollowUpTask {
  id: ID;
  type: TaskType;
  status: TaskStatus;
  title: string;
  inquiry_id?: ID;
  customer_id?: ID;
  project_id?: ID;
  quotation_id?: ID;
  order_id?: ID;
  shipment_id?: ID;
  after_sales_case_id?: ID;
  due_date?: ISODate;
  priority?: string;
  created_at?: ISODateTime;
}

export type RepeatBusinessTask = FollowUpTask & {
  type: "REPEAT_BUSINESS";
  after_sales_case_id: ID;
};

export interface CommunicationLog {
  id: ID;
  source: Source | string;
  customer_id?: ID;
  lead_id?: ID;
  inquiry_id?: ID;
  project_id?: ID;
  quotation_id?: ID;
  order_id?: ID;
  shipment_id?: ID;
  direction?: "inbound" | "outbound" | "internal";
  channel?: string;
  summary?: string;
  created_at?: ISODateTime;
}

export interface Attachment {
  id: ID;
  file_name: string;
  file_type?: string;
  source?: Source | string;
  customer_id?: ID;
  lead_id?: ID;
  inquiry_id?: ID;
  project_id?: ID;
  quotation_id?: ID;
  order_id?: ID;
  shipment_id?: ID;
  after_sales_case_id?: ID;
  created_at?: ISODateTime;
}
