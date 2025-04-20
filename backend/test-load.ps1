# PowerShell load test script

$concurrentRequests = 10
$totalRequests = 100
$endpoint = "http://localhost:4000/health"

Write-Output "Starting load test on $endpoint"
Write-Output "Concurrent requests: $concurrentRequests"
Write-Output "Total requests: $totalRequests"

$successCount = 0
$failCount = 0
$totalTime = 0
$times = @()

$jobs = @()

for ($i = 0; $i -lt $totalRequests; $i += $concurrentRequests) {
    $batchJobs = @()
    $remaining = [Math]::Min($concurrentRequests, $totalRequests - $i)
    
    for ($j = 0; $j -lt $remaining; $j++) {
        $batchJobs += Start-Job -ScriptBlock {
            $start = Get-Date
            try {
                $response = Invoke-WebRequest -Uri $using:endpoint -Method Get -ErrorAction Stop
                $end = Get-Date
                $duration = ($end - $start).TotalMilliseconds
                
                if ($response.StatusCode -eq 200) {
                    return @{
                        Success = $true
                        Time = $duration
                        StatusCode = $response.StatusCode
                    }
                } else {
                    return @{
                        Success = $false
                        Time = $duration
                        StatusCode = $response.StatusCode
                    }
                }
            } catch {
                $end = Get-Date
                $duration = ($end - $start).TotalMilliseconds
                return @{
                    Success = $false
                    Time = $duration
                    Error = $_.Exception.Message
                }
            }
        }
    }
    
    foreach ($job in $batchJobs) {
        $result = Receive-Job -Job $job -Wait
        Remove-Job -Job $job
        
        if ($result.Success) {
            $successCount++
            $totalTime += $result.Time
            $times += $result.Time
        } else {
            $failCount++
            Write-Output "Request failed: $($result.Error)"
        }
    }
    
    Write-Progress -Activity "Load Testing" -Status "Progress" -PercentComplete (($i + $remaining) / $totalRequests * 100)
}

$avgTime = if ($successCount -gt 0) { $totalTime / $successCount } else { 0 }
$minTime = if ($times.Count -gt 0) { ($times | Measure-Object -Minimum).Minimum } else { 0 }
$maxTime = if ($times.Count -gt 0) { ($times | Measure-Object -Maximum).Maximum } else { 0 }

Write-Output "Load test completed"
Write-Output "Success: $successCount"
Write-Output "Failed: $failCount"
Write-Output "Success rate: $(($successCount / $totalRequests) * 100)%"
Write-Output "Average response time: $avgTime ms"
Write-Output "Min response time: $minTime ms"
Write-Output "Max response time: $maxTime ms" 