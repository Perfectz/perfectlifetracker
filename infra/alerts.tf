# Azure Application Insights Alert Rules

resource "azurerm_monitor_action_group" "main" {
  name                = "${var.project_name}-actiongroup"
  resource_group_name = azurerm_resource_group.main.name
  short_name          = "lifetrack"

  email_receiver {
    name          = "admin"
    email_address = var.alert_email_address
  }
}

# High error rate alert
resource "azurerm_monitor_metric_alert" "error_rate" {
  name                = "${var.project_name}-high-error-rate"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [azurerm_application_insights.main.id]
  description         = "Alert when error rate exceeds 5% in 5 minutes"
  severity            = 1
  frequency           = "PT5M"
  window_size         = "PT5M"

  criteria {
    metric_namespace = "Microsoft.Insights/Components"
    metric_name      = "requests/failed"
    aggregation      = "Count"
    operator         = "GreaterThan"
    threshold        = 5

    dimension {
      name     = "request/resultCode"
      operator = "Include"
      values   = ["5*"]
    }
  }

  action {
    action_group_id = azurerm_monitor_action_group.main.id
  }
}

# Long response time alert
resource "azurerm_monitor_metric_alert" "response_time" {
  name                = "${var.project_name}-long-response-time"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [azurerm_application_insights.main.id]
  description         = "Alert when average response time exceeds 1 second over 5 minutes"
  severity            = 2
  frequency           = "PT5M"
  window_size         = "PT5M"

  criteria {
    metric_namespace = "Microsoft.Insights/Components"
    metric_name      = "requests/duration"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 1000 # milliseconds
  }

  action {
    action_group_id = azurerm_monitor_action_group.main.id
  }
}

# Availability alert
resource "azurerm_monitor_metric_alert" "availability" {
  name                = "${var.project_name}-availability"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [azurerm_application_insights.main.id]
  description         = "Alert when availability drops below 99% over 5 minutes"
  severity            = 1
  frequency           = "PT5M"
  window_size         = "PT5M"

  criteria {
    metric_namespace = "Microsoft.Insights/Components"
    metric_name      = "availabilityResults/availabilityPercentage"
    aggregation      = "Average"
    operator         = "LessThan"
    threshold        = 99.0
  }

  action {
    action_group_id = azurerm_monitor_action_group.main.id
  }
}

# Custom metric alert for slow queries
resource "azurerm_monitor_metric_alert" "slow_database_operations" {
  name                = "${var.project_name}-slow-database-ops"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [azurerm_application_insights.main.id]
  description         = "Alert when database operations take longer than 500ms on average"
  severity            = 2
  frequency           = "PT5M"
  window_size         = "PT5M"

  criteria {
    metric_namespace = "Microsoft.Insights/Components"
    metric_name      = "dependencies/duration"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 500 # milliseconds

    dimension {
      name     = "dependency/type"
      operator = "Include"
      values   = ["cosmosdb"]
    }
  }

  action {
    action_group_id = azurerm_monitor_action_group.main.id
  }
} 