# ======================================

# Relay-MVC Load Generator (HPA Friendly)

# ======================================

param (
[string]$Url = "[http://api.relay.local/api/users/stress](http://api.relay.local/api/users/stress)",
[int]$Workers = 5,
[int]$DurationSeconds = 120
)

$ErrorActionPreference = "SilentlyContinue"

$GREEN = "Green"
$CYAN = "Cyan"
$YELLOW = "Yellow"
$RED = "Red"

Write-Host "`n=== Load Test Starting ===" -ForegroundColor $CYAN
Write-Host "Target URL: $Url" -ForegroundColor $YELLOW
Write-Host "Workers:    $Workers" -ForegroundColor $YELLOW
Write-Host "Duration:   $DurationSeconds sec`n" -ForegroundColor $YELLOW

# Cleanup any existing jobs

Get-Job | Remove-Job -Force

# Async, non-blocking worker

$ScriptBlock = {
param($TargetUrl)
$client = New-Object System.Net.Http.HttpClient
while ($true) {
try {
$null = $client.GetAsync($TargetUrl)
} catch {}
Start-Sleep -Milliseconds 50
}
}

# Launch workers

Write-Host "Launching workers..." -ForegroundColor $CYAN
1..$Workers | ForEach-Object {
Start-Job -ScriptBlock $ScriptBlock -ArgumentList $Url | Out-Null
Write-Host "." -NoNewline -ForegroundColor $GREEN
}
Write-Host "`nLoad active." -ForegroundColor $GREEN

# Monitor loop

$endTime = (Get-Date).AddSeconds($DurationSeconds)

while ((Get-Date) -lt $endTime) {
Clear-Host
Write-Host "=== LOAD TEST RUNNING ===" -ForegroundColor $GREEN
Write-Host "Time Remaining: $([int]($endTime - (Get-Date)).TotalSeconds)s" -ForegroundColor $YELLOW

```
Write-Host "`nHPA Status:" -ForegroundColor $CYAN
kubectl get hpa -n relay

Write-Host "`nPod CPU:" -ForegroundColor $CYAN
kubectl top pods -n relay | Select-String "service"

Start-Sleep -Seconds 5
```

}

# Cleanup

Write-Host "`nStopping workers..." -ForegroundColor $RED
Get-Job | Stop-Job | Remove-Job -Force

Write-Host "Load test complete." -ForegroundColor $GREEN
