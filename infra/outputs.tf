output "resource_group_name" {
  description = "The name of the resource group"
  value       = azurerm_resource_group.rg.name
}

output "resource_group_id" {
  description = "The ID of the resource group"
  value       = azurerm_resource_group.rg.id
}

output "resource_group_location" {
  description = "The location of the resource group"
  value       = azurerm_resource_group.rg.location
}

# Cosmos DB outputs
output "cosmosdb_endpoint" {
  description = "The endpoint of the Cosmos DB account"
  value       = azurerm_cosmosdb_account.db.endpoint
}

output "cosmosdb_primary_key" {
  description = "The primary key for the Cosmos DB account"
  value       = azurerm_cosmosdb_account.db.primary_key
  sensitive   = true
}

# Storage outputs
output "storage_account_name" {
  description = "The name of the storage account"
  value       = azurerm_storage_account.storage.name
}

output "storage_account_primary_connection_string" {
  description = "The primary connection string for the storage account"
  value       = azurerm_storage_account.storage.primary_connection_string
  sensitive   = true
}

output "storage_account_primary_blob_endpoint" {
  description = "The primary blob endpoint for the storage account"
  value       = azurerm_storage_account.storage.primary_blob_endpoint
}

# Redis outputs
output "redis_hostname" {
  description = "The hostname of the Redis cache"
  value       = azurerm_redis_cache.redis.hostname
}

output "redis_primary_connection_string" {
  description = "The primary connection string for the Redis cache"
  value       = azurerm_redis_cache.redis.primary_connection_string
  sensitive   = true
}

output "redis_port" {
  description = "The port of the Redis cache"
  value       = azurerm_redis_cache.redis.ssl_port
}

# Search outputs
output "search_service_name" {
  description = "The name of the Search service"
  value       = azurerm_search_service.search.name
}

output "search_primary_key" {
  description = "The primary key for the Search service"
  value       = azurerm_search_service.search.primary_key
  sensitive   = true
}

# Container Registry outputs
output "acr_login_server" {
  description = "The login server for the Container Registry"
  value       = azurerm_container_registry.acr.login_server
}

output "acr_admin_username" {
  description = "The admin username for the Container Registry"
  value       = azurerm_container_registry.acr.admin_username
}

output "acr_admin_password" {
  description = "The admin password for the Container Registry"
  value       = azurerm_container_registry.acr.admin_password
  sensitive   = true
}

# AKS outputs
output "aks_kube_config" {
  description = "The kubeconfig for the AKS cluster"
  value       = azurerm_kubernetes_cluster.aks.kube_config_raw
  sensitive   = true
}

output "aks_host" {
  description = "The host for the AKS cluster"
  value       = azurerm_kubernetes_cluster.aks.kube_config[0].host
  sensitive   = true
}

output "aks_name" {
  description = "The name of the AKS cluster"
  value       = azurerm_kubernetes_cluster.aks.name
} 