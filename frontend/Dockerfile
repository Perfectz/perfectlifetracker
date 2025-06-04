# ------------------------------------------------------------
# Dependencies stage
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# ------------------------------------------------------------
# Build stage
FROM deps AS build
COPY . .
RUN npm run build

# ------------------------------------------------------------
# Production image
FROM nginx:1.25.4-alpine3.18 AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# ------------------------------------------------------------
# Development image
FROM node:20-bullseye AS development
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
