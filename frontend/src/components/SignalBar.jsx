/*
 * Spectre – SignalBar component
 * Reusable entropy bar row used in Signals + EntropyMap panels.
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 */
import RiskBadge from './RiskBadge.jsx';

export default function SignalBar({ label, value, pct = 0, bits, status, mono = false }) {
  const barColor = pct > 70 ? '#E24B4A' : pct > 40 ? '#EF9F27' : '#1D9E75';

  return (
    <div className="sig-row">
      <div className="sig-name">{label}</div>

      <div className="sig-val" style={{ fontFamily: mono ? 'var(--mono)' : 'inherit' }}>
        {value}
      </div>

      <div className="sig-bar-cell">
        {pct > 0 && (
          <div className="sig-bar-bg">
            <div className="sig-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
          </div>
        )}
        {bits != null && bits > 0 && (
          <span className="sig-bits">{bits}b</span>
        )}
      </div>

      <div className="sig-status">
        <RiskBadge level={status} />
      </div>
    </div>
  );
}
