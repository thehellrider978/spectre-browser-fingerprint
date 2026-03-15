/*
 * Spectre Browser Fingerprint Analyzer
 * Module: Security Recommendations Engine
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 * GitHub: github.com/hellrider978
 * Year: 2026
 * License: MIT
 */

const RECOMMENDATIONS = {
  webrtc_leak: {
    priority: 'CRITICAL',
    title: 'Block WebRTC IP leaks',
    detail: 'WebRTC is exposing your local IP address. Trackers can use this to de-anonymize VPN users.',
    actions: [
      'Install uBlock Origin → Dashboard → Settings → "Prevent WebRTC from leaking local IP addresses"',
      'Firefox: about:config → media.peerconnection.enabled = false',
      'Use Mullvad Browser (WebRTC disabled by default)',
    ],
    cve_refs: ['CVE-2015-0258 (WebRTC bypass pattern)'],
  },

  high_entropy: {
    priority: 'CRITICAL',
    title: 'Reduce fingerprint entropy',
    detail: 'Your browser is highly unique. Use entropy-reduction tools to blend into the crowd.',
    actions: [
      'Switch to Tor Browser (standardized fingerprint)',
      'Use Mullvad Browser (fingerprint randomization built-in)',
      'Enable Brave Browser shields → "Block fingerprinting"',
    ],
  },

  canvas_unprotected: {
    priority: 'HIGH',
    title: 'Enable canvas fingerprint protection',
    detail: 'Canvas rendering exposes GPU + driver differences. Block or randomize the output.',
    actions: [
      'Install Canvas Blocker extension (Firefox)',
      'Use Brave Browser → Shields → Block fingerprinting',
      'Install JShelter for canvas noise injection',
    ],
  },

  webgl_exposed: {
    priority: 'HIGH',
    title: 'Spoof WebGL GPU information',
    detail: 'WebGL exposes exact GPU model (vendor + renderer). This is highly unique.',
    actions: [
      'Install JShelter → enable WebGL spoofing',
      'Firefox about:config → webgl.disabled = true (breaks WebGL sites)',
      'Use Tor Browser (WebGL disabled)',
    ],
  },

  fonts_high: {
    priority: 'HIGH',
    title: 'Reduce font fingerprint surface',
    detail: `High font count detected. Each unique font combination narrows identification.`,
    actions: [
      'Use browsers with font fingerprint protection (Brave, Mullvad)',
      'Install Font Fingerprint Defender extension',
      'Avoid installing large font packs',
    ],
  },

  dns_leak: {
    priority: 'HIGH',
    title: 'Configure encrypted DNS',
    detail: 'DNS queries reveal visited sites. Use DNS-over-HTTPS to prevent leakage.',
    actions: [
      'Firefox: about:config → network.trr.mode = 2 → set to Cloudflare/NextDNS',
      'Enable "Secure DNS" in Chrome settings → use 1.1.1.1 or 9.9.9.9',
      'Use Pi-hole + DNS-over-HTTPS on local network',
    ],
  },

  partial_spoofing: {
    priority: 'MEDIUM',
    title: 'Inconsistent spoofing detected',
    detail: 'Partial fingerprint randomization is detectable and increases anomaly score. Protect all vectors or none.',
    actions: [
      'Use a browser with uniform fingerprint protection (Tor, Mullvad)',
      'Ensure canvas AND WebGL spoofing are both active',
      'Avoid mixing anti-fingerprint extensions with a bare browser',
    ],
  },

  storage_persist: {
    priority: 'MEDIUM',
    title: 'Multiple tracking storage vectors active',
    detail: 'Tracking IDs can persist across sessions via localStorage, IndexedDB, and cache.',
    actions: [
      'Enable strict cookie isolation (Firefox Total Cookie Protection)',
      'Use browser profiles or containers for different activities',
      'Periodically clear localStorage + IndexedDB',
    ],
  },

  user_agent: {
    priority: 'LOW',
    title: 'Standardize user agent string',
    detail: 'Rare UA string (uncommon version/OS combo) increases uniqueness.',
    actions: [
      'Use a common UA (latest Chrome on Windows)',
      'Avoid outdated browser versions',
    ],
  },
};

/**
 * Generate prioritized recommendations based on analysis results.
 */
function generateRecommendations(fingerprint, uniqueness, spoofing) {
  const recs = [];

  if (fingerprint.webrtc?.leak_detected) {
    recs.push(RECOMMENDATIONS.webrtc_leak);
  }

  if (uniqueness.score > 85) {
    recs.push(RECOMMENDATIONS.high_entropy);
  }

  if (fingerprint.canvas?.status === 'success' && !spoofing.checks?.canvas_noise?.detected) {
    recs.push(RECOMMENDATIONS.canvas_unprotected);
  }

  if (fingerprint.webgl?.status === 'success' && !spoofing.checks?.webgl_spoof?.detected) {
    recs.push(RECOMMENDATIONS.webgl_exposed);
  }

  if ((fingerprint.fonts?.font_count || 0) > 80) {
    recs.push({ ...RECOMMENDATIONS.fonts_high, detail: `${fingerprint.fonts.font_count} fonts detected. ${RECOMMENDATIONS.fonts_high.detail}` });
  }

  if (spoofing.inconsistency_detected) {
    recs.push(RECOMMENDATIONS.partial_spoofing);
  }

  if ((fingerprint.storage?.persistence_score || 0) > 60) {
    recs.push(RECOMMENDATIONS.storage_persist);
  }

  recs.push(RECOMMENDATIONS.dns_leak);

  // Sort: CRITICAL → HIGH → MEDIUM → LOW
  const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  recs.sort((a, b) => (order[a.priority] || 3) - (order[b.priority] || 3));

  return recs.slice(0, 8); // Top 8 recommendations
}

module.exports = { generateRecommendations };
