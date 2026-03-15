/*
 * Spectre – Session Track Panel
 * Compares fingerprint hashes across sessions and calculates stability score.
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 * GitHub: github.com/hellrider978
 * Year: 2026 | License: MIT
 */
import { hashSimilarity } from '../utils/fingerprintHash.js';

export default function SessionTrack({ fingerprint, analysis }) {
  const sessions  = fingerprint?.storage?.session_history || [];
  const stability = analysis?.stability?.stability ?? 94;
  const persist   = analysis?.stability?.persistence ?? 'HIGH';
  const trackId   = fingerprint?.storage?.tracking_id;
  const composite = fingerprint?._composite_hash;

  const stabColor = stability >= 85 ? '#EF9F27' : stability >= 60 ? '#4E9EE8' : '#1D9E75';

  // Build session comparison rows
  const sessionRows = sessions.map((s, i) => {
    const prevHash = i > 0 ? sessions[i - 1].hash : null;
    const sim = prevHash ? hashSimilarity(s.hash, prevHash) : null;
    return { ...s, sim };
  });

  const persistColor = persist === 'HIGH' ? '#EF9F27'
    : persist === 'MEDIUM' ? '#4E9EE8' : '#1D9E75';

  return (
    <div className="session-track">

      {/* Stability banner */}
      <div className="stab-banner">
        <div className="stab-left">
          <div className="stab-label">Fingerprint Stability</div>
          <div className="stab-value" style={{ color: stabColor }}>{stability}%</div>
          <div className="stab-persist" style={{
            background: persistColor + '22',
            color: persistColor,
            border: `1px solid ${persistColor}44`,
          }}>
            Tracking Persistence: {persist}
          </div>
        </div>
        <div className="stab-right">
          <div className="stab-bar-bg">
            <div className="stab-bar-fill" style={{ width: `${stability}%` }} />
          </div>
          <p className="stab-note">
            Even after closing the browser, trackers can recognize you across sessions.
            A {stability}% stability means {stability}% of your fingerprint attributes
            remain consistent between visits.
          </p>
        </div>
      </div>

      {/* Persistent tracking ID */}
      {trackId && (
        <div className="tracking-id-card">
          <div className="tid-label">Persistent Tracking ID</div>
          <div className="tid-value">{trackId}</div>
          <div className="tid-note">
            Stored in localStorage — survives browser restarts until manually cleared.
          </div>
        </div>
      )}

      {/* Composite hash */}
      {composite && (
        <div className="tracking-id-card" style={{ marginTop: 10 }}>
          <div className="tid-label">Composite Fingerprint Hash (this session)</div>
          <div className="tid-value">{composite}</div>
          <div className="tid-note">
            FNV-32 hash combining canvas, WebGL, audio, fonts, screen, timezone, and language.
          </div>
        </div>
      )}

      {/* Session history table */}
      <div className="session-table">
        <div className="session-table-header">
          <span>#</span>
          <span>Hash</span>
          <span>Timestamp</span>
          <span>Match vs prev</span>
        </div>

        {sessionRows.length === 0 ? (
          <div className="session-empty">
            No previous sessions recorded yet.
            Revisit the page after scanning to compare fingerprints across sessions.
          </div>
        ) : (
          sessionRows.map((s, i) => {
            const matchColor = s.sim == null ? 'var(--c-muted)'
              : s.sim >= 95 ? '#E24B4A'
              : s.sim >= 80 ? '#EF9F27'
              : '#1D9E75';

            return (
              <div className="session-row" key={i}>
                <span style={{ fontFamily: 'var(--mono)', color: '#4E9EE8' }}>
                  {s.id}
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--c-muted)' }}>
                  {s.hash || '—'}
                </span>
                <span style={{ fontSize: 12, color: 'var(--c-muted)' }}>
                  {s.time ? new Date(s.time).toLocaleString() : '—'}
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: matchColor }}>
                  {s.sim != null ? `${s.sim}%` : '—'}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Attack sim callout */}
      <div className="attack-callout">
        <div className="attack-callout-title">Tracker Attack Simulation</div>
        <div className="attack-callout-body">
          <div className="attack-step">Site A collects fingerprint → stores hash</div>
          <div className="attack-arrow">↓</div>
          <div className="attack-step">User visits Site B → fingerprint re-collected</div>
          <div className="attack-arrow">↓</div>
          <div className="attack-step highlight">
            Hash match: {stability}% — Tracker correlation probability:{' '}
            <strong style={{ color: stabColor }}>{stability}%</strong>
          </div>
        </div>
      </div>

    </div>
  );
}
