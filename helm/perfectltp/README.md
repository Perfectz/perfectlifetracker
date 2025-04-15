# Perfect LifeTracker Pro Helm Chart

This Helm chart deploys the Perfect LifeTracker Pro application to a Kubernetes cluster.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.2.0+
- An Azure Kubernetes Service cluster with:
  - Ingress controller (preferably Azure Application Gateway Ingress Controller)
  - cert-manager (optional, for TLS certificates)

## Installation

### Using Helm

```bash
# Add the repository (if hosted in a repository)
# helm repo add perfectltp https://your-helm-repo.example.com
# helm repo update

# Install the chart
helm install perfectltp ./perfectltp \
  --namespace perfectltp \
  --create-namespace \
  --set global.domain=your-domain.example.com
```

### Using the Deployment Script

For convenience, deployment scripts are provided in the parent directory:

#### Bash (Linux/macOS)

```bash
# Make the script executable
chmod +x deploy.sh

# Run with default settings
./deploy.sh

# Run with custom settings
./deploy.sh --namespace myapp --domain myapp.example.com --env staging --tag v1.0.0
```

#### PowerShell (Windows)

```powershell
# Run with default settings
.\deploy.ps1

# Run with custom settings
.\deploy.ps1 -Namespace myapp -Domain myapp.example.com -Environment staging -ImageTag v1.0.0
```

## Configuration

The following table lists the configurable parameters of the Perfect LifeTracker Pro chart and their default values.

| Parameter                         | Description                                        | Default                     |
|-----------------------------------|----------------------------------------------------|----------------------------- |
| `global.environment`              | Environment (production, staging, dev)             | `production`                |
| `global.domain`                   | Domain name for the application                    | `perfectltp.example.com`    |
| `image.registry`                  | Container registry                                 | `perfectltp.azurecr.io`     |
| `image.pullPolicy`                | Image pull policy                                  | `Always`                    |
| `image.tag`                       | Image tag                                          | `latest`                    |
| `image.pullSecrets`               | Array of image pull secrets                        | `[]`                        |
| `frontend.replicaCount`           | Number of frontend replicas                        | `2`                         |
| `frontend.resources.requests.cpu` | CPU request for frontend                           | `100m`                      |
| `frontend.resources.requests.memory` | Memory request for frontend                      | `128Mi`                     |
| `frontend.resources.limits.cpu`   | CPU limit for frontend                             | `300m`                      |
| `frontend.resources.limits.memory` | Memory limit for frontend                          | `256Mi`                     |
| `backend.replicaCount`            | Number of backend replicas                         | `3`                         |
| `backend.resources.requests.cpu`  | CPU request for backend                            | `200m`                      |
| `backend.resources.requests.memory` | Memory request for backend                        | `256Mi`                     |
| `backend.resources.limits.cpu`    | CPU limit for backend                              | `500m`                      |
| `backend.resources.limits.memory` | Memory limit for backend                           | `512Mi`                     |
| `ingress.enabled`                 | Enable ingress                                     | `true`                      |
| `ingress.className`               | Ingress class name                                 | `azure-application-gateway` |

## TLS Configuration

The chart supports TLS certificate configuration through the `ingress.tls` parameter. By default, it is configured to use cert-manager with the `letsencrypt-prod` issuer.

To configure your own TLS certificates:

```yaml
ingress:
  tls:
    - secretName: my-tls-secret
      hosts:
        - mydomain.example.com
```

## Autoscaling

Both frontend and backend components are configured with Horizontal Pod Autoscaling (HPA) based on CPU and memory utilization. You can adjust the settings in the `values.yaml` file:

```yaml
frontend:
  autoscaling:
    enabled: true
    minReplicas: 2
    maxReplicas: 5
    targetCPUUtilizationPercentage: 70
    targetMemoryUtilizationPercentage: 80

backend:
  autoscaling:
    enabled: true
    minReplicas: 3
    maxReplicas: 8
    targetCPUUtilizationPercentage: 70
    targetMemoryUtilizationPercentage: 80
```

## Customizing Configuration

To override the default configuration values, you can create a custom values file:

```yaml
# custom-values.yaml
global:
  domain: myapp.example.com
  environment: staging

frontend:
  replicaCount: 3
  resources:
    limits:
      cpu: 500m
      memory: 512Mi

config:
  frontend:
    VITE_API_URL: "https://myapp.example.com/api"
```

Then install or upgrade with:

```bash
helm install perfectltp ./perfectltp -f custom-values.yaml
# or
helm upgrade perfectltp ./perfectltp -f custom-values.yaml
```

## Troubleshooting

If you encounter issues with the deployment, check the following:

1. Verify the pods are running:
   ```bash
   kubectl get pods -n <namespace>
   ```

2. Check pod logs:
   ```bash
   kubectl logs -f <pod-name> -n <namespace>
   ```

3. Check the Helm release status:
   ```bash
   helm status perfectltp -n <namespace>
   ```

4. Check ingress configuration:
   ```bash
   kubectl get ingress -n <namespace>
   ```

5. Verify TLS secrets:
   ```bash
   kubectl get secrets -n <namespace>
   ```

For detailed deployment history:
```bash
helm history perfectltp -n <namespace>
```

## Uninstalling the Chart

To uninstall/delete the deployment:

```bash
helm uninstall perfectltp -n <namespace>
``` 