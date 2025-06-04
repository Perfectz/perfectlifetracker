# scripts/deploy-azure.ps1
# PowerShell script for deploying Perfect LifeTracker Pro to Azure

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("dev", "staging", "prod")]
    [string]$Environment,
    
    [Parameter(Mandatory=$false)]
    [string]$SubscriptionId = "",
    
    [Parameter(Mandatory=$false)]
    [string]$TenantId = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipInfrastructure,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipTests,
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

# Script configuration
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Colors for output
$Colors = @{
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Info = "Cyan"
    Header = "Magenta"
}

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Step {
    param([string]$Message)
    Write-ColorOutput "🚀 $Message" $Colors.Info
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✅ $Message" $Colors.Success
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠️  $Message" $Colors.Warning
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "❌ $Message" $Colors.Error
}

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-ColorOutput "═══════════════════════════════════════" $Colors.Header
    Write-ColorOutput "  $Message" $Colors.Header
    Write-ColorOutput "═══════════════════════════════════════" $Colors.Header
    Write-Host ""
}

# Main deployment function
function Deploy-PerfectLifeTracker {
    Write-Header "Perfect LifeTracker Pro - Azure Deployment"
    
    Write-ColorOutput "Environment: $Environment" $Colors.Info
    Write-ColorOutput "Skip Infrastructure: $SkipInfrastructure" $Colors.Info
    Write-ColorOutput "Skip Tests: $SkipTests" $Colors.Info
    
    try {
        # Step 1: Prerequisites check
        Write-Step "Checking prerequisites..."
        Test-Prerequisites
        
        # Step 2: Azure Login
        Write-Step "Logging into Azure..."
        Connect-Azure
        
        # Step 3: Infrastructure deployment
        if (-not $SkipInfrastructure) {
            Write-Step "Deploying infrastructure with Terraform..."
            Deploy-Infrastructure
        } else {
            Write-Warning "Skipping infrastructure deployment"
        }
        
        # Step 4: Backend deployment
        Write-Step "Building and deploying backend..."
        Deploy-Backend
        
        # Step 5: Frontend deployment
        Write-Step "Building and deploying frontend..."
        Deploy-Frontend
        
        # Step 6: Health checks
        Write-Step "Running health checks..."
        Test-Deployment
        
        Write-Success "Deployment completed successfully!"
        
    } catch {
        Write-Error "Deployment failed: $($_.Exception.Message)"
        throw
    }
}

function Test-Prerequisites {
    # Check if required tools are installed
    $requiredTools = @("az", "terraform", "node", "npm")
    
    foreach ($tool in $requiredTools) {
        if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
            throw "$tool is not installed or not in PATH"
        }
    }
    
    # Check if we're in the correct directory
    if (-not (Test-Path "package.json")) {
        throw "Not in the correct project directory. Please run from project root."
    }
    
    Write-Success "Prerequisites check passed"
}

function Connect-Azure {
    # Check if already logged in
    $account = az account show 2>$null | ConvertFrom-Json
    
    if (-not $account) {
        Write-Step "Please log in to Azure..."
        az login
        
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to log in to Azure"
        }
    }
    
    # Set subscription if provided
    if ($SubscriptionId) {
        az account set --subscription $SubscriptionId
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to set subscription: $SubscriptionId"
        }
    }
    
    $currentAccount = az account show | ConvertFrom-Json
    Write-Success "Connected to Azure - Subscription: $($currentAccount.name)"
}

function Deploy-Infrastructure {
    Push-Location "terraform"
    
    try {
        # Initialize Terraform
        Write-Step "Initializing Terraform..."
        terraform init
        if ($LASTEXITCODE -ne 0) { throw "Terraform init failed" }
        
        # Create terraform.tfvars if it doesn't exist
        if (-not (Test-Path "terraform.tfvars")) {
            Write-Warning "terraform.tfvars not found. Please create it from terraform.tfvars.example"
            
            if (-not $Force) {
                $continue = Read-Host "Continue without terraform.tfvars? (y/N)"
                if ($continue -ne "y") {
                    throw "Deployment cancelled"
                }
            }
        }
        
        # Plan infrastructure
        Write-Step "Planning infrastructure changes..."
        $planArgs = @()
        if ($SubscriptionId) { $planArgs += "-var=subscription_id=$SubscriptionId" }
        if ($TenantId) { $planArgs += "-var=tenant_id=$TenantId" }
        $planArgs += "-var=environment=$Environment"
        $planArgs += "-out=tfplan"
        
        terraform plan @planArgs
        if ($LASTEXITCODE -ne 0) { throw "Terraform plan failed" }
        
        # Apply infrastructure
        if ($Force) {
            Write-Step "Applying infrastructure changes..."
            terraform apply -auto-approve tfplan
        } else {
            $apply = Read-Host "Apply infrastructure changes? (y/N)"
            if ($apply -eq "y") {
                terraform apply tfplan
            } else {
                throw "Infrastructure deployment cancelled"
            }
        }
        
        if ($LASTEXITCODE -ne 0) { throw "Terraform apply failed" }
        
        Write-Success "Infrastructure deployment completed"
        
    } finally {
        Pop-Location
    }
}

function Deploy-Backend {
    Push-Location "backend"
    
    try {
        # Install dependencies
        Write-Step "Installing backend dependencies..."
        npm ci
        if ($LASTEXITCODE -ne 0) { throw "Backend npm install failed" }
        
        # Run tests
        if (-not $SkipTests) {
            Write-Step "Running backend tests..."
            npm test
            if ($LASTEXITCODE -ne 0) { throw "Backend tests failed" }
        }
        
        # Build application
        Write-Step "Building backend application..."
        npm run build
        if ($LASTEXITCODE -ne 0) { throw "Backend build failed" }
        
        # Deploy to Azure App Service
        Write-Step "Deploying to Azure App Service..."
        $appName = "perfectltp-$Environment-backend"
        
        # Create deployment package
        $deployPath = "deploy"
        if (Test-Path $deployPath) {
            Remove-Item $deployPath -Recurse -Force
        }
        New-Item $deployPath -ItemType Directory | Out-Null
        
        # Copy necessary files
        Copy-Item "dist" "$deployPath/" -Recurse
        Copy-Item "package.json" "$deployPath/"
        Copy-Item "package-lock.json" "$deployPath/"
        
        # Deploy using Azure CLI
        az webapp deployment source config-zip --resource-group "perfectltp-$Environment-rg" --name $appName --src "$deployPath.zip"
        if ($LASTEXITCODE -ne 0) { throw "Backend deployment failed" }
        
        Write-Success "Backend deployment completed"
        
    } finally {
        Pop-Location
    }
}

function Deploy-Frontend {
    Push-Location "frontend"
    
    try {
        # Install dependencies
        Write-Step "Installing frontend dependencies..."
        npm ci
        if ($LASTEXITCODE -ne 0) { throw "Frontend npm install failed" }
        
        # Run tests
        if (-not $SkipTests) {
            Write-Step "Running frontend tests..."
            $env:CI = "true"
            npm test -- --coverage --watchAll=false
            if ($LASTEXITCODE -ne 0) { throw "Frontend tests failed" }
        }
        
        # Build application
        Write-Step "Building frontend application..."
        $env:REACT_APP_ENVIRONMENT = $Environment
        npm run build
        if ($LASTEXITCODE -ne 0) { throw "Frontend build failed" }
        
        Write-Success "Frontend built successfully"
        Write-Warning "Frontend deployment requires Azure Static Web Apps deployment token"
        Write-Warning "Please use GitHub Actions or Azure CLI for Static Web Apps deployment"
        
    } finally {
        Pop-Location
    }
}

function Test-Deployment {
    Write-Step "Testing deployment health..."
    
    # Get URLs from Terraform outputs
    Push-Location "terraform"
    
    try {
        $frontendUrl = terraform output -raw frontend_url
        $backendUrl = terraform output -raw backend_url
        
        # Test backend health endpoint
        Write-Step "Testing backend health at: $backendUrl/api/health"
        $response = Invoke-RestMethod "$backendUrl/api/health" -TimeoutSec 30
        
        if ($response.status -eq "healthy") {
            Write-Success "Backend health check passed"
        } else {
            Write-Warning "Backend health check returned: $($response.status)"
        }
        
        # Test frontend
        Write-Step "Testing frontend at: $frontendUrl"
        $frontendResponse = Invoke-WebRequest $frontendUrl -TimeoutSec 30
        
        if ($frontendResponse.StatusCode -eq 200) {
            Write-Success "Frontend health check passed"
        } else {
            Write-Warning "Frontend returned status code: $($frontendResponse.StatusCode)"
        }
        
        Write-Success "Health checks completed"
        Write-ColorOutput "Frontend URL: $frontendUrl" $Colors.Info
        Write-ColorOutput "Backend URL: $backendUrl" $Colors.Info
        
    } finally {
        Pop-Location
    }
}

# Run deployment
Deploy-PerfectLifeTracker 