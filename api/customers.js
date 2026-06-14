const { getSupabaseClient, handleApiError, parseBody, sendJson } = require("./_supabase");
const {
  safetyBoundaryPayload,
  sanitizeAiInquiryAnalysisInput,
  sanitizeCompanyInput,
  sanitizeManufacturingCapabilityInput,
  sanitizeProductInput,
} = require("../lib/api-validation.js");

const CRM_RESOURCES = {
  companies: {
    table: "companies",
    listKey: "companies",
    singleKey: "company",
    methods: "GET, POST, PATCH, PUT",
    sanitize: sanitizeCompanyInput,
    requiredOnCreate: "company_name",
    bodyKey: "company",
  },
  products: {
    table: "products",
    listKey: "products",
    singleKey: "product",
    methods: "GET, POST, PATCH, PUT",
    sanitize: sanitizeProductInput,
    bodyKey: "product",
  },
  "manufacturing-capabilities": {
    table: "manufacturing_capabilities",
    listKey: "manufacturing_capabilities",
    singleKey: "manufacturing_capability",
    methods: "GET, POST, PATCH, PUT",
    sanitize: sanitizeManufacturingCapabilityInput,
    bodyKey: "manufacturing_capability",
  },
  "ai-inquiry-analyses": {
    table: "ai_inquiry_analyses",
    listKey: "ai_inquiry_analyses",
    singleKey: "ai_inquiry_analysis",
    methods: "GET, POST, PATCH, PUT",
    sanitize: sanitizeAiInquiryAnalysisInput,
    bodyKey: "ai_inquiry_analysis",
  },
};

function getQueryValue(request, key) {
  if (request.query?.[key]) return request.query[key];
  try {
    return new URL(request.url, "http://localhost").searchParams.get(key);
  } catch {
    return "";
  }
}

function getQueryId(request) {
  return getQueryValue(request, "id");
}

function getCrmResource(request) {
  const explicitResource = getQueryValue(request, "crm_resource");
  if (explicitResource) return explicitResource;
  const pathname = new URL(request.url || "/", "http://localhost").pathname.replace(/^\/api\//, "");
  return CRM_RESOURCES[pathname] ? pathname : "";
}

async function handleCrmResource(request, response, supabase, resourceName) {
  const resource = CRM_RESOURCES[resourceName];
  if (!resource) return false;

  if (request.method === "GET") {
    const id = getQueryId(request);
    const query = supabase.from(resource.table).select("*");
    const { data, error } = id
      ? await query.eq("id", id).single()
      : await query.order("created_at", { ascending: false });
    if (error) throw error;
    sendJson(response, 200, id ? { [resource.singleKey]: data } : { [resource.listKey]: data || [] });
    return true;
  }

  if (request.method === "POST") {
    const body = parseBody(request);
    const input = resource.sanitize(body[resource.bodyKey] || body);
    if (resource.requiredOnCreate && !input[resource.requiredOnCreate]) {
      sendJson(response, 400, { error: `${resource.requiredOnCreate} is required.` });
      return true;
    }
    const { data, error } = await supabase.from(resource.table).insert(input).select("*").single();
    if (error) throw error;
    sendJson(response, 201, { [resource.singleKey]: data, ...safetyBoundaryPayload() });
    return true;
  }

  if (request.method === "PATCH" || request.method === "PUT") {
    const body = parseBody(request);
    const id = body.id || getQueryId(request);
    if (!id) {
      sendJson(response, 400, { error: "id is required." });
      return true;
    }
    const input = resource.sanitize(body[resource.bodyKey] || body, { partial: true });
    const { data, error } = await supabase.from(resource.table).update(input).eq("id", id).select("*").single();
    if (error) throw error;
    sendJson(response, 200, { [resource.singleKey]: data, ...safetyBoundaryPayload() });
    return true;
  }

  response.setHeader("Allow", resource.methods);
  sendJson(response, 405, { error: "Method not allowed" });
  return true;
}

module.exports = async function handler(request, response) {
  try {
    const supabase = getSupabaseClient(request);
    const crmResource = getCrmResource(request);
    if (crmResource && (await handleCrmResource(request, response, supabase, crmResource))) {
      return;
    }

    if (request.method !== "GET") {
      response.setHeader("Allow", "GET");
      sendJson(response, 405, { error: "Method not allowed" });
      return;
    }

    const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    sendJson(response, 200, { customers: data || [] });
  } catch (error) {
    handleApiError(response, error);
  }
};
