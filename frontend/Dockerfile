# Use Node.js 20 Alpine as base image for smaller size
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose the port Vite dev server runs on
EXPOSE 3000

# Start the development server
# Using --host 0.0.0.0 to make it accessible outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 