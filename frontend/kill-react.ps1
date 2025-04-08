# kill-react.ps1
# Script to kill any running React development servers and related processes

Write-Host "🧹 Cleaning up all React-related processes..." -ForegroundColor Cyan

# 1. Find and kill processes using port 3000 (default React port)
Write-Host "🔍 Checking for processes using port 3000..." -ForegroundColor Cyan
$processesUsingPort = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess

if ($processesUsingPort) {
    foreach ($processId in $processesUsingPort) {
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "⚠️ Found process: $($process.Name) (PID: $processId) using port 3000" -ForegroundColor Yellow
            Write-Host "🛑 Stopping process..." -ForegroundColor Yellow
            Stop-Process -Id $processId -Force
            Write-Host "✅ Process stopped successfully" -ForegroundColor Green
        }
    }
} else {
    Write-Host "✅ No processes found running on port 3000" -ForegroundColor Green
}

# 2. Find and kill any processes using port 3001 (alternative React port)
Write-Host "🔍 Checking for processes using port 3001..." -ForegroundColor Cyan
$processesUsingPort = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess

if ($processesUsingPort) {
    foreach ($processId in $processesUsingPort) {
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "⚠️ Found process: $($process.Name) (PID: $processId) using port 3001" -ForegroundColor Yellow
            Write-Host "🛑 Stopping process..." -ForegroundColor Yellow
            Stop-Process -Id $processId -Force
            Write-Host "✅ Process stopped successfully" -ForegroundColor Green
        }
    }
} else {
    Write-Host "✅ No processes found running on port 3001" -ForegroundColor Green
}

# 3. Find and kill any processes using port 3002 (another alternative React port)
Write-Host "🔍 Checking for processes using port 3002..." -ForegroundColor Cyan
$processesUsingPort = Get-NetTCPConnection -LocalPort 3002 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess

if ($processesUsingPort) {
    foreach ($processId in $processesUsingPort) {
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "⚠️ Found process: $($process.Name) (PID: $processId) using port 3002" -ForegroundColor Yellow
            Write-Host "🛑 Stopping process..." -ForegroundColor Yellow
            Stop-Process -Id $processId -Force
            Write-Host "✅ Process stopped successfully" -ForegroundColor Green
        }
    }
} else {
    Write-Host "✅ No processes found running on port 3002" -ForegroundColor Green
}

# 4. Find and kill known React-related processes
Write-Host "🔍 Checking for React-related processes..." -ForegroundColor Cyan

# Look for node processes that mention react-scripts in their command line
$reactProcesses = Get-WmiObject Win32_Process | Where-Object { 
    $_.CommandLine -like "*react-scripts*" -or 
    $_.CommandLine -like "*webpack*" -or 
    $_.CommandLine -like "*node_modules*" 
}

if ($reactProcesses) {
    foreach ($process in $reactProcesses) {
        Write-Host "⚠️ Found React-related process: $($process.ProcessName) (PID: $($process.ProcessId))" -ForegroundColor Yellow
        Write-Host "🛑 Stopping process..." -ForegroundColor Yellow
        Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Process stopped successfully" -ForegroundColor Green
    }
} else {
    Write-Host "✅ No React-related processes found" -ForegroundColor Green
}

# 5. As a last resort, kill all node processes
# You might want to customize this if you have other Node.js apps running
Write-Host "🔍 Checking for Node.js processes..." -ForegroundColor Cyan
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "⚠️ Found $($nodeProcesses.Count) Node.js processes. Stopping them..." -ForegroundColor Yellow
    $nodeProcesses | ForEach-Object { 
        Write-Host "   - PID: $($_.Id)" -ForegroundColor Yellow
        Stop-Process -Id $_.Id -Force 
    }
    Write-Host "✅ All Node.js processes stopped" -ForegroundColor Green
} else {
    Write-Host "✅ No Node.js processes found running" -ForegroundColor Green
}

# 6. Also check for stray npm processes
Write-Host "🔍 Checking for npm processes..." -ForegroundColor Cyan
$npmProcesses = Get-Process -Name "npm" -ErrorAction SilentlyContinue

if ($npmProcesses) {
    Write-Host "⚠️ Found $($npmProcesses.Count) npm processes. Stopping them..." -ForegroundColor Yellow
    $npmProcesses | ForEach-Object { 
        Write-Host "   - PID: $($_.Id)" -ForegroundColor Yellow
        Stop-Process -Id $_.Id -Force 
    }
    Write-Host "✅ All npm processes stopped" -ForegroundColor Green
} else {
    Write-Host "✅ No npm processes found running" -ForegroundColor Green
}

Write-Host "👋 All React development servers and related processes have been stopped." -ForegroundColor Cyan 