# scripts/start-dev.ps1
# PowerShell script to set up development environment

Write-Host "=== LifeTracker Pro Development Environment Setup ===" -ForegroundColor Cyan

# Step 1: Check if Azure Cosmos DB Emulator is installed
$cosmosPath = "C:\Program Files\Azure Cosmos DB Emulator\CosmosDB.Emulator.exe"
$cosmosInstalled = Test-Path $cosmosPath

if (-not $cosmosInstalled) {
    Write-Host "Azure Cosmos DB Emulator is not installed. Installing now..." -ForegroundColor Yellow
    
    $tempFile = "$env:TEMP\CosmosDBEmulator.msi"
    Write-Host "Downloading Azure Cosmos DB Emulator..."
    Invoke-WebRequest -Uri "https://aka.ms/cosmosdb-emulator" -OutFile $tempFile
    
    Write-Host "Installing Azure Cosmos DB Emulator..."
    Start-Process -FilePath "msiexec.exe" -ArgumentList "/i", "$tempFile", "/qn" -Wait
    
    if (Test-Path $cosmosPath) {
        Write-Host "Azure Cosmos DB Emulator installed successfully." -ForegroundColor Green
    } else {
        Write-Host "Failed to install Azure Cosmos DB Emulator. Please install it manually from https://aka.ms/cosmosdb-emulator" -ForegroundColor Red
        Write-Host "Setting USE_MOCK_DATA=true to continue with mock data..." -ForegroundColor Yellow
        $env:USE_MOCK_DATA = "true"
    }
} else {
    Write-Host "Azure Cosmos DB Emulator is already installed." -ForegroundColor Green
}

# Step 2: Kill any running processes on our ports
Write-Host "Killing any processes using our ports..." -ForegroundColor Yellow
npx kill-port 3000 3001 8081 10000 10001 10002

# Step 3: Configure environment variables for development
Write-Host "Setting up environment variables..." -ForegroundColor Yellow
$env:NODE_ENV = "development"
$env:MOCK_DATA_ON_FAILURE = "true"

# Step 4: Start Azure services in the background
Write-Host "Starting Azure emulators..." -ForegroundColor Yellow

# Start Azurite Storage Emulator
Start-Process npx -ArgumentList "azurite", "--silent" -NoNewWindow -ErrorAction SilentlyContinue

# Start Cosmos DB Emulator if it exists
if (Test-Path $cosmosPath) {
    Start-Process $cosmosPath -ArgumentList "/NoFirewall", "/NoUI", "/DisableRateLimiting", "/PartitionCount=25" -WindowStyle Hidden -ErrorAction SilentlyContinue
    Write-Host "  Cosmos DB Emulator starting (this may take a moment)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5 # Give the emulator some time to start
} else {
    Write-Host "  Cosmos DB Emulator not found. Using mock data." -ForegroundColor Yellow
}

# Step 5: Start the backend server
Write-Host "Starting backend server..." -ForegroundColor Yellow
Start-Process -WorkingDirectory "./backend" -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow

# Step 6: Start the frontend
Write-Host "Starting frontend application..." -ForegroundColor Yellow
Set-Location ./frontend
npm run dev

# This script should be stopped with Ctrl+C to kill all processes 