/*
 * Spectre Browser Fingerprint Analyzer
 * Module: WebGL Fingerprinting
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 * GitHub: github.com/hellrider978
 * Year: 2026
 * License: MIT
 */

/**
 * Extracts GPU identity and WebGL capabilities.
 * This is one of the highest-entropy fingerprint vectors.
 */
export function getWebGLFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return { status: 'unsupported' };

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

    const vendor   = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)   : gl.getParameter(gl.VENDOR);
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);

    // Shader precision
    const vHighP  = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER,   gl.HIGH_FLOAT);
    const fHighP  = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
    const vMedP   = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER,   gl.MEDIUM_FLOAT);

    // Extensions list
    const extensions = gl.getSupportedExtensions() || [];

    // WebGL parameters
    const params = {
      max_texture_size:         gl.getParameter(gl.MAX_TEXTURE_SIZE),
      max_viewport_dims:        gl.getParameter(gl.MAX_VIEWPORT_DIMS),
      max_vertex_attribs:       gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
      max_combined_texture_units: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
      aliased_line_width_range: gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE),
      aliased_point_size_range: gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE),
      alpha_bits:               gl.getParameter(gl.ALPHA_BITS),
      depth_bits:               gl.getParameter(gl.DEPTH_BITS),
    };

    // Generate WebGL scene hash
    const hashSource = [vendor, renderer, extensions.join(','), JSON.stringify(params)].join('|');
    const webgl_hash = simpleHash(hashSource);

    return {
      webgl_vendor:    vendor,
      webgl_renderer:  renderer,
      webgl_hash,
      shader_precision: {
        vertex_high:   `${vHighP.rangeMin}-${vHighP.rangeMax} prec:${vHighP.precision}`,
        vertex_med:    `${vMedP.rangeMin}-${vMedP.rangeMax} prec:${vMedP.precision}`,
        fragment_high: `${fHighP.rangeMin}-${fHighP.rangeMax} prec:${fHighP.precision}`,
      },
      extensions_count: extensions.length,
      extensions: extensions.slice(0, 20),
      params,
      status: 'success'
    };
  } catch (e) {
    return { status: 'blocked', error: e.message };
  }
}

function simpleHash(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).toUpperCase().padStart(8, '0');
}
