# setup-cosmos-db.ps1
# Azure CLI script to set up real Cosmos DB for Perfect LifeTracker Pro

Write-Host "🚀 Setting up Azure Cosmos DB for Perfect LifeTracker Pro" -ForegroundColor Green
Write-Host "=" * 60

# Configuration variables
$resourceGroup = "perfectltp-free-rg"
$cosmosAccountName = "perfectltp-cosmos-free"
$databaseName = "lifetrackpro-db"
$location = "East US"

Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "   Resource Group: $resourceGroup"
Write-Host "   Cosmos Account: $cosmosAccountName"
Write-Host "   Database: $databaseName"
Write-Host "   Location: $location"
Write-Host ""

# Check if Azure CLI is installed
Write-Host "🔍 Checking Azure CLI installation..." -ForegroundColor Blue
try {
    $azVersion = az version --output tsv --query '"azure-cli"' 2>$null
    if ($azVersion) {
        Write-Host "✅ Azure CLI found (version: $azVersion)" -ForegroundColor Green
    } else {
        throw "Azure CLI not found"
    }
} catch {
    Write-Host "❌ Azure CLI not installed. Please install from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Red
    exit 1
}

# Check if user is logged in
Write-Host "🔐 Checking Azure login status..." -ForegroundColor Blue
try {
    $account = az account show --output json 2>$null | ConvertFrom-Json
    if ($account) {
        Write-Host "✅ Logged in as: $($account.user.name)" -ForegroundColor Green
        Write-Host "   Subscription: $($account.name)" -ForegroundColor Green
    } else {
        throw "Not logged in"
    }
} catch {
    Write-Host "❌ Not logged into Azure. Please run: az login" -ForegroundColor Red
    exit 1
}

# Check if resource group exists
Write-Host "📦 Checking resource group..." -ForegroundColor Blue
$rgExists = az group exists --name $resourceGroup --output tsv
if ($rgExists -eq "true") {
    Write-Host "✅ Resource group '$resourceGroup' exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  Resource group '$resourceGroup' doesn't exist. Creating..." -ForegroundColor Yellow
    try {
        az group create --name $resourceGroup --location $location --output none
        Write-Host "✅ Resource group created successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to create resource group" -ForegroundColor Red
        exit 1
    }
}

# Check if Cosmos DB account already exists
Write-Host "🗄️  Checking Cosmos DB account..." -ForegroundColor Blue
try {
    $cosmosExists = az cosmosdb show --name $cosmosAccountName --resource-group $resourceGroup --output none 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Cosmos DB account '$cosmosAccountName' already exists" -ForegroundColor Green
        $skipCosmosCreation = $true
    } else {
        $skipCosmosCreation = $false
    }
} catch {
    $skipCosmosCreation = $false
}

# Create Cosmos DB account if it doesn't exist
if (-not $skipCosmosCreation) {
    Write-Host "🔨 Creating Cosmos DB account (this may take 5-10 minutes)..." -ForegroundColor Blue
    Write-Host "   Please wait..." -ForegroundColor Yellow
    
    try {
        az cosmosdb create `
            --name $cosmosAccountName `
            --resource-group $resourceGroup `
            --location $location `
            --kind GlobalDocumentDB `
            --default-consistency-level "Session" `
            --locations regionName=$location failoverPriority=0 isZoneRedundant=False `
            --enable-free-tier true `
            --output none

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Cosmos DB account created successfully!" -ForegroundColor Green
        } else {
            throw "Failed to create Cosmos DB account"
        }
    } catch {
        Write-Host "❌ Failed to create Cosmos DB account. Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "💡 Try using a different account name or check if free tier is available" -ForegroundColor Yellow
        exit 1
    }
}

# Create database
Write-Host "🗃️  Creating database '$databaseName'..." -ForegroundColor Blue
try {
    az cosmosdb sql database create `
        --account-name $cosmosAccountName `
        --resource-group $resourceGroup `
        --name $databaseName `
        --output none 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database created successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Database might already exist (this is OK)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Database creation warning (might already exist): $($_.Exception.Message)" -ForegroundColor Yellow
}

# Create containers with their partition keys
$containers = @(
    @{name="users"; partitionKey="/userId"},
    @{name="fitness"; partitionKey="/userId"},
    @{name="tasks"; partitionKey="/userId"},
    @{name="development"; partitionKey="/id"},
    @{name="analytics"; partitionKey="/userId"},
    @{name="files"; partitionKey="/userId"}
)

Write-Host "📁 Creating containers..." -ForegroundColor Blue
foreach ($container in $containers) {
    Write-Host "   Creating container: $($container.name)" -ForegroundColor Cyan
    try {
        az cosmosdb sql container create `
            --account-name $cosmosAccountName `
            --resource-group $resourceGroup `
            --database-name $databaseName `
            --name $container.name `
            --partition-key-path $container.partitionKey `
            --throughput 400 `
            --output none 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Container '$($container.name)' created" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Container '$($container.name)' might already exist" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   ⚠️  Container creation warning: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Get connection details
Write-Host "🔑 Getting connection details..." -ForegroundColor Blue
try {
    # Get endpoint
    $endpoint = az cosmosdb show --name $cosmosAccountName --resource-group $resourceGroup --query "documentEndpoint" --output tsv
    
    # Get primary key
    $primaryKey = az cosmosdb keys list --name $cosmosAccountName --resource-group $resourceGroup --type keys --query "primaryMasterKey" --output tsv
    
    if ($endpoint -and $primaryKey) {
        Write-Host "✅ Connection details retrieved successfully" -ForegroundColor Green
        Write-Host ""
        
        # Display connection information
        Write-Host "🎯 COSMOS DB CONFIGURATION" -ForegroundColor Green
        Write-Host "=" * 50
        Write-Host "Endpoint: $endpoint" -ForegroundColor Cyan
        Write-Host "Primary Key: $($primaryKey.Substring(0,20))..." -ForegroundColor Cyan
        Write-Host "Database: $databaseName" -ForegroundColor Cyan
        Write-Host ""
        
        # Create .env file
        Write-Host "📝 Creating .env file for backend..." -ForegroundColor Blue
        $envContent = @"
# Perfect LifeTracker Pro - Real Cosmos DB Configuration
# Generated on $(Get-Date)

NODE_ENV=development
PORT=3001

# Cosmos DB Configuration (REAL AZURE COSMOS DB)
USE_MOCK_DATABASE=false
COSMOS_DB_ENDPOINT=$endpoint
COSMOS_DB_KEY=$primaryKey
COSMOS_DB_DATABASE=$databaseName

# Other configurations
USE_KEY_VAULT=false
USE_MOCK_AUTH=true
AZURE_CLIENT_ID=d9764c39-1eb9-4963-83a0-e8ba859c8965
AZURE_AUTHORITY=https://login.microsoftonline.com/78e9993f-a208-4c38-9d9d-6b15f0d2407d
FRONTEND_URL=http://localhost:3000

# Security (Development)
JWT_SECRET=development-jwt-secret-please-change-in-production
SESSION_SECRET=development-session-secret-please-change-in-production
ENCRYPTION_KEY=development-encryption-key-please-change-in-production

# Logging
LOG_LEVEL=debug
LOG_FORMAT=simple
ENABLE_ACCESS_LOGS=true
"@
        
        $envContent | Out-File -FilePath "backend\.env" -Encoding UTF8
        Write-Host "✅ .env file created at backend/.env" -ForegroundColor Green
        
        # Create GitHub secrets commands
        Write-Host ""
        Write-Host "🔐 GitHub Secrets Configuration" -ForegroundColor Green
        Write-Host "=" * 50
        Write-Host "Run these commands to set GitHub secrets for deployment:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "gh secret set COSMOS_DB_ENDPOINT --body '$endpoint'" -ForegroundColor Cyan
        Write-Host "gh secret set COSMOS_DB_KEY --body '$primaryKey'" -ForegroundColor Cyan
        Write-Host ""
        
        # Success message
        Write-Host "🎉 COSMOS DB SETUP COMPLETE!" -ForegroundColor Green
        Write-Host "=" * 50
        Write-Host "✅ Cosmos DB account created and configured" -ForegroundColor Green
        Write-Host "✅ Database and containers created" -ForegroundColor Green
        Write-Host "✅ Environment file configured" -ForegroundColor Green
        Write-Host "✅ Ready for real data storage!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
        Write-Host "1. Restart your backend server to use real Cosmos DB"
        Write-Host "2. Test the weight functionality - data will now persist!"
        Write-Host "3. Set GitHub secrets for production deployment (commands above)"
        Write-Host ""
        
    } else {
        throw "Failed to retrieve connection details"
    }
    
} catch {
    Write-Host "❌ Failed to get connection details: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Script completed successfully!" -ForegroundColor Green 