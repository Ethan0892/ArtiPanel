# ArtiPanel Backend Dockerfile - Lightweight Production Build
FROM node:18-alpine AS builder

WORKDIR /app

# Install minimal build dependencies
RUN apk add --no-cache python3 make g++ curl

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (production only after build)
RUN npm ci

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Production stage - minimal image
FROM node:18-alpine

WORKDIR /app

# Install only runtime dependencies
RUN apk add --no-cache curl tini

# Copy built app and node_modules from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Create logs directory
RUN mkdir -p logs && chmod 755 logs

# Non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S artipanel -u 1001
USER artipanel

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Use tini for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start application
CMD ["node", "dist/index.js"]
