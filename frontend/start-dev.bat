@echo off
set REACT_APP_API_URL=http://localhost:3001/api
set REACT_APP_AZURE_AD_B2C_API_SCOPE=https://YOUR_TENANT.onmicrosoft.com/api/user.read

echo Starting development server with environment variables:
echo REACT_APP_API_URL=%REACT_APP_API_URL%
echo REACT_APP_AZURE_AD_B2C_API_SCOPE=%REACT_APP_AZURE_AD_B2C_API_SCOPE%

npm start 