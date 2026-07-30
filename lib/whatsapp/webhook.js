// lib/whatsapp/webhook — Meta WhatsApp Cloud API webhook 验证 + 验签（纯逻辑·无 IO·可 A 轨单测）· WhatsApp 获客·块B
// ============================================================================
// Meta webhook 两件事：① GET 订阅验证握手（hub.verify_token）② POST 消息验签（X-Hub-Signature-256）。
// 都是纯函数——cbm-os.js 端点只做 IO 编排（读流/回响应/落库），验证/验签逻辑在此可单测（块E 护栏投毒测钉这里）。
// ============================================================================
import crypto from 'node:crypto';

// GET 订阅验证握手：Meta 订阅 webhook 时打 GET ?hub.mode=subscribe&hub.verify_token=X&hub.challenge=Y。
// 校验 verify_token 匹配（且 mode=subscribe）→ 回显 challenge 明文；不匹配 → 拒。
export function parseVerifyChallenge(query, verifyToken) {
  const q = query || {};
  const mode = q['hub.mode'] || q.hub_mode;
  const token = q['hub.verify_token'] || q.hub_verify_token;
  const challenge = q['hub.challenge'] || q.hub_challenge;
  if (mode === 'subscribe' && verifyToken && token === verifyToken) {
    return { ok: true, challenge: String(challenge == null ? '' : challenge) };
  }
  return { ok: false, error: 'hub.verify_token 不匹配或 mode 非 subscribe' };
}

// POST 消息验签：X-Hub-Signature-256: sha256=<hex> == HMAC-SHA256(rawBody, appSecret)。
//   timingSafeEqual 防时序侧信道；appSecret 未配 → reason:'no-secret'（调用方决定本机是否放行·生产必配）。
export function verifyMetaSignature(rawBody, signatureHeader, appSecret) {
  if (!appSecret) return { ok: false, reason: 'no-secret' };
  const m = String(signatureHeader == null ? '' : signatureHeader).match(/^sha256=([a-f0-9]+)$/i);
  if (!m) return { ok: false, reason: 'bad-format' };
  const expected = crypto.createHmac('sha256', appSecret).update(rawBody == null ? '' : rawBody, 'utf8').digest('hex');
  let a, b;
  try { a = Buffer.from(m[1], 'hex'); b = Buffer.from(expected, 'hex'); } catch { return { ok: false, reason: 'bad-format' }; }
  if (a.length === 0 || a.length !== b.length) return { ok: false, reason: 'mismatch' };
  return crypto.timingSafeEqual(a, b) ? { ok: true } : { ok: false, reason: 'mismatch' };
}

// 便于本机/测试造签名：用 appSecret 对 rawBody 生成合法 X-Hub-Signature-256 头值（生产由 Meta 生成·此仅测试/本机 mock 用）。
export function signMetaBody(rawBody, appSecret) {
  return 'sha256=' + crypto.createHmac('sha256', appSecret || '').update(rawBody == null ? '' : rawBody, 'utf8').digest('hex');
}
