const { getSupabaseClient, handleApiError, sendJson } = require("./_supabase");

module.exports = async function handler(request, response) {
  try {
    if (request.method !== "GET") {
      response.setHeader("Allow", "GET");
      sendJson(response, 405, { error: "Method not allowed" });
      return;
    }
    const supabase = getSupabaseClient(request);
    const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    sendJson(response, 200, { customers: data || [] });
  } catch (error) {
    handleApiError(response, error);
  }
};
