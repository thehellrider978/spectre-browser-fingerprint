/*
 * Spectre – Spoofing Detection Panel
 * Detects canvas noise, WebGL spoof, WebDriver, UA mismatch, timezone/language inconsistency.
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 * GitHub: github.com/hellrider978
 * Year: 2026 | License: MIT
 */
import RiskBadge from '../components/RiskBadge.jsx';

/* Run client-side spoofing checks when backend analysis is not available */
function clientSpoofChecks(fp) {
  if (!fp) return [];
  const ua       = fp.browser?.user_agent || '';
  const platform = fp.hardware?.platform   || '';
  const tz       = fp.browser?.timezone    || '';
  const lang     = fp.browser?.language    || '';
  const renderer = fp.webgl?.webgl_renderer || '';

  const uaOs   = /Macintosh/i.test(ua) ? 'mac' : /Windows/i.test(ua) ? 'win' : /Linux/i.test(ua) ? 'linux' : null;
  const platOs = /Mac/i.test(platform) ? 'mac' : /Win/i.test(platform) ? 'win' : /Linux/i.test(platform) ? 'linux' : null;
  const uaMismatch = uaOs && platOs && uaOs !== platOs;

  const softRenderer = /swiftshader|llvmpipe|software|mesa/i.test(renderer);

  const tzRegion = /^America/i.test(tz) ? 'am' : /^Europe/i.test(tz) ? 'eu' : /^Asia/i.test(tz) ? 'as' : null;
  const langBase = lang.split('-')[0].toLowerCase();
  const euLangs  = ['en','de','fr','es','it','nl','pl','pt','sv'];
  const asLangs  = ['zh','ja','ko','hi','th','vi','id','ar'];
  const langReg  = euLangs.includes(langBase) ? 'eu' : asLangs.includes(langBase) ? 'as' : null;
  const tzLangMismatch = tzRegion && langReg && tzRegion !== langReg && tzRegion !== 'am';

  return [
    {
      key:         'canvas_noise',
      name:        'Canvas noise injection',
      description: 'Canvas hash consistency (single-session check)',
      detected:    false, // requires multi-render comparison — flagged false on single scan
      severity:    'MEDIUM',
      hint:        'CanvasBlocker, JShelter, Brave Shields',
    },
    {
      key:         'webgl_spoof',
      name:        'WebGL renderer spoofing',
      description: softRenderer
        ? `Software renderer detected (${renderer.split('(')[0].trim()}) — possible spoofing`
        : `Real hardware GPU exposed (${renderer.split('(')[0].trim()})`,
      detected:    softRenderer,
      severity:    'HIGH',
      hint:        'JShelter WebGL randomization',
    },
    {
      key:         'webdriver',
      name:        'WebDriver / automation detected',
      description: fp.browser?.webdriver
        ? 'navigator.webdriver = true — browser is controlled by automation'
        : 'navigator.webdriver = false — no automation detected',
      detected:    !!fp.browser?.webdriver,
      severity:    'CRITICAL',
      hint:        'Selenium, Playwright, Puppeteer session active',
    },
    {
      key:         'ua_mismatch',
      name:        'User-agent spoofing',
      description: uaMismatch
        ? `UA reports ${uaOs} but navigator.platform reports ${platOs} — mismatch detected`
        : 'User-agent is consistent with platform string',
      detected:    uaMismatch,
      severity:    'HIGH',
      hint:        'UA Switcher extension or manual UA override',
    },
    {
      key:         'tz_mismatch',
      name:        'Timezone / language inconsistency',
      description: tzLangMismatch
        ? `Timezone region (${tzRegion}) does not match language region (${langReg})`
        : 'Timezone is consistent with browser language',
      detected:    tzLangMismatch,
      severity:    'LOW',
      hint:        'Timezone spoofing extension active',
    },
    {
      key:         'lang_mismatch',
      name:        'Language / locale inconsistency',
      description: fp.browser?.languages?.length > 1
        ? `Multiple language preferences: ${fp.browser.languages.slice(0, 4).join(', ')}`
        : 'Single language preference detected',
      detected:    false,
      severity:    'LOW',
      hint:        'Language randomization not common',
    },
  ];
}

export default function Spoofing({ fingerprint, analysis }) {
  // Prefer server analysis, fall back to client checks
  const rawChecks = analysis?.spoofing?.checks
    ? Object.values(analysis.spoofing.checks)
    : clientSpoofChecks(fingerprint);

  const detected   = rawChecks.filter(c => c.detected);
  const totalScore = Math.round((detected.length / Math.max(rawChecks.length, 1)) * 100);
  const inconsistency = analysis?.spoofing?.inconsistency_detected
    || (detected.length > 0 && detected.length < rawChecks.length);

  const sevColor = { CRITICAL: '#E24B4A', HIGH: '#EF9F27', MEDIUM: '#4E9EE8', LOW: '#6b6966' };

  if (!fingerprint) {
    return <div className="panel-empty">Run a scan to perform spoofing detection.</div>;
  }

  return (
    <div className="spoofing-panel">

      {/* Summary */}
      <div className="spoof-summary">
        <div className="spoof-sum-block">
          <div className="spoof-sum-label">Checks Performed</div>
          <div className="spoof-sum-val">{rawChecks.length}</div>
        </div>
        <div className="spoof-sum-block">
          <div className="spoof-sum-label">Detections</div>
          <div className="spoof-sum-val" style={{ color: detected.length > 0 ? '#1D9E75' : '#6b6966' }}>
            {detected.length}
          </div>
        </div>
        <div className="spoof-sum-block">
          <div className="spoof-sum-label">Spoofing Score</div>
          <div className="spoof-sum-val" style={{ color: totalScore > 50 ? '#1D9E75' : '#6b6966' }}>
            {totalScore}%
          </div>
        </div>
      </div>

      {/* Inconsistency alert */}
      {inconsistency && (
        <div className="spoof-alert">
          <strong>⚠ Partial spoofing detected:</strong> Some vectors are randomized while others expose real values.
          Inconsistent protection increases anomaly score and may flag you as suspicious to advanced trackers.
        </div>
      )}

      {/* Check cards */}
      <div className="spoof-grid">
        {rawChecks.map((c, i) => (
          <div
            key={i}
            className={`spoof-card ${c.detected ? 'spoof-active' : 'spoof-inactive'}`}
          >
            <div
              className="spoof-indicator"
              style={{
                background: c.detected ? 'rgba(29,158,117,0.15)' : 'rgba(226,75,74,0.12)',
                color:      c.detected ? '#1D9E75' : '#E24B4A',
              }}
            >
              {c.detected ? '✓' : '✗'}
            </div>

            <div className="spoof-info">
              <div className="spoof-name">{c.name}</div>
              <div className="spoof-desc">{c.description}</div>
              {c.hint && !c.detected && (
                <div className="spoof-hint">Unprotected — try: {c.hint}</div>
              )}
            </div>

            <div className="spoof-sev">
              <span style={{
                fontFamily: 'var(--mono)',
                fontSize: 10,
                padding: '2px 7px',
                borderRadius: 3,
                background: sevColor[c.severity] + '22',
                color: sevColor[c.severity],
                border: `1px solid ${sevColor[c.severity]}44`,
                letterSpacing: '0.5px',
              }}>
                {c.severity}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
