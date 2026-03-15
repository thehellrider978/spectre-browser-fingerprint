/*
 * Spectre – ScoreRing component
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 */
export default function ScoreRing({ score, oneIn, label, risk }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const riskColor = risk === 'HIGH' ? '#E24B4A' : risk === 'MEDIUM' ? '#EF9F27' : '#1D9E75';

  return (
    <div className="sp-score-card">
      <div className="sp-ring-wrap">
        <svg width="136" height="136" viewBox="0 0 136 136">
          <circle cx="68" cy="68" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle
            cx="68" cy="68" r={r}
            fill="none"
            stroke={riskColor}
            strokeWidth="8"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 68 68)"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="sp-ring-center">
          <div className="sp-ring-num" style={{ color: riskColor }}>{score}</div>
          <div className="sp-ring-denom">/100</div>
        </div>
      </div>
      <div className="sp-score-title">Uniqueness Score</div>
      <div className="sp-risk-pill" style={{
        background: riskColor + '22',
        color: riskColor,
        border: `1px solid ${riskColor}44`
      }}>{risk} RISK</div>
      <div className="sp-one-in">
        1 in <strong style={{ color: riskColor }}>{oneIn}</strong> browsers
      </div>
      <div className="sp-score-label-text">{label}</div>
    </div>
  );
}
