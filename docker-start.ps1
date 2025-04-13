# docker-start.ps1
# Script to start Perfect LifeTracker Pro using Docker

Write-Host "STARTING: Preparing to start application using Docker..." -ForegroundColor Cyan

# 1. First clean up any running containers and processes
Write-Host "CLEANING: Cleaning up existing processes..." -ForegroundColor Yellow
& "$PSScriptRoot\docker-clean.ps1"

# 2. Check Docker is running
Write-Host "CHECKING: Verifying Docker is running..." -ForegroundColor Cyan
$dockerRunning = $false
try {
    $dockerStatus = docker info 2>&1
    $dockerRunning = $true
    Write-Host "SUCCESS: Docker is running" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# 3. Choose between development and production mode
param(
    [switch]$dev = $false
)

if ($dev) {
    # Development mode - with hot reloading
    Write-Host "STARTING: Starting in DEVELOPMENT mode with hot reloading" -ForegroundColor Cyan
    docker-compose up --profile dev app-dev backend-dev
} else {
    # Production mode - optimized build
    Write-Host "STARTING: Starting in PRODUCTION mode" -ForegroundColor Cyan
    docker-compose up app backend
}

# Note: This script will keep running until Ctrl+C is pressed to stop the containers 