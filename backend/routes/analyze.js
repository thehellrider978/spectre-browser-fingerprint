/*
 * Spectre Browser Fingerprint Analyzer
 * Route: POST /api/analyze
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 * GitHub: github.com/hellrider978
 * Year: 2026
 * License: MIT
 */

const express = require('express');
const router  = express.Router();
const { calculateEntropyBreakdown, calculateUniquenessScore, calculateStability } = require('../entropy/calculator');
const { analyzeTLS } = require('../tls/fingerprint');
const { generateRecommendations } = require('../analysis/recommendations');
const { detectSpoofing } = require('../analysis/spoofing');

/**
 * POST /api/analyze
 * Receives client-side fingerprint data and returns full analysis.
 */
router.post('/', async (req, res) => {
  try {
    const fingerprint = req.body;

    if (!fingerprint || typeof fingerprint !== 'object') {
      return res.status(400).json({ error: 'Invalid fingerprint data' });
    }

    // TLS analysis (server-side, not possible client-side)
    const tls = analyzeTLS(req);

    // Attach TLS data to fingerprint for entropy calc
    fingerprint.tls = tls;

    // Entropy breakdown
    const { breakdown, total_bits } = calculateEntropyBreakdown(fingerprint);

    // Uniqueness score
    const uniqueness = calculateUniquenessScore(total_bits);

    // Session stability
    const stability = calculateStability(fingerprint.storage?.session_history);

    // Spoofing detection
    const spoofing = detectSpoofing(fingerprint);

    // Security recommendations
    const recommendations = generateRecommendations(fingerprint, uniqueness, spoofing);

    const result = {
      // Metadata
      tool:       'Spectre',
      version:    '1.0.0',
      developer:  '@HACKEROFHELL',
      author:     'Rajesh Bajiya',
      github:     'github.com/hellrider978',
      timestamp:  new Date().toISOString(),

      // Analysis
      entropy: {
        breakdown,
        total_bits,
      },
      uniqueness,
      stability,
      tls,
      spoofing,
      recommendations,

      // Risk summary
      risk_level:  uniqueness.risk,
      privacy_score: 100 - uniqueness.score,
      tracking_resistance: uniqueness.risk === 'HIGH' ? 'LOW' : uniqueness.risk === 'MEDIUM' ? 'MEDIUM' : 'HIGH',
    };

    res.json(result);

  } catch (err) {
    console.error('[/api/analyze error]', err);
    res.status(500).json({ error: 'Analysis failed', details: err.message });
  }
});

module.exports = router;
