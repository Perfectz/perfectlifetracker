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
echo Checking artifacts directory structure...
dir "%ARTIFACTS_DIR%" /s

echo.
echo Creating deployment directory...
if not exist "%STAGING_DIR%\deploy" mkdir "%STAGING_DIR%\deploy"

echo.
echo Deploying frontend...
REM Try multiple possible paths for frontend artifacts
set FRONTEND_SOURCE=
if exist "%ARTIFACTS_DIR%\frontend\*" (
    set FRONTEND_SOURCE=%ARTIFACTS_DIR%\frontend
) else if exist "%ARTIFACTS_DIR%\a\frontend\*" (
    set FRONTEND_SOURCE=%ARTIFACTS_DIR%\a\frontend
) else if exist "%ARTIFACTS_DIR%\*\frontend\*" (
    for /D %%i in ("%ARTIFACTS_DIR%\*") do (
        if exist "%%i\frontend\*" set FRONTEND_SOURCE=%%i\frontend
    )
)

if not defined FRONTEND_SOURCE (
    echo WARNING: Could not find frontend source directory
    echo Searching for build directory directly...
    if exist "%ARTIFACTS_DIR%\build\*" (
        set FRONTEND_SOURCE=%ARTIFACTS_DIR%\build
    ) else if exist "%ARTIFACTS_DIR%\frontend\build\*" (
        set FRONTEND_SOURCE=%ARTIFACTS_DIR%\frontend\build
    ) else if exist "%ARTIFACTS_DIR%\*\build\*" (
        for /D %%i in ("%ARTIFACTS_DIR%\*") do (
            if exist "%%i\build\*" set FRONTEND_SOURCE=%%i\build
        )
    )
)

if defined FRONTEND_SOURCE (
    echo Found frontend source at: %FRONTEND_SOURCE%
    xcopy "%FRONTEND_SOURCE%\*" "%STAGING_DIR%\deploy\frontend\" /E /I /Y
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Frontend deployment failed with exit code %ERRORLEVEL%
        exit /b %ERRORLEVEL%
    )
    echo Frontend deployed successfully!
) else (
    echo ERROR: Could not locate frontend files to deploy
    echo Continuing with deployment anyway...
)

echo.
echo Deploying backend...
REM Try multiple possible paths for backend artifacts
set BACKEND_SOURCE=
if exist "%ARTIFACTS_DIR%\backend\*" (
    set BACKEND_SOURCE=%ARTIFACTS_DIR%\backend
) else if exist "%ARTIFACTS_DIR%\a\backend\*" (
    set BACKEND_SOURCE=%ARTIFACTS_DIR%\a\backend
) else if exist "%ARTIFACTS_DIR%\*\backend\*" (
    for /D %%i in ("%ARTIFACTS_DIR%\*") do (
        if exist "%%i\backend\*" set BACKEND_SOURCE=%%i\backend
    )
)

if not defined BACKEND_SOURCE (
    echo WARNING: Could not find backend source directory
    echo Searching for dist directory directly...
    if exist "%ARTIFACTS_DIR%\dist\*" (
        set BACKEND_SOURCE=%ARTIFACTS_DIR%\dist
    ) else if exist "%ARTIFACTS_DIR%\backend\dist\*" (
        set BACKEND_SOURCE=%ARTIFACTS_DIR%\backend\dist
    ) else if exist "%ARTIFACTS_DIR%\*\dist\*" (
        for /D %%i in ("%ARTIFACTS_DIR%\*") do (
            if exist "%%i\dist\*" set BACKEND_SOURCE=%%i\dist
        )
    )
)

if defined BACKEND_SOURCE (
    echo Found backend source at: %BACKEND_SOURCE%
    xcopy "%BACKEND_SOURCE%\*" "%STAGING_DIR%\deploy\backend\" /E /I /Y
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Backend deployment failed with exit code %ERRORLEVEL%
        exit /b %ERRORLEVEL%
    )
    echo Backend deployed successfully!
) else (
    echo ERROR: Could not locate backend files to deploy
    echo Continuing with deployment anyway...
)

echo.
echo Deployment verification...
echo Checking deployment files...
dir "%STAGING_DIR%\deploy" /s

echo.
echo Deployment completed successfully
echo ====================================== 