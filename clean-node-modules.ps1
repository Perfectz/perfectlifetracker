# PowerShell script to clean corrupted node_modules directories
# Usage: .\clean-node-modules.ps1 [path-to-project]

param (
    [string]$projectPath = "."
)

Write-Host "Clean Node Modules Script" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""

# Convert relative path to absolute path
$projectPath = Resolve-Path $projectPath
Write-Host "Project path: $projectPath" -ForegroundColor Cyan

# Function to clean node_modules directory
function Clean-NodeModules {
    param (
        [string]$path
    )
    
    $nodeModulesPath = Join-Path -Path $path -ChildPath "node_modules"
    
    if (Test-Path $nodeModulesPath) {
        Write-Host "Cleaning node_modules at: $nodeModulesPath" -ForegroundColor Yellow
        
        try {
            # Try normal deletion first
            Write-Host "Attempting standard deletion..." -ForegroundColor Gray
            Remove-Item -Path $nodeModulesPath -Force -Recurse -ErrorAction Stop
            Write-Host "Successfully deleted node_modules directory!" -ForegroundColor Green
        }
        catch {
            Write-Host "Standard deletion failed: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Attempting force clean with robocopy..." -ForegroundColor Yellow
            
            # Create an empty directory to use with robocopy
            $emptyDirPath = Join-Path -Path $path -ChildPath "empty_temp_dir"
            $emptyDir = New-Item -Path $emptyDirPath -ItemType Directory -Force
            
            # Use robocopy to purge the directory (MIR = mirror empty directory)
            # /NFL = No File List, /NDL = No Directory List
            # /NJH = No Job Header, /NJS = No Job Summary
            # /NC = No Class, /NS = No Size
            # /MT:8 = 8 threads
            Write-Host "Running robocopy..." -ForegroundColor Gray
            robocopy $emptyDir.FullName $nodeModulesPath /MIR /NFL /NDL /NJH /NJS /NC /NS /MT:8
            
            # Remove the empty directory
            Remove-Item -Path $emptyDir.FullName -Force -Recurse
            
            Write-Host "Force clean completed" -ForegroundColor Green
            
            # Verify the directory is now gone or empty
            if (-not (Test-Path $nodeModulesPath) -or -not (Get-ChildItem -Path $nodeModulesPath -Force)) {
                Write-Host "Directory is now clean" -ForegroundColor Green
            }
            else {
                Write-Host "WARNING: Directory may still contain files" -ForegroundColor Red
                Write-Host "You may need to restart your computer and try again" -ForegroundColor Red
            }
        }
    }
    else {
        Write-Host "No node_modules directory found at: $nodeModulesPath" -ForegroundColor Cyan
    }
}

# Check for frontend directory
$frontendPath = Join-Path -Path $projectPath -ChildPath "frontend"
if (Test-Path $frontendPath) {
    Write-Host "`nProcessing frontend directory..." -ForegroundColor Cyan
    Clean-NodeModules -path $frontendPath
}
else {
    Write-Host "`nNo frontend directory found." -ForegroundColor Yellow
}

# Check for backend directory
$backendPath = Join-Path -Path $projectPath -ChildPath "backend"
if (Test-Path $backendPath) {
    Write-Host "`nProcessing backend directory..." -ForegroundColor Cyan
    Clean-NodeModules -path $backendPath
}
else {
    Write-Host "`nNo backend directory found." -ForegroundColor Yellow
}

# Check if the main directory has node_modules (in case it's a monorepo)
$nodeModulesMain = Join-Path -Path $projectPath -ChildPath "node_modules"
if (Test-Path $nodeModulesMain) {
    Write-Host "`nProcessing main project directory..." -ForegroundColor Cyan
    Clean-NodeModules -path $projectPath
}

Write-Host "`nCleanup process completed!" -ForegroundColor Green
Write-Host "You can now run 'npm install' or 'npm ci' to reinstall dependencies." -ForegroundColor Cyan

# Find the exact agent service name (in case it's not the default name)
Get-Service | Where-Object {$_.Name -like "*vstsagent*"} | Select-Object Name, Status

# Stop the agent service (adjust the service name if needed based on the previous command)
net stop vstsagent.Perfectz.Default

# Start the agent service
net start vstsagent.Perfectz.Default 