/*
 * Spectre Browser Fingerprint Analyzer
 * Route: POST /api/fingerprint
 * Stores raw fingerprint and returns a scan ID.
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 * GitHub: github.com/hellrider978
 * Year: 2026 | License: MIT
 */

const express = require('express');
const crypto  = require('crypto');
const router  = express.Router();

// In-memory store (swap for Redis/PostgreSQL in production)
const store = new Map();
const MAX_ENTRIES = 1000; // cap memory use

/**
 * POST /api/fingerprint
 * Body: raw fingerprint object from the browser
 * Returns: { scan_id, timestamp }
 */
router.post('/', (req, res) => {
  try {
    const fp = req.body;
    if (!fp || typeof fp !== 'object') {
      return res.status(400).json({ error: 'Invalid fingerprint payload' });
    }

    const scan_id   = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    // Evict oldest entry if at capacity
    if (store.size >= MAX_ENTRIES) {
      const oldestKey = store.keys().next().value;
      store.delete(oldestKey);
    }

    store.set(scan_id, {
      fingerprint: fp,
      timestamp,
      ip: req.ip,
      tls_headers: {
        user_agent:  req.headers['user-agent'],
        accept_lang: req.headers['accept-language'],
        accept_enc:  req.headers['accept-encoding'],
      },
    });

    res.status(201).json({
      scan_id,
      timestamp,
      message: 'Fingerprint stored. POST to /api/analyze with your fingerprint for full analysis.',
      _meta: {
        tool:      'Spectre',
        developer: '@HACKEROFHELL',
        author:    'Rajesh Bajiya',
        github:    'github.com/hellrider978',
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/fingerprint/:scan_id
 * Retrieve a previously stored fingerprint by scan ID.
 */
router.get('/:scan_id', (req, res) => {
  const entry = store.get(req.params.scan_id);
  if (!entry) {
    return res.status(404).json({ error: 'Scan ID not found or expired' });
  }
  res.json(entry);
});

module.exports = router;
