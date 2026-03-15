/*
 * Spectre Browser Fingerprint Analyzer
 * Frontend: Main App Component
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 * GitHub: github.com/hellrider978
 * Year: 2026
 * License: MIT
 */

import { useState, useEffect } from 'react';
import { useFingerprint } from '../hooks/useFingerprint';
import SignalsPanel    from '../components/SignalsPanel';
import EntropyMap      from '../components/EntropyMap';
import SessionTracker  from '../components/SessionTracker';
import SpoofingPanel   from '../components/SpoofingPanel';
import MitigationPanel from '../components/MitigationPanel';
import ScoreRing       from '../components/ScoreRing';
import '../styles/main.css';

const TABS = ['Signals', 'Entropy Map', 'Session Track', 'Spoofing', 'Mitigations'];

export default function App() {
  const { data, progress, scanning, error, scan } = useFingerprint();
  const [activeTab, setActiveTab] = useState(0);

  // Auto-scan on load
  useEffect(() => { scan(); }, []);

  const fp  = data?.fingerprint;
  const an  = data?.analysis;

  async function downloadReport(format) {
    if (!fp || !an) return;
    try {
      const res = await fetch(`/api/report/${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint: fp, analysis: an }),
      });
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `spectre-report-${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Report generation failed: ' + e.message);
    }
  }

  return (
    <div className="sp-app">
      {/* ── Banner ───────────────────────────────────────── */}
      <header className="sp-header">
        <div className="sp-header-inner">
          <div className="sp-brand">
            <div className="sp-wordmark">SPECTRE</div>
            <div className="sp-tagline">Browser Fingerprint Intelligence Analyzer</div>
          </div>
          <div className="sp-header-actions">
            <button className="sp-btn sp-btn-outline" onClick={scan} disabled={scanning}>
              {scanning ? `Scanning… ${progress}%` : '▶ Rescan'}
            </button>
            {data && <>
              <button className="sp-btn sp-btn-ghost" onClick={() => downloadReport('html')}>↓ HTML Report</button>
              <button className="sp-btn sp-btn-ghost" onClick={() => downloadReport('json')}>↓ JSON</button>
            </>}
          </div>
          <div className="sp-credit">
            <span>@HACKEROFHELL</span>
            <a href="https://github.com/hellrider978" target="_blank" rel="noreferrer">github.com/hellrider978</a>
            <span className="sp-ver">v1.0</span>
          </div>
        </div>
        {scanning && (
          <div className="sp-progress-bar">
            <div className="sp-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}
      </header>

      <main className="sp-main">
        {/* ── Scanning state ─────────────────────────────── */}
        {scanning && !data && (
          <div className="sp-loading">
            <div className="sp-loading-inner">
              <div className="sp-spinner" />
              <div className="sp-loading-label">Collecting browser signals…</div>
              <div className="sp-loading-sub">{progress}% complete</div>
            </div>
          </div>
        )}

        {error && (
          <div className="sp-error">
            <strong>Scan Error:</strong> {error}
          </div>
        )}

        {data && (
          <>
            {/* ── Score + Metrics ───────────────────────── */}
            <section className="sp-overview">
              <ScoreRing
                score={an?.uniqueness?.score || 0}
                oneIn={an?.uniqueness?.one_in_x || '—'}
                label={an?.uniqueness?.label || '—'}
                risk={an?.risk_level || 'UNKNOWN'}
              />
              <div className="sp-overview-metrics">
                <MetricCard label="Entropy" value={`${an?.entropy?.total_bits || 0} bits`} sub="Total uniqueness" danger />
                <MetricCard label="Risk Level" value={an?.risk_level || '—'} sub="Tracking risk" danger={an?.risk_level === 'HIGH'} warn={an?.risk_level === 'MEDIUM'} />
                <MetricCard label="WebRTC" value={fp?.webrtc?.leak_detected ? 'LEAKED' : 'SECURE'} sub="IP leak status" danger={fp?.webrtc?.leak_detected} safe={!fp?.webrtc?.leak_detected} />
                <MetricCard label="Stability" value={`${an?.stability?.stability || '—'}%`} sub="Cross-session" warn />
                <MetricCard label="Spoofing" value={`${an?.spoofing?.total_detected || 0} signals`} sub="Anti-tracking detected" warn={an?.spoofing?.total_detected > 0} />
                <MetricCard label="Persistence" value={`${fp?.storage?.persistence_score || 0}%`} sub="Storage tracking" danger={fp?.storage?.persistence_score > 60} />
              </div>
            </section>

            {/* ── Tabs ──────────────────────────────────── */}
            <div className="sp-tabs">
              {TABS.map((t, i) => (
                <button
                  key={t}
                  className={`sp-tab${activeTab === i ? ' active' : ''}`}
                  onClick={() => setActiveTab(i)}
                >{t}</button>
              ))}
            </div>

            {/* ── Tab Content ───────────────────────────── */}
            <div className="sp-panel">
              {activeTab === 0 && <SignalsPanel fingerprint={fp} analysis={an} />}
              {activeTab === 1 && <EntropyMap breakdown={an?.entropy?.breakdown || []} total={an?.entropy?.total_bits} />}
              {activeTab === 2 && <SessionTracker storage={fp?.storage} stability={an?.stability} />}
              {activeTab === 3 && <SpoofingPanel spoofing={an?.spoofing} />}
              {activeTab === 4 && <MitigationPanel recommendations={an?.recommendations || []} />}
            </div>
          </>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="sp-footer">
        <div className="sp-footer-inner">
          <span>Spectre v1.0 · Fingerprint Intelligence Analyzer</span>
          <span>Developed by <strong>@HACKEROFHELL</strong> (Rajesh Bajiya) · <a href="https://github.com/hellrider978">github.com/hellrider978</a> · MIT License · 2026</span>
        </div>
      </footer>
    </div>
  );
}

function MetricCard({ label, value, sub, danger, warn, safe }) {
  const cls = danger ? 'danger' : warn ? 'warn' : safe ? 'safe' : '';
  return (
    <div className="sp-metric">
      <div className="sp-metric-label">{label}</div>
      <div className={`sp-metric-val ${cls}`}>{value}</div>
      <div className="sp-metric-sub">{sub}</div>
    </div>
  );
}
