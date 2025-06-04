# terraform/main.tf
# Main Terraform configuration for Perfect LifeTracker Pro Azure deployment

terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }
}

# Configure the Azure Provider
provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = true
      recover_soft_deleted_key_vaults = true
    }
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
  subscription_id = var.subscription_id
  tenant_id       = var.tenant_id
}

# Random string for unique resource names
resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

# Resource Group for all resources
resource "azurerm_resource_group" "main" {
  name     = "${var.prefix}-${var.environment}-rg"
  location = var.location
  tags     = var.tags
}

# Application Insights for monitoring
resource "azurerm_application_insights" "main" {
  count               = var.enable_monitoring ? 1 : 0
  name                = "${var.prefix}-${var.environment}-ai"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  application_type    = "web"
  tags                = var.tags
}

# Log Analytics Workspace
resource "azurerm_log_analytics_workspace" "main" {
  count               = var.enable_monitoring ? 1 : 0
  name                = "${var.prefix}-${var.environment}-logs"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = var.tags
}

# Azure Static Web App for frontend
resource "azurerm_static_web_app" "frontend" {
  name                = "${var.prefix}-${var.environment}-frontend"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  sku_tier            = var.static_web_app_sku
  sku_size            = var.static_web_app_sku
  tags                = var.tags

  identity {
    type = "SystemAssigned"
  }
}

# App Service Plan for backend
resource "azurerm_service_plan" "plan" {
  name                = "${var.prefix}-${var.environment}-plan"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = var.app_service_plan_sku
  tags                = var.tags
}

# App Service for backend API
resource "azurerm_linux_web_app" "backend" {
  name                = "${var.prefix}-${var.environment}-backend"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_service_plan.plan.location
  service_plan_id     = azurerm_service_plan.plan.id
  tags                = var.tags

  identity {
    type = "SystemAssigned"
  }

  site_config {
    application_stack {
      node_version = "20-lts"
    }
    
    always_on                         = var.app_service_plan_sku != "F1" && var.app_service_plan_sku != "D1"
    health_check_path                 = "/api/health"
    health_check_eviction_time_in_min = 2
    
    cors {
      allowed_origins = concat(var.allowed_origins, [azurerm_static_web_app.frontend.default_host_name])
      support_credentials = true
    }
  }

  app_settings = {
    "NODE_ENV"                           = var.environment == "prod" ? "production" : "development"
    "PORT"                              = "8000"
    "WEBSITES_PORT"                     = "8000"
    "WEBSITE_NODE_DEFAULT_VERSION"      = "20.x"
    "SCM_DO_BUILD_DURING_DEPLOYMENT"    = "true"
    "APPINSIGHTS_INSTRUMENTATIONKEY"    = var.enable_monitoring ? azurerm_application_insights.main[0].instrumentation_key : ""
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = var.enable_monitoring ? azurerm_application_insights.main[0].connection_string : ""
    
    # Azure Key Vault configuration
    "USE_KEY_VAULT"                     = "true"
    "AZURE_KEY_VAULT_URL"               = azurerm_key_vault.main.vault_uri
    
    # Database configuration  
    "USE_MOCK_DATABASE"                 = var.environment == "dev" ? "true" : "false"
    "COSMOS_DB_DATABASE"                = azurerm_cosmosdb_sql_database.main.name
    
    # Authentication configuration
    "USE_MOCK_AUTH"                     = var.environment == "dev" ? "true" : "false"
    "AZURE_AUTHORITY"                   = "https://login.microsoftonline.com/${var.tenant_id}"
    
    # CORS configuration
    "FRONTEND_URL"                      = "https://${azurerm_static_web_app.frontend.default_host_name}"
  }

  logs {
    detailed_error_messages = true
    failed_request_tracing  = true
    
    http_logs {
      file_system {
        retention_in_days = 7
        retention_in_mb   = 50
      }
    }
  }
}

# Storage Account for file uploads and backups
resource "azurerm_storage_account" "main" {
  name                     = "${var.prefix}${var.environment}${random_string.suffix.result}"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  tags                     = var.tags

  blob_properties {
    cors_rule {
      allowed_headers    = ["*"]
      allowed_methods    = ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"]
      allowed_origins    = concat(var.allowed_origins, ["https://${azurerm_static_web_app.frontend.default_host_name}"])
      exposed_headers    = ["*"]
      max_age_in_seconds = 3600
    }
  }
}

# Storage Container for uploads
resource "azurerm_storage_container" "uploads" {
  name                  = "uploads"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

# Storage Container for backups
resource "azurerm_storage_container" "backups" {
  name                  = "backups"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
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