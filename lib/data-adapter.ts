import type { Customer, FollowUpTask, Inquiry, Lead, Attachment } from "../types/crm";

export type DataMode = "mock" | "supabase";

export type CrmPilotData = {
  leads: Lead[];
  customers: Customer[];
  inquiries: Inquiry[];
  follow_up_tasks: FollowUpTask[];
  attachments: Attachment[];
};

export type WebsiteInquiryInput = Partial<Inquiry> & {
  lead_info?: Inquiry["lead_info"];
  attachment_names?: string[];
  original_submission?: Record<string, unknown>;
};

export interface CrmDataAdapter {
  mode: DataMode;
  createWebsiteInquiry(input: WebsiteInquiryInput): Promise<{
    lead?: Lead;
    customer?: Customer;
    inquiry: Inquiry;
    follow_up_tasks: FollowUpTask[];
    attachments: Attachment[];
  }>;
  listInquiries(): Promise<Inquiry[]>;
  listCustomers(): Promise<Customer[]>;
  listFollowUps(): Promise<FollowUpTask[]>;
  loadPilotData(): Promise<CrmPilotData>;
}

export const DATA_MODE_ENV = "NEXT_PUBLIC_DATA_MODE";
