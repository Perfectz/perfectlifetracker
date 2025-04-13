# Build stage: Use Node.js 20 Alpine as base image
FROM node:20-bullseye AS build

# Set working directory
WORKDIR /app

# Define build arguments for configuration
ARG REACT_APP_AZURE_CLIENT_ID
ARG REACT_APP_AZURE_AUTHORITY
ARG REACT_APP_AZURE_REDIRECT_URI
ARG VITE_API_URL=http://localhost:3001

# Set environment variables from build args
ENV VITE_REACT_APP_AZURE_CLIENT_ID=${REACT_APP_AZURE_CLIENT_ID}
ENV VITE_REACT_APP_AZURE_AUTHORITY=${REACT_APP_AZURE_AUTHORITY}
ENV VITE_REACT_APP_AZURE_REDIRECT_URI=${REACT_APP_AZURE_REDIRECT_URI}
ENV VITE_API_URL=${VITE_API_URL}
# Disable native rollup modules
ENV ROLLUP_SKIP_NODEJS_NATIVE=1
ENV NPM_CONFIG_OPTIONAL=false

# Copy package files for dependency installation
COPY package.json ./

# Create a clean package-lock.json to avoid platform issues
RUN rm -f package-lock.json && npm install --package-lock-only --legacy-peer-deps

# Install dependencies with legacy peer deps to handle React version conflicts
RUN npm install --legacy-peer-deps --no-optional

# Copy all source files
COPY . .

# Create custom vite.config.js for build that avoids rollup native dependencies
RUN echo "// Add rollup override to skip native dependencies" >> /app/vite.config.build.js \
    && echo "import { defineConfig } from 'vite';" >> /app/vite.config.build.js \
    && echo "import react from '@vitejs/plugin-react';" >> /app/vite.config.build.js \
    && echo "export default defineConfig({" >> /app/vite.config.build.js \
    && echo "  plugins: [react()]," >> /app/vite.config.build.js \
    && echo "  build: { target: 'es2015', minify: 'terser', outDir: 'build' }," >> /app/vite.config.build.js \
    && echo "  optimizeDeps: { disabled: false }," >> /app/vite.config.build.js \
    && echo "  define: { 'process.env': process.env }," >> /app/vite.config.build.js \
    && echo "});" >> /app/vite.config.build.js

# Build the application for production
RUN npx tsc && npx vite build --config /app/vite.config.build.js

# Production stage: Create a smaller image for serving
FROM nginx:stable-alpine AS production

# Copy built files from build stage to nginx serve directory
COPY --from=build /app/build /usr/share/nginx/html

# Copy the custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the web server
EXPOSE 80

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]

# Development stage: Use Node.js with Debian instead of Alpine for better compatibility
FROM node:20-bullseye AS development

# Define build arguments for development
ARG REACT_APP_AZURE_CLIENT_ID
ARG REACT_APP_AZURE_AUTHORITY
ARG REACT_APP_AZURE_REDIRECT_URI
ARG VITE_API_URL=http://localhost:3001

# Set environment variables
ENV VITE_REACT_APP_AZURE_CLIENT_ID=${REACT_APP_AZURE_CLIENT_ID}
ENV VITE_REACT_APP_AZURE_AUTHORITY=${REACT_APP_AZURE_AUTHORITY}
ENV VITE_REACT_APP_AZURE_REDIRECT_URI=${REACT_APP_AZURE_REDIRECT_URI}
ENV VITE_API_URL=${VITE_API_URL}
ENV NODE_ENV=development
# Disable native Node.js addons for consistent builds across platforms
ENV ROLLUP_SKIP_NODEJS_NATIVE=1
# Configure npm to skip optional dependencies
ENV NPM_CONFIG_OPTIONAL=false

# Install required dependencies 
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Create a clean package-lock.json on Linux for platform compatibility
RUN rm -f package-lock.json && npm install --package-lock-only --legacy-peer-deps

# Install dependencies
RUN npm install --legacy-peer-deps --no-optional

# Copy source code
COPY . .

# Create custom vite.config.js that avoids rollup native dependencies
RUN echo "// Add rollup override to skip native dependencies" >> /app/vite.config.skip-native.js \
    && echo "import { defineConfig } from 'vite';" >> /app/vite.config.skip-native.js \
    && echo "import react from '@vitejs/plugin-react';" >> /app/vite.config.skip-native.js \
    && echo "export default defineConfig({" >> /app/vite.config.skip-native.js \
    && echo "  plugins: [react()]," >> /app/vite.config.skip-native.js \
    && echo "  build: { target: 'esnext', minify: 'terser' }," >> /app/vite.config.skip-native.js \
    && echo "  server: { host: '0.0.0.0', port: 3000, open: true }," >> /app/vite.config.skip-native.js \
    && echo "  optimizeDeps: { disabled: false, esbuildOptions: { target: 'esnext' } }," >> /app/vite.config.skip-native.js \
    && echo "  define: { 'process.env': process.env }," >> /app/vite.config.skip-native.js \
    && echo "});" >> /app/vite.config.skip-native.js

# Expose the Vite development server port
EXPOSE 3000

# Start development server with host flag for container access
CMD ["npx", "vite", "--config", "/app/vite.config.skip-native.js", "--host", "0.0.0.0"] 