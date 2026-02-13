# Multi-stage build: build frontend, then serve everything with Node.js

# ── Stage 1: Build frontend ─────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: Production server ───────────────────────────
FROM node:22-alpine

WORKDIR /app

# Copy package files and install production deps only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy backend files
COPY server/ ./server/

# Copy built frontend from stage 1
COPY --from=build /app/dist ./dist

# Create database directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 3001

# Set production environment
ENV NODE_ENV=production

# Start server (serves API + static frontend)
CMD ["node", "server/server.js"]
