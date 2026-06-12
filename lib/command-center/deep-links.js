const TRADE_OS_PATH = "/trade-os-prototype";

export function buildTradeOsLink(view, params = {}) {
  const search = new URLSearchParams();
  search.set("view", view);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  });
  return `${TRADE_OS_PATH}?${search.toString()}`;
}

export function documentCenterLink(params = {}) {
  return buildTradeOsLink("documents", {
    draft_id: params.draft_id,
    document_id: params.document_id,
    document_type: params.document_type,
    customer_id: params.customer_id,
    project_id: params.project_id,
    command_id: params.command_id,
    command_summary: params.command_summary,
  });
}

export function customer360Link(customerId, params = {}) {
  return buildTradeOsLink("customer-360", {
    customer_id: customerId,
    command_id: params.command_id,
    command_summary: params.command_summary,
  });
}

export function inquiryLink(inquiryId, params = {}) {
  return buildTradeOsLink("inquiries", {
    inquiry_id: inquiryId,
    command_id: params.command_id,
    command_summary: params.command_summary,
  });
}

export function leadReviewLink(leadId, params = {}) {
  return buildTradeOsLink("lead-review", {
    lead_id: leadId,
    command_id: params.command_id,
    command_summary: params.command_summary,
  });
}

export function followUpWorkbenchLink(params = {}) {
  return buildTradeOsLink("follow-ups", {
    task_id: params.task_id,
    filter: params.filter,
    customer_id: params.customer_id,
    inquiry_id: params.inquiry_id,
    command_id: params.command_id,
    command_summary: params.command_summary,
  });
}
