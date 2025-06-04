# terraform/variables.tf
# Variables for Perfect LifeTracker Pro Azure deployment

variable "prefix" {
  description = "Prefix for all resources"
  type        = string
  default     = "perfectltp"
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "East US"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "subscription_id" {
  description = "Azure subscription ID"
  type        = string
}

variable "tenant_id" {
  description = "Azure tenant ID"  
  type        = string
}

variable "app_service_plan_sku" {
  description = "SKU for the App Service Plan"
  type        = string
  default     = "B1"
}

variable "static_web_app_sku" {
  description = "SKU for Static Web App"
  type        = string
  default     = "Free"
}

variable "cosmos_db_throughput" {
  description = "Throughput for Cosmos DB"
  type        = number
  default     = 400
}

variable "key_vault_sku" {
  description = "SKU for Azure Key Vault"
  type        = string
  default     = "standard"
}

variable "enable_monitoring" {
  description = "Enable Application Insights and monitoring"
  type        = bool
  default     = true
}

variable "enable_backup" {
  description = "Enable backup for App Service"
  type        = bool
  default     = false
}

variable "allowed_origins" {
  description = "Allowed CORS origins"
  type        = list(string)
  default     = ["https://localhost:3000"]
}

variable "github_repo_url" {
  description = "GitHub repository URL for CI/CD"
  type        = string
  default     = "https://github.com/Perfectz/perfectlifetracker"
}

variable "docker_registry_url" {
  description = "Docker registry URL"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    Project     = "PerfectLifeTrackerPro"
    Environment = "development"
    ManagedBy   = "Terraform"
  }
}

variable "azure_authority" {
  description = "Azure AD authority URL for authentication"
  type        = string
  default     = "https://login.microsoftonline.com/78e9993f-a208-4c38-9d9d-6b15f0d2407d"
}

variable "azure_client_id" {
  description = "Azure AD client ID for the application"
  type        = string
  default     = "d9764c39-1eb9-4963-83a0-e8ba859c8965"
} 