# ================================================================
# Nirmalayam Krafts — Frontend Server
# Multi-stage Dockerfile: Vite 8 build → Nginx Alpine serve
# ================================================================

# ----------------------------------------------------------------
# STAGE 1: Build  (node:20-alpine)
# Installs all NPM dependencies and compiles the Vite/React SPA.
# VITE_ prefixed build args are baked into the static bundle.
# ----------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Declare every VITE_ build-time argument
ARG VITE_API_BASE_URL=/api
ARG VITE_API_TIMEOUT=30000
ARG VITE_APP_NAME="Nirmalyam Admin Dashboard"
ARG VITE_APP_VERSION=1.0.0
ARG VITE_ENVIRONMENT=production
ARG VITE_ENABLE_MOCK_API=false
ARG VITE_ENABLE_ANALYTICS=false
ARG VITE_ENABLE_NOTIFICATIONS=true

# Promote build args to ENV so Vite picks them up at build time
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_API_TIMEOUT=$VITE_API_TIMEOUT \
    VITE_APP_NAME=$VITE_APP_NAME \
    VITE_APP_VERSION=$VITE_APP_VERSION \
    VITE_ENVIRONMENT=$VITE_ENVIRONMENT \
    VITE_ENABLE_MOCK_API=$VITE_ENABLE_MOCK_API \
    VITE_ENABLE_ANALYTICS=$VITE_ENABLE_ANALYTICS \
    VITE_ENABLE_NOTIFICATIONS=$VITE_ENABLE_NOTIFICATIONS

# Install dependencies first (cached layer if package.json unchanged)
COPY package*.json ./
RUN npm ci --prefer-offline

# Copy source and build
COPY . .
RUN npm run build

# Verify build output exists
RUN test -d /app/dist && echo "✅ Build successful" || (echo "❌ Build failed: dist/ not found" && exit 1)

# ----------------------------------------------------------------
# STAGE 2: Production  (nginx:1.27-alpine)
# Copies only the compiled static assets. No Node.js at runtime.
# Runs as the built-in unprivileged 'nginx' user.
# ----------------------------------------------------------------
FROM nginx:1.27-alpine AS production

# Remove the default nginx configuration
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy our production-hardened nginx config
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copy static build artifacts from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Ensure the nginx user owns all content
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chmod -R 755 /usr/share/nginx/html

EXPOSE 80

# Container health check — Nginx serves /health as a 200 response
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
