# PowerShell version of test-health.sh for Windows

# Check if server is running
$serverProcess = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*index*" }
if ($null -eq $serverProcess) {
    Write-Output "Starting server..."
    Set-Location -Path $PSScriptRoot
    Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Hidden
    # Wait for server to start
    Start-Sleep -Seconds 5
    Write-Output "Server started"
} else {
    Write-Output "Server is already running"
}

# Test the health endpoint
Write-Output "Testing /health endpoint..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -Method Get -ErrorAction Stop
    $statusCode = $response.StatusCode
    
    if ($statusCode -eq 200) {
        Write-Output "Health check passed: HTTP $statusCode"
        Write-Output $response.Content
        exit 0
    } else {
        Write-Output "Health check failed: HTTP $statusCode"
        exit 1
    }
} catch {
    Write-Output "Health check failed: $_"
    exit 1
} 