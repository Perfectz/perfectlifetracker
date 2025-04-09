# Agent Cleanup Script for Azure DevOps
# Run this script directly on the agent machine with administrative privileges
# It will clean up corrupted directories in the agent workspaces

param (
    [Parameter(Mandatory=$false)]
    [string]$AgentWorkFolder = "D:\agent\vsts-agent-win-x64-4.252.0\_work"
)

Write-Host "=== Azure DevOps Agent Workspace Cleanup ===" -ForegroundColor Cyan
Write-Host "This script will clean corrupted node_modules directories in agent workspaces" -ForegroundColor Cyan
Write-Host "Agent work folder: $AgentWorkFolder" -ForegroundColor Yellow

# Function to handle directory cleanup with robust error handling
function Clean-Directory {
    param (
        [string]$Path
    )
    
    if (-not (Test-Path $Path)) {
        Write-Host "Path not found: $Path" -ForegroundColor Yellow
        return
    }
    
    Write-Host "Cleaning directory: $Path" -ForegroundColor Cyan
    
    try {
        # First try normal removal
        Remove-Item -Path $Path -Recurse -Force -ErrorAction Stop
        Write-Host "Successfully removed directory using standard method" -ForegroundColor Green
    }
    catch {
        Write-Host "Standard removal failed: $($_.Exception.Message)" -ForegroundColor Red
        
        try {
            # Try using robocopy with MIR (mirror) to an empty directory
            Write-Host "Attempting robocopy method..." -ForegroundColor Yellow
            
            # Create empty temp directory
            $emptyDir = New-Item -Path "$env:TEMP\empty_dir_$(Get-Random)" -ItemType Directory -Force
            
            # Use robocopy to purge the directory
            # /MIR = Mirror (empty to target)
            # /NFL = No File List, /NDL = No Directory List
            # /NJH = No Job Header, /NJS = No Job Summary
            # /NC = No Class, /NS = No Size
            # /MT:8 = 8 threads
            robocopy $emptyDir.FullName $Path /MIR /NFL /NDL /NJH /NJS /NC /NS /MT:8
            $robocopyExitCode = $LASTEXITCODE
            
            # Remove empty directory
            Remove-Item -Path $emptyDir.FullName -Force -ErrorAction SilentlyContinue
            
            # Robocopy success codes are 0-7, anything else is an error
            if ($robocopyExitCode -lt 8) {
                Write-Host "Successfully removed directory using robocopy method" -ForegroundColor Green
            }
            else {
                Write-Host "Robocopy failed with exit code: $robocopyExitCode" -ForegroundColor Red
                throw "Robocopy cleanup failed"
            }
        }
        catch {
            Write-Host "Robocopy method failed: $($_.Exception.Message)" -ForegroundColor Red
            
            try {
                # Last resort - try using cmd.exe rd command
                Write-Host "Attempting command prompt RD method..." -ForegroundColor Yellow
                cmd /c "rd /s /q `"$Path`""
                
                if (-not (Test-Path $Path)) {
                    Write-Host "Successfully removed directory using RD command" -ForegroundColor Green
                }
                else {
                    Write-Host "RD command method failed" -ForegroundColor Red
                    Write-Host "!! The directory may be locked by another process !!" -ForegroundColor Red
                    Write-Host "Recommendation: Restart the agent service or reboot the machine" -ForegroundColor Red
                }
            }
            catch {
                Write-Host "All cleanup methods failed. Manual intervention required." -ForegroundColor Red
            }
        }
    }
}

# Find all node_modules directories in the work folder
Write-Host "`nSearching for node_modules directories..." -ForegroundColor Cyan

try {
    $nodeModulesDirs = Get-ChildItem -Path $AgentWorkFolder -Filter "node_modules" -Directory -Recurse -ErrorAction Continue -ErrorVariable dirErrors
    
    if ($nodeModulesDirs.Count -eq 0) {
        Write-Host "No node_modules directories found" -ForegroundColor Yellow
    }
    else {
        Write-Host "Found $($nodeModulesDirs.Count) node_modules directories" -ForegroundColor Yellow
        
        foreach ($dir in $nodeModulesDirs) {
            Clean-Directory -Path $dir.FullName
        }
    }
    
    # Report any errors encountered during directory enumeration
    if ($dirErrors) {
        Write-Host "`nWARNING: Some directories could not be accessed:" -ForegroundColor Red
        foreach ($err in $dirErrors) {
            Write-Host "- $($err.TargetObject): $($err.CategoryInfo.Reason)" -ForegroundColor Red
            
            # If error is about a corrupted directory, try to clean parent directory
            if ($err.Exception -is [System.IO.IOException] -and $err.Exception.Message -like "*corrupted*") {
                $corruptPath = $err.TargetObject
                $parentDir = Split-Path -Parent $corruptPath
                
                Write-Host "Attempting to clean parent directory of corrupted path: $parentDir" -ForegroundColor Yellow
                Clean-Directory -Path $parentDir
            }
        }
    }
    
    # Special handling for the specific directory that failed in the error log
    $specificCorruptDir = "D:\agent\vsts-agent-win-x64-4.252.0\_work\1\s\frontend\node_modules"
    if (Test-Path (Split-Path -Parent $specificCorruptDir)) {
        Write-Host "`nAttempting to clean the specific problematic directory:" -ForegroundColor Cyan
        Write-Host $specificCorruptDir -ForegroundColor Yellow
        Clean-Directory -Path $specificCorruptDir
    }
    
    # Clean the entire source directory if needed
    $sourceDir = "D:\agent\vsts-agent-win-x64-4.252.0\_work\1\s"
    if (Test-Path $sourceDir) {
        Write-Host "`nDo you want to clean the entire source directory? This will remove ALL source files." -ForegroundColor Yellow
        Write-Host "Directory: $sourceDir" -ForegroundColor Yellow
        $confirmation = Read-Host "Type 'yes' to confirm"
        
        if ($confirmation -eq "yes") {
            Write-Host "Cleaning entire source directory..." -ForegroundColor Cyan
            Clean-Directory -Path $sourceDir
            Write-Host "Source directory cleaned" -ForegroundColor Green
        }
        else {
            Write-Host "Source directory cleanup skipped" -ForegroundColor Yellow
        }
    }
}
catch {
    Write-Host "Error searching for node_modules directories: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nCleanup process completed" -ForegroundColor Green
Write-Host "Please restart the Azure DevOps agent service after running this script" -ForegroundColor Cyan
Write-Host "Run 'net stop vstsagent.Perfectz.Default' and then 'net start vstsagent.Perfectz.Default'" -ForegroundColor Cyan 