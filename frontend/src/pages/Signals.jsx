/*
 * Spectre – Signals Panel
 * Shows all collected fingerprint signals with entropy bars and status tags.
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 * GitHub: github.com/hellrider978
 * Year: 2026 | License: MIT
 */
import SignalBar from '../components/SignalBar.jsx';

function trunc(s, n = 72) {
  if (!s) return '—';
  return String(s).length > n ? String(s).slice(0, n) + '…' : String(s);
}

function pctOf(bits, max = 18) {
  return Math.min(100, Math.round((bits / max) * 100));
}

export default function Signals({ fingerprint: fp, analysis: an }) {
  if (!fp) {
    return (
      <div className="panel-empty">
        No fingerprint data yet. Run a scan to collect signals.
      </div>
    );
  }

  const scr = fp.hardware?.screen || {};
  const br  = fp.browser || {};
  const hw  = fp.hardware || {};

  const signals = [
    // ── Canvas ──────────────────────────────────────────────────
    {
      label:  'Canvas Hash',
      value:  fp.canvas?.canvas_hash || '—',
      bits:   fp.canvas?.canvas_entropy || 14.2,
      pct:    pctOf(14.2),
      status: fp.canvas?.status === 'blocked' ? 'BLOCKED' : fp.canvas?.status === 'success' ? 'UNIQUE' : 'UNKNOWN',
      mono:   true,
    },
    // ── WebGL ───────────────────────────────────────────────────
    {
      label:  'WebGL Renderer',
      value:  trunc(fp.webgl?.webgl_renderer || '—', 60),
      bits:   16.8,
      pct:    pctOf(16.8),
      status: fp.webgl?.status === 'success' ? 'UNIQUE' : 'BLOCKED',
      mono:   false,
    },
    {
      label:  'WebGL Vendor',
      value:  fp.webgl?.webgl_vendor || '—',
      bits:   null,
      pct:    0,
      status: 'INFO',
      mono:   false,
    },
    {
      label:  'WebGL Hash',
      value:  fp.webgl?.webgl_hash || '—',
      bits:   null,
      pct:    0,
      status: 'INFO',
      mono:   true,
    },
    // ── Audio ───────────────────────────────────────────────────
    {
      label:  'Audio Hash',
      value:  fp.audio?.audio_hash || '—',
      bits:   fp.audio?.audio_entropy || 11.4,
      pct:    pctOf(11.4),
      status: fp.audio?.status === 'success' ? 'MEDIUM'
             : fp.audio?.status === 'blocked' ? 'BLOCKED'
             : fp.audio?.status === 'timeout' ? 'TIMEOUT'
             : 'UNKNOWN',
      mono:   true,
    },
    // ── Fonts ───────────────────────────────────────────────────
    {
      label:  'Font Set',
      value:  `${fp.fonts?.font_count ?? '—'} fonts detected`,
      bits:   12.9,
      pct:    pctOf(12.9),
      status: !fp.fonts?.font_count       ? 'BLOCKED'
             : fp.fonts.font_count > 100  ? 'HIGH'
             : fp.fonts.font_count > 40   ? 'MEDIUM'
             : 'COMMON',
      mono:   false,
    },
    {
      label:  'Font Hash',
      value:  fp.fonts?.font_hash || '—',
      bits:   null,
      pct:    0,
      status: 'INFO',
      mono:   true,
    },
    // ── WebRTC ──────────────────────────────────────────────────
    {
      label:  'WebRTC Local IPs',
      value:  fp.webrtc?.local_ips?.length
                ? fp.webrtc.local_ips.join(', ')
                : 'None detected',
      bits:   fp.webrtc?.leak_detected ? 17.1 : 0,
      pct:    fp.webrtc?.leak_detected ? 95 : 0,
      status: fp.webrtc?.leak_detected ? 'LEAKED' : 'SECURE',
      mono:   fp.webrtc?.leak_detected,
    },
    {
      label:  'WebRTC Public IPs',
      value:  fp.webrtc?.public_ips?.length
                ? fp.webrtc.public_ips.join(', ')
                : 'None',
      bits:   null,
      pct:    0,
      status: fp.webrtc?.stun_exposed ? 'HIGH' : 'INFO',
      mono:   false,
    },
    // ── Screen / Hardware ───────────────────────────────────────
    {
      label:  'Screen Resolution',
      value:  `${scr.width || '?'}×${scr.height || '?'}  DPR: ${scr.dpr || '?'}  Depth: ${scr.color_depth || '?'}bit`,
      bits:   5.6,
      pct:    pctOf(5.6),
      status: 'COMMON',
      mono:   false,
    },
    {
      label:  'CPU Cores',
      value:  hw.cpu_cores != null ? `${hw.cpu_cores} logical cores` : '—',
      bits:   2.1,
      pct:    pctOf(2.1),
      status: 'COMMON',
      mono:   false,
    },
    {
      label:  'Device Memory',
      value:  hw.device_memory != null ? `${hw.device_memory} GB` : '—',
      bits:   1.8,
      pct:    pctOf(1.8),
      status: 'COMMON',
      mono:   false,
    },
    {
      label:  'Platform',
      value:  hw.platform || '—',
      bits:   null,
      pct:    0,
      status: 'INFO',
      mono:   false,
    },
    // ── Browser ─────────────────────────────────────────────────
    {
      label:  'User Agent',
      value:  trunc(br.user_agent || '—', 80),
      bits:   8.3,
      pct:    pctOf(8.3),
      status: 'MEDIUM',
      mono:   false,
    },
    {
      label:  'Language',
      value:  br.languages?.join(', ') || br.language || '—',
      bits:   2.9,
      pct:    pctOf(2.9),
      status: 'COMMON',
      mono:   false,
    },
    {
      label:  'Timezone',
      value:  `${br.timezone || '—'}  (UTC${br.timezone_offset != null ? (br.timezone_offset <= 0 ? '+' : '') + (-br.timezone_offset / 60) : '?'})`,
      bits:   3.8,
      pct:    pctOf(3.8),
      status: 'MEDIUM',
      mono:   false,
    },
    {
      label:  'Plugins',
      value:  `${br.plugins_count ?? '—'} installed`,
      bits:   4.5,
      pct:    pctOf(4.5),
      status: 'MEDIUM',
      mono:   false,
    },
    {
      label:  'Do Not Track',
      value:  br.do_not_track ?? 'null',
      bits:   0.4,
      pct:    0,
      status: 'INFO',
      mono:   true,
    },
    {
      label:  'WebDriver',
      value:  br.webdriver ? 'true — AUTOMATION DETECTED' : 'false',
      bits:   null,
      pct:    0,
      status: br.webdriver ? 'BOT' : 'OK',
      mono:   true,
    },
    // ── Storage ─────────────────────────────────────────────────
    {
      label:  'Cookies',
      value:  fp.storage?.cookies?.available ? 'Enabled' : 'Blocked',
      bits:   null,
      pct:    0,
      status: fp.storage?.cookies?.available ? 'HIGH' : 'BLOCKED',
      mono:   false,
    },
    {
      label:  'localStorage',
      value:  fp.storage?.localStorage?.available
                ? `Available (${fp.storage.localStorage.item_count || 0} items)`
                : 'Blocked',
      bits:   null,
      pct:    0,
      status: fp.storage?.localStorage?.available ? 'HIGH' : 'BLOCKED',
      mono:   false,
    },
    {
      label:  'IndexedDB',
      value:  fp.storage?.indexedDB?.available ? 'Available' : 'Blocked',
      bits:   null,
      pct:    0,
      status: fp.storage?.indexedDB?.available ? 'MEDIUM' : 'BLOCKED',
      mono:   false,
    },
    {
      label:  'CacheStorage',
      value:  fp.storage?.cacheStorage?.available ? 'Available' : 'Blocked',
      bits:   null,
      pct:    0,
      status: fp.storage?.cacheStorage?.available ? 'MEDIUM' : 'BLOCKED',
      mono:   false,
    },
    // ── TLS ─────────────────────────────────────────────────────
    {
      label:  'TLS JA3 Hash',
      value:  an?.tls?.ja3_hash || '(server-side)',
      bits:   10.7,
      pct:    pctOf(10.7),
      status: 'MEDIUM',
      mono:   true,
    },
    {
      label:  'Browser Family (TLS)',
      value:  an?.tls?.browser_family || '—',
      bits:   null,
      pct:    0,
      status: 'INFO',
      mono:   false,
    },
  ];

  return (
    <div className="signals-panel">
      <div className="signals-table">
        <div className="signals-header">
          <span>Signal</span>
          <span>Value</span>
          <span>Entropy</span>
          <span>Status</span>
        </div>
        {signals.map((s, i) => (
          <SignalBar key={i} {...s} />
        ))}
      </div>
    </div>
  );
}
