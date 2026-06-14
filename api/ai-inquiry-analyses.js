const { getSupabaseClient, handleApiError, parseBody, sendJson } = require("./_supabase");
const { safetyBoundaryPayload, sanitizeAiInquiryAnalysisInput } = require("../lib/api-validation.js");

function getQueryId(request) {
  if (request.query?.id) return request.query.id;
  try {
    return new URL(request.url, "http://localhost").searchParams.get("id");
  } catch {
    return "";
  }
}

module.exports = async function handler(request, response) {
  try {
    const supabase = getSupabaseClient(request);

    if (request.method === "GET") {
      const id = getQueryId(request);
      const query = supabase.from("ai_inquiry_analyses").select("*");
      const { data, error } = id
        ? await query.eq("id", id).single()
        : await query.order("created_at", { ascending: false });
      if (error) throw error;
      sendJson(response, 200, id ? { ai_inquiry_analysis: data } : { ai_inquiry_analyses: data || [] });
      return;
    }

    if (request.method === "POST") {
      const input = sanitizeAiInquiryAnalysisInput(parseBody(request).ai_inquiry_analysis || parseBody(request));
      const { data, error } = await supabase.from("ai_inquiry_analyses").insert(input).select("*").single();
      if (error) throw error;
      sendJson(response, 201, { ai_inquiry_analysis: data, ...safetyBoundaryPayload() });
      return;
    }

    if (request.method === "PATCH" || request.method === "PUT") {
      const body = parseBody(request);
      const id = body.id || getQueryId(request);
      if (!id) {
        sendJson(response, 400, { error: "id is required." });
        return;
      }
      const input = sanitizeAiInquiryAnalysisInput(body.ai_inquiry_analysis || body, { partial: true });
      const { data, error } = await supabase
        .from("ai_inquiry_analyses")
        .update(input)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      sendJson(response, 200, { ai_inquiry_analysis: data, ...safetyBoundaryPayload() });
      return;
    }

    response.setHeader("Allow", "GET, POST, PATCH, PUT");
    sendJson(response, 405, { error: "Method not allowed" });
  } catch (error) {
    handleApiError(response, error);
  }
};
