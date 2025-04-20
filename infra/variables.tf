variable "environment" {
  description = "Environment name (dev, test, prod)"
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "East US"
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {
    Project = "LifeTracker Pro"
  }
}

# Redis variables
variable "redis_capacity" {
  description = "Redis Cache capacity (0, 1, 2, 3, 4, 5, 6)"
  type        = number
  default     = 0
}

variable "redis_family" {
  description = "Redis Cache family (C, P)"
  type        = string
  default     = "C"
}

variable "redis_sku" {
  description = "Redis Cache SKU (Basic, Standard, Premium)"
  type        = string
  default     = "Basic"
}

# Search variables
variable "search_sku" {
  description = "Azure Cognitive Search SKU (free, basic, standard, standard2, standard3)"
  type        = string
  default     = "basic"
}

# AKS variables
variable "kubernetes_version" {
  description = "Version of Kubernetes to use for the AKS cluster"
  type        = string
  default     = "1.24.9"
}

variable "aks_node_count" {
  description = "Number of nodes for the AKS cluster"
  type        = number
  default     = 1
}

variable "aks_vm_size" {
  description = "VM size for AKS nodes"
  type        = string
  default     = "Standard_DS2_v2"
} 