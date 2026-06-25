// GET /api/admin-read/knowledge-context?customer=&product=
//
// Returns Obsidian-derived quoting context for the admin console.
// Requires admin authentication (Supabase Bearer token), mirroring the auth
// approach used by api/admin-read.js and api/admin-health.js.
//
// Obsidian being offline must never break the request: in that case the
// endpoint responds 200 with { online: false, context: "" } instead of erroring.

const { getSupabaseClient, handleApiError, sendJson } = require("../_supabase");
const { isObsidianOnline } = require("../../lib/services/knowledge/obsidian-client");
const { buildQuoteContext } = require("../../lib/services/knowledge");

module.exports = async function handler(request, response) {
  try {
    if (request.method !== "GET") {
      response.setHeader("Allow", "GET");
      sendJson(response, 405, { error: "Method not allowed" });
      return;
    }

    // Require admin auth. getSupabaseClient throws 401 without a Bearer token.
    const supabase = getSupabaseClient(request);
    const { data: userResult, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!userResult?.user) {
      const error = new Error("Supabase admin API requires an authenticated Bearer token.");
      error.statusCode = 401;
      throw error;
    }

    const query = request.query || {};
    const customerName = String(query.customer || "").trim();
    const product = String(query.product || "").trim();

    // Obsidian offline → graceful, non-error response.
    if (!(await isObsidianOnline())) {
      sendJson(response, 200, { online: false, context: "" });
      return;
    }

    const productKeywords = product
      ? product.split(/[\s,，、]+/).filter(Boolean)
      : [];

    let context = "";
    try {
      context = await buildQuoteContext({ customerName, productKeywords });
    } catch {
      // Any knowledge-layer failure degrades to empty context, never a 500.
      context = "";
    }

    sendJson(response, 200, {
      online: true,
      context: typeof context === "string" ? context : "",
    });
  } catch (error) {
    handleApiError(response, error);
  }
};
