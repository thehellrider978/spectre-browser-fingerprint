/*
 * Spectre Browser Fingerprint Analyzer
 * Main App — Tabbed Dashboard
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 * GitHub: github.com/hellrider978
 * Year: 2026 | License: MIT
 */

import { useState, useEffect, useCallback } from 'react';

// Components
import EntropyRing     from '../components/EntropyRing.jsx';
import FingerprintCard from '../components/FingerprintCard.jsx';
import ScanButton      from '../components/ScanButton.jsx';

// Panels
import Signals      from './Signals.jsx';
import EntropyMap   from './EntropyMap.jsx';
import SessionTrack from './SessionTrack.jsx';
import Spoofing     from './Spoofing.jsx';
import Mitigations  from './Mitigations.jsx';

// Scanner modules (barrel re-export from src/scanner/index.js)
import {
  getCanvasFingerprint,
  getWebGLFingerprint,
  getAudioFingerprint,
  getFontFingerprint,
  getWebRTCLeaks,
  getStorageFingerprint,
} from '../scanner/index.js';

// Utils
import { analyzeFingerprint, downloadHTMLReport, downloadJSONReport } from '../utils/api.js';
import { buildEntropyBreakdown, calcUniquenessScore }                 from '../utils/entropyCalc.js';
import { collectBrowserSignals, buildCompositeHash, recordSession }   from '../utils/fingerprintHash.js';

const TABS = [
  { id: 'signals',   label: 'Signals'      },
  { id: 'entropy',   label: 'Entropy Map'  },
  { id: 'sessions',  label: 'Session Track'},
  { id: 'spoofing',  label: 'Spoofing'     },
  { id: 'mitigations', label: 'Mitigations'},
];

export default function App() {
  const [tab,       setTab]       = useState('signals');
  const [scanning,  setScanning]  = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [error,     setError]     = useState(null);
  const [fp,        setFp]        = useState(null);   // raw fingerprint
  const [analysis,  setAnalysis]  = useState(null);   // server or client analysis

  const bump = useCallback((amount) =>
    setProgress(p => Math.min(p + amount, 95)), []);

  const runScan = useCallback(async () => {
    setScanning(true);
    setProgress(5);
    setError(null);

    try {
      // ── 1. Synchronous browser signals ─────────────────────────
      const base = collectBrowserSignals();
      bump(5);

      // ── 2. Async probes (parallel) ──────────────────────────────
      const [canvas, webgl, audio, fonts, webrtc, storage] = await Promise.all([
        getCanvasFingerprint().catch(e => ({ status: 'error', error: e.message })).then(r => { bump(12); return r; }),
        Promise.resolve().then(() => { try { return getWebGLFingerprint(); } catch(e) { return { status: 'error' }; }}).then(r => { bump(12); return r; }),
        getAudioFingerprint().catch(e => ({ status: 'error', error: e.message })).then(r => { bump(12); return r; }),
        Promise.resolve().then(() => { try { return getFontFingerprint(); } catch(e) { return { status: 'error' }; }}).then(r => { bump(12); return r; }),
        getWebRTCLeaks().catch(e => ({ status: 'error', error: e.message })).then(r => { bump(12); return r; }),
        getStorageFingerprint().catch(e => ({ status: 'error', error: e.message })).then(r => { bump(12); return r; }),
      ]);

      bump(5);

      // ── 3. Build composite fingerprint object ───────────────────
      const fingerprint = {
        timestamp: new Date().toISOString(),
        ...base,
        canvas,
        webgl,
        audio,
        fonts,
        webrtc,
        storage,
      };

      // Composite hash + session recording
      const compositeHash = buildCompositeHash(fingerprint);
      fingerprint._composite_hash = compositeHash;

      // Attach session history to storage object for SessionTrack
      const sessions = recordSession(compositeHash);
      fingerprint.storage = { ...fingerprint.storage, session_history: sessions };

      setFp(fingerprint);
      setProgress(90);

      // ── 4. Backend analysis (falls back to client-side) ─────────
      let an;
      try {
        an = await analyzeFingerprint(fingerprint);
      } catch {
        // Backend unavailable → client-side scoring
        const breakdown = buildEntropyBreakdown(fingerprint);
        const uniqueness = calcUniquenessScore(breakdown);
        an = {
          entropy:     { breakdown, total_bits: uniqueness.totalBits },
          uniqueness,
          stability:   { stability: 94, persistence: 'HIGH' },
          risk_level:  uniqueness.risk,
          spoofing:    null,
          recommendations: null,
          _source:     'client',
        };
      }

      setAnalysis(an);
      setProgress(100);

    } catch (err) {
      setError(err.message || 'Scan failed unexpectedly.');
    } finally {
      setScanning(false);
    }
  }, [bump]);

  // Auto-scan on mount
  useEffect(() => { runScan(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived display values ────────────────────────────────────
  const score   = analysis?.uniqueness?.score     ?? 0;
  const risk    = analysis?.uniqueness?.risk       ?? 'LOW';
  const oneIn   = analysis?.uniqueness?.oneInX     ?? analysis?.uniqueness?.one_in_x ?? '—';
  const label   = analysis?.uniqueness?.label      ?? '—';
  const entropy = analysis?.entropy?.total_bits    ?? 0;

  async function handleDownloadHTML() {
    if (!fp || !analysis) return;
    try { await downloadHTMLReport(fp, analysis); }
    catch(e) { alert('HTML report failed: ' + e.message); }
  }

  async function handleDownloadJSON() {
    if (!fp || !analysis) return;
    try { await downloadJSONReport(fp, analysis); }
    catch(e) { alert('JSON report failed: ' + e.message); }
  }

  return (
    <div className="sp-app">

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="sp-header">
        <div className="sp-header-inner">
          <div>
            <div className="sp-wordmark">SPECTRE</div>
            <div className="sp-tagline">Browser Fingerprint Intelligence Analyzer</div>
          </div>

          <div className="sp-header-actions">
            <ScanButton scanning={scanning} progress={progress} onClick={runScan} />
            {analysis && (
              <>
                <button className="sp-btn sp-btn-ghost" onClick={handleDownloadHTML}>
                  ↓ HTML Report
                </button>
                <button className="sp-btn sp-btn-ghost" onClick={handleDownloadJSON}>
                  ↓ JSON
                </button>
              </>
            )}
          </div>

          <div className="sp-credit">
            <strong>@HACKEROFHELL</strong>
            <a href="https://github.com/hellrider978" target="_blank" rel="noreferrer">
              github.com/hellrider978
            </a>
            <span className="sp-ver">v1.0</span>
          </div>
        </div>

        {/* Progress bar */}
        {scanning && (
          <div className="sp-progress">
            <div className="sp-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}
      </header>

      {/* ── Main ────────────────────────────────────────────────── */}
      <main className="sp-main">

        {/* Loading state */}
        {scanning && !fp && (
          <div className="sp-loading">
            <div className="sp-loading-inner">
              <div className="sp-spinner" />
              <div className="sp-loading-label">Collecting browser signals…</div>
              <div className="sp-loading-sub">{progress}% complete</div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="sp-error">
            <strong>Scan error:</strong> {error}
          </div>
        )}

        {/* Dashboard — shown once first scan completes */}
        {fp && (
          <>
            {/* ── Overview: ring + metric cards ─────────────────── */}
            <section className="sp-overview">
              <EntropyRing
                score={score}
                risk={risk}
                oneIn={oneIn}
                label={label}
              />

              <div className="sp-metrics-grid">
                <FingerprintCard
                  label="Total Entropy"
                  value={`${parseFloat(entropy).toFixed(1)} bits`}
                  sub="Combined uniqueness"
                  accent={risk === 'HIGH' ? 'danger' : risk === 'MEDIUM' ? 'warn' : 'safe'}
                />
                <FingerprintCard
                  label="Risk Level"
                  value={risk}
                  sub="Tracking risk"
                  accent={risk === 'HIGH' ? 'danger' : risk === 'MEDIUM' ? 'warn' : 'safe'}
                />
                <FingerprintCard
                  label="WebRTC"
                  value={fp.webrtc?.leak_detected ? 'LEAKED' : 'SECURE'}
                  sub="IP leak status"
                  accent={fp.webrtc?.leak_detected ? 'danger' : 'safe'}
                />
                <FingerprintCard
                  label="Stability"
                  value={`${analysis?.stability?.stability ?? 94}%`}
                  sub="Cross-session"
                  accent="warn"
                />
                <FingerprintCard
                  label="Spoofing"
                  value={`${analysis?.spoofing?.total_detected ?? 0} signals`}
                  sub="Anti-tracking detected"
                  accent={analysis?.spoofing?.total_detected > 0 ? 'safe' : 'muted'}
                />
                <FingerprintCard
                  label="Storage Persist"
                  value={`${fp.storage?.persistence_score ?? 0}%`}
                  sub="Tracking vectors"
                  accent={fp.storage?.persistence_score > 60 ? 'danger' : 'warn'}
                />
              </div>
            </section>

            {/* ── Tabs ──────────────────────────────────────────── */}
            <nav className="sp-tabs" role="tablist">
              {TABS.map(t => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={tab === t.id}
                  className={`sp-tab${tab === t.id ? ' active' : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </nav>

            {/* ── Panel content ─────────────────────────────────── */}
            <div role="tabpanel">
              {tab === 'signals'      && <Signals      fingerprint={fp} analysis={analysis} />}
              {tab === 'entropy'      && <EntropyMap   fingerprint={fp} analysis={analysis} />}
              {tab === 'sessions'     && <SessionTrack fingerprint={fp} analysis={analysis} />}
              {tab === 'spoofing'     && <Spoofing     fingerprint={fp} analysis={analysis} />}
              {tab === 'mitigations'  && <Mitigations  analysis={analysis} />}
            </div>
          </>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="sp-footer">
        <div className="sp-footer-inner">
          <span>Spectre v1.0 · Browser Fingerprint Intelligence Analyzer</span>
          <span>
            Developed by <strong>@HACKEROFHELL</strong> (Rajesh Bajiya) ·{' '}
            <a href="https://github.com/hellrider978" target="_blank" rel="noreferrer">
              github.com/hellrider978
            </a>{' '}
            · MIT License · 2026
          </span>
        </div>
      </footer>

    </div>
  );
}
