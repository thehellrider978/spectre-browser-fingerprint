/*
 * Spectre – SignalsPanel component
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 */
export default function SignalsPanel({ fingerprint: fp, analysis: an }) {
  if (!fp) return null;

  const signals = [
    { name: 'Canvas Hash',        val: fp.canvas?.canvas_hash || '—',              entropy: fp.canvas?.canvas_entropy,    status: fp.canvas?.status === 'blocked' ? 'BLOCKED' : 'UNIQUE',    pct: 88 },
    { name: 'WebGL Renderer',     val: fp.webgl?.webgl_renderer || '—',            entropy: 16.8,  status: fp.webgl?.status === 'success' ? 'UNIQUE' : 'BLOCKED',     pct: 92 },
    { name: 'WebGL Hash',         val: fp.webgl?.webgl_hash || '—',                entropy: null,  status: 'INFO',   pct: 0 },
    { name: 'Audio Hash',         val: fp.audio?.audio_hash || '—',                entropy: fp.audio?.audio_entropy,      status: fp.audio?.status === 'success' ? 'MEDIUM' : fp.audio?.status?.toUpperCase() || 'UNKNOWN', pct: 75 },
    { name: 'Font Set',           val: `${fp.fonts?.font_count || 0} fonts detected`, entropy: null, status: fp.fonts?.font_count > 80 ? 'HIGH' : 'MEDIUM',          pct: 82 },
    { name: 'Font Hash',          val: fp.fonts?.font_hash || '—',                 entropy: null,  status: 'INFO',   pct: 0 },
    { name: 'Screen',             val: `${fp.hardware?.screen?.width}×${fp.hardware?.screen?.height} @${fp.hardware?.screen?.dpr}x`, entropy: 5.6, status: 'COMMON', pct: 45 },
    { name: 'CPU Cores',          val: fp.hardware?.cpu_cores || '—',              entropy: 2.1,   status: 'COMMON', pct: 30 },
    { name: 'Device Memory',      val: `${fp.hardware?.device_memory || '—'} GB`,  entropy: 1.8,   status: 'COMMON', pct: 25 },
    { name: 'User Agent',         val: (fp.browser?.user_agent || '').substring(0, 72) + '…', entropy: 8.3, status: 'MEDIUM', pct: 55 },
    { name: 'Timezone',           val: fp.browser?.timezone || '—',                entropy: 3.8,   status: 'MEDIUM', pct: 48 },
    { name: 'Language',           val: fp.browser?.language || '—',                entropy: 2.9,   status: 'COMMON', pct: 35 },
    { name: 'WebRTC Local IPs',   val: fp.webrtc?.local_ips?.join(', ') || 'None', entropy: fp.webrtc?.leak_detected ? 17.1 : 0, status: fp.webrtc?.leak_detected ? 'LEAKED' : 'SECURE', pct: fp.webrtc?.leak_detected ? 95 : 0 },
    { name: 'TLS JA3 Hash',       val: an?.tls?.ja3_hash || '—',                   entropy: 10.7,  status: 'MEDIUM', pct: 70 },
    { name: 'Storage Persistence',val: `${fp.storage?.persistence_score || 0}% (${Object.keys(fp.storage || {}).filter(k => fp.storage[k]?.available).length} vectors)`, entropy: null, status: fp.storage?.persistence_score > 60 ? 'HIGH' : 'MEDIUM', pct: fp.storage?.persistence_score || 0 },
    { name: 'WebDriver',          val: fp.browser?.webdriver ? 'true (DETECTED)' : 'false', entropy: null, status: fp.browser?.webdriver ? 'BOT' : 'OK', pct: 0 },
    { name: 'Plugins',            val: `${fp.browser?.plugins_count || 0} plugins`, entropy: 4.5,  status: 'MEDIUM', pct: 40 },
    { name: 'Do Not Track',       val: fp.browser?.do_not_track || 'null',          entropy: 0.4,   status: 'LOW',    pct: 10 },
  ];

  const statusColor = (s) => {
    if (['UNIQUE','HIGH','LEAKED','BOT'].includes(s)) return 'var-danger';
    if (['MEDIUM','PARTIAL'].includes(s)) return 'var-warn';
    if (['BLOCKED','SECURE','OK'].includes(s)) return 'var-safe';
    return 'var-muted';
  };

  return (
    <div className="sp-signals-table">
      <div className="sp-table-header">
        <span>Signal</span>
        <span>Value / Hash</span>
        <span>Entropy</span>
        <span>Status</span>
      </div>
      {signals.map((s, i) => (
        <div className="sp-table-row" key={i}>
          <div className="sp-sig-name">{s.name}</div>
          <div className="sp-sig-val mono">{s.val}</div>
          <div className="sp-sig-bar">
            {s.pct > 0 && (
              <>
                <div className="sp-bar-bg">
                  <div className="sp-bar-fill" style={{
                    width: `${s.pct}%`,
                    background: s.pct > 70 ? 'var(--c-danger)' : s.pct > 40 ? 'var(--c-warn)' : 'var(--c-safe)'
                  }} />
                </div>
                {s.entropy && <span className="sp-entropy-bits">{s.entropy}b</span>}
              </>
            )}
          </div>
          <div className={`sp-status-tag ${statusColor(s.status)}`}>{s.status}</div>
        </div>
      ))}
    </div>
  );
}
