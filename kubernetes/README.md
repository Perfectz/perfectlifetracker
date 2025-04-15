# Perfect LifeTracker Pro - Kubernetes Deployment

This directory contains Kubernetes manifests to deploy the Perfect LifeTracker Pro application on a Kubernetes cluster.

## Prerequisites

- Kubernetes cluster (v1.22+)
- kubectl CLI tool configured to access your cluster
- Azure Kubernetes Service (AKS) with Azure Application Gateway Ingress Controller (AGIC) if deploying to Azure
- Container registry with your application images

## Directory Structure

```
kubernetes/
├── README.md                  # This file
├── kustomization.yaml        # Kustomize configuration
├── configurations.yaml       # Kustomize behavior configuration
├── ingress.yaml              # Ingress controller for external access
├── config/
│   ├── configmap.yaml        # Application configuration
│   └── secrets.yaml          # Sensitive data (replace with actual values)
├── frontend/
│   ├── deployment.yaml       # Frontend application deployment
│   ├── service.yaml          # Frontend service
│   └── hpa.yaml              # Horizontal Pod Autoscaler for frontend
└── backend/
    ├── deployment.yaml       # Backend application deployment
    ├── service.yaml          # Backend service
    ├── hpa.yaml              # Horizontal Pod Autoscaler for backend
    └── pdb.yaml              # Pod Disruption Budget for high availability
```

## Configuration

Before deploying, you need to:

1. Update the image references in deployment files with your actual container registry and image tags
2. Update the `configmap.yaml` with appropriate environment variables
3. Replace placeholder values in `secrets.yaml` with actual credentials (preferably using a Secret management solution like Azure Key Vault)
4. Update the domain name in `ingress.yaml` to your actual domain

## Deployment Instructions

### 1. Deploy using Kustomize

```bash
# Apply all resources using kustomize
kubectl apply -k ./

# Or apply individual components
kubectl apply -f config/
kubectl apply -f backend/
kubectl apply -f frontend/
kubectl apply -f ingress.yaml
```

### 2. Verify deployment

```bash
# Check if pods are running
kubectl get pods

# Check services
kubectl get svc

# Check ingress
kubectl get ingress
```

### 3. Scale application (if needed)

```bash
# Scale backend manually (if needed)
kubectl scale deployment backend --replicas=5

# Scale frontend manually (if needed)
kubectl scale deployment frontend --replicas=4
```

## High Availability and Scaling

- Both frontend and backend deployments are configured with Horizontal Pod Autoscalers (HPA) that will automatically scale based on CPU and memory utilization
- Backend uses Pod Disruption Budget (PDB) to ensure high availability during voluntary disruptions
- Pod anti-affinity rules are used to spread backend replicas across nodes

## Production Considerations

1. **Secrets Management**: Use Azure Key Vault with CSI Driver instead of Kubernetes Secrets
2. **Network Policies**: Implement network policies to restrict pod-to-pod communication
3. **Resource Quotas**: Set up namespace resource quotas to limit resource consumption
4. **Monitoring**: Configure Azure Monitor for containers and application insights
5. **Logging**: Set up centralized logging with Azure Log Analytics
6. **CI/CD**: Use Azure DevOps or GitHub Actions for automated deployments

## Troubleshooting

If you encounter issues:

1. Check pod status: `kubectl describe pod <pod-name>`
2. Check logs: `kubectl logs <pod-name>`
3. Check events: `kubectl get events --sort-by='.lastTimestamp'` 