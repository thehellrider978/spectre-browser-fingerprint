/*
 * Spectre Browser Fingerprint Analyzer
 * Module: Main Fingerprint Orchestrator
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 * GitHub: github.com/hellrider978
 * Year: 2026
 * License: MIT
 */

import { useState, useCallback } from 'react';
import { getCanvasFingerprint  } from '../../scanner/canvas.js';
import { getWebGLFingerprint   } from '../../scanner/webgl.js';
import { getAudioFingerprint   } from '../../scanner/audio.js';
import { getFontFingerprint    } from '../../scanner/fonts.js';
import { getWebRTCLeaks        } from '../../scanner/webrtc.js';
import { getStorageFingerprint } from '../../scanner/storage.js';

/**
 * Collects all device/browser signals in parallel.
 * Returns structured fingerprint data for analysis.
 */
export function useFingerprint() {
  const [data, setData]       = useState(null);
  const [progress, setProgress] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [error, setError]     = useState(null);

  const scan = useCallback(async () => {
    setScanning(true);
    setProgress(0);
    setError(null);

    try {
      // Collect hardware/browser signals (synchronous)
      setProgress(10);
      const hardware = collectHardwareSignals();

      setProgress(20);
      const browserInfo = collectBrowserSignals();

      // Run fingerprinting probes (async, in parallel)
      setProgress(30);
      const [canvas, webgl, audio, fonts, webrtc, storage] = await Promise.all([
        getCanvasFingerprint().then(r => { setProgress(p => Math.min(p+12, 90)); return r; }),
        Promise.resolve(getWebGLFingerprint()).then(r => { setProgress(p => Math.min(p+12, 90)); return r; }),
        getAudioFingerprint().then(r => { setProgress(p => Math.min(p+12, 90)); return r; }),
        Promise.resolve(getFontFingerprint()).then(r => { setProgress(p => Math.min(p+12, 90)); return r; }),
        getWebRTCLeaks().then(r => { setProgress(p => Math.min(p+12, 90)); return r; }),
        getStorageFingerprint().then(r => { setProgress(p => Math.min(p+12, 90)); return r; }),
      ]);

      setProgress(95);

      const fingerprint = {
        timestamp: new Date().toISOString(),
        hardware,
        browser: browserInfo,
        canvas,
        webgl,
        audio,
        fonts,
        webrtc,
        storage,
      };

      // Send to backend for entropy scoring + TLS analysis
      const analysis = await analyzeFingerprint(fingerprint);

      setProgress(100);
      setData({ fingerprint, analysis });

    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  }, []);

  return { data, progress, scanning, error, scan };
}

function collectHardwareSignals() {
  const nav = navigator;
  return {
    cpu_cores:     nav.hardwareConcurrency || null,
    device_memory: nav.deviceMemory || null,
    platform:      nav.platform,
    screen: {
      width:       screen.width,
      height:      screen.height,
      avail_width: screen.availWidth,
      avail_height:screen.availHeight,
      color_depth: screen.colorDepth,
      pixel_depth: screen.pixelDepth,
      dpr:         window.devicePixelRatio,
    },
    touch_points:  nav.maxTouchPoints,
  };
}

function collectBrowserSignals() {
  const nav = navigator;
  return {
    user_agent:     nav.userAgent,
    app_name:       nav.appName,
    app_version:    nav.appVersion,
    vendor:         nav.vendor,
    language:       nav.language,
    languages:      [...(nav.languages || [])],
    timezone:       Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezone_offset: new Date().getTimezoneOffset(),
    cookies_enabled: nav.cookieEnabled,
    do_not_track:   nav.doNotTrack,
    java_enabled:   nav.javaEnabled ? nav.javaEnabled() : false,
    plugins_count:  nav.plugins ? nav.plugins.length : 0,
    mime_types_count: nav.mimeTypes ? nav.mimeTypes.length : 0,
    online:         nav.onLine,
    service_worker: 'serviceWorker' in nav,
    webdriver:      nav.webdriver || false,
  };
}

async function analyzeFingerprint(fp) {
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fp),
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return await res.json();
  } catch (e) {
    // Fallback: client-side scoring if backend unavailable
    return clientSideScore(fp);
  }
}

function clientSideScore(fp) {
  let entropy = 0;
  if (fp.canvas?.canvas_entropy)  entropy += fp.canvas.canvas_entropy * 0.9;
  if (fp.webgl?.status === 'success') entropy += 16.8;
  if (fp.audio?.audio_entropy)    entropy += fp.audio.audio_entropy * 0.7;
  if (fp.fonts?.font_count)       entropy += Math.min(fp.fonts.font_count * 0.05, 13);
  entropy += 5.6 + 8.3; // screen + browser baseline

  const uniqueness_score = Math.min(99, Math.round((entropy / 21) * 100));
  const one_in = Math.round(Math.pow(2, entropy));

  return {
    entropy_total: parseFloat(entropy.toFixed(2)),
    uniqueness_score,
    one_in_x: one_in.toLocaleString(),
    tracking_resistance: uniqueness_score > 80 ? 'LOW' : uniqueness_score > 50 ? 'MEDIUM' : 'HIGH',
    risk_level: uniqueness_score > 80 ? 'HIGH' : uniqueness_score > 50 ? 'MEDIUM' : 'LOW',
    spoofing_detected: detectSpoofing(fp),
    recommendations: generateRecommendations(fp),
    source: 'client',
  };
}

function detectSpoofing(fp) {
  const flags = [];
  // UA mismatch with platform
  if (fp.browser.user_agent.includes('Mac') && fp.hardware.platform.includes('Win')) {
    flags.push({ type: 'ua_platform_mismatch', severity: 'HIGH' });
  }
  // WebDriver detected
  if (fp.browser.webdriver) {
    flags.push({ type: 'webdriver_detected', severity: 'CRITICAL' });
  }
  // Suspiciously round memory
  if ([1,2,4,8].includes(fp.hardware.device_memory) === false && fp.hardware.device_memory) {
    flags.push({ type: 'non_standard_memory', severity: 'MEDIUM' });
  }
  return flags;
}

function generateRecommendations(fp) {
  const recs = [];
  if (fp.webrtc?.leak_detected) {
    recs.push({ priority: 'CRITICAL', title: 'WebRTC IP leak detected', action: 'Install uBlock Origin → enable WebRTC IP leak prevention' });
  }
  if (fp.fonts?.font_count > 100) {
    recs.push({ priority: 'HIGH', title: 'High font entropy', action: 'Use a browser with font fingerprint protection (Mullvad, Brave)' });
  }
  if (fp.storage?.persistence_score > 60) {
    recs.push({ priority: 'HIGH', title: 'Multi-vector tracking persistence', action: 'Enable strict cookie isolation and use private browsing mode' });
  }
  return recs;
}
