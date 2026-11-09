'use strict';

const PRODUCTION_ORIGIN = 'https://app.restora.live';
const INTERNAL_ORIGINS = new Set([PRODUCTION_ORIGIN]);
const EXTERNAL_PROTOCOLS = new Set(['https:', 'mailto:', 'tel:']);

// Only a local development server can override the URL, never an arbitrary remote site.
function getAppUrl(env = process.env) {
  const fallback = PRODUCTION_ORIGIN + '/';
  if (env.RESTORA_DESKTOP_DEV !== '1' || !env.RESTORA_APP_URL) return fallback;
  try {
    const url = new URL(env.RESTORA_APP_URL);
    if (url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname) &&
        !url.username && !url.password) return url.href;
  } catch { /* invalid configuration is ignored */ }
  return fallback;
}

function isInternalUrl(raw, base = getAppUrl()) {
  try {
    const url = new URL(raw, base);
    const target = new URL(base);
    return url.origin === target.origin && (target.protocol === 'https:' ||
      (target.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(target.hostname)));
  } catch { return false; }
}

function isSafeExternalUrl(raw) {
  try {
    const url = new URL(raw);
    return EXTERNAL_PROTOCOLS.has(url.protocol) &&
      !url.username && !url.password &&
      (url.protocol !== 'https:' || Boolean(url.hostname));
  } catch { return false; }
}

module.exports = { getAppUrl, isInternalUrl, isSafeExternalUrl, PRODUCTION_ORIGIN, INTERNAL_ORIGINS };
