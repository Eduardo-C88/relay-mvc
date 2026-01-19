#!/bin/bash
set -e # Exit on any error

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Updating Minikube environment...${NC}"
minikube addons enable ingress
minikube addons enable metrics-server

echo -e "${BLUE}Applying Kubernetes manifests...${NC}"
# Use the folder-based apply to respect your numbering
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-postgres-config.yaml
kubectl apply -f k8s/02-postgres-secret.yaml
kubectl apply -f k8s/03-postgres-init.yaml
kubectl apply -f k8s/04-jwt-secrets.yaml
kubectl apply -f k8s/05-postgres.yaml
kubectl apply -f k8s/06-rabbitmq.yaml

echo -e "${BLUE}Waiting for Database to stabilize...${NC}"
kubectl rollout status statefulset/postgres-cluster -n relay --timeout=90s

echo -e "${BLUE}Deploying Microservices...${NC}"
# Applying everything else in the folder
kubectl apply -f k8s/

echo -e "${GREEN}SUCCESS: All resources applied.${NC}"
echo -e "${BLUE}Final Step: Make sure 'minikube tunnel' is running in another tab!${NC}"