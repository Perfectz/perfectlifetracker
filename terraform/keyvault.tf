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
  name                        = "${var.prefix}-kv-${random_string.suffix.result}"
  location                    = azurerm_resource_group.main.location
  resource_group_name         = azurerm_resource_group.main.name
  enabled_for_disk_encryption = true
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  soft_delete_retention_days  = 7
  purge_protection_enabled    = false
  sku_name                    = "standard"

  # Enable RBAC authorization
  enable_rbac_authorization = true

  # Network access configuration
  public_network_access_enabled = true
  
  network_acls {
    default_action = "Allow"
    bypass         = "AzureServices"
  }

  tags = {
    environment = "development"
    application = "PerfectLifeTrackerPro"
  }
}

# Key Vault Access Policy for the current user/service principal
resource "azurerm_role_assignment" "keyvault_admin" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Administrator"
  principal_id         = data.azurerm_client_config.current.object_id
}

# Key Vault Access Policy for App Service managed identity
resource "azurerm_role_assignment" "backend_keyvault_secrets" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_linux_web_app.backend.identity[0].principal_id
}

# Generate secure random passwords for secrets
resource "random_password" "jwt_secret" {
  length  = 64
  special = true
}

resource "random_password" "session_secret" {
  length  = 64
  special = true
}

resource "random_password" "encryption_key" {
  length  = 64
  special = true
}

# Store secrets in Key Vault
resource "azurerm_key_vault_secret" "cosmos_key" {
  name         = "cosmos-db-key"
  value        = azurerm_cosmosdb_account.cosmos.primary_key
  key_vault_id = azurerm_key_vault.main.id
  
  depends_on = [azurerm_role_assignment.keyvault_admin]
}

resource "azurerm_key_vault_secret" "cosmos_endpoint" {
  name         = "cosmos-db-endpoint"
  value        = azurerm_cosmosdb_account.cosmos.endpoint
  key_vault_id = azurerm_key_vault.main.id
  
  depends_on = [azurerm_role_assignment.keyvault_admin]
}

resource "azurerm_key_vault_secret" "jwt_secret" {
  name         = "jwt-secret"
  value        = random_password.jwt_secret.result
  key_vault_id = azurerm_key_vault.main.id
  
  depends_on = [azurerm_role_assignment.keyvault_admin]
}

resource "azurerm_key_vault_secret" "session_secret" {
  name         = "session-secret"
  value        = random_password.session_secret.result
  key_vault_id = azurerm_key_vault.main.id
  
  depends_on = [azurerm_role_assignment.keyvault_admin]
}

resource "azurerm_key_vault_secret" "encryption_key" {
  name         = "encryption-key"
  value        = random_password.encryption_key.result
  key_vault_id = azurerm_key_vault.main.id
  
  depends_on = [azurerm_role_assignment.keyvault_admin]
} 