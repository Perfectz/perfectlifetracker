# Stage 1: Build the React application
FROM node:18-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the code
COPY . .

# Build the app
RUN npm run build

# Stage 2: Serve the static files with NGINX
FROM nginx:1.23.3-alpine

# Create a non-root user to run NGINX
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy the build output from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Create a health check endpoint
RUN echo '<!DOCTYPE html><html><head><title>Health Check</title></head><body><h1>OK</h1></body></html>' > /usr/share/nginx/html/health

# Copy a custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Fix permissions for the non-root user
RUN chown -R appuser:appgroup /var/cache/nginx /var/log/nginx /etc/nginx/conf.d \
    && chmod -R 755 /var/cache/nginx /var/log/nginx /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown appuser:appgroup /var/run/nginx.pid

# Use the non-root user
USER appuser

# Expose port 80
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"] 