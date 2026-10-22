# ==========================================
# Stage 1: Build the React Application
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package.json package-lock.json ./

# Install dependencies strictly from package-lock
RUN npm ci

# Copy project files
COPY . .

# Build Arguments
ARG VITE_BASE_PATH=/
ARG VITE_SUPABASE_URL=https://jsajtnrvocialfaupjxw.supabase.co
ARG VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_VVLUy21pC0VCHmAVpNMhXw_nsnNiVLP

ENV VITE_BASE_PATH=$VITE_BASE_PATH
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY

# Build production distribution
RUN npm run build

# ==========================================
# Stage 2: Serve with Lightweight Nginx
# ==========================================
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built distribution from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port 80
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
