# kill-react.ps1
# Script to kill any running React development servers

Write-Host "🔍 Checking for running React development servers..." -ForegroundColor Cyan

# Find processes using port 3000 (default React port)
$processesUsingPort = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess

if ($processesUsingPort) {
    foreach ($processId in $processesUsingPort) {
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "⚠️ Found running process: $($process.Name) (PID: $processId) using port 3000" -ForegroundColor Yellow
            Write-Host "🛑 Stopping process..." -ForegroundColor Yellow
            Stop-Process -Id $processId -Force
            Write-Host "✅ Process stopped successfully" -ForegroundColor Green
        }
    }
} else {
    Write-Host "✅ No processes found running on port 3000" -ForegroundColor Green
}

Write-Host "👋 All React development servers have been stopped." -ForegroundColor Cyan 