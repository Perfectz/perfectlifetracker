# docker-run.ps1
# Script to ensure app always runs in Docker containers with proper rules

Write-Host "=== Perfect LifeTracker Pro Docker Startup Script ===" -ForegroundColor Cyan
Write-Host "Starting the application with robust Docker containers..." -ForegroundColor Green
Write-Host

# Check if Docker is running
$dockerRunning = $false
try {
    $dockerStatus = docker info 2>&1
    $dockerRunning = $true
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    $dockerRunning = $false
    Write-Host "✗ Docker is not running" -ForegroundColor Red
}

if (-not $dockerRunning) {
    Write-Host "Starting Docker Desktop..." -ForegroundColor Yellow
    Start-Process 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
    Write-Host "Waiting for Docker to start (30 seconds)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
}

# Stop existing containers if they exist
Write-Host "Stopping any existing containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.rules.yml down 2>&1 | Out-Null
docker-compose -f docker-compose.simple.yml down 2>&1 | Out-Null 
docker stop lifetrack-frontend-dev 2>&1 | Out-Null
docker stop lifetrack-backend-dev 2>&1 | Out-Null

# Clean up Docker resources
Write-Host "Cleaning up Docker resources..." -ForegroundColor Yellow
docker system prune -f 2>&1 | Out-Null

# Remove any problematic Docker images
Write-Host "Removing old container images..." -ForegroundColor Yellow
docker rmi perfectltp-frontend perfectltp-backend 2>&1 | Out-Null

# Build and start containers using the rules file
Write-Host "Building containers from scratch (this may take a few minutes)..." -ForegroundColor Green
docker-compose -f docker-compose.rules.yml build --no-cache

Write-Host "Starting containers..." -ForegroundColor Green
docker-compose -f docker-compose.rules.yml up -d

# Wait for containers to be healthy
Write-Host "Waiting for containers to be ready (this may take up to 60 seconds)..." -ForegroundColor Yellow
$backendReady = $false
$frontendReady = $false
$maxRetries = 20
$retryCount = 0

while ((-not $backendReady -or -not $frontendReady) -and $retryCount -lt $maxRetries) {
    $retryCount++
    Write-Host "Checking container status (attempt $retryCount of $maxRetries)..." -ForegroundColor Gray
    Start-Sleep -Seconds 3
    
    # Check backend status
    $backendStatus = docker ps --filter "name=lifetrack-backend-dev" --format "{{.Status}}" 2>&1
    if ($backendStatus -like "*healthy*") {
        $backendReady = $true
        Write-Host "✓ Backend is ready!" -ForegroundColor Green
    } elseif ($backendStatus -like "*starting*") {
        Write-Host "⟳ Backend is starting..." -ForegroundColor Yellow
    } elseif ($retryCount -eq $maxRetries) {
        Write-Host "⚠ Backend may not be fully ready, but continuing..." -ForegroundColor Yellow
    }
    
    # Check frontend status
    $frontendStatus = docker ps --filter "name=lifetrack-frontend-dev" --format "{{.Status}}" 2>&1
    if ($frontendStatus -like "*healthy*") {
        $frontendReady = $true
        Write-Host "✓ Frontend is ready!" -ForegroundColor Green
    } elseif ($frontendStatus -like "*starting*") {
        Write-Host "⟳ Frontend is starting..." -ForegroundColor Yellow
    } elseif ($retryCount -eq $maxRetries) {
        Write-Host "⚠ Frontend may not be fully ready, but continuing..." -ForegroundColor Yellow
    }
}

Write-Host
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Perfect LifeTracker Pro is now running!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Backend:  http://localhost:3001" -ForegroundColor White
Write-Host "================================================" -ForegroundColor Cyan
Write-Host
Write-Host "Commands:" -ForegroundColor White
Write-Host "- View logs:  docker-compose -f docker-compose.rules.yml logs -f" -ForegroundColor Gray
Write-Host "- Stop app:   ./docker-stop.ps1" -ForegroundColor Gray
Write-Host "================================================" -ForegroundColor Cyan

# Ask if the user wants to see logs
$showLogs = Read-Host "Would you like to view the container logs? (y/n)"
if ($showLogs -eq "y" -or $showLogs -eq "Y") {
    Write-Host "Showing logs (press Ctrl+C to exit logs, containers will continue running)..." -ForegroundColor Yellow
    docker-compose -f docker-compose.rules.yml logs -f
} else {
    Write-Host "Containers are running in the background." -ForegroundColor Green
    Write-Host "You can view logs later with: docker-compose -f docker-compose.rules.yml logs -f" -ForegroundColor Gray
} 