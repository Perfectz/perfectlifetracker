# GitHub Actions CI Workflow

This directory contains GitHub Actions workflow configurations for Perfect LifeTracker Pro.

## CI Workflow (ci.yml)

The CI workflow runs automatically on:
- Pushes to the `main` branch
- Pull requests targeting the `main` branch

### What it does:

1. **Code Quality Checks**
   - Runs ESLint to enforce code quality standards
   - Checks Prettier formatting to ensure consistent code style

2. **Build Verification**
   - Builds the Docker image for the frontend to verify build process
   - Conditionally builds backend Docker image if backend code is present
   - Validates docker-compose.yml configuration

### Benefits for Solo Development

Even as a solo developer, this CI pipeline provides significant benefits:

- **Automated Quality Control**: Catches linting errors and formatting issues automatically
- **Build Verification**: Ensures your Docker setup remains functional
- **Early Issue Detection**: Identifies problems immediately after code changes
- **Consistent Environment**: Tests in a clean environment, eliminating "works on my machine" issues

### Workflow Explanation

The workflow runs on an Ubuntu runner and performs these steps:

1. **Setup**:
   - Checks out your code repository
   - Sets up Node.js 20 with dependency caching

2. **Frontend Checks**:
   - Installs frontend dependencies
   - Runs ESLint on frontend code
   - Verifies Prettier formatting
   - Builds frontend Docker image

3. **Backend Checks** (if present):
   - Checks if backend code exists
   - Installs backend dependencies
   - Runs backend linting (when configured)
   - Builds backend Docker image (if Dockerfile exists)

4. **Docker Compose Validation**:
   - Verifies docker-compose.yml is valid

### Future Extensions

This workflow can be extended with:
- Automated testing (`npm test`)
- Production builds verification
- Container registry publishing
- Deployment triggers

## Usage with Git Workflow

When using this CI pipeline:

1. For direct pushes to `main`: The CI runs after the push is complete.
2. For Pull Request workflow: The CI runs before merging, allowing you to fix issues before they reach `main`.

For best practices, consider:
- Working in feature branches
- Opening PRs to merge into `main`
- Waiting for CI to pass before merging 