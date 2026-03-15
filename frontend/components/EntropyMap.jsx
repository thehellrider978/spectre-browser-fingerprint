/*
 * Spectre – EntropyMap component
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 */
export default function EntropyMap({ breakdown, total }) {
  const maxBits = 20;

  // Fallback data if backend not available
  const data = breakdown.length > 0 ? breakdown : [
    { signal: 'WebRTC Local IP', bits: 17.1, uniqueness_1_in: 140000 },
    { signal: 'WebGL',           bits: 16.8, uniqueness_1_in: 115000 },
    { signal: 'Canvas',          bits: 14.2, uniqueness_1_in: 18000 },
    { signal: 'Fonts',           bits: 12.9, uniqueness_1_in: 7600 },
    { signal: 'Audio',           bits: 11.4, uniqueness_1_in: 2700 },
    { signal: 'TLS JA3',         bits: 10.7, uniqueness_1_in: 1700 },
    { signal: 'Browser UA',      bits: 8.3,  uniqueness_1_in: 320 },
    { signal: 'Screen',          bits: 5.6,  uniqueness_1_in: 48 },
    { signal: 'Timezone',        bits: 3.8,  uniqueness_1_in: 14 },
    { signal: 'Language',        bits: 2.9,  uniqueness_1_in: 7 },
  ];

  const barColor = (bits) => bits > 12 ? 'var(--c-danger)' : bits > 7 ? 'var(--c-warn)' : 'var(--c-safe)';
  const fmt1in = (n) => {
    if (!n) return '—';
    if (n >= 1e9)  return (n/1e9).toFixed(1)+'B';
    if (n >= 1e6)  return (n/1e6).toFixed(1)+'M';
    if (n >= 1e3)  return (n/1e3).toFixed(0)+'k';
    return n.toString();
  };

  return (
    <div className="sp-entropy-map">
      {/* Total entropy banner */}
      <div className="sp-entropy-total">
        <div className="sp-et-label">Total entropy</div>
        <div className="sp-et-num">{total || data.reduce((s,d) => s+d.bits, 0).toFixed(1)} bits</div>
        <div className="sp-et-sub">Combined across all fingerprint vectors</div>
      </div>

      {/* Signal breakdown bars */}
      <div className="sp-entropy-rows">
        {[...data].sort((a,b) => b.bits - a.bits).map((d, i) => (
          <div className="sp-erow" key={i}>
            <div className="sp-erow-name">{d.signal}</div>
            <div className="sp-erow-bar-wrap">
              <div className="sp-erow-bar-bg">
                <div
                  className="sp-erow-bar-fill"
                  style={{ width: `${Math.min(100, (d.bits / maxBits) * 100)}%`, background: barColor(d.bits) }}
                />
              </div>
            </div>
            <div className="sp-erow-bits" style={{ color: barColor(d.bits) }}>{d.bits.toFixed(1)} bits</div>
            <div className="sp-erow-1in">1 in {fmt1in(d.uniqueness_1_in)}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="sp-entropy-legend">
        <span><span className="sp-leg-dot" style={{background:'var(--c-danger)'}}/>{'>'} 12 bits — Highly unique</span>
        <span><span className="sp-leg-dot" style={{background:'var(--c-warn)'}}/>7–12 bits — Moderately unique</span>
        <span><span className="sp-leg-dot" style={{background:'var(--c-safe)'}}/>{'<'} 7 bits — Common value</span>
      </div>
    </div>
  );
}
