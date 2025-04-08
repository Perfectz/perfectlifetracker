# start-clean.ps1
# Script to kill any running React development servers and start a fresh instance

Write-Host "CLEANING UP: Cleaning up processes before starting the application..." -ForegroundColor Cyan

# 1. Find and kill processes using port 3000 (default React port)
Write-Host "CHECKING: Checking for processes using port 3000..." -ForegroundColor Cyan
$processesUsingPort = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess

if ($processesUsingPort) {
    foreach ($processId in $processesUsingPort) {
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "FOUND: Found process: $($process.Name) (PID: $processId) using port 3000" -ForegroundColor Yellow
            Write-Host "STOPPING: Stopping process..." -ForegroundColor Yellow
            Stop-Process -Id $processId -Force
            Write-Host "SUCCESS: Process stopped successfully" -ForegroundColor Green
        }
    }
} else {
    Write-Host "CLEAR: No processes found running on port 3000" -ForegroundColor Green
}

# 2. Find and kill any processes using port 3001 (alternative React port)
Write-Host "CHECKING: Checking for processes using port 3001..." -ForegroundColor Cyan
$processesUsingPort = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess

if ($processesUsingPort) {
    foreach ($processId in $processesUsingPort) {
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "FOUND: Found process: $($process.Name) (PID: $processId) using port 3001" -ForegroundColor Yellow
            Write-Host "STOPPING: Stopping process..." -ForegroundColor Yellow
            Stop-Process -Id $processId -Force
            Write-Host "SUCCESS: Process stopped successfully" -ForegroundColor Green
        }
    }
} else {
    Write-Host "CLEAR: No processes found running on port 3001" -ForegroundColor Green
}

# 3. Find and kill any processes using port 3002 (another alternative React port)
Write-Host "CHECKING: Checking for processes using port 3002..." -ForegroundColor Cyan
$processesUsingPort = Get-NetTCPConnection -LocalPort 3002 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess

if ($processesUsingPort) {
    foreach ($processId in $processesUsingPort) {
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "FOUND: Found process: $($process.Name) (PID: $processId) using port 3002" -ForegroundColor Yellow
            Write-Host "STOPPING: Stopping process..." -ForegroundColor Yellow
            Stop-Process -Id $processId -Force
            Write-Host "SUCCESS: Process stopped successfully" -ForegroundColor Green
        }
    }
} else {
    Write-Host "CLEAR: No processes found running on port 3002" -ForegroundColor Green
}

# 4. Find and kill known React-related processes
Write-Host "CHECKING: Checking for React-related processes..." -ForegroundColor Cyan

# Look for node processes that mention react-scripts in their command line
$reactProcesses = Get-WmiObject Win32_Process | Where-Object { 
    $_.CommandLine -like "*react-scripts*" -or 
    $_.CommandLine -like "*webpack*" -or 
    $_.CommandLine -like "*node_modules*" 
}

if ($reactProcesses) {
    foreach ($process in $reactProcesses) {
        Write-Host "FOUND: Found React-related process: $($process.ProcessName) (PID: $($process.ProcessId))" -ForegroundColor Yellow
        Write-Host "STOPPING: Stopping process..." -ForegroundColor Yellow
        Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
        Write-Host "SUCCESS: Process stopped successfully" -ForegroundColor Green
    }
} else {
    Write-Host "CLEAR: No React-related processes found" -ForegroundColor Green
}

# 5. As a last resort, kill all node processes
# You might want to customize this if you have other Node.js apps running
Write-Host "CHECKING: Checking for Node.js processes..." -ForegroundColor Cyan
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "FOUND: Found $($nodeProcesses.Count) Node.js processes. Stopping them..." -ForegroundColor Yellow
    $nodeProcesses | ForEach-Object { 
        Write-Host "   - PID: $($_.Id)" -ForegroundColor Yellow
        Stop-Process -Id $_.Id -Force 
    }
    Write-Host "SUCCESS: All Node.js processes stopped" -ForegroundColor Green
} else {
    Write-Host "CLEAR: No Node.js processes found running" -ForegroundColor Green
}

# 6. Also check for stray npm processes
Write-Host "CHECKING: Checking for npm processes..." -ForegroundColor Cyan
$npmProcesses = Get-Process -Name "npm" -ErrorAction SilentlyContinue

if ($npmProcesses) {
    Write-Host "FOUND: Found $($npmProcesses.Count) npm processes. Stopping them..." -ForegroundColor Yellow
    $npmProcesses | ForEach-Object { 
        Write-Host "   - PID: $($_.Id)" -ForegroundColor Yellow
        Stop-Process -Id $_.Id -Force 
    }
    Write-Host "SUCCESS: All npm processes stopped" -ForegroundColor Green
} else {
    Write-Host "CLEAR: No npm processes found running" -ForegroundColor Green
}

Write-Host "STARTING: Starting the application..." -ForegroundColor Cyan
npm start 