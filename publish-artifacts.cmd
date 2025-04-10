@echo off
REM Batch script to publish build artifacts
REM Usage: publish-artifacts.cmd [SOURCE_DIR] [ARTIFACT_NAME] [TARGET_DIR]

echo ======================================
echo Publishing Build Artifacts
echo ======================================

set SOURCE_DIR=%~1
set ARTIFACT_NAME=%~2
set TARGET_DIR=%~3

if "%SOURCE_DIR%"=="" (
    set SOURCE_DIR=frontend\build
)

if "%ARTIFACT_NAME%"=="" (
    set ARTIFACT_NAME=frontend
)

if "%TARGET_DIR%"=="" (
    set TARGET_DIR=%BUILD_ARTIFACTSTAGINGDIRECTORY%\%ARTIFACT_NAME%
)

echo Source Directory: %SOURCE_DIR%
echo Artifact Name: %ARTIFACT_NAME%
echo Target Directory: %TARGET_DIR%

echo.
echo Creating target directory...
if not exist "%TARGET_DIR%" (
    mkdir "%TARGET_DIR%"
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to create target directory
        exit /b %ERRORLEVEL%
    )
)

echo.
echo Copying files...
robocopy "%SOURCE_DIR%" "%TARGET_DIR%" /E /NP /NFL /NDL

REM robocopy returns non-zero exit codes for successful operations
REM 0 = No files copied
REM 1 = Files copied successfully
REM 2 = Extra files or directories detected
REM These are all considered successful, so we reset the error level if less than 8
if %ERRORLEVEL% LSS 8 (
    echo Files copied successfully
    exit /b 0
) else (
    echo ERROR: Failed to copy files with error level %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)

echo.
echo Artifacts published successfully
echo ====================================== 