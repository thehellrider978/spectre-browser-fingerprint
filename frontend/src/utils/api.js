/*
 * Spectre Browser Fingerprint Analyzer
 * Util: Backend API Client
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 * GitHub: github.com/thehellrider978
 * Year: 2026 | License: MIT
 */

const BASE = import.meta.env.VITE_API_URL || '';

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

/** POST /api/fingerprint — store raw fingerprint, get scan ID back */
export async function submitFingerprint(fpData) {
  try {
    return await post('/api/fingerprint', fpData);
  } catch {
    // Backend not available — return null so caller falls back to client-side scoring
    return null;
  }
}

/** POST /api/analyze — full entropy + spoofing + scoring analysis */
export async function analyzeFingerprint(fpData) {
  return post('/api/analyze', fpData);
}

/** GET /api/about — tool metadata */
export async function getAbout() {
  return get('/api/about');
}

/** POST /api/report/html — download HTML report */
export async function downloadHTMLReport(fingerprint, analysis) {
  const res = await fetch(`${BASE}/api/report/html`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fingerprint, analysis }),
  });
  if (!res.ok) throw new Error('Report generation failed');
  const blob = await res.blob();
  triggerDownload(blob, `spectre-report-${Date.now()}.html`, 'text/html');
}

/** POST /api/report/json — download JSON report */
export async function downloadJSONReport(fingerprint, analysis) {
  const res = await fetch(`${BASE}/api/report/json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fingerprint, analysis }),
  });
  if (!res.ok) throw new Error('Report generation failed');
  const blob = await res.blob();
  triggerDownload(blob, `spectre-report-${Date.now()}.json`, 'application/json');
}

function triggerDownload(blob, filename, type) {
  const url = URL.createObjectURL(new Blob([blob], { type }));
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
