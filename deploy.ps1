# ================================

# Relay-MVC Portable Deployment

# ================================

$ErrorActionPreference = "Stop"

# ---- Colors ----

$GREEN = "Green"
$BLUE  = "Cyan"
$YELLOW = "Yellow"
$RED   = "Red"

Write-Host "`n=== Relay-MVC Kubernetes Deployment ===" -ForegroundColor $BLUE

# -------------------------------------------------

# 0. Prerequisite checks

# -------------------------------------------------

foreach ($cmd in @("kubectl", "minikube", "helm")) {
if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
Write-Host "[FATAL] '$cmd' is not installed or not in PATH." -ForegroundColor $RED
exit 1
}
}

# -------------------------------------------------

# 1. Hosts file validation (non-blocking)

# -------------------------------------------------

Write-Host "`n[1/7] Checking local domain mapping..." -ForegroundColor $YELLOW
$hostsPath = "C:\Windows\System32\drivers\etc\hosts"

if (Test-Path $hostsPath) {
if (-not (Select-String -Path $hostsPath -Pattern "api.relay.local" -Quiet)) {
Write-Host "[WARN] api.relay.local not found in hosts file." -ForegroundColor $YELLOW
Write-Host "       Add: 127.0.0.1 api.relay.local" -ForegroundColor $YELLOW
} else {
Write-Host "[OK] Hosts entry found." -ForegroundColor $GREEN
}
}

# -------------------------------------------------

# 2. Start Minikube (idempotent)

# -------------------------------------------------

Write-Host "`n[2/7] Ensuring Minikube is running..." -ForegroundColor $YELLOW
$mkStatus = minikube status --format '{{.Host}}' 2>$null

if ($mkStatus -ne "Running") {
Write-Host "Starting Minikube..." -ForegroundColor $BLUE
minikube start --driver=docker
} else {
Write-Host "[OK] Minikube already running." -ForegroundColor $GREEN
}

# -------------------------------------------------

# 3. Enable required addons

# -------------------------------------------------

Write-Host "`n[3/7] Enabling addons..." -ForegroundColor $BLUE
minikube addons enable ingress | Out-Null
minikube addons enable metrics-server | Out-Null

# -------------------------------------------------

# 4. Monitoring stack (Prometheus + Grafana)

# -------------------------------------------------

Write-Host "`n[4/7] Verifying monitoring stack..." -ForegroundColor $YELLOW

if (-not (helm list -n monitoring -q | Select-String "^dash$")) {
Write-Host "Installing Prometheus/Grafana..." -ForegroundColor $BLUE
helm repo add prometheus-community [https://prometheus-community.github.io/helm-charts](https://prometheus-community.github.io/helm-charts) | Out-Null
helm repo update | Out-Null
helm install dash prometheus-community/kube-prometheus-stack `
-n monitoring --create-namespace --wait
} else {
Write-Host "[OK] Monitoring already installed." -ForegroundColor $GREEN
}

# -------------------------------------------------

# 5. Apply application manifests

# -------------------------------------------------

Write-Host "`n[5/7] Applying Kubernetes manifests..." -ForegroundColor $BLUE
kubectl apply -f k8s/

# -------------------------------------------------

# 6. Wait for readiness

# -------------------------------------------------

Write-Host "`n[6/7] Waiting for relay namespace pods..." -ForegroundColor $YELLOW
kubectl wait --for=condition=Ready pod --all `
-n relay --timeout=90s

# -------------------------------------------------

# 7. Output credentials & next steps

# -------------------------------------------------

Write-Host "`n[7/7] Finalizing..." -ForegroundColor $BLUE

$passEncoded = kubectl get secret -n monitoring dash-grafana `
-o jsonpath="{.data.admin-password}"

$password = [Text.Encoding]::UTF8.GetString(
[Convert]::FromBase64String($passEncoded)
)

Write-Host "`n==================================================" -ForegroundColor $GREEN
Write-Host "   DEPLOYMENT COMPLETE" -ForegroundColor $GREEN
Write-Host "==================================================" -ForegroundColor $GREEN
Write-Host "API Ingress:  [http://api.relay.local](http://api.relay.local)"
Write-Host "Grafana URL:  [http://localhost:3001](http://localhost:3001)"
Write-Host "Grafana User: admin"
Write-Host "Grafana Pass: $password"
Write-Host "--------------------------------------------------"
Write-Host "NEXT STEPS:" -ForegroundColor $BLUE
Write-Host "  1) Run: minikube tunnel (admin terminal)"
Write-Host "  2) Run: kubectl port-forward svc/dash-grafana -n monitoring 3001:80"
Write-Host "=================================================="
