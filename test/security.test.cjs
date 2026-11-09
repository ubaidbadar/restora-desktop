'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { getAppUrl, isInternalUrl, isSafeExternalUrl } = require('../src/security.cjs');

test('production never trusts arbitrary remote configuration', () => {
  assert.equal(getAppUrl({ RESTORA_APP_URL: 'https://attacker.example' }), 'https://app.restora.live/');
  assert.equal(getAppUrl({ RESTORA_DESKTOP_DEV: '1', RESTORA_APP_URL: 'https://attacker.example' }), 'https://app.restora.live/');
});
test('only loopback development origins may override dashboard', () => {
  assert.equal(getAppUrl({ RESTORA_DESKTOP_DEV: '1', RESTORA_APP_URL: 'http://localhost:3000/' }), 'http://localhost:3000/');
  assert.equal(getAppUrl({ RESTORA_DESKTOP_DEV: '1', RESTORA_APP_URL: 'http://127.0.0.1:3000/' }), 'http://127.0.0.1:3000/');
  assert.equal(getAppUrl({ RESTORA_DESKTOP_DEV: '1', RESTORA_APP_URL: 'http://192.168.1.2:3000' }), 'https://app.restora.live/');
});
test('internal navigation is constrained to exact app origin', () => {
  assert.equal(isInternalUrl('/orders'), true);
  assert.equal(isInternalUrl('https://app.restora.live/whatsapp'), true);
  assert.equal(isInternalUrl('https://restora.live/'), false);
  assert.equal(isInternalUrl('https://app.restora.live.evil.test'), false);
  assert.equal(isInternalUrl('javascript:alert(1)'), false);
  assert.equal(isInternalUrl('file:///C:/secrets'), false);
});
test('external URL handler rejects unsafe schemes and embedded credentials', () => {
  assert.equal(isSafeExternalUrl('https://www.facebook.com/business'), true);
  assert.equal(isSafeExternalUrl('mailto:support@restora.live'), true);
  assert.equal(isSafeExternalUrl('file:///C:/windows/system32'), false);
  assert.equal(isSafeExternalUrl('javascript:alert(1)'), false);
  assert.equal(isSafeExternalUrl('https://user:pass@example.com'), false);
});
