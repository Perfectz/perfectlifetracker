# Resource Group for all resources
resource "azurerm_resource_group" "main" {
  name     = "${var.prefix}-rg"
  location = var.location
}

# Azure Static Web App for frontend (Free tier)
resource "azurerm_static_web_app" "frontend" {
  name                = "${var.prefix}-frontend"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  sku_tier            = "Free"
  sku_size            = "Free"
}

# App Service Plan for backend (Linux Basic SKU)
resource "azurerm_service_plan" "plan" {
  name                = "${var.prefix}-plan"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  os_type             = "Linux"
  sku_name            = "B1"
}

# App Service for backend API (in the above plan)
resource "azurerm_linux_web_app" "backend" {
  name                = "${var.prefix}-api"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  service_plan_id     = azurerm_service_plan.plan.id

  site_config {
    application_stack {
      node_version = "18-lts"
    }
    
    cors {
      allowed_origins = ["https://${azurerm_static_web_app.frontend.default_host_name}", "http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"]
      support_credentials = true
    }
  }

  app_settings = {
    "WEBSITE_RUN_FROM_PACKAGE"    = "1"
    "WEBSITE_NODE_DEFAULT_VERSION" = "~18"
    
    # Key Vault configuration
    "AZURE_KEY_VAULT_URL"          = azurerm_key_vault.main.vault_uri
    "USE_KEY_VAULT"                = "true"
    
    # Non-sensitive configuration (still in app settings)
    "COSMOS_DB_DATABASE"           = azurerm_cosmosdb_sql_database.database.name
    "COSMOS_DB_USERS_CONTAINER"    = azurerm_cosmosdb_sql_container.users.name
    "COSMOS_DB_FITNESS_CONTAINER"  = azurerm_cosmosdb_sql_container.fitness.name
    "COSMOS_DB_TASKS_CONTAINER"    = azurerm_cosmosdb_sql_container.tasks.name
    "COSMOS_DB_DEV_CONTAINER"      = azurerm_cosmosdb_sql_container.development.name
    "COSMOS_DB_ANALYTICS_CONTAINER" = azurerm_cosmosdb_sql_container.analytics.name
    "NODE_ENV"                     = "production"
    "AZURE_AUTHORITY"              = var.azure_authority
    "AZURE_CLIENT_ID"              = var.azure_client_id
  }
  
  identity {
    type = "SystemAssigned"
  }

  tags = {
    environment = "development"
    application = "PerfectLifeTrackerPro"
  }
}

# Cosmos DB Account (SQL API) for persistence (Free tier enabled)
resource "azurerm_cosmosdb_account" "cosmos" {
  name                = "${var.prefix}-cosmos"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location

  kind               = "GlobalDocumentDB"
  offer_type         = "Standard"
  enable_free_tier   = true
  
  capabilities {
    name = "EnableServerless"
  }
  
  capabilities {
    name = "EnableAggregationPipeline"
  }

  consistency_policy {
    consistency_level       = "Session"
    max_interval_in_seconds = 5
    max_staleness_prefix    = 100
  }

  geo_location {
    location          = var.location
    failover_priority = 0
  }
  
  # Enable Analytical Storage (useful for AI insights and reporting)
  analytical_storage {
    schema_type = "WellDefined"
  }
  
  # Configure backup policy
  backup {
    type                = "Periodic"
    interval_in_minutes = 240
    retention_in_hours  = 8
    storage_redundancy  = "Local"
  }
  
  # Network access configuration
  public_network_access_enabled = true
  
  # Enable CORS for frontend access
  cors_rule {
    allowed_origins    = ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "https://${azurerm_static_web_app.frontend.default_host_name}"]
    exposed_headers    = ["*"]
    allowed_headers    = ["*"]
    allowed_methods    = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
    max_age_in_seconds = 3600
  }

  tags = {
    environment = "development"
    application = "PerfectLifeTrackerPro"
  }
}

# Cosmos DB SQL Database (inside the Cosmos account)
resource "azurerm_cosmosdb_sql_database" "database" {
  name                = "${var.prefix}-db"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.cosmos.name
} 