# PerfectLTP Kubernetes Deployment Script (PowerShell)
param (
    [string]$Namespace = "perfectltp",
    [string]$ReleaseName = "perfectltp",
    [string]$ChartPath = "./perfectltp",
    [string]$Environment = "production",
    [string]$Domain = "perfectltp.example.com",
    [string]$ImageTag = "latest",
    [switch]$Help
)

# Show help info if requested
if ($Help) {
    Write-Host "Usage: .\deploy.ps1 [options]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Namespace NAME    Kubernetes namespace (default: perfectltp)"
    Write-Host "  -ReleaseName NAME  Helm release name (default: perfectltp)"
    Write-Host "  -ChartPath PATH    Path to Helm chart (default: ./perfectltp)"
    Write-Host "  -Environment ENV   Environment (production, staging, dev) (default: production)"
    Write-Host "  -Domain DOMAIN     Domain name (default: perfectltp.example.com)"
    Write-Host "  -ImageTag TAG      Docker image tag (default: latest)"
    Write-Host "  -Help              Show this help message"
    exit 0
}

# Show deployment information
Write-Host "Deploying Perfect LifeTracker Pro to Kubernetes"
Write-Host "------------------------------------------------"
Write-Host "Namespace:    $Namespace"
Write-Host "Release name: $ReleaseName"
Write-Host "Chart path:   $ChartPath"
Write-Host "Environment:  $Environment"
Write-Host "Domain:       $Domain"
Write-Host "Image tag:    $ImageTag"
Write-Host "------------------------------------------------"

# Create namespace if it doesn't exist
try {
    $namespaceExists = kubectl get namespace $Namespace 2>$null
    if (-not $namespaceExists) {
        Write-Host "Creating namespace $Namespace..."
        kubectl create namespace $Namespace
    }
}
catch {
    Write-Host "Creating namespace $Namespace..."
    kubectl create namespace $Namespace
}

# Check for required tools
try {
    $helmVersion = helm version --short
    Write-Host "Helm version: $helmVersion"
    
    $kubectlVersion = kubectl version --client --short
    Write-Host "kubectl version: $kubectlVersion"
}
catch {
    Write-Host "Error: Helm or kubectl not installed or not in PATH." -ForegroundColor Red
    exit 1
}

# Deploy using Helm
Write-Host "Deploying with Helm..."
try {
    helm upgrade --install $ReleaseName $ChartPath `
        --namespace $Namespace `
        --set global.environment=$Environment `
        --set global.domain=$Domain `
        --set image.tag=$ImageTag `
        --atomic `
        --timeout 10m0s
}
catch {
    Write-Host "Error during Helm deployment: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Waiting for pods to be ready..."
try {
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=$ReleaseName -n $Namespace --timeout=300s
}
catch {
    Write-Host "Warning: Timed out waiting for all pods to be ready. Deployment may still be in progress." -ForegroundColor Yellow
}

Write-Host "Deployment completed!"
Write-Host "------------------------------------------------"
Write-Host "You can access the application at: https://$Domain"
Write-Host "To check status, run: helm status $ReleaseName -n $Namespace"
Write-Host "To check pods, run: kubectl get pods -n $Namespace"
Write-Host "------------------------------------------------"