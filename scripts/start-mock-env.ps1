# PowerShell script to start the application in mock mode
# This allows testing journal features without requiring Azure emulators

Write-Host "Starting LifeTracker Pro in mock mode..." -ForegroundColor Cyan

# Kill any potentially conflicting processes
Write-Host "Killing any processes using required ports..." -ForegroundColor Yellow
npx kill-port 3000 3001 4000 8081 10000 10001 10002

# Start backend with mock data
Write-Host "Starting backend with mock data..." -ForegroundColor Green
Start-Process -NoNewWindow powershell -ArgumentList "cd $PSScriptRoot\..\backend; npm run dev:mock"

# Give the backend time to start
Start-Sleep -Seconds 5

# Start frontend
Write-Host "Starting frontend..." -ForegroundColor Magenta
Start-Process -NoNewWindow powershell -ArgumentList "cd $PSScriptRoot\..\frontend; npm start"

Write-Host "LifeTracker Pro started in mock mode" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Red

# Keep the script running so it can be stopped with Ctrl+C
try {
    while($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    # Clean up when Ctrl+C is pressed
    Write-Host "Stopping all services..." -ForegroundColor Yellow
    npx kill-port 3000 3001 4000 8081 10000 10001 10002
    Write-Host "All services stopped" -ForegroundColor Green
} 