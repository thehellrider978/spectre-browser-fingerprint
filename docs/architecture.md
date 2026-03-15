# Spectre — System Architecture

**Author:** @HACKEROFHELL (Rajesh Bajiya)  
**GitHub:** github.com/hellrider978  
**Version:** 1.0  

---

## 3-Layer Architecture

```
User Browser
     │
     ▼
┌─────────────────────────────────┐
│   Frontend Fingerprint Engine   │  React + Vanilla JS probes
│                                 │  Runs entirely in the browser
│  • canvas.js   → Canvas hash    │
│  • webgl.js    → GPU identity   │
│  • audio.js    → Audio hash     │
│  • fonts.js    → Font detection │
│  • webrtc.js   → IP leak test   │
│  • storage.js  → Persistence    │
└──────────────┬──────────────────┘
               │ POST /api/analyze
               ▼
┌─────────────────────────────────┐
│   Backend Analysis API          │  Node.js / Express
│                                 │
│  • TLS fingerprinting (JA3)     │
│  • Entropy calculation          │
│  • Uniqueness scoring           │
│  • Spoofing detection           │
│  • Recommendations engine       │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│   Report Generator              │
│                                 │
│  • HTML report (standalone)     │
│  • JSON report (structured)     │
│  • @HACKEROFHELL watermark      │
└─────────────────────────────────┘
```

---

## Fingerprint Signal Flow

```
Browser Signals Collected
         │
         ├─ Hardware
         │    ├─ CPU cores (navigator.hardwareConcurrency)
         │    ├─ Device memory (navigator.deviceMemory)
         │    ├─ Screen: width, height, DPR, colorDepth
         │    └─ Touch points (maxTouchPoints)
         │
         ├─ Canvas Fingerprint
         │    ├─ Render text + shapes on hidden canvas
         │    ├─ Export to base64
         │    └─ SHA-256 hash → entropy score
         │
         ├─ WebGL Fingerprint
         │    ├─ WEBGL_debug_renderer_info → GPU vendor/renderer
         │    ├─ Shader precision formats
         │    └─ Supported extensions list
         │
         ├─ Audio Fingerprint
         │    ├─ OscillatorNode → DynamicsCompressorNode
         │    ├─ ScriptProcessor captures output buffer
         │    └─ Hash from accumulated float values
         │
         ├─ Font Fingerprinting
         │    ├─ Test 150+ font names
         │    ├─ Measure text width vs. monospace baseline
         │    └─ Detected fonts → hash
         │
         ├─ WebRTC Leak Detection
         │    ├─ RTCPeerConnection + STUN servers
         │    ├─ Parse ICE candidates for IP addresses
         │    └─ Classify: local / public / IPv6
         │
         └─ Browser + OS Signals
              ├─ User-Agent, language, timezone
              ├─ Plugins, MIME types, DNT
              └─ Storage: cookies, localStorage, IDB, cache
```

---

## Entropy Calculation

Shannon entropy formula:

```
H = -Σ p(x) * log₂(p(x))
```

Signal entropy estimates (bits):

| Signal         | Bits  | 1 in X users  |
|----------------|-------|---------------|
| WebRTC local IP | 17.1 | ~140,000      |
| WebGL renderer  | 16.8 | ~115,000      |
| Canvas hash     | 14.2 | ~18,000       |
| Font set        | 12.9 | ~7,600        |
| Audio hash      | 11.4 | ~2,700        |
| TLS JA3         | 10.7 | ~1,700        |
| Browser UA      | 8.3  | ~320          |
| Screen metrics  | 5.6  | ~48           |
| Timezone        | 3.8  | ~14           |
| Language        | 2.9  | ~7            |

**Combined entropy → Uniqueness score (0–100)**

---

## Spoofing Detection Logic

```
if canvas_hash changes on reload
  AND webgl_renderer is constant
  → canvas noise injection detected

if navigator.webdriver === true
  → Selenium/Playwright/Puppeteer bot

if UA reports macOS
  AND platform reports Win32
  → User-agent spoofing detected

if timezone is UTC
  AND language is region-specific
  → Timezone manipulation suspected
```

---

## Deployment

### Local Development
```bash
npm run dev          # Starts both frontend (3000) + backend (4000)
```

### Docker
```bash
docker build -t spectre .
docker run -p 3000:3000 spectre

# Or with docker-compose:
docker-compose up
```

### Cloud (Vercel + Render)
- Frontend → Deploy `/frontend` to Vercel
- Backend  → Deploy `/backend` to Render
- Set `FRONTEND_URL` env var on backend

---

## API Reference

### `POST /api/analyze`
Accepts fingerprint JSON, returns full analysis.

**Request body:** See `useFingerprint.js` output structure.

**Response:**
```json
{
  "entropy": { "breakdown": [...], "total_bits": 98.7 },
  "uniqueness": { "score": 91, "one_in_x": "1.2 million" },
  "stability": { "stability": 94, "persistence": "HIGH" },
  "spoofing": { "total_detected": 1, "inconsistency_detected": true },
  "recommendations": [...]
}
```

### `POST /api/report/html`
Returns standalone HTML report file.

### `POST /api/report/json`
Returns JSON report with attribution metadata.

### `GET /api/about`
```json
{
  "tool": "Spectre",
  "version": "1.0.0",
  "developer": "@HACKEROFHELL",
  "author": "Rajesh Bajiya",
  "github": "github.com/hellrider978"
}
```

---

*Generated by Spectre v1.0 · Created by @HACKEROFHELL · github.com/hellrider978*
