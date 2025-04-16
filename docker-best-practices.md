# Docker Best Practices for Perfect LifeTracker Pro

## Multi-Stage Builds
- Use multi-stage Docker builds for all frontend and backend services.
- Stage 1: Build with Node (e.g., `node:20-alpine`), output to `/app/dist`.
- Stage 2: Serve with a minimal static server (e.g., `nginx:alpine` or `busybox`), copy only `/app/dist` to the runtime image.

## Static File Serving
- Never use Vite's dev or preview server in production.
- Always serve the `/dist` directory with a production-grade static file server (Nginx, BusyBox, or Caddy).

## Image Versioning
- Pin all base image versions (Node, Nginx, etc.) for reproducibility.

## Dockerfile Layering & Caching
- Copy `package*.json` and run `npm install` before copying the rest of the source code to maximize Docker cache usage.
- Example:
  ```dockerfile
  COPY package*.json ./
  RUN npm install
  COPY . .
  RUN npm run build
  ```

## .dockerignore
- Always include a `.dockerignore` file to exclude `node_modules`, `dist`, `.git`, and other unnecessary files from the build context.

## Environment Variables
- Only expose variables prefixed with `VITE_` to the frontend.
- Use `.env.production` for production builds.
- Pass variables at build time with `--build-arg` or at runtime with `-e`.

## Vite/React Optimization
- Use `@vitejs/plugin-react-swc` for React projects for faster builds.
- Set up path aliases for cleaner imports.
- Use `optimizeDeps` to pre-bundle heavy dependencies.

## Testing and Validation
- Always run `npm run build` locally before Dockerizing.
- Automate builds and tests in CI/CD pipelines.

## Development Workflow
- For development, use Docker volumes to mount source code for hot reload.
- For multi-service setups, use Docker Compose and keep all compose files in the project root.

## Example Multi-Stage Dockerfile (React/Vite)
```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## .dockerignore Example
```
node_modules
dist
.git
```

## Troubleshooting
- If you see "Build Failed" in the container, run `npm run build` locally and fix errors before building the Docker image.
- For port conflicts, ensure all containers are stopped before starting new ones.
- For environment variable issues, check `.env.production` and Docker Compose `environment` sections.

## References
- [Vite Official Docker Guide](https://vitejs.dev/guide/static-deploy.html)
- [Optimized Docker Setup for Vite-Powered React Apps (2024)](https://medium.com/@pierre.fourny/optimized-docker-setup-for-vite-powered-react-apps-e7b7f5a82bb4)
- [Restack Vite Dockerfile Guide (2025)](https://www.restack.io/p/vite-app-answer-dockerfile-guide)
- [How to Dockerize Vite (2024)](https://dev.to/code42cate/how-to-dockerize-vite-44d3)
- [Advanced Guide to Using Vite with React in 2025](https://codeparrot.ai/blogs/advanced-guide-to-using-vite-with-react-in-2025) 