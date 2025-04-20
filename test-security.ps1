# PowerShell security check script

Write-Output "======== Basic Dockerfile Security Check ========"

# Check Dockerfile exists
if (Test-Path "Dockerfile") {
    Write-Output "✅ Dockerfile exists"
} else {
    Write-Output "❌ Dockerfile not found"
    exit 1
}

# Check if using a specific version instead of 'latest'
$dockerfileContent = Get-Content "Dockerfile" -Raw
if ($dockerfileContent -match "FROM node:18-alpine") {
    Write-Output "✅ Using specific Node.js version (not 'latest')"
} else {
    Write-Output "⚠️ Consider using a specific Node.js version instead of 'latest'"
}

# Check if running as non-root user
if ($dockerfileContent -match "USER node" -or $dockerfileContent -match "USER appuser") {
    Write-Output "✅ Running as non-root user"
} else {
    Write-Output "⚠️ Consider adding 'USER node' to run as non-root"
}

# Check if .dockerignore exists
if (Test-Path ".dockerignore") {
    Write-Output "✅ .dockerignore file exists"
} else {
    Write-Output "⚠️ Consider using .dockerignore to avoid copying unnecessary files"
}

Write-Output "`n======== NPM Dependency Security Check ========"

# Check if package.json exists
if (Test-Path "package.json") {
    Write-Output "✅ package.json exists"
} else {
    Write-Output "❌ package.json not found"
    exit 1
}

# Run npm audit
Write-Output "`nRunning npm audit..."
npm audit

Write-Output "`n======== Security Check Complete =========" 