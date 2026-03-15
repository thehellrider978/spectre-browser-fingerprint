# Spectre Browser Fingerprint Analyzer
# Author: @HACKEROFHELL (Rajesh Bajiya)
# GitHub: github.com/hellrider978
# Multi-stage Docker build

# ── Stage 1: Build frontend ──────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# ── Stage 2: Production server ───────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# Copy backend source
COPY backend/ ./backend/
COPY reports/  ./reports/

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Environment
ENV NODE_ENV=production
ENV PORT=3000
ENV FRONTEND_URL=http://localhost:3000

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Start
CMD ["node", "backend/server.js"]
