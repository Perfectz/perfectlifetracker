# Build stage: Use Node.js 20 Alpine as base image
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install dependencies with legacy peer deps and force to handle hybrid conflicts
RUN npm install --legacy-peer-deps --force

# Copy all source files
COPY . .

# Build the application for production
RUN npm run build

# Production stage: Create a smaller image for serving
FROM nginx:1.25.4-alpine3.18 AS prod

# Copy built files from build stage to nginx serve directory
COPY --from=build /app/dist /usr/share/nginx/html

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
RUN rm -f package-lock.json && npm install --package-lock-only --legacy-peer-deps --force

# Install dependencies with legacy peer deps and force
RUN npm install --legacy-peer-deps --force --no-optional

# Copy source code
COPY . .

# Create custom vite.config.js for development that excludes React Native
RUN echo "// Add custom config for web-only development" > /app/vite.config.web.js \
    && echo "import { defineConfig } from 'vite';" >> /app/vite.config.web.js \
    && echo "import react from '@vitejs/plugin-react';" >> /app/vite.config.web.js \
    && echo "export default defineConfig({" >> /app/vite.config.web.js \
    && echo "  plugins: [react()]," >> /app/vite.config.web.js \
    && echo "  build: { target: 'esnext', minify: 'terser' }," >> /app/vite.config.web.js \
    && echo "  server: { host: '0.0.0.0', port: 3000, open: true }," >> /app/vite.config.web.js \
    && echo "  optimizeDeps: {" >> /app/vite.config.web.js \
    && echo "    exclude: ['react-native', 'react-native-web', 'expo-status-bar', '@react-navigation/native', '@react-navigation/stack', '@react-navigation/bottom-tabs', 'react-native-safe-area-context', 'react-native-paper', 'date-fns', '@mui/x-date-pickers']" >> /app/vite.config.web.js \
    && echo "  }," >> /app/vite.config.web.js \
    && echo "  define: { 'process.env': process.env }," >> /app/vite.config.web.js \
    && echo "});" >> /app/vite.config.web.js

# Expose the Vite development server port
EXPOSE 3000

# Start development server with custom config
CMD ["npx", "vite", "--config", "/app/vite.config.web.js", "--host", "0.0.0.0"] 