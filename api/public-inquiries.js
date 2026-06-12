const { getSupabaseAdminClient, handleApiError, parseBody, sendJson } = require("./_supabase");

const MAX_MESSAGE_LENGTH = 5000;
const MAX_ATTACHMENT_COUNT = 10;
const MAX_SHORT_FIELD_LENGTH = 180;
const MAX_TITLE_LENGTH = 260;

function emailLooksValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ""));
}

function clientMeta(request) {
  return {
    source_ip:
      request.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      request.headers["x-real-ip"] ||
      request.socket?.remoteAddress ||
      "",
    user_agent: request.headers["user-agent"] || "",
    origin: request.headers.origin || "",
    referer: request.headers.referer || request.headers.referrer || "",
  };
}

function tooLong(value, limit) {
  return String(value || "").length > limit;
}

function rateLimitPlaceholder(request) {
  const meta = clientMeta(request);
  return {
    allowed: true,
    key: `${meta.source_ip || "unknown"}:${new Date().toISOString().slice(0, 13)}`,
    note: "TODO: replace with durable IP/email rate limiting before production.",
  };
}

function validatePublicInquiry(input) {
  const errors = [];
  const leadInfo = input.lead_info || {};
  const name = leadInfo.name || input.name || "";
  const company = leadInfo.company || input.company || "";
  const email = leadInfo.email || input.email || "";
  const country = leadInfo.country || input.country || "";
  const projectType = input.project_type || input.projectType || "";
  const details = input.project_description || input.details || "";
  const honeypot = input.website || input.homepage || input.company_website_hidden || "";
  const attachments = Array.isArray(input.attachment_names)
    ? input.attachment_names
    : String(input.files || input.attachment_names || "")
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean);

  if (honeypot) errors.push("Spam protection rejected the submission.");
  if (!name.trim()) errors.push("Name is required.");
  if (!company.trim()) errors.push("Company is required.");
  if (!emailLooksValid(email)) errors.push("A valid email is required.");
  if (!country.trim()) errors.push("Country is required.");
  if (!projectType.trim()) errors.push("Project type is required.");
  if (!details.trim()) errors.push("Project details are required.");
  if (String(details).length > MAX_MESSAGE_LENGTH) errors.push(`Project details must be ${MAX_MESSAGE_LENGTH} characters or less.`);
  if (attachments.length > MAX_ATTACHMENT_COUNT) errors.push(`Attachment metadata is limited to ${MAX_ATTACHMENT_COUNT} files.`);
  if (tooLong(name, MAX_SHORT_FIELD_LENGTH)) errors.push("Name is too long.");
  if (tooLong(company, MAX_SHORT_FIELD_LENGTH)) errors.push("Company is too long.");
  if (tooLong(email, MAX_SHORT_FIELD_LENGTH)) errors.push("Email is too long.");
  if (tooLong(country, MAX_SHORT_FIELD_LENGTH)) errors.push("Country is too long.");
  if (tooLong(projectType, MAX_TITLE_LENGTH)) errors.push("Project type is too long.");
  if (tooLong(input.destination_port || input.destination, MAX_SHORT_FIELD_LENGTH)) errors.push("Destination port is too long.");
  if (tooLong(input.material_finish || input.finish, MAX_TITLE_LENGTH)) errors.push("Material / finish is too long.");

  return { errors, attachments };
}

function leadInsert(inquiry) {
  const leadInfo = inquiry.lead_info || {};
  return {
    source: "website",
    status: "NEED_REVIEW",
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
      created_from: "api/public-inquiries",
      manual_review_required: true,
      is_test: Boolean(inquiry.is_test || inquiry.original_submission?.is_test),
      website_submission_key: inquiry.website_submission_key || "",
    },
  };
}

function inquiryInsert(inquiry, leadId, followUpAt, meta) {
  return {
    lead_id: leadId,
    customer_id: null,
    source: "website",
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
      is_test: Boolean(inquiry.is_test || inquiry.original_submission?.is_test),
      source_ip: meta.source_ip,
      user_agent: meta.user_agent,
      origin: meta.origin,
      referer: meta.referer,
      rate_limit_todo: "TODO: add durable IP/email rate limiting before production.",
    },
  };
}

function taskInsert(inquiry, leadId, inquiryId, followUpAt) {
  const missing = inquiry.missing_info || [];
  return {
    lead_id: leadId,
    inquiry_id: inquiryId,
    customer_id: null,
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
      source: "public_website",
      is_test: Boolean(inquiry.is_test || inquiry.original_submission?.is_test),
      safety_boundary: "No automatic customer message was sent.",
    },
  };
}

function attachmentInserts(inquiry, leadId, inquiryId) {
  return (inquiry.attachment_names || []).map((fileName) => ({
    lead_id: leadId,
    inquiry_id: inquiryId,
    customer_id: null,
    file_name: fileName,
    file_type: String(fileName).split(".").pop() || "unknown",
    source: "website",
    metadata: {
      storage_status: "metadata_only",
      manual_review_required: true,
      is_test: Boolean(inquiry.is_test || inquiry.original_submission?.is_test),
    },
  }));
}

module.exports = async function handler(request, response) {
  try {
    if (request.method !== "POST") {
      response.setHeader("Allow", "POST");
      sendJson(response, 405, { error: "Method not allowed" });
      return;
    }

    const body = parseBody(request);
    const raw = body.inquiry || body;
    const rateLimit = rateLimitPlaceholder(request);
    if (!rateLimit.allowed) {
      sendJson(response, 429, { ok: false, errors: ["Too many submissions. Please try again later."] });
      return;
    }
    const { errors } = validatePublicInquiry(raw);
    if (errors.length) {
      sendJson(response, 400, { ok: false, errors });
      return;
    }

    const { normalizeWebsiteForm, normalizeBusinessLine, analyzeInquiry, InquiryStatus } = await import("../lib/mock-crm.js");
    const normalized = normalizeWebsiteForm({
      ...raw,
      source: "website",
      business_line: normalizeBusinessLine(raw.business_line || raw.businessLine, raw.project_type || raw.projectType),
      created_at: new Date().toISOString(),
    });
    const analysis = analyzeInquiry(normalized);
    const inquiry = {
      ...normalized,
      ...analysis,
      status: analysis.missing_info.length ? InquiryStatus.NEED_MORE_INFO : InquiryStatus.READY_TO_QUOTE,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const supabase = getSupabaseAdminClient();
    const meta = clientMeta(request);
    const followUpAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const leadInfo = inquiry.lead_info || {};

    const { data: existingLead, error: findLeadError } = await supabase
      .from("leads")
      .select("*")
      .eq("source", "website")
      .eq("email", leadInfo.email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (findLeadError) throw findLeadError;

    let lead = existingLead;
    if (lead) {
      const { data, error } = await supabase
        .from("leads")
        .update({
          ...leadInsert(inquiry),
          score: Math.max(Number(lead.score || 0), Number(inquiry.score || 0)),
          metadata: {
            ...(lead.metadata || {}),
            last_public_inquiry_at: inquiry.created_at,
            manual_review_required: true,
          },
        })
        .eq("id", lead.id)
        .select("*")
        .single();
      if (error) throw error;
      lead = data;
    } else {
      const { data, error } = await supabase.from("leads").insert(leadInsert(inquiry)).select("*").single();
      if (error) throw error;
      lead = data;
    }

    const { data: createdInquiry, error: inquiryError } = await supabase
      .from("inquiries")
      .insert(inquiryInsert(inquiry, lead.id, followUpAt, meta))
      .select("id")
      .single();
    if (inquiryError) throw inquiryError;

    const { error: taskError } = await supabase
      .from("follow_up_tasks")
      .insert(taskInsert(inquiry, lead.id, createdInquiry.id, followUpAt));
    if (taskError) throw taskError;

    const attachmentRows = attachmentInserts(inquiry, lead.id, createdInquiry.id);
    if (attachmentRows.length) {
      const { error } = await supabase.from("attachments").insert(attachmentRows);
      if (error) throw error;
    }

    sendJson(response, 201, {
      ok: true,
      message: "Inquiry received for manual review.",
      safety_boundary:
        "Manual review required. No automatic customer message, official quotation, PI, price, delivery time, payment terms, bank account, compensation or responsibility judgment.",
    });
  } catch (error) {
    console.error("Public inquiry submission failed", {
      message: error.message,
      status: error.status || error.statusCode,
    });
    sendJson(response, 500, {
      ok: false,
      errors: ["Inquiry submission failed. Please contact CBM manually if the problem continues."],
    });
  }
};
