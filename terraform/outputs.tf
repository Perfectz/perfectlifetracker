# Outputs for Azure Cosmos DB resources

# Cosmos DB Endpoint
output "cosmos_db_endpoint" {
  description = "The endpoint used to connect to the Cosmos DB account"
  value       = azurerm_cosmosdb_account.cosmos.endpoint
}

# Cosmos DB Primary Master Key (sensitive)
output "cosmos_db_primary_key" {
  description = "The primary master key for the Cosmos DB account"
  value       = azurerm_cosmosdb_account.cosmos.primary_key
  sensitive   = true
}

# Cosmos DB Connection String (sensitive)
output "cosmos_db_connection_string" {
  description = "The connection string to connect to the Cosmos DB account"
  value       = azurerm_cosmosdb_account.cosmos.connection_strings[0]
  sensitive   = true
}

# Cosmos DB Database Name
output "cosmos_db_database_name" {
  description = "The name of the Cosmos DB SQL database"
  value       = azurerm_cosmosdb_sql_database.database.name
}

# Cosmos DB Container Names
output "cosmos_db_containers" {
  description = "The names of the Cosmos DB SQL containers"
  value = {
    users       = azurerm_cosmosdb_sql_container.users.name
    fitness     = azurerm_cosmosdb_sql_container.fitness.name
    tasks       = azurerm_cosmosdb_sql_container.tasks.name
    development = azurerm_cosmosdb_sql_container.development.name
    analytics   = azurerm_cosmosdb_sql_container.analytics.name
  }
}

# Frontend Static Web App URL
output "frontend_url" {
  description = "The URL of the Static Web App hosting the frontend"
  value       = "https://${azurerm_static_web_app.frontend.default_host_name}"
}

# Backend API URL
output "backend_api_url" {
  description = "The URL of the App Service hosting the backend API"
  value       = "https://${azurerm_linux_web_app.backend.default_hostname}"
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

output "backend_identity_principal_id" {
  value       = azurerm_linux_web_app.backend.identity[0].principal_id
  description = "The principal ID of the backend App Service managed identity"
} 