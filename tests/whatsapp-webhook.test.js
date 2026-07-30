// WhatsApp 获客对接·块B · webhook 验证/验签纯逻辑测（A 轨）+ 块E 护栏投毒测（篡改 body/签名 must 失败）。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseVerifyChallenge, verifyMetaSignature, signMetaBody } from '../lib/whatsapp/webhook.js';

test('GET 验证握手：verify_token 匹配 + mode=subscribe → 回显 challenge', () => {
  const r = parseVerifyChallenge({ 'hub.mode': 'subscribe', 'hub.verify_token': 'my-token', 'hub.challenge': '12345' }, 'my-token');
  assert.equal(r.ok, true); assert.equal(r.challenge, '12345');
});

test('GET 验证握手：token 不匹配 / 未配 token / mode 非 subscribe → 拒', () => {
  assert.equal(parseVerifyChallenge({ 'hub.mode': 'subscribe', 'hub.verify_token': 'wrong', 'hub.challenge': 'x' }, 'my-token').ok, false);
  assert.equal(parseVerifyChallenge({ 'hub.mode': 'subscribe', 'hub.verify_token': 'any', 'hub.challenge': 'x' }, '').ok, false, '未配 verify_token 恒拒（不许空 token 放行）');
  assert.equal(parseVerifyChallenge({ 'hub.mode': 'other', 'hub.verify_token': 'my-token' }, 'my-token').ok, false);
});

test('POST 验签：合法签名通过（signMetaBody 回环）', () => {
  const secret = 'app-secret-xyz', body = JSON.stringify({ entry: [{ id: '1', changes: [] }] });
  assert.equal(verifyMetaSignature(body, signMetaBody(body, secret), secret).ok, true);
});

test('POST 验签·投毒：篡改 body / 篡改签名 / 错 secret → 全失败', () => {
  const secret = 'app-secret-xyz', body = JSON.stringify({ entry: [{ id: '1' }] });
  const good = signMetaBody(body, secret);
  assert.equal(verifyMetaSignature(body + 'x', good, secret).ok, false, '篡改 payload → 验签必失败');
  assert.equal(verifyMetaSignature(body, good.slice(0, -2) + 'ff', secret).ok, false, '篡改签名 → 失败');
  assert.equal(verifyMetaSignature(body, good, 'wrong-secret').ok, false, '错 app secret → 失败');
});

test('POST 验签：未配 secret → no-secret；格式非法 → bad-format', () => {
  assert.equal(verifyMetaSignature('{}', 'sha256=abc', '').reason, 'no-secret');
  assert.equal(verifyMetaSignature('{}', 'garbage', 'secret').reason, 'bad-format');
  assert.equal(verifyMetaSignature('{}', '', 'secret').reason, 'bad-format');
});
