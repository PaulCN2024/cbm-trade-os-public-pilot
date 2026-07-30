// api/inbound/website — 独立站表单 webhook（公网入口 · 上云最小切口 · 获客块B）
// ============================================================================
// POST    = (可选 x-cbm-secret 校验) → normalizeWebsiteLead(fbclid/utm 归因) → 落云 leads(status=NEED_REVIEW)。
// OPTIONS = CORS 预检（独立站从各自域名浏览器直传·需跨域）。
// 【范式】照 api/public-inquiries.js：CommonJS handler·getSupabaseAdminClient·leads 查重 upsert·NEED_REVIEW/manual_review_required/不自动发。
// 【CORS】公开接收端点·放开 Origin·门禁靠 x-cbm-secret（配了 WEBSITE_INBOUND_SECRET 才校验·本地/未配放行）。
// 【归因】fbclid/gclid/utm_* 随表单进 metadata（算广告 ROI + 未来 CAPI 回传备）。site 是浏览器自述·仅作展示标签·不定归属（防伪造）。
// 【单租户】leads 无 org_id；按站分 org_id + per-站 secret→org 是下一步。
// ============================================================================
const { getSupabaseAdminClient, parseBody, sendJson } = require("./_supabase");

function setCors(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "content-type, x-cbm-secret");
  response.setHeader("Access-Control-Max-Age", "86400");
}

// normalizeWebsiteLead 结果 → leads 行（照 public-inquiries.js leadInsert 的列）。
function leadFromWebsite(lead) {
  const f = lead.fields || {};
  const a = lead.attribution || {};
  const name = String(f["联系人"] || "").trim();
  const company = String(f["公司"] || "").trim();
  return {
    source: lead.channel || "website",   // fbclid→facebook / gclid→google / 否则 website
    status: "NEED_REVIEW",
    business_line: "",
    title: (company || name || "独立站询盘") + " · 网站表单",
    name, company,
    email: String(f["邮箱"] || "").trim(),
    whatsapp: String(f["WhatsApp"] || f["电话"] || "").trim(),
    country: String(f["国家地区"] || "").trim(),
    score: 0,
    summary: String(f["询价项"] || f["备注"] || "").slice(0, 2000),
    missing_info: [],
    metadata: {
      created_from: "api/inbound/website",
      manual_review_required: true,
      channel: lead.channel || "website",
      external_verified: false,
      site: a.site || "",
      fbclid: a.fbclid || "", gclid: a.gclid || "",
      utm_source: a.utm_source || "", utm_medium: a.utm_medium || "", utm_campaign: a.utm_campaign || "",
      utm_content: a.utm_content || "", utm_term: a.utm_term || "",
      landing_url: a.landing_url || "", referrer: a.referrer || "",
      lead_uid: lead.lead_uid || "",
      received_at: new Date().toISOString(),
    },
  };
}

module.exports = async function handler(request, response) {
  setCors(response);
  if (request.method === "OPTIONS") { response.status(204).send(""); return; }
  if (request.method !== "POST") { response.setHeader("Allow", "POST, OPTIONS"); sendJson(response, 405, { error: "Method not allowed" }); return; }
  try {
    const body = parseBody(request);
    const secret = String(process.env.WEBSITE_INBOUND_SECRET || "");
    if (secret) {
      const got = String(request.headers["x-cbm-secret"] || (body && body.secret) || "");
      if (got !== secret) { sendJson(response, 401, { ok: false, error: "secret mismatch" }); return; }
    }
    if (!body || (!body.email && !body["邮箱"] && !body.company && !body["公司"] && !body.name && !body["联系人"])) {
      sendJson(response, 200, { ok: false, error: "empty form (need company/name/email)" }); return;
    }
    const { normalizeWebsiteLead } = await import("../../lib/website-leadgen.js");
    const lead = normalizeWebsiteLead(body, { site: (body && body.site) || "" });
    const row = leadFromWebsite(lead);
    const supabase = getSupabaseAdminClient();
    // 去重：同来源同邮箱（有邮箱时）刷新·否则新建（单租户·leads 无 org_id）。
    let existing = null;
    if (row.email) {
      const r = await supabase.from("leads").select("*").eq("source", row.source).eq("email", row.email)
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      existing = r.data;
    }
    if (existing) {
      await supabase.from("leads").update({
        status: "NEED_REVIEW",
        summary: row.summary || existing.summary,
        metadata: { ...(existing.metadata || {}), last_web_at: row.metadata.received_at, manual_review_required: true },
      }).eq("id", existing.id);
    } else {
      await supabase.from("leads").insert(row);
    }
    sendJson(response, 200, { ok: true, channel: row.source, safety_boundary: "Manual review required. No automatic message sent; no quotation/price/PI." });
  } catch (error) {
    console.error("website inbound failed", { message: error && error.message });
    sendJson(response, 500, { ok: false, error: "submission failed" });
  }
};
