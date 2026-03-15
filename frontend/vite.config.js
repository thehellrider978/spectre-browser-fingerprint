import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  // Entry: frontend/index.html already references /src/main.jsx
  root: '.',

  resolve: {
    alias: {
      // Allow App.jsx to import scanner modules via ../../scanner/
      // without needing to move files: alias resolves cleanly
      '@scanner': path.resolve(__dirname, '../scanner'),
      '@utils':   path.resolve(__dirname, 'src/utils'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages':   path.resolve(__dirname, 'src/pages'),
      '@styles':  path.resolve(__dirname, 'src/styles'),
    },
  },

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:4000',
        changeOrigin: true,
      }
    }
  },

  build: {
    outDir:    'dist',
    sourcemap: false,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    }
  }
});
