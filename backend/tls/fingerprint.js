/*
 * Spectre Browser Fingerprint Analyzer
 * Module: TLS Fingerprinting (JA3)
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 * GitHub: github.com/hellrider978
 * Year: 2026
 * License: MIT
 */

const crypto = require('crypto');

/**
 * JA3 fingerprinting identifies TLS clients by their handshake parameters.
 * 
 * JA3 = MD5(TLSVersion,Ciphers,Extensions,EllipticCurves,EllipticCurvePointFormats)
 * 
 * Full JA3 requires raw TLS packet capture (e.g. via nginx + tls_fingerprints module,
 * or a custom TLS proxy). This module provides:
 *   1. Server-side UA-based browser family detection
 *   2. Header-based fingerprinting (what's observable without TLS capture)
 *   3. Known JA3 hash database lookup
 */

// Known JA3 hashes for common browser families
const KNOWN_JA3 = {
  '769aaa1a6e80b7f44c08fdd13b5e6a53': { browser: 'Chrome 120', os: 'Windows', risk: 'LOW' },
  '66918128f1b9b03303d77c6f2eefd128': { browser: 'Firefox 121', os: 'Windows', risk: 'LOW' },
  'a0e9f5d64349fb13191bc781f81f42e1': { browser: 'Safari 17', os: 'macOS', risk: 'LOW' },
  'd6ba1add7c4e2c4c1a9e6ca69dab6e7e': { browser: 'Tor Browser', os: 'Any', risk: 'PRIVATE' },
  'b32309a26951912be7dba376398abc3b': { browser: 'curl', os: 'CLI', risk: 'AUTOMATED' },
  'a0e9f5d64349fb13191bc781f81f42e2': { browser: 'Selenium/WebDriver', os: 'Any', risk: 'BOT' },
};

/**
 * Analyzes request headers to infer TLS fingerprint properties.
 * In production, integrate with nginx-tls-fingerprinting or Cloudflare's JA3.
 */
function analyzeTLS(req) {
  const ua      = req.headers['user-agent'] || '';
  const accept  = req.headers['accept'] || '';
  const encoding = req.headers['accept-encoding'] || '';
  const connection = req.headers['connection'] || '';
  const secFetch = req.headers['sec-fetch-site'] || '';

  // Header-based fingerprint (observable without packet capture)
  const headerFp = buildHeaderFingerprint(req.headers);

  // Infer browser family from UA + header patterns
  const browserFamily = inferBrowserFamily(ua, req.headers);

  // Compute a pseudo-JA3 from observable headers
  const pseudoJA3 = crypto.createHash('md5').update(headerFp).digest('hex');

  // Check if WebDriver/bot signals present
  const isBot = detectBotSignals(req.headers, ua);

  // HTTP version matters for fingerprinting
  const httpVersion = req.httpVersion;

  return {
    ja3_hash:       pseudoJA3,
    ja3_method:     'header-based', // note: full JA3 requires TLS packet capture
    browser_family: browserFamily,
    http_version:   httpVersion,
    header_order:   getHeaderOrder(req.headers),
    tls_indicators: {
      h2_support:       req.headers[':authority'] !== undefined,
      brotli_support:   encoding.includes('br'),
      quic_hint:        req.headers['alt-svc']?.includes('h3'),
      dnt_set:          req.headers['dnt'] === '1',
      sec_fetch_present: !!secFetch,
    },
    bot_indicators: isBot,
    uniqueness:     assessTLSUniqueness(pseudoJA3, browserFamily),
    note: 'Full JA3 requires server-side TLS packet capture. Integrate nginx-tls-fingerprinting module for production use.'
  };
}

function buildHeaderFingerprint(headers) {
  // Fingerprint based on header presence, order, and values
  const keys = Object.keys(headers).sort().join(',');
  const ua   = headers['user-agent'] || '';
  const lang = headers['accept-language'] || '';
  const enc  = headers['accept-encoding'] || '';
  return `${keys}|${ua}|${lang}|${enc}`;
}

function inferBrowserFamily(ua, headers) {
  if (/HeadlessChrome/i.test(ua))   return 'Headless Chrome (bot)';
  if (/PhantomJS/i.test(ua))        return 'PhantomJS (bot)';
  if (/Electron/i.test(ua))         return 'Electron App';
  if (/Edg\//i.test(ua))            return 'Microsoft Edge';
  if (/Firefox/i.test(ua))          return 'Firefox';
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
  if (/Chrome/i.test(ua))           return 'Chrome/Chromium';
  if (/curl/i.test(ua))             return 'curl (CLI)';
  if (/python-requests/i.test(ua))  return 'Python Requests (script)';
  return 'Unknown';
}

function detectBotSignals(headers, ua) {
  const signals = [];
  if (/HeadlessChrome|PhantomJS|selenium|webdriver/i.test(ua)) signals.push('headless_browser');
  if (!headers['accept-language']) signals.push('no_accept_language');
  if (!headers['accept-encoding']) signals.push('no_accept_encoding');
  if (headers['x-forwarded-for'])  signals.push('proxy_header');
  return { detected: signals.length > 0, signals };
}

function getHeaderOrder(headers) {
  return Object.keys(headers).slice(0, 10);
}

function assessTLSUniqueness(hash, browser) {
  const known = KNOWN_JA3[hash];
  if (known) return { level: known.risk, matched: known.browser };
  if (browser.includes('bot') || browser.includes('curl')) return { level: 'AUTOMATED', matched: null };
  return { level: 'UNKNOWN', matched: null };
}

module.exports = { analyzeTLS };
