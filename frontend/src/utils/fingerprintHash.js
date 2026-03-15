/*
 * Spectre Browser Fingerprint Analyzer
 * Util: Fingerprint Hash & Browser Signal Collection
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 * GitHub: github.com/hellrider978
 * Year: 2026 | License: MIT
 */

/** SHA-256 of a string → hex */
export async function sha256(str) {
  const buf  = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Fast non-crypto FNV-1a hash → hex string */
export function fnv32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h  = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).toUpperCase().padStart(8, '0');
}

/** Collect hardware + browser signals synchronously */
export function collectBrowserSignals() {
  const nav = navigator;
  const scr = screen;

  return {
    hardware: {
      cpu_cores:     nav.hardwareConcurrency || null,
      device_memory: nav.deviceMemory || null,
      platform:      nav.platform || '',
      screen: {
        width:        scr.width,
        height:       scr.height,
        avail_width:  scr.availWidth,
        avail_height: scr.availHeight,
        color_depth:  scr.colorDepth,
        pixel_depth:  scr.pixelDepth,
        dpr:          window.devicePixelRatio || 1,
      },
      touch_points: nav.maxTouchPoints || 0,
    },
    browser: {
      user_agent:       nav.userAgent,
      vendor:           nav.vendor || '',
      language:         nav.language || '',
      languages:        [...(nav.languages || [])],
      timezone:         Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezone_offset:  new Date().getTimezoneOffset(),
      cookies_enabled:  nav.cookieEnabled,
      do_not_track:     nav.doNotTrack,
      plugins_count:    nav.plugins ? nav.plugins.length : 0,
      mime_types_count: nav.mimeTypes ? nav.mimeTypes.length : 0,
      online:           nav.onLine,
      service_worker:   'serviceWorker' in nav,
      webdriver:        nav.webdriver || false,
      pdfViewer:        nav.pdfViewerEnabled || false,
    },
  };
}

/**
 * Builds a composite fingerprint ID from all collected hashes.
 * Used for cross-session comparison.
 */
export function buildCompositeHash(fp) {
  const parts = [
    fp.canvas?.canvas_hash   || 'X',
    fp.webgl?.webgl_hash     || 'X',
    fp.audio?.audio_hash     || 'X',
    fp.fonts?.font_hash      || 'X',
    fp.hardware?.screen?.width  || 0,
    fp.hardware?.screen?.height || 0,
    fp.hardware?.screen?.dpr    || 1,
    fp.hardware?.cpu_cores      || 0,
    fp.browser?.timezone        || '',
    fp.browser?.language        || '',
  ].join('|');
  return fnv32(parts);
}

/**
 * Store composite hash in localStorage and return session history.
 */
export function recordSession(compositeHash) {
  const KEY = 'spectre_sessions';
  let sessions = [];
  try {
    const raw = localStorage.getItem(KEY);
    sessions  = raw ? JSON.parse(raw) : [];
  } catch { /* ignore */ }

  const entry = {
    id:   sessions.length + 1,
    hash: compositeHash,
    time: new Date().toISOString(),
    ts:   Date.now(),
  };
  sessions.push(entry);
  if (sessions.length > 20) sessions.shift();

  try { localStorage.setItem(KEY, JSON.stringify(sessions)); } catch { /* ignore */ }
  return sessions;
}

/**
 * Compare two composite hashes character-by-character.
 * Returns similarity 0–100.
 */
export function hashSimilarity(a, b) {
  if (!a || !b || a === b) return a === b ? 100 : 0;
  const len  = Math.max(a.length, b.length);
  let match  = 0;
  for (let i = 0; i < len; i++) {
    if (a[i] && b[i] && a[i].toLowerCase() === b[i].toLowerCase()) match++;
  }
  return Math.round((match / len) * 100);
}
