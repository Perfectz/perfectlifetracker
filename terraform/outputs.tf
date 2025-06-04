# Outputs for Perfect LifeTracker Pro Azure deployment

# Frontend outputs
output "frontend_url" {
  value       = "https://${azurerm_static_web_app.frontend.default_host_name}"
  description = "The URL of the frontend Static Web App"
}

output "frontend_deployment_token" {
  value       = azurerm_static_web_app.frontend.api_key
  description = "Deployment token for the Static Web App"
  sensitive   = true
}

# Backend outputs
output "backend_url" {
  value       = "https://${azurerm_linux_web_app.backend.default_hostname}"
  description = "The URL of the backend App Service"
}

output "backend_name" {
  value       = azurerm_linux_web_app.backend.name
  description = "The name of the backend App Service"
}

# Database outputs
output "cosmos_db_endpoint" {
  value       = azurerm_cosmosdb_account.main.endpoint
  description = "The endpoint of the Cosmos DB account"
}

output "cosmos_db_name" {
  value       = azurerm_cosmosdb_sql_database.main.name
  description = "The name of the Cosmos DB database"
}

output "cosmos_db_primary_key" {
  value       = azurerm_cosmosdb_account.main.primary_key
  description = "The primary key of the Cosmos DB account"
  sensitive   = true
}

# Key Vault outputs
output "key_vault_uri" {
  value       = azurerm_key_vault.main.vault_uri
  description = "The URI of the Key Vault"
}

output "key_vault_name" {
  value       = azurerm_key_vault.main.name
  description = "The name of the Key Vault"
}

# Storage outputs
output "storage_account_name" {
  value       = azurerm_storage_account.main.name
  description = "The name of the storage account"
}

output "storage_connection_string" {
  value       = azurerm_storage_account.main.primary_connection_string
  description = "The connection string for the storage account"
  sensitive   = true
}

# Monitoring outputs
output "application_insights_key" {
  value       = var.enable_monitoring ? azurerm_application_insights.main[0].instrumentation_key : ""
  description = "The instrumentation key for Application Insights"
  sensitive   = true
}

output "application_insights_connection_string" {
  value       = var.enable_monitoring ? azurerm_application_insights.main[0].connection_string : ""
  description = "The connection string for Application Insights"
  sensitive   = true
}

# Resource Group outputs
output "resource_group_name" {
  value       = azurerm_resource_group.main.name
  description = "The name of the resource group"
}

output "resource_group_location" {
  value       = azurerm_resource_group.main.location
  description = "The location of the resource group"
}

# Identity outputs
output "backend_identity_principal_id" {
  value       = azurerm_linux_web_app.backend.identity[0].principal_id
  description = "The principal ID of the backend App Service managed identity"
}

output "frontend_identity_principal_id" {
  value       = azurerm_static_web_app.frontend.identity[0].principal_id
  description = "The principal ID of the frontend Static Web App managed identity"
}

# Environment outputs
output "environment" {
  value       = var.environment
  description = "The deployment environment"
}

output "prefix" {
  value       = var.prefix
  description = "The resource prefix used"
} 