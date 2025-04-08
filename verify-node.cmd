@echo off
REM Batch script to verify Node.js installation
REM Usage: verify-node.cmd [NODE_PATH]

echo ======================================
echo Verifying Node.js Installation
echo ======================================

set NODE_DIR=%~1
echo Node.js directory: %NODE_DIR%

echo.
echo Checking for node.exe...
if exist "%NODE_DIR%\node.exe" (
    echo node.exe found at %NODE_DIR%\node.exe
    "%NODE_DIR%\node.exe" --version
) else (
    echo ERROR: node.exe not found at %NODE_DIR%\node.exe
)

echo.
echo Checking for npm.cmd...
if exist "%NODE_DIR%\npm.cmd" (
    echo npm.cmd found at %NODE_DIR%\npm.cmd
    "%NODE_DIR%\npm.cmd" --version
) else (
    echo ERROR: npm.cmd not found at %NODE_DIR%\npm.cmd
)

echo ====================================== 