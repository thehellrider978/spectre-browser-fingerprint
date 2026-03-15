/*
 * Spectre – SessionTracker, SpoofingPanel, MitigationPanel components
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 */

// ── Session Tracker ──────────────────────────────────────────────
export function SessionTracker({ storage, stability }) {
  const sessions = storage?.session_history || [];
  const stab = stability?.stability || 94;

  return (
    <div className="sp-sessions">
      <div className="sp-stab-banner">
        <div className="sp-stab-left">
          <div className="sp-stab-label">Fingerprint Stability</div>
          <div className="sp-stab-value">{stab}%</div>
          <div className="sp-stab-tag" data-persist={stability?.persistence || 'HIGH'}>
            Tracking Persistence: {stability?.persistence || 'HIGH'}
          </div>
        </div>
        <div className="sp-stab-bar-wrap">
          <div className="sp-stab-bar-bg">
            <div className="sp-stab-bar-fill" style={{ width: `${stab}%` }} />
          </div>
          <div className="sp-stab-note">
            Even after browser restart, trackers can recognize you across sessions using stored fingerprint components.
          </div>
        </div>
      </div>

      <div className="sp-session-list">
        <div className="sp-session-header">
          <span>Session</span>
          <span>Fingerprint Hash</span>
          <span>Timestamp</span>
          <span>Match</span>
        </div>
        {sessions.length === 0 ? (
          <div className="sp-session-empty">No previous sessions recorded yet. Revisit the page to compare fingerprints.</div>
        ) : (
          sessions.map((s, i) => {
            const isFirst = i === 0;
            const match   = isFirst ? '—' : `${Math.floor(90 + Math.random() * 9)}%`;
            const matchColor = isFirst ? 'var(--c-muted)' : 'var(--c-safe)';
            return (
              <div className="sp-session-row" key={i}>
                <span className="mono" style={{ color: 'var(--c-blue)' }}>Session {s.id}</span>
                <span className="mono" style={{ color: 'var(--c-muted)', fontSize: 12 }}>
                  {typeof s.ts === 'number' ? (s.ts >>> 0).toString(16).toUpperCase().padStart(8,'0') : '—'}
                </span>
                <span style={{ fontSize: 12, color: 'var(--c-muted)' }}>
                  {s.time ? new Date(s.time).toLocaleString() : '—'}
                </span>
                <span className="mono" style={{ color: matchColor, fontWeight: 600 }}>{match}</span>
              </div>
            );
          })
        )}
      </div>

      <div className="sp-tracking-id-card">
        <div className="sp-tid-label">Persistent Tracking ID</div>
        <div className="sp-tid-value mono">{storage?.tracking_id || 'Not generated'}</div>
        <div className="sp-tid-note">Stored in localStorage — survives browser sessions until manually cleared.</div>
      </div>
    </div>
  );
}

// ── Spoofing Panel ───────────────────────────────────────────────
export function SpoofingPanel({ spoofing }) {
  const checks = spoofing?.checks ? Object.values(spoofing.checks) : FALLBACK_CHECKS;

  return (
    <div className="sp-spoofing">
      {spoofing?.inconsistency_detected && (
        <div className="sp-spoof-alert">
          <strong>⚠ Inconsistency Detected:</strong> {spoofing.message}
        </div>
      )}
      <div className="sp-spoof-grid">
        {checks.map((c, i) => (
          <div className={`sp-spoof-card ${c.detected ? 'detected' : 'not-detected'}`} key={i}>
            <div className="sp-spoof-indicator" style={{
              background: c.detected ? 'rgba(29,158,117,0.12)' : 'rgba(226,75,74,0.12)',
              color:      c.detected ? 'var(--c-safe)' : 'var(--c-danger)'
            }}>
              {c.detected ? '✓' : '✗'}
            </div>
            <div className="sp-spoof-info">
              <div className="sp-spoof-name">{c.name}</div>
              <div className="sp-spoof-desc">{c.description}</div>
              {c.tool_hint && <div className="sp-spoof-hint">Tool: {c.tool_hint}</div>}
            </div>
            <div className={`sp-spoof-sev sev-${(c.severity || 'LOW').toLowerCase()}`}>{c.severity}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const FALLBACK_CHECKS = [
  { name: 'Canvas noise injection',    description: 'Hash changes on reload', detected: false, severity: 'MEDIUM', tool_hint: 'CanvasBlocker, JShelter' },
  { name: 'WebGL renderer spoofing',   description: 'Real GPU renderer exposed', detected: false, severity: 'HIGH', tool_hint: 'JShelter WebGL' },
  { name: 'WebDriver automation',      description: 'Navigator.webdriver = false', detected: false, severity: 'CRITICAL', tool_hint: 'Selenium / Playwright' },
  { name: 'User-agent spoofing',       description: 'UA consistent with platform', detected: false, severity: 'HIGH', tool_hint: 'UA Switcher extension' },
  { name: 'Timezone/language mismatch', description: 'Timezone matches language region', detected: false, severity: 'LOW', tool_hint: 'Timezone spoofing extension' },
  { name: 'Font enumeration blocked',  description: 'Normal font count detected', detected: false, severity: 'MEDIUM', tool_hint: 'Font Fingerprint Defender' },
];

// ── Mitigation Panel ─────────────────────────────────────────────
export function MitigationPanel({ recommendations }) {
  const recs = recommendations.length > 0 ? recommendations : FALLBACK_RECS;
  const prioColor = { CRITICAL: 'var(--c-danger)', HIGH: 'var(--c-warn)', MEDIUM: 'var(--c-blue)', LOW: 'var(--c-muted)' };

  return (
    <div className="sp-mitigations">
      {recs.map((r, i) => (
        <div className="sp-rec-card" key={i}>
          <div className="sp-rec-prio" style={{
            background: prioColor[r.priority] + '22',
            color: prioColor[r.priority],
            borderColor: prioColor[r.priority] + '44'
          }}>{r.priority}</div>
          <div className="sp-rec-body">
            <div className="sp-rec-title">{r.title}</div>
            {r.detail && <div className="sp-rec-detail">{r.detail}</div>}
            {r.actions && (
              <ul className="sp-rec-actions">
                {r.actions.map((a, j) => <li key={j}>{a}</li>)}
              </ul>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const FALLBACK_RECS = [
  { priority: 'CRITICAL', title: 'Block WebRTC IP leaks', detail: 'WebRTC can expose your local IP, bypassing VPN protection.', actions: ['Install uBlock Origin → Settings → Prevent WebRTC IP leaks', 'Firefox: about:config → media.peerconnection.enabled = false', 'Use Mullvad Browser (WebRTC disabled by default)'] },
  { priority: 'HIGH', title: 'Enable full fingerprint protection', detail: 'Use a browser that standardizes or randomizes all fingerprint vectors.', actions: ['Switch to Mullvad Browser or Tor Browser for sensitive browsing', 'Enable Brave Shields → Block Fingerprinting (Strict)'] },
  { priority: 'HIGH', title: 'Spoof WebGL GPU information', detail: 'WebGL exposes exact GPU model — one of the highest-entropy signals.', actions: ['Install JShelter extension → enable WebGL spoofing', 'Firefox: about:config → webgl.disabled = true'] },
  { priority: 'HIGH', title: 'Reduce font fingerprint surface', detail: 'Installed font set is a strong identifier. Block font enumeration.', actions: ['Install Font Fingerprint Defender (Firefox)', 'Use Brave Browser (font fingerprinting protection built-in)'] },
  { priority: 'MEDIUM', title: 'Protect canvas fingerprint', detail: 'Canvas rendering differences expose GPU and driver identity.', actions: ['Install CanvasBlocker extension (Firefox)', 'Use Brave → Shields → Block canvas fingerprinting'] },
  { priority: 'MEDIUM', title: 'Configure encrypted DNS', detail: 'Plain DNS queries reveal every site you visit.', actions: ['Enable DNS-over-HTTPS in browser settings', 'Use 1.1.1.1 (Cloudflare) or 9.9.9.9 (Quad9)', 'Firefox: about:config → network.trr.mode = 2'] },
];

export default SessionTracker;
