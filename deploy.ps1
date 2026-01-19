# Set error action to stop on PowerShell errors
$ErrorActionPreference = "Stop"

# Define colors
$GREEN = "Green"
$BLUE = "Cyan"
$YELLOW = "Yellow"

Write-Host "--- Starting Relay-MVC Deployment ---" -ForegroundColor $BLUE

# 1. Start Minikube if not running
Write-Host "Checking Minikube status..." -ForegroundColor $YELLOW
try {
    # Using --format to get a simple string back
    $minikubeStatus = minikube status --format '{{.Host}}'
} catch {
    $minikubeStatus = "Stopped"
}

if ($minikubeStatus -ne "Running") {
    Write-Host "Starting Minikube..." -ForegroundColor $BLUE
    minikube start --driver=docker
}

# 2. Enable Addons
Write-Host "Enabling Ingress and Metrics Server..." -ForegroundColor $BLUE
minikube addons enable ingress
minikube addons enable metrics-server

# 3. Check for Helm (Using your specific Winget path)
if (!(Get-Command helm -ErrorAction SilentlyContinue)) {
    Write-Host "Helm not found in Path. Attempting to use Winget Links path..." -ForegroundColor $YELLOW
    $wingetPath = "$env:LocalAppData\Microsoft\WinGet\Links"
    if (Test-Path "$wingetPath\helm.exe") {
        $env:Path += ";$wingetPath"
        Write-Host "Successfully linked Helm from Winget folder." -ForegroundColor $GREEN
    } else {
        Write-Host "ERROR: Helm not found. Please run 'winget install Helm.Helm' again." -ForegroundColor Red
        return
    }
}

# 4. Install Monitoring (Prometheus/Grafana)
Write-Host "Checking for Monitoring Stack..." -ForegroundColor $YELLOW
# We use the full name helm.exe to be explicit
$monitoringInstalled = helm.exe list -n monitoring -q | Select-String "dash"

if (-not $monitoringInstalled) {
    Write-Host "Installing Monitoring Stack (this will take 1-2 minutes)..." -ForegroundColor $BLUE
    helm.exe repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm.exe repo update
    helm.exe install dash prometheus-community/kube-prometheus-stack -n monitoring --create-namespace --wait
} else {
    Write-Host "Monitoring stack already exists." -ForegroundColor $GREEN
}

# 5. Apply All Kubernetes Manifests
Write-Host "Applying Kubernetes Manifests from k8s/ folder..." -ForegroundColor $BLUE
kubectl apply -f k8s/

# 6. Post-Deployment Info Retrieval
Write-Host "`n--- ACCESS INFORMATION ---" -ForegroundColor $BLUE
try {
    $passEncoded = kubectl get secret --namespace monitoring dash-grafana -o jsonpath="{.data.admin-password}"
    $password = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($passEncoded))

    Write-Host "--------------------------------------------------"
    Write-Host "Grafana URL:      http://localhost:3001" -ForegroundColor $GREEN
    Write-Host "Username:         admin" -ForegroundColor $GREEN
    Write-Host "Password:         $password" -ForegroundColor $GREEN
    Write-Host "--------------------------------------------------"
    Write-Host "`nTo access Grafana, run: kubectl port-forward svc/dash-grafana -n monitoring 3001:80" -ForegroundColor $CYAN
} catch {
    Write-Host "Could not retrieve Grafana password yet. Wait a moment for the pods to initialize." -ForegroundColor $YELLOW
}

Write-Host "`nSUCCESS: System deployment complete." -ForegroundColor $GREEN