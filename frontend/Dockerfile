# ==============================================================================
# NagrikLens AI: Frontend Production Dockerfile (Phase 3K)
# ==============================================================================
# Multi-stage build: Node.js 20 build stage -> Nginx Alpine static web server
# ==============================================================================

# --- Stage 1: Build Production Artifacts ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies deterministically
COPY frontend/package*.json ./
RUN npm ci

# Copy source code and build production bundle
COPY frontend/ ./

# Argument for configurable API backend URL during container build
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

# --- Stage 2: Serve Production Artifacts via Nginx ---
FROM nginx:alpine

# Copy custom Nginx configuration with SPA fallback
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
