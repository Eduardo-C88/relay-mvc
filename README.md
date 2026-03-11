
# 🚀 Relay-MVC Microservices Project

A microservices-based application built with **Node.js**, **PostgreSQL**, and **RabbitMQ**, designed to run on both **Docker Compose** (for dev) and **Kubernetes** (for production with monitoring).

## 🛠 Prerequisites

Regardless of the deployment method, ensure you have these tools installed:

1. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (Must be running)
2. **Kubernetes Tools:** `kubectl`, `helm`, `minikube` (For Option A)
```powershell
winget install Kubernetes.kubectl
winget install Helm.Helm
winget install Kubernetes.minikube

```


3. **Hosts File Mapping:**
You **must** add this line to your hosts file to access the API locally.
* **Windows:** `C:\Windows\System32\drivers\etc\hosts`
* **Mac/Linux:** `/etc/hosts`


```text
127.0.0.1  api.relay.local

```



---

## ☸️ Option A: Kubernetes Deployment (Recommended)

This mode installs the full stack, including **Prometheus & Grafana** for monitoring, an Ingress Controller, and highly available replicas.

### 1. Automated Deployment

Open PowerShell as **Administrator** and run the helper script. It initializes Minikube, installs Helm charts, and applies all manifests.

```powershell
.\deploy.ps1

```

### 2. Accessing the Cluster

Kubernetes runs inside a virtual node. To access it from your Windows browser, you need to open two specific tunnels in **separate terminal windows**:

**Terminal 1 (API Access):**

```powershell
minikube tunnel
# Keep this window open!

```

**Terminal 2 (Monitoring Access):**

```powershell
kubectl port-forward svc/dash-grafana -n monitoring 3001:80
# Access Grafana at http://localhost:3001

```

---

## 🐳 Option B: Docker Compose (Development)

Use this for a lightweight setup without the Kubernetes overhead.

### 1. Start Services

Builds and starts all microservices, Postgres, and RabbitMQ.

```bash
docker-compose up --build

```

### 2. Cleanup

Stops containers and **removes all volumes** (wipes the database).

```bash
docker-compose down -v

```

---

## 📊 Access & Credentials

| Service | URL | Credentials |
| --- | --- | --- |
| **Relay API** | `http://api.relay.local` | N/A |
| **API Docs (Swagger)** | `http://api.relay.local/apidoc` | N/A |
| **Grafana** | `http://localhost:3001` | **User:** admin / **Pass:** (See deploy script output) |
| **RabbitMQ UI** | `http://localhost:15672` | **User:** guest / **Pass:** guest |

---

## 🧪 Test Plan

Verify the deployment is successful by running these commands in your terminal (Git Bash or PowerShell).

### 1. Check Gateway Health

```bash
curl -I http://api.relay.local/health
# Expected: HTTP/1.1 200 OK

```

### 2. Register a User

```bash
curl -X POST http://api.relay.local/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "testuser", "password": "password123", "email": "test@relay.local"}'
# Expected: {"message": "User registered successfully"}

```

### 3. Check Metrics (Prometheus)

```bash
curl http://api.relay.local/api/user/metrics | grep process_resident_memory
# Expected: process_resident_memory_bytes 104857600 (or similar number)

```

---

## 🧹 Troubleshooting & Reset

**Q: `api.relay.local` is not loading?**

* Ensure `minikube tunnel` is running in an Admin terminal.
* Ensure you added the entry to your `hosts` file.

**Q: How do I wipe everything and restart?**

```powershell
minikube delete
# Then run .\deploy.ps1 again

```