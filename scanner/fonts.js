/*
 * Spectre Browser Fingerprint Analyzer
 * Module: Font Fingerprinting
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 * GitHub: github.com/hellrider978
 * Year: 2026
 * License: MIT
 */

/**
 * Detects installed system fonts by measuring text rendering width.
 * Uses a baseline font (monospace) to detect deviations caused by
 * installed fonts being substituted in.
 */

const BASELINE_FONT = 'monospace';
const TEST_STRING   = 'mmmmmmmmmmlli';
const TEST_SIZE     = '72px';

const FONT_LIST = [
  // Windows
  'Arial', 'Arial Black', 'Bahnschrift', 'Calibri', 'Cambria', 'Cambria Math',
  'Candara', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New',
  'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Georgia',
  'HoloLens MDL2 Assets', 'Impact', 'Ink Free', 'Javanese Text', 'Leelawadee UI',
  'Lucida Console', 'Lucida Sans Unicode', 'Malgun Gothic', 'Marlett', 'Microsoft Himalaya',
  'Microsoft JhengHei', 'Microsoft New Tai Lue', 'Microsoft PhagsPa', 'Microsoft Sans Serif',
  'Microsoft Tai Le', 'Microsoft YaHei', 'Microsoft Yi Baiti', 'MingLiU-ExtB',
  'Mongolian Baiti', 'MS Gothic', 'MV Boli', 'Myanmar Text', 'Nirmala UI', 'Palatino Linotype',
  'Segoe MDL2 Assets', 'Segoe Print', 'Segoe Script', 'Segoe UI', 'Segoe UI Historic',
  'Segoe UI Emoji', 'Segoe UI Symbol', 'SimSun', 'Sitka', 'Sylfaen', 'Symbol',
  'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings',
  // macOS
  'American Typewriter', 'Andale Mono', 'Apple Chancery', 'Apple Color Emoji',
  'Apple SD Gothic Neo', 'AppleGothic', 'Avenir', 'Avenir Next', 'Baskerville',
  'Big Caslon', 'Bodoni 72', 'Bradley Hand', 'Brush Script MT', 'Chalkboard',
  'Chalkduster', 'Charter', 'Cochin', 'Copperplate', 'Courier', 'Damascus',
  'DecoType Naskh', 'Didot', 'Diwan Mishafi', 'Euphemia UCAS', 'Farah', 'Farisi',
  'Futura', 'Geneva', 'Gill Sans', 'Helvetica', 'Helvetica Neue', 'Herculanum',
  'Hoefler Text', 'Lucida Grande', 'Marker Felt', 'Menlo', 'Monaco', 'Noteworthy',
  'Optima', 'Palatino', 'Papyrus', 'Phosphate', 'Rockwell', 'Savoye LET',
  'Skia', 'Snell Roundhand', 'Superclarendon', 'Trattatello', 'Zapf Dingbats',
  // Linux
  'DejaVu Sans', 'DejaVu Sans Mono', 'DejaVu Serif', 'Droid Sans', 'Droid Serif',
  'FreeMono', 'FreeSans', 'FreeSerif', 'Liberation Mono', 'Liberation Sans',
  'Liberation Serif', 'Linux Libertine', 'Noto Color Emoji', 'Noto Mono',
  'Noto Sans', 'Noto Serif', 'Open Sans', 'Roboto', 'Ubuntu', 'Ubuntu Mono',
  // Common web fonts
  'Lato', 'Merriweather', 'Montserrat', 'Nunito', 'Oswald', 'Playfair Display',
  'Poppins', 'PT Sans', 'Raleway', 'Source Code Pro', 'Source Sans Pro',
];

let baselineCanvas = null;
let baselineCtx = null;

function initCanvas() {
  if (!baselineCanvas) {
    baselineCanvas = document.createElement('canvas');
    baselineCanvas.width = 500;
    baselineCanvas.height = 150;
    baselineCtx = baselineCanvas.getContext('2d');
  }
  return baselineCtx;
}

function measureText(font, ctx) {
  ctx.font = `${TEST_SIZE} '${font}', ${BASELINE_FONT}`;
  return ctx.measureText(TEST_STRING).width;
}

function getBaselineWidth(ctx) {
  ctx.font = `${TEST_SIZE} ${BASELINE_FONT}`;
  return ctx.measureText(TEST_STRING).width;
}

export function getFontFingerprint() {
  try {
    const ctx = initCanvas();
    const baseline = getBaselineWidth(ctx);
    const detected = [];

    for (const font of FONT_LIST) {
      const width = measureText(font, ctx);
      if (width !== baseline) {
        detected.push(font);
      }
    }

    const fontHash = simpleHash(detected.join(','));

    return {
      detected_fonts: detected,
      font_count: detected.length,
      font_hash: fontHash,
      tested_count: FONT_LIST.length,
      status: 'success'
    };
  } catch (e) {
    return { status: 'blocked', error: e.message, detected_fonts: [], font_count: 0 };
  }
}

function simpleHash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) + str.charCodeAt(i);
    h |= 0;
  }
  return '0x' + (h >>> 0).toString(16).toUpperCase().padStart(8, '0');
}
