variable "prefix" {
  description = "Prefix for naming Azure resources"
  type        = string
  default     = "lifetrackpro"
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "eastus"
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