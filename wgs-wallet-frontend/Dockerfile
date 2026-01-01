# Frontend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY src ./src
COPY public ./public

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_SOLANA_NETWORK
ARG VITE_SOLANA_RPC_URL

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOLANA_NETWORK=$VITE_SOLANA_NETWORK
ENV VITE_SOLANA_RPC_URL=$VITE_SOLANA_RPC_URL

# Build the application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

