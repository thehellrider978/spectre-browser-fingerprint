/*
 * Spectre Browser Fingerprint Analyzer
 * Backend API Server
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 * GitHub: github.com/hellrider978
 * Year: 2026
 * License: MIT
 */

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const path       = require('path');

const analyzeRouter     = require('./routes/analyze');
const reportRouter      = require('./routes/report');
const statusRouter      = require('./routes/status');
const fingerprintRouter = require('./routes/fingerprint');

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Security middleware ─────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for API — frontend handles CSP
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting — prevents abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests — slow down.' }
});
app.use('/api/', limiter);

// ── Body parsing ────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ── TLS fingerprinting via request headers ──────────────────────
app.use((req, res, next) => {
  req.tls_info = {
    protocol:    req.protocol,
    headers:     req.headers,
    user_agent:  req.headers['user-agent'],
    accept_lang: req.headers['accept-language'],
    connection:  req.headers['connection'],
  };
  next();
});

// ── Routes ──────────────────────────────────────────────────────
app.use('/api/analyze',      analyzeRouter);
app.use('/api/report',       reportRouter);
app.use('/api/status',       statusRouter);
app.use('/api/fingerprint',  fingerprintRouter);

// ── About endpoint (pentester --about) ──────────────────────────
app.get('/api/about', (req, res) => {
  res.json({
    tool:        'Spectre Browser Fingerprint Analyzer',
    version:     '1.0.0',
    developer:   '@HACKEROFHELL',
    author:      'Rajesh Bajiya',
    github:      'github.com/hellrider978',
    license:     'MIT',
    description: 'Advanced browser fingerprint intelligence platform for security researchers and pentesters.',
    year:        2026,
  });
});

// ── Health check ────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ── Serve frontend build in production ──────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// ── Error handler ───────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Spectre Error]', err.message);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ── Start ───────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ███████╗██████╗ ███████╗ ██████╗████████╗██████╗ ███████╗
  ██╔════╝██╔══██╗██╔════╝██╔════╝╚══██╔══╝██╔══██╗██╔════╝
  ███████╗██████╔╝█████╗  ██║        ██║   ██████╔╝█████╗  
  ╚════██║██╔═══╝ ██╔══╝  ██║        ██║   ██╔══██╗██╔══╝  
  ███████║██║     ███████╗╚██████╗   ██║   ██║  ██║███████╗
  ╚══════╝╚═╝     ╚══════╝ ╚═════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝

  Spectre Browser Fingerprint Analyzer v1.0
  Created by: @HACKEROFHELL (Rajesh Bajiya)
  GitHub: github.com/hellrider978
  ─────────────────────────────────────────
  API running on http://localhost:${PORT}
  `);
});

module.exports = app;
