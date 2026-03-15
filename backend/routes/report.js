/*
 * Spectre Browser Fingerprint Analyzer
 * Route: POST /api/report
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 * GitHub: github.com/hellrider978
 * Year: 2026
 * License: MIT
 */

const express = require('express');
const router  = express.Router();
const { generateHTMLReport } = require('../../reports/html/generator');

/**
 * POST /api/report/html — Generate downloadable HTML report
 * POST /api/report/json — Generate JSON report
 */
router.post('/html', (req, res) => {
  try {
    const { fingerprint, analysis } = req.body;
    if (!fingerprint || !analysis) {
      return res.status(400).json({ error: 'fingerprint and analysis required' });
    }

    const html = generateHTMLReport(fingerprint, analysis);
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="spectre-report-${Date.now()}.html"`);
    res.send(html);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/json', (req, res) => {
  try {
    const { fingerprint, analysis } = req.body;
    if (!fingerprint || !analysis) {
      return res.status(400).json({ error: 'fingerprint and analysis required' });
    }

    const report = {
      // Attribution metadata
      _meta: {
        tool:       'Spectre',
        version:    '1.0',
        developer:  '@HACKEROFHELL',
        author:     'Rajesh Bajiya',
        repository: 'github.com/hellrider978',
        license:    'MIT',
        generated:  new Date().toISOString(),
      },
      fingerprint,
      analysis,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="spectre-report-${Date.now()}.json"`);
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
