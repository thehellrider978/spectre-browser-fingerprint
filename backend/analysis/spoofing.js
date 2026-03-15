/*
 * Spectre Browser Fingerprint Analyzer
 * Module: Anti-Fingerprinting / Spoofing Detection
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 * GitHub: github.com/hellrider978
 * Year: 2026
 * License: MIT
 */

/**
 * Detects when a browser is attempting to spoof or randomize
 * its fingerprint signals. Inconsistencies between vectors
 * reveal partial spoofing attempts.
 */
function detectSpoofing(fingerprint) {
  const detections = [];
  const checks = {};

  // ── Canvas spoofing ─────────────────────────────────────────
  // Canvas noise injection causes hash to change on every render
  // while underlying GPU remains constant.
  checks.canvas_noise = {
    name: 'Canvas noise injection',
    description: 'Canvas hash randomized per page load',
    detected: fingerprint._canvas_changed_on_reload || false,
    severity: 'MEDIUM',
    tool_hint: 'CanvasBlocker, JShelter, or Brave shields',
  };
  if (checks.canvas_noise.detected) detections.push(checks.canvas_noise);

  // ── WebGL spoofing ──────────────────────────────────────────
  const webglRenderer = fingerprint.webgl?.webgl_renderer || '';
  const webglSpoofed  = webglRenderer.includes('Swiftshader')
    || webglRenderer.includes('llvmpipe')
    || webglRenderer === 'WebGL'
    || webglRenderer === '';
  checks.webgl_spoof = {
    name: 'WebGL renderer spoofing',
    description: webglSpoofed ? 'Software renderer detected — possible spoofing' : 'Real GPU renderer',
    detected: webglSpoofed,
    severity: 'HIGH',
    tool_hint: 'JShelter WebGL randomization',
  };
  if (checks.webgl_spoof.detected) detections.push(checks.webgl_spoof);

  // ── WebDriver / automation ──────────────────────────────────
  checks.webdriver = {
    name: 'WebDriver detected',
    description: 'Navigator.webdriver = true — browser is automated',
    detected: fingerprint.browser?.webdriver === true,
    severity: 'CRITICAL',
    tool_hint: 'Selenium, Playwright, or Puppeteer session',
  };
  if (checks.webdriver.detected) detections.push(checks.webdriver);

  // ── User-agent spoofing ─────────────────────────────────────
  // Mismatch: UA says macOS but platform is Win32
  const ua       = fingerprint.browser?.user_agent || '';
  const platform = fingerprint.hardware?.platform   || '';
  const uaOs     = ua.includes('Macintosh') ? 'mac' : ua.includes('Windows') ? 'win' : ua.includes('Linux') ? 'linux' : 'other';
  const platOs   = platform.includes('Mac') ? 'mac' : platform.includes('Win') ? 'win' : platform.includes('Linux') ? 'linux' : 'other';
  const uaMismatch = uaOs !== 'other' && platOs !== 'other' && uaOs !== platOs;
  checks.ua_spoof = {
    name: 'User-agent spoofing',
    description: uaMismatch ? `UA reports ${uaOs} but platform reports ${platOs}` : 'UA consistent with platform',
    detected: uaMismatch,
    severity: 'HIGH',
    tool_hint: 'UA switcher extension or manual override',
  };
  if (checks.ua_spoof.detected) detections.push(checks.ua_spoof);

  // ── Timezone spoofing ───────────────────────────────────────
  // UA/language doesn't match timezone region
  const tz     = fingerprint.browser?.timezone || '';
  const lang   = fingerprint.browser?.language || '';
  const tzRegion  = tzToRegion(tz);
  const langRegion = langToRegion(lang);
  const tzMismatch = tzRegion && langRegion && tzRegion !== langRegion && tzRegion !== 'universal';
  checks.tz_spoof = {
    name: 'Timezone/language mismatch',
    description: tzMismatch ? `Timezone region (${tzRegion}) doesn't match language (${langRegion})` : 'Timezone and language consistent',
    detected: tzMismatch,
    severity: 'LOW',
    tool_hint: 'Timezone spoofing extension',
  };
  if (checks.tz_spoof.detected) detections.push(checks.tz_spoof);

  // ── Font count anomaly ──────────────────────────────────────
  const fontCount = fingerprint.fonts?.font_count || 0;
  const fontAnomaly = fontCount === 0 || fontCount > 300;
  checks.font_block = {
    name: 'Font enumeration blocked',
    description: fontCount === 0 ? 'No fonts detected — enumeration blocked' : fontCount > 300 ? 'Unusually high font count' : `${fontCount} fonts detected`,
    detected: fontAnomaly,
    severity: 'MEDIUM',
    tool_hint: 'Font fingerprinting protection active',
  };
  if (checks.font_block.detected) detections.push(checks.font_block);

  // ── Inconsistency score ─────────────────────────────────────
  // Partial spoofing (some signals randomized, others not) is a strong signal
  const randomizedSignals = detections.filter(d => ['canvas_noise', 'webgl_spoof', 'font_block'].includes(Object.keys(checks).find(k => checks[k] === d)));
  const inconsistency = detections.length > 0 && detections.length < 4;

  return {
    checks,
    detections,
    total_detected: detections.length,
    spoofing_score: Math.round((detections.length / Object.keys(checks).length) * 100),
    inconsistency_detected: inconsistency,
    message: detections.length === 0
      ? 'No spoofing detected — all signals appear authentic.'
      : `${detections.length} spoofing indicator(s) detected. Partial spoofing increases anomaly score.`,
  };
}

function tzToRegion(tz) {
  if (!tz) return null;
  if (tz.startsWith('America'))  return 'americas';
  if (tz.startsWith('Europe'))   return 'europe';
  if (tz.startsWith('Asia'))     return 'asia';
  if (tz.startsWith('Africa'))   return 'africa';
  if (tz.startsWith('Pacific'))  return 'pacific';
  if (tz === 'UTC')              return 'universal';
  return null;
}

function langToRegion(lang) {
  if (!lang) return null;
  const base = lang.split('-')[0].toLowerCase();
  const eu = ['en','de','fr','es','it','nl','pl','pt','sv','no','da','fi','cs','sk','hu','ro','hr','bg'];
  const as = ['zh','ja','ko','hi','th','vi','id','ms','ar','he','tr','fa'];
  if (eu.includes(base)) return lang.includes('-US') || lang.includes('-CA') || lang.includes('-AU') ? 'americas' : 'europe';
  if (as.includes(base)) return 'asia';
  return null;
}

module.exports = { detectSpoofing };
