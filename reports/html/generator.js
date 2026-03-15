/*
 * Spectre Browser Fingerprint Analyzer
 * Module: HTML Report Generator
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 * GitHub: github.com/hellrider978
 * Year: 2026
 * License: MIT
 */

/**
 * Generates a standalone HTML report from analysis results.
 * The report is self-contained (no external dependencies).
 */
function generateHTMLReport(fingerprint, analysis) {
  const ts = new Date(fingerprint.timestamp || Date.now()).toLocaleString();
  const score = analysis.uniqueness?.score || 0;
  const riskColor = score > 80 ? '#E24B4A' : score > 50 ? '#EF9F27' : '#1D9E75';
  const entropy = analysis.entropy?.total_bits || 0;

  const signalRows = buildSignalRows(fingerprint, analysis);
  const entropyRows = buildEntropyRows(analysis.entropy?.breakdown || []);
  const recRows = buildRecRows(analysis.recommendations || []);
  const spoofRows = buildSpoofRows(analysis.spoofing || {});

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Spectre Report – ${ts}</title>
<style>
  /* Spectre Report Stylesheet */
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Segoe UI',system-ui,sans-serif; background:#0d0d0f; color:#e0ddd8; line-height:1.6; }
  .container { max-width:960px; margin:0 auto; padding:40px 24px; }
  
  /* Header */
  .header { border-bottom:1px solid #2a2a2e; padding-bottom:24px; margin-bottom:32px; }
  .header-top { display:flex; justify-content:space-between; align-items:flex-start; gap:24px; flex-wrap:wrap; }
  .logo { font-family:'Courier New',monospace; font-size:28px; letter-spacing:8px; color:#E24B4A; }
  .logo-sub { font-size:13px; color:#666; letter-spacing:2px; margin-top:4px; }
  .scan-meta { text-align:right; font-size:13px; color:#666; }
  .scan-meta strong { color:#999; }
  
  /* Score section */
  .score-section { display:grid; grid-template-columns:160px 1fr; gap:24px; margin-bottom:32px; align-items:start; }
  .score-ring { text-align:center; padding:20px; background:#141416; border:1px solid #222; border-radius:12px; }
  .score-num { font-family:'Courier New',monospace; font-size:52px; color:${riskColor}; line-height:1; }
  .score-label { font-size:12px; color:#666; text-transform:uppercase; letter-spacing:1px; margin-top:4px; }
  .score-sub { font-size:13px; color:${riskColor}; margin-top:8px; font-weight:600; }
  .metrics-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
  .metric { background:#141416; border:1px solid #222; border-radius:8px; padding:14px; }
  .metric-label { font-size:11px; color:#555; text-transform:uppercase; letter-spacing:1px; }
  .metric-val { font-family:'Courier New',monospace; font-size:18px; margin-top:4px; }
  .metric-sub { font-size:11px; color:#555; margin-top:2px; }
  
  /* Sections */
  .section { margin-bottom:32px; }
  .section-title { font-size:13px; text-transform:uppercase; letter-spacing:2px; color:#666; border-bottom:1px solid #1e1e22; padding-bottom:8px; margin-bottom:16px; }
  
  /* Tables */
  table { width:100%; border-collapse:collapse; font-size:13px; }
  th { text-align:left; padding:8px 12px; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#555; border-bottom:1px solid #1e1e22; }
  td { padding:9px 12px; border-bottom:1px solid #1a1a1e; color:#ccc; }
  tr:last-child td { border-bottom:none; }
  tr:hover td { background:#141416; }
  .tag { display:inline-block; padding:2px 8px; border-radius:3px; font-size:11px; font-family:'Courier New',monospace; letter-spacing:0.5px; }
  .tag-danger { background:rgba(226,75,74,0.15); color:#E24B4A; border:1px solid rgba(226,75,74,0.3); }
  .tag-warn   { background:rgba(239,159,39,0.15); color:#EF9F27; border:1px solid rgba(239,159,39,0.3); }
  .tag-safe   { background:rgba(29,158,117,0.15); color:#1D9E75; border:1px solid rgba(29,158,117,0.3); }
  .hash { font-family:'Courier New',monospace; font-size:12px; color:#7FB3D3; }
  
  /* Entropy bars */
  .ebar-bg { background:#1a1a1e; border-radius:2px; height:4px; width:140px; display:inline-block; vertical-align:middle; margin-left:8px; }
  .ebar-fg { height:100%; border-radius:2px; background:${riskColor}; }
  
  /* Recommendations */
  .rec { background:#141416; border:1px solid #222; border-radius:8px; padding:14px 16px; margin-bottom:10px; display:flex; gap:12px; }
  .rec-prio { flex-shrink:0; padding:2px 8px; border-radius:3px; font-size:11px; font-family:'Courier New',monospace; align-self:flex-start; margin-top:2px; }
  .rec-title { font-size:14px; font-weight:600; margin-bottom:4px; color:#e0ddd8; }
  .rec-detail { font-size:12px; color:#666; margin-bottom:8px; }
  .rec-actions { list-style:none; }
  .rec-actions li { font-size:12px; color:#888; padding:2px 0; }
  .rec-actions li::before { content:"→ "; color:#555; }
  
  /* Footer */
  .footer { border-top:1px solid #1e1e22; padding-top:20px; margin-top:40px; display:flex; justify-content:space-between; align-items:center; font-size:12px; color:#444; }
  .footer a { color:#555; text-decoration:none; }
  .footer-brand { font-family:'Courier New',monospace; }
  
  /* Metadata hidden watermark */
  .metadata { display:none; }
</style>
</head>
<body>
<div class="container">

  <!-- Header -->
  <div class="header">
    <div class="header-top">
      <div>
        <div class="logo">SPECTRE</div>
        <div class="logo-sub">Browser Fingerprint Analysis Report</div>
      </div>
      <div class="scan-meta">
        <strong>Generated:</strong> ${ts}<br>
        <strong>Tool:</strong> Spectre v1.0<br>
        <strong>Developer:</strong> @HACKEROFHELL<br>
        <strong>Author:</strong> Rajesh Bajiya
      </div>
    </div>
  </div>

  <!-- Score -->
  <div class="score-section">
    <div class="score-ring">
      <div class="score-num">${score}</div>
      <div class="score-label">/ 100 uniqueness</div>
      <div class="score-sub">${analysis.uniqueness?.label || 'Unknown'}</div>
      <div style="font-size:12px;color:#555;margin-top:8px">1 in ${analysis.uniqueness?.one_in_x || '?'} browsers</div>
    </div>
    <div class="metrics-grid">
      <div class="metric">
        <div class="metric-label">Entropy</div>
        <div class="metric-val" style="color:${riskColor}">${entropy} bits</div>
        <div class="metric-sub">Total across all signals</div>
      </div>
      <div class="metric">
        <div class="metric-label">Risk Level</div>
        <div class="metric-val" style="color:${riskColor}">${analysis.risk_level || '—'}</div>
        <div class="metric-sub">Tracking risk assessment</div>
      </div>
      <div class="metric">
        <div class="metric-label">WebRTC</div>
        <div class="metric-val" style="color:${fingerprint.webrtc?.leak_detected ? '#E24B4A' : '#1D9E75'}">${fingerprint.webrtc?.leak_detected ? 'LEAKED' : 'SECURE'}</div>
        <div class="metric-sub">IP leak status</div>
      </div>
      <div class="metric">
        <div class="metric-label">Stability</div>
        <div class="metric-val" style="color:#EF9F27">${analysis.stability?.stability || '—'}%</div>
        <div class="metric-sub">Cross-session</div>
      </div>
      <div class="metric">
        <div class="metric-label">Spoofing</div>
        <div class="metric-val" style="color:#EF9F27">${analysis.spoofing?.total_detected || 0} signals</div>
        <div class="metric-sub">Anti-tracking detected</div>
      </div>
      <div class="metric">
        <div class="metric-label">Storage</div>
        <div class="metric-val" style="color:${riskColor}">${fingerprint.storage?.persistence_score || 0}%</div>
        <div class="metric-sub">Persistence score</div>
      </div>
    </div>
  </div>

  <!-- Signals -->
  <div class="section">
    <div class="section-title">Fingerprint Signals</div>
    <table>
      <thead><tr><th>Signal</th><th>Hash / Value</th><th>Status</th></tr></thead>
      <tbody>${signalRows}</tbody>
    </table>
  </div>

  <!-- Entropy -->
  <div class="section">
    <div class="section-title">Entropy Breakdown</div>
    <table>
      <thead><tr><th>Signal</th><th>Entropy (bits)</th><th>1 in X users</th></tr></thead>
      <tbody>${entropyRows}</tbody>
    </table>
  </div>

  <!-- Spoofing -->
  <div class="section">
    <div class="section-title">Spoofing & Anti-Tracking Detection</div>
    <table>
      <thead><tr><th>Check</th><th>Result</th><th>Severity</th></tr></thead>
      <tbody>${spoofRows}</tbody>
    </table>
  </div>

  <!-- Recommendations -->
  <div class="section">
    <div class="section-title">Security Recommendations</div>
    ${recRows}
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-brand">Generated by Spectre v1.0 · @HACKEROFHELL</div>
    <div><a href="https://github.com/hellrider978">github.com/hellrider978</a> · Rajesh Bajiya · 2026 · MIT License</div>
  </div>

</div>

<!-- Metadata watermark (JSON attribution) -->
<script type="application/json" id="spectre-metadata" class="metadata">
{
  "tool": "Spectre",
  "version": "1.0",
  "developer": "@HACKEROFHELL",
  "author": "Rajesh Bajiya",
  "repository": "github.com/hellrider978",
  "generated": "${ts}",
  "license": "MIT"
}
</script>

</body>
</html>`;
}

function buildSignalRows(fp, analysis) {
  const signals = [
    { name: 'Canvas Hash',       val: fp.canvas?.canvas_hash || '—',     status: fp.canvas?.status === 'blocked' ? 'BLOCKED' : 'ACTIVE' },
    { name: 'WebGL Hash',        val: fp.webgl?.webgl_hash || '—',       status: fp.webgl?.status === 'success' ? 'ACTIVE' : 'BLOCKED' },
    { name: 'WebGL Renderer',    val: fp.webgl?.webgl_renderer || '—',   status: 'INFO' },
    { name: 'Audio Hash',        val: fp.audio?.audio_hash || '—',       status: fp.audio?.status === 'success' ? 'ACTIVE' : fp.audio?.status },
    { name: 'Font Hash',         val: fp.fonts?.font_hash || '—',        status: fp.fonts?.font_count ? `${fp.fonts.font_count} fonts` : '—' },
    { name: 'WebRTC Local IPs',  val: fp.webrtc?.local_ips?.join(', ') || 'None', status: fp.webrtc?.leak_detected ? 'LEAKED' : 'SECURE' },
    { name: 'User Agent',        val: (fp.browser?.user_agent || '').substring(0, 60) + '…', status: 'INFO' },
    { name: 'Platform',          val: fp.hardware?.platform || '—',      status: 'INFO' },
    { name: 'Timezone',          val: fp.browser?.timezone || '—',       status: 'INFO' },
    { name: 'Screen',            val: `${fp.hardware?.screen?.width}×${fp.hardware?.screen?.height} @${fp.hardware?.screen?.dpr}x`, status: 'INFO' },
    { name: 'TLS JA3',           val: analysis.tls?.ja3_hash || '—',     status: analysis.tls?.browser_family || '—' },
  ];

  const statusTag = (s) => {
    if (['ACTIVE','UNIQUE'].includes(s)) return `<span class="tag tag-danger">${s}</span>`;
    if (['BLOCKED','SECURE'].includes(s)) return `<span class="tag tag-safe">${s}</span>`;
    if (s === 'LEAKED') return `<span class="tag tag-danger">LEAKED</span>`;
    return `<span class="tag" style="background:#1e1e22;color:#666">${s}</span>`;
  };

  return signals.map(s => `
    <tr>
      <td>${s.name}</td>
      <td><span class="hash">${s.val}</span></td>
      <td>${statusTag(s.status)}</td>
    </tr>`).join('');
}

function buildEntropyRows(breakdown) {
  return breakdown.map(e => {
    const pct = Math.min(100, Math.round(e.bits / 20 * 100));
    const col = e.bits > 12 ? '#E24B4A' : e.bits > 7 ? '#EF9F27' : '#1D9E75';
    return `<tr>
      <td>${e.signal}</td>
      <td>${e.bits} bits <span class="ebar-bg"><span class="ebar-fg" style="width:${pct}%;background:${col}"></span></span></td>
      <td>1 in ${e.uniqueness_1_in?.toLocaleString() || '?'}</td>
    </tr>`;
  }).join('') || '<tr><td colspan="3" style="color:#444;text-align:center">No breakdown available</td></tr>';
}

function buildRecRows(recs) {
  const prioColor = { CRITICAL: '#E24B4A', HIGH: '#EF9F27', MEDIUM: '#378ADD', LOW: '#888' };
  return recs.map(r => `
    <div class="rec">
      <div class="rec-prio" style="background:${prioColor[r.priority]}22;color:${prioColor[r.priority]};border:1px solid ${prioColor[r.priority]}44">${r.priority}</div>
      <div>
        <div class="rec-title">${r.title}</div>
        <div class="rec-detail">${r.detail || ''}</div>
        <ul class="rec-actions">
          ${(r.actions || []).map(a => `<li>${a}</li>`).join('')}
        </ul>
      </div>
    </div>`).join('') || '<p style="color:#444;font-size:13px">No recommendations generated.</p>';
}

function buildSpoofRows(spoofing) {
  const checks = spoofing.checks || {};
  return Object.values(checks).map(c => {
    const statusTag = c.detected
      ? `<span class="tag tag-safe">DETECTED</span>`
      : `<span class="tag tag-danger">NOT DETECTED</span>`;
    const sevTag = c.severity === 'CRITICAL' ? `<span class="tag tag-danger">${c.severity}</span>`
      : c.severity === 'HIGH' ? `<span class="tag tag-warn">${c.severity}</span>`
      : `<span class="tag" style="background:#1e1e22;color:#666">${c.severity || '—'}</span>`;
    return `<tr><td>${c.name}</td><td>${statusTag}</td><td>${sevTag}</td></tr>`;
  }).join('') || '<tr><td colspan="3" style="color:#444;text-align:center">No spoofing checks run</td></tr>';
}

module.exports = { generateHTMLReport };
