# Perfect LifeTracker Pro - Terraform Infrastructure

This directory contains Terraform configuration for the Perfect LifeTracker Pro application's Azure infrastructure.

## Resources Defined

- **Resource Group** - Container for all resources
- **Static Web App** - Hosts the React frontend (Free tier)
- **App Service Plan** - Compute resources for the backend (Linux, B1 Basic tier)
- **App Service** - Node.js backend API
- **Cosmos DB Account** - NoSQL database with free tier enabled
- **Cosmos DB SQL Database** - Database for application data

## Prerequisites

- [Terraform](https://www.terraform.io/downloads.html) (v1.0.0+)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) installed and logged in
- Azure subscription

## Usage

1. **Login to Azure CLI**

   ```bash
   az login
   ```

2. **Initialize Terraform**

   ```bash
   cd terraform
   terraform init
   ```

3. **Plan the Deployment**

   ```bash
   terraform plan -out=tfplan
   ```

4. **Apply the Configuration**

   ```bash
   terraform apply tfplan
   ```

5. **Destroy Resources (when no longer needed)**

   ```bash
   terraform destroy
   ```

## Configuration Variables

- `prefix` - Prefix for naming resources (default: "lifetrackpro")
- `location` - Azure region (default: "eastus")

You can override these variables when running the commands:

```bash
terraform plan -var="prefix=myapp" -var="location=westus2" -out=tfplan
```

## Notes

- The Cosmos DB account name must be globally unique. If the deployment fails due to a naming conflict, try changing the prefix.
- The App Service is configured for Node.js 18 LTS.
- The Static Web App is configured for the Free tier, which has limitations on build minutes and bandwidth.
- The App Service Plan uses B1 (Basic) tier which incurs costs. Consider stopping it when not in use or using consumption-based options for development. 