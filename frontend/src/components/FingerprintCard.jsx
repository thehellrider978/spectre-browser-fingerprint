/*
 * Spectre – FingerprintCard component
 * Small metric summary card used in the overview grid.
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 */
const ACCENT = {
  danger: '#E24B4A',
  warn:   '#EF9F27',
  safe:   '#1D9E75',
  blue:   '#4E9EE8',
  muted:  '#6b6966',
};

export default function FingerprintCard({ label, value, sub, accent = 'muted' }) {
  const color = ACCENT[accent] || ACCENT.muted;
  return (
    <div className="fp-card">
      <div className="fp-card-label">{label}</div>
      <div className="fp-card-value" style={{ color }}>{value}</div>
      {sub && <div className="fp-card-sub">{sub}</div>}
    </div>
  );
}
