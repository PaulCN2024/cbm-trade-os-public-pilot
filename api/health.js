const { sendJson } = require("./_supabase");

module.exports = function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  sendJson(response, 200, {
    ok: true,
    service: "CBM Trade OS",
    mode: process.env.NEXT_PUBLIC_DATA_MODE === "supabase" ? "supabase" : "mock",
  });
};
