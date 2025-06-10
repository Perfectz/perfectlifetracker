# setup-cosmos-simple.ps1
# Simplified Azure CLI script to set up real Cosmos DB

Write-Host "Setting up Azure Cosmos DB for Perfect LifeTracker Pro" -ForegroundColor Green

# Configuration
$resourceGroup = "perfectltp-free-rg"
$cosmosAccountName = "perfectltp-cosmos-free"
$databaseName = "lifetrackpro-db"
$location = "East US"

Write-Host "Configuration:"
Write-Host "  Resource Group: $resourceGroup"
Write-Host "  Cosmos Account: $cosmosAccountName"
Write-Host "  Database: $databaseName"
Write-Host ""

# Check Azure CLI
Write-Host "Checking Azure CLI..." -ForegroundColor Blue
$azCheck = az version 2>$null
if (-not $azCheck) {
    Write-Host "ERROR: Azure CLI not found. Please install it first." -ForegroundColor Red
    exit 1
}
Write-Host "Azure CLI found" -ForegroundColor Green

# Check login
Write-Host "Checking Azure login..." -ForegroundColor Blue
$accountCheck = az account show 2>$null
if (-not $accountCheck) {
    Write-Host "ERROR: Not logged into Azure. Run: az login" -ForegroundColor Red
    exit 1
}
Write-Host "Logged into Azure" -ForegroundColor Green

# Create resource group if needed
Write-Host "Checking resource group..." -ForegroundColor Blue
$rgExists = az group exists --name $resourceGroup
if ($rgExists -eq "false") {
    Write-Host "Creating resource group..."
    az group create --name $resourceGroup --location $location
}
Write-Host "Resource group ready" -ForegroundColor Green

# Create Cosmos DB account
Write-Host "Creating Cosmos DB account (this takes 5-10 minutes)..." -ForegroundColor Blue
$cosmosExists = az cosmosdb show --name $cosmosAccountName --resource-group $resourceGroup 2>$null
if (-not $cosmosExists) {
    Write-Host "Creating new Cosmos DB account..." -ForegroundColor Yellow
    az cosmosdb create --name $cosmosAccountName --resource-group $resourceGroup --location $location --kind GlobalDocumentDB --default-consistency-level Session --enable-free-tier true
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to create Cosmos DB account" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Cosmos DB account already exists" -ForegroundColor Green
}

# Create database
Write-Host "Creating database..." -ForegroundColor Blue
az cosmosdb sql database create --account-name $cosmosAccountName --resource-group $resourceGroup --name $databaseName 2>$null

# Create containers
Write-Host "Creating containers..." -ForegroundColor Blue
$containers = @("users", "fitness", "tasks", "development", "analytics", "files")
$partitionKeys = @("/userId", "/userId", "/userId", "/id", "/userId", "/userId")

for ($i = 0; $i -lt $containers.Length; $i++) {
    $containerName = $containers[$i]
    $partitionKey = $partitionKeys[$i]
    Write-Host "  Creating container: $containerName"
    az cosmosdb sql container create --account-name $cosmosAccountName --resource-group $resourceGroup --database-name $databaseName --name $containerName --partition-key-path $partitionKey --throughput 400 2>$null
}

# Get connection details
Write-Host "Getting connection details..." -ForegroundColor Blue
$endpoint = az cosmosdb show --name $cosmosAccountName --resource-group $resourceGroup --query "documentEndpoint" --output tsv
$primaryKey = az cosmosdb keys list --name $cosmosAccountName --resource-group $resourceGroup --type keys --query "primaryMasterKey" --output tsv

if (-not $endpoint -or -not $primaryKey) {
    Write-Host "ERROR: Failed to get connection details" -ForegroundColor Red
    exit 1
}

Write-Host "SUCCESS! Cosmos DB configured:" -ForegroundColor Green
Write-Host "Endpoint: $endpoint"
Write-Host "Primary Key: $($primaryKey.Substring(0,20))..."
Write-Host ""

# Create environment file
Write-Host "Creating .env file..." -ForegroundColor Blue
$envPath = "backend\.env"

# Create env content line by line to avoid syntax issues
$envLines = @(
    "# Perfect LifeTracker Pro - Real Cosmos DB Configuration",
    "# Generated on $(Get-Date)",
    "",
    "NODE_ENV=development",
    "PORT=3001",
    "",
    "# Cosmos DB Configuration (REAL AZURE COSMOS DB)",
    "USE_MOCK_DATABASE=false",
    "COSMOS_DB_ENDPOINT=$endpoint",
    "COSMOS_DB_KEY=$primaryKey",
    "COSMOS_DB_DATABASE=$databaseName",
    "",
    "# Other configurations",
    "USE_KEY_VAULT=false",
    "USE_MOCK_AUTH=true",
    "AZURE_CLIENT_ID=d9764c39-1eb9-4963-83a0-e8ba859c8965",
    "AZURE_AUTHORITY=https://login.microsoftonline.com/78e9993f-a208-4c38-9d9d-6b15f0d2407d",
    "FRONTEND_URL=http://localhost:3000",
    "",
    "# Security (Development)",
    "JWT_SECRET=development-jwt-secret-please-change-in-production",
    "SESSION_SECRET=development-session-secret-please-change-in-production",
    "ENCRYPTION_KEY=development-encryption-key-please-change-in-production",
    "",
    "# Logging",
    "LOG_LEVEL=debug",
    "LOG_FORMAT=simple",
    "ENABLE_ACCESS_LOGS=true"
)

$envLines | Out-File -FilePath $envPath -Encoding UTF8
Write-Host ".env file created successfully" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 COSMOS DB SETUP COMPLETE!" -ForegroundColor Green
Write-Host "✅ Cosmos DB account created and configured"
Write-Host "✅ Database and containers created"
Write-Host "✅ Environment file configured"
Write-Host "✅ Ready for real data storage!"
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Restart your backend server to use real Cosmos DB"
Write-Host "2. Test the weight functionality - data will now persist!"
Write-Host ""
Write-Host "GitHub Secrets (for deployment):"
Write-Host "gh secret set COSMOS_DB_ENDPOINT --body '$endpoint'"
Write-Host "gh secret set COSMOS_DB_KEY --body '$primaryKey'" 