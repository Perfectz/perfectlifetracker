provider "azurerm" {
  features {}
  
  # For test purposes only - these would be environment variables in production
  subscription_id = "00000000-0000-0000-0000-000000000000"
  client_id       = "00000000-0000-0000-0000-000000000000"
  client_secret   = "dummy-value"
  tenant_id       = "00000000-0000-0000-0000-000000000000"
  
  # Skip provider registration for test purposes
  skip_provider_registration = true
}

# Resource Group
resource "azurerm_resource_group" "rg" {
  name     = "lifetracker-${var.environment}-rg"
  location = var.location
  
  tags = merge(var.tags, {
    Environment = var.environment
    Project     = "LifeTracker Pro"
  })
}

# Azure Cosmos DB Account
resource "azurerm_cosmosdb_account" "db" {
  name                = "lifetracker-${var.environment}-cosmos"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"

  consistency_policy {
    consistency_level       = "Session"
    max_interval_in_seconds = 5
    max_staleness_prefix    = 100
  }

  geo_location {
    location          = azurerm_resource_group.rg.location
    failover_priority = 0
  }

  capabilities {
    name = "EnableServerless"
  }

  tags = var.tags
}

# Cosmos DB SQL Database
resource "azurerm_cosmosdb_sql_database" "db" {
  name                = "lifetracker-db"
  resource_group_name = azurerm_cosmosdb_account.db.resource_group_name
  account_name        = azurerm_cosmosdb_account.db.name
}

# Storage Account
resource "azurerm_storage_account" "storage" {
  name                     = "lifetracker${var.environment}sa"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  account_kind             = "StorageV2"
  access_tier              = "Hot"

  tags = var.tags
}

# Storage Container
resource "azurerm_storage_container" "assets" {
  name                  = "lifetracker-assets"
  storage_account_name  = azurerm_storage_account.storage.name
  container_access_type = "private"
}

# Redis Cache
resource "azurerm_redis_cache" "redis" {
  name                = "lifetracker-${var.environment}-redis"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  capacity            = var.redis_capacity
  family              = var.redis_family
  sku_name            = var.redis_sku
  minimum_tls_version = "1.2"

  tags = var.tags
}

# Azure Cognitive Search
resource "azurerm_search_service" "search" {
  name                = "lifetracker-${var.environment}-search"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = var.search_sku
  replica_count       = 1
  partition_count     = 1

  tags = var.tags
}

# Azure Container Registry
resource "azurerm_container_registry" "acr" {
  name                = "lifetracker${var.environment}acr"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Standard"
  admin_enabled       = true

  tags = var.tags
}

# Azure Kubernetes Service
resource "azurerm_kubernetes_cluster" "aks" {
  name                = "lifetracker-${var.environment}-aks"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "lifetracker-${var.environment}"
  kubernetes_version  = var.kubernetes_version

  default_node_pool {
    name            = "default"
    node_count      = var.aks_node_count
    vm_size         = var.aks_vm_size
    os_disk_size_gb = 30
  }

  identity {
    type = "SystemAssigned"
  }

  tags = var.tags
} 