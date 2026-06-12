const { createClient } = require("@supabase/supabase-js");

function getSupabaseClient(request) {
  const authorization = request.headers.authorization || request.headers.Authorization || "";
  if (!authorization) {
    const error = new Error("Supabase admin API requires an authenticated Bearer token.");
    error.statusCode = 401;
    throw error;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    const error = new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
    error.statusCode = 500;
    throw error;
  }

  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: authorization,
      },
    },
  });
}

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    const error = new Error("Missing NEXT_PUBLIC_SUPABASE_URL and server-only SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY");
    error.statusCode = 500;
    throw error;
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function sendJson(response, status, payload) {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  response.status(status).send(JSON.stringify(payload));
}

function handleApiError(response, error) {
  const status = error.statusCode || error.status || 500;
  sendJson(response, status, {
    error: error.message || "Unexpected API error",
    safety_boundary: "No automatic customer messages, official quotations, PI, prices, delivery time, payment terms or bank account confirmation.",
  });
}

function parseBody(request) {
  if (!request.body) return {};
  if (typeof request.body === "string") {
    try {
      return JSON.parse(request.body);
    } catch {
      return {};
    }
  }
  return request.body;
}

module.exports = {
  getSupabaseAdminClient,
  getSupabaseClient,
  handleApiError,
  parseBody,
  sendJson,
};
