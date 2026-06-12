import {
  DocumentType,
  TaskType,
  analyzeInquiry,
  createBlankDocument,
  createCustomerFromLead,
  createFollowUpTask as createMockFollowUpTask,
  createProductionOrderFromDocument,
  createProjectFromInquiry as createMockProjectFromInquiry,
  createQuotationDraft as createMockQuotationDraft,
  documentArchiveInfo,
  ensureDocumentSeeds,
  ensureProductSeeds,
  newId,
} from "../mock-crm.js";
import { buildArchivePath, buildExportFileName, buildZipPath } from "../document-archive.js";
import { approvalSummary } from "./approval-rules.js";

export const CommandTools = Object.freeze({
  findCustomer,
  listTodayFollowUps,
  analyzeLatestInquiry,
  convertLeadToCustomer,
  createProjectFromInquiry,
  createQuotationDraft,
  createDocumentDraft,
  buildArchivePathTool,
  createFollowUpTask,
});

export function executeCommandTool(db, parsedCommand) {
  const intent = parsedCommand.intent;
  if (intent === "customer_lookup") return findCustomer(db, parsedCommand.entities);
  if (intent === "daily_followup_list") return listTodayFollowUps(db);
  if (intent === "latest_inquiry_analysis") return analyzeLatestInquiry(db);
  if (intent === "lead_to_customer") return convertLeadToCustomer(db, parsedCommand.entities);
  if (intent === "create_project_from_inquiry") return createProjectFromInquiry(db, parsedCommand.entities);
  if (intent === "create_quotation_draft") return createQuotationDraft(db, parsedCommand.entities);
  if (intent === "create_document_draft") return createDocumentDraft(db, parsedCommand.entities);
  if (intent === "build_archive_path") return buildArchivePathTool(parsedCommand.entities);
  if (intent === "create_followup_task") return createFollowUpTask(db, parsedCommand.entities);
  return toolResult("unknown", false, "Command intent is not supported yet.", {}, ["No tool executed."], false, "NEED_MORE_INFO");
}

export function findCustomer(db, entities = {}) {
  const keyword = String(entities.customer_alias || "").toLowerCase();
  const customers = db.customers || [];
  const customer = customers.find((item) => {
    const haystack = `${item.name || ""} ${item.company || ""} ${item.aliases || ""} ${item.folder_alias || ""}`.toLowerCase();
    return keyword && haystack.includes(keyword.toLowerCase());
  }) || customers[0] || null;

  if (!customer) {
    return toolResult("findCustomer", false, "No matching customer found.", { keyword }, ["Try a more specific customer alias."], false, "NOT_FOUND");
  }

  return toolResult(
    "findCustomer",
    true,
    `Found customer: ${customer.name || customer.company || customer.id}`,
    {
      customer,
      inquiries: (db.inquiries || []).filter((item) => item.customer_id === customer.id).slice(0, 5),
      projects: (db.projects || []).filter((item) => item.customer_id === customer.id).slice(0, 5),
      follow_up_tasks: (db.follow_up_tasks || []).filter((item) => item.customer_id === customer.id).slice(0, 5),
    },
    [],
    false,
    "PREVIEW",
  );
}

export function listTodayFollowUps(db) {
  const today = new Date().toISOString().slice(0, 10);
  const tasks = (db.follow_up_tasks || []).filter((task) => {
    const dueDate = String(task.due_date || task.next_follow_up_at || "").slice(0, 10);
    return !dueDate || dueDate <= today || task.status === "PENDING";
  });

  return toolResult("listTodayFollowUps", true, `${tasks.length} follow-up task(s) need attention.`, { tasks }, [], false, "PREVIEW");
}

export function analyzeLatestInquiry(db) {
  const inquiry = (db.inquiries || [])[0] || null;
  if (!inquiry) return toolResult("analyzeLatestInquiry", false, "No inquiry found.", {}, ["Submit or import an inquiry first."], false, "NOT_FOUND");
  const analysis = analyzeInquiry(inquiry);
  return toolResult("analyzeLatestInquiry", true, analysis.ai_summary || "Latest inquiry analyzed with rule-based logic.", { inquiry, analysis }, [], false, "PREVIEW");
}

export function convertLeadToCustomer(db, entities = {}) {
  const lead = findLead(db, entities);
  if (!lead) return toolResult("convertLeadToCustomer", false, "No matching lead found.", {}, ["Lead id or lead alias is required."], false, "NOT_FOUND");
  const customer = createCustomerFromLead(db, lead.id);
  return toolResult("convertLeadToCustomer", Boolean(customer), customer ? `Lead converted to customer: ${customer.name || customer.company || customer.id}` : "Lead conversion failed.", { lead, customer }, [], false, customer ? "COMPLETED_MOCK" : "FAILED");
}

export function createProjectFromInquiry(db, entities = {}) {
  const inquiry = findInquiry(db, entities);
  if (!inquiry) return toolResult("createProjectFromInquiry", false, "No matching inquiry found.", {}, ["Inquiry id or project reference is required."], false, "NOT_FOUND");
  const project = createMockProjectFromInquiry(db, inquiry.id);
  return toolResult("createProjectFromInquiry", Boolean(project), project ? `Project draft created: ${project.title || project.project_title || project.id}` : "Project creation failed.", { inquiry, project }, [], false, project ? "COMPLETED_MOCK" : "FAILED");
}

export function createQuotationDraft(db, entities = {}) {
  const inquiry = findInquiry(db, entities);
  const project = findProject(db, entities);
  const source = project || inquiry;
  if (!source) return toolResult("createQuotationDraft", false, "No matching inquiry or project found.", {}, ["Inquiry or project reference is required."], true, "NOT_FOUND");
  const quotation = createMockQuotationDraft(db, source.id, project ? "project" : "inquiry");
  return toolResult("createQuotationDraft", Boolean(quotation), "Quotation draft created. Manual Review Required before any official quotation.", { source, quotation, approval: approvalSummary({ intent: "create_quotation_draft" }) }, ["Manual Review Required"], true, "DRAFT_REQUIRES_REVIEW");
}

export function createDocumentDraft(db, entities = {}) {
  ensureDocumentSeeds(db);
  ensureProductSeeds(db);
  const documentHint = entities.document_hint || "";
  const existingDocument = findDocument(db, entities);
  let document = null;

  if (documentHint === "production_order" && existingDocument) {
    document = createProductionOrderFromDocument(db, existingDocument.id);
  } else if (documentHint === "proforma_invoice") {
    document = createBlankDocument(db, DocumentType.PROFORMA_INVOICE);
  } else {
    document = createBlankDocument(db, DocumentType.QUOTATION);
  }

  return toolResult("createDocumentDraft", Boolean(document), "Document draft created. Manual Review Required before export, sending, official quotation or PI.", { document, archive: document ? documentArchiveInfo(document) : null, approval: approvalSummary({ intent: "create_document_draft" }) }, ["Manual Review Required"], true, "DRAFT_REQUIRES_REVIEW");
}

export function buildArchivePathTool(entities = {}) {
  const customerAlias = entities.customer_alias || "Customer";
  const archiveYear = entities.archive_year || new Date().getFullYear();
  const archiveOrderNo = entities.archive_order_no || "1";
  const fileName = buildExportFileName({
    customer_alias: customerAlias,
    archive_year: archiveYear,
    archive_order_no: archiveOrderNo,
    project: entities.project || "Project",
    document_type: entities.document_hint || "Document",
    date: new Date().toISOString().slice(0, 10).replaceAll("-", ""),
    version: "v1",
    ext: "xlsx",
  });
  return toolResult(
    "buildArchivePath",
    true,
    "Archive path preview generated.",
    {
      archive_path: buildArchivePath({
        base_path: "桌面 / MacBook Air / OneNote",
        customer_folder_alias: customerAlias,
        archive_year: archiveYear,
        archive_order_no: archiveOrderNo,
      }),
      file_name: fileName,
      zip_path: buildZipPath({
        base_path: "桌面 / MacBook Air / OneNote",
        customer_alias: customerAlias,
        archive_year: archiveYear,
        archive_order_no: archiveOrderNo,
        file_name: fileName,
      }),
    },
    [],
    false,
    "PREVIEW",
  );
}

export function createFollowUpTask(db, entities = {}) {
  const inquiry = findInquiry(db, entities) || (db.inquiries || [])[0] || null;
  if (!inquiry) return toolResult("createFollowUpTask", false, "No inquiry found for follow-up task.", {}, ["Inquiry reference is required."], false, "NOT_FOUND");
  const task = createMockFollowUpTask(db, inquiry, TaskType.INITIAL_REPLY);
  return toolResult("createFollowUpTask", Boolean(task), "Follow-up task created in mock CRM.", { inquiry, task }, [], false, "COMPLETED_MOCK");
}

function toolResult(toolName, ok, resultSummary, data = {}, warnings = [], approvalRequired = false, status = ok ? "PREVIEW" : "FAILED") {
  return {
    ok,
    tool_name: toolName,
    result_summary: resultSummary,
    summary: resultSummary,
    data,
    warnings,
    approval_required: approvalRequired,
    status,
  };
}

function findLead(db, entities = {}) {
  const keyword = String(entities.lead_id || entities.customer_alias || "").toLowerCase();
  return (db.leads || []).find((lead) => {
    const haystack = `${lead.id || ""} ${lead.name || ""} ${lead.company || ""} ${lead.email || ""} ${lead.whatsapp || ""}`.toLowerCase();
    return keyword ? haystack.includes(keyword) : true;
  }) || (db.leads || [])[0] || null;
}

function findInquiry(db, entities = {}) {
  const keyword = String(entities.inquiry_id || entities.project || entities.customer_alias || "").toLowerCase();
  return (db.inquiries || []).find((inquiry) => {
    const haystack = `${inquiry.id || ""} ${inquiry.title || ""} ${inquiry.inquiry_title || ""} ${inquiry.project_description || ""} ${inquiry.company || ""}`.toLowerCase();
    return keyword ? haystack.includes(keyword) : true;
  }) || (db.inquiries || [])[0] || null;
}

function findProject(db, entities = {}) {
  const keyword = String(entities.project || entities.customer_alias || "").toLowerCase();
  return (db.projects || []).find((project) => {
    const haystack = `${project.id || ""} ${project.title || ""} ${project.project_title || ""} ${project.project_name || ""}`.toLowerCase();
    return keyword ? haystack.includes(keyword) : true;
  }) || null;
}

function findDocument(db, entities = {}) {
  const keyword = String(entities.project || entities.customer_alias || "").toLowerCase();
  return (db.documents || []).find((document) => {
    const haystack = `${document.id || ""} ${document.document_no || ""} ${document.project_name || ""} ${document.project_code || ""} ${document.customer?.name || ""} ${document.customer?.folder_alias || ""}`.toLowerCase();
    return keyword ? haystack.includes(keyword) : true;
  }) || (db.documents || [])[0] || null;
}
