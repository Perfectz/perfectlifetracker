# Build stage: Use Node.js 20 Alpine as base image
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json ./

# Install dependencies with legacy peer deps to handle React version conflicts
RUN npm ci --legacy-peer-deps

# Copy all source files
COPY . .

# Build the application for production
RUN npm run build

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
FROM node:20 AS development

# Install required dependencies 
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies with npm install and force to avoid platform-specific issues
RUN npm install --legacy-peer-deps --no-optional

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=development

# Expose the Vite development server port
EXPOSE 3000

# Start development server with host flag for container access
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 