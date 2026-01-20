# Load Test Script for Relay-MVC
# This script launches parallel background jobs to generate high traffic.

param (
    [string]$Url = "http://api.relay.local/api/users/stress", # Target URL for load test
    [int]$Threads = 5,       # Number of concurrent "users"
    [int]$DurationSeconds = 60 # How long to run the test
)

$ErrorActionPreference = "SilentlyContinue"
$Green = "Green"; $Cyan = "Cyan"; $Yellow = "Yellow"; $Red = "Red"

Write-Host "--- Starting Load Test ---" -ForegroundColor $Cyan
Write-Host "Target:  $Url" -ForegroundColor $Yellow
Write-Host "Threads: $Threads" -ForegroundColor $Yellow
Write-Host "Time:    $DurationSeconds seconds" -ForegroundColor $Yellow

# 1. Cleanup any old jobs
Get-Job | Remove-Job -Force

# 2. Define the attack block
$ScriptBlock = {
    param($TargetUrl)
    $client = New-Object System.Net.Http.HttpClient
    while ($true) {
        try {
            $task = $client.GetAsync($TargetUrl)
            $task.Wait() # Force high-speed synchronous load
        } catch {
            # Ignore errors (common during high load)
        }
    }
}

# 3. Launch the fleet
Write-Host "`nLaunching $Threads parallel workers..." -ForegroundColor $Cyan
for ($i = 0; $i -lt $Threads; $i++) {
    Start-Job -ScriptBlock $ScriptBlock -ArgumentList $Url | Out-Null
    Write-Host "." -NoNewline -ForegroundColor $Green
}

Write-Host "`nLoad generation active!" -ForegroundColor $Green
Write-Host "Monitoring HPA status for $DurationSeconds seconds..." -ForegroundColor $Cyan

# 4. Monitor loop
$endTime = (Get-Date).AddSeconds($DurationSeconds)
while ((Get-Date) -lt $endTime) {
    Clear-Host
    Write-Host "--- LOAD TEST RUNNING ($Threads Threads) ---" -ForegroundColor $Green
    Write-Host "Time Remaining: $(($endTime - (Get-Date)).Seconds) seconds" -ForegroundColor $Yellow
    Write-Host "`nCurrent HPA Status (Scaling):" -ForegroundColor $Cyan
    
    # Show live scaling status from Kubernetes
    kubectl get hpa -n relay
    
    Start-Sleep -Seconds 5
}

# 5. Cleanup
Write-Host "`nStopping all workers..." -ForegroundColor $Red
Get-Job | Stop-Job | Remove-Job -Force
Write-Host "Test Complete." -ForegroundColor $Green