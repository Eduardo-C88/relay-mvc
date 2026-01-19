# Set error action to stop on PowerShell errors
$ErrorActionPreference = "Stop"

# Define colors
$GREEN = "Green"
$BLUE = "Cyan"
$YELLOW = "Yellow"
$RED = "Red"

Write-Host "--- Starting Relay-MVC Portable Deployment ---" -ForegroundColor $BLUE

# 1. PRE-FLIGHT CHECK: Hosts File
Write-Host "Checking for local domain mapping..." -ForegroundColor $YELLOW
$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
$hostsContent = Get-Content $hostsPath
if ($hostsContent -notmatch "api.relay.local") {
    Write-Host "[WARNING] 'api.relay.local' not found in your hosts file!" -ForegroundColor $RED
    Write-Host "Please add '127.0.0.1 api.relay.local' to $hostsPath" -ForegroundColor $YELLOW
    Write-Host "Continuing deployment, but Ingress will not work until this is fixed.`n"
}

# 2. Start Minikube if not running
Write-Host "Checking Minikube status..." -ForegroundColor $YELLOW
try {
    $minikubeStatus = minikube status --format '{{.Host}}'
} catch {
    $minikubeStatus = "Stopped"
}

if ($minikubeStatus -ne "Running") {
    Write-Host "Starting Minikube..." -ForegroundColor $BLUE
    minikube start --driver=docker
}

# 3. Enable Addons
Write-Host "Enabling Ingress and Metrics Server..." -ForegroundColor $BLUE
minikube addons enable ingress
minikube addons enable metrics-server

# 4. Check/Install Monitoring
if (!(Get-Command helm -ErrorAction SilentlyContinue)) {
    $wingetPath = "$env:LocalAppData\Microsoft\WinGet\Links"
    if (Test-Path "$wingetPath\helm.exe") { $env:Path += ";$wingetPath" }
}

Write-Host "Verifying Monitoring Stack..." -ForegroundColor $YELLOW
if (-not (helm list -n monitoring -q | Select-String "dash")) {
    Write-Host "Installing Prometheus/Grafana..." -ForegroundColor $BLUE
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo update
    helm install dash prometheus-community/kube-prometheus-stack -n monitoring --create-namespace --wait
}

# 5. Apply Manifests
Write-Host "Applying Kubernetes Manifests..." -ForegroundColor $BLUE
kubectl apply -f k8s/

# 6. Post-Deployment Verification
Write-Host "`n--- VERIFICATION ---" -ForegroundColor $BLUE
Write-Host "Waiting for pods to be ready (this may take 30s)..." -ForegroundColor $YELLOW
kubectl wait --for=condition=Ready pods --all -n relay --timeout=60s

# 7. Final Instructions and Secrets
$passEncoded = kubectl get secret --namespace monitoring dash-grafana -o jsonpath="{.data.admin-password}"
$password = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($passEncoded))

Write-Host "`n==================================================" -ForegroundColor $GREEN
Write-Host "  DEPLOYMENT COMPLETE" -ForegroundColor $GREEN
Write-Host "==================================================" -ForegroundColor $GREEN
Write-Host "API Ingress:     http://api.relay.local"
Write-Host "Grafana User:    admin"
Write-Host "Grafana Pass:    $password"
Write-Host "--------------------------------------------------"
Write-Host "REQUIRED ACTION 1: Run 'minikube tunnel' in an Admin terminal." -ForegroundColor $CYAN
Write-Host "REQUIRED ACTION 2: Run 'kubectl port-forward svc/dash-grafana -n monitoring 3001:80' to see metrics." -ForegroundColor $CYAN