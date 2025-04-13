# docker-clean.ps1
# Script to stop and clean up Docker containers for Perfect LifeTracker Pro

Write-Host "CLEANING UP: Stopping and removing Docker containers..." -ForegroundColor Cyan

# 1. Stop all running containers for the application
Write-Host "STOPPING: Stopping any running Docker containers..." -ForegroundColor Yellow
docker-compose down

# 2. Check for any orphaned containers and remove them
$orphanedContainers = docker ps -a --filter "name=lifetrack-" --format "{{.ID}}"
if ($orphanedContainers) {
    Write-Host "FOUND: Found orphaned containers. Removing..." -ForegroundColor Yellow
    docker rm -f $orphanedContainers
    Write-Host "SUCCESS: Orphaned containers removed" -ForegroundColor Green
} else {
    Write-Host "CLEAR: No orphaned containers found" -ForegroundColor Green
}

# 3. Find and kill processes using React ports (3000, 3001, 3002, 3003)
$ports = @(3000, 3001, 3002, 3003)
foreach ($port in $ports) {
    Write-Host "CHECKING: Checking for processes using port $port..." -ForegroundColor Cyan
    $processesUsingPort = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess

    if ($processesUsingPort) {
        foreach ($processId in $processesUsingPort) {
            $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "FOUND: Found process: $($process.Name) (PID: $processId) using port $port" -ForegroundColor Yellow
                Write-Host "STOPPING: Stopping process..." -ForegroundColor Yellow
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                Write-Host "SUCCESS: Process stopped" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "CLEAR: No processes found running on port $port" -ForegroundColor Green
    }
}

# 4. Clean up Docker system resources (optional but helpful)
Write-Host "CLEANING: Removing unused Docker resources..." -ForegroundColor Cyan
docker system prune -f

Write-Host "COMPLETE: All Docker containers and related processes have been stopped." -ForegroundColor Green 