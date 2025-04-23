# start-dev-environment.ps1
# Script to start all development services for LifeTracker Pro

Write-Host "🚀 Starting development environment for LifeTracker Pro..." -ForegroundColor Cyan

# Step 1: Start Azurite (Azure Storage Emulator)
Write-Host "📦 Starting Azurite storage emulator..." -ForegroundColor Yellow
$azuriteJob = Start-Job -ScriptBlock { npx azurite --silent }

# Step 2: Start Cosmos DB Emulator
Write-Host "🪐 Starting Cosmos DB emulator..." -ForegroundColor Green
try {
    Start-Process -FilePath "C:\Program Files\Azure Cosmos DB Emulator\CosmosDB.Emulator.exe" -WindowStyle Minimized
    Write-Host "  ✅ Cosmos DB emulator starting..." -ForegroundColor Green
} catch {
    Write-Host "  ❌ Failed to start Cosmos DB emulator: $_" -ForegroundColor Red
    Write-Host "  ℹ️ Make sure it's installed at C:\Program Files\Azure Cosmos DB Emulator\" -ForegroundColor Yellow
}

# Step 3: Wait for services to initialize
Write-Host "⏳ Waiting for services to initialize (10 seconds)..." -ForegroundColor Magenta
Start-Sleep -Seconds 10

# Step 4: Start backend server
Write-Host "🔧 Starting backend server..." -ForegroundColor Blue
$backendJob = Start-Job -ScriptBlock {
    Set-Location -Path "$PWD\backend"
    npm start
}

# Step 5: Start frontend server
Write-Host "🎨 Starting frontend server..." -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    Set-Location -Path "$PWD\frontend"
    npm start
}

# Display information
Write-Host "`n✨ Development environment is starting!" -ForegroundColor Green
Write-Host "📝 Services information:" -ForegroundColor White
Write-Host "  • Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  • Backend: http://localhost:3001" -ForegroundColor Blue
Write-Host "  • Cosmos DB Emulator: https://localhost:8081/_explorer/index.html" -ForegroundColor Green
Write-Host "  • Azurite Storage: http://localhost:10000" -ForegroundColor Yellow
Write-Host "`n🔍 To view logs:" -ForegroundColor Magenta
Write-Host "  • Frontend: Receive-Job $($frontendJob.Id)" -ForegroundColor Cyan
Write-Host "  • Backend: Receive-Job $($backendJob.Id)" -ForegroundColor Blue
Write-Host "  • Azurite: Receive-Job $($azuriteJob.Id)" -ForegroundColor Yellow
Write-Host "`n❌ To stop all services, press Ctrl+C and run:" -ForegroundColor Red
Write-Host "  Stop-Job $($frontendJob.Id), $($backendJob.Id), $($azuriteJob.Id)" -ForegroundColor White

# Keep the script running to maintain the jobs
try {
    Write-Host "`n⚠️ Keep this window open. Press Ctrl+C to exit..." -ForegroundColor Yellow
    Wait-Job -Job $frontendJob, $backendJob, $azuriteJob
} finally {
    # Clean up jobs if the script is interrupted
    Write-Host "`n🛑 Stopping all services..." -ForegroundColor Red
    Stop-Job -Job $frontendJob, $backendJob, $azuriteJob
    Remove-Job -Job $frontendJob, $backendJob, $azuriteJob -Force
} 