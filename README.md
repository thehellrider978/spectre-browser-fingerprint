# Spectre — Advanced Browser Fingerprint Intelligence Analyzer

```
  ███████╗██████╗ ███████╗ ██████╗████████╗██████╗ ███████╗
  ██╔════╝██╔══██╗██╔════╝██╔════╝╚══██╔══╝██╔══██╗██╔════╝
  ███████╗██████╔╝█████╗  ██║        ██║   ██████╔╝█████╗
  ╚════██║██╔═══╝ ██╔══╝  ██║        ██║   ██╔══██╗██╔══╝
  ███████║██║     ███████╗╚██████╗   ██║   ██║  ██║███████╗
  ╚══════╝╚═╝     ╚══════╝ ╚═════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝
```

**Created by:** [@HACKEROFHELL](https://github.com/hellrider978) (Rajesh Bajiya)  
**GitHub:** [github.com/thehellrider978](https://github.com/thehellrider978)  
**License:** MIT  
**Version:** 1.0  

---

A next-generation browser fingerprint intelligence platform for **privacy researchers**, **penetration testers**, and **security engineers**.

Unlike basic fingerprint checkers, Spectre performs **deep multi-layer analysis**, combining active and passive testing with entropy scoring, spoofing detection, cross-session tracking analysis, and exportable security reports.

---

## Features

| Feature | Description |
|---------|-------------|
| **Canvas Fingerprinting** | GPU-level rendering hash with entropy score |
| **WebGL Fingerprinting** | Vendor, renderer, extensions, shader precision |
| **Audio Fingerprinting** | Web Audio API floating-point hash |
| **Font Detection** | 150+ fonts via width measurement technique |
| **WebRTC Leak Detection** | Local IP, IPv6, VPN bypass, STUN exposure |
| **TLS Fingerprinting** | JA3 hash, browser family, header analysis |
| **Storage Persistence** | Cookies, localStorage, IDB, CacheStorage |
| **Session Tracking** | Cross-session stability — 94% persistence |
| **Spoofing Detection** | Canvas noise, WebGL spoof, UA mismatch |
| **Entropy Map** | Per-signal uniqueness visualization |
| **Uniqueness Score** | 0–100 score + "1 in X browsers" probability |
| **Report Export** | Standalone HTML + JSON reports |
| **Mitigation Panel** | Prioritized CRITICAL/HIGH/MEDIUM recommendations |

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Development

```bash
# Clone the repo
git clone https://github.com/hellrider978/spectre.git
cd spectre

# Install all dependencies
npm install
cd frontend && npm install && cd ..
cd backend  && npm install && cd ..

# Start both frontend + backend
npm run dev
# Frontend: http://localhost:3000
# Backend:  http://localhost:4000
```

### Docker

```bash
# Build
docker build -t spectre .

# Run
docker run -p 3000:3000 spectre

# Or with docker-compose
docker-compose up
```

### Check tool info
```bash
curl http://localhost:4000/api/about
```

---

## Project Structure

```
spectre/
├── frontend/               # React dashboard
│   ├── components/         # UI components
│   │   ├── ScoreRing.jsx
│   │   ├── SignalsPanel.jsx
│   │   ├── EntropyMap.jsx
│   │   └── Panels.jsx      # Session, Spoofing, Mitigation
│   ├── hooks/
│   │   └── useFingerprint.js  # Fingerprint orchestrator
│   ├── pages/
│   │   └── App.jsx
│   └── styles/
│       └── main.css
│
├── backend/                # Node.js API
│   ├── server.js           # Express + banner
│   ├── routes/
│   │   ├── analyze.js      # POST /api/analyze
│   │   ├── report.js       # POST /api/report/{html,json}
│   │   └── status.js
│   ├── analysis/
│   │   ├── spoofing.js     # Anti-fingerprinting detection
│   │   └── recommendations.js
│   ├── entropy/
│   │   └── calculator.js   # Shannon entropy engine
│   └── tls/
│       └── fingerprint.js  # JA3 + header analysis
│
├── scanner/                # Browser-side JS probes
│   ├── canvas.js           # Canvas fingerprinting
│   ├── webgl.js            # WebGL + GPU identity
│   ├── audio.js            # Web Audio API hash
│   ├── fonts.js            # Font detection (150+ fonts)
│   ├── webrtc.js           # IP leak detection
│   └── storage.js          # Storage persistence test
│
├── reports/
│   └── html/
│       └── generator.js    # Standalone HTML report generator
│
├── docs/
│   └── architecture.md
│
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite |
| Fingerprint engine | Vanilla JS (browser APIs) |
| Backend | Node.js, Express 4 |
| Security | Helmet, express-rate-limit |
| Deployment | Docker, Vercel/Render |
| Optional cache | Redis |

---

## Deployment

### Vercel + Render (Recommended)

1. Deploy `/frontend` to **Vercel**
2. Deploy `/backend` to **Render** (Node.js service)
3. Set `FRONTEND_URL=https://your-vercel-url.vercel.app` on Render
4. Set Vite proxy to your Render backend URL

### DigitalOcean
```bash
docker-compose up -d
# Configure nginx reverse proxy → port 3000
```

---

## API Reference

See [docs/architecture.md](docs/architecture.md) for full API docs.

Key endpoints:
- `POST /api/analyze` — Full fingerprint analysis
- `POST /api/report/html` — HTML report download
- `POST /api/report/json` — JSON report download
- `GET  /api/about` — Tool info / --about

---

## Author

| | |
|--|--|
| **Handle** | @HACKEROFHELL |
| **Name** | Rajesh Bajiya |
| **GitHub** | [github.com/thehellrider978](https://github.com/thehellrider978) |
| **License** | MIT |
| **Year** | 2026 |

---

## License

MIT License — see LICENSE file.

*Generated by Spectre v1.0 · @HACKEROFHELL · github.com/hellrider978*
