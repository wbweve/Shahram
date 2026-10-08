# ─── Dockerfile for Leadership Platform ─────────────────────────────────────
# Multi-stage: build → production image for consistent, reproducible deploys.
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

FROM node:20-alpine AS production
RUN addgroup -S leadership && adduser -S leadership -G leadership
WORKDIR /app

# Copy only production deps from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application code (read-only at runtime)
COPY --chown=leadership:leadership . .

# Security hardening
RUN chmod -R 555 /app && chmod 755 /app/server-data 2>/dev/null || true

USER leadership
EXPOSE 8001
ENV NODE_ENV=production
ENV PORT=8001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:8001/api/health',r=>process.exit(r.statusCode===200?0:1))"

CMD ["node", "server.js"]