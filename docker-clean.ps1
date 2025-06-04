# docker-stop.ps1
# Script to properly stop all Docker containers for Perfect LifeTracker Pro

Write-Host "=== Perfect LifeTracker Pro Docker Shutdown Script ===" -ForegroundColor Cyan
Write-Host "Stopping all containers..." -ForegroundColor Yellow
Write-Host

# Stop containers defined in rules file
$rulesStopped = $false
try {
    docker-compose -f docker-compose.rules.yml down
    $rulesStopped = $true
    Write-Host "✓ Stopped containers from docker-compose.rules.yml" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to stop containers from docker-compose.rules.yml" -ForegroundColor Red
}

# Also stop any containers from the simple compose file if they exist
$simpleStopped = $false
try {
    docker-compose -f docker-compose.simple.yml down 2>&1 | Out-Null
    $simpleStopped = $true
    Write-Host "✓ Stopped containers from docker-compose.simple.yml" -ForegroundColor Green
} catch {
    Write-Host "✓ No containers from docker-compose.simple.yml running" -ForegroundColor Gray
}

# Just in case, stop any containers with our project names directly
try {
    $frontendStopped = docker stop lifetrack-frontend-dev 2>&1
    if ($frontendStopped -like "*lifetrack-frontend-dev*") {
        Write-Host "✓ Stopped frontend container directly" -ForegroundColor Green
    }
} catch {
    # Container likely not running, ignore
}

try {
    $backendStopped = docker stop lifetrack-backend-dev 2>&1
    if ($backendStopped -like "*lifetrack-backend-dev*") {
        Write-Host "✓ Stopped backend container directly" -ForegroundColor Green
    }
} catch {
    # Container likely not running, ignore
}

# Also remove any stopped containers to ensure clean state
Write-Host "Removing stopped containers..." -ForegroundColor Yellow
docker container prune -f 2>&1 | Out-Null

# Check if any project containers are still running
$runningContainers = docker ps --filter "name=lifetrack" --format "{{.Names}}" 2>&1
if ($runningContainers) {
    Write-Host "⚠ Warning: Some containers are still running: $runningContainers" -ForegroundColor Red
    
    $forceStop = Read-Host "Do you want to force stop all containers? (y/n)"
    if ($forceStop -eq "y" -or $forceStop -eq "Y") {
        docker stop $(docker ps -q) 2>&1 | Out-Null
        Write-Host "✓ Forced stop of all running containers" -ForegroundColor Green
    }
} else {
    Write-Host "✓ No project containers are running" -ForegroundColor Green
}

Write-Host
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Perfect LifeTracker Pro has been stopped" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan 