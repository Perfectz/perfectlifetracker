# terraform/keyvault.tf
# Azure Key Vault configuration for Perfect LifeTracker Pro

# Get current client configuration
data "azurerm_client_config" "current" {}

# Random string for unique Key Vault name
resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

# Azure Key Vault for storing secrets
resource "azurerm_key_vault" "main" {
  name                        = "${var.prefix}-${var.environment}-kv-${random_string.suffix.result}"
  location                    = azurerm_resource_group.main.location
  resource_group_name         = azurerm_resource_group.main.name
  enabled_for_disk_encryption = true
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  soft_delete_retention_days  = 7
  purge_protection_enabled    = false
  sku_name                    = var.key_vault_sku
  tags                        = var.tags

  # Access policy for the current user/service principal (for Terraform)
  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    secret_permissions = [
      "Get",
      "List",
      "Set",
      "Delete",
      "Purge",
      "Recover"
    ]
  }

  # Access policy for the backend App Service
  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = azurerm_linux_web_app.backend.identity[0].principal_id

    secret_permissions = [
      "Get",
      "List"
    ]
  }

  # Access policy for the frontend Static Web App
  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = azurerm_static_web_app.frontend.identity[0].principal_id

    secret_permissions = [
      "Get"
    ]
  }
}

# Cosmos DB Primary Key Secret
resource "azurerm_key_vault_secret" "cosmos_db_key" {
  name         = "cosmos-db-key"
  value        = azurerm_cosmosdb_account.main.primary_key
  key_vault_id = azurerm_key_vault.main.id
  tags         = var.tags

  depends_on = [azurerm_key_vault.main]
}

# Cosmos DB Endpoint Secret
resource "azurerm_key_vault_secret" "cosmos_db_endpoint" {
  name         = "cosmos-db-endpoint"
  value        = azurerm_cosmosdb_account.main.endpoint
  key_vault_id = azurerm_key_vault.main.id
  tags         = var.tags

  depends_on = [azurerm_key_vault.main]
}

# JWT Secret (generated)
resource "azurerm_key_vault_secret" "jwt_secret" {
  name         = "jwt-secret"
  value        = random_string.jwt_secret.result
  key_vault_id = azurerm_key_vault.main.id
  tags         = var.tags

  depends_on = [azurerm_key_vault.main]
}

# Session Secret (generated)
resource "azurerm_key_vault_secret" "session_secret" {
  name         = "session-secret"
  value        = random_string.session_secret.result
  key_vault_id = azurerm_key_vault.main.id
  tags         = var.tags

  depends_on = [azurerm_key_vault.main]
}

# Encryption Key (generated)
resource "azurerm_key_vault_secret" "encryption_key" {
  name         = "encryption-key"
  value        = random_string.encryption_key.result
  key_vault_id = azurerm_key_vault.main.id
  tags         = var.tags

  depends_on = [azurerm_key_vault.main]
}

# Azure Storage Connection String
resource "azurerm_key_vault_secret" "storage_connection_string" {
  name         = "azure-storage-connection"
  value        = azurerm_storage_account.main.primary_connection_string
  key_vault_id = azurerm_key_vault.main.id
  tags         = var.tags

  depends_on = [azurerm_key_vault.main]
}

# Application Insights Instrumentation Key
resource "azurerm_key_vault_secret" "app_insights_key" {
  count        = var.enable_monitoring ? 1 : 0
  name         = "app-insights-key"
  value        = azurerm_application_insights.main[0].instrumentation_key
  key_vault_id = azurerm_key_vault.main.id
  tags         = var.tags

  depends_on = [azurerm_key_vault.main]
}

# Random secrets generation
resource "random_string" "jwt_secret" {
  length  = 64
  special = true
}

resource "random_string" "session_secret" {
  length  = 64
  special = true
}

resource "random_string" "encryption_key" {
  length  = 32
  special = false
} 