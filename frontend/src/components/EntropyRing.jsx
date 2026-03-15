/*
 * Spectre – EntropyRing component
 * Animated SVG score ring for the dashboard overview.
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 */
export default function EntropyRing({ score = 0, risk = 'LOW', oneIn = '—', label = '—' }) {
  const R      = 54;
  const CIRC   = 2 * Math.PI * R;
  const offset = CIRC - (score / 100) * CIRC;
  const color  = risk === 'HIGH' ? '#E24B4A' : risk === 'MEDIUM' ? '#EF9F27' : '#1D9E75';

  return (
    <div className="entropy-ring-wrap">
      <div className="entropy-ring-svg-wrap">
        <svg width="136" height="136" viewBox="0 0 136 136" style={{ display: 'block' }}>
          {/* Track */}
          <circle cx="68" cy="68" r={R} fill="none"
            stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          {/* Progress arc */}
          <circle cx="68" cy="68" r={R} fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 68 68)"
            style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)' }}
          />
        </svg>
        <div className="entropy-ring-center">
          <div className="entropy-ring-num" style={{ color }}>{score}</div>
          <div className="entropy-ring-denom">/100</div>
        </div>
      </div>

      <div className="entropy-ring-meta">
        <div className="entropy-ring-title">Uniqueness Score</div>
        <div className="entropy-risk-pill" style={{
          background: color + '22',
          color,
          border: `1px solid ${color}44`,
        }}>
          {risk} RISK
        </div>
        <div className="entropy-ring-1in">
          1 in <strong style={{ color }}>{oneIn}</strong> browsers
        </div>
        <div className="entropy-ring-label">{label}</div>
      </div>
    </div>
  );
}
