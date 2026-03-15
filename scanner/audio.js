/*
 * Spectre Browser Fingerprint Analyzer
 * Module: Audio Fingerprinting
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 * GitHub: github.com/hellrider978
 * Year: 2026
 * License: MIT
 */

/**
 * Generates an audio fingerprint using the Web Audio API.
 * Browsers process floating-point audio math slightly differently
 * due to hardware and OS-level audio stack differences.
 */
export async function getAudioFingerprint() {
  return new Promise((resolve) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return resolve({ status: 'unsupported' });

      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const analyser   = ctx.createAnalyser();
      const gainNode   = ctx.createGain();
      const scriptProc = ctx.createScriptProcessor(4096, 1, 1);

      // Compressor to amplify subtle hardware differences
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-50, ctx.currentTime);
      compressor.knee.setValueAtTime(40,     ctx.currentTime);
      compressor.ratio.setValueAtTime(12,    ctx.currentTime);
      compressor.attack.setValueAtTime(0,    ctx.currentTime);
      compressor.release.setValueAtTime(0.25, ctx.currentTime);

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(10000, ctx.currentTime);

      gainNode.gain.setValueAtTime(0, ctx.currentTime); // Silent — no sound played

      oscillator.connect(compressor);
      compressor.connect(analyser);
      analyser.connect(scriptProc);
      scriptProc.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(0);

      scriptProc.onaudioprocess = function(event) {
        const buffer = event.inputBuffer.getChannelData(0);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += Math.abs(buffer[i]);
        }

        // Hash from accumulated audio buffer values
        const fingerprint = sum.toString();
        const hash = hashAudio(buffer);

        oscillator.disconnect();
        compressor.disconnect();
        analyser.disconnect();
        scriptProc.disconnect();
        gainNode.disconnect();
        ctx.close();

        resolve({
          audio_hash: hash,
          audio_sum: parseFloat(sum.toFixed(8)),
          audio_entropy: parseFloat(calcAudioEntropy(buffer).toFixed(2)),
          sample_rate: ctx.sampleRate,
          status: 'success'
        });
      };

      // Timeout fallback
      setTimeout(() => {
        try { ctx.close(); } catch(e) {}
        resolve({ status: 'timeout', audio_hash: 'TIMEOUT' });
      }, 3000);

    } catch (e) {
      resolve({ status: 'blocked', error: e.message, audio_hash: 'BLOCKED' });
    }
  });
}

function hashAudio(buffer) {
  let hash = 0;
  const step = Math.floor(buffer.length / 50);
  for (let i = 0; i < buffer.length; i += step) {
    hash = ((hash << 5) - hash) + Math.round(buffer[i] * 1e9);
    hash |= 0;
  }
  return '0x' + (hash >>> 0).toString(16).toUpperCase().padStart(8, '0');
}

function calcAudioEntropy(buffer) {
  const buckets = new Array(256).fill(0);
  for (const v of buffer) {
    const idx = Math.min(255, Math.floor(((v + 1) / 2) * 256));
    buckets[idx]++;
  }
  let entropy = 0;
  const total = buffer.length;
  for (const count of buckets) {
    if (count > 0) {
      const p = count / total;
      entropy -= p * Math.log2(p);
    }
  }
  return entropy;
}
