# test-api.ps1
# Script to test the API endpoints

Write-Host "🔍 Testing backend API..." -ForegroundColor Cyan

# Test health endpoint
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method Get
    Write-Host "✅ Health API working: $($healthResponse.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health API failed: $_" -ForegroundColor Red
}

# Create a test goal
try {
    $goal = @{
        title = "Run 5K Marathon"
        targetDate = "2023-12-31T00:00:00.000Z"
        notes = "Training 3 times per week"
        progress = 65
        achieved = $false
    } | ConvertTo-Json

    $createResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/goals" -Method Post -ContentType "application/json" -Body $goal
    Write-Host "✅ Created goal with ID: $($createResponse.id)" -ForegroundColor Green
} catch {
    Write-Host "❌ Goal creation failed: $_" -ForegroundColor Red
}

# Get all goals
try {
    $goals = Invoke-RestMethod -Uri "http://localhost:3001/api/goals" -Method Get
    Write-Host "✅ Found $($goals.items.Count) goals" -ForegroundColor Green
    
    foreach ($goal in $goals.items) {
        Write-Host "  • $($goal.title) - Progress: $($goal.progress)%" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Goal retrieval failed: $_" -ForegroundColor Red
}

Write-Host "`n🌐 The frontend is using mock data and should work independently of the backend status" -ForegroundColor Yellow
Write-Host "Visit http://localhost:3000/goals to see the Goals feature" -ForegroundColor Magenta 