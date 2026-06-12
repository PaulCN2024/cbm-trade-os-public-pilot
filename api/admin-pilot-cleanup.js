const { getSupabaseClient, handleApiError, parseBody, sendJson } = require("./_supabase");

const CONFIRM_PHRASE = "DELETE PILOT TEST DATA";
const TABLES = ["attachments", "follow_up_tasks", "inquiries", "leads", "customers"];

async function countRows(supabase, table) {
  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
  if (error) throw error;
  return count || 0;
}

async function deleteRows(supabase, table) {
  const { error } = await supabase.from(table).delete().not("id", "is", null);
  if (error) throw error;
}

module.exports = async function handler(request, response) {
  try {
    const supabase = getSupabaseClient(request);
    const { data: userResult, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!userResult?.user) {
      sendJson(response, 401, { error: "Admin cleanup requires an authenticated admin session." });
      return;
    }

    if (request.method === "GET") {
      const counts = {};
      for (const table of TABLES) counts[table] = await countRows(supabase, table);
      sendJson(response, 200, {
        ok: true,
        mode: process.env.NEXT_PUBLIC_DATA_MODE === "supabase" ? "supabase" : "mock",
        admin_email: userResult.user.email || "",
        counts,
        confirmation_required: CONFIRM_PHRASE,
        warning: "Development / pilot cleanup only. This deletes pilot Supabase rows for the front CRM pilot tables.",
        safety_boundary:
          "Cleanup never sends customer messages, quotations, PI, prices, delivery terms, payment terms, bank details, compensation promises or responsibility judgments.",
      });
      return;
    }

    if (request.method === "DELETE") {
      const body = parseBody(request);
      if (body.confirm_phrase !== CONFIRM_PHRASE) {
        sendJson(response, 400, {
          ok: false,
          error: `Confirmation phrase required: ${CONFIRM_PHRASE}`,
        });
        return;
      }
      const before = {};
      const after = {};
      for (const table of TABLES) before[table] = await countRows(supabase, table);
      for (const table of TABLES) await deleteRows(supabase, table);
      for (const table of TABLES) after[table] = await countRows(supabase, table);
      sendJson(response, 200, {
        ok: true,
        deleted_from: TABLES,
        before,
        after,
        warning: "Pilot cleanup completed. Do not use this as a production customer data deletion workflow.",
      });
      return;
    }

    response.setHeader("Allow", "GET, DELETE");
    sendJson(response, 405, { error: "Method not allowed" });
  } catch (error) {
    handleApiError(response, error);
  }
};
