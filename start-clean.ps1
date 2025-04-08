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

# 4. Find and kill only React development server processes
Write-Host "CHECKING: Checking for React development server processes..." -ForegroundColor Cyan

# Look for node processes that are specifically running react-scripts
$reactProcesses = Get-WmiObject Win32_Process | Where-Object { 
    ($_.CommandLine -like "*react-scripts start*" -or 
     $_.CommandLine -like "*webpack-dev-server*") -and
    $_.Name -eq "node.exe"
}

if ($reactProcesses) {
    foreach ($process in $reactProcesses) {
        Write-Host "FOUND: Found React development server: (PID: $($process.ProcessId))" -ForegroundColor Yellow
        Write-Host "STOPPING: Stopping process..." -ForegroundColor Yellow
        Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
        Write-Host "SUCCESS: Process stopped successfully" -ForegroundColor Green
    }
} else {
    Write-Host "CLEAR: No React development server processes found" -ForegroundColor Green
}

# 5. Find node processes with a specific pattern for React development
Write-Host "CHECKING: Checking for additional React-related node processes..." -ForegroundColor Cyan
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowTitle -eq "" -and # No window title
    $_.WorkingSet -gt 50MB -and # Typically React dev servers use significant memory
    $_.StartTime -gt (Get-Date).AddDays(-1) # Started in the last day
}

if ($nodeProcesses) {
    Write-Host "FOUND: Found $($nodeProcesses.Count) potential React node processes. Stopping them..." -ForegroundColor Yellow
    $nodeProcesses | ForEach-Object { 
        Write-Host "   - PID: $($_.Id)" -ForegroundColor Yellow
        Stop-Process -Id $_.Id -Force 
    }
    Write-Host "SUCCESS: All potential React node processes stopped" -ForegroundColor Green
} else {
    Write-Host "CLEAR: No additional React node processes found running" -ForegroundColor Green
}

Write-Host "STARTING: Starting the application..." -ForegroundColor Cyan
npm start 