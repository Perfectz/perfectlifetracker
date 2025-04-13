# Azure Cosmos DB for Perfect LifeTracker Pro

This guide explains how to deploy and manage the Azure Cosmos DB infrastructure for the Perfect LifeTracker Pro application using Terraform.

## Infrastructure Overview

The Terraform configuration creates the following resources:

1. **Azure Cosmos DB Account** with SQL API
   - Free tier enabled
   - Session consistency level
   - Single region (no geo-replication in dev)
   - Serverless capacity mode for cost optimization
   - CORS configured for local development and production

2. **Cosmos DB SQL Database** named "lifetrackpro-db"

3. **Five Cosmos DB Containers** with optimized partition keys and indexes:
   - `users`: Stores user profiles and preferences
   - `fitness`: Stores fitness data, workouts, and measurements
   - `tasks`: Stores tasks, to-dos, and reminders
   - `development`: Stores learning and personal development goals
   - `analytics`: Stores AI-generated insights and predictions

## Prerequisites

1. **Azure CLI** installed and authenticated
2. **Terraform** installed (version >= 1.0.0)
3. An **Azure subscription** with permissions to create resources

## Deployment Instructions

### 1. Initialize Terraform

```bash
cd terraform
terraform init
```

### 2. Review the plan

```bash
terraform plan -out=tfplan
```

This will show you all resources that will be created.

### 3. Apply the configuration

```bash
terraform apply tfplan
```

This will create all the resources in Azure. The process takes approximately 5-10 minutes.

### 4. Access the outputs

After deployment, you can view important connection details:

```bash
terraform output

# For sensitive values like keys:
terraform output cosmos_db_primary_key
```

## Connecting to Cosmos DB

### From Backend Application

The backend Node.js application is automatically configured with environment variables:

```
COSMOS_DB_ENDPOINT=https://lifetrackpro-cosmos.documents.azure.com:443/
COSMOS_DB_KEY=<primary_key>
COSMOS_DB_DATABASE=lifetrackpro-db
COSMOS_DB_USERS_CONTAINER=users
COSMOS_DB_FITNESS_CONTAINER=fitness
COSMOS_DB_TASKS_CONTAINER=tasks
COSMOS_DB_DEV_CONTAINER=development
COSMOS_DB_ANALYTICS_CONTAINER=analytics
```

### Using the Azure Portal

1. Go to the [Azure Portal](https://portal.azure.com)
2. Search for "lifetrackpro-cosmos" 
3. Navigate to "Data Explorer" to view and manage data

### Using Azure Storage Explorer

1. Install [Azure Storage Explorer](https://azure.microsoft.com/en-us/features/storage-explorer/)
2. Use the connection string from `terraform output cosmos_db_connection_string`

## Data Model

### Users Container

```json
{
  "id": "user123",
  "userId": "user123",
  "email": "jane@example.com",
  "displayName": "Jane Smith",
  "preferences": {
    "theme": "dark",
    "notifications": true
  },
  "created": "2023-04-15T10:30:00Z",
  "lastLogin": "2023-04-16T08:15:00Z"
}
```

### Fitness Container

```json
{
  "id": "workout123",
  "userId": "user123",
  "type": "workout",
  "activity": "running",
  "date": "2023-04-15T09:00:00Z",
  "duration": 30,
  "calories": 280,
  "distance": 5.2,
  "notes": "Morning run at the park"
}
```

### Tasks Container

```json
{
  "id": "task123",
  "userId": "user123",
  "title": "Complete project proposal",
  "description": "Finish the draft proposal for client review",
  "status": "in-progress",
  "priority": "high",
  "dueDate": "2023-04-20T17:00:00Z",
  "created": "2023-04-15T14:30:00Z",
  "tags": ["work", "client", "proposal"]
}
```

## Estimated Costs

* **Free Tier**: The first 1000 RU/s and 25 GB storage are free
* **Serverless Mode**: You only pay for what you use
* **Estimated Monthly Cost**: Less than $10 for development usage

## Troubleshooting

### Common Issues

1. **Connection Errors**: Make sure your IP is allowed in the firewall settings
2. **Authentication Errors**: Verify you're using the correct primary key
3. **Capacity Errors**: Serverless mode has limits of 5000 RU/s per container

### Getting Support

For issues with this Terraform deployment, contact the DevOps team.

## Modifying the Infrastructure

### Adding a New Container

1. Edit `terraform/cosmos_db.tf`
2. Add a new container resource following the existing pattern
3. Run `terraform plan` and `terraform apply`

### Scaling Considerations

* For production, consider:
  - Adding geo-replication for better availability
  - Switching to provisioned throughput for predictable performance
  - Implementing automatic scaling policies 