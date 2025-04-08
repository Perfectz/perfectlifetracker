# start-clean.ps1
# Script to kill any running React development servers and start a fresh instance

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

# Alternative approach: kill all node processes (uncomment if needed)
# Write-Host "🔍 Checking for running Node.js processes..." -ForegroundColor Cyan
# $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
# if ($nodeProcesses) {
#     Write-Host "⚠️ Found running Node.js processes. Stopping them..." -ForegroundColor Yellow
#     $nodeProcesses | ForEach-Object { 
#         Write-Host "   - PID: $($_.Id)" -ForegroundColor Yellow
#         Stop-Process -Id $_.Id -Force 
#     }
#     Write-Host "✅ All Node.js processes stopped" -ForegroundColor Green
# } else {
#     Write-Host "✅ No Node.js processes found running" -ForegroundColor Green
# }

Write-Host "🚀 Starting the application..." -ForegroundColor Cyan
npm start 