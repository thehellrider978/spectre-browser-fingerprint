/*
 * Spectre Browser Fingerprint Analyzer
 * Module: WebRTC Leak Detection
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 * GitHub: github.com/hellrider978
 * Year: 2026
 * License: MIT
 */

/**
 * Tests for IP address leakage via WebRTC ICE candidates.
 * Can expose local IP, IPv6, and VPN bypass vulnerabilities.
 */
export async function getWebRTCLeaks() {
  return new Promise((resolve) => {
    const results = {
      local_ips:  [],
      public_ips: [],
      ipv6_ips:   [],
      leak_detected: false,
      vpn_bypass: false,
      stun_exposed: false,
      status: 'success'
    };

    try {
      const RTCPeerConnection = window.RTCPeerConnection
        || window.mozRTCPeerConnection
        || window.webkitRTCPeerConnection;

      if (!RTCPeerConnection) {
        return resolve({ ...results, status: 'unsupported' });
      }

      const servers = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ]
      };

      const pc = new RTCPeerConnection(servers);
      const seenIPs = new Set();

      pc.createDataChannel('spectre-probe');

      pc.onicecandidate = (e) => {
        if (!e || !e.candidate || !e.candidate.candidate) {
          // ICE gathering complete
          pc.close();
          return resolve(results);
        }

        const candidate = e.candidate.candidate;
        const ipMatch = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(candidate);

        if (ipMatch) {
          const ip = ipMatch[1];
          if (seenIPs.has(ip)) return;
          seenIPs.add(ip);

          if (isLocalIP(ip)) {
            results.local_ips.push(ip);
            results.leak_detected = true;
          } else if (isIPv6(ip)) {
            results.ipv6_ips.push(ip);
            results.leak_detected = true;
          } else if (!isReservedIP(ip)) {
            results.public_ips.push(ip);
            results.stun_exposed = true;
          }

          // VPN bypass: if local IP appears alongside public IP
          if (results.local_ips.length > 0 && results.public_ips.length > 0) {
            results.vpn_bypass = true;
          }
        }
      };

      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .catch(err => resolve({ ...results, status: 'error', error: err.message }));

      // Timeout after 5s
      setTimeout(() => {
        try { pc.close(); } catch(e) {}
        resolve(results);
      }, 5000);

    } catch (e) {
      resolve({ ...results, status: 'error', error: e.message });
    }
  });
}

function isLocalIP(ip) {
  return /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.|127\.|169\.254\.|fc|fd)/.test(ip);
}

function isIPv6(ip) {
  return ip.includes(':');
}

function isReservedIP(ip) {
  return /^(0\.|255\.|127\.|169\.254\.)/.test(ip);
}
