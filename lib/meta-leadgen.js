// Meta 三入口获客 · 纯逻辑（零 I/O·零 token·可单测）——把三种来源的原始 payload 归一成【统一外部线索】。
// ============================================================================
// 三入口 → 一出口：①即时表单(Lead Ad) ②Click-to-WhatsApp(CTWA) ③引流网站 —— 全部 normalize 成同一形状，
//   复用现成线索池（addIntakeDraft·provenance.external → 待拍板 → 人确认 confirmIntakeDraft→saveLead）。
// 【红线·守死】本模块只 normalize + 构造官方 Graph API URL，【绝不落库、绝不发送、绝不投放】：
//   · verified:false 恒钉——外部·未核实，人确认才入客户库（saveLead 顶 assertNotAiTool）。
//   · 官方 API only（buildMetaLeadsUrl 只拼 graph.facebook.com·不爬任何页面）。
//   · 归因字段（source/campaign_id/ad_id/form_id/ctwa_clid）一路带着，算 ROI 用（块D 贯通·Phase 2 出看板）。
// ============================================================================

export const META_SOURCE_LABEL = { lead_form: '即时表单(Lead Ad)', whatsapp: 'Click-to-WhatsApp', website: '引流网站' };
export const META_CHANNEL = { lead_form: 'meta_lead_ad', whatsapp: 'ctwa', website: 'meta_website' };
const GRAPH_HOST = 'https://graph.facebook.com';
const GRAPH_VER = 'v21.0';

function s(v, n) { return v == null ? '' : String(v).slice(0, n || 200); }

// Meta Lead Ads 的 field_data（[{name, values:[]}]）→ 扁平 { name: value }
export function flattenLeadFieldData(fd) {
  const out = {};
  for (const f of (Array.isArray(fd) ? fd : [])) {
    const k = s(f && f.name, 60).toLowerCase();
    const v = Array.isArray(f && f.values) ? f.values[0] : (f && f.values);
    if (k) out[k] = v;
  }
  return out;
}

// Meta 字段名（Lead Ads 标准/自定义）→ CBM 线索字段（LEAD_FIELDS 中文形状）。
export function mapMetaFieldsToLead(f, source) {
  f = f || {};
  const g = (...ks) => { for (const k of ks) { const v = f[k]; if (v != null && v !== '') return s(v); } return ''; };
  return {
    公司: g('company_name', 'company', 'business_name', '公司'),
    联系人: g('full_name', 'name', 'first_name', '联系人', 'contact_name'),
    邮箱: g('email', 'work_email', '邮箱'),
    电话: g('phone_number', 'phone', 'work_phone', '电话'),
    WhatsApp: g('whatsapp', 'wa', 'phone_number'),
    国家地区: g('country', 'country_region', 'city', '国家地区'),
    产品线: g('product', 'product_line', 'what_product_are_you_interested_in', '产品线'),
    询价项: g('message', 'requirement', 'what_do_you_need', '询价项', 'comments'),
    来源: META_SOURCE_LABEL[source] || 'Meta 广告',
  };
}

// 三入口统一外部线索结构。input.source ∈ {lead_form, whatsapp, website}。
export function normalizeMetaLead(input) {
  input = input || {};
  const source = ['lead_form', 'whatsapp', 'website'].includes(input.source) ? input.source : 'lead_form';
  const attribution = {
    source,
    campaign_id: s(input.campaign_id, 60),
    adset_id: s(input.adset_id, 60),
    ad_id: s(input.ad_id, 60),
    form_id: s(input.form_id, 60),
    ctwa_clid: s(input.ctwa_clid, 120),
    utm: input.utm && typeof input.utm === 'object' ? input.utm : null,
  };
  const flat = source === 'lead_form' ? flattenLeadFieldData(input.field_data) : (input.fields || {});
  return {
    source,
    channel: META_CHANNEL[source],
    verified: false,                                  // 恒钉：外部·未核实
    fields: mapMetaFieldsToLead(flat, source),        // LEAD_FIELDS 形状
    attribution,
    lead_uid: s(input.lead_id || input.leadgen_id || input.ctwa_clid || input.id, 120),  // 去重键
    raw: input.raw || input,                          // 原始 payload 留档（不外发）
  };
}

// 归因 provenance（进 addIntakeDraft·external + 广告归因，块D 一路带到成交）。
export function metaLeadProvenance(lead) {
  const a = (lead && lead.attribution) || {};
  return {
    external: true, verified: false,
    channel: (lead && lead.channel) || 'meta_lead_ad',
    source: a.source || 'lead_form',
    campaign_id: a.campaign_id || '', ad_id: a.ad_id || '', form_id: a.form_id || '', ctwa_clid: a.ctwa_clid || '',
    lead_uid: (lead && lead.lead_uid) || '',   // 去重键（跨拉取：已入池的不重复）
    url: (a.utm && a.utm.url) || '',
  };
}

// 官方 Graph API 拉取 URL（只拼 graph.facebook.com·不爬）——GET /{form_id}/leads?access_token=&after=
// token 只进 URL query（HTTPS·同 Graph 规范）；调用方绝不把 token 记日志/回显（护栏测）。
export function buildMetaLeadsUrl(formId, token, opts) {
  opts = opts || {};
  const fields = 'id,created_time,field_data,ad_id,adset_id,campaign_id,form_id';
  const params = new URLSearchParams({ access_token: String(token || ''), fields, limit: String(opts.limit || 50) });
  if (opts.after) params.set('after', String(opts.after));
  return GRAPH_HOST + '/' + GRAPH_VER + '/' + encodeURIComponent(String(formId || '')) + '/leads?' + params.toString();
}

// 解析 Graph API /leads 响应 → normalize 后的线索数组 + 分页游标。
export function parseMetaLeadsResponse(json, formId) {
  const data = (json && Array.isArray(json.data)) ? json.data : [];
  const leads = data.map((row) => normalizeMetaLead({
    source: 'lead_form',
    lead_id: row.id, form_id: row.form_id || formId || '', ad_id: row.ad_id, adset_id: row.adset_id, campaign_id: row.campaign_id,
    field_data: row.field_data, raw: row,
  }));
  const after = json && json.paging && json.paging.cursors && json.paging.cursors.after;
  return { leads, after: after ? String(after) : '' };
}

// 去重：按 lead_uid（Graph lead id / ctwa_clid）过已见集合。
export function dedupeMetaLeads(leads, seenSet) {
  const seen = seenSet || new Set();
  const out = [];
  for (const l of (Array.isArray(leads) ? leads : [])) {
    const uid = l && l.lead_uid;
    if (uid && seen.has(uid)) continue;
    if (uid) seen.add(uid);
    out.push(l);
  }
  return out;
}

// CTWA 首条消息 referral → 归因（块C：从 WhatsApp 回灌的首条消息标"来自哪条广告"）。
export function ctwaReferralToAttribution(referral) {
  referral = referral || {};
  return {
    source: 'whatsapp',
    ctwa_clid: s(referral.ctwa_clid || referral.source_id, 120),
    ad_id: s(referral.source_id || referral.ad_id, 60),
    headline: s(referral.headline, 200),
    body: s(referral.body, 300),
    media_type: s(referral.media_type, 30),
    source_url: s(referral.source_url, 300),
  };
}

// Cloud API webhook 入站消息（含 referral·CTWA）→ 统一外部线索（复用 normalizeMetaLead·source:whatsapp）。
// Phase 1 结构就绪；实时 webhook 喂入在 Phase 2 上云（需公网 + verify token）。
export function normalizeCtwaMessage(msg, contact) {
  msg = msg || {}; contact = contact || {};
  const ref = ctwaReferralToAttribution(msg.referral || {});
  return normalizeMetaLead({
    source: 'whatsapp',
    ctwa_clid: ref.ctwa_clid, ad_id: ref.ad_id,
    fields: {
      full_name: contact.name || contact.profile_name || (contact.profile && contact.profile.name) || '',
      phone_number: contact.wa_id || contact.phone || msg.from || '',
      message: (msg.text && msg.text.body) || msg.body || ref.headline || '',
    },
    id: msg.id || msg.wamid || ref.ctwa_clid,
    raw: { msg, contact },
  });
}
