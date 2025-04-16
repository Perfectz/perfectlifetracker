# docker-reset.ps1
# Complete Docker environment reset script for Perfect LifeTracker Pro
# Use this when other approaches fail to resolve container issues

Write-Host "=== Perfect LifeTracker Pro Docker Reset Script ===" -ForegroundColor Red
Write-Host "This script will completely reset your Docker environment!" -ForegroundColor Yellow
Write-Host "All containers, images, and volumes associated with this project will be removed." -ForegroundColor Yellow
Write-Host

$confirmation = Read-Host "Are you sure you want to proceed? (y/n)"
if ($confirmation -ne "y" -and $confirmation -ne "Y") {
    Write-Host "Reset cancelled." -ForegroundColor Green
    exit
}

# 1. Stop all running containers
Write-Host "Stopping all running containers..." -ForegroundColor Yellow
try {
    docker-compose -f docker-compose.rules.yml down 2>&1 | Out-Null
    docker-compose -f docker-compose.simple.yml down 2>&1 | Out-Null
    docker stop lifetrack-frontend-dev lifetrack-backend-dev 2>&1 | Out-Null
    Write-Host "✓ Containers stopped" -ForegroundColor Green
} catch {
    Write-Host "✗ Error stopping containers, continuing anyway" -ForegroundColor Red
}

# 2. Remove all project containers (running or stopped)
Write-Host "Removing all project containers..." -ForegroundColor Yellow
docker rm -f $(docker ps -a --filter "name=lifetrack" -q) 2>&1 | Out-Null
docker rm -f $(docker ps -a --filter "ancestor=perfectltp-frontend" -q) 2>&1 | Out-Null
docker rm -f $(docker ps -a --filter "ancestor=perfectltp-backend" -q) 2>&1 | Out-Null
Write-Host "✓ Containers removed" -ForegroundColor Green

# 3. Remove project images
Write-Host "Removing project Docker images..." -ForegroundColor Yellow
docker rmi -f perfectltp-frontend perfectltp-backend 2>&1 | Out-Null
Write-Host "✓ Project images removed" -ForegroundColor Green

# 4. Remove dangling images and volumes
Write-Host "Cleaning up Docker system..." -ForegroundColor Yellow
docker system prune -f 2>&1 | Out-Null
Write-Host "✓ Docker system cleaned" -ForegroundColor Green

# 5. Remove any project networks
Write-Host "Removing Docker networks..." -ForegroundColor Yellow
docker network rm perfectltp_network perfectltp_default 2>&1 | Out-Null
Write-Host "✓ Networks removed" -ForegroundColor Green

# 6. Restart Docker if needed
$restartDocker = Read-Host "Would you like to restart Docker Desktop? (y/n)"
if ($restartDocker -eq "y" -or $restartDocker -eq "Y") {
    Write-Host "Stopping Docker Desktop..." -ForegroundColor Yellow
    $processes = Get-Process *docker* -ErrorAction SilentlyContinue
    foreach ($process in $processes) {
        try {
            $process | Stop-Process -Force -ErrorAction SilentlyContinue
            Write-Host "  Stopped process: $($process.ProcessName)" -ForegroundColor Gray
        } catch {
            # Ignore errors
        }
    }
    
    Write-Host "Starting Docker Desktop..." -ForegroundColor Yellow
    Start-Process 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
    Write-Host "Waiting for Docker to start (30 seconds)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    Write-Host "✓ Docker Desktop restarted" -ForegroundColor Green
}

Write-Host
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Docker environment has been reset!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host
Write-Host "You can now run ./docker-run.ps1 to start with a clean environment" -ForegroundColor White 