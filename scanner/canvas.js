/*
 * Spectre Browser Fingerprint Analyzer
 * Module: Canvas Fingerprinting
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 * GitHub: github.com/hellrider978
 * Year: 2026
 * License: MIT
 */

/**
 * Generates a canvas fingerprint by rendering text + shapes
 * and hashing the pixel output.
 */
export async function getCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Multi-font text (exposes font rendering engine differences)
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#069';
    ctx.font = '11pt "Times New Roman"';
    ctx.fillText('Spectre🔍 <canvas>', 2, 15);

    ctx.fillStyle = 'rgba(102,204,0,0.7)';
    ctx.font = '18pt Arial';
    ctx.fillText('Cwm fjordbank glyphs vext quiz', 0, 40);

    // Geometric shapes expose GPU anti-aliasing differences
    ctx.fillStyle = 'rgb(255,0,255)';
    ctx.beginPath();
    ctx.arc(140, 10, 6, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    // Bezier curve
    ctx.strokeStyle = 'rgba(255,71,71,0.8)';
    ctx.beginPath();
    ctx.bezierCurveTo(20, 30, 40, 10, 50, 40);
    ctx.stroke();

    const dataURL = canvas.toDataURL();
    const hash = await digestMessage(dataURL);

    // Calculate entropy (estimate based on unique pixel variance)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const entropy = calcPixelEntropy(imageData.data);

    return {
      canvas_hash: hash.substring(0, 16).toUpperCase(),
      canvas_entropy: parseFloat(entropy.toFixed(2)),
      canvas_data_length: dataURL.length,
      status: 'success'
    };
  } catch (e) {
    return { canvas_hash: 'BLOCKED', canvas_entropy: 0, status: 'blocked', error: e.message };
  }
}

function calcPixelEntropy(pixels) {
  const freq = {};
  for (let i = 0; i < pixels.length; i += 4) {
    const key = `${pixels[i]},${pixels[i+1]},${pixels[i+2]}`;
    freq[key] = (freq[key] || 0) + 1;
  }
  const total = pixels.length / 4;
  let entropy = 0;
  for (const count of Object.values(freq)) {
    const p = count / total;
    if (p > 0) entropy -= p * Math.log2(p);
  }
  return entropy;
}

async function digestMessage(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
