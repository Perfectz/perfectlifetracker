@echo off
REM Batch script to deploy the application
REM Usage: deploy.cmd [ARTIFACTS_DIR] [STAGING_DIR]

echo ======================================
echo Deploying Application
echo ======================================

set ARTIFACTS_DIR=%~1
set STAGING_DIR=%~2
echo Artifacts directory: %ARTIFACTS_DIR%
echo Staging directory: %STAGING_DIR%

echo.
echo Creating deployment directory...
if not exist "%STAGING_DIR%\deploy" mkdir "%STAGING_DIR%\deploy"

echo.
echo Deploying frontend...
xcopy "%ARTIFACTS_DIR%\frontend\*" "%STAGING_DIR%\deploy\frontend\" /E /I /Y
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Frontend deployment failed with exit code %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)
echo Frontend deployed successfully!

echo.
echo Deploying backend...
xcopy "%ARTIFACTS_DIR%\backend\*" "%STAGING_DIR%\deploy\backend\" /E /I /Y
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Backend deployment failed with exit code %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)
echo Backend deployed successfully!

echo.
echo Deployment verification...
echo Checking deployment files...
dir "%STAGING_DIR%\deploy" /s

echo.
echo Deployment completed successfully
echo ====================================== 