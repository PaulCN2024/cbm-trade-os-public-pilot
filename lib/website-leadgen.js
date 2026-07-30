// 独立站表单线索归一（Facebook / Google 推广 → 独立站落地页 → 表单提交 → 本系统待拍板）。
// ============================================================================
// 【场景】Paul 的几个独立站接 Facebook/Google 广告引流：广告 → 落地页(带 Pixel + fbclid/utm) → 访客留资表单。
//   表单提交把「字段 + fbclid/utm 归因 + 站标识」POST 到 /api/inbound/website → 归一成待拍板线索。
// 【纯逻辑·零 IO/零 secret】：只做字段映射 + 归因解析；secret 校验、落库、人确认在 cbm-os.js（守人确认铁律）。
// 【归因贯穿】fbclid(Facebook 点击 id) / gclid(Google) / utm_* 一路带进 provenance，为算「哪条广告值」+ 未来 CAPI 回传备。
// 【外部·未核实】表单是访客自填的外部数据 → external:true / verified:false，人确认才入库（同 Meta 即时表单线索同池）。
// ============================================================================

const s = (v, n) => (v == null ? '' : String(v).slice(0, n || 200));

// 表单字段 → 标准线索字段（中文键·对齐 addIntakeDraft 的 proposed）。兼容常见英文/中文表单字段名。
export function mapWebsiteFields(body) {
  body = body || {};
  const g = (...keys) => {
    for (const k of keys) { const v = body[k]; if (v != null && String(v).trim()) return String(v).trim(); }
    return '';
  };
  return {
    公司: s(g('company', '公司', 'company_name', 'organization', 'org'), 120),
    联系人: s(g('name', '联系人', 'contact', 'full_name', 'contact_name', 'fullname'), 80),
    邮箱: s(g('email', '邮箱', 'e-mail', 'mail'), 120),
    电话: s(g('phone', '电话', 'tel', 'whatsapp', 'mobile', 'telephone'), 60),
    国家: s(g('country', '国家', 'country_region', 'region'), 60),
    需求: s(g('message', '需求', 'inquiry', 'requirement', 'comments', 'note', 'msg', 'content'), 1000),
  };
}

// fbclid / gclid / utm_* 归因解析。来源优先级：body 顶层 → body.utm/_tracking → landing_url 的 query。
export function parseAttribution(body, site) {
  body = body || {};
  const src = Object.assign({}, body, body.utm || {}, body._tracking || {});
  const q = {};
  const urlStr = body.landing_url || body.page_url || '';
  if (urlStr) { try { new URL(urlStr).searchParams.forEach((v, k) => { if (!(k in src)) q[k] = v; }); } catch { /* 非法 url 忽略 */ } }
  const pick = (...keys) => {
    for (const k of keys) { const v = src[k] != null ? src[k] : q[k]; if (v != null && String(v).trim()) return String(v).trim(); }
    return '';
  };
  return {
    site: s(site || body.site || body.source_site, 60),
    fbclid: s(pick('fbclid'), 200),                       // Facebook 点击 id（CAPI 回传、算 FB 广告 ROI 用）
    gclid: s(pick('gclid'), 200),                         // Google 点击 id
    utm_source: s(pick('utm_source'), 60),
    utm_medium: s(pick('utm_medium'), 60),
    utm_campaign: s(pick('utm_campaign'), 120),
    utm_content: s(pick('utm_content'), 120),
    utm_term: s(pick('utm_term'), 120),
    referrer: s(body.referrer || body.referer, 200),
    landing_url: s(urlStr, 300),
  };
}

// 归一成待拍板线索。channel：有 fbclid→facebook / 有 gclid→google / 否则 website。
// lead_uid（去重键）：邮箱优先，否则 站+公司/联系人（避免同一表单被刷重复入池）。
export function normalizeWebsiteLead(body, opts) {
  opts = opts || {};
  const fields = mapWebsiteFields(body);
  const attribution = parseAttribution(body, opts.site);
  const channel = attribution.fbclid ? 'facebook' : (attribution.gclid ? 'google' : 'website');
  const key = fields.邮箱 || (attribution.site + ':' + (fields.公司 || fields.联系人 || ''));
  return {
    fields,
    attribution,
    channel,
    source: 'website:' + (attribution.site || 'site'),
    lead_uid: s(key, 160),
  };
}
