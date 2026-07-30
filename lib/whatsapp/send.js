// lib/whatsapp/send — WhatsApp Cloud API 发送（请求构造纯逻辑可测 + 执行）· WhatsApp 获客·块D
// ============================================================================
// 【红线·人确认才发】发送执行入口在 cbm-os.js 端点顶部钉 assertHumanConfirmed（AI 绝不自动发）。本模块只构造请求 + 执行 fetch·不含确认逻辑。
// 【凭据】token/phoneNumberId 由调用方从 env 取（getWhatsapp*·绝不入日志/回显）。fetchImpl 可注入便于单测（不真打网络）。
// Cloud API：POST /{PHONE_NUMBER_ID}/messages · Bearer {WHATSAPP_TOKEN} · body messaging_product=whatsapp。
// ============================================================================
const GRAPH = 'https://graph.facebook.com/v21.0';

export function buildSendUrl(phoneNumberId, base) {
  return (base || GRAPH) + '/' + encodeURIComponent(String(phoneNumberId || '')) + '/messages';
}

// 文本消息请求体（Cloud API 规范）。to=客户 wa_id·body=回复正文（≤4096）。
export function buildSendTextPayload(to, text) {
  return {
    messaging_product: 'whatsapp', recipient_type: 'individual',
    to: String(to || ''), type: 'text',
    text: { preview_url: false, body: String(text || '').slice(0, 4096) },
  };
}

// 执行发送（真调 Cloud API）。返回 { ok, messageId } 或 { ok:false, error }。绝不把 token 放进任何返回/日志。
export async function sendWhatsappText(opts) {
  const o = opts || {};
  if (!o.token) return { ok: false, error: '未配 WHATSAPP_TOKEN（在 .env.local / 设置页填 Cloud API 永久 token）。' };
  if (!o.phoneNumberId) return { ok: false, error: '未配 WHATSAPP_PHONE_NUMBER_ID。' };
  if (!o.to) return { ok: false, error: '缺收件人 wa_id。' };
  if (!String(o.text || '').trim()) return { ok: false, error: '空回复内容。' };
  const f = o.fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  if (!f) return { ok: false, error: '运行环境无 fetch。' };
  let resp, json;
  try {
    resp = await f(buildSendUrl(o.phoneNumberId, o.base), {
      method: 'POST',
      headers: { authorization: 'Bearer ' + o.token, 'content-type': 'application/json' },
      body: JSON.stringify(buildSendTextPayload(o.to, o.text)),
    });
    json = await resp.json().catch(() => ({}));
  } catch (e) { return { ok: false, error: '发送失败：' + String((e && e.message) || e) }; }
  if (json && json.error) return { ok: false, error: 'Cloud API 错误：' + String(json.error.message || json.error.type || '发送失败') + '（检查 token 权限 / 号码状态 / 是否超窗）' };
  const messageId = (json && json.messages && json.messages[0] && json.messages[0].id) || '';
  return { ok: true, messageId };
}
