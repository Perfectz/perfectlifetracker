# create-test-goals.ps1
# Script to create test goals for development

$goals = @(
    @{
        title = "Run 5K Marathon"
        targetDate = "2023-12-31T00:00:00.000Z"
        notes = "Train 3 times per week"
        progress = 65
        achieved = $false
    },
    @{
        title = "Complete 30-Day Challenge"
        targetDate = "2023-06-30T00:00:00.000Z"
        notes = "Daily workout routine completed!"
        progress = 100
        achieved = $true
    },
    @{
        title = "Lose 10 pounds"
        targetDate = "2023-11-30T00:00:00.000Z"
        notes = "Focus on diet and cardio"
        progress = 40
        achieved = $false
    }
)

Write-Host "🏁 Creating test goals for development..." -ForegroundColor Cyan

foreach ($goal in $goals) {
    $goalJson = $goal | ConvertTo-Json -Compress
    Write-Host "📝 Creating goal: $($goal.title)" -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3001/api/goals" -Method Post -ContentType "application/json" -Body $goalJson
        Write-Host "  ✅ Created goal with ID: $($response.id)" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Failed to create goal: $_" -ForegroundColor Red
    }
}

Write-Host "`n🔍 Fetching all goals..." -ForegroundColor Magenta
try {
    $allGoals = Invoke-RestMethod -Uri "http://localhost:3001/api/goals" -Method Get
    Write-Host "  ✅ Found $($allGoals.items.Count) goals" -ForegroundColor Green
    
    foreach ($goal in $allGoals.items) {
        $status = if ($goal.achieved) { "✓ Achieved" } else { "⏳ In Progress" }
        Write-Host "  • $($goal.title) - $status ($($goal.progress)%)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "  ❌ Failed to fetch goals: $_" -ForegroundColor Red
}

Write-Host "`n✨ Done! You can now check the Goals feature in the UI" -ForegroundColor Green 