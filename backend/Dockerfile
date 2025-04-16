# Build stage: Use Node.js 20 Alpine as base image
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install dependencies with clean slate
RUN npm install

# Copy all source files
COPY . .

# Build the application
RUN npm run build

# Production stage: Smaller image for production
FROM node:20-alpine AS prod

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Explicitly install MongoDB driver
RUN npm install mongodb@5.7.0 --save

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

# Install all dependencies including dev dependencies
RUN npm ci

# Install uuid explicitly with a version compatible with Node 20 and CommonJS
RUN npm install uuid@9.0.1 --save

# Explicitly install MongoDB driver
RUN npm install mongodb@5.7.0 --save

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose API port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=development
ENV PORT=3001

# Start development server with hot reload
CMD ["npm", "run", "dev"] 