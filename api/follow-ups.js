const { getSupabaseClient, handleApiError, sendJson } = require("./_supabase");

module.exports = async function handler(request, response) {
  try {
    if (request.method !== "GET") {
      response.setHeader("Allow", "GET");
      sendJson(response, 405, { error: "Method not allowed" });
      return;
    }
    const supabase = getSupabaseClient(request);
    const { data, error } = await supabase
      .from("follow_up_tasks")
      .select("*")
      .order("next_follow_up_at", { ascending: true, nullsFirst: false });
    if (error) throw error;
    sendJson(response, 200, { follow_up_tasks: data || [] });
  } catch (error) {
    handleApiError(response, error);
  }
};
