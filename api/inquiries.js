const { getSupabaseClient, handleApiError, parseBody, sendJson } = require("./_supabase");

function toCustomerInsert(inquiry) {
  const leadInfo = inquiry.lead_info || {};
  return {
    name: leadInfo.company || leadInfo.name || "Unknown customer",
    contact_name: leadInfo.name || "",
    email: leadInfo.email || "",
    whatsapp: leadInfo.whatsapp || "",
    country: leadInfo.country || "",
    type: inquiry.business_line === "B_PRECISION" ? "Precision aluminum buyer" : "Architectural aluminum buyer",
    status: "active",
    importance: Number(inquiry.score || 0) >= 85 ? "A" : "B",
    aliases: leadInfo.company || "",
    summary: inquiry.ai_summary || "",
    source: inquiry.source || "website",
    business_line: inquiry.business_line,
    metadata: {
      created_from: "api/inquiries",
      manual_review_required: true,
    },
  };
}

function toLeadInsert(inquiry, customerId) {
  const leadInfo = inquiry.lead_info || {};
  return {
    customer_id: customerId,
    source: inquiry.source || "website",
    status: "QUALIFYING",
    business_line: inquiry.business_line,
    title: inquiry.title,
    name: leadInfo.name || "",
    company: leadInfo.company || "",
    email: leadInfo.email || "",
    whatsapp: leadInfo.whatsapp || "",
    country: leadInfo.country || "",
    score: Number(inquiry.score || 0),
    summary: inquiry.ai_summary || "",
    missing_info: inquiry.missing_info || [],
    metadata: {
      manual_review_required: true,
      website_submission_key: inquiry.website_submission_key || "",
    },
  };
}

function toInquiryInsert(inquiry, customerId, leadId, followUpAt) {
  return {
    customer_id: customerId,
    lead_id: leadId,
    source: inquiry.source || "website",
    status: inquiry.status || "NEW",
    business_line: inquiry.business_line,
    title: inquiry.title,
    project_type: inquiry.project_type || "",
    drawing_status: inquiry.drawing_status || "",
    quote_method: inquiry.quote_method || "",
    material_finish: inquiry.material_finish || "",
    destination_port: inquiry.destination_port || "",
    project_description: inquiry.project_description || "",
    support_needed: inquiry.support_needed || "",
    score: Number(inquiry.score || 0),
    ai_summary: inquiry.ai_summary || "",
    missing_info: inquiry.missing_info || [],
    recommended_next_action: inquiry.recommended_next_action || "",
    reply_draft_en: inquiry.reply_draft_en || "",
    reply_draft_zh: inquiry.reply_draft_zh || "",
    reply_draft_es: inquiry.reply_draft_es || "",
    original_submission: inquiry.original_submission || {},
    next_follow_up_at: followUpAt,
    metadata: {
      lead_info: inquiry.lead_info || {},
      attachment_names: inquiry.attachment_names || [],
      manual_review_required: true,
      website_submission_key: inquiry.website_submission_key || "",
    },
  };
}

function toTaskInsert(inquiry, customerId, leadId, inquiryId, followUpAt) {
  const missing = inquiry.missing_info || [];
  return {
    customer_id: customerId,
    lead_id: leadId,
    inquiry_id: inquiryId,
    type: missing.length ? "REQUEST_MISSING_INFO" : "INITIAL_REPLY",
    status: "PENDING",
    title: missing.length
      ? `Request missing information: ${missing.slice(0, 4).join(", ")}`
      : "Send initial reply draft after manual review",
    due_date: followUpAt.slice(0, 10),
    next_follow_up_at: followUpAt,
    priority: Number(inquiry.score || 0) >= 85 ? "high" : "normal",
    manual_review_required: true,
    metadata: {
      safety_boundary: "No automatic customer message was sent.",
    },
  };
}

function toAttachmentInserts(inquiry, customerId, leadId, inquiryId) {
  return (inquiry.attachment_names || []).map((fileName) => ({
    customer_id: customerId,
    lead_id: leadId,
    inquiry_id: inquiryId,
    file_name: fileName,
    file_type: String(fileName).split(".").pop() || "unknown",
    source: inquiry.source || "website",
    metadata: {
      storage_status: "metadata_only",
      manual_review_required: true,
    },
  }));
}

function apiInquiry(row) {
  return {
    id: row.id,
    lead_id: row.lead_id || "",
    customer_id: row.customer_id || "",
    source: row.source,
    status: row.status,
    business_line: row.business_line,
    title: row.title,
    lead_info: row.metadata?.lead_info || {},
    project_type: row.project_type || "",
    drawing_status: row.drawing_status || "",
    quote_method: row.quote_method || "",
    material_finish: row.material_finish || "",
    destination_port: row.destination_port || "",
    project_description: row.project_description || "",
    support_needed: row.support_needed || "",
    attachment_names: row.metadata?.attachment_names || [],
    ai_summary: row.ai_summary || "",
    missing_info: row.missing_info || [],
    score: row.score || 0,
    recommended_next_action: row.recommended_next_action || "",
    reply_draft_en: row.reply_draft_en || "",
    reply_draft_zh: row.reply_draft_zh || "",
    reply_draft_es: row.reply_draft_es || "",
    original_submission: row.original_submission || {},
    next_follow_up_at: row.next_follow_up_at || "",
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

const ALLOWED_LEAD_STATUSES = new Set(["NEW", "NEED_REVIEW", "QUALIFIED", "DISQUALIFIED", "CONVERTED_TO_CUSTOMER"]);

function normalizeLeadStatus(status) {
  const value = String(status || "NEED_REVIEW").toUpperCase();
  if (value === "QUALIFYING") return "NEED_REVIEW";
  if (value === "CONVERTED") return "CONVERTED_TO_CUSTOMER";
  if (value === "LOST" || value === "INVALID") return "DISQUALIFIED";
  return ALLOWED_LEAD_STATUSES.has(value) ? value : "NEED_REVIEW";
}

function apiLead(row, inquiryByLeadId = new Map(), tasksByLeadId = new Map()) {
  const inquiry = inquiryByLeadId.get(row.id) || null;
  const tasks = tasksByLeadId.get(row.id) || [];
  return {
    ...row,
    status: normalizeLeadStatus(row.status),
    inquiry_id: inquiry?.id || "",
    inquiry_title: inquiry?.title || row.title || "",
    inquiry_summary: inquiry?.ai_summary || row.summary || "",
    inquiry_status: inquiry?.status || "",
    inquiry_missing_info: inquiry?.missing_info || row.missing_info || [],
    follow_up_task_status: tasks.length
      ? tasks.some((task) => task.status === "PENDING")
        ? "PENDING"
        : tasks[0].status
      : "NO_TASK",
    is_test: Boolean(row.is_test || row.metadata?.is_test),
  };
}

function customerFromLead(lead) {
  return {
    name: lead.company || lead.name || "Unknown customer",
    contact_name: lead.name || "",
    email: lead.email || "",
    whatsapp: lead.whatsapp || "",
    country: lead.country || "",
    type: lead.business_line === "B_PRECISION" ? "Precision aluminum buyer" : "Architectural aluminum buyer",
    status: "active",
    importance: Number(lead.score || 0) >= 85 ? "A" : "B",
    aliases: lead.company || "",
    summary: lead.summary || "",
    source: lead.source || "website",
    business_line: lead.business_line,
    metadata: {
      created_from: "api/inquiries?action=convert_lead_to_customer",
      manual_review_required: true,
      is_test: Boolean(lead.is_test || lead.metadata?.is_test),
      original_lead_id: lead.id,
      source_lead_metadata: lead.metadata || {},
    },
  };
}

module.exports = async function handler(request, response) {
  try {
    const supabase = getSupabaseClient(request);

    if (request.method === "GET") {
      const [
        { data: inquiries, error: inquiriesError },
        { data: leads, error: leadsError },
        { data: attachments, error: attachmentsError },
        { data: tasks, error: tasksError },
      ] =
        await Promise.all([
          supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
          supabase.from("leads").select("*").order("created_at", { ascending: false }),
          supabase.from("attachments").select("*").order("created_at", { ascending: false }),
          supabase.from("follow_up_tasks").select("*").order("next_follow_up_at", { ascending: true, nullsFirst: false }),
        ]);
      if (inquiriesError) throw inquiriesError;
      if (leadsError) throw leadsError;
      if (attachmentsError) throw attachmentsError;
      if (tasksError) throw tasksError;
      const inquiryByLeadId = new Map();
      (inquiries || []).forEach((inquiry) => {
        if (inquiry.lead_id && !inquiryByLeadId.has(inquiry.lead_id)) inquiryByLeadId.set(inquiry.lead_id, inquiry);
      });
      const tasksByLeadId = new Map();
      (tasks || []).forEach((task) => {
        if (!task.lead_id) return;
        tasksByLeadId.set(task.lead_id, [...(tasksByLeadId.get(task.lead_id) || []), task]);
      });
      sendJson(response, 200, {
        inquiries: (inquiries || []).map(apiInquiry),
        leads: (leads || []).map((lead) => apiLead(lead, inquiryByLeadId, tasksByLeadId)),
        attachments: attachments || [],
      });
      return;
    }

    if (request.method === "PATCH") {
      const body = parseBody(request);
      const leadId = body.id || body.lead_id;
      if (!leadId) {
        sendJson(response, 400, { error: "lead_id is required." });
        return;
      }
      const status = normalizeLeadStatus(body.status);
      const { data: existingLead, error: existingLeadError } = await supabase
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .single();
      if (existingLeadError) throw existingLeadError;
      const { data, error } = await supabase
        .from("leads")
        .update({
          status,
          metadata: {
            ...(existingLead.metadata || {}),
            ...(body.metadata || {}),
            manual_review_required: true,
            last_status_update_note: body.note || "",
          },
        })
        .eq("id", leadId)
        .select("*")
        .single();
      if (error) throw error;
      sendJson(response, 200, { lead: apiLead(data), safety_boundary: "Lead status update only. No customer message was sent." });
      return;
    }

    if (request.method === "POST") {
      const { normalizeWebsiteForm, analyzeInquiry, InquiryStatus } = await import("../lib/mock-crm.js");
      const body = parseBody(request);
      if (body.action === "convert_lead_to_customer") {
        const leadId = body.lead_id || body.id;
        if (!leadId) {
          sendJson(response, 400, { error: "lead_id is required." });
          return;
        }
        const { data: lead, error: leadError } = await supabase.from("leads").select("*").eq("id", leadId).single();
        if (leadError) throw leadError;
        if (lead.customer_id) {
          sendJson(response, 409, { error: "Lead is already linked to a customer." });
          return;
        }
        const { data: customer, error: customerError } = await supabase
          .from("customers")
          .insert(customerFromLead(lead))
          .select("*")
          .single();
        if (customerError) throw customerError;
        const { data: updatedLead, error: updateLeadError } = await supabase
          .from("leads")
          .update({
            customer_id: customer.id,
            status: "CONVERTED_TO_CUSTOMER",
            metadata: {
              ...(lead.metadata || {}),
              converted_to_customer_at: new Date().toISOString(),
              converted_customer_id: customer.id,
              manual_review_required: true,
            },
          })
          .eq("id", lead.id)
          .select("*")
          .single();
        if (updateLeadError) throw updateLeadError;
        const { error: inquiryUpdateError } = await supabase
          .from("inquiries")
          .update({ customer_id: customer.id })
          .eq("lead_id", lead.id);
        if (inquiryUpdateError) throw inquiryUpdateError;
        const { error: taskUpdateError } = await supabase
          .from("follow_up_tasks")
          .update({ customer_id: customer.id })
          .eq("lead_id", lead.id);
        if (taskUpdateError) throw taskUpdateError;
        sendJson(response, 200, {
          customer,
          lead: updatedLead,
          safety_boundary:
            "Manual conversion only. No automatic customer message, official quotation, PI, price, delivery time, payment terms, bank account, compensation or responsibility judgment.",
        });
        return;
      }
      const normalized = normalizeWebsiteForm(body.inquiry || body);
      const analysis = analyzeInquiry(normalized);
      const inquiry = {
        ...normalized,
        ...analysis,
        status: analysis.missing_info.length ? InquiryStatus.NEED_MORE_INFO : InquiryStatus.READY_TO_QUOTE,
        updated_at: new Date().toISOString(),
      };
      const followUpAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .insert(toCustomerInsert(inquiry))
        .select("*")
        .single();
      if (customerError) throw customerError;

      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .insert(toLeadInsert(inquiry, customer.id))
        .select("*")
        .single();
      if (leadError) throw leadError;

      const { data: createdInquiry, error: inquiryError } = await supabase
        .from("inquiries")
        .insert(toInquiryInsert(inquiry, customer.id, lead.id, followUpAt))
        .select("*")
        .single();
      if (inquiryError) throw inquiryError;

      const { data: task, error: taskError } = await supabase
        .from("follow_up_tasks")
        .insert(toTaskInsert(inquiry, customer.id, lead.id, createdInquiry.id, followUpAt))
        .select("*")
        .single();
      if (taskError) throw taskError;

      const attachmentInserts = toAttachmentInserts(inquiry, customer.id, lead.id, createdInquiry.id);
      let attachments = [];
      if (attachmentInserts.length) {
        const { data, error } = await supabase.from("attachments").insert(attachmentInserts).select("*");
        if (error) throw error;
        attachments = data || [];
      }

      sendJson(response, 201, {
        customer,
        lead,
        inquiry: apiInquiry(createdInquiry),
        follow_up_tasks: [task],
        attachments,
        safety_boundary:
          "Manual review required. No automatic customer message, official quotation, PI, price, delivery time, payment terms or bank account confirmation.",
      });
      return;
    }

    response.setHeader("Allow", "GET, PATCH, POST");
    sendJson(response, 405, { error: "Method not allowed" });
  } catch (error) {
    handleApiError(response, error);
  }
};
