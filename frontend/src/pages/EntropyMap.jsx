/*
 * Spectre – Entropy Map Panel
 * Visualizes per-signal entropy bits and "1 in X" uniqueness probability.
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 * GitHub: github.com/hellrider978
 * Year: 2026 | License: MIT
 */
import { buildEntropyBreakdown, calcUniquenessScore, formatBigNum } from '../utils/entropyCalc.js';

function barColor(bits) {
  return bits > 12 ? '#E24B4A' : bits > 7 ? '#EF9F27' : '#1D9E75';
}

export default function EntropyMap({ fingerprint, analysis }) {
  // Prefer server-side breakdown, fall back to client calc
  const rows = analysis?.entropy?.breakdown?.length
    ? analysis.entropy.breakdown
    : fingerprint
      ? buildEntropyBreakdown(fingerprint)
      : [];

  const totalBits = analysis?.entropy?.total_bits
    || rows.filter(r => r.active !== false).reduce((s, r) => s + (r.bits || 0), 0);

  const uniqueness = analysis?.uniqueness || calcUniquenessScore(rows);
  const riskColor  = uniqueness.risk === 'HIGH' ? '#E24B4A'
                   : uniqueness.risk === 'MEDIUM' ? '#EF9F27' : '#1D9E75';

  const sorted = [...rows].sort((a, b) => (b.bits || 0) - (a.bits || 0));
  const MAX    = 18;

  if (!fingerprint && !rows.length) {
    return <div className="panel-empty">Run a scan to generate the entropy map.</div>;
  }

  return (
    <div className="entropy-map">

      {/* Total entropy summary */}
      <div className="entropy-summary">
        <div className="ent-sum-block">
          <div className="ent-sum-label">Total Entropy</div>
          <div className="ent-sum-val" style={{ color: riskColor }}>
            {parseFloat(totalBits).toFixed(1)} bits
          </div>
        </div>
        <div className="ent-sum-block">
          <div className="ent-sum-label">Uniqueness</div>
          <div className="ent-sum-val" style={{ color: riskColor }}>
            {uniqueness.score}/100
          </div>
        </div>
        <div className="ent-sum-block">
          <div className="ent-sum-label">1 in X Browsers</div>
          <div className="ent-sum-val" style={{ color: riskColor }}>
            {uniqueness.oneInX || formatBigNum(uniqueness.oneInRaw || 1)}
          </div>
        </div>
        <div className="ent-sum-block">
          <div className="ent-sum-label">Profile</div>
          <div className="ent-sum-val" style={{ color: riskColor, fontSize: 18 }}>
            {uniqueness.label}
          </div>
        </div>
      </div>

      {/* Per-signal bars */}
      <div className="entropy-rows">
        {sorted.map((row, i) => {
          const bits  = row.bits || 0;
          const pct   = Math.min(100, Math.round((bits / MAX) * 100));
          const col   = barColor(bits);
          const oneIn = row.oneIn || row.uniqueness_1_in;

          return (
            <div className="ent-row" key={i}>
              <div className="ent-row-name">
                {row.label || row.signal}
              </div>
              <div className="ent-row-bar-wrap">
                <div className="ent-row-bar-bg">
                  <div className="ent-row-bar-fill"
                    style={{ width: `${pct}%`, background: col,
                      transition: `width ${0.4 + i * 0.04}s ease` }} />
                </div>
              </div>
              <div className="ent-row-bits" style={{ color: col }}>
                {bits.toFixed(1)} bits
              </div>
              <div className="ent-row-1in">
                {oneIn ? `1 in ${formatBigNum(oneIn)}` : '—'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="entropy-legend">
        <span><span className="leg-dot" style={{ background: '#E24B4A' }} />
          {'>'}12 bits — Highly unique
        </span>
        <span><span className="leg-dot" style={{ background: '#EF9F27' }} />
          7–12 bits — Moderately unique
        </span>
        <span><span className="leg-dot" style={{ background: '#1D9E75' }} />
          {'<'}7 bits — Common value
        </span>
      </div>
    </div>
  );
}
