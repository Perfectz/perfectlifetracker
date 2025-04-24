# Option 1: Try reinstalling html-webpack-plugin
Write-Host "Attempting to reinstall html-webpack-plugin..." -ForegroundColor Cyan
npm uninstall html-webpack-plugin
npm install html-webpack-plugin@5.5.4 --save-dev

# Option 2: Check for webpack configuration issues
Write-Host "Checking webpack configuration..." -ForegroundColor Cyan
$webpackContent = Get-Content webpack.config.js -Raw
if ($webpackContent -match "html-webpack-plugin") {
    Write-Host "HtmlWebpackPlugin is used in the configuration file" -ForegroundColor Green
} else {
    Write-Host "Warning: HtmlWebpackPlugin might not be properly configured" -ForegroundColor Yellow
}

# Option 3: Repair webpack installation
Write-Host "Attempting to repair webpack installation..." -ForegroundColor Cyan
npm uninstall webpack webpack-cli webpack-dev-server
npm install webpack@5.89.0 webpack-cli@5.1.4 webpack-dev-server@4.15.1 --save-dev

Write-Host "Fix attempt completed. Try running 'npm start' to see if the issue is resolved." -ForegroundColor Green 