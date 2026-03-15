/*
 * Spectre Browser Fingerprint Analyzer
 * Module: Storage Fingerprinting & Tracking Persistence
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 * GitHub: github.com/hellrider978
 * Year: 2026
 * License: MIT
 */

const STORAGE_KEY = 'spectre_fp_id';
const SESSION_KEY = 'spectre_session';
const IDB_DB      = 'SpectreDB';
const IDB_STORE   = 'fingerprints';
const CACHE_NAME  = 'spectre-cache-v1';

/**
 * Tests all browser storage mechanisms for tracking persistence capability.
 * Also performs cross-session fingerprint comparison.
 */
export async function getStorageFingerprint() {
  const results = {
    cookies:      testCookies(),
    localStorage: testLocalStorage(),
    sessionStorage: testSessionStorage(),
    indexedDB:    await testIndexedDB(),
    cacheStorage: await testCacheStorage(),
    tracking_id:  null,
    session_history: [],
    persistence_score: 0,
  };

  // Count working storage mechanisms
  const working = Object.values({
    cookies: results.cookies.available,
    localStorage: results.localStorage.available,
    sessionStorage: results.sessionStorage.available,
    indexedDB: results.indexedDB.available,
    cacheStorage: results.cacheStorage.available,
  }).filter(Boolean).length;

  results.persistence_score = Math.round((working / 5) * 100);

  // Cross-session tracking ID
  results.tracking_id = getOrCreateTrackingId();

  // Session history
  results.session_history = getSessionHistory();

  return results;
}

function testCookies() {
  try {
    document.cookie = 'spectre_test=1; SameSite=Strict';
    const ok = document.cookie.includes('spectre_test');
    return { available: ok, count: document.cookie.split(';').length };
  } catch(e) {
    return { available: false, error: e.message };
  }
}

function testLocalStorage() {
  try {
    localStorage.setItem('spectre_test', '1');
    const ok = localStorage.getItem('spectre_test') === '1';
    localStorage.removeItem('spectre_test');
    const size = JSON.stringify(localStorage).length;
    return { available: ok, item_count: localStorage.length, size_bytes: size };
  } catch(e) {
    return { available: false, error: e.message };
  }
}

function testSessionStorage() {
  try {
    sessionStorage.setItem('spectre_test', '1');
    const ok = sessionStorage.getItem('spectre_test') === '1';
    sessionStorage.removeItem('spectre_test');
    return { available: ok, item_count: sessionStorage.length };
  } catch(e) {
    return { available: false, error: e.message };
  }
}

async function testIndexedDB() {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(IDB_DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE, { keyPath: 'id' });
      req.onsuccess = () => { req.result.close(); resolve({ available: true }); };
      req.onerror   = () => resolve({ available: false });
      setTimeout(() => resolve({ available: false, reason: 'timeout' }), 2000);
    } catch(e) {
      resolve({ available: false, error: e.message });
    }
  });
}

async function testCacheStorage() {
  try {
    if (!('caches' in window)) return { available: false };
    const cache = await caches.open(CACHE_NAME);
    await cache.put('/spectre-probe', new Response('test'));
    const hit = await caches.match('/spectre-probe');
    return { available: !!hit };
  } catch(e) {
    return { available: false, error: e.message };
  }
}

function getOrCreateTrackingId() {
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = 'SP-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2,6).toUpperCase();
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch(e) {
    return null;
  }
}

function getSessionHistory() {
  try {
    const raw = localStorage.getItem('spectre_sessions');
    const sessions = raw ? JSON.parse(raw) : [];
    const now = { id: sessions.length + 1, time: new Date().toISOString(), ts: Date.now() };
    sessions.push(now);
    if (sessions.length > 10) sessions.shift();
    localStorage.setItem('spectre_sessions', JSON.stringify(sessions));
    return sessions;
  } catch(e) {
    return [];
  }
}
