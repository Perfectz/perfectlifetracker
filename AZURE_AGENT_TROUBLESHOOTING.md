# Azure DevOps Agent Troubleshooting Guide

This document provides solutions for handling corrupted `node_modules` directories in Azure DevOps build agents, which can cause pipeline failures during the checkout phase.

## Problem

When you see an error like this in your pipeline:

```
git clean -ffdx
warning: could not open directory 'frontend/node_modules/': No such file or directory
warning: failed to remove frontend/node_modules/: Directory not empty
##[warning]Unable to run "git clean -ffdx" and "git reset --hard HEAD" successfully, delete source folder instead.
##[error]One or several exceptions have been occurred.
##[error]System.IO.IOException: The file or directory is corrupted and unreadable. : 'D:\agent\vsts-agent-win-x64-4.252.0\_work\1\s\frontend\node_modules'
```

This indicates that the `node_modules` directory in your workspace has become corrupted, preventing Git from cleaning it during checkout.

## Solutions

There are several ways to fix this issue:

### Solution 1: Use the Pre-Checkout Pipeline

We've created a special pipeline configuration (`azure-pipelines-pre-checkout.yml`) that:

1. Runs a cleanup job before checkout
2. Uses robust directory cleaning methods
3. Handles the checkout carefully to avoid corruption issues

To use this pipeline:

1. In Azure DevOps, go to Pipelines
2. Create a new pipeline or edit your existing one
3. Choose "Existing Azure Pipelines YAML file"
4. Select `azure-pipelines-pre-checkout.yml`
5. Save and run the pipeline

### Solution 2: Manually Clean the Agent

If you have access to the build agent machine:

1. Copy the `agent-cleanup.ps1` script to the agent machine
2. Open PowerShell with administrative privileges
3. Navigate to where you saved the script
4. Run: `.\agent-cleanup.ps1`
5. Follow the prompts to clean up corrupted directories
6. Restart the agent service:
   ```
   net stop vstsagent.Perfectz.Default
   net start vstsagent.Perfectz.Default
   ```

### Solution 3: Reset the Agent

If the above solutions don't work, you can reset the agent completely:

1. On the agent machine, open PowerShell with administrative privileges
2. Navigate to the agent directory (e.g., `D:\agent\vsts-agent-win-x64-4.252.0`)
3. Run: `.\config.cmd remove` to unregister the agent
4. Delete the entire `_work` directory
5. Reconfigure the agent: `.\config.cmd`
6. Restart the agent service

## Prevention Measures

To prevent this issue from recurring:

1. Include directory cleanup steps in your pipeline (already added to `azure-pipelines.yml`)
2. Use `npm ci` instead of `npm install` for more reliable dependency installation
3. Consider using container-based builds which start with a fresh environment each time
4. Add the `clean: true` option to your checkout step to ensure a clean workspace

## Common Causes

This issue typically occurs due to:

1. Pipeline runs interrupted during npm installation
2. File locking issues with antivirus software
3. Storage problems or permission issues on the agent machine
4. Network interruptions during file operations

## Additional Resources

- [Azure DevOps Pipeline Cleanup Tasks](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/phases?view=azure-devops&tabs=yaml#workspace)
- [Git Clean Command Documentation](https://git-scm.com/docs/git-clean)
- [Managing Azure DevOps Agents](https://docs.microsoft.com/en-us/azure/devops/pipelines/agents/agents?view=azure-devops) 