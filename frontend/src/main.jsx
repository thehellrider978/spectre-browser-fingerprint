/*
 * Spectre Browser Fingerprint Analyzer
 * Entry point
 * Author: @HACKEROFHELL (Rajesh Bajiya)
 * GitHub: github.com/hellrider978
 * Year: 2026 | License: MIT
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './pages/App.jsx';
import './styles/main.css';
import './styles/dashboard.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
