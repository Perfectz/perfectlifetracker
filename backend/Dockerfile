# Build stage: Use Node.js 20 Alpine as base image
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json ./

# Install dependencies with clean slate
RUN npm ci

# Copy all source files
COPY . .

# Build the application
RUN npm run build

# Production stage: Smaller image for production
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built files from build stage
COPY --from=build /app/dist ./dist

# Expose API port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Start the server
CMD ["node", "dist/index.js"]

# Development stage
FROM node:20-alpine AS development

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# Expose API port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=development
ENV PORT=3001

# Start development server with hot reload
CMD ["npm", "run", "dev"] 