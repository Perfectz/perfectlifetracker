# Cosmos DB SQL Containers for Perfect LifeTracker Pro

# Users container - stores user profiles and preferences
resource "azurerm_cosmosdb_sql_container" "users" {
  name                  = "users"
  resource_group_name   = azurerm_resource_group.main.name
  account_name          = azurerm_cosmosdb_account.cosmos.name
  database_name         = azurerm_cosmosdb_sql_database.database.name
  partition_key_path    = "/userId"
  partition_key_version = 2
  throughput            = 400

  indexing_policy {
    indexing_mode = "consistent"

    included_path {
      path = "/*"
    }

    excluded_path {
      path = "/\"_etag\"/?"
    }
  }

  unique_key {
    paths = ["/email"]
  }
}

# Fitness Metrics container - stores fitness data, workouts, and measurements
resource "azurerm_cosmosdb_sql_container" "fitness" {
  name                  = "fitness"
  resource_group_name   = azurerm_resource_group.main.name
  account_name          = azurerm_cosmosdb_account.cosmos.name
  database_name         = azurerm_cosmosdb_sql_database.database.name
  partition_key_path    = "/userId"
  partition_key_version = 2
  throughput            = 400

  indexing_policy {
    indexing_mode = "consistent"

    included_path {
      path = "/*"
    }

    excluded_path {
      path = "/\"_etag\"/?"
    }

    composite_index {
      index {
        path = "/userId"
        order = "ascending"
      }
      index {
        path = "/date"
        order = "descending"
      }
      index {
        path = "/type"
        order = "ascending"
      }
    }
  }
}

# Tasks container - stores tasks, to-dos, and reminders
resource "azurerm_cosmosdb_sql_container" "tasks" {
  name                  = "tasks"
  resource_group_name   = azurerm_resource_group.main.name
  account_name          = azurerm_cosmosdb_account.cosmos.name
  database_name         = azurerm_cosmosdb_sql_database.database.name
  partition_key_path    = "/userId"
  partition_key_version = 2
  throughput            = 400

  indexing_policy {
    indexing_mode = "consistent"

    included_path {
      path = "/*"
    }

    excluded_path {
      path = "/\"_etag\"/?"
    }

    composite_index {
      index {
        path = "/userId"
        order = "ascending"
      }
      index {
        path = "/dueDate"
        order = "ascending"
      }
      index {
        path = "/status"
        order = "ascending"
      }
    }
  }

  default_ttl = -1 # No automatic expiration
}

# Development container - stores learning, personal development goals and progress
resource "azurerm_cosmosdb_sql_container" "development" {
  name                  = "development"
  resource_group_name   = azurerm_resource_group.main.name
  account_name          = azurerm_cosmosdb_account.cosmos.name
  database_name         = azurerm_cosmosdb_sql_database.database.name
  partition_key_path    = "/userId"
  partition_key_version = 2
  throughput            = 400

  indexing_policy {
    indexing_mode = "consistent"

    included_path {
      path = "/*"
    }

    excluded_path {
      path = "/\"_etag\"/?"
    }

    composite_index {
      index {
        path = "/userId"
        order = "ascending"
      }
      index {
        path = "/category"
        order = "ascending"
      }
      index {
        path = "/priority"
        order = "descending"
      }
    }
  }
}

# Analytical container - stores machine learning insights and predictions
resource "azurerm_cosmosdb_sql_container" "analytics" {
  name                  = "analytics"
  resource_group_name   = azurerm_resource_group.main.name
  account_name          = azurerm_cosmosdb_account.cosmos.name
  database_name         = azurerm_cosmosdb_sql_database.database.name
  partition_key_path    = "/userId"
  partition_key_version = 2
  throughput            = 400

  indexing_policy {
    indexing_mode = "consistent"

    included_path {
      path = "/*"
    }

    excluded_path {
      path = "/\"_etag\"/?"
    }
  }
} 