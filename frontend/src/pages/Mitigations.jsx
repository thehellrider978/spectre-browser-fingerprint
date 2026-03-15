/*
 * Spectre – Mitigations Panel
 * Prioritized privacy and security recommendations.
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 * GitHub: github.com/hellrider978
 * Year: 2026 | License: MIT
 */

const DEFAULT_RECS = [
  {
    priority: 'CRITICAL',
    title:    'Block WebRTC IP leaks',
    detail:   'WebRTC can expose your local IP address, bypassing VPN and proxy protection entirely.',
    actions:  [
      'Install uBlock Origin → Dashboard → Settings → "Prevent WebRTC from leaking local IP addresses"',
      'Firefox: about:config → media.peerconnection.enabled = false',
      'Use Mullvad Browser (WebRTC disabled by default)',
    ],
  },
  {
    priority: 'CRITICAL',
    title:    'Enable full fingerprint protection',
    detail:   'Your browser is highly unique. Standardize or randomize all fingerprint vectors.',
    actions:  [
      'Switch to Tor Browser (fully standardized fingerprint for all users)',
      'Use Mullvad Browser (fingerprint randomization across canvas, WebGL, fonts)',
      'Enable Brave Browser → Shields → Block fingerprinting (Strict mode)',
    ],
  },
  {
    priority: 'HIGH',
    title:    'Protect canvas fingerprint',
    detail:   'Canvas rendering exposes GPU, driver, and OS-level differences that are highly unique.',
    actions:  [
      'Install CanvasBlocker extension (Firefox) — adds noise to canvas output',
      'Brave Browser Shields → Block fingerprinting covers canvas automatically',
      'Install JShelter for canvas noise injection',
    ],
  },
  {
    priority: 'HIGH',
    title:    'Spoof WebGL GPU information',
    detail:   'WebGL exposes exact GPU vendor and renderer string — one of the highest-entropy signals.',
    actions:  [
      'Install JShelter extension → enable WebGL spoofing module',
      'Firefox about:config → webgl.disabled = true (disables WebGL-dependent sites)',
      'Tor Browser has WebGL disabled by default at max security level',
    ],
  },
  {
    priority: 'HIGH',
    title:    'Reduce font fingerprint surface',
    detail:   'Your installed font set is detectable and highly unique. Reduce exposed fonts.',
    actions:  [
      'Install Font Fingerprint Defender extension (Firefox/Chrome)',
      'Use Mullvad or Brave — both standardize available font enumeration',
      'Avoid installing large professional font packs on system-level',
    ],
  },
  {
    priority: 'MEDIUM',
    title:    'Configure encrypted DNS (DNS-over-HTTPS)',
    detail:   'Plain DNS queries reveal every domain you visit, even with a VPN.',
    actions:  [
      'Firefox: Settings → Network Settings → Enable DNS over HTTPS → Cloudflare or NextDNS',
      'Chrome: Settings → Privacy → Security → Use secure DNS → 1.1.1.1',
      'System-level: Configure DNS-over-HTTPS at router level with Pi-hole + cloudflared',
    ],
  },
  {
    priority: 'MEDIUM',
    title:    'Enable cookie isolation and strict storage policies',
    detail:   'Tracking IDs persist via localStorage, IndexedDB, and CacheStorage across sessions.',
    actions:  [
      'Firefox: Enable Total Cookie Protection (default in Firefox 103+)',
      'Use Firefox Multi-Account Containers to isolate sites',
      'Periodically clear localStorage + IndexedDB via browser dev tools',
    ],
  },
  {
    priority: 'MEDIUM',
    title:    'Standardize user agent and timezone',
    detail:   'Rare UA + timezone combinations significantly increase uniqueness score.',
    actions:  [
      'Use a common UA string (latest Chrome on Windows 10 is most common)',
      'Set timezone to UTC when maximum privacy is needed',
      'Avoid outdated browser versions — they are rare and highly identifiable',
    ],
  },
  {
    priority: 'LOW',
    title:    'Audit and reduce browser plugins',
    detail:   'Installed plugins and MIME types add fingerprint entropy.',
    actions:  [
      'Remove unnecessary browser extensions',
      'Disable plugins not actively needed (PDF viewer etc.)',
      'Use a dedicated clean browser profile for sensitive tasks',
    ],
  },
];

const PRIO_STYLE = {
  CRITICAL: { bg: 'rgba(226,75,74,0.15)',  text: '#E24B4A', border: 'rgba(226,75,74,0.4)'  },
  HIGH:     { bg: 'rgba(239,159,39,0.15)', text: '#EF9F27', border: 'rgba(239,159,39,0.4)' },
  MEDIUM:   { bg: 'rgba(78,158,232,0.12)', text: '#4E9EE8', border: 'rgba(78,158,232,0.3)' },
  LOW:      { bg: 'rgba(107,105,102,0.1)', text: '#8a8784', border: 'rgba(107,105,102,0.3)'},
};

export default function Mitigations({ analysis }) {
  const recs = analysis?.recommendations?.length
    ? analysis.recommendations
    : DEFAULT_RECS;

  const counts = {
    CRITICAL: recs.filter(r => r.priority === 'CRITICAL').length,
    HIGH:     recs.filter(r => r.priority === 'HIGH').length,
    MEDIUM:   recs.filter(r => r.priority === 'MEDIUM').length,
    LOW:      recs.filter(r => r.priority === 'LOW').length,
  };

  return (
    <div className="mitigations-panel">

      {/* Summary counts */}
      <div className="mit-summary">
        {Object.entries(counts).map(([p, n]) => {
          const s = PRIO_STYLE[p];
          return (
            <div key={p} className="mit-count-card" style={{
              background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8, padding: '10px 16px',
            }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 24, color: s.text }}>{n}</div>
              <div style={{ fontSize: 11, color: s.text, letterSpacing: 1, textTransform: 'uppercase' }}>{p}</div>
            </div>
          );
        })}
      </div>

      {/* Recommendation cards */}
      <div className="mit-list">
        {recs.map((r, i) => {
          const s = PRIO_STYLE[r.priority] || PRIO_STYLE.LOW;
          return (
            <div key={i} className="mit-card">
              <div className="mit-prio" style={{
                background: s.bg, color: s.text, border: `1px solid ${s.border}`,
              }}>
                {r.priority}
              </div>
              <div className="mit-body">
                <div className="mit-title">{r.title}</div>
                {r.detail && <div className="mit-detail">{r.detail}</div>}
                {r.actions?.length > 0 && (
                  <ul className="mit-actions">
                    {r.actions.map((a, j) => <li key={j}>{a}</li>)}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
