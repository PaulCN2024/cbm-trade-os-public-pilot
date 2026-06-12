const { getSupabaseClient, handleApiError, sendJson } = require("./_supabase");

async function countRows(supabase, table) {
  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
  if (error) throw error;
  return count || 0;
}

module.exports = async function handler(request, response) {
  try {
    if (request.method !== "GET") {
      response.setHeader("Allow", "GET");
      sendJson(response, 405, { error: "Method not allowed" });
      return;
    }

    const mode = process.env.NEXT_PUBLIC_DATA_MODE === "supabase" ? "supabase" : "mock";
    const result = {
      ok: true,
      service: "CBM Trade OS",
      mode,
      authenticated: false,
      supabase_url_configured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabase_publishable_key_configured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
      server_secret_key_configured: Boolean(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY),
      supabase_connected: mode === "mock" ? null : false,
      counts: {
        leads: null,
        customers: null,
        inquiries: null,
        follow_up_tasks: null,
      },
      safety_boundary:
        "Admin health never exposes secrets and never sends customer messages, quotations, PI, prices, delivery terms, payment terms or bank details.",
    };

    const supabase = getSupabaseClient(request);
    const { data: userResult, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    result.authenticated = Boolean(userResult?.user);
    result.admin_email = userResult?.user?.email || "";

    if (mode === "supabase") {
      const [leads, customers, inquiries, followUps] = await Promise.all([
        countRows(supabase, "leads"),
        countRows(supabase, "customers"),
        countRows(supabase, "inquiries"),
        countRows(supabase, "follow_up_tasks"),
      ]);
      result.supabase_connected = true;
      result.counts = {
        leads,
        customers,
        inquiries,
        follow_up_tasks: followUps,
      };
    }

    sendJson(response, 200, result);
  } catch (error) {
    handleApiError(response, error);
  }
};
