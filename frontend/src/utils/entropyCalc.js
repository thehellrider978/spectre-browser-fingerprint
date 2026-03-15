/*
 * Spectre Browser Fingerprint Analyzer
 * Util: Client-Side Entropy Calculator
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 * GitHub: github.com/hellrider978
 * Year: 2026 | License: MIT
 */

/**
 * Empirical entropy estimates (bits) per fingerprint signal.
 * Source: EFF Panopticlick / AmIUnique / Cover Your Tracks research.
 */
export const SIGNAL_ENTROPY = {
  canvas:       { bits: 14.2, label: 'Canvas',        oneIn: 18700   },
  webgl:        { bits: 16.8, label: 'WebGL',          oneIn: 114000  },
  audio:        { bits: 11.4, label: 'Audio',          oneIn: 2700    },
  fonts:        { bits: 12.9, label: 'Fonts',          oneIn: 7600    },
  screen:       { bits: 5.6,  label: 'Screen',         oneIn: 49      },
  userAgent:    { bits: 8.3,  label: 'User Agent',     oneIn: 320     },
  timezone:     { bits: 3.8,  label: 'Timezone',       oneIn: 14      },
  language:     { bits: 2.9,  label: 'Language',       oneIn: 7       },
  cpuCores:     { bits: 2.1,  label: 'CPU Cores',      oneIn: 4       },
  deviceMemory: { bits: 1.8,  label: 'Device Memory',  oneIn: 3       },
  plugins:      { bits: 4.5,  label: 'Plugins',        oneIn: 23      },
  touch:        { bits: 1.2,  label: 'Touch Points',   oneIn: 2       },
  webrtc:       { bits: 17.1, label: 'WebRTC Local IP',oneIn: 140000  },
  tls:          { bits: 10.7, label: 'TLS / JA3',      oneIn: 1700    },
  storage:      { bits: 3.2,  label: 'Storage Vectors',oneIn: 9       },
};

/**
 * Build entropy breakdown array from a fingerprint object.
 * Returns array of { signal, label, bits, oneIn, pct, active }
 */
export function buildEntropyBreakdown(fp) {
  const MAX_BITS = 18;
  const rows = [];

  const add = (key, bits, active = true) => {
    const meta = SIGNAL_ENTROPY[key] || { label: key, oneIn: Math.round(Math.pow(2, bits)) };
    rows.push({
      signal: key,
      label:  meta.label,
      bits:   parseFloat(bits.toFixed(2)),
      oneIn:  meta.oneIn || Math.round(Math.pow(2, bits)),
      pct:    Math.min(100, Math.round((bits / MAX_BITS) * 100)),
      active,
    });
  };

  if (fp.canvas?.status === 'success') {
    const b = fp.canvas.canvas_entropy
      ? Math.min(fp.canvas.canvas_entropy, SIGNAL_ENTROPY.canvas.bits + 2)
      : SIGNAL_ENTROPY.canvas.bits;
    add('canvas', b);
  } else {
    add('canvas', 0, false);
  }

  if (fp.webgl?.status === 'success')  add('webgl', SIGNAL_ENTROPY.webgl.bits);
  else                                  add('webgl', 0, false);

  if (fp.audio?.status === 'success') {
    const b = fp.audio.audio_entropy
      ? Math.min(fp.audio.audio_entropy, SIGNAL_ENTROPY.audio.bits + 1)
      : SIGNAL_ENTROPY.audio.bits;
    add('audio', b);
  } else {
    add('audio', 0, false);
  }

  const fontBits = fp.fonts?.font_count
    ? Math.min(fp.fonts.font_count * 0.055 + 4.5, SIGNAL_ENTROPY.fonts.bits + 2)
    : 0;
  add('fonts', fontBits, fontBits > 0);

  if (fp.hardware?.screen) add('screen', SIGNAL_ENTROPY.screen.bits);
  if (fp.browser?.user_agent) add('userAgent', SIGNAL_ENTROPY.userAgent.bits);
  if (fp.browser?.timezone)   add('timezone', SIGNAL_ENTROPY.timezone.bits);
  if (fp.browser?.language)   add('language', SIGNAL_ENTROPY.language.bits);
  if (fp.hardware?.cpu_cores) add('cpuCores', SIGNAL_ENTROPY.cpuCores.bits);
  if (fp.browser?.plugins_count != null) add('plugins', SIGNAL_ENTROPY.plugins.bits);

  if (fp.webrtc?.leak_detected) add('webrtc', SIGNAL_ENTROPY.webrtc.bits);

  return rows;
}

/**
 * Sum total entropy bits and derive uniqueness score (0–100).
 */
export function calcUniquenessScore(breakdown) {
  const total = breakdown.filter(r => r.active).reduce((s, r) => s + r.bits, 0);
  // Sigmoid-like curve: 10b≈50, 20b≈90, 30b≈98
  const score = Math.min(99, Math.round(100 * (1 - Math.exp(-total / 22))));
  const oneIn  = Math.min(Math.round(Math.pow(2, total)), 1e12);

  return {
    totalBits: parseFloat(total.toFixed(2)),
    score,
    oneInX:   formatBigNum(oneIn),
    oneInRaw: oneIn,
    label:    score > 85 ? 'Highly Unique' : score > 65 ? 'Moderately Unique' : score > 40 ? 'Somewhat Unique' : 'Common Profile',
    risk:     score > 80 ? 'HIGH' : score > 50 ? 'MEDIUM' : 'LOW',
  };
}

export function formatBigNum(n) {
  if (n >= 1e12) return (n / 1e12).toFixed(1) + ' trillion';
  if (n >= 1e9)  return (n / 1e9).toFixed(1)  + ' billion';
  if (n >= 1e6)  return (n / 1e6).toFixed(1)  + ' million';
  if (n >= 1e3)  return Math.round(n / 1e3)   + 'k';
  return String(n);
}
